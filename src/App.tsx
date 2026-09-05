import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoInputCard } from './components/VideoInputCard';
import { ClipStudio } from './components/ClipStudio';
import { SocialPublisherModal } from './components/SocialPublisherModal';
import { PublishQueueView } from './components/PublishQueueView';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { SettingsModal } from './components/SettingsModal';
import {
  GeneratedClip,
  PublishJob,
  SecurityAuditLog,
  SecuritySettings,
  SocialPlatform,
  StorageMetrics,
  YouTubeVideoInfo,
} from './types';
import {
  Sparkles,
  Shield,
  Video,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Zap,
} from 'lucide-react';

export default function App() {
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [clips, setClips] = useState<GeneratedClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<GeneratedClip | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // App-wide data
  const [publishQueue, setPublishQueue] = useState<PublishJob[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [securityConfig, setSecurityConfig] = useState<SecuritySettings | null>(null);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics | null>(null);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.8-flash'>('gemini-3.1-pro-preview');

  // Modals
  const [isPublisherOpen, setIsPublisherOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial data loading
  useEffect(() => {
    fetchPublishQueue();
    fetchAuditLogs();
    fetchSecurityConfig();
    fetchStorageMetrics();
  }, []);

  const fetchPublishQueue = async () => {
    try {
      const res = await fetch('/api/publish/queue');
      const data = await res.json();
      if (data.success && Array.isArray(data.queue)) {
        setPublishQueue(data.queue);
      }
    } catch (err) {
      console.error('Error fetching publish queue:', err);
    }
  };

  const fetchStorageMetrics = async () => {
    try {
      const res = await fetch('/api/storage/metrics');
      const data = await res.json();
      if (data.success && data.metrics) {
        setStorageMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Error fetching storage metrics:', err);
    }
  };

  const handlePurgeAllStorage = async () => {
    try {
      const res = await fetch('/api/storage/purge-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Cache video dibersihkan.', 'success');
        fetchStorageMetrics();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('Error purging storage:', err);
      showToast('Gagal membersihkan penyimpanan.', 'error');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/security/audit-logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  const fetchSecurityConfig = async () => {
    try {
      const res = await fetch('/api/security/config');
      const data = await res.json();
      if (data.success && data.config) {
        setSecurityConfig(data.config);
        if (data.config.model) {
          setSelectedModel(data.config.model);
        }
      }
    } catch (err) {
      console.error('Error fetching security config:', err);
    }
  };

  // Main Action: Analyze Video and generate clips
  const handleAnalyzeVideo = async (
    url: string,
    customTranscript?: string,
    targetDuration: 'short' | 'medium' | 'long' = 'medium'
  ) => {
    setIsAnalyzing(true);
    setToast({ message: 'Memvalidasi link YouTube & memeriksa proteksi SSRF...', type: 'info' });

    try {
      // 1. Inspect URL & extract metadata with SSRF protection
      const inspectRes = await fetch('/api/youtube/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const inspectData = await inspectRes.json();
      if (!inspectRes.ok || !inspectData.success) {
        throw new Error(inspectData.error || 'Validasi URL gagal.');
      }

      const fetchedVideoInfo = inspectData.data;
      setVideoInfo(fetchedVideoInfo);

      // 2. Call Gemini Pro to detect viral clips
      showToast(`Mengirim ke AI Gemini Pro (${selectedModel}) untuk analisis viral hook...`, 'info');

      const analyzeRes = await fetch('/api/clips/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoInfo: fetchedVideoInfo,
          customTranscript,
          model: selectedModel,
          targetDuration,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok || !analyzeData.success) {
        throw new Error(analyzeData.error || 'Gagal menganalisis video dengan AI.');
      }

      setClips(analyzeData.clips);
      if (analyzeData.clips.length > 0) {
        setSelectedClip(analyzeData.clips[0]);
      }

      showToast(`Berhasil menemukan ${analyzeData.clips.length} momen klip viral!`, 'success');
      fetchAuditLogs();
    } catch (err: any) {
      console.error('Analysis error:', err);
      showToast(err.message || 'Terjadi kesalahan saat memproses video.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dispatch Clip to Social Media
  const handlePublishClip = async (
    clip: GeneratedClip,
    platforms: SocialPlatform[],
    mode: 'instant' | 'scheduled',
    scheduledTime?: string
  ) => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clip,
          videoTitle: videoInfo?.title || 'YouTube Short',
          targetPlatforms: platforms,
          mode,
          scheduledTime,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses publikasi.');
      }

      showToast(
        mode === 'instant'
          ? `Klip berhasil dipublikasikan ke ${platforms.length} platform! Berkas lokal otomatis dibersihkan.`
          : `Klip dijadwalkan untuk dipublikasikan pada ${scheduledTime}!`,
        'success'
      );

      fetchPublishQueue();
      fetchAuditLogs();
      fetchStorageMetrics();
    } catch (err: any) {
      console.error('Publish error:', err);
      showToast(err.message || 'Gagal melakukan publikasi.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Retry failed publish job
  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch('/api/publish/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Job upload dicoba ulang!', 'success');
        fetchPublishQueue();
        fetchAuditLogs();
        fetchStorageMetrics();
      }
    } catch (err) {
      console.error('Error retrying job:', err);
    }
  };

  // Update Clip details (title, hook, etc.)
  const handleUpdateClip = (updated: GeneratedClip) => {
    setClips((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedClip(updated);
    showToast('Perubahan klip berhasil disimpan!', 'success');
  };

  // Save Settings
  const handleSaveConfig = async (newConfig: Partial<SecuritySettings>) => {
    const res = await fetch('/api/security/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    });
    const data = await res.json();
    if (data.success && data.config) {
      setSecurityConfig(data.config);
      if (data.config.model) {
        setSelectedModel(data.config.model);
      }
      showToast('Pengaturan berhasil disimpan.', 'success');
      fetchAuditLogs();
      fetchStorageMetrics();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500 text-red-200'
                : 'bg-slate-900/90 border-blue-500 text-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {toast.type === 'info' && <Clock className="w-4 h-4 text-blue-400 animate-spin" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        queueCount={publishQueue.filter((j) => j.status === 'processing' || j.status === 'queued').length}
        onOpenQueue={() => setIsQueueOpen(true)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        model={selectedModel}
        storageFreedMb={storageMetrics?.totalStorageFreedMb}
        autoDeleteEnabled={securityConfig?.autoDeleteOnPublish !== false}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner Quick Highlights */}
        <div className="mb-6 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900/60 border border-red-900/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Pipeline Auto-Clip &bull; AI Gemini Pro
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Ubah Video Panjang YouTube Jadi Puluhan Shorts &amp; TikTok Viral dalam Hitungan Detik
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              Dilengkapi pemotong timestamp cerdas, skor retensi viralitas, subtitle dinamis gaya MrBeast, dan auto-dispatch ke media sosial dengan arsitektur keamanan tingkat tinggi (SSRF Shield + HMAC-SHA256).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsSecurityOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Status Keamanan</span>
            </button>

            <button
              onClick={() => setIsQueueOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Antrean ({publishQueue.length})</span>
            </button>
          </div>
        </div>

        {/* 1. Input Card Section */}
        <VideoInputCard
          onAnalyze={handleAnalyzeVideo}
          isLoading={isAnalyzing}
          videoInfo={videoInfo}
          selectedModel={selectedModel}
          onModelChange={(m) => setSelectedModel(m)}
        />

        {/* 2. Generated Clips Studio Section */}
        {clips.length > 0 && selectedClip ? (
          <ClipStudio
            clips={clips}
            selectedClip={selectedClip}
            videoInfo={videoInfo}
            onSelectClip={(c) => setSelectedClip(c)}
            onOpenPublisher={(c) => {
              setSelectedClip(c);
              setIsPublisherOpen(true);
            }}
            onUpdateClip={handleUpdateClip}
          />
        ) : !isAnalyzing ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-red-400 shadow-inner">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Belum Ada Video yang Dianalisis</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Masukkan link video YouTube di formulir atas atau klik salah satu <strong>Contoh Cepat</strong> untuk melihat hasil klip viral otomatis dengan Gemini Pro.
            </p>
          </div>
        ) : null}
      </main>

      {/* Modals */}
      <SocialPublisherModal
        clip={selectedClip}
        isOpen={isPublisherOpen}
        onClose={() => setIsPublisherOpen(false)}
        onPublish={handlePublishClip}
        isPublishing={isPublishing}
      />

      <PublishQueueView
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={publishQueue}
        onRetry={handleRetryJob}
        onRefresh={fetchPublishQueue}
        storageMetrics={storageMetrics}
        onPurgeAll={handlePurgeAllStorage}
      />

      <SecurityAuditModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        logs={auditLogs}
        onRefreshLogs={fetchAuditLogs}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={securityConfig}
        onSaveConfig={handleSaveConfig}
        storageMetrics={storageMetrics}
        onPurgeAll={handlePurgeAllStorage}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          YouTube AI AutoClip &bull; Ditenagai oleh Gemini Pro (@google/genai) &bull; Arsitektur Keamanan Terisolasi
        </p>
      </footer>
    </div>
  );
}
