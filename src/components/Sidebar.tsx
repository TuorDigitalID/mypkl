import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  ClipboardCheck, 
  FileSpreadsheet, 
  BookOpen, 
  Layers, 
  CalendarCheck,
  Database, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  X,
  Radio,
  Sparkles,
  ShieldCheck,
  Building2,
  FolderTree
} from 'lucide-react';
import { Penguji, SupabaseConfig, MasterJurusan, MasterSiswaPKL, MahasiswaSidang } from '../types/index.ts';

interface SidebarProps {
  activeTab: 'live' | 'master' | 'jurusan' | 'peserta' | 'rekap' | 'rubrik';
  setActiveTab: (tab: 'live' | 'master' | 'jurusan' | 'peserta' | 'rekap' | 'rubrik') => void;
  isOpen: boolean;
  onClose: () => void;
  activePenguji: Penguji;
  setActivePenguji: (p: Penguji) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  siswaCount: number;
  jurusanCount: number;
  pesertaCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  activePenguji,
  supabaseConfig,
  onOpenSupabaseModal,
  siswaCount,
  jurusanCount,
  pesertaCount,
}) => {
  // Collapsible state for Master Data group (defaults to expanded)
  const [isMasterGroupOpen, setIsMasterGroupOpen] = useState(true);
  const [isSidangGroupOpen, setIsSidangGroupOpen] = useState(true);
  const [isLaporanGroupOpen, setIsLaporanGroupOpen] = useState(true);

  const handleSelectTab = (tab: 'live' | 'master' | 'jurusan' | 'peserta' | 'rekap' | 'rubrik') => {
    setActiveTab(tab);
    onClose();
  };

  const isMasterActive = activeTab === 'master' || activeTab === 'jurusan';
  const isSidangActive = activeTab === 'live' || activeTab === 'peserta';
  const isLaporanActive = activeTab === 'rekap' || activeTab === 'rubrik';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 sm:h-20 px-5 border-b border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/20 flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  My PKL
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Vokasi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Sistem Sidang Real-Time
              </p>
            </div>
          </div>

          {/* Close button for Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 text-xs">
          
          {/* GROUP 1: SIDANG & EVALUASI */}
          <div className="space-y-1">
            <button
              onClick={() => setIsSidangGroupOpen(!isSidangGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>Pelaksanaan Sidang</span>
                {isSidangActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                )}
              </span>
              {isSidangGroupOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isSidangGroupOpen && (
              <div className="space-y-1 pt-0.5">
                {/* Submenu: Ruang Sidang Live */}
                <button
                  onClick={() => handleSelectTab('live')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'live'
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck className={`w-4 h-4 ${activeTab === 'live' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Ruang Sidang Live</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>LIVE</span>
                  </span>
                </button>

                {/* Submenu: Jadwal & Antrean */}
                <button
                  onClick={() => handleSelectTab('peserta')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'peserta'
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarCheck className={`w-4 h-4 ${activeTab === 'peserta' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Jadwal & Antrean</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {pesertaCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 2: DATA MASTER (WITH COLLAPSIBLE SUBMENU) */}
          <div className="space-y-1">
            <button
              onClick={() => setIsMasterGroupOpen(!isMasterGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5" />
                <span>Manajemen Master</span>
                {isMasterActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                )}
              </span>
              {isMasterGroupOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isMasterGroupOpen && (
              <div className="space-y-1 pt-0.5 pl-2 border-l-2 border-slate-100 ml-3">
                {/* Submenu: Master Siswa PKL */}
                <button
                  onClick={() => handleSelectTab('master')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'master'
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`w-4 h-4 ${activeTab === 'master' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Master Siswa PKL</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'master' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {siswaCount}
                  </span>
                </button>

                {/* Submenu: Master Jurusan */}
                <button
                  onClick={() => handleSelectTab('jurusan')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'jurusan'
                      ? 'bg-blue-50 text-blue-800 shadow-xs border border-blue-200/80 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className={`w-4 h-4 ${activeTab === 'jurusan' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>Master Jurusan</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'jurusan' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {jurusanCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 3: LAPORAN & STANDAR NILAI */}
          <div className="space-y-1">
            <button
              onClick={() => setIsLaporanGroupOpen(!isLaporanGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>Laporan & Dokumen</span>
                {isLaporanActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                )}
              </span>
              {isLaporanGroupOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isLaporanGroupOpen && (
              <div className="space-y-1 pt-0.5">
                {/* Submenu: Rekap & Berita Acara */}
                <button
                  onClick={() => handleSelectTab('rekap')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'rekap'
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'rekap' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Rekap & Berita Acara</span>
                  </div>
                </button>

                {/* Submenu: Rubrik Penilaian */}
                <button
                  onClick={() => handleSelectTab('rubrik')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'rubrik'
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className={`w-4 h-4 ${activeTab === 'rubrik' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Rubrik & Bobot Skor</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 4: DATABASE & PENGATURAN */}
          <div className="space-y-1 pt-2">
            <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Integrasi Cloud
            </div>

            <button
              onClick={() => {
                onOpenSupabaseModal();
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold border transition-all ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className={`w-4 h-4 ${supabaseConfig.isConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div className="text-left leading-tight">
                  <p className="font-bold">Database Supabase</p>
                  <p className="text-[10px] opacity-80">
                    {supabaseConfig.isConnected ? 'Server Cloud Terhubung' : 'Siap Setup Schema SQL'}
                  </p>
                </div>
              </div>
              {supabaseConfig.isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
              )}
            </button>
          </div>

        </div>

        {/* Sidebar Footer: Active Examiner Card */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/80">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                {activePenguji.peran.includes('1') ? 'P1' : activePenguji.peran.includes('2') ? 'P2' : 'P3'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {activePenguji.nama}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold truncate mt-0.5">
                  {activePenguji.peran}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Akun Penguji Aktif</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">Pilih di Bar Atas</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
