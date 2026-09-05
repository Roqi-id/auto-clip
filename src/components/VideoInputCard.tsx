import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { DEMO_PRESETS, DemoVideoPreset } from '../lib/constants';
import { YouTubeVideoInfo } from '../types';

interface VideoInputCardProps {
  onAnalyze: (url: string, customTranscript?: string, targetDuration?: 'short' | 'medium' | 'long') => Promise<void>;
  isLoading: boolean;
  videoInfo: YouTubeVideoInfo | null;
  selectedModel: 'gemini-3.1-pro-preview' | 'gemini-3.8-flash';
  onModelChange: (model: 'gemini-3.1-pro-preview' | 'gemini-3.8-flash') => void;
}

export const VideoInputCard: React.FC<VideoInputCardProps> = ({
  onAnalyze,
  isLoading,
  videoInfo,
  selectedModel,
  onModelChange,
}) => {
  const [url, setUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customTranscript, setCustomTranscript] = useState('');
  const [targetDuration, setTargetDuration] = useState<'short' | 'medium' | 'long'>('medium');
  const [inputError, setInputError] = useState<string | null>(null);

  // Quick preset selector
  const handleSelectPreset = (preset: DemoVideoPreset) => {
    setUrl(preset.url);
    setCustomTranscript(preset.sampleTranscript);
    setInputError(null);
  };

  const validateQuick = (val: string): boolean => {
    if (!val.trim()) {
      setInputError('Silakan masukkan link URL YouTube.');
      return false;
    }
    if (!val.includes('youtube.com') && !val.includes('youtu.be')) {
      setInputError('URL harus berasal dari YouTube resmi (youtube.com atau youtu.be).');
      return false;
    }
    setInputError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateQuick(url)) {
      onAnalyze(url, customTranscript.trim() || undefined, targetDuration);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-5 sm:p-6 mb-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Input Link Video YouTube</span>
            <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Shield className="w-3 h-3 mr-1" />
              SSRF Protected
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Tempel link video YouTube untuk mengekstrak momen-momen viral secara otomatis dengan AI Gemini Pro.
          </p>
        </div>

        {/* Preset quick test chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden md:inline">Contoh Cepat:</span>
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1"
              title={preset.title}
            >
              <Play className="w-2.5 h-2.5 text-red-400 fill-red-400" />
              <span>{preset.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              id="input-youtube-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
              className={`w-full pl-10 pr-24 py-3 bg-slate-950 border ${
                inputError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700 focus:border-red-500'
              } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all`}
              disabled={isLoading}
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white"
              >
                Hapus
              </button>
            )}
          </div>

          <button
            id="btn-analyze-video"
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all min-w-[180px]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Auto Clip dengan AI</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {inputError && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 px-3 py-2 rounded-lg border border-red-900/50">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{inputError}</span>
          </div>
        )}

        {/* Verified Video Preview snippet if metadata loaded */}
        {videoInfo && !isLoading && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={videoInfo.thumbnailUrl}
                alt={videoInfo.title}
                className="w-20 h-12 object-cover rounded-lg border border-slate-800 flex-shrink-0"
              />
              <div>
                <h4 className="text-xs font-semibold text-white line-clamp-1">{videoInfo.title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>Oleh: {videoInfo.author}</span>
                  <span>&bull;</span>
                  <span>Estimasi: {videoInfo.durationFormatted}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3" />
                Terverifikasi
              </span>
              <a
                href={videoInfo.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title="Buka di YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Advanced Options Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium"
          >
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Pengaturan Model AI, Durasi Klip, &amp; Transkrip Khusus</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-slate-950/60 border border-slate-800/90 rounded-xl space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI Model selector */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Pilihan Model Gemini
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onModelChange('gemini-3.1-pro-preview')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedModel === 'gemini-3.1-pro-preview'
                          ? 'border-red-500 bg-red-950/30 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-white text-[11px]">Gemini 3.1 Pro</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Analisis mendalam &amp; hook viral tajam</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onModelChange('gemini-3.8-flash')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedModel === 'gemini-3.8-flash'
                          ? 'border-red-500 bg-red-950/30 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-white text-[11px]">Gemini 3.8 Flash</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Generasi super cepat &amp; efisien</div>
                    </button>
                  </div>
                </div>

                {/* Target Clip Duration */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    Target Durasi Klip
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'short', label: '15-30s', desc: 'Ultra Hook' },
                      { key: 'medium', label: '30-60s', desc: 'Standar Optimal' },
                      { key: 'long', label: '60-90s', desc: 'Deep Story' },
                    ].map((dur) => (
                      <button
                        key={dur.key}
                        type="button"
                        onClick={() => setTargetDuration(dur.key as any)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          targetDuration === dur.key
                            ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-semibold'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{dur.label}</div>
                        <div className="text-[9px] text-slate-400">{dur.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Custom Transcript / Topic notes */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    Transkrip Tambahan atau Catatan Video (Opsional)
                  </span>
                  {customTranscript && (
                    <button
                      type="button"
                      onClick={() => setCustomTranscript('')}
                      className="text-[10px] text-slate-500 hover:text-red-400"
                    >
                      Kosongkan
                    </button>
                  )}
                </label>
                <textarea
                  value={customTranscript}
                  onChange={(e) => setCustomTranscript(e.target.value)}
                  placeholder="Jika ada transkrip khusus, wawancara, atau poin penting, Anda dapat menempelkannya di sini untuk hasil potongan yang lebih presisi..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs placeholder-slate-600 focus:border-slate-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
