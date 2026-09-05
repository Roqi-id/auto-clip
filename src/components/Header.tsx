import React from 'react';
import { ShieldCheck, Video, Send, Settings, Sparkles, Lock, Radio, HardDrive, CheckCircle2, Download } from 'lucide-react';

interface HeaderProps {
  queueCount: number;
  onOpenQueue: () => void;
  onOpenSecurity: () => void;
  onOpenSettings: () => void;
  model: string;
  storageFreedMb?: number;
  autoDeleteEnabled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  queueCount,
  onOpenQueue,
  onOpenSecurity,
  onOpenSettings,
  model,
  storageFreedMb = 0,
  autoDeleteEnabled = true,
}) => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-900/30">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                AutoClip Studio
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                  Gemini Pro
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Auto Clip YouTube &bull; Multi-Platform Social Publisher &bull; Enterprise Security
            </p>
          </div>
        </div>

        {/* Status Indicators & Navigation Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Security Status Badge */}
          <button
            id="btn-security-shield"
            onClick={onOpenSecurity}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-900/50 transition-colors"
            title="Buka Pusat Keamanan & Audit Log"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SSRF Shield: Aman</span>
            <Lock className="w-3 h-3 text-emerald-400/70 ml-0.5" />
          </button>

          {/* Auto-Delete Storage Status Badge */}
          <button
            id="btn-storage-indicator"
            onClick={onOpenSettings}
            className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium hover:bg-cyan-900/50 transition-colors"
            title="Sistem Auto-Hapus Video Aktif - Hemat Penyimpanan Disk"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto-Hapus: {autoDeleteEnabled ? 'Aktif' : 'Nonaktif'}</span>
            {storageFreedMb > 0 && (
              <span className="bg-cyan-900/80 text-cyan-200 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                {storageFreedMb >= 1000 ? `${(storageFreedMb / 1024).toFixed(1)} GB` : `${storageFreedMb.toFixed(0)} MB`} Hemat
              </span>
            )}
          </button>

          {/* AI Model indicator */}
          <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs">
            <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
            <span className="font-mono text-[11px]">
              {model === 'gemini-3.1-pro-preview' ? 'Gemini 3.1 Pro' : 'Gemini 3.8 Flash'}
            </span>
          </div>

          {/* Publish Queue Action */}
          <button
            id="btn-open-queue"
            onClick={onOpenQueue}
            className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Antrean Upload</span>
            {queueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                {queueCount}
              </span>
            )}
          </button>

          {/* Security & Audit Modal Button */}
          <button
            id="btn-audit-logs"
            onClick={onOpenSecurity}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            title="Audit Log Keamanan"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Audit Log</span>
          </button>

          {/* Download Project ZIP Button */}
          <a
            id="btn-download-project-zip"
            href="/api/download/project-zip"
            download="youtube-ai-autoclip-publisher.zip"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-900/30 transition-all hover:scale-105"
            title="Unduh Seluruh Source Code Project (.ZIP)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-semibold">Unduh ZIP</span>
          </a>

          {/* Settings Modal Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Pengaturan Akun & Webhook"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
