import React from 'react';
import { 
  GraduationCap, 
  Database, 
  Radio, 
  Users, 
  ClipboardCheck, 
  FileSpreadsheet, 
  BookOpen, 
  CheckCircle2,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Penguji, SupabaseConfig } from '../types/index.ts';
import { DAFTAR_PENGUJI } from '../data/penguji.ts';

interface HeaderProps {
  activeTab: 'live' | 'master' | 'jurusan' | 'peserta' | 'rekap' | 'rubrik';
  setActiveTab: (tab: 'live' | 'master' | 'jurusan' | 'peserta' | 'rekap' | 'rubrik') => void;
  activePenguji: Penguji;
  setActivePenguji: (penguji: Penguji) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activePenguji,
  setActivePenguji,
  supabaseConfig,
  onOpenSupabaseModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-teal-900 to-emerald-700 bg-clip-text text-transparent">
                  My PKL
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Sidang Real-Time
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Sistem Penilaian Sidang Praktik Kerja Lapangan
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'live'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              <span>Ruang Sidang Live</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('master')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'master'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Master Siswa PKL</span>
            </button>

            <button
              onClick={() => setActiveTab('jurusan')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'jurusan'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Master Jurusan</span>
            </button>

            <button
              onClick={() => setActiveTab('peserta')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'peserta'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Jadwal Sidang</span>
            </button>

            <button
              onClick={() => setActiveTab('rekap')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'rekap'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Rekap & Berita Acara</span>
            </button>

            <button
              onClick={() => setActiveTab('rubrik')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'rubrik'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Rubrik Penilaian</span>
            </button>
          </nav>

          {/* Right Controls: Examiner Switcher & Supabase Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Connection Pill */}
            <button
              onClick={onOpenSupabaseModal}
              title="Konfigurasi Database Supabase & Salin Schema SQL"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${supabaseConfig.isConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span className="hidden sm:inline font-mono">
                {supabaseConfig.isConnected ? 'Supabase: Terhubung' : 'Supabase: Siap Setup'}
              </span>
              <span className="sm:hidden font-mono">Supabase</span>
              {supabaseConfig.isConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </button>

            {/* Active Examiner Switcher */}
            <div className="relative group">
              <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
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
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              activeTab === 'live' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Sidang</span>
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              activeTab === 'master' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Siswa</span>
          </button>
          <button
            onClick={() => setActiveTab('jurusan')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              activeTab === 'jurusan' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Jurusan</span>
          </button>
          <button
            onClick={() => setActiveTab('peserta')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              activeTab === 'peserta' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Jadwal</span>
          </button>
          <button
            onClick={() => setActiveTab('rekap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              activeTab === 'rekap' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rekap</span>
          </button>
          <button
            onClick={() => setActiveTab('rubrik')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              activeTab === 'rubrik' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rubrik</span>
          </button>
        </div>
      </div>
    </header>
  );
};
