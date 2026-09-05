import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ShieldCheck,
  Clock,
  Send,
  Download,
  Flame,
  Type,
  Maximize2,
  Tv,
  Smartphone,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { GeneratedClip, SocialPlatform, YouTubeVideoInfo } from '../types';

interface ClipStudioProps {
  clips: GeneratedClip[];
  selectedClip: GeneratedClip | null;
  videoInfo?: YouTubeVideoInfo | null;
  onSelectClip: (clip: GeneratedClip) => void;
  onOpenPublisher: (clip: GeneratedClip) => void;
  onUpdateClip?: (updatedClip: GeneratedClip) => void;
}

export const ClipStudio: React.FC<ClipStudioProps> = ({
  clips,
  selectedClip,
  videoInfo,
  onSelectClip,
  onOpenPublisher,
  onUpdateClip,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playerMode, setPlayerMode] = useState<'simulator' | 'youtube'>('simulator');
  const [activePlatformTab, setActivePlatformTab] = useState<'tiktok' | 'reels' | 'shorts' | 'x'>('tiktok');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [subtitleStyle, setSubtitleStyle] = useState<'mrbeast-yellow' | 'tiktok-neon' | 'minimal-clean' | 'karaoke-glow'>('mrbeast-yellow');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedHook, setEditedHook] = useState('');

  // Interactive scrubber timer
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (selectedClip) {
      setPlaybackTime(0);
      setIsPlaying(false);
      setEditedTitle(selectedClip.title);
      setEditedHook(selectedClip.hookQuote);
    }
  }, [selectedClip?.id]);

  useEffect(() => {
    if (isPlaying && selectedClip) {
      intervalRef.current = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= selectedClip.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, selectedClip]);

  if (!selectedClip || clips.length === 0) {
    return null;
  }

  const thumbnailUrl =
    videoInfo?.thumbnailUrl ||
    `https://img.youtube.com/vi/${selectedClip.videoId}/hqdefault.jpg`;

  // Find active subtitle line based on current playbackTime
  const activeSubIndex = Math.min(
    selectedClip.subtitles.length - 1,
    Math.floor((playbackTime / selectedClip.duration) * selectedClip.subtitles.length)
  );
  const currentSubtitle = selectedClip.subtitles[activeSubIndex] || selectedClip.subtitles[0];

  const handleCopyCaption = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(type);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleSaveTitleAndHook = () => {
    if (!onUpdateClip) return;
    onUpdateClip({
      ...selectedClip,
      title: editedTitle.trim() || selectedClip.title,
      hookQuote: editedHook.trim() || selectedClip.hookQuote,
    });
    setIsEditingTitle(false);
  };

  const handleDownloadMetadata = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedClip, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedClip.title.replace(/\s+/g, '_')}_clip_metadata.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full space-y-6">
      {/* Clip Selector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Klip Viral Terdeteksi ({clips.length} Klip Siap Publish)</span>
            </h3>
            <span className="text-xs text-slate-400">Pilih klip untuk melihat video, mengedit &amp; auto-upload</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800 self-start sm:self-auto">
            Klik thumbnail untuk ganti klip
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {clips.map((c) => {
            const isSelected = c.id === selectedClip.id;
            const clipThumb = `https://img.youtube.com/vi/${c.videoId}/hqdefault.jpg`;
            return (
              <button
                key={c.id}
                onClick={() => {
                  onSelectClip(c);
                  setPlaybackTime(0);
                  setIsPlaying(false);
                }}
                className={`text-left p-2.5 rounded-xl border transition-all relative overflow-hidden group flex flex-col justify-between ${
                  isSelected
                    ? 'border-red-500 bg-red-950/30 shadow-lg ring-2 ring-red-500/60'
                    : 'border-slate-800 bg-slate-950/70 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                {/* Visual Video Thumbnail */}
                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-2.5 bg-slate-950 border border-slate-800">
                  <img
                    src={clipThumb}
                    alt={c.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

                  {/* Play Button Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white scale-110 shadow-red-600/50'
                          : 'bg-black/60 text-white/90 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Top-Left: Clip # Badge */}
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10">
                    #{c.clipNumber}
                  </span>

                  {/* Top-Right: Virality Score */}
                  <span className="absolute top-1.5 right-1.5 text-[10px] font-bold text-amber-300 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-amber-500/30 flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    {c.viralityScore}%
                  </span>

                  {/* Bottom-Left: Exact Timestamps */}
                  <div className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-white flex items-center gap-1 border border-white/10">
                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                    <span>
                      {Math.floor(c.startTime / 60)}:{(c.startTime % 60).toString().padStart(2, '0')} -{' '}
                      {Math.floor(c.endTime / 60)}:{(c.endTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Bottom-Right: Duration */}
                  <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-red-600/90 shadow">
                    {c.duration}s
                  </span>
                </div>

                {/* Text Metadata */}
                <div>
                  <div className="text-xs font-bold text-white line-clamp-1 mb-1 group-hover:text-red-300 transition-colors">
                    {c.title}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 italic mb-2">
                    "{c.hookQuote}"
                  </div>
                </div>

                {/* Bottom Status */}
                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80 mt-auto">
                  <span className="text-slate-400">{c.subtitles.length} baris subtitle</span>
                  <span className={`font-semibold ${isSelected ? 'text-red-400' : 'text-slate-500'}`}>
                    {isSelected ? '● Sedang Dipilih' : 'Pilih Klip →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio View: Left Vertical/Widescreen Preview, Right Metadata & Publisher Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Video Player & 9:16 Smartphone Simulator Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Player Mode Switcher Tabs */}
          <div className="w-full max-w-[340px] mb-3 flex items-center justify-between bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setPlayerMode('simulator')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                playerMode === 'simulator'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulasi Shorts 9:16</span>
            </button>

            <button
              type="button"
              onClick={() => setPlayerMode('youtube')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                playerMode === 'youtube'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Pemutar YouTube Asli</span>
            </button>
          </div>

          {/* Smartphone Frame or Widescreen Player Frame */}
          {playerMode === 'simulator' ? (
            <div className="w-full max-w-[340px] bg-slate-950 rounded-[36px] p-3 border-4 border-slate-800 shadow-2xl shadow-red-950/20 relative">
              {/* Phone Speaker notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
                <div className="w-10 h-1 bg-slate-900 rounded-full" />
              </div>

              {/* Vertical Video Viewport (9:16 ratio) with Real Video Backdrop */}
              <div className="relative aspect-[9/16] w-full rounded-[26px] overflow-hidden bg-black border border-slate-800 flex flex-col justify-between p-4 select-none">
                {/* Real YouTube Video Thumbnail as Dynamic Backdrop */}
                <img
                  src={thumbnailUrl}
                  alt={selectedClip.title}
                  className="absolute inset-0 w-full h-full object-cover scale-110 opacity-70 blur-[0.5px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />

                {/* Top Bar inside Video: Hook & Virality */}
                <div className="z-10 flex items-center justify-between">
                  <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[10px] text-white">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="font-bold">Shorts 9:16</span>
                  </div>

                  <div className="bg-red-600/90 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-white" />
                    <span>{selectedClip.viralityScore}/100</span>
                  </div>
                </div>

                {/* Center: Interactive Subtitles with dynamic animated styling & Play prompt */}
                <div className="z-10 text-center px-3 py-4">
                  {/* Visual Hook Announcement */}
                  <div className="inline-block bg-amber-400 text-black font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-lg mb-3 shadow-lg transform -rotate-1">
                    🔥 {editedHook || selectedClip.hookQuote}
                  </div>

                  {/* Animated Subtitle box */}
                  <div
                    className={`p-3 rounded-xl transition-all ${
                      subtitleStyle === 'mrbeast-yellow'
                        ? 'bg-black/75 border-2 border-yellow-400 text-yellow-300 font-black text-sm tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                        : subtitleStyle === 'tiktok-neon'
                        ? 'bg-slate-950/85 border border-cyan-400 text-cyan-300 font-bold text-sm tracking-normal drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                        : subtitleStyle === 'karaoke-glow'
                        ? 'bg-purple-950/85 border border-pink-500 text-pink-200 font-black text-sm drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]'
                        : 'bg-black/70 text-white font-medium text-xs border border-white/20'
                    }`}
                  >
                    <p className="leading-snug">
                      "{currentSubtitle?.text || editedHook || selectedClip.hookQuote}"
                    </p>
                  </div>

                  {/* Center CTA Button to switch to live YouTube stream */}
                  <button
                    type="button"
                    onClick={() => setPlayerMode('youtube')}
                    className="mt-4 px-3 py-1.5 rounded-full bg-red-600/90 hover:bg-red-500 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 mx-auto border border-red-400/40 transition-all hover:scale-105"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Putar Video Asli</span>
                  </button>
                </div>

                {/* Bottom Video UI: Creator Tag, Caption, Audio soundwave */}
                <div className="z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shadow">
                      YT
                    </div>
                    <div className="text-white text-xs font-semibold drop-shadow">
                      @AutoClipCreator
                    </div>
                  </div>

                  <p className="text-[11px] text-white/90 line-clamp-2 drop-shadow leading-tight font-medium">
                    {editedTitle || selectedClip.title} {selectedClip.hashtags.slice(0, 3).join(' ')}
                  </p>

                  {/* Audio Bar */}
                  <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                    <Volume2 className="w-3 h-3 text-white" />
                    <span className="truncate">Audio Asli Klip ({selectedClip.duration}s)</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all duration-300"
                      style={{ width: `${(playbackTime / selectedClip.duration) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Decorative background grid effect */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              </div>

              {/* Scrubber & Player Controls */}
              <div className="mt-3 flex items-center justify-between px-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-md transition-all flex items-center gap-1 text-xs px-3 font-semibold"
                  title={isPlaying ? 'Pause Simulasi Subtitle' : 'Play Simulasi Subtitle'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play Subtitle'}</span>
                </button>

                <button
                  onClick={() => {
                    setPlaybackTime(0);
                    setIsPlaying(true);
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                  title="Putar Ulang dari Awal"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="text-xs font-mono text-slate-400">
                  {Math.round(playbackTime)}s / {selectedClip.duration}s
                </div>
              </div>
            </div>
          ) : (
            /* Widescreen YouTube Embed Player Frame */
            <div className="w-full max-w-[340px] bg-slate-950 rounded-3xl p-3 border-4 border-slate-800 shadow-2xl shadow-red-950/20 space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-red-500" />
                  <span>Segmen YouTube #{selectedClip.clipNumber}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {selectedClip.startTime}s - {selectedClip.endTime}s
                </span>
              </div>

              {/* Live YouTube Iframe Embed starting at startTime */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedClip.videoId}?start=${selectedClip.startTime}&end=${selectedClip.endTime}&autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`}
                  title={selectedClip.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Waktu Mulai:</span>
                  <span className="font-mono text-white">
                    {Math.floor(selectedClip.startTime / 60)}:{(selectedClip.startTime % 60).toString().padStart(2, '0')} (detik {selectedClip.startTime})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Waktu Selesai:</span>
                  <span className="font-mono text-white">
                    {Math.floor(selectedClip.endTime / 60)}:{(selectedClip.endTime % 60).toString().padStart(2, '0')} (detik {selectedClip.endTime})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Durasi Klip:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedClip.duration} Detik</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPlayerMode('simulator')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Beralih ke Simulasi Vertikal 9:16</span>
              </button>
            </div>
          )}

          {/* Subtitle Style Picker Bar */}
          <div className="mt-3 bg-slate-900 border border-slate-800 rounded-xl p-2 w-full max-w-[340px] flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Type className="w-3 h-3 text-yellow-400" />
              Gaya Subtitle:
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: 'mrbeast-yellow', label: 'Yellow' },
                { id: 'tiktok-neon', label: 'Neon' },
                { id: 'karaoke-glow', label: 'Glow' },
                { id: 'minimal-clean', label: 'Clean' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSubtitleStyle(style.id as any)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                    subtitleStyle === style.id
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Metadata, Viral Intelligence & Publishing Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Action Header & Fast Upload */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                    Klip Terpilih #{selectedClip.clipNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(!isEditingTitle)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingTitle ? 'Batal Edit' : 'Edit Judul'}</span>
                  </button>
                </div>

                {isEditingTitle ? (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      placeholder="Judul Klip"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      value={editedHook}
                      onChange={(e) => setEditedHook(e.target.value)}
                      placeholder="Hook Quote 3 Detik"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTitleAndHook}
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-white mt-0.5">{editedTitle || selectedClip.title}</h2>
                    <p className="text-xs text-amber-400 italic mt-0.5">
                      "{editedHook || selectedClip.hookQuote}"
                    </p>
                  </>
                )}
              </div>

              {/* Primary Upload CTA Button */}
              <button
                id="btn-trigger-social-upload"
                onClick={() => onOpenPublisher(selectedClip)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Auto-Upload Sekarang</span>
              </button>
            </div>

            {/* Viral Reasons Insight Card */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 mb-4">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Analisis Potensi Viral Gemini Pro ({selectedClip.viralityScore}/100)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedClip.viralReasons.map((reason, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5">&bull;</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety & Copyright Verification */}
            <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 rounded-xl px-3 py-2 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Moderasi Aman:</strong> Risiko Hak Cipta: {selectedClip.safety.copyrightRisk} &bull; Skor: {selectedClip.safety.contentScore}/100
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 rounded font-semibold text-emerald-300">
                Siap Publish
              </span>
            </div>
          </div>

          {/* Platform Captions Tab */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Caption Otomatis Per Platform Media Sosial
              </h3>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['tiktok', 'reels', 'shorts', 'x'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePlatformTab(tab)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-all ${
                      activePlatformTab === tab
                        ? 'bg-red-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'shorts' ? 'YT Shorts' : tab === 'reels' ? 'IG Reels' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Caption Box */}
            <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200">
              <p className="whitespace-pre-line leading-relaxed pr-16">
                {selectedClip.socialCaptions[activePlatformTab]}
              </p>

              <button
                onClick={() =>
                  handleCopyCaption(selectedClip.socialCaptions[activePlatformTab], activePlatformTab)
                }
                className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                title="Salin Caption"
              >
                {copiedTab === activePlatformTab ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Hashtags Pills */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Rekomendasi Tagar Viral:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedClip.hashtags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700/80 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleDownloadMetadata}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Metadata Klip (JSON)</span>
              </button>

              <button
                onClick={() => onOpenPublisher(selectedClip)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Konfigurasi Jadwal &amp; Channel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

