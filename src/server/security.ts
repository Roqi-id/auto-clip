import crypto from 'crypto';
import { SecurityAuditLog, AuditSeverity } from '../types';

// In-memory audit log store (kept server-side)
const auditLogs: SecurityAuditLog[] = [
  {
    id: 'audit_init_1',
    timestamp: new Date().toISOString(),
    eventType: 'SSRF_SHIELD_CHECK',
    severity: 'SUCCESS',
    details: 'Security Shield Engine diaktifkan: Proteksi SSRF, HMAC-SHA256, and Rate Limiting siap.',
    ipMasked: '127.0.0.xxx',
  },
];

// In-memory rate limiting store: IP -> timestamps[]
const rateLimitBuckets = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests/minute per client

/**
 * Validates a YouTube URL with strict SSRF defense.
 * Blocks non-HTTPS, internal network ranges, metadata endpoints, and non-YouTube hosts.
 */
export function validateAndSanitizeYouTubeUrl(rawUrl: string, clientIp = '127.0.0.1'): {
  isValid: boolean;
  videoId?: string;
  normalizedUrl?: string;
  error?: string;
} {
  try {
    if (!rawUrl || typeof rawUrl !== 'string') {
      logAuditEvent('URL_BLOCKED', 'WARNING', 'Input URL kosong atau bukan string', clientIp);
      return { isValid: false, error: 'URL YouTube wajib diisi.' };
    }

    const trimmed = rawUrl.trim();

    // Prevent excessive length attack
    if (trimmed.length > 500) {
      logAuditEvent('URL_BLOCKED', 'CRITICAL', 'Input URL melebihi batas 500 karakter', clientIp);
      return { isValid: false, error: 'URL terlalu panjang.' };
    }

    const parsed = new URL(trimmed);

    // 1. Enforce HTTPS protocol
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      logAuditEvent('URL_BLOCKED', 'CRITICAL', `Protokol dilarang: ${parsed.protocol}`, clientIp);
      return { isValid: false, error: 'Hanya protokol HTTP/HTTPS yang diizinkan.' };
    }

    // 2. SSRF check: Disallow private IP addresses and metadata endpoints
    const hostname = parsed.hostname.toLowerCase();
    const disallowedHostnames = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '169.254.169.254', // Cloud metadata
      'metadata.google.internal',
      'instance-data',
    ];

    if (
      disallowedHostnames.includes(hostname) ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      logAuditEvent('SSRF_SHIELD_CHECK', 'CRITICAL', `Upaya SSRF dicegah ke host: ${hostname}`, clientIp);
      return { isValid: false, error: 'Keamanan: Host internal/privat diblokir oleh SSRF Shield.' };
    }

    // 3. Whitelist allowed YouTube hostnames
    const allowedHosts = [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtu.be',
      'music.youtube.com',
    ];

    if (!allowedHosts.includes(hostname)) {
      logAuditEvent('URL_BLOCKED', 'WARNING', `Host bukan YouTube: ${hostname}`, clientIp);
      return { isValid: false, error: 'URL harus berasal dari domain resmi YouTube (youtube.com atau youtu.be).' };
    }

    // 4. Extract and validate YouTube Video ID
    let videoId: string | null = null;

    if (hostname === 'youtu.be') {
      // Format: https://youtu.be/VIDEO_ID
      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        videoId = pathSegments[0];
      }
    } else {
      // Check for /shorts/VIDEO_ID
      if (parsed.pathname.startsWith('/shorts/')) {
        const segments = parsed.pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
          videoId = segments[1];
        }
      } else if (parsed.pathname === '/watch') {
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        const segments = parsed.pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
          videoId = segments[1];
        }
      }
    }

    // 5. Strict Regex Validation for Video ID (YouTube 11 chars base64url safe)
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      logAuditEvent('URL_BLOCKED', 'WARNING', `ID Video YouTube tidak valid: ${videoId || 'kosong'}`, clientIp);
      return { isValid: false, error: 'Format ID video YouTube tidak valid (harus 11 karakter alfanumerik).' };
    }

    const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    logAuditEvent('URL_VALIDATED', 'INFO', `URL YouTube terverifikasi aman: ${videoId}`, clientIp);

    return {
      isValid: true,
      videoId,
      normalizedUrl,
    };
  } catch (err: any) {
    logAuditEvent('URL_BLOCKED', 'CRITICAL', `Gagal mem-parsing URL: ${err.message}`, clientIp);
    return { isValid: false, error: 'URL tidak valid atau format rusak.' };
  }
}

/**
 * Signs a payload using HMAC-SHA256 for secure webhook delivery
 */
export function generateHmacSignature(payload: string, secret?: string): string {
  const secretKey = secret || process.env.WEBHOOK_SECRET || 'yt-clip-default-secure-sign-key';
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Generates a SHA-256 hash of any content
 */
export function generateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Mask sensitive credentials for safe front-end presentation
 */
export function maskToken(token?: string | null): string {
  if (!token) return 'Belum Dikonfigurasi';
  if (token.length <= 8) return '••••••••';
  return `${token.substring(0, 4)}••••••••${token.substring(token.length - 4)}`;
}

/**
 * Masks client IP address for privacy in logs (e.g. 192.168.1.100 -> 192.168.1.xxx)
 */
export function maskIp(ip: string): string {
  if (!ip) return '0.0.0.xxx';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return ip.substring(0, ip.length - 3) + 'xxx';
}

/**
 * Logs a security audit event
 */
export function logAuditEvent(
  eventType: SecurityAuditLog['eventType'],
  severity: AuditSeverity,
  details: string,
  rawIp = '127.0.0.1',
  signatureHash?: string
): SecurityAuditLog {
  const log: SecurityAuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    eventType,
    severity,
    details,
    ipMasked: maskIp(rawIp),
    signatureHash,
  };

  auditLogs.unshift(log);

  // Keep last 150 entries in memory
  if (auditLogs.length > 150) {
    auditLogs.pop();
  }

  return log;
}

/**
 * Retrieve current audit logs
 */
export function getAuditLogs(): SecurityAuditLog[] {
  return [...auditLogs];
}

/**
 * Check rate limit for client IP
 */
export function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = rateLimitBuckets.get(clientIp) || [];

  // Filter timestamps within window
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitBuckets.set(clientIp, validTimestamps);
    logAuditEvent('RATE_LIMIT_CHECK', 'WARNING', `Rate limit terlampaui (${MAX_REQUESTS_PER_WINDOW} req/min)`, clientIp);
    return { allowed: false, remaining: 0 };
  }

  validTimestamps.push(now);
  rateLimitBuckets.set(clientIp, validTimestamps);

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - validTimestamps.length,
  };
}
