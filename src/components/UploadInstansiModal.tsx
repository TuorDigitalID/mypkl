import React, { useState, useRef } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  RefreshCw, 
  ArrowRight,
  Database,
  MapPin,
  Users,
  Briefcase,
  Phone,
  Mail,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { MasterInstansi } from '../types/index.ts';
import { 
  parseInstansiExcelBuffer, 
  downloadInstansiExcelTemplate, 
  ParseInstansiResult 
} from '../utils/instansiExcelParser.ts';
import { insertMasterInstansiBatch, getSupabaseConfig } from '../lib/supabase.ts';
import { generateInstansiSQLScript } from '../utils/scoring.ts';

interface UploadInstansiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number, message?: string) => void;
  existingInstansiList?: MasterInstansi[];
  onOpenSupabaseModal?: () => void;
}

export const UploadInstansiModal: React.FC<UploadInstansiModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingInstansiList = [],
  onOpenSupabaseModal,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseInstansiResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'warning' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [copiedSQL, setCopiedSQL] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = getSupabaseConfig();

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(generateInstansiSQLScript());
      setCopiedSQL(true);
      setTimeout(() => setCopiedSQL(false), 2500);
    } catch {
      // ignore
    }
  };

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

  const handleFileChange = (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setIsProcessing(true);
    setImportStatus({ type: null, message: '' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (buffer) {
          const result = parseInstansiExcelBuffer(buffer);
          setParseResult(result);
        }
      } catch (err: any) {
        setParseResult({
          validInstansi: [],
          errors: [{ row: 1, message: `Gagal membaca file: ${err.message || 'Format tidak valid.'}` }],
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setParseResult({
        validInstansi: [],
        errors: [{ row: 1, message: 'Terjadi kendala saat membaca file dari komputer.' }],
      });
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setParseResult(null);
    setImportStatus({ type: null, message: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportData = async () => {
    if (!parseResult || parseResult.validInstansi.length === 0) return;
    setIsSaving(true);
    setImportStatus({ type: null, message: '' });

    try {
      const result = await insertMasterInstansiBatch(parseResult.validInstansi);
      if (result.success) {
        if (result.savedToDatabase || !config.isConnected) {
          onSuccess(result.count, result.message);
          onClose();
        } else {
          onSuccess(result.count, `Tersimpan di browser lokal (${result.count} data). Perlu update query Supabase.`);
          setImportStatus({
            type: 'warning',
            message: result.message || 'Tersimpan di penyimpanan lokal, namun gagal masuk ke database Supabase Cloud karena tabel belum sesuai.',
          });
        }
      } else {
        setImportStatus({
          type: 'error',
          message: result.message,
        });
      }
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Gagal menyimpan ke sistem: ${err?.message || 'Terjadi kesalahan sistem.'}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Hitung berapa instansi yang sebelumnya sudah ada (akan di-update)
  const existingNamesSet = new Set(
    existingInstansiList.map((i) => i.nama.toLowerCase().trim())
  );
  const updatedCount = (parseResult?.validInstansi || []).filter((item) =>
    existingNamesSet.has(item.nama.toLowerCase().trim())
  ).length;
  const newCount = (parseResult?.validInstansi || []).length - updatedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal with Luxury Orange Gradient */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white flex items-center justify-between flex-shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md border border-white/20">
              <Building2 className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">Upload Master Data Instansi / Perusahaan</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  Excel / CSV
                </span>
              </div>
              <p className="text-xs text-orange-100/90 mt-0.5">
                Impor massal mitra DUDI, kuota siswa, alamat lengkap, dan pembimbing via Excel/CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal upload"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Status Alert Banner */}
          {importStatus.type && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
              importStatus.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : importStatus.type === 'warning'
                ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {importStatus.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : importStatus.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <div>
                  <span className="font-bold block mb-0.5 text-sm">
                    {importStatus.type === 'error' ? 'Kendala Import:' : importStatus.type === 'warning' ? 'Perhatian: Tabel Database Perlu Diperbarui' : 'Sukses:'}
                  </span>
                  <span>{importStatus.message}</span>
                </div>

                {importStatus.type === 'warning' && (
                  <div className="pt-2 border-t border-amber-200 space-y-2">
                    <p className="text-[11px] font-semibold text-amber-900">
                      Jalankan skrip query SQL berikut di <b>Supabase Dashboard &gt; SQL Editor &gt; New Query</b> agar tabel <code>master_instansi</code> memiliki constraint UNIQUE dan izin akses yang sesuai:
                    </p>
                    <div className="relative">
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono max-h-32 overflow-y-auto leading-relaxed">
                        {generateInstansiSQLScript()}
                      </pre>
                      <button
                        type="button"
                        onClick={handleCopySQL}
                        className="absolute top-2 right-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        {copiedSQL ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSQL ? 'Tersalin!' : 'Salin SQL'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-900 hover:text-amber-950 font-bold underline text-[11px] flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Supabase SQL Editor</span>
                      </a>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200/90 text-amber-900 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Tutup (Tetap Simpan di Lokal)
                        </button>
                        <button
                          type="button"
                          onClick={handleImportData}
                          disabled={isSaving}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                          <span>Coba Simpan Ulang ke Database</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card Download Template */}
          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block text-sm">Belum memiliki format data?</span>
                <span className="text-slate-600">
                  Unduh template resmi Excel (.xlsx) dengan kolom Nama Instansi, Alamat Lengkap, Kuota Siswa, dan Pembimbing Instansi.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadInstansiExcelTemplate}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-blue-50 text-blue-800 font-bold rounded-xl border border-blue-300 shadow-xs transition-all hover:border-blue-400 whitespace-nowrap flex-shrink-0"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Unduh Template (.xlsx)</span>
            </button>
          </div>

          {/* Area Drag & Drop File */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive 
                  ? 'border-blue-600 bg-blue-50/60 scale-[1.01]' 
                  : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Pilih file Excel atau Drag & Drop ke sini
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV (.csv)
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] px-2.5 py-1 bg-white rounded-md border border-slate-200 text-slate-600 font-semibold shadow-2xs">
                  Kolom Wajib: Nama Instansi, Alamat Lengkap, Kuota Siswa
                </span>
              </div>
            </div>
          ) : (
            /* Selected File Summary Card */
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB • Tipe: {selectedFile.name.split('.').pop()?.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleResetFile}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
                >
                  Ganti File
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-500 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Memproses dan memvalidasi baris Excel...</span>
            </div>
          )}

          {/* Hasil Parsing & Preview */}
          {parseResult && !isProcessing && (
            <div className="space-y-4">
              {/* Summary Stats Badges */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[11px] text-slate-500 font-medium">Total Baris File</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {parseResult.validInstansi.length + parseResult.errors.length}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="block text-[11px] text-emerald-700 font-medium">Valid (Siap Simpan)</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {parseResult.validInstansi.length} Instansi
                  </span>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <span className="block text-[11px] text-red-700 font-medium">Baris Tidak Valid</span>
                  <span className="text-base font-extrabold text-red-700">
                    {parseResult.errors.length} Baris
                  </span>
                </div>
              </div>

              {/* Informative update vs new pill */}
              {parseResult.validInstansi.length > 0 && (
                <div className="flex items-center gap-2 text-[11px] bg-blue-50/80 text-blue-900 border border-blue-200/80 px-3.5 py-2 rounded-xl">
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Rincian: <b>{newCount} Instansi Baru</b> akan ditambahkan, dan <b>{updatedCount} Instansi Sudah Ada</b> akan diperbarui kuota/pembimbingnya.
                  </span>
                </div>
              )}

              {/* Error Warnings Callout */}
              {parseResult.errors.length > 0 && (
                <div className="p-3.5 bg-red-50/90 rounded-xl border border-red-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Daftar Kendala Pada File ({parseResult.errors.length} baris):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-red-700 max-h-32 overflow-y-auto pl-1">
                    {parseResult.errors.map((err, i) => (
                      <li key={i} className="text-[11px]">
                        <span className="font-semibold">Baris {err.row}:</span> {err.message}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-red-600/90 italic pt-1">
                    * Baris yang memiliki kendala akan otomatis dilewati, baris valid tetap dapat diimpor.
                  </p>
                </div>
              )}

              {/* Table Preview of Valid Instansi */}
              {parseResult.validInstansi.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Preview Data Instansi Terverifikasi:</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        (Menampilkan {Math.min(parseResult.validInstansi.length, 5)} dari {parseResult.validInstansi.length} instansi)
                      </span>
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="py-2 px-2.5 text-center w-10">No</th>
                          <th className="py-2 px-3">Nama Instansi / Perusahaan</th>
                          <th className="py-2 px-3">Alamat Lengkap</th>
                          <th className="py-2 px-2 text-center w-20">Kuota</th>
                          <th className="py-2 px-3">Pembimbing Instansi</th>
                          <th className="py-2 px-3">Bidang Usaha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parseResult.validInstansi.slice(0, 10).map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="py-2 px-2.5 text-center font-mono text-slate-400 text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {item.nama}
                            </td>
                            <td className="py-2 px-3 text-slate-600 truncate max-w-[200px]" title={item.alamat}>
                              {item.alamat}
                            </td>
                            <td className="py-2 px-2 text-center font-bold text-blue-700">
                              {item.kuota} Siswa
                            </td>
                            <td className="py-2 px-3 text-slate-700">
                              {item.pembimbingInstansi}
                            </td>
                            <td className="py-2 px-3 text-slate-500">
                              {item.bidangUsaha || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Database Target Info Indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>
                Target Penyimpanan: <b>{config.url ? 'Supabase Cloud (Online Sync)' : 'LocalStorage Browser (Offline)'}</b>
              </span>
            </div>
            {!config.url && onOpenSupabaseModal && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="text-blue-600 font-bold hover:underline"
              >
                Hubungkan Cloud
              </button>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-semibold text-xs transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleImportData}
            disabled={isSaving || !parseResult || parseResult.validInstansi.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer ${
              !parseResult || parseResult.validInstansi.length === 0 || isSaving
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 shadow-orange-500/25 hover:scale-[1.01]'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Sistem...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>
                  Simpan & Import {parseResult?.validInstansi.length || 0} Data Instansi
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
