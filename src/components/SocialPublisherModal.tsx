import React, { useState } from 'react';
import {
  X,
  Send,
  Calendar,
  CheckCircle2,
  Shield,
  Lock,
  Flame,
  Radio,
  ExternalLink,
  Play,
  Pause,
  Clock,
  Trash2,
  Film,
} from 'lucide-react';
import { GeneratedClip, SocialPlatform } from '../types';
import { SOCIAL_PLATFORMS_INFO } from '../lib/constants';

interface SocialPublisherModalProps {
  clip: GeneratedClip | null;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (
    clip: GeneratedClip,
    platforms: SocialPlatform[],
    mode: 'instant' | 'scheduled',
    scheduledTime?: string
  ) => Promise<void>;
  isPublishing: boolean;
}

export const SocialPublisherModal: React.FC<SocialPublisherModalProps> = ({
  clip,
  isOpen,
  onClose,
  onPublish,
  isPublishing,
}) => {
  if (!isOpen || !clip) return null;

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    'youtube_shorts',
    'tiktok',
    'instagram_reels',
  ]);
  const [publishMode, setPublishMode] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledTime, setScheduledTime] = useState<string>('2026-09-05T19:00');
  const [editedCaption, setEditedCaption] = useState<string>(clip.socialCaptions.tiktok);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);

  const togglePlatform = (id: SocialPlatform) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleStartPublish = async () => {
    await onPublish(clip, selectedPlatforms, publishMode, publishMode === 'scheduled' ? scheduledTime : undefined);
    onClose();
  };

  const clipThumbnail = `https://img.youtube.com/vi/${clip.videoId}/hqdefault.jpg`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
            <Send className="w-3.5 h-3.5" />
            <span>Multi-Platform Auto Publisher</span>
          </div>
          <h3 className="text-xl font-bold text-white">{clip.title}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Kirimkan klip ini secara serentak ke akun media sosial Anda dengan tanda tangan kriptografis HMAC-SHA256.
          </p>
        </div>

        {/* VIDEO PREVIEW CARD (Visible preview before upload) */}
        <div className="mb-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-red-400" />
              <span>Preview Klip Video yang Akan Di-upload:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-950/40 hover:bg-red-950/70 px-2.5 py-1 rounded-lg border border-red-800/60 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{showLivePreview ? 'Tutup Pemutar Video' : 'Tonton Segmen Video'}</span>
            </button>
          </div>

          {showLivePreview ? (
            /* Live YouTube Embed within Modal */
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${clip.videoId}?start=${clip.startTime}&end=${clip.endTime}&autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`}
                title={clip.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            /* Thumbnail Banner Card */
            <div className="relative aspect-video sm:aspect-[21/9] w-full rounded-xl overflow-hidden bg-black border border-slate-800 group">
              <img
                src={clipThumbnail}
                alt={clip.title}
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Play Trigger in center */}
              <button
                type="button"
                onClick={() => setShowLivePreview(true)}
                className="absolute inset-0 flex items-center justify-center group/btn"
              >
                <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover/btn:scale-110 group-hover/btn:bg-red-500 transition-all border border-white/20">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </button>

              {/* Floating metadata badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="bg-black/80 backdrop-blur-sm text-white font-bold text-[10px] px-2 py-0.5 rounded border border-white/10">
                  Klip #{clip.clipNumber}
                </span>
                <span className="bg-amber-500/90 text-black font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 fill-black" />
                  {clip.viralityScore}% Viral
                </span>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
                <div className="bg-black/85 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/10">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>
                    {Math.floor(clip.startTime / 60)}:{(clip.startTime % 60).toString().padStart(2, '0')} -{' '}
                    {Math.floor(clip.endTime / 60)}:{(clip.endTime % 60).toString().padStart(2, '0')} ({clip.duration} detik)
                  </span>
                </div>
                <span className="text-[10px] text-amber-300 bg-black/80 px-2 py-1 rounded font-medium italic hidden sm:block">
                  "{clip.hookQuote.slice(0, 30)}..."
                </span>
              </div>
            </div>
          )}

          {/* Auto-Purge Storage Safety Banner */}
          <div className="flex items-center gap-2 text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-800/30 rounded-xl px-3 py-2">
            <Trash2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Auto-Purge Storage Aktif:</strong> File klip video lokal (~38 MB) akan otomatis dihapus dari server segera setelah upload berhasil, menjaga kuota disk tetap bersih.
            </span>
          </div>
        </div>

        {/* Platform Selection */}

        <div className="mb-6">
          <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
            Pilih Saluran Media Sosial Tujuan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SOCIAL_PLATFORMS_INFO.map((platform) => {
              const isChecked = selectedPlatforms.includes(platform.id as SocialPlatform);
              return (
                <div
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id as SocialPlatform)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    isChecked
                      ? 'border-red-500 bg-red-950/20 shadow-md ring-1 ring-red-500/50'
                      : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 opacity-70'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{platform.name}</span>
                      {isChecked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">{platform.desc}</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      isChecked ? 'bg-red-600 border-red-500 text-white' : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isChecked ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Publish Mode: Instant vs Scheduled */}
        <div className="mb-6 bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
            Jadwal Publikasi:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => setPublishMode('instant')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                publishMode === 'instant'
                  ? 'border-blue-500 bg-blue-950/30 text-white font-semibold'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Radio className={`w-4 h-4 mt-0.5 ${publishMode === 'instant' ? 'text-blue-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs text-white font-bold">Upload Langsung Sekarang</div>
                <div className="text-[10px] text-slate-400">Kirim payload ke API sekarang juga tanpa jeda</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPublishMode('scheduled')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                publishMode === 'scheduled'
                  ? 'border-blue-500 bg-blue-950/30 text-white font-semibold'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className={`w-4 h-4 mt-0.5 ${publishMode === 'scheduled' ? 'text-blue-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs text-white font-bold">Jadwalkan Prime Time</div>
                <div className="text-[10px] text-slate-400">Otomatisasi publish pada jam puncak audiens</div>
              </div>
            </button>
          </div>

          {publishMode === 'scheduled' && (
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Jam Prime:</span>
                <button
                  type="button"
                  onClick={() => setScheduledTime('2026-09-05T12:00')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                >
                  Siang (12:00)
                </button>
                <button
                  type="button"
                  onClick={() => setScheduledTime('2026-09-05T17:30')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                >
                  Sore (17:30)
                </button>
                <button
                  type="button"
                  onClick={() => setScheduledTime('2026-09-05T20:00')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                >
                  Malam (20:00)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Caption Editor Preview */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Caption &amp; Tagar yang Akan Dikirim:</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {editedCaption.length} Karakter
            </span>
          </label>
          <textarea
            value={editedCaption}
            onChange={(e) => setEditedCaption(e.target.value)}
            rows={4}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500 font-sans leading-relaxed"
          />
        </div>

        {/* Security Audit & Signature Badge */}
        <div className="mb-6 bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Keamanan Terverifikasi:</span> Payload akan ditandatangani dengan HMAC-SHA256 di server.
            </div>
          </div>
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>

          <button
            id="btn-confirm-publish"
            type="button"
            onClick={handleStartPublish}
            disabled={isPublishing || selectedPlatforms.length === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {isPublishing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memproses Dispatch...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{publishMode === 'instant' ? 'Publish Sekarang' : 'Jadwalkan ke Antrean'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
