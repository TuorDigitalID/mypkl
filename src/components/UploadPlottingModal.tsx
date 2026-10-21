import React, { useState, useRef } from 'react';
import {
  Compass,
  FileSpreadsheet,
  UploadCloud,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  MapPin,
  Check,
  AlertTriangle,
  Users,
  Copy,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { PlottingSiswaPKL } from '../types/index.ts';
import {
  parsePlottingExcelBuffer,
  downloadPlottingExcelTemplate,
  ParsePlottingResult,
} from '../utils/plottingExcelParser.ts';
import { insertPlottingBatch, getSupabaseConfig } from '../lib/supabase.ts';
import { getStatusPlottingBadgeConfig } from '../utils/plottingUtils.ts';
import { generatePlottingSQLScript } from '../utils/scoring.ts';

interface UploadPlottingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number, message?: string) => void;
  existingPlottingList?: PlottingSiswaPKL[];
  onOpenSupabaseModal?: () => void;
}

export const UploadPlottingModal: React.FC<UploadPlottingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingPlottingList = [],
  onOpenSupabaseModal,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParsePlottingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'warning' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [copiedPlottingSQL, setCopiedPlottingSQL] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = getSupabaseConfig();

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(generatePlottingSQLScript());
      setCopiedPlottingSQL(true);
      setTimeout(() => setCopiedPlottingSQL(false), 2500);
    } catch {
      // fallback
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
          const result = parsePlottingExcelBuffer(buffer);
          setParseResult(result);
        }
      } catch (err: any) {
        setParseResult({
          validPlotting: [],
          errors: [{ row: 1, message: `Gagal membaca file: ${err.message || 'Format tidak valid.'}` }],
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setParseResult({
        validPlotting: [],
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
    if (!parseResult || parseResult.validPlotting.length === 0) return;
    setIsSaving(true);
    setImportStatus({ type: null, message: '' });

    try {
      const result = await insertPlottingBatch(parseResult.validPlotting);
      if (result.success) {
        if (result.savedToDatabase || !config.isConnected) {
          onSuccess(result.count, result.message);
          onClose();
        } else {
          // Terhubung ke Supabase namun database server belum memiliki tabel plotting_siswa_pkl
          onSuccess(result.count, `Tersimpan di browser lokal (${result.count} data). Perlu buat tabel di Supabase.`);
          setImportStatus({
            type: 'warning',
            message: result.message || 'Tersimpan di penyimpanan lokal, namun gagal masuk ke database Supabase Cloud karena tabel plotting_siswa_pkl belum dibuat di database Anda.',
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

  // Hitung siswa terupdate vs baru berdasarkan NISN
  const existingNisnSet = new Set(
    existingPlottingList.map((p) => p.nisn.replace(/\s+/g, ''))
  );
  const updatedCount = (parseResult?.validPlotting || []).filter((item) =>
    existingNisnSet.has(item.nisn.replace(/\s+/g, ''))
  ).length;
  const newCount = (parseResult?.validPlotting || []).length - updatedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal with Luxury Orange Gradient */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white flex items-center justify-between flex-shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md border border-white/20">
              <Compass className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">Upload & Import Data Plotting Siswa PKL</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  Excel / CSV
                </span>
              </div>
              <p className="text-xs text-orange-100/90 mt-0.5">
                Impor data relasi penempatan siswa, instansi DUDI, guru pembimbing, periode, dan status plotting
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
                    {importStatus.type === 'error' ? 'Kendala Import:' : importStatus.type === 'warning' ? 'Perhatian: Tabel Database Supabase Perlu Dibuat' : 'Sukses:'}
                  </span>
                  <span>{importStatus.message}</span>
                </div>

                {importStatus.type === 'warning' && (
                  <div className="pt-2 border-t border-amber-200 space-y-2">
                    <p className="text-[11px] font-semibold text-amber-900">
                      Jalankan skrip SQL berikut di <b>Supabase Dashboard &gt; SQL Editor &gt; New Query</b> agar tabel <code>plotting_siswa_pkl</code> dibuat otomatis:
                    </p>
                    <div className="relative">
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono max-h-32 overflow-y-auto leading-relaxed">
                        {generatePlottingSQLScript()}
                      </pre>
                      <button
                        type="button"
                        onClick={handleCopySQL}
                        className="absolute top-2 right-2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        {copiedPlottingSQL ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPlottingSQL ? 'Tersalin!' : 'Salin SQL'}</span>
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
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
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
          <div className="p-4 bg-gradient-to-r from-teal-50/80 to-emerald-50/60 rounded-xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block text-sm">Unduh Format Resmi Excel Plotting</span>
                <span className="text-slate-600">
                  Gunakan template siap pakai dengan header: <b>NISN, Nama Siswa, Kelas, Jurusan, Instansi PKL, Alamat, Guru Pembimbing, NIP, Periode Mulai/Selesai, Status Plotting</b>.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadPlottingExcelTemplate}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-teal-50 text-teal-800 font-bold rounded-xl border border-teal-300 shadow-xs transition-all hover:border-teal-400 whitespace-nowrap flex-shrink-0"
            >
              <Download className="w-4 h-4 text-teal-600" />
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
                  ? 'border-teal-600 bg-teal-50/60 scale-[1.01]' 
                  : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-teal-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Tarik & Lepaskan File Excel atau CSV di Sini
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mendukung format Microsoft Excel (<b>.xlsx, .xls</b>) atau file teks <b>.csv</b>
                </p>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-xs shadow-xs hover:bg-slate-50 transition-colors"
              >
                Pilih File dari Komputer
              </button>
            </div>
          ) : (
            /* Card File yang Dipilih */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull; Selesai dibaca
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Ganti File</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetFile}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Batalkan file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}

          {/* Loader Processing */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-8 text-teal-700">
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold">Memeriksa struktur baris & relasi plotting...</span>
            </div>
          )}

          {/* Hasil Parse & Pratinjau Data */}
          {parseResult && !isProcessing && (
            <div className="space-y-4">
              
              {/* Stat Ringkasan Pembacaan */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block font-medium">Total Baris</span>
                  <span className="text-lg font-black text-slate-800">
                    {parseResult.validPlotting.length + parseResult.errors.length}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[11px] text-emerald-700 block font-medium">Siap Diimpor</span>
                  <span className="text-lg font-black text-emerald-700">
                    {parseResult.validPlotting.length}
                  </span>
                </div>
                <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 text-center">
                  <span className="text-[11px] text-teal-700 block font-medium">Baru / Update</span>
                  <span className="text-sm font-bold text-teal-900 mt-1 block">
                    {newCount} baru &bull; {updatedCount} update
                  </span>
                </div>
                <div className={`p-3 rounded-xl border text-center ${
                  parseResult.errors.length > 0
                    ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <span className="text-[11px] block font-medium">Kendala Format</span>
                  <span className={`text-lg font-black ${parseResult.errors.length > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                    {parseResult.errors.length}
                  </span>
                </div>
              </div>

              {/* Daftar Error jika ada */}
              {parseResult.errors.length > 0 && (
                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Perhatian: Ditemukan {parseResult.errors.length} baris tidak valid (dilewati saat import):</span>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pl-6 text-amber-800">
                    {parseResult.errors.map((err, idx) => (
                      <div key={idx} className="list-disc">
                        Baris {err.row}: {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabel Pratinjau Data */}
              {parseResult.validPlotting.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <span>Pratinjau Data Plotting ({parseResult.validPlotting.length} Siswa)</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        (Otomatis sinkron ke Master Siswa, DUDI & Guru)
                      </span>
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Siswa</th>
                          <th className="px-3 py-2.5">Instansi PKL (DUDI)</th>
                          <th className="px-3 py-2.5">Guru Pembimbing</th>
                          <th className="px-3 py-2.5">Periode PKL</th>
                          <th className="px-3 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {parseResult.validPlotting.map((item, idx) => {
                          const badge = getStatusPlottingBadgeConfig(item.statusPlotting);
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-2 font-medium">
                                <div className="font-bold text-slate-900">{item.namaSiswa}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  NISN: {item.nisn} &bull; {item.kelas}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                {item.instansiNama ? (
                                  <div>
                                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                      <span>{item.instansiNama}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate max-w-xs" title={item.alamatInstansi}>
                                      {item.alamatInstansi || 'Alamat belum diatur'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Belum ditentukan</span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {item.guruNama ? (
                                  <div>
                                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                      <GraduationCap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                                      <span>{item.guruNama}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono">
                                      NIP: {item.guruNip || '-'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Belum ditentukan</span>
                                )}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-[11px] text-slate-600">
                                <div>{item.periodeMulai} s.d.</div>
                                <div>{item.periodeSelesai}</div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`}></span>
                                  {badge.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Database Banner Integration */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${config.isConnected ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
              <span>
                Target Penyimpanan: <b>{config.isConnected ? 'Supabase Cloud Database & LocalStorage' : 'Penyimpanan Lokal Browser (Offline Mode)'}</b>
              </span>
            </div>
            {!config.isConnected && onOpenSupabaseModal && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="text-teal-700 hover:text-teal-900 font-semibold underline text-[11px]"
              >
                Hubungkan Supabase
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
          >
            Batal
          </button>
          
          <div className="flex items-center gap-2.5">
            {parseResult && parseResult.validPlotting.length > 0 && (
              <button
                type="button"
                onClick={handleImportData}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menyimpan ke Sistem...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan & Import {parseResult.validPlotting.length} Data Plotting</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
