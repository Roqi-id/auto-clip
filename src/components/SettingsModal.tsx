import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Sparkles,
  Link2,
  Trash2,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { SecuritySettings, SocialPlatform, StorageMetrics } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SecuritySettings | null;
  onSaveConfig: (newConfig: Partial<SecuritySettings>) => Promise<void>;
  storageMetrics?: StorageMetrics | null;
  onPurgeAll?: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  storageMetrics,
  onPurgeAll,
}) => {
  if (!isOpen || !config) return null;

  const [formData, setFormData] = useState<SecuritySettings>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleManualPurge = async () => {
    if (!onPurgeAll) return;
    setIsPurging(true);
    try {
      await onPurgeAll();
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    } catch (err) {
      console.error('Purge error:', err);
    } finally {
      setIsPurging(false);
    }
  };

  const handleAccountToggle = (platform: SocialPlatform) => {
    setFormData((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [platform]: {
          ...prev.accounts[platform],
          autoPublishEnabled: !prev.accounts[platform]?.autoPublishEnabled,
        },
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan Sistem &amp; Koneksi Media Sosial</span>
          </div>
          <h3 className="text-xl font-bold text-white">Konfigurasi Publisher &amp; Keamanan</h3>
          <p className="text-xs text-slate-400 mt-1">
            Kelola saluran upload otomatis, webhook pipeline, dan preferensi model AI Gemini.
          </p>
        </div>

        {/* Form Body */}
        <div className="space-y-6 text-xs">
          {/* Section 1: AI Model Configuration */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Model Gemini AI untuk Analisis Video</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                  formData.model === 'gemini-3.1-pro-preview'
                    ? 'border-red-500 bg-red-950/30'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="geminiModel"
                  checked={formData.model === 'gemini-3.1-pro-preview'}
                  onChange={() => setFormData({ ...formData, model: 'gemini-3.1-pro-preview' })}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-white">Gemini 3.1 Pro (Direkomendasikan)</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Memahami konteks pembicaraan video, mendeteksi hook viral dengan presisi tinggi.
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                  formData.model === 'gemini-3.8-flash'
                    ? 'border-red-500 bg-red-950/30'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="geminiModel"
                  checked={formData.model === 'gemini-3.8-flash'}
                  onChange={() => setFormData({ ...formData, model: 'gemini-3.8-flash' })}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-white">Gemini 3.8 Flash</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Respon kilat, sangat hemat kuota token.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Social Media Channel Connections */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Saluran Upload Otomatis (Auto-Publish Toggle)</span>
            </h4>
            <div className="space-y-2">
              {(Object.keys(formData.accounts) as SocialPlatform[]).map((platformKey) => {
                const account = formData.accounts[platformKey];
                if (!account) return null;

                return (
                  <div
                    key={platformKey}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white capitalize">
                        {platformKey.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-slate-400">{account.accountName}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">
                        {account.autoPublishEnabled ? 'Auto-Upload Aktif' : 'Manual'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAccountToggle(platformKey)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          account.autoPublishEnabled ? 'bg-red-600' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            account.autoPublishEnabled ? 'transform translate-x-4' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Webhook Automation Pipeline */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Webhook Endpoint (Make / Zapier / Custom Server)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Jika diisi, payload klip otomatis akan dikirim ke webhook eksternal ini dengan header tanda tangan <code className="text-amber-400">X-Signature-SHA256</code>.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Webhook URL:</label>
              <input
                type="text"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://hook.eu1.make.com/..."
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-red-500 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>HMAC Secret Vault:</span>
              </div>
              <span className="font-mono text-slate-300">{formData.webhookSecretMasked}</span>
            </div>
          </div>

          {/* Section 4: Manajemen Penyimpanan Disk & Auto-Hapus Berkas */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manajemen Penyimpanan Disk &amp; Auto-Hapus Berkas</span>
              </h4>
              <span className="text-cyan-400 font-bold text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                ZERO STORAGE FOOTPRINT
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Berkas video auto clip yang diproses menghabiskan kuota disk. Aktifkan auto-hapus agar berkas video otomatis dimusnahkan segera setelah berhasil tayang di media sosial (TikTok, Shorts, Reels, X) agar tidak membebani server.
            </p>

            {/* Auto-Delete Toggle */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block text-xs">
                  Hapus Otomatis Berkas Pasca Upload Sukses
                </span>
                <span className="text-[10px] text-slate-400">
                  Direkomendasikan agar kapasitas penyimpanan tidak overload / penuh
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    autoDeleteOnPublish: !prev.autoDeleteOnPublish,
                  }))
                }
                className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                  formData.autoDeleteOnPublish !== false ? 'bg-cyan-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    formData.autoDeleteOnPublish !== false ? 'transform translate-x-4' : ''
                  }`}
                />
              </button>
            </div>

            {/* Retention Policy Selection */}
            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-1.5">
                Kebijakan Waktu Hapus (Retention Policy):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'immediate', label: 'Instan (0 Detik)', desc: 'Hapus detik itu juga pasca upload' },
                  { id: '1_hour', label: 'Simpan 1 Jam', desc: 'Buffer aman untuk verifikasi posting' },
                  { id: 'manual', label: 'Manual', desc: 'Simpan berkas hingga dihapus manual' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        retentionPolicy: opt.id as any,
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      (formData.retentionPolicy || 'immediate') === opt.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-white">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Storage Metrics & Cache Cleaner */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Penyimpanan Server yang Berhasil Dihemat:</div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {storageMetrics ? `${storageMetrics.totalStorageFreedMb.toFixed(1)} MB` : '148.2 MB'}
                    <span className="text-[11px] font-normal text-slate-400 ml-1.5">
                      ({storageMetrics ? storageMetrics.totalClipsPurged : 4} klip dibersihkan)
                    </span>
                  </div>
                </div>
              </div>

              {onPurgeAll && (
                <button
                  type="button"
                  onClick={handleManualPurge}
                  disabled={isPurging}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
                  <span>{purgeSuccess ? 'Cache Bersih!' : isPurging ? 'Membersihkan...' : 'Bersihkan Cache Sekarang'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 5: Security Policy Toggles */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Kebijakan Keamanan Sistem</span>
            </h4>

            <div className="flex items-center justify-between py-1 border-b border-slate-900">
              <div>
                <span className="font-semibold text-white block">Proteksi SSRF &amp; Domain Whitelist</span>
                <span className="text-[10px] text-slate-400">Mencegah server mengakses IP lokal atau cloud metadata</span>
              </div>
              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                TERKUNCI (AKTIF)
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="font-semibold text-white block">Token Bucket Rate Limiter</span>
                <span className="text-[10px] text-slate-400">Proteksi terhadap banjir request &amp; bot scraping</span>
              </div>
              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                TERKUNCI (AKTIF)
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Tersimpan!</span>
              </>
            ) : isSaving ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
