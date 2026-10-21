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
import { Penguji, SupabaseConfig } from '../types/index.ts';

interface SidebarProps {
  activeTab: 'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik';
  setActiveTab: (tab: 'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik') => void;
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
  onOpenUploadSiswa,
  onOpenUploadInstansi,
  onOpenUploadGuru,
  onOpenUploadPlotting,
  onOpenPusatUpload,
}) => {
  // Collapsible state for Master Data group & Sidang group
  const [isSidangGroupOpen, setIsSidangGroupOpen] = useState(true);
  const [isMasterGroupOpen, setIsMasterGroupOpen] = useState(true);
  const [isLaporanGroupOpen, setIsLaporanGroupOpen] = useState(true);

  const handleSelectTab = (tab: 'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik') => {
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

  const isMasterActive = activeTab === 'master' || activeTab === 'jurusan' || activeTab === 'instansi' || activeTab === 'guru' || activeTab === 'plotting';
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

      {/* Sidebar Container with Elegant Luxury Tone */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-orange-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Sidebar Brand Header with Luxury Orange Gradient */}
        <div className="h-16 sm:h-20 px-5 border-b border-orange-100/90 flex items-center justify-between bg-gradient-to-r from-orange-50/40 via-amber-50/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 ring-2 ring-amber-400/30 flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900">
                  My PKL
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-orange-100 to-amber-100 text-orange-900 border border-orange-200 uppercase tracking-wider">
                  Vokasi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Sistem Sidang & Plotting
              </p>
            </div>
          </div>

          {/* Close button for Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-orange-50 transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 text-xs">

          {/* SECTION: PUSAT UPLOAD EXCEL / CSV (DIRECT BUTTONS, NOT IN SUBMENU) */}
          <div className="space-y-1.5">
            <div className="px-2 flex items-center justify-between text-[11px] font-black text-orange-950 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-orange-600" />
                <span>Pusat Upload (Excel/CSV)</span>
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-orange-100 text-orange-900 border border-orange-200">
                Direct
              </span>
            </div>

            <div className="bg-gradient-to-br from-orange-50/80 via-amber-50/60 to-orange-50/30 p-2 rounded-2xl border border-orange-200/90 shadow-2xs space-y-1">
              {/* Direct Button 1: Upload Plotting PKL */}
              <button
                onClick={handleTriggerUploadPlotting}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-800 hover:text-orange-950 hover:bg-white bg-white/60 border border-orange-100 hover:border-orange-300 shadow-2xs transition-all cursor-pointer group"
                title="Buka form upload file Excel / CSV data Plotting & Penempatan Siswa"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center flex-shrink-0">
                    <Compass className="w-3 h-3" />
                  </div>
                  <span className="truncate">Upload Plotting PKL</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-orange-100 text-orange-800 group-hover:bg-orange-200">
                  Excel
                </span>
              </button>

              {/* Direct Button 2: Upload Guru Pembimbing */}
              <button
                onClick={handleTriggerUploadGuru}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-800 hover:text-orange-950 hover:bg-white bg-white/60 border border-orange-100 hover:border-orange-300 shadow-2xs transition-all cursor-pointer group"
                title="Buka form upload file Excel / CSV data Master Guru Pembimbing"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-3 h-3" />
                  </div>
                  <span className="truncate">Upload Guru Pembimbing</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-amber-100 text-amber-800 group-hover:bg-amber-200">
                  Excel
                </span>
              </button>

              {/* Direct Button 3: Upload Data Instansi */}
              <button
                onClick={handleTriggerUploadInstansi}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-800 hover:text-orange-950 hover:bg-white bg-white/60 border border-orange-100 hover:border-orange-300 shadow-2xs transition-all cursor-pointer group"
                title="Buka form upload file Excel / CSV data Master Instansi Mitra DUDI"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-3 h-3" />
                  </div>
                  <span className="truncate">Upload Data Instansi</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-orange-100 text-orange-800 group-hover:bg-orange-200">
                  Excel
                </span>
              </button>

              {/* Direct Button 4: Upload Siswa PKL */}
              <button
                onClick={handleTriggerUploadSiswa}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-800 hover:text-orange-950 hover:bg-white bg-white/60 border border-orange-100 hover:border-orange-300 shadow-2xs transition-all cursor-pointer group"
                title="Buka form upload file Excel / CSV data Master Siswa PKL"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center flex-shrink-0">
                    <Users className="w-3 h-3" />
                  </div>
                  <span className="truncate">Upload Siswa PKL</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-amber-100 text-amber-800 group-hover:bg-amber-200">
                  Excel
                </span>
              </button>

              {/* Hub Modal Trigger */}
              <button
                onClick={handleTriggerPusatUpload}
                className="w-full mt-1 pt-1.5 border-t border-orange-200/60 flex items-center justify-center gap-1.5 py-1 text-[11px] font-black text-orange-800 hover:text-orange-950 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span>Pusat Template & Panduan</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* GROUP 1: SIDANG & EVALUASI */}
          <div className="space-y-1">
            <button
              onClick={() => setIsSidangGroupOpen(!isSidangGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>Pelaksanaan Sidang</span>
                {isSidangActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
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
                {/* Ruang Sidang Live */}
                <button
                  onClick={() => handleSelectTab('live')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'live'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/20 text-orange-950 border-l-4 border-orange-500 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck className={`w-4 h-4 ${activeTab === 'live' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>Ruang Sidang Live</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>LIVE</span>
                  </span>
                </button>

                {/* Jadwal & Antrean */}
                <button
                  onClick={() => handleSelectTab('peserta')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'peserta'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/20 text-orange-950 border-l-4 border-orange-500 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarCheck className={`w-4 h-4 ${activeTab === 'peserta' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>Jadwal & Antrean</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {pesertaCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* GROUP 2: DATA MASTER (CLEAN MENU, NO INDENTED UPLOAD SUBMENUS) */}
          <div className="space-y-1">
            <button
              onClick={() => setIsMasterGroupOpen(!isMasterGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5" />
                <span>Manajemen Master</span>
                {isMasterActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                )}
              </span>
              {isMasterGroupOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isMasterGroupOpen && (
              <div className="space-y-1 pt-0.5">
                {/* 1. Plotting Siswa PKL */}
                <button
                  onClick={() => handleSelectTab('plotting')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'plotting'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/20 text-orange-950 border-l-4 border-orange-500 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className={`w-4 h-4 ${activeTab === 'plotting' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>Plotting Siswa PKL</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'plotting' ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {plottingCount}
                  </span>
                </button>

                {/* 2. Master Guru Pembimbing */}
                <button
                  onClick={() => handleSelectTab('guru')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'guru'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/20 text-orange-950 border-l-4 border-orange-500 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className={`w-4 h-4 ${activeTab === 'guru' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>Master Guru Pembimbing</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'guru' ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {guruCount}
                  </span>
                </button>

                {/* 3. Master Instansi / Perusahaan */}
                <button
                  onClick={() => handleSelectTab('instansi')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'instansi'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/20 text-orange-950 border-l-4 border-orange-500 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className={`w-4 h-4 ${activeTab === 'instansi' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>Master Instansi (DUDI)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'instansi' ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {instansiCount}
                  </span>
                </button>

                {/* 4. Master Siswa PKL */}
                <button
                  onClick={() => handleSelectTab('master')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'master'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/20 text-orange-950 border-l-4 border-orange-500 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`w-4 h-4 ${activeTab === 'master' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>Master Siswa PKL</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'master' ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {siswaCount}
                  </span>
                </button>

                {/* 5. Master Jurusan */}
                <button
                  onClick={() => handleSelectTab('jurusan')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'jurusan'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/20 text-orange-950 border-l-4 border-orange-500 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className={`w-4 h-4 ${activeTab === 'jurusan' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>Master Jurusan</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'jurusan' ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-slate-100 text-slate-600'
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
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>Laporan & Dokumen</span>
                {isLaporanActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
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
                {/* Rekap & Berita Acara */}
                <button
                  onClick={() => handleSelectTab('rekap')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'rekap'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/20 text-orange-950 border-l-4 border-orange-500 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'rekap' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>Rekap & Berita Acara</span>
                  </div>
                </button>

                {/* Rubrik Penilaian */}
                <button
                  onClick={() => handleSelectTab('rubrik')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === 'rubrik'
                      ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/20 text-orange-950 border-l-4 border-orange-500 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-orange-50/50 hover:text-orange-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className={`w-4 h-4 ${activeTab === 'rubrik' ? 'text-orange-600' : 'text-slate-400'}`} />
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold border transition-all cursor-pointer ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50/80 border-amber-300 text-amber-900 hover:bg-amber-100'
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

        {/* Sidebar Footer: Active Examiner Card with Luxury Orange Accent */}
        <div className="p-3.5 border-t border-orange-100 bg-gradient-to-b from-white to-orange-50/30">
          <div className="bg-white rounded-xl border border-orange-100 p-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xs shadow-orange-500/20 flex-shrink-0">
                {activePenguji.peran.includes('1') ? 'P1' : activePenguji.peran.includes('2') ? 'P2' : 'P3'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {activePenguji.nama}
                </p>
                <p className="text-[10px] text-orange-600 font-bold truncate mt-0.5">
                  {activePenguji.peran}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
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
