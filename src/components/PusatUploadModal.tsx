import React from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  X, 
  Users, 
  GraduationCap, 
  Building2, 
  Compass, 
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { downloadGuruExcelTemplate } from '../utils/guruExcelParser.ts';
import { downloadInstansiExcelTemplate } from '../utils/instansiExcelParser.ts';
import { downloadPlottingExcelTemplate } from '../utils/plottingExcelParser.ts';
import { downloadExcelTemplate as downloadSiswaExcelTemplate } from '../utils/excelParser.ts';

interface PusatUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUploadSiswa: () => void;
  onOpenUploadPlotting: () => void;
  onOpenUploadGuru: () => void;
  onOpenUploadInstansi: () => void;
  siswaCount: number;
  plottingCount: number;
  guruCount: number;
  instansiCount: number;
}

export const PusatUploadModal: React.FC<PusatUploadModalProps> = ({
  isOpen,
  onClose,
  onOpenUploadSiswa,
  onOpenUploadPlotting,
  onOpenUploadGuru,
  onOpenUploadInstansi,
  siswaCount,
  plottingCount,
  guruCount,
  instansiCount,
}) => {
  if (!isOpen) return null;

  const uploadModules = [
    {
      id: 'plotting',
      title: 'Plotting & Penempatan Siswa PKL',
      badge: 'Penempatan & Mitra',
      description: 'Impor data relasi penempatan siswa magang, instansi DUDI, guru pembimbing, periode waktu, dan status plotting.',
      icon: Compass,
      count: plottingCount,
      countLabel: 'Data Terplotting',
      onOpen: onOpenUploadPlotting,
      onDownloadTemplate: downloadPlottingExcelTemplate,
      templateName: 'Template_Plotting_Siswa_PKL.xlsx',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-orange-50/80',
      borderColor: 'border-orange-200',
    },
    {
      id: 'guru',
      title: 'Master Guru Pembimbing PKL',
      badge: 'Pembimbing Sekolah',
      description: 'Impor data NIP/NIK guru, nama lengkap, nomor WhatsApp/telepon, email login, dan password akun guru pembimbing.',
      icon: GraduationCap,
      count: guruCount,
      countLabel: 'Guru Terdaftar',
      onOpen: onOpenUploadGuru,
      onDownloadTemplate: downloadGuruExcelTemplate,
      templateName: 'Template_Master_Guru_Pembimbing.xlsx',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200',
    },
    {
      id: 'instansi',
      title: 'Master Instansi / Perusahaan (DUDI)',
      badge: 'Mitra DUDI & Kuota',
      description: 'Impor massal mitra industri DUDI, kuota penerimaan siswa, nama pimpinan, pembimbing lapangan, kontak, dan alamat kantor.',
      icon: Building2,
      count: instansiCount,
      countLabel: 'Instansi Mitra',
      onOpen: onOpenUploadInstansi,
      onDownloadTemplate: downloadInstansiExcelTemplate,
      templateName: 'Template_Master_Instansi_DUDI.xlsx',
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-orange-50/80',
      borderColor: 'border-orange-200',
    },
    {
      id: 'siswa',
      title: 'Master Siswa PKL',
      badge: 'Akun & Rombel',
      description: 'Impor massal akun siswa magang, nomor NISN, nama lengkap, kelas, jurusan kompetensi keahlian, dan password login.',
      icon: Users,
      count: siswaCount,
      countLabel: 'Siswa PKL',
      onOpen: onOpenUploadSiswa,
      onDownloadTemplate: downloadSiswaExcelTemplate,
      templateName: 'Template_Master_Siswa_PKL.xlsx',
      color: 'from-orange-600 to-amber-500',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-orange-100 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Luxury Orange Gradient */}
        <div className="relative px-6 py-6 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white flex items-center justify-between flex-shrink-0 shadow-md">
          {/* Subtle decorative glow overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xl tracking-tight text-white">
                  Pusat Upload & Impor Data PKL
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  Excel & CSV
                </span>
              </div>
              <p className="text-xs sm:text-sm text-orange-100/95 mt-1 max-w-xl">
                Pusat impor dan perbarui data master PKL terpadu. Pilih modul di bawah ini atau unduh format template resmi Excel/CSV.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup modal upload"
            className="relative p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-gradient-to-b from-orange-50/20 via-white to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadModules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div 
                  key={mod.id}
                  className={`rounded-2xl border ${mod.borderColor} ${mod.bgColor} p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 group relative`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mod.color} text-white flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-orange-950 transition-colors">
                            {mod.title}
                          </h4>
                          <span className="inline-block text-[10px] font-bold text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded-md mt-0.5">
                            {mod.badge}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800 font-mono">
                          {mod.count}
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {mod.countLabel}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mt-2 mb-4">
                      {mod.description}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-orange-200/60 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => {
                        onClose();
                        mod.onOpen();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer group-hover:scale-[1.01]"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Data</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    <button
                      onClick={mod.onDownloadTemplate}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-orange-900 font-bold text-xs shadow-2xs transition-colors cursor-pointer flex-shrink-0"
                      title={`Unduh ${mod.templateName}`}
                    >
                      <Download className="w-3.5 h-3.5 text-orange-600" />
                      <span className="hidden sm:inline">Template</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Info Note */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div>
                <p className="font-bold">Format Excel (.xlsx) & CSV (.csv) Didukung Penuh</p>
                <p className="text-[11px] text-amber-800/90 mt-0.5">
                  Sistem otomatis mendeteksi header kolom, menormalkan spasi NIP/NISN, serta mencegah data ganda.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Offline-First & Cloud Ready</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            💡 Tips: Anda juga dapat mengklik langsung tombol upload di sidebar kiri maupun di toolbar tabel.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
