import React from 'react';
import { 
  Database, 
  Menu, 
  CheckCircle2, 
  ChevronDown, 
  Users, 
  Layers, 
  ClipboardCheck, 
  CalendarCheck,
  FileSpreadsheet, 
  BookOpen
} from 'lucide-react';
import { Penguji, SupabaseConfig } from '../types/index.ts';
import { DAFTAR_PENGUJI } from '../data/penguji.ts';

interface HeaderProps {
  activeTab: 'live' | 'master' | 'jurusan' | 'peserta' | 'rekap' | 'rubrik';
  onToggleSidebar: () => void;
  activePenguji: Penguji;
  setActivePenguji: (penguji: Penguji) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onToggleSidebar,
  activePenguji,
  setActivePenguji,
  supabaseConfig,
  onOpenSupabaseModal,
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      
      {/* Left Area: Mobile Hamburger Button & Breadcrumb Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          title="Buka Menu Navigasi"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs truncate">
            <span className="hidden sm:inline font-medium text-slate-500">{tabInfo.group}</span>
            <span className="hidden sm:inline">/</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 truncate">
              <IconComponent className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{tabInfo.title}</span>
            </span>
            {tabInfo.tag && (
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                {tabInfo.tag}
              </span>
            )}
          </div>
          <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
            {tabInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls: Examiner Switcher & Supabase Status */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Supabase Connection Pill */}
        <button
          onClick={onOpenSupabaseModal}
          title="Konfigurasi Database Supabase & Salin Schema SQL"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            supabaseConfig.isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
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

        {/* Active Examiner Switcher */}
        <div className="relative group">
          <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {activePenguji.peran.includes('1') ? 'P1' : activePenguji.peran.includes('2') ? 'P2' : 'P3'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[140px]">
                {activePenguji.nama}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold leading-none mt-0.5">
                {activePenguji.peran}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          </div>

          {/* Dropdown Menu for Switching Examiner */}
          <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-2 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Ganti Akun Penguji Sidang
            </div>
            {DAFTAR_PENGUJI.map((penguji) => (
              <button
                key={penguji.id}
                onClick={() => setActivePenguji(penguji)}
                className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  activePenguji.id === penguji.id
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <p className="font-medium">{penguji.nama}</p>
                  <p className="text-[10px] text-slate-500 font-normal">{penguji.peran}</p>
                </div>
                {activePenguji.id === penguji.id && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
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
    </header>
  );
};
