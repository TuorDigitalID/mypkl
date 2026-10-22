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
  Sparkles,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserCheck,
  LogIn,
  Settings
} from 'lucide-react';
import { Penguji, SupabaseConfig, AuthUser } from '../types/index.ts';

interface HeaderProps {
  activeTab: 'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik' | 'penguji';
  onToggleSidebar: () => void;
  activePenguji: Penguji;
  setActivePenguji: (penguji: Penguji) => void;
  pengujiList: Penguji[];
  currentUser: AuthUser | null;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  onOpenPusatUpload?: () => void;
  onOpenLoginModal: () => void;
  onNavigateToPenguji: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onToggleSidebar,
  activePenguji,
  setActivePenguji,
  pengujiList,
  currentUser,
  supabaseConfig,
  onOpenSupabaseModal,
  onOpenPusatUpload,
  onOpenLoginModal,
  onNavigateToPenguji,
  onLogout,
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
      case 'penguji':
        return {
          group: 'Manajemen Master',
          title: 'Manajemen Penguji Sidang',
          icon: GraduationCap,
          tag: 'User Management',
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
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex flex-col">
      {/* Top Luxury Gradient Hairline */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 flex-shrink-0" />

      <div className="h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Area: Mobile Hamburger Button & Breadcrumb Title */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-orange-950 hover:bg-orange-50 lg:hidden transition-colors cursor-pointer"
            title="Buka Menu Navigasi"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-slate-500 text-xs truncate">
              <span className="hidden sm:inline font-semibold text-slate-600">{tabInfo.group}</span>
              <span className="hidden sm:inline text-orange-400">/</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                <IconComponent className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="truncate">{tabInfo.title}</span>
              </span>
              {tabInfo.tag && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
                  {tabInfo.tag}
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight truncate mt-0.5">
              {tabInfo.title}
            </h1>
          </div>
        </div>

        {/* Right Controls: Quick Upload Hub, Supabase Status, Login & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Upload Button (Admin Only) */}
          {isAdmin && onOpenPusatUpload && (
            <button
              onClick={onOpenPusatUpload}
              title="Buka Pusat Upload Data & Download Template Excel"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 text-white shadow-xs shadow-orange-600/25 border border-orange-500/30 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Pusat Upload</span>
              <span className="sm:hidden">Upload</span>
            </button>
          )}

          {/* Supabase Connection Pill (Admin Only) */}
          {isAdmin && (
            <button
              onClick={onOpenSupabaseModal}
              title="Konfigurasi Database Supabase & Salin Schema SQL"
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Database className={`w-4 h-4 ${supabaseConfig.isConnected ? 'text-emerald-700' : 'text-amber-700'}`} />
              <span className="font-mono font-bold">
                {supabaseConfig.isConnected ? 'Supabase: Terhubung' : 'Supabase: Siap Setup'}
              </span>
              {supabaseConfig.isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
              )}
            </button>
          )}

          {/* Examiner Notice Badge in Header */}
          {!isAdmin && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Akses Penguji: Input Nilai Sidang</span>
            </div>
          )}

          {/* Direct Logout Button */}
          <button
            onClick={onLogout}
            title="Keluar dari akun (Logout)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-slate-200 hover:border-rose-300 shadow-2xs transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Keluar</span>
          </button>

          {/* User Profile & Examiner Switcher with Luxury Badge */}
          <div className="relative group">
            <div className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-orange-50/40 cursor-pointer transition-colors shadow-2xs">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-xs ${
                isAdmin 
                  ? 'bg-gradient-to-tr from-purple-700 to-indigo-800 shadow-purple-600/25'
                  : 'bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 shadow-orange-600/25'
              }`}>
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                ) : activePenguji.peran.includes('1') ? (
                  'P1'
                ) : activePenguji.peran.includes('2') ? (
                  'P2'
                ) : (
                  'P3'
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none truncate max-w-[140px]">
                  {isAdmin ? currentUser?.nama || 'Administrator' : activePenguji.nama}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[11px] text-orange-700 font-bold leading-none">
                    {isAdmin ? 'Super Admin' : activePenguji.peran}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
            </div>

            {/* Dropdown Menu for User Management & Examiner Switch */}
            <div className="absolute right-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              
              {/* Current Identity Header */}
              <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 mb-2">
                <p className="text-[11px] font-bold text-orange-900 uppercase tracking-wider">
                  Sesi Login Aktif
                </p>
                <p className="text-sm font-black text-slate-900 truncate mt-0.5">
                  {isAdmin ? currentUser?.nama : activePenguji.nama}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {isAdmin ? 'Hak Akses Penuh Sistem Sidang' : `NIP: ${activePenguji.nip}`}
                </p>
              </div>

              {/* Action: Open Examiner Management (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={onNavigateToPenguji}
                  className="w-full text-left p-2 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 font-bold text-slate-700 hover:text-orange-950 hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-orange-600" />
                  <span>Kelola User Penguji Sidang</span>
                </button>
              )}

              {/* Action: Open Login Modal */}
              <button
                onClick={onOpenLoginModal}
                className="w-full text-left p-2 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 font-bold text-slate-700 hover:text-orange-950 hover:bg-orange-50 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-orange-600" />
                <span>Menu Login Keren & Ganti Akun</span>
              </button>

              <div className="px-2 py-1.5 text-xs font-black text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-2">
                Pilih Akun Penguji Sidang
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {pengujiList.map((penguji) => (
                  <button
                    key={penguji.id}
                    onClick={() => setActivePenguji(penguji)}
                    className={`w-full text-left p-2 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                      activePenguji.id === penguji.id
                        ? 'bg-orange-50 text-orange-950 font-bold border-l-4 border-orange-600'
                        : 'text-slate-700 hover:bg-orange-50/60'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <p className="font-bold text-slate-900 truncate">{penguji.nama}</p>
                      <p className="text-xs text-slate-500 font-medium truncate">{penguji.peran}</p>
                    </div>
                    {activePenguji.id === penguji.id && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Logout Option */}
              <div className="border-t border-slate-100 mt-2 pt-1.5 px-1">
                <button
                  onClick={onLogout}
                  className="w-full text-left p-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
