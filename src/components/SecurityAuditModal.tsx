import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  AlertTriangle,
  FileCheck,
  Terminal,
  Activity,
  CheckCircle2,
  RefreshCw,
  Code,
} from 'lucide-react';
import { SecurityAuditLog, AuditSeverity } from '../types';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SecurityAuditLog[];
  onRefreshLogs: () => Promise<void>;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  isOpen,
  onClose,
  logs,
  onRefreshLogs,
}) => {
  if (!isOpen) return null;

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [testPayload, setTestPayload] = useState<string>('{"event":"social_clip_publish","clipId":"clip_01"}');
  const [testSecret, setTestSecret] = useState<string>('secret_production_key_2026');
  const [testSignature, setTestSignature] = useState<string | null>(null);

  const filteredLogs = logs.filter((l) => {
    if (severityFilter === 'ALL') return true;
    return l.severity === severityFilter;
  });

  const handleGenerateTestHmac = async () => {
    try {
      const res = await fetch('/api/security/test-hmac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: testPayload, customSecret: testSecret }),
      });
      const data = await res.json();
      setTestSignature(data.signature);
    } catch (err) {
      console.error('Failed to generate test HMAC:', err);
    }
  };

  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-800';
      case 'WARNING':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'SUCCESS':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                Pusat Keamanan &amp; Audit Log Enterprise
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Arsitektur keamanan berlapis: Proteksi SSRF, Penandatanganan HMAC-SHA256, &amp; Isolasi Kunci Rahasia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshLogs}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors text-xs"
              title="Perbarui Log"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Architecture Pillars Overview */}
        <div className="p-5 sm:p-6 bg-slate-950/50 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Pillar 1: SSRF Shield */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>SSRF Defense</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Blokir host privat (127.0.0.1, 10.x, 169.254.169.254 metadata AWS/GCP).
            </p>
            <div className="text-[10px] text-emerald-500 font-semibold font-mono">STATUS: AKTIF</div>
          </div>

          {/* Pillar 2: Server-Side Vault */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Secret Vault</span>
            </div>
            <p className="text-[11px] text-slate-400">
              GEMINI_API_KEY &amp; token sosial tidak pernah terekspos ke bundle browser.
            </p>
            <div className="text-[10px] text-blue-400 font-semibold font-mono">STATUS: ISOLATED</div>
          </div>

          {/* Pillar 3: HMAC-SHA256 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <FileCheck className="w-4 h-4" />
              <span>HMAC Signer</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Verifikasi integritas payload webhook otomatis dengan header X-Signature-SHA256.
            </p>
            <div className="text-[10px] text-amber-400 font-semibold font-mono">STATUS: VERIFIED</div>
          </div>

          {/* Pillar 4: Rate Limiter */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Activity className="w-4 h-4" />
              <span>Rate Limiter</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mencegah abuse serangan DoS / quota exhaustion (maks 30 req/menit).
            </p>
            <div className="text-[10px] text-purple-400 font-semibold font-mono">STATUS: MONITORING</div>
          </div>
        </div>

        {/* Content Tabs: Audit Logs & HMAC Tool */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Logs Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Security Audit Log Trail ({filteredLogs.length} Events)</span>
              </h4>

              {/* Severity Filter */}
              <div className="flex items-center gap-1 text-xs">
                {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'CRITICAL'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      severityFilter === sev
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 font-mono text-[11px] max-h-56 overflow-y-auto space-y-1">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start sm:items-center gap-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${getSeverityBadge(
                        log.severity
                      )}`}
                    >
                      {log.severity}
                    </span>
                    <span className="text-slate-300 font-semibold">{log.eventType}</span>
                    <span className="text-slate-400 line-clamp-1">{log.details}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-shrink-0">
                    <span>IP: {log.ipMasked}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive HMAC-SHA256 Signature Playground */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>Pengujian Kriptografis HMAC-SHA256 (Webhook Signature Tester)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Gunakan alat ini untuk menguji bagaimana webhook publisher menandatangani payload JSON secara matematis sehingga server bot Anda (Zapier/n8n/Custom Server) dapat memverifikasinya.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Test Payload (JSON):</label>
                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Shared Secret Key:</label>
                <input
                  type="text"
                  value={testSecret}
                  onChange={(e) => setTestSecret(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500 mb-2"
                />
                <button
                  type="button"
                  onClick={handleGenerateTestHmac}
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                >
                  Hitung Tanda Tangan Kripto
                </button>
              </div>
            </div>

            {testSignature && (
              <div className="p-2.5 bg-slate-900 border border-amber-500/30 rounded-lg font-mono text-[11px] text-amber-300 break-all">
                <span className="font-bold text-white">Generated Signature: </span>
                {testSignature}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
