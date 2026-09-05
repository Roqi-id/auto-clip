import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  validateAndSanitizeYouTubeUrl,
  checkRateLimit,
  logAuditEvent,
  getAuditLogs,
  generateHmacSignature,
} from './src/server/security';
import { fetchYouTubeMetadata, analyzeVideoWithGemini } from './src/server/geminiService';
import {
  dispatchPublishJob,
  getPublishQueue,
  retryPublishJob,
  currentSecuritySettings,
  updateSecuritySettings,
} from './src/server/socialPublisher';
import { getStorageMetrics, manualPurgeAll } from './src/server/storageManager';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic security and parsing middleware
  app.use(express.json({ limit: '5mb' }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Client IP extractor
  const getClientIp = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || '127.0.0.1';
  };

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      securityShield: 'active',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Direct project source ZIP download
  app.get('/api/download/project-zip', (req: Request, res: Response) => {
    const zipPath = path.join(process.cwd(), 'public', 'project-autoclip-publisher.zip');
    res.download(zipPath, 'youtube-ai-autoclip-publisher.zip', (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: 'Gagal mengunduh berkas zip' });
      }
    });
  });

  // 1. YouTube Link Inspection & SSRF Validation
  app.post('/api/youtube/inspect', async (req: Request, res: Response): Promise<void> => {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp);

    if (!rateCheck.allowed) {
      res.status(429).json({ error: 'Terlalu banyak permintaan. Mohon tunggu sebentar.' });
      return;
    }

    const { url } = req.body;
    const validation = validateAndSanitizeYouTubeUrl(url, clientIp);

    if (!validation.isValid || !validation.videoId) {
      res.status(400).json({ error: validation.error || 'URL YouTube tidak valid' });
      return;
    }

    try {
      const metadata = await fetchYouTubeMetadata(validation.videoId, clientIp);
      res.json({
        success: true,
        data: metadata,
        securityCheck: {
          passed: true,
          protocol: 'HTTPS',
          domainVerified: true,
          ssrfProtected: true,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: `Gagal membaca metadata video: ${err.message}` });
    }
  });

  // 2. Analyze Video with Gemini Pro to generate viral clips
  app.post('/api/clips/analyze', async (req: Request, res: Response): Promise<void> => {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp);

    if (!rateCheck.allowed) {
      res.status(429).json({ error: 'Rate limit tercapai. Silakan coba 1 menit lagi.' });
      return;
    }

    const { videoInfo, customTranscript, model, targetDuration } = req.body;

    if (!videoInfo || !videoInfo.videoId) {
      res.status(400).json({ error: 'Data videoInfo diperlukan.' });
      return;
    }

    try {
      const selectedModel = model || currentSecuritySettings.model || 'gemini-3.1-pro-preview';
      const clips = await analyzeVideoWithGemini(
        videoInfo,
        customTranscript,
        selectedModel,
        targetDuration || 'medium',
        clientIp
      );

      res.json({
        success: true,
        clips,
        modelUsed: selectedModel,
        analyzedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error analyzing video with Gemini:', err);
      res.status(500).json({ error: err.message || 'Gagal memproses klip dengan AI Gemini.' });
    }
  });

  // 3. Dispatch Clip to Social Media Platforms (Instant or Scheduled)
  app.post('/api/social/publish', async (req: Request, res: Response): Promise<void> => {
    const clientIp = getClientIp(req);
    const { clip, videoTitle, targetPlatforms, mode, scheduledTime } = req.body;

    if (!clip || !targetPlatforms || !Array.isArray(targetPlatforms) || targetPlatforms.length === 0) {
      res.status(400).json({ error: 'Pilih minimal satu platform media sosial dan sertakan data klip.' });
      return;
    }

    try {
      const job = await dispatchPublishJob(
        clip,
        videoTitle || 'YouTube Short Clip',
        targetPlatforms,
        mode || 'instant',
        scheduledTime,
        clientIp
      );

      res.json({
        success: true,
        job,
      });
    } catch (err: any) {
      res.status(500).json({ error: `Gagal menjadwalkan publikasi: ${err.message}` });
    }
  });

  // 4. Retrieve Publish Queue
  app.get('/api/publish/queue', (req: Request, res: Response) => {
    res.json({
      success: true,
      queue: getPublishQueue(),
    });
  });

  // 5. Retry a Failed Job
  app.post('/api/publish/retry', async (req: Request, res: Response): Promise<void> => {
    const clientIp = getClientIp(req);
    const { jobId } = req.body;

    if (!jobId) {
      res.status(400).json({ error: 'Job ID wajib disertakan.' });
      return;
    }

    const retriedJob = await retryPublishJob(jobId, clientIp);
    if (!retriedJob) {
      res.status(404).json({ error: 'Job tidak ditemukan.' });
      return;
    }

    res.json({ success: true, job: retriedJob });
  });

  // 6. Security Audit Logs
  app.get('/api/security/audit-logs', (req: Request, res: Response) => {
    res.json({
      success: true,
      logs: getAuditLogs(),
    });
  });

  // 7. Security & Publisher Configuration
  app.get('/api/security/config', (req: Request, res: Response) => {
    res.json({
      success: true,
      config: currentSecuritySettings,
    });
  });

  app.post('/api/security/config', (req: Request, res: Response) => {
    const clientIp = getClientIp(req);
    const updated = updateSecuritySettings(req.body, clientIp);
    res.json({
      success: true,
      config: updated,
    });
  });

  // 8. Test HMAC Signature Generation Tool
  app.post('/api/security/test-hmac', (req: Request, res: Response) => {
    const { payload, customSecret } = req.body;
    const sig = generateHmacSignature(payload || 'test-data', customSecret);
    res.json({
      signature: sig,
      algorithm: 'HMAC-SHA256',
      timestamp: new Date().toISOString(),
    });
  });

  // 9. Storage Management & Auto-Purge Status
  app.get('/api/storage/metrics', (req: Request, res: Response) => {
    res.json({
      success: true,
      metrics: getStorageMetrics(),
    });
  });

  app.post('/api/storage/purge-all', (req: Request, res: Response) => {
    const clientIp = getClientIp(req);
    const result = manualPurgeAll(clientIp);
    res.json({
      success: true,
      message: `${result.freedMb} MB berkas video lokal & temporary render cache berhasil dibersihkan.`,
      result,
      metrics: getStorageMetrics(),
    });
  });

  // -------------------------------------------------------------
  // Vite Middleware & Static Serving
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AutoClip-Agent] Server berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[AutoClip-Agent] Server startup error:', err);
});
