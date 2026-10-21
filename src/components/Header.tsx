import React from 'react';
import { 
  Database, 
  Menu, 
  CheckCircle2, 
  ChevronDown, 
  Users, 
  Layers, 
  Building2,
  GraduationCap,
  ClipboardCheck, 
  CalendarCheck, 
  FileSpreadsheet, 
  BookOpen,
  Compass,
  UploadCloud,
  Sparkles
} from 'lucide-react';
import { Penguji, SupabaseConfig } from '../types/index.ts';
import { DAFTAR_PENGUJI } from '../data/penguji.ts';

interface HeaderProps {
  activeTab: 'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik';
  onToggleSidebar: () => void;
  activePenguji: Penguji;
  setActivePenguji: (penguji: Penguji) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  onOpenPusatUpload?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onToggleSidebar,
  activePenguji,
  setActivePenguji,
  supabaseConfig,
  onOpenSupabaseModal,
  onOpenPusatUpload,
}) => {
  // Current Tab details for breadcrumb & header
  const getTabInfo = () => {
    switch (activeTab) {
      case 'live':
        return {
          group: 'Pelaksanaan Sidang',
          title: 'Ruang Sidang Live',
          icon: ClipboardCheck,
          tag: 'Real-Time',
        };
      case 'peserta':
        return {
          group: 'Pelaksanaan Sidang',
          title: 'Jadwal & Antrean Sidang',
          icon: CalendarCheck,
          tag: 'Peserta',
        };
      case 'plotting':
        return {
          group: 'Manajemen Master',
          title: 'Plotting & Penempatan Siswa PKL',
          icon: Compass,
          tag: 'Penempatan & Pembimbing',
        };
      case 'guru':
        return {
          group: 'Manajemen Master',
          title: 'Master Guru Pembimbing PKL',
          icon: GraduationCap,
          tag: 'Pembimbing Sekolah',
        };
      case 'instansi':
        return {
          group: 'Manajemen Master',
          title: 'Master Data Instansi / Perusahaan',
          icon: Building2,
          tag: 'Mitra DUDI & Kuota',
        };
      case 'master':
        return {
          group: 'Manajemen Master',
          title: 'Master Siswa PKL',
          icon: Users,
          tag: 'Akun & Rombel',
        };
      case 'jurusan':
        return {
          group: 'Manajemen Master',
          title: 'Master Jurusan / Prodi',
          icon: Layers,
          tag: 'Program Keahlian',
        };
      case 'rekap':
        return {
          group: 'Laporan & Dokumen',
          title: 'Rekapitulasi Nilai & Berita Acara',
          icon: FileSpreadsheet,
          tag: 'Hasil Kelulusan',
        };
      case 'rubrik':
        return {
          group: 'Laporan & Dokumen',
          title: 'Pedoman Rubrik & Bobot Skor',
          icon: BookOpen,
          tag: 'Standar Nilai',
        };
      default:
        return {
          group: 'Dashboard',
          title: 'My PKL',
          icon: ClipboardCheck,
          tag: '',
        };
    }
  };

  const tabInfo = getTabInfo();
  const IconComponent = tabInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-orange-100 flex flex-col">
      {/* Top Luxury Gradient Hairline */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex-shrink-0" />

      <div className="h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Area: Mobile Hamburger Button & Breadcrumb Title */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl border border-orange-200 text-slate-700 hover:text-orange-950 hover:bg-orange-50 lg:hidden transition-colors cursor-pointer"
            title="Buka Menu Navigasi"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs truncate">
              <span className="hidden sm:inline font-medium text-slate-500">{tabInfo.group}</span>
              <span className="hidden sm:inline text-orange-300">/</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                <IconComponent className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                <span className="truncate">{tabInfo.title}</span>
              </span>
              {tabInfo.tag && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100/80 text-orange-900 border border-orange-200">
                  {tabInfo.tag}
                </span>
              )}
            </div>
            <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
              {tabInfo.title}
            </h1>
          </div>
        </div>

        {/* Right Controls: Quick Upload Hub, Supabase Status & Examiner Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Upload Button (Always Available in Header) */}
          {onOpenPusatUpload && (
            <button
              onClick={onOpenPusatUpload}
              title="Buka Pusat Upload Data & Download Template Excel"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-xs shadow-orange-500/25 border border-orange-400/30 transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pusat Upload</span>
              <span className="sm:hidden">Upload</span>
            </button>
          )}

          {/* Supabase Connection Pill */}
          <button
            onClick={onOpenSupabaseModal}
            title="Konfigurasi Database Supabase & Salin Schema SQL"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              supabaseConfig.isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${supabaseConfig.isConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span className="hidden sm:inline font-mono font-bold">
              {supabaseConfig.isConnected ? 'Supabase: Terhubung' : 'Supabase: Siap Setup'}
            </span>
            <span className="sm:hidden font-mono">DB</span>
            {supabaseConfig.isConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>

          {/* Active Examiner Switcher with Luxury Orange Badge */}
          <div className="relative group">
            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-orange-100 bg-white hover:bg-orange-50/50 cursor-pointer transition-colors shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xs shadow-orange-500/25">
                {activePenguji.peran.includes('1') ? 'P1' : activePenguji.peran.includes('2') ? 'P2' : 'P3'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[140px]">
                  {activePenguji.nama}
                </p>
                <p className="text-[10px] text-orange-600 font-bold leading-none mt-0.5">
                  {activePenguji.peran}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            </div>

            {/* Dropdown Menu for Switching Examiner */}
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-orange-100 p-2 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2 py-1.5 text-[11px] font-black text-orange-950 uppercase tracking-wider">
                Ganti Akun Penguji Sidang
              </div>
              {DAFTAR_PENGUJI.map((penguji) => (
                <button
                  key={penguji.id}
                  onClick={() => setActivePenguji(penguji)}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    activePenguji.id === penguji.id
                      ? 'bg-orange-50 text-orange-950 font-bold border-l-2 border-orange-500'
                      : 'text-slate-700 hover:bg-orange-50/50'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{penguji.nama}</p>
                    <p className="text-[10px] text-slate-500 font-normal">{penguji.peran}</p>
                  </div>
                  {activePenguji.id === penguji.id && (
                    <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  )}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1.5 pt-1.5 px-2">
                <p className="text-[11px] text-slate-400">
                  💡 Buka di 3 tab berbeda untuk simulasi pengujian multi-user!
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
