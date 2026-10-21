import React, { useState, useMemo, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Phone, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  Sparkles, 
  UserCheck, 
  BookOpen, 
  ExternalLink,
  Building2,
  Layers,
  ChevronRight,
  FileSpreadsheet,
  UploadCloud,
  Code,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { MasterGuruPembimbing, MasterSiswaPKL, PlottingSiswaPKL } from '../types/index.ts';
import { 
  saveMasterGuru, 
  deleteMasterGuru,
  checkMasterGuruTableStatus,
  syncMasterGuruToSupabase
} from '../lib/supabase.ts';
import { 
  calculateGuruStats, 
  generateGuruCSV, 
  generateGuruCredentials 
} from '../utils/guruUtils.ts';
import { generateGuruSQLScript } from '../utils/scoring.ts';
import { UploadGuruModal } from './UploadGuruModal.tsx';

interface MasterGuruTableProps {
  guruList: MasterGuruPembimbing[];
  siswaList: MasterSiswaPKL[];
  plottingList?: PlottingSiswaPKL[];
  onGuruUpdated: () => void;
  onFilterSiswaByGuru?: (namaGuru: string) => void;
  onNavigateToSiswa?: () => void;
  onNavigateToPlotting?: (namaGuru?: string) => void;
  onOpenSupabaseModal?: () => void;
  initialOpenUpload?: boolean;
  onCloseUpload?: () => void;
}

export const MasterGuruTable: React.FC<MasterGuruTableProps> = ({
  guruList,
  siswaList,
  plottingList = [],
  onGuruUpdated,
  onFilterSiswaByGuru,
  onNavigateToSiswa,
  onNavigateToPlotting,
  onOpenSupabaseModal,
  initialOpenUpload,
  onCloseUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBeban, setFilterBeban] = useState<'semua' | 'ada' | 'kosong'>('semua');

  // Supabase cloud table status
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    tableExists: boolean;
    rowCount: number;
    message: string;
    checked: boolean;
  }>({
    connected: false,
    tableExists: false,
    rowCount: 0,
    message: '',
    checked: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [showSQLModal, setShowSQLModal] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<MasterGuruPembimbing | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MasterGuruPembimbing | null>(null);
  const [viewSiswaGuru, setViewSiswaGuru] = useState<MasterGuruPembimbing | null>(null);

  const checkDb = async () => {
    setIsCheckingDb(true);
    try {
      const res = await checkMasterGuruTableStatus();
      setDbStatus({
        ...res,
        checked: true,
      });
    } catch {
      // ignore
    } finally {
      setIsCheckingDb(false);
    }
  };

  useEffect(() => {
    checkDb();
  }, [guruList.length]);

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await syncMasterGuruToSupabase();
      if (res.savedToDatabase) {
        setToastMessage(`Sukses! ${res.count} data guru pembimbing tersimpan ke Supabase Cloud.`);
        await checkDb();
        onGuruUpdated();
      } else {
        setToastMessage(res.message);
        if (res.message.toLowerCase().includes('belum dibuat')) {
          setShowSQLModal(true);
        }
      }
    } catch (e: any) {
      setToastMessage(`Gagal sinkron: ${e?.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(generateGuruSQLScript());
      setCopiedSQL(true);
      setTimeout(() => setCopiedSQL(false), 2500);
    } catch {
      // ignore
    }
  };

  // Auto-open upload modal if triggered from sidebar or navigation
  useEffect(() => {
    if (initialOpenUpload) {
      setIsUploadModalOpen(true);
    }
  }, [initialOpenUpload]);

  // Form State
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    telepon: '',
    emailLogin: '',
    passwordLogin: '',
    bidangStudi: 'Rekayasa Perangkat Lunak & Basis Data',
  });
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password visibility state (key: guru id)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (deleteCandidate) setDeleteCandidate(null);
        if (viewSiswaGuru) setViewSiswaGuru(null);
        if (showSQLModal) setShowSQLModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, deleteCandidate, viewSiswaGuru, showSQLModal]);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Aggregated Summary Statistics
  const summaryStats = useMemo(() => {
    const totalGuru = guruList.length;
    let totalSiswaBimbingan = 0;
    let guruDenganSiswa = 0;

    guruList.forEach((guru) => {
      const stats = calculateGuruStats(guru, siswaList, plottingList);
      totalSiswaBimbingan += stats.jumlahSiswaBimbingan;
      if (stats.jumlahSiswaBimbingan > 0) guruDenganSiswa++;
    });

    const rataRata = totalGuru > 0 ? (totalSiswaBimbingan / totalGuru).toFixed(1) : '0';

    return {
      totalGuru,
      totalSiswaBimbingan,
      rataRata,
      guruDenganSiswa,
    };
  }, [guruList, siswaList, plottingList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return guruList.filter((guru) => {
      const stats = calculateGuruStats(guru, siswaList, plottingList);

      const matchSearch =
        guru.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guru.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guru.telepon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guru.emailLogin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guru.bidangStudi && guru.bidangStudi.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchBeban = true;
      if (filterBeban === 'ada') {
        matchBeban = stats.jumlahSiswaBimbingan > 0;
      } else if (filterBeban === 'kosong') {
        matchBeban = stats.jumlahSiswaBimbingan === 0;
      }

      return matchSearch && matchBeban;
    });
  }, [guruList, siswaList, plottingList, searchTerm, filterBeban]);

  // Modal open handlers
  const handleOpenAddModal = () => {
    setEditingGuru(null);
    const initialNip = '19850101 201201 1 ' + Math.floor(100 + Math.random() * 900);
    const initialCreds = generateGuruCredentials('Guru Pembimbing Baru', initialNip);
    setFormData({
      nip: initialNip,
      nama: '',
      telepon: '0812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      emailLogin: initialCreds.email,
      passwordLogin: initialCreds.password,
      bidangStudi: 'Rekayasa Perangkat Lunak & Basis Data',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guru: MasterGuruPembimbing) => {
    setEditingGuru(guru);
    setFormData({
      nip: guru.nip,
      nama: guru.nama,
      telepon: guru.telepon,
      emailLogin: guru.emailLogin,
      passwordLogin: guru.passwordLogin,
      bidangStudi: guru.bidangStudi || 'Rekayasa Perangkat Lunak & Basis Data',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleGenerateCredentialsInForm = () => {
    if (!formData.nama) {
      setFormError('Ketikkan Nama Guru Pembimbing terlebih dahulu untuk membuat akun otomatis.');
      return;
    }
    const creds = generateGuruCredentials(formData.nama, formData.nip);
    setFormData((prev) => ({
      ...prev,
      emailLogin: creds.email,
      passwordLogin: creds.password,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nip.trim()) {
      setFormError('Nomor NIP / NIK wajib diisi.');
      return;
    }
    if (!formData.nama.trim()) {
      setFormError('Nama Lengkap Guru Pembimbing wajib diisi.');
      return;
    }
    if (!formData.telepon.trim()) {
      setFormError('Nomor telepon / WhatsApp wajib diisi.');
      return;
    }
    if (!formData.emailLogin.trim()) {
      setFormError('Email login wajib diisi.');
      return;
    }
    if (!formData.passwordLogin.trim()) {
      setFormError('Password login wajib diisi.');
      return;
    }

    // Check duplicate NIP
    const cleanNip = formData.nip.replace(/\s+/g, '');
    const isDuplicate = guruList.some(
      (g) =>
        g.nip.replace(/\s+/g, '') === cleanNip &&
        (!editingGuru || g.id !== editingGuru.id)
    );
    if (isDuplicate) {
      setFormError(`NIP/NIK "${formData.nip}" sudah digunakan oleh guru lain.`);
      return;
    }

    try {
      const payload: MasterGuruPembimbing = {
        id: editingGuru?.id || `guru-${Date.now()}`,
        nip: formData.nip.trim(),
        nama: formData.nama.trim(),
        telepon: formData.telepon.trim(),
        emailLogin: formData.emailLogin.trim(),
        passwordLogin: formData.passwordLogin.trim(),
        bidangStudi: formData.bidangStudi.trim(),
        isActive: true,
        updatedAt: new Date().toISOString(),
      };

      await saveMasterGuru(payload);
      onGuruUpdated();
      setIsModalOpen(false);

      setToastMessage(
        editingGuru
          ? `Perubahan data "${payload.nama}" berhasil disimpan!`
          : `Guru pembimbing baru "${payload.nama}" berhasil ditambahkan!`
      );
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan data guru pembimbing.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    try {
      await deleteMasterGuru(deleteCandidate.id);
      onGuruUpdated();
      const nama = deleteCandidate.nama;
      setDeleteCandidate(null);
      setToastMessage(`Guru pembimbing "${nama}" berhasil dihapus.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setToastMessage('Gagal menghapus data guru pembimbing.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleExportCSV = () => {
    const csvContent = generateGuruCSV(guruList, siswaList);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Master_Data_Guru_Pembimbing_PKL_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Connected students for currently selected modal guru (disinkronkan dari Plotting Siswa & Master Siswa)
  const connectedSiswaForModal = useMemo(() => {
    if (!viewSiswaGuru) return [];
    return calculateGuruStats(viewSiswaGuru, siswaList, plottingList).siswaBimbinganList;
  }, [siswaList, viewSiswaGuru, plottingList]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Database Warning / Status Alert Banner */}
      {dbStatus.checked && dbStatus.connected && !dbStatus.tableExists && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 sm:p-5 text-amber-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-amber-950">
                  Tabel Database Supabase Belum Dibuat / Belum Sesuai
                </span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md text-[10px] font-bold">
                  Perlu Jalankan SQL
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-1 max-w-3xl leading-relaxed">
                Tabel <code>master_guru_pembimbing</code> di database Supabase Anda belum dibuat atau belum memiliki constraint <code>UNIQUE (nip)</code>. Karena itu, data setelah di-upload saat ini baru tersimpan di browser lokal. Jalankan query SQL pembaruan sekali saja di Supabase SQL Editor agar data langsung tersimpan permanen di cloud.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <button
              onClick={() => setShowSQLModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Lihat Skrip SQL</span>
            </button>
            <button
              onClick={checkDb}
              disabled={isCheckingDb}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Cek ulang status tabel master_guru_pembimbing di Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isCheckingDb ? 'animate-spin' : ''}`} />
              <span>Cek Status</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Data Master Guru Pembimbing PKL
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
                  Pembimbing Sekolah
                </span>
                {dbStatus.checked && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      dbStatus.tableExists
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : dbStatus.connected
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                    title={dbStatus.message}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        dbStatus.tableExists
                          ? 'bg-emerald-500'
                          : dbStatus.connected
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span>
                      {dbStatus.tableExists
                        ? `Cloud Aktif (${dbStatus.rowCount} guru)`
                        : dbStatus.connected
                        ? 'Tabel Cloud Belum Ada'
                        : 'Lokal Browser'}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Kelola data NIP/NIK guru pembimbing, akun akses login, kontak telepon/WhatsApp, dan pemantauan jumlah siswa PKL bimbingan secara terintegrasi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100/90 text-orange-900 border border-orange-200 font-bold text-xs transition-colors shadow-xs cursor-pointer"
              title="Upload data guru dari file Excel (.xlsx) atau CSV (.csv)"
            >
              <FileSpreadsheet className="w-4 h-4 text-orange-600" />
              <span>Upload Excel / CSV</span>
            </button>

            <button
              onClick={() => setShowSQLModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-orange-50 text-orange-900 border border-orange-200 font-bold text-xs transition-colors shadow-xs cursor-pointer"
              title="Lihat skrip SQL untuk membuat atau memperbaiki tabel master_guru_pembimbing di Supabase"
            >
              <Code className="w-4 h-4 text-orange-600" />
              <span>Skrip SQL</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
              title="Unduh data dalam format CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {onNavigateToSiswa && (
              <button
                onClick={onNavigateToSiswa}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:text-orange-700 transition-colors shadow-xs"
                title="Buka Halaman Master Siswa PKL"
              >
                <Users className="w-4 h-4 text-slate-600" />
                <span>Buka Master Siswa</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru Pembimbing</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Total Guru Pembimbing</span>
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {summaryStats.totalGuru}
              <span className="text-xs text-slate-400 font-normal ml-1">Guru</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Total Siswa Dibimbing</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-900">
              {summaryStats.totalSiswaBimbingan}
              <span className="text-xs text-slate-400 font-normal ml-1">Siswa PKL</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Rata-rata Beban Bimbingan</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              {summaryStats.rataRata}
              <span className="text-xs text-slate-400 font-normal ml-1">Siswa / Guru</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">Guru Aktif Membimbing</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700">
              {summaryStats.guruDenganSiswa}
              <span className="text-xs text-slate-400 font-normal ml-1">dari {summaryStats.totalGuru} Guru</span>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari NIP, nama guru, telepon, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-slate-800"
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

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Status Bimbingan:</span>
          <select
            value={filterBeban}
            onChange={(e) => setFilterBeban(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="semua">Semua Guru ({guruList.length})</option>
            <option value="ada">Ada Siswa Bimbingan (&gt;0)</option>
            <option value="kosong">Belum Ada Siswa (0)</option>
          </select>
        </div>
      </div>

      {/* Main Table: Master Data Guru Pembimbing */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4 min-w-[170px]">NIP / NIK</th>
                <th className="py-3 px-4 min-w-[220px]">Nama Guru Pembimbing</th>
                <th className="py-3 px-4 min-w-[150px]">Telepon</th>
                <th className="py-3 px-4 min-w-[200px]">Email Login</th>
                <th className="py-3 px-4 min-w-[180px]">Password Login</th>
                <th className="py-3 px-3 text-center w-36">Jumlah Siswa Bimbingan</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">Tidak ada data guru pembimbing yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau tambahkan guru baru.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((guru, index) => {
                  const stats = calculateGuruStats(guru, siswaList, plottingList);
                  const isPassVisible = visiblePasswords[guru.id];
                  const isCopied = copiedId === guru.id;

                  // Clean phone for whatsapp
                  const cleanPhone = guru.telepon.replace(/[^0-9]/g, '');
                  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                  return (
                    <tr key={guru.id} className="hover:bg-purple-50/30 transition-colors group">
                      
                      {/* No */}
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* NIP / NIK */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block tracking-tight">
                          {guru.nip}
                        </span>
                      </td>

                      {/* Nama Guru Pembimbing */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                            {guru.nama.split(' ').filter(p => !p.includes('.')).slice(0, 2).map(n => n[0]).join('') || 'GP'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors block">
                              {guru.nama}
                            </span>
                            {guru.bidangStudi && (
                              <span className="text-[11px] text-slate-500 block">
                                {guru.bidangStudi}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Telepon */}
                      <td className="py-3 px-4">
                        <a
                          href={`https://wa.me/${waPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
                          title="Hubungi via WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{guru.telepon}</span>
                        </a>
                      </td>

                      {/* Email Login */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[150px]" title={guru.emailLogin}>
                            {guru.emailLogin}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(guru.emailLogin, `email-${guru.id}`)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title="Salin Email"
                          >
                            {copiedId === `email-${guru.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password Login */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 w-fit">
                          <KeyRound className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="font-mono text-[11px] text-slate-800 tracking-wider">
                            {isPassVisible ? guru.passwordLogin : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(guru.id)}
                            className="p-0.5 text-slate-400 hover:text-slate-700 ml-1 transition-colors"
                            title={isPassVisible ? 'Sembunyikan password' : 'Lihat password'}
                          >
                            {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyText(guru.passwordLogin, guru.id)}
                            className="p-0.5 text-slate-400 hover:text-purple-600 transition-colors"
                            title="Salin password"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Jumlah Siswa Bimbingan */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setViewSiswaGuru(guru)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs hover:scale-105 cursor-pointer ${
                            stats.jumlahSiswaBimbingan > 0
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title={`Klik untuk melihat ${stats.jumlahSiswaBimbingan} siswa yang dibimbing`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{stats.jumlahSiswaBimbingan} Siswa</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewSiswaGuru(guru)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Lihat Daftar Siswa Bimbingan"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(guru)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Data Guru"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(guru)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Guru"
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

      {/* MODAL TAMBAH / EDIT GURU PEMBIMBING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <GraduationCap className="w-5 h-5 text-purple-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {editingGuru ? 'Edit Guru Pembimbing PKL' : 'Tambah Guru Pembimbing Baru'}
                  </h3>
                  <p className="text-xs text-purple-100/80">
                    Pengelolaan NIP/NIK, nama, kontak, dan kredensial login portal guru
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* NIP / NIK */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  NIP / NIK Guru Pembimbing *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  placeholder="Contoh: 19820315 200812 1 001 atau NIK 16 digit"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                />
              </div>

              {/* Nama Guru Lengkap & Gelar */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Lengkap &amp; Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Dr. Ir. Hendra Kurniawan, M.T."
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium text-xs"
                />
              </div>

              {/* Telepon & Bidang Studi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    No. Telepon / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="Contoh: 0812-2345-6789"
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Bidang Keahlian / Mapel
                  </label>
                  <input
                    type="text"
                    value={formData.bidangStudi}
                    onChange={(e) => setFormData({ ...formData, bidangStudi: e.target.value })}
                    placeholder="Contoh: Produktif RPL / Jaringan"
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
              </div>

              {/* Akun Login Card */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                    <span>Akun Akses Portal Guru</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateCredentialsInForm}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Otomatis</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Login *</label>
                    <input
                      type="email"
                      required
                      value={formData.emailLogin}
                      onChange={(e) => setFormData({ ...formData, emailLogin: e.target.value })}
                      placeholder="nama@smk.belajar.id"
                      className="w-full p-2 border border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-mono text-[11px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Password Login *</label>
                    <input
                      type="text"
                      required
                      value={formData.passwordLogin}
                      onChange={(e) => setFormData({ ...formData, passwordLogin: e.target.value })}
                      placeholder="Password login guru"
                      className="w-full p-2 border border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-mono text-[11px] bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  {editingGuru ? 'Simpan Perubahan' : 'Tambahkan Guru'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DAFTAR SISWA BIMBINGAN */}
      {viewSiswaGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Users className="w-5 h-5 text-purple-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Daftar Siswa Bimbingan PKL</h3>
                  <p className="text-xs text-purple-200">
                    Guru Pembimbing: <span className="font-bold text-white">{viewSiswaGuru.nama}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewSiswaGuru(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-900">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span>
                    Total Siswa Terdaftar: <b>{connectedSiswaForModal.length} Siswa</b>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onFilterSiswaByGuru && connectedSiswaForModal.length > 0 && (
                    <button
                      onClick={() => {
                        onFilterSiswaByGuru(viewSiswaGuru.nama);
                        setViewSiswaGuru(null);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white px-3 py-1 rounded-lg border border-purple-200 shadow-2xs"
                    >
                      <span>Filter di Master Siswa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onNavigateToPlotting && connectedSiswaForModal.length > 0 && (
                    <button
                      onClick={() => {
                        onNavigateToPlotting(viewSiswaGuru.nama);
                        setViewSiswaGuru(null);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs"
                    >
                      <span>Lihat di Plotting Siswa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {connectedSiswaForModal.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-700 text-sm">Belum Ada Siswa Bimbingan</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Guru ini belum ditugaskan untuk membimbing siswa di Master Siswa atau Plotting Siswa PKL.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-10">No</th>
                        <th className="py-2.5 px-3">Nama Siswa &amp; NISN</th>
                        <th className="py-2.5 px-3">Kelas &amp; Jurusan</th>
                        <th className="py-2.5 px-3">Tempat PKL (DUDI)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {connectedSiswaForModal.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">{s.namaLengkap}</span>
                            <span className="font-mono text-[10px] text-slate-500">NISN: {s.nisn}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 block">{s.kelas}</span>
                            <span className="text-[11px] text-slate-500">{s.jurusan}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-blue-800 block">
                              {s.instansiNama || 'Belum Ditempatkan'}
                            </span>
                            {s.pembimbingInstansi && (
                              <span className="text-[10px] text-slate-500 block">
                                Pembimbing DUDI: {s.pembimbingInstansi}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {onNavigateToPlotting && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToPlotting(viewSiswaGuru.nama);
                    setViewSiswaGuru(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-xs border border-purple-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Tabel Plotting Siswa</span>
                </button>
              )}
              <button
                onClick={() => setViewSiswaGuru(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors ml-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS GURU */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  Hapus Data Guru Pembimbing?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan menghapus akun dan profil guru dari sistem.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900 text-sm">{deleteCandidate.nama}</p>
              <p className="font-mono text-slate-600">NIP/NIK: {deleteCandidate.nip}</p>
              <p className="text-slate-600">Email: {deleteCandidate.emailLogin}</p>
            </div>

            {calculateGuruStats(deleteCandidate, siswaList, plottingList).jumlahSiswaBimbingan > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Perhatian: Saat ini guru ini tercatat membimbing <b>{calculateGuruStats(deleteCandidate, siswaList, plottingList).jumlahSiswaBimbingan} siswa</b> di Master Siswa PKL.
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
                Ya, Hapus Guru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Excel Master Guru Pembimbing */}
      <UploadGuruModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          onCloseUpload?.();
        }}
        existingGuruList={guruList}
        onSuccess={(count, message) => {
          setIsUploadModalOpen(false);
          onCloseUpload?.();
          onGuruUpdated();
          setToastMessage(message || `Berhasil mengimpor ${count} data guru pembimbing.`);
          setTimeout(() => setToastMessage(null), 4000);
          checkDb();
        }}
        onOpenSupabaseModal={onOpenSupabaseModal}
      />

      {/* MODAL SKRIP SQL SCHEMA MASTER GURU PEMBIMBING */}
      {showSQLModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Code className="w-5 h-5 text-purple-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Skrip SQL Tabel Master Guru Pembimbing</h3>
                  <p className="text-xs text-purple-200">
                    Jalankan skrip ini di Supabase SQL Editor agar data guru pembimbing otomatis tersimpan di cloud
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSQLModal(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
                <p className="font-bold mb-1">Panduan Menjalankan di Supabase:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>Buka <b>Dashboard Supabase</b> proyek Anda.</li>
                  <li>Pilih menu <b>SQL Editor</b> di sidebar kiri &gt; klik <b>New query</b>.</li>
                  <li>Salin seluruh skrip di bawah ini lalu tempel (paste) ke editor.</li>
                  <li>Klik tombol hijau <b>Run</b>. Tabel guru dan izin RLS akan aktif permanen.</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono max-h-72 overflow-y-auto border border-slate-800 leading-relaxed">
                  {generateGuruSQLScript()}
                </pre>
                <button
                  type="button"
                  onClick={handleCopySQL}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  {copiedSQL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSQL ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-700 hover:text-purple-900 font-bold text-xs flex items-center gap-1.5 underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Supabase Dashboard</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await checkDb();
                      if (dbStatus.tableExists) {
                        setToastMessage('Tabel master_guru_pembimbing aktif di Supabase!');
                        setShowSQLModal(false);
                      }
                    }}
                    disabled={isCheckingDb}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
                    <span>Periksa Ulang Status</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncToSupabase}
                    disabled={isSyncing}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data Sekarang'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setShowSQLModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
