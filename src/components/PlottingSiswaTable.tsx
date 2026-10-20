import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Filter,
  Users,
  Building2,
  GraduationCap,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit3,
  Trash2,
  X,
  Phone,
  Layers,
  ChevronRight,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  PlottingSiswaPKL,
  MasterSiswaPKL,
  MasterInstansi,
  MasterGuruPembimbing,
  StatusPlotting,
} from '../types/index.ts';
import {
  calculatePlottingStats,
  filterPlottingList,
  generatePlottingCSV,
  getStatusPlottingBadgeConfig,
} from '../utils/plottingUtils.ts';
import { savePlottingItem, deletePlottingItem } from '../lib/supabase.ts';
import { UploadPlottingModal } from './UploadPlottingModal.tsx';
import { PlottingManualModal } from './PlottingManualModal.tsx';

interface PlottingSiswaTableProps {
  plottingList: PlottingSiswaPKL[];
  siswaList: MasterSiswaPKL[];
  instansiList: MasterInstansi[];
  guruList: MasterGuruPembimbing[];
  onPlottingUpdated: () => void;
  onNavigateToSiswa?: () => void;
  onNavigateToInstansi?: () => void;
  onNavigateToGuru?: () => void;
  onOpenSupabaseModal?: () => void;
  initialOpenUpload?: boolean;
}

export const PlottingSiswaTable: React.FC<PlottingSiswaTableProps> = ({
  plottingList,
  siswaList,
  instansiList,
  guruList,
  onPlottingUpdated,
  onNavigateToSiswa,
  onNavigateToInstansi,
  onNavigateToGuru,
  onOpenSupabaseModal,
  initialOpenUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterJurusan, setFilterJurusan] = useState<string>('semua');
  const [filterInstansi, setFilterInstansi] = useState<string>('semua');
  const [filterGuru, setFilterGuru] = useState<string>('semua');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlottingSiswaPKL | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PlottingSiswaPKL | null>(null);
  const [viewDetailItem, setViewDetailItem] = useState<PlottingSiswaPKL | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-open upload modal if triggered from sidebar
  React.useEffect(() => {
    if (initialOpenUpload) {
      setIsUploadModalOpen(true);
    }
  }, [initialOpenUpload]);

  // Keyboard accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isManualModalOpen) setIsManualModalOpen(false);
        if (deleteCandidate) setDeleteCandidate(null);
        if (viewDetailItem) setViewDetailItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isManualModalOpen, deleteCandidate, viewDetailItem]);

  // Statistics
  const stats = useMemo(() => calculatePlottingStats(plottingList), [plottingList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return filterPlottingList(
      plottingList,
      searchTerm,
      filterStatus,
      filterJurusan,
      filterInstansi,
      filterGuru
    );
  }, [plottingList, searchTerm, filterStatus, filterJurusan, filterInstansi, filterGuru]);

  // Unique options for dropdown filters
  const uniqueJurusan = useMemo(() => {
    const set = new Set<string>();
    plottingList.forEach((p) => {
      if (p.jurusan) set.add(p.jurusan);
    });
    return Array.from(set).sort();
  }, [plottingList]);

  const uniqueInstansi = useMemo(() => {
    const set = new Set<string>();
    plottingList.forEach((p) => {
      if (p.instansiNama) set.add(p.instansiNama);
    });
    return Array.from(set).sort();
  }, [plottingList]);

  const uniqueGuru = useMemo(() => {
    const set = new Set<string>();
    plottingList.forEach((p) => {
      if (p.guruNama) set.add(p.guruNama);
    });
    return Array.from(set).sort();
  }, [plottingList]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsManualModalOpen(true);
  };

  const handleOpenEdit = (item: PlottingSiswaPKL) => {
    setEditingItem(item);
    setIsManualModalOpen(true);
  };

  const handleSavePlotting = async (item: PlottingSiswaPKL) => {
    await savePlottingItem(item);
    onPlottingUpdated();
    setToastMessage(`Data plotting ${item.namaSiswa} berhasil disimpan.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    await deletePlottingItem(deleteCandidate.id);
    setToastMessage(`Data plotting ${deleteCandidate.namaSiswa} berhasil dihapus.`);
    setDeleteCandidate(null);
    onPlottingUpdated();
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUnassign = async (item: PlottingSiswaPKL) => {
    const unassigned: PlottingSiswaPKL = {
      ...item,
      instansiId: '',
      instansiNama: '',
      alamatInstansi: '',
      pembimbingInstansi: '',
      guruId: '',
      guruNama: '',
      guruNip: '',
      guruTelepon: '',
      statusPlotting: 'Belum Terplotting',
      updatedAt: new Date().toISOString(),
    };
    await savePlottingItem(unassigned);
    onPlottingUpdated();
    setToastMessage(`Plotting untuk ${item.namaSiswa} berhasil di-reset (Belum Terplotting).`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCSV = () => {
    const csvData = generatePlottingCSV(filteredList);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Plotting_Siswa_PKL_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('semua');
    setFilterJurusan('semua');
    setFilterInstansi('semua');
    setFilterGuru('semua');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Plotting & Penempatan Siswa PKL
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Sinkronisasi Master
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Kelola relasi penempatan siswa magang dengan instansi mitra DUDI, guru pembimbing sekolah, NIP, alamat, serta periode waktu PKL secara terpusat.
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-700 border border-teal-200/80 font-bold text-xs transition-colors shadow-xs cursor-pointer"
              title="Upload data plotting siswa dari file Excel (.xlsx) atau CSV (.csv)"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <span>Upload Data Plotting</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
              title="Unduh data dalam format CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Plotting Siswa Baru</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Total Siswa Terdaftar</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.totalSiswa}
              <span className="text-xs text-slate-400 font-normal ml-1">Siswa</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
              <span className="font-semibold">Sudah Terplotting</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900">
              {stats.terplotting}
              <span className="text-xs text-emerald-600 font-normal ml-1">
                ({stats.persentaseTerplotting}%)
              </span>
            </div>
          </div>

          <div 
            onClick={() => setFilterStatus(filterStatus === 'Belum Terplotting' ? 'semua' : 'Belum Terplotting')}
            className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
              filterStatus === 'Belum Terplotting'
                ? 'bg-amber-100/90 border-amber-300 ring-2 ring-amber-400/50'
                : 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/50'
            }`}
            title="Klik untuk memfilter siswa yang belum terplotting"
          >
            <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
              <span className="font-semibold">Belum Terplotting</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900">
              {stats.belumTerplotting}
              <span className="text-xs text-amber-700 font-normal ml-1">Perlu DUDI</span>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-blue-700 text-xs mb-1">
              <span className="font-semibold">Sedang Aktif PKL</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-900">
              {stats.sedangPkl + stats.selesaiPkl}
              <span className="text-xs text-blue-600 font-normal ml-1">
                {stats.sedangPkl} Aktif &bull; {stats.selesaiPkl} Selesai
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari NISN, nama siswa, instansi penempatan, guru pembimbing, atau NIP..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="semua">Semua Status Plotting</option>
              <option value="Terplotting">Terplotting</option>
              <option value="Belum Terplotting">Belum Terplotting</option>
              <option value="Sedang PKL">Sedang PKL</option>
              <option value="Selesai PKL">Selesai PKL</option>
            </select>

            {/* Filter Jurusan */}
            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="semua">Semua Jurusan</option>
              {uniqueJurusan.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>

            {/* Filter Instansi */}
            <select
              value={filterInstansi}
              onChange={(e) => setFilterInstansi(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500 max-w-[200px] truncate"
            >
              <option value="semua">Semua Instansi DUDI</option>
              {uniqueInstansi.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>

            {/* Reset Filter Button */}
            {(searchTerm || filterStatus !== 'semua' || filterJurusan !== 'semua' || filterInstansi !== 'semua' || filterGuru !== 'semua') && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1"
                title="Reset semua filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

          </div>
        </div>

        {/* Info banner jumlah filter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Menampilkan <b>{filteredList.length}</b> dari <b>{plottingList.length}</b> data plotting siswa
          </span>
          <div className="flex items-center gap-3">
            {onNavigateToSiswa && (
              <button
                onClick={onNavigateToSiswa}
                className="text-teal-700 hover:text-teal-900 font-semibold hover:underline flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Lihat Master Siswa</span>
              </button>
            )}
            {onNavigateToInstansi && (
              <button
                onClick={onNavigateToInstansi}
                className="text-blue-700 hover:text-blue-900 font-semibold hover:underline flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Lihat Master DUDI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5">Status Plotting</th>
                <th className="px-4 py-3.5">Data Siswa PKL</th>
                <th className="px-4 py-3.5">Instansi PKL (Penempatan) & Alamat</th>
                <th className="px-4 py-3.5">Guru Pembimbing Sekolah & NIP</th>
                <th className="px-4 py-3.5">Periode PKL</th>
                <th className="px-4 py-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-sm text-slate-700">Tidak ada data plotting yang sesuai filter</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba ganti kata kunci pencarian atau klik tombol "Upload Data Plotting" di atas.
                    </p>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 font-bold text-xs hover:bg-teal-100 transition-colors inline-flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                      <span>Upload Excel / CSV Sekarang</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const badge = getStatusPlottingBadgeConfig(item.statusPlotting);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                      
                      {/* No */}
                      <td className="px-4 py-3.5 text-center font-medium text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Status Plotting Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${badge.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`}></span>
                          {badge.label}
                        </span>
                      </td>

                      {/* Siswa: Nama, NISN, Kelas, Jurusan */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                          {item.namaSiswa}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-mono text-slate-500 font-semibold">
                            NISN: {item.nisn}
                          </span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-600 text-[10px]">
                            {item.kelas}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 font-semibold text-[10px]">
                            {item.jurusan}
                          </span>
                        </div>
                      </td>

                      {/* Instansi PKL (Penempatan) & Alamat */}
                      <td className="px-4 py-3.5 max-w-xs">
                        {item.instansiNama ? (
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span>{item.instansiNama}</span>
                            </div>
                            <div className="flex items-start gap-1 text-[11px] text-slate-500 mt-1 line-clamp-2" title={item.alamatInstansi}>
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                              <span>{item.alamatInstansi || 'Alamat instansi belum diisi'}</span>
                            </div>
                            {item.pembimbingInstansi && (
                              <div className="text-[10px] text-slate-400 mt-0.5 pl-4">
                                Pembimbing: {item.pembimbingInstansi}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg text-amber-800 text-[11px] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>Belum ditempatkan di DUDI</span>
                          </div>
                        )}
                      </td>

                      {/* Guru Pembimbing Sekolah & NIP */}
                      <td className="px-4 py-3.5">
                        {item.guruNama ? (
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                              <span>{item.guruNama}</span>
                            </div>
                            <div className="font-mono text-[11px] text-slate-500 mt-0.5 pl-5">
                              NIP: {item.guruNip || '-'}
                            </div>
                            {item.guruTelepon && (
                              <div className="text-[10px] text-purple-700 mt-0.5 pl-5">
                                Telp/WA: {item.guruTelepon}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum ditentukan</span>
                        )}
                      </td>

                      {/* Periode PKL */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          <span>{item.periodeMulai}</span>
                        </div>
                        <div className="text-slate-500 text-[10px] pl-4">
                          s.d. {item.periodeSelesai}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                            title="Edit Plotting Siswa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {item.instansiNama && (
                            <button
                              onClick={() => handleUnassign(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Lepas Penempatan (Reset ke Belum Terplotting)"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteCandidate(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Relasi Plotting"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS PLOTTING */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  Hapus Data Plotting Siswa?
                </h3>
                <p className="text-xs text-slate-500">
                  Data relasi penempatan magang siswa ini akan dihapus dari sistem.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900 text-sm">{deleteCandidate.namaSiswa}</p>
              <p className="font-mono text-slate-600">NISN: {deleteCandidate.nisn} &bull; {deleteCandidate.kelas}</p>
              <p className="text-slate-600">Instansi: {deleteCandidate.instansiNama || '-'}</p>
              <p className="text-slate-600">Guru Pembimbing: {deleteCandidate.guruNama || '-'}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                Ya, Hapus Plotting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Excel Plotting */}
      <UploadPlottingModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        existingPlottingList={plottingList}
        onSuccess={(count, message) => {
          setIsUploadModalOpen(false);
          onPlottingUpdated();
          setToastMessage(message || `Berhasil mengimpor ${count} data plotting siswa.`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
        onOpenSupabaseModal={onOpenSupabaseModal}
      />

      {/* Modal Manual Plotting */}
      <PlottingManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        plottingItem={editingItem}
        siswaList={siswaList}
        instansiList={instansiList}
        guruList={guruList}
        existingPlottingList={plottingList}
        onSave={handleSavePlotting}
      />

    </div>
  );
};
