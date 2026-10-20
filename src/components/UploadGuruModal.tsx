import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  RefreshCw, 
  Database,
  Users,
  Phone,
  Mail,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import { MasterGuruPembimbing } from '../types/index.ts';
import { 
  parseGuruExcelBuffer, 
  downloadGuruExcelTemplate, 
  ParseGuruResult 
} from '../utils/guruExcelParser.ts';
import { insertMasterGuruBatch, getSupabaseConfig } from '../lib/supabase.ts';

interface UploadGuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number, message?: string) => void;
  existingGuruList?: MasterGuruPembimbing[];
  onOpenSupabaseModal?: () => void;
}

export const UploadGuruModal: React.FC<UploadGuruModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingGuruList = [],
  onOpenSupabaseModal,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseGuruResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'warning' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = getSupabaseConfig();

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
          const result = parseGuruExcelBuffer(buffer);
          setParseResult(result);
        }
      } catch (err: any) {
        setParseResult({
          validGuru: [],
          errors: [{ row: 1, message: `Gagal membaca file: ${err.message || 'Format tidak valid.'}` }],
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setParseResult({
        validGuru: [],
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
    if (!parseResult || parseResult.validGuru.length === 0) return;
    setIsSaving(true);
    setImportStatus({ type: null, message: '' });

    try {
      const result = await insertMasterGuruBatch(parseResult.validGuru);
      if (result.success) {
        onSuccess(result.count, result.message);
        onClose();
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

  // Hitung guru baru vs update
  const existingNipSet = new Set(
    existingGuruList.map((g) => g.nip.replace(/\s+/g, ''))
  );
  const updatedCount = (parseResult?.validGuru || []).filter((item) =>
    existingNipSet.has(item.nip.replace(/\s+/g, ''))
  ).length;
  const newCount = (parseResult?.validGuru || []).length - updatedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <GraduationCap className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Upload Master Data Guru Pembimbing PKL</h3>
              <p className="text-xs text-purple-100/90 mt-0.5">
                Impor data NIP/NIK, nama guru, kontak telepon, email login, dan password via file Excel atau CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal upload"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {importStatus.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-bold block mb-0.5">
                  {importStatus.type === 'error' ? 'Kendala Import:' : 'Sukses:'}
                </span>
                <span>{importStatus.message}</span>
              </div>
            </div>
          )}

          {/* Card Download Template */}
          <div className="p-4 bg-gradient-to-r from-purple-50/80 to-indigo-50/60 rounded-xl border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block text-sm">Belum memiliki format data?</span>
                <span className="text-slate-600">
                  Unduh template resmi Excel (.xlsx) dengan kolom NIP / NIK, Nama Guru Pembimbing, Telepon, Email Login, dan Password Login.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadGuruExcelTemplate}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-purple-50 text-purple-800 font-bold rounded-xl border border-purple-300 shadow-xs transition-all hover:border-purple-400 whitespace-nowrap flex-shrink-0"
            >
              <Download className="w-4 h-4 text-purple-600" />
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
                  ? 'border-purple-600 bg-purple-50/60 scale-[1.01]' 
                  : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-purple-400'
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

              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner">
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
                  Kolom Wajib: NIP / NIK dan Nama Guru Pembimbing
                </span>
              </div>
            </div>
          ) : (
            /* Selected File Summary Card */
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0 font-bold">
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
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
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
                    {parseResult.validGuru.length + parseResult.errors.length}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="block text-[11px] text-emerald-700 font-medium">Valid (Siap Simpan)</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {parseResult.validGuru.length} Guru
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
              {parseResult.validGuru.length > 0 && (
                <div className="flex items-center gap-2 text-[11px] bg-purple-50/80 text-purple-900 border border-purple-200/80 px-3.5 py-2 rounded-xl">
                  <GraduationCap className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>
                    Rincian: <b>{newCount} Guru Baru</b> akan ditambahkan, dan <b>{updatedCount} Guru Sudah Ada</b> akan diperbarui kontak/akunnya berdasarkan NIP.
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

              {/* Table Preview of Valid Teachers */}
              {parseResult.validGuru.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Preview Data Guru Pembimbing Terverifikasi:</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        (Menampilkan {Math.min(parseResult.validGuru.length, 5)} dari {parseResult.validGuru.length} guru)
                      </span>
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="py-2 px-2.5 text-center w-10">No</th>
                          <th className="py-2 px-3">NIP / NIK</th>
                          <th className="py-2 px-3">Nama Guru Pembimbing</th>
                          <th className="py-2 px-3">Telepon</th>
                          <th className="py-2 px-3">Email Login</th>
                          <th className="py-2 px-3">Bidang Studi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parseResult.validGuru.slice(0, 10).map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="py-2 px-2.5 text-center font-mono text-slate-400 text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-800 text-[11px]">
                              {item.nip}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {item.nama}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {item.telepon}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                              {item.emailLogin}
                            </td>
                            <td className="py-2 px-3 text-slate-500">
                              {item.bidangStudi || '-'}
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
              <Database className="w-4 h-4 text-purple-600" />
              <span>
                Target Penyimpanan: <b>{config.url ? 'Supabase Cloud (Online Sync)' : 'LocalStorage Browser (Offline)'}</b>
              </span>
            </div>
            {!config.url && onOpenSupabaseModal && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="text-purple-600 font-bold hover:underline"
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
            disabled={isSaving || !parseResult || parseResult.validGuru.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all ${
              !parseResult || parseResult.validGuru.length === 0 || isSaving
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-600/20 hover:scale-[1.01]'
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
                  Import {parseResult?.validGuru.length || 0} Guru Pembimbing
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
