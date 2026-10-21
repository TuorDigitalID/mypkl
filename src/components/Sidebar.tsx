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
  Sparkles,
  Building2, 
  FolderTree, 
  Compass,
  UploadCloud,
  ArrowUpRight
} from 'lucide-react';
import { Penguji, SupabaseConfig, AuthUser } from '../types/index.ts';

interface SidebarProps {
  activeTab: 'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik' | 'penguji';
  setActiveTab: (tab: 'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik' | 'penguji') => void;
  isOpen: boolean;
  onClose: () => void;
  activePenguji: Penguji;
  setActivePenguji: (p: Penguji) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  siswaCount: number;
  jurusanCount: number;
  instansiCount: number;
  guruCount: number;
  plottingCount: number;
  pesertaCount: number;
  pengujiCount?: number;
  currentUser?: AuthUser | null;
  onOpenLoginModal?: () => void;
  onOpenUploadSiswa?: () => void;
  onOpenUploadInstansi?: () => void;
  onOpenUploadGuru?: () => void;
  onOpenUploadPlotting?: () => void;
  onOpenPusatUpload?: () => void;
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
  instansiCount,
  guruCount,
  plottingCount,
  pesertaCount,
  pengujiCount = 3,
  currentUser,
  onOpenLoginModal,
  onOpenUploadSiswa,
  onOpenUploadInstansi,
  onOpenUploadGuru,
  onOpenUploadPlotting,
  onOpenPusatUpload,
}) => {
  // Collapsible state for Master Data group, Sidang group, and Upload submenu
  const [isSidangGroupOpen, setIsSidangGroupOpen] = useState(true);
  const [isMasterGroupOpen, setIsMasterGroupOpen] = useState(true);
  const [isLaporanGroupOpen, setIsLaporanGroupOpen] = useState(true);
  // User request: "untuk sub menu Pusat Upload (Excel/CSV), di buat sub menu aja tetapi tidak langsung muncul, muncul ketika di klik"
  const [isUploadGroupOpen, setIsUploadGroupOpen] = useState(false);

  const handleSelectTab = (tab: 'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik' | 'penguji') => {
    setActiveTab(tab);
    onClose();
  };

  const handleTriggerUploadPlotting = () => {
    setActiveTab('plotting');
    if (onOpenUploadPlotting) {
      onOpenUploadPlotting();
    }
    onClose();
  };

  const handleTriggerUploadGuru = () => {
    setActiveTab('guru');
    if (onOpenUploadGuru) {
      onOpenUploadGuru();
    }
    onClose();
  };

  const handleTriggerUploadInstansi = () => {
    setActiveTab('instansi');
    if (onOpenUploadInstansi) {
      onOpenUploadInstansi();
    }
    onClose();
  };

  const handleTriggerUploadSiswa = () => {
    setActiveTab('master');
    if (onOpenUploadSiswa) {
      onOpenUploadSiswa();
    }
    onClose();
  };

  const handleTriggerPusatUpload = () => {
    if (onOpenPusatUpload) {
      onOpenPusatUpload();
    }
    onClose();
  };

  const isMasterActive = activeTab === 'master' || activeTab === 'jurusan' || activeTab === 'instansi' || activeTab === 'guru' || activeTab === 'plotting' || activeTab === 'penguji';
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

      {/* Sidebar Container with Elegant Luxury Tone & High Readability */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Sidebar Brand Header with Luxury Terracotta Gradient */}
        <div className="h-16 sm:h-20 px-5 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-orange-600/25 ring-2 ring-amber-400/40 flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900">
                  My PKL
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-black bg-gradient-to-r from-orange-100 to-amber-100 text-orange-950 border border-orange-300 uppercase tracking-wider">
                  Vokasi
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-none mt-1">
                Sistem Sidang & Plotting
              </p>
            </div>
          </div>

          {/* Close button for Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content (Scrollable with Clear Typography) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 text-sm">

          {/* SECTION: PUSAT UPLOAD EXCEL / CSV (SUB-MENU ACCORDION: COLLAPSED BY DEFAULT, APPEARS ON CLICK) */}
          <div className="space-y-1">
            <button
              onClick={() => setIsUploadGroupOpen(!isUploadGroupOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group border ${
                isUploadGroupOpen
                  ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-orange-300 shadow-2xs font-bold ring-1 ring-orange-200'
                  : 'bg-white hover:bg-orange-50/50 text-slate-800 hover:text-orange-950 border-slate-200/90 hover:border-orange-300 shadow-2xs'
              }`}
              title="Klik untuk membuka/menutup sub menu Pusat Upload Excel & CSV"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isUploadGroupOpen
                    ? 'bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-xs shadow-orange-600/25'
                    : 'bg-orange-100 text-orange-800 group-hover:bg-orange-600 group-hover:text-white'
                }`}>
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block leading-tight text-sm font-bold text-slate-900 group-hover:text-orange-950">
                    Pusat Upload (Excel/CSV)
                  </span>
                  <span className="block text-xs text-slate-600 font-medium leading-none mt-0.5">
                    Impor Data Siswa, Guru & DUDI
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 border border-orange-200">
                  4 Opsi
                </span>
                {isUploadGroupOpen ? (
                  <ChevronDown className="w-4 h-4 text-orange-700 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-transform duration-200" />
                )}
              </div>
            </button>

            {/* Sub-menu Dropdown Items (ONLY APPEARS ON CLICK) */}
            {isUploadGroupOpen && (
              <div className="ml-3 pl-3 border-l-2 border-orange-300 space-y-1.5 pt-1.5 pb-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* 1. Upload Plotting PKL */}
                <button
                  onClick={handleTriggerUploadPlotting}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:text-orange-950 hover:bg-orange-50 border border-slate-200/70 hover:border-orange-300 transition-all cursor-pointer group bg-white shadow-2xs"
                  title="Upload Plotting & Penempatan Siswa PKL (Excel/CSV)"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                    <span className="truncate">Upload Plotting PKL</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-bold bg-orange-100 text-orange-900 group-hover:bg-orange-200">
                    Excel
                  </span>
                </button>

                {/* 2. Upload Guru Pembimbing */}
                <button
                  onClick={handleTriggerUploadGuru}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:text-orange-950 hover:bg-orange-50 border border-slate-200/70 hover:border-orange-300 transition-all cursor-pointer group bg-white shadow-2xs"
                  title="Upload Master Guru Pembimbing PKL (Excel/CSV)"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span className="truncate">Upload Guru Pembimbing</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900 group-hover:bg-amber-200">
                    Excel
                  </span>
                </button>

                {/* 3. Upload Data Instansi */}
                <button
                  onClick={handleTriggerUploadInstansi}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:text-orange-950 hover:bg-orange-50 border border-slate-200/70 hover:border-orange-300 transition-all cursor-pointer group bg-white shadow-2xs"
                  title="Upload Data Instansi / Perusahaan DUDI (Excel/CSV)"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                    <span className="truncate">Upload Data Instansi</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-bold bg-orange-100 text-orange-900 group-hover:bg-orange-200">
                    Excel
                  </span>
                </button>

                {/* 4. Upload Siswa PKL */}
                <button
                  onClick={handleTriggerUploadSiswa}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:text-orange-950 hover:bg-orange-50 border border-slate-200/70 hover:border-orange-300 transition-all cursor-pointer group bg-white shadow-2xs"
                  title="Upload Master Siswa PKL (Excel/CSV)"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span className="truncate">Upload Siswa PKL</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900 group-hover:bg-amber-200">
                    Excel
                  </span>
                </button>

                {/* 5. Pusat Template & Panduan Modal */}
                <button
                  onClick={handleTriggerPusatUpload}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold text-orange-950 bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 border border-orange-300 transition-colors cursor-pointer group shadow-2xs"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-orange-700" />
                    <span>Pusat Template & Unduh</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-orange-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
          
          {/* GROUP 1: SIDANG & EVALUASI */}
          <div className="space-y-1">
            <button
              onClick={() => setIsSidangGroupOpen(!isSidangGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-slate-900 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>Pelaksanaan Sidang</span>
                {isSidangActive && (
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                )}
              </span>
              {isSidangGroupOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {isSidangGroupOpen && (
              <div className="space-y-1 pt-0.5">
                {/* Ruang Sidang Live */}
                <button
                  onClick={() => handleSelectTab('live')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'live'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck className={`w-4 h-4 ${activeTab === 'live' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Ruang Sidang Live</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>LIVE</span>
                  </span>
                </button>

                {/* Jadwal & Antrean */}
                <button
                  onClick={() => handleSelectTab('peserta')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'peserta'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarCheck className={`w-4 h-4 ${activeTab === 'peserta' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Jadwal & Antrean</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    {pesertaCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 2: DATA MASTER */}
          <div className="space-y-1">
            <button
              onClick={() => setIsMasterGroupOpen(!isMasterGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-slate-900 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-slate-500" />
                <span>Manajemen Master</span>
                {isMasterActive && (
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                )}
              </span>
              {isMasterGroupOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {isMasterGroupOpen && (
              <div className="space-y-1 pt-0.5">
                {/* 1. Plotting Siswa PKL */}
                <button
                  onClick={() => handleSelectTab('plotting')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'plotting'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className={`w-4 h-4 ${activeTab === 'plotting' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Plotting Siswa PKL</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'plotting' ? 'bg-orange-100 text-orange-900 border border-orange-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {plottingCount}
                  </span>
                </button>

                {/* 2. Master Guru Pembimbing */}
                <button
                  onClick={() => handleSelectTab('guru')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'guru'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className={`w-4 h-4 ${activeTab === 'guru' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Master Guru Pembimbing</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'guru' ? 'bg-orange-100 text-orange-900 border border-orange-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {guruCount}
                  </span>
                </button>

                {/* 3. Master Instansi / Perusahaan */}
                <button
                  onClick={() => handleSelectTab('instansi')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'instansi'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className={`w-4 h-4 ${activeTab === 'instansi' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Master Instansi (DUDI)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'instansi' ? 'bg-orange-100 text-orange-900 border border-orange-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {instansiCount}
                  </span>
                </button>

                {/* 4. Master Siswa PKL */}
                <button
                  onClick={() => handleSelectTab('master')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'master'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`w-4 h-4 ${activeTab === 'master' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Master Siswa PKL</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'master' ? 'bg-orange-100 text-orange-900 border border-orange-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {siswaCount}
                  </span>
                </button>

                {/* 5. Master Jurusan */}
                <button
                  onClick={() => handleSelectTab('jurusan')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'jurusan'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className={`w-4 h-4 ${activeTab === 'jurusan' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Master Jurusan</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'jurusan' ? 'bg-orange-100 text-orange-900 border border-orange-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {jurusanCount}
                  </span>
                </button>

                {/* 6. Master Penguji Sidang (User Management) */}
                <button
                  onClick={() => handleSelectTab('penguji')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'penguji'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className={`w-4 h-4 ${activeTab === 'penguji' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Master Penguji Sidang</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'penguji' ? 'bg-orange-100 text-orange-900 border border-orange-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {pengujiCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 3: LAPORAN & STANDAR NILAI */}
          <div className="space-y-1">
            <button
              onClick={() => setIsLaporanGroupOpen(!isLaporanGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-slate-900 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>Laporan & Dokumen</span>
                {isLaporanActive && (
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                )}
              </span>
              {isLaporanGroupOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {isLaporanGroupOpen && (
              <div className="space-y-1 pt-0.5">
                {/* Rekap & Berita Acara */}
                <button
                  onClick={() => handleSelectTab('rekap')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'rekap'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'rekap' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Rekap & Berita Acara</span>
                  </div>
                </button>

                {/* Rubrik Penilaian */}
                <button
                  onClick={() => handleSelectTab('rubrik')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'rubrik'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/30 text-orange-950 border-l-4 border-orange-600 font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-orange-50/60 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className={`w-4 h-4 ${activeTab === 'rubrik' ? 'text-orange-700' : 'text-slate-500'}`} />
                    <span>Rubrik & Bobot Skor</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 4: DATABASE & PENGATURAN */}
          <div className="space-y-1 pt-2">
            <div className="px-2.5 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Integrasi Cloud
            </div>

            <button
              onClick={() => {
                onOpenSupabaseModal();
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold border transition-all cursor-pointer ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950 hover:bg-amber-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className={`w-4 h-4 ${supabaseConfig.isConnected ? 'text-emerald-700' : 'text-amber-700'}`} />
                <div className="text-left leading-tight">
                  <p className="font-bold text-xs sm:text-sm">Database Supabase</p>
                  <p className="text-xs opacity-90">
                    {supabaseConfig.isConnected ? 'Server Cloud Terhubung' : 'Siap Setup Schema SQL'}
                  </p>
                </div>
              </div>
              {supabaseConfig.isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse flex-shrink-0"></span>
              )}
            </button>
          </div>

        </div>

        {/* Sidebar Footer: Active Examiner Card with Luxury Terracotta Accent */}
        <div className="p-3.5 border-t border-slate-200/90 bg-gradient-to-b from-white to-orange-50/25">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-center font-black text-sm shadow-xs shadow-orange-600/20 flex-shrink-0">
                {activePenguji.peran.includes('1') ? 'P1' : activePenguji.peran.includes('2') ? 'P2' : 'P3'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                  {activePenguji.nama}
                </p>
                <p className="text-xs text-orange-700 font-bold truncate mt-0.5">
                  {activePenguji.peran}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{currentUser?.role === 'admin' ? 'Administrator' : 'Penguji Aktif'}</span>
              </span>
              {onOpenLoginModal && (
                <button
                  onClick={() => {
                    onOpenLoginModal();
                    onClose();
                  }}
                  className="font-bold text-orange-700 hover:text-orange-950 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Ganti / Login</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
