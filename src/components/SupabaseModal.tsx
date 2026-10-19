import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { SupabaseConfig } from '../types/index.ts';
import { generateSupabaseSQLSchema } from '../utils/scoring.ts';
import { saveSupabaseConfig, testSupabaseConnection } from '../lib/supabase.ts';

interface SupabaseModalProps {
  config: SupabaseConfig;
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  config,
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [copiedSQL, setCopiedSQL] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const sqlSchema = generateSupabaseSQLSchema();

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult({ status: 'testing', message: 'Memeriksa koneksi ke Supabase...' });

    const result = await testSupabaseConnection(url.trim(), anonKey.trim());

    if (result.success) {
      saveSupabaseConfig({
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: true,
      });
      setTestResult({
        status: 'success',
        message: result.message,
      });
      onConfigUpdated();
    } else {
      setTestResult({
        status: 'error',
        message: result.message,
      });
    }
  };

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(sqlSchema);
      setCopiedSQL(true);
      setTimeout(() => setCopiedSQL(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleResetToDemo = () => {
    setUrl('');
    setAnonKey('');
    saveSupabaseConfig({
      url: '',
      anonKey: '',
      isConnected: false,
    });
    setTestResult({
      status: 'idle',
      message: 'Mode Broadcast Lokal / Offline aktif. Data disinkronkan antar-tab peramban.',
    });
    onConfigUpdated();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Konfigurasi Database Supabase & Real-Time
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan project Supabase Anda untuk menyimpan dan menyinkronkan nilai sidang.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'credentials'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Koneksi API Supabase
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Skrip Schema SQL (1-Click)</span>
          </button>
        </div>

        {/* Tab 1: Credentials Form */}
        {activeTab === 'credentials' && (
          <div className="mt-4 space-y-4">
            
            {/* Status indicator */}
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              config.isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {config.isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-bold">
                  {config.isConnected
                    ? 'Terkoneksi ke Database Supabase'
                    : 'Mode Simulasi Real-Time Aktif (BroadcastChannel)'}
                </p>
                <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                  {config.isConnected
                    ? 'Semua nilai sidang dari Penguji 1, 2, dan 3 tersimpan di tabel Supabase dan disiarkan melalui Supabase Realtime WebSocket.'
                    : 'Aplikasi sudah siap dicoba langsung! Anda dapat membuka tab baru untuk melihat sinkronisasi antar-penguji secara otomatis. Masukkan kredensial Supabase Anda di bawah untuk mengaktifkan database online.'}
                </p>
              </div>
            </div>

            {/* Petunjuk Langkah Demi Langkah Menemukan API Key */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cara Cek Supabase Anon Public Key & URL:</span>
                </span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold underline text-[11px] flex items-center gap-1"
                >
                  Buka Supabase Dashboard
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] pl-1 leading-relaxed">
                <li>Buka <strong>supabase.com/dashboard</strong> dan pilih proyek Anda.</li>
                <li>Di sidebar kiri bawah, klik ikon gerigi <strong>Project Settings ⚙️</strong> &gt; pilih menu <strong>Data API</strong> (atau <strong>API</strong>).</li>
                <li>Pada bagian <strong>Project URL</strong>, salin alamat yang berakhiran <code>.supabase.co</code>.</li>
                <li>Pada bagian <strong>Project API Keys</strong>, cari baris bertuliskan <strong>anon (public)</strong> lalu klik tombol <strong>Copy</strong> (string diawali dengan <code>eyJ...</code>).</li>
              </ol>
            </div>

            <form onSubmit={handleTestAndSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzabcdefghijklmnop.supabase.co"
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Project Settings &gt; API &gt; Project URL
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Supabase Anon Public API Key (anon public)
                </label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Project Settings &gt; API &gt; Project API Keys &gt; anon public
                </span>
              </div>

              {testResult.message && (
                <div className={`p-3 rounded-lg text-xs font-medium ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : testResult.status === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {testResult.message}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetToDemo}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Gunakan Mode Default
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={testResult.status === 'testing'}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
                  >
                    {testResult.status === 'testing' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menguji...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Uji & Simpan Koneksi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: SQL Migration Schema */}
        {activeTab === 'sql' && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                Jalankan script ini di <strong>Supabase Dashboard &gt; SQL Editor &gt; New Query</strong>:
              </span>
              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                {copiedSQL ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Semua SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="max-h-80 overflow-y-auto p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed select-all">
                {sqlSchema}
              </pre>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Skrip ini otomatis membuat:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                <li>Tabel <code>peserta_sidang</code> untuk data identitas, jadwal, dan status mahasiswa</li>
                <li>Tabel <code>penguji</code> untuk identitas dewan penguji (Ketua, Sekretaris, Anggota)</li>
                <li>Tabel <code>penilaian_sidang</code> dengan sub-kriteria JSONB & trigger real-time</li>
                <li>Konfigurasi <code>ALTER PUBLICATION supabase_realtime</code> untuk penyiaran data instan</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
