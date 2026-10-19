import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  MapPin, 
  Briefcase,
  ArrowRight,
  Download,
  ExternalLink,
  ShieldAlert,
  Phone,
  Mail,
  PieChart,
  UserCheck,
  Check,
  Building,
  Sparkles,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';
import { MasterInstansi, MasterSiswaPKL } from '../types/index.ts';
import { saveMasterInstansi, deleteMasterInstansi } from '../lib/supabase.ts';
import { calculateInstansiStats, getSiswaByInstansi, generateInstansiCSV } from '../utils/instansiUtils.ts';
import { UploadInstansiModal } from './UploadInstansiModal.tsx';

interface MasterInstansiTableProps {
  instansiList: MasterInstansi[];
  siswaList: MasterSiswaPKL[];
  onInstansiUpdated: () => void;
  onFilterSiswaByInstansi?: (namaInstansi: string) => void;
  onNavigateToSiswa?: () => void;
  onOpenSupabaseModal?: () => void;
  initialOpenUpload?: boolean;
}

export const MasterInstansiTable: React.FC<MasterInstansiTableProps> = ({
  instansiList,
  siswaList,
  onInstansiUpdated,
  onFilterSiswaByInstansi,
  onNavigateToSiswa,
  onOpenSupabaseModal,
  initialOpenUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKetersediaan, setFilterKetersediaan] = useState<'semua' | 'tersedia' | 'penuh' | 'kosong'>('semua');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingInstansi, setEditingInstansi] = useState<MasterInstansi | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MasterInstansi | null>(null);
  const [viewSiswaInstansi, setViewSiswaInstansi] = useState<MasterInstansi | null>(null);

  // Auto open upload modal if triggered from navigation/sidebar
  React.useEffect(() => {
    if (initialOpenUpload) {
      setIsUploadModalOpen(true);
    }
  }, [initialOpenUpload]);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    kuota: 4,
    pembimbingInstansi: '',
    kontakPerson: '',
    email: '',
    bidangUsaha: 'Teknologi Informasi & Jaringan',
  });
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keyboard accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isUploadModalOpen) setIsUploadModalOpen(false);
        if (deleteCandidate) setDeleteCandidate(null);
        if (viewSiswaInstansi) setViewSiswaInstansi(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isUploadModalOpen, deleteCandidate, viewSiswaInstansi]);

  // Aggregated Summary Statistics
  const summaryStats = useMemo(() => {
    const totalInstansi = instansiList.length;
    let totalKuota = 0;
    let totalSiswaTerisi = 0;
    let totalSisaKuota = 0;
    let instansiPenuhCount = 0;

    instansiList.forEach((instansi) => {
      const stats = calculateInstansiStats(instansi, siswaList);
      totalKuota += instansi.kuota || 0;
      totalSiswaTerisi += stats.jumlahSiswaTerisi;
      totalSisaKuota += stats.sisaKuota;
      if (stats.isPenuh) instansiPenuhCount++;
    });

    return {
      totalInstansi,
      totalKuota,
      totalSiswaTerisi,
      totalSisaKuota,
      instansiPenuhCount,
    };
  }, [instansiList, siswaList]);

  // Filtered Instansi List
  const filteredList = useMemo(() => {
    return instansiList.filter((item) => {
      const stats = calculateInstansiStats(item, siswaList);

      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pembimbingInstansi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.bidangUsaha && item.bidangUsaha.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.kontakPerson && item.kontakPerson.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchKetersediaan = true;
      if (filterKetersediaan === 'tersedia') {
        matchKetersediaan = stats.sisaKuota > 0;
      } else if (filterKetersediaan === 'penuh') {
        matchKetersediaan = stats.isPenuh;
      } else if (filterKetersediaan === 'kosong') {
        matchKetersediaan = stats.jumlahSiswaTerisi === 0;
      }

      return matchSearch && matchKetersediaan;
    });
  }, [instansiList, siswaList, searchTerm, filterKetersediaan]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingInstansi(null);
    setFormData({
      nama: '',
      alamat: '',
      kuota: 4,
      pembimbingInstansi: '',
      kontakPerson: '',
      email: '',
      bidangUsaha: 'Teknologi Informasi & Jaringan',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (instansi: MasterInstansi) => {
    setEditingInstansi(instansi);
    setFormData({
      nama: instansi.nama,
      alamat: instansi.alamat,
      kuota: instansi.kuota,
      pembimbingInstansi: instansi.pembimbingInstansi,
      kontakPerson: instansi.kontakPerson || '',
      email: instansi.email || '',
      bidangUsaha: instansi.bidangUsaha || 'Teknologi Informasi & Jaringan',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nama.trim()) {
      setFormError('Nama Instansi / Perusahaan wajib diisi.');
      return;
    }
    if (!formData.alamat.trim()) {
      setFormError('Alamat lengkap instansi wajib diisi.');
      return;
    }
    if (formData.kuota < 1) {
      setFormError('Kuota siswa minimal 1.');
      return;
    }
    if (!formData.pembimbingInstansi.trim()) {
      setFormError('Nama pembimbing instansi wajib diisi.');
      return;
    }

    // Check duplicate name
    const isDuplicate = instansiList.some(
      (i) =>
        i.nama.toLowerCase().trim() === formData.nama.toLowerCase().trim() &&
        (!editingInstansi || i.id !== editingInstansi.id)
    );
    if (isDuplicate) {
      setFormError(`Instansi "${formData.nama}" sudah terdaftar.`);
      return;
    }

    try {
      const payload: MasterInstansi = {
        id: editingInstansi?.id || `inst-${Date.now()}`,
        nama: formData.nama.trim(),
        alamat: formData.alamat.trim(),
        kuota: Number(formData.kuota),
        pembimbingInstansi: formData.pembimbingInstansi.trim(),
        kontakPerson: formData.kontakPerson?.trim() || '',
        email: formData.email?.trim() || '',
        bidangUsaha: formData.bidangUsaha?.trim() || '',
        isActive: true,
        updatedAt: new Date().toISOString(),
      };

      await saveMasterInstansi(payload);
      onInstansiUpdated();
      setIsModalOpen(false);

      setToastMessage(
        editingInstansi
          ? `Perubahan data "${payload.nama}" berhasil disimpan!`
          : `Instansi baru "${payload.nama}" berhasil ditambahkan!`
      );
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan data instansi.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    try {
      await deleteMasterInstansi(deleteCandidate.id);
      onInstansiUpdated();
      const nama = deleteCandidate.nama;
      setDeleteCandidate(null);
      setToastMessage(`Instansi "${nama}" berhasil dihapus.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setToastMessage('Gagal menghapus data instansi.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleExportCSV = () => {
    const csvContent = generateInstansiCSV(instansiList, siswaList);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Master_Data_Instansi_Perusahaan_PKL_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Connected students for currently selected modal instansi
  const connectedSiswaForModal = useMemo(() => {
    if (!viewSiswaInstansi) return [];
    return getSiswaByInstansi(siswaList, viewSiswaInstansi);
  }, [siswaList, viewSiswaInstansi]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Action Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20 flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Master Data Instansi / Perusahaan
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Mitra DUDI & Kuota PKL
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Kelola data tempat PKL/DUDI, alamat kantor, kuota penempatan, jumlah siswa terisi, sisa kuota, serta nama pembimbing instansi yang terhubung langsung dengan Master Siswa PKL.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs transition-colors shadow-xs"
              title="Upload file Excel (.xlsx) atau CSV Data Instansi / Perusahaan PKL"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Upload Excel / CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
              title="Unduh data dalam format CSV / Excel"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {onNavigateToSiswa && (
              <button
                onClick={onNavigateToSiswa}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:text-blue-700 transition-colors shadow-xs"
                title="Buka Halaman Master Siswa PKL"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Buka Master Siswa</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Instansi Baru</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Total Instansi / DUDI</span>
              <Building className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {summaryStats.totalInstansi}
              <span className="text-xs text-slate-400 font-normal ml-1">Perusahaan</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Total Kuota Tersedia</span>
              <PieChart className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-900">
              {summaryStats.totalKuota}
              <span className="text-xs text-slate-400 font-normal ml-1">Slot Siswa</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Jumlah Siswa Terisi</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              {summaryStats.totalSiswaTerisi}
              <span className="text-xs text-slate-400 font-normal ml-1">Siswa Ditempatkan</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Total Sisa Kuota</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700">
              {summaryStats.totalSisaKuota}
              <span className="text-xs text-slate-400 font-normal ml-1">Slot Kosong</span>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari instansi, alamat, atau nama pembimbing..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Ketersediaan Kuota */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Status Kuota:</span>
          <select
            value={filterKetersediaan}
            onChange={(e) => setFilterKetersediaan(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Instansi ({instansiList.length})</option>
            <option value="tersedia">Masih Ada Sisa Kuota</option>
            <option value="penuh">Kuota Penuh (0 Sisa)</option>
            <option value="kosong">Belum Terisi (0 Siswa)</option>
          </select>
        </div>
      </div>

      {/* Main Table: Master Data Instansi Perusahaan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4 min-w-[220px]">Nama Instansi / Perusahaan</th>
                <th className="py-3 px-4 min-w-[240px]">Alamat Lengkap</th>
                <th className="py-3 px-3 text-center w-28">Kuota Siswa</th>
                <th className="py-3 px-3 text-center w-36">Jumlah Siswa Terisi</th>
                <th className="py-3 px-3 text-center w-28">Sisa Kuota</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Pembimbing Instansi</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">Tidak ada data instansi yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status kuota.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((instansi, index) => {
                  const stats = calculateInstansiStats(instansi, siswaList);
                  const connectedSiswa = getSiswaByInstansi(siswaList, instansi);

                  return (
                    <tr key={instansi.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. No */}
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-400">
                        {index + 1}
                      </td>

                      {/* 2. Nama Instansi / Perusahaan */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0 mt-0.5">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">
                              {instansi.nama}
                            </p>
                            {instansi.bidangUsaha && (
                              <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                                {instansi.bidangUsaha}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Alamat Lengkap */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs leading-relaxed line-clamp-2" title={instansi.alamat}>
                            {instansi.alamat}
                          </span>
                        </div>
                      </td>

                      {/* 4. Kuota Siswa */}
                      <td className="py-3.5 px-3 text-center font-bold">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                          {instansi.kuota} Siswa
                        </span>
                      </td>

                      {/* 5. Jumlah Siswa Terisi (Interactive Link to Students) */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setViewSiswaInstansi(instansi)}
                          title="Klik untuk melihat daftar siswa di instansi ini"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:scale-102 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{stats.jumlahSiswaTerisi} Siswa Terisi</span>
                        </button>
                      </td>

                      {/* 6. Sisa Kuota (Dynamic with Badge & Status) */}
                      <td className="py-3.5 px-3 text-center">
                        {stats.isPenuh ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>0 (Penuh)</span>
                          </span>
                        ) : stats.sisaKuota <= 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>{stats.sisaKuota} Tersisa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{stats.sisaKuota} Tersedia</span>
                          </span>
                        )}
                      </td>

                      {/* 7. Nama Pembimbing Instansi */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div className="flex items-start gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{instansi.pembimbingInstansi}</p>
                            {instansi.kontakPerson && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                <span>{instansi.kontakPerson}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 8. Aksi (Edit, Hapus) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(instansi)}
                            title="Edit Instansi"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(instansi)}
                            title="Hapus Instansi"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Table Footer with Summary */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{filteredList.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{instansiList.length}</span> instansi / perusahaan mitra.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Kuota Tersedia</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Hampir Penuh</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Kuota Penuh</span>
            </span>
          </div>
        </div>
      </div>

      {/* MODAL 1: LIHAT SISWA TERHUBUNG DI INSTANSI */}
      {viewSiswaInstansi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <Building2 className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {viewSiswaInstansi.nama}
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Daftar Siswa Terdaftar PKL di Perusahaan Ini ({connectedSiswaForModal.length} dari {viewSiswaInstansi.kuota} Kuota)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewSiswaInstansi(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List of Students */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              
              {/* Quick Info Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block font-medium">Pembimbing Instansi (DUDI):</span>
                  <span className="font-bold text-slate-900">{viewSiswaInstansi.pembimbingInstansi}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status Kuota:</span>
                  <span className="font-bold text-slate-900">
                    {connectedSiswaForModal.length} / {viewSiswaInstansi.kuota} Terisi ({Math.max(0, viewSiswaInstansi.kuota - connectedSiswaForModal.length)} Slot Kosong)
                  </span>
                </div>
              </div>

              {connectedSiswaForModal.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-700 text-sm">Belum ada siswa yang ditempatkan di instansi ini.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Anda dapat menghubungkan siswa melalui menu <b>Master Siswa PKL</b> saat menambah atau mengedit data siswa.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Siswa Terhubung ({connectedSiswaForModal.length}):
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {connectedSiswaForModal.map((siswa, idx) => (
                      <div key={siswa.id} className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{siswa.namaLengkap}</p>
                            <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                              <span className="font-mono text-[11px]">NISN: {siswa.nisn}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">{siswa.kelas}</span>
                              <span>•</span>
                              <span className="text-blue-700 font-medium">{siswa.jurusan}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">Guru Pembimbing:</span>
                          <span className="font-semibold text-slate-700 text-xs">{siswa.guruPembimbing}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewSiswaInstansi(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100"
              >
                Tutup
              </button>

              {onFilterSiswaByInstansi && (
                <button
                  type="button"
                  onClick={() => {
                    const companyName = viewSiswaInstansi.nama;
                    setViewSiswaInstansi(null);
                    onFilterSiswaByInstansi(companyName);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  <span>Buka di Master Siswa (Filter Instansi Ini)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH / EDIT INSTANSI PERUSAHAAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <Building2 className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {editingInstansi ? 'Edit Data Instansi / Perusahaan' : 'Tambah Instansi / Perusahaan Baru'}
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Data tempat PKL yang akan terhubung dengan penempatan siswa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Nama Instansi / Perusahaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Instansi / Perusahaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Telekomunikasi Indonesia (Telkom Regional)"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* 2. Alamat Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Alamat kantor, gedung, jalan, kota, dan kode pos tempat pelaksanaan PKL..."
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              {/* 3. Kuota Siswa & Bidang Usaha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kuota Siswa PKL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={formData.kuota}
                    onChange={(e) => setFormData({ ...formData, kuota: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Jumlah maksimal siswa yang dapat diterima</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bidang Usaha / Industri
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Teknologi Informasi / Otomotif"
                    value={formData.bidangUsaha}
                    onChange={(e) => setFormData({ ...formData, bidangUsaha: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* 4. Nama Pembimbing Instansi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pembimbing Instansi (DUDI) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bambang Prasetyo, S.T. / Manager DUDI"
                  value={formData.pembimbingInstansi}
                  onChange={(e) => setFormData({ ...formData, pembimbingInstansi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* 5. Kontak Person / Telepon & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No Telepon / WhatsApp HRD
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-3456-7890"
                    value={formData.kontakPerson}
                    onChange={(e) => setFormData({ ...formData, kontakPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Kontak Perusahaan
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: pkl.dudi@perusahaan.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {editingInstansi ? 'Simpan Perubahan' : 'Tambah Instansi'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS INSTANSI */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  Hapus Data Instansi?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan menghapus data instansi dari master database.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{deleteCandidate.nama}</p>
              <p className="text-slate-500">{deleteCandidate.alamat}</p>
              <p className="text-slate-600 font-medium pt-1">
                Kuota: <span className="font-bold text-slate-800">{deleteCandidate.kuota} Siswa</span> • Pembimbing: <span className="font-bold text-slate-800">{deleteCandidate.pembimbingInstansi}</span>
              </p>
            </div>

            {getSiswaByInstansi(siswaList, deleteCandidate).length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Perhatian: Saat ini terdapat <b>{getSiswaByInstansi(siswaList, deleteCandidate).length} siswa</b> yang terhubung dengan instansi ini di Master Siswa PKL.
                </span>
              </div>
            )}

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
                Ya, Hapus Instansi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Excel Master Instansi */}
      <UploadInstansiModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        existingInstansiList={instansiList}
        onSuccess={(count, message) => {
          setIsUploadModalOpen(false);
          onInstansiUpdated();
          setToastMessage(message || `Berhasil mengimpor ${count} data instansi!`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
        onOpenSupabaseModal={onOpenSupabaseModal}
      />

    </div>
  );
};
