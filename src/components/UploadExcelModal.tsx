import React, { useState, useRef } from 'react';
import { 
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
  Lock,
  Mail,
  GraduationCap
} from 'lucide-react';
import { MasterSiswaPKL } from '../types/index.ts';
import { parseExcelFileBuffer, downloadExcelTemplate, ParseResult } from '../utils/excelParser.ts';
import { insertMasterSiswaBatch, getSupabaseConfig } from '../lib/supabase.ts';

interface UploadExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number, message?: string) => void;
  onOpenSupabaseModal?: () => void;
}

export const UploadExcelModal: React.FC<UploadExcelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenSupabaseModal,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
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
          const result = parseExcelFileBuffer(buffer);
          setParseResult(result);
        }
      } catch (err: any) {
        setParseResult({
          validSiswa: [],
          errors: [{ row: 1, message: `Gagal membaca file: ${err.message || 'Format tidak valid.'}` }],
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setParseResult({
        validSiswa: [],
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
    if (!parseResult || parseResult.validSiswa.length === 0) return;
    setIsSaving(true);
    setImportStatus({ type: null, message: '' });

    try {
      const result = await insertMasterSiswaBatch(parseResult.validSiswa);
      if (result.savedToDatabase) {
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
        message: `Gagal menyimpan ke database Supabase: ${err?.message || 'Pastikan koneksi Supabase Anda aktif.'}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header with Luxury Orange Gradient */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">
                  Upload Data Master Siswa PKL (Excel / CSV)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  Excel / CSV
                </span>
              </div>
              <p className="text-xs text-orange-100/90 mt-0.5">
                Impor massal akun siswa, NISN, kelas, jurusan, password, dan guru pembimbing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Status Koneksi Database Supabase */}
          <div className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
            config.isConnected
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-start sm:items-center gap-2.5">
              <Database className={`w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0 ${config.isConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <span className="font-bold">
                  {config.isConnected
                    ? 'Database Supabase Terhubung: Data akan LANGSUNG disimpan ke Server Database'
                    : 'Database Supabase Belum Terhubung'}
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {config.isConnected
                    ? 'Data Excel yang diunggah akan langsung dikirim dan disimpan permanen di tabel "master_siswa_pkl".'
                    : 'Aplikasi belum terhubung ke database online Supabase Anda. Hubungkan Supabase agar data tersimpan langsung ke server database.'}
                </p>
              </div>
            </div>
            {!config.isConnected && onOpenSupabaseModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupabaseModal();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap shadow-xs self-start sm:self-auto"
              >
                Hubungkan Supabase
              </button>
            )}
          </div>

          {/* Import status notification banner */}
          {importStatus.message && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : importStatus.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span className="font-medium">{importStatus.message}</span>
            </div>
          )}
          
          {/* Step 1: Download Template Box */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span>Unduh Format Template Excel</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold uppercase">
                  .xlsx
                </span>
              </p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Gunakan template standar dengan susunan kolom: <strong>NISN, Nama Lengkap, Kelas, Jurusan, Email Login, Password Login, Guru Pembimbing</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download Template Excel</span>
            </button>
          </div>

          {/* Step 2: Drag & Drop Zone */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/60'
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
              <UploadCloud className="w-12 h-12 mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-bold text-slate-800">
                Pilih atau Tarik File Excel ke Sini
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung format <strong>.xlsx</strong>, <strong>.xls</strong>, dan <strong>.csv</strong>
              </p>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB • File berhasil dibaca
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetFile}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold"
              >
                Ganti File
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="p-6 text-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              <span>Memproses dan memvalidasi baris data Excel...</span>
            </div>
          )}

          {/* Validation & Errors */}
          {parseResult && parseResult.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Ditemukan {parseResult.errors.length} kendala pada file:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-red-800 text-[11px] max-h-32 overflow-y-auto pl-1">
                {parseResult.errors.map((err, i) => (
                  <li key={i}>
                    Baris {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table of Valid Students */}
          {parseResult && parseResult.validSiswa.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau Data ({parseResult.validSiswa.length} Siswa Siap Diimpor)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Menampilkan sampel baris teratas
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="py-2 px-3 text-center">No</th>
                      <th className="py-2 px-3">NISN</th>
                      <th className="py-2 px-3">Nama Lengkap</th>
                      <th className="py-2 px-2 text-center">Kelas</th>
                      <th className="py-2 px-3">Jurusan</th>
                      <th className="py-2 px-3">Email Login</th>
                      <th className="py-2 px-3">Password</th>
                      <th className="py-2 px-3">Guru Pembimbing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parseResult.validSiswa.slice(0, 8).map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{s.nisn}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{s.namaLengkap}</td>
                        <td className="py-2 px-2 text-center font-bold text-slate-600">{s.kelas}</td>
                        <td className="py-2 px-3 text-slate-700">{s.jurusan}</td>
                        <td className="py-2 px-3 font-mono text-slate-600 truncate max-w-[140px]">{s.emailLogin}</td>
                        <td className="py-2 px-3 font-mono text-slate-800 font-bold">{s.passwordLogin}</td>
                        <td className="py-2 px-3 text-slate-700">{s.guruPembimbing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parseResult.validSiswa.length > 8 && (
                <p className="text-[11px] text-slate-400 text-center italic">
                  + {parseResult.validSiswa.length - 8} siswa lainnya akan turut diimpor ke database.
                </p>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs"
          >
            Batal
          </button>

          {!config.isConnected ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupabaseModal?.();
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all"
              >
                <Database className="w-4 h-4" />
                <span>Hubungkan Database Supabase Terlebih Dahulu</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!parseResult || parseResult.validSiswa.length === 0 || isSaving}
              onClick={handleImportData}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Database Supabase...</span>
                </>
              ) : (
                <>
                  <span>Simpan & Import {parseResult ? parseResult.validSiswa.length : 0} Siswa ke Supabase</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
