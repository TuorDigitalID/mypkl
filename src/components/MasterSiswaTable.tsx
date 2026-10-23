import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  KeyRound, 
  Mail, 
  GraduationCap, 
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  ShieldAlert,
  Layers,
  ArrowRight,
  Building2,
  Briefcase,
  MapPin,
  Compass
} from 'lucide-react';
import { MasterSiswaPKL, MasterJurusan, MasterInstansi, MasterGuruPembimbing } from '../types/index.ts';
import { saveMasterSiswa, deleteMasterSiswa } from '../lib/supabase.ts';
import { UploadExcelModal } from './UploadExcelModal.tsx';
import { findJurusanByNameOrCode, getJurusanColorTheme } from '../utils/jurusanUtils.ts';
import { calculateInstansiStats, findInstansiByName } from '../utils/instansiUtils.ts';

interface MasterSiswaTableProps {
  siswaList: MasterSiswaPKL[];
  jurusanList?: MasterJurusan[];
  instansiList?: MasterInstansi[];
  guruList?: MasterGuruPembimbing[];
  onSiswaUpdated: () => void;
  onJadwalkanSidang?: (siswa: MasterSiswaPKL) => void;
  onOpenSupabaseModal?: () => void;
  onNavigateToJurusan?: () => void;
  onNavigateToInstansi?: () => void;
  onNavigateToGuru?: () => void;
  onNavigateToPlotting?: () => void;
  filterJurusanParam?: string;
  filterInstansiParam?: string;
  filterGuruParam?: string;
  initialOpenUpload?: boolean;
  onCloseUpload?: () => void;
}

export const MasterSiswaTable: React.FC<MasterSiswaTableProps> = ({
  siswaList,
  jurusanList = [],
  instansiList = [],
  guruList = [],
  onSiswaUpdated,
  onOpenSupabaseModal,
  onNavigateToJurusan,
  onNavigateToInstansi,
  onNavigateToGuru,
  onNavigateToPlotting,
  filterJurusanParam,
  filterInstansiParam,
  filterGuruParam,
  initialOpenUpload,
  onCloseUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState<string>(filterJurusanParam || 'semua');
  const [selectedInstansi, setSelectedInstansi] = useState<string>(filterInstansiParam || 'semua');
  const [selectedGuru, setSelectedGuru] = useState<string>(filterGuruParam || 'semua');
  const [selectedKelas, setSelectedKelas] = useState<string>('semua');
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for Add / Edit / Upload Excel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Auto-open upload modal if triggered externally
  React.useEffect(() => {
    if (initialOpenUpload) {
      setIsUploadModalOpen(true);
    }
  }, [initialOpenUpload]);
  const [editingSiswa, setEditingSiswa] = useState<MasterSiswaPKL | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MasterSiswaPKL | null>(null);

  const [formData, setFormData] = useState({
    nisn: '',
    namaLengkap: '',
    kelas: 'XII RPL 1',
    jurusan: 'Rekayasa Perangkat Lunak',
    instansiId: '',
    instansiNama: '',
    pembimbingInstansi: '',
    emailLogin: '',
    passwordLogin: '',
    guruPembimbing: guruList[0]?.nama || '',
  });
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync if filterJurusanParam changes from parent (e.g. from Master Jurusan table)
  React.useEffect(() => {
    if (filterJurusanParam) {
      setSelectedJurusan(filterJurusanParam);
    }
  }, [filterJurusanParam]);

  // Sync if filterInstansiParam changes from parent (e.g. from Master Instansi table)
  React.useEffect(() => {
    if (filterInstansiParam) {
      setSelectedInstansi(filterInstansiParam);
    }
  }, [filterInstansiParam]);

  // Sync if filterGuruParam changes from parent (e.g. from Master Guru table)
  React.useEffect(() => {
    if (filterGuruParam) {
      setSelectedGuru(filterGuruParam);
    }
  }, [filterGuruParam]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isUploadModalOpen) setIsUploadModalOpen(false);
        if (deleteCandidate) setDeleteCandidate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isUploadModalOpen, deleteCandidate]);

  // Available unique jurusan, instansi, & kelas for filters
  const jurusanOptions = useMemo(() => {
    const fromMaster = jurusanList.map((j) => j.nama);
    const fromSiswa = siswaList.map((s) => s.jurusan);
    const list = Array.from(new Set([...fromMaster, ...fromSiswa])).filter(Boolean);
    return ['semua', ...list];
  }, [siswaList, jurusanList]);

  const instansiOptions = useMemo(() => {
    const fromMaster = instansiList.map((i) => i.nama);
    const fromSiswa = siswaList.map((s) => s.instansiNama).filter(Boolean) as string[];
    const list = Array.from(new Set([...fromMaster, ...fromSiswa])).filter(Boolean);
    return ['semua', ...list];
  }, [siswaList, instansiList]);

  const kelasOptions = useMemo(() => {
    const list = Array.from(new Set(siswaList.map((s) => s.kelas))).filter(Boolean);
    return ['semua', ...list];
  }, [siswaList]);

  const guruOptions = useMemo(() => {
    const fromMaster = (guruList || []).map((g) => g.nama);
    const fromSiswa = siswaList.map((s) => s.guruPembimbing).filter(Boolean);
    const list = Array.from(new Set([...fromMaster, ...fromSiswa])).filter(Boolean);
    return ['semua', ...list];
  }, [siswaList, guruList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return siswaList.filter((item) => {
      const matchSearch =
        item.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.emailLogin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guruPembimbing.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.instansiNama && item.instansiNama.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.pembimbingInstansi && item.pembimbingInstansi.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchJurusan = selectedJurusan === 'semua' || item.jurusan === selectedJurusan;
      const matchKelas = selectedKelas === 'semua' || item.kelas === selectedKelas;
      const matchInstansi = selectedInstansi === 'semua' || item.instansiNama === selectedInstansi;
      const matchGuru = selectedGuru === 'semua' || item.guruPembimbing === selectedGuru;

      return matchSearch && matchJurusan && matchKelas && matchInstansi && matchGuru;
    });
  }, [siswaList, searchTerm, selectedJurusan, selectedKelas, selectedInstansi, selectedGuru]);

  // Selected Jurusan detail for Form Modal
  const selectedFormJurusanObj = useMemo(() => {
    return findJurusanByNameOrCode(jurusanList, formData.jurusan);
  }, [jurusanList, formData.jurusan]);

  // Selected Instansi detail for Form Modal
  const selectedFormInstansiObj = useMemo(() => {
    if (!formData.instansiNama) return undefined;
    return findInstansiByName(instansiList, formData.instansiNama);
  }, [instansiList, formData.instansiNama]);

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToastMessage(`${label} berhasil disalin!`);
    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2000);
  };

  const handleOpenAddModal = () => {
    setEditingSiswa(null);
    const defaultJurusan = jurusanList.find((j) => j.isActive) || jurusanList[0];
    const initialNisn = `006${Math.floor(1000000 + Math.random() * 9000000)}`;
    const jurusanName = defaultJurusan ? defaultJurusan.nama : 'Rekayasa Perangkat Lunak';
    const kode = defaultJurusan ? defaultJurusan.kode : 'RPL';
    const defaultInstansi = instansiList[0];

    setFormData({
      nisn: initialNisn,
      namaLengkap: '',
      kelas: `XII ${kode} 1`,
      jurusan: jurusanName,
      instansiId: defaultInstansi?.id || '',
      instansiNama: defaultInstansi?.nama || '',
      pembimbingInstansi: defaultInstansi?.pembimbingInstansi || '',
      emailLogin: `siswa.${initialNisn.slice(-4)}@smk.belajar.id`,
      passwordLogin: `Pkl#${Math.floor(1000 + Math.random() * 9000)}`,
      guruPembimbing: guruList[0]?.nama || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (siswa: MasterSiswaPKL) => {
    setEditingSiswa(siswa);
    setFormData({
      nisn: siswa.nisn,
      namaLengkap: siswa.namaLengkap,
      kelas: siswa.kelas,
      jurusan: siswa.jurusan,
      instansiId: siswa.instansiId || '',
      instansiNama: siswa.instansiNama || '',
      pembimbingInstansi: siswa.pembimbingInstansi || '',
      emailLogin: siswa.emailLogin,
      passwordLogin: siswa.passwordLogin,
      guruPembimbing: siswa.guruPembimbing,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    const nama = deleteCandidate.namaLengkap;
    await deleteMasterSiswa(deleteCandidate.id);
    setDeleteCandidate(null);
    onSiswaUpdated();
    setToastMessage(`Data siswa ${nama} berhasil dihapus.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleJurusanChangeInForm = (newJurusanNama: string) => {
    const matchedJurusan = findJurusanByNameOrCode(jurusanList, newJurusanNama);
    setFormData((prev) => {
      const next = { ...prev, jurusan: newJurusanNama };
      // Jika mode tambah siswa baru dan kelas masih default, sesuaikan kelas dengan kode jurusan
      if (!editingSiswa && matchedJurusan) {
        next.kelas = `XII ${matchedJurusan.kode} 1`;
      }
      return next;
    });
  };

  const handleInstansiChangeInForm = (selectedNama: string) => {
    const matchedInstansi = instansiList.find((i) => i.nama === selectedNama);
    setFormData((prev) => ({
      ...prev,
      instansiNama: selectedNama,
      instansiId: matchedInstansi ? matchedInstansi.id : '',
      pembimbingInstansi: matchedInstansi ? matchedInstansi.pembimbingInstansi : prev.pembimbingInstansi,
    }));
  };

  const handleGenerateCredentials = () => {
    const cleanNisn = formData.nisn.trim() || `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const slug = formData.namaLengkap
      ? formData.namaLengkap.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '')
      : 'siswa';
    
    setFormData((prev) => ({
      ...prev,
      nisn: cleanNisn,
      emailLogin: `${slug}.${cleanNisn.slice(-4)}@smk.belajar.id`,
      passwordLogin: `Pkl#${slug.charAt(0).toUpperCase() + slug.slice(1)}${Math.floor(100 + Math.random() * 900)}`,
    }));
  };

  const handleSaveSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nisn.trim() || !formData.namaLengkap.trim() || !formData.emailLogin.trim() || !formData.passwordLogin.trim()) {
      setFormError('Harap lengkapi semua kolom wajib (NISN, Nama, Email, Password).');
      return;
    }

    const payload: MasterSiswaPKL = {
      id: editingSiswa ? editingSiswa.id : `ms-${Date.now()}`,
      nisn: formData.nisn.trim(),
      namaLengkap: formData.namaLengkap.trim(),
      kelas: formData.kelas.trim(),
      jurusan: formData.jurusan.trim(),
      instansiId: formData.instansiId || undefined,
      instansiNama: formData.instansiNama?.trim() || undefined,
      pembimbingInstansi: formData.pembimbingInstansi?.trim() || undefined,
      emailLogin: formData.emailLogin.trim(),
      passwordLogin: formData.passwordLogin.trim(),
      guruPembimbing: formData.guruPembimbing.trim(),
      createdAt: editingSiswa?.createdAt || new Date().toISOString(),
    };

    await saveMasterSiswa(payload);
    setIsModalOpen(false);
    onSiswaUpdated();
    setToastMessage(editingSiswa ? 'Data siswa berhasil diperbarui.' : 'Siswa baru berhasil ditambahkan.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Lengkap',
      'Kelas',
      'Program Keahlian',
      'Instansi / Perusahaan PKL',
      'Pembimbing Instansi (DUDI)',
      'Email Login',
      'Password Login',
      'Guru Pembimbing Sekolah'
    ];

    const escapeCSV = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredList.map((s, index) => [
      index + 1,
      s.nisn,
      escapeCSV(s.namaLengkap),
      s.kelas,
      escapeCSV(s.jurusan),
      escapeCSV(s.instansiNama || 'Belum Ditempatkan'),
      escapeCSV(s.pembimbingInstansi || '-'),
      s.emailLogin,
      s.passwordLogin,
      escapeCSV(s.guruPembimbing)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Data_Siswa_PKL_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Data Master Siswa PKL</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {siswaList.length} Siswa Terdaftar
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan akun login siswa, NISN, rombel kelas, program keahlian, penempatan instansi DUDI, dan pembimbing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          {onNavigateToInstansi && (
            <button
              onClick={onNavigateToInstansi}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs transition-colors shadow-xs"
              title="Kelola Data Master Instansi Perusahaan"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Master Instansi ({instansiList.length})</span>
            </button>
          )}

          {onNavigateToGuru && (
            <button
              onClick={onNavigateToGuru}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-semibold text-xs transition-colors shadow-xs"
              title="Kelola Data Master Guru Pembimbing"
            >
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Master Guru ({guruList.length})</span>
            </button>
          )}

          {onNavigateToJurusan && (
            <button
              onClick={onNavigateToJurusan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold text-xs transition-colors shadow-xs"
              title="Kelola Data Master Jurusan"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Master Jurusan ({jurusanList.length})</span>
            </button>
          )}

          {onNavigateToPlotting && (
            <button
              onClick={onNavigateToPlotting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-xs transition-colors shadow-xs"
              title="Buka Menu Plotting & Penempatan Siswa PKL"
            >
              <Compass className="w-4 h-4 text-teal-600" />
              <span>Plotting PKL</span>
            </button>
          )}

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-xs transition-colors shadow-xs"
            title="Upload Excel Siswa PKL"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-700" />
            <span>Upload Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa PKL</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari NISN, Nama, Instansi, atau Pembimbing..."
            aria-label="Cari data master siswa"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
          />
        </div>

        {/* Filter Dropdowns and Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Jurusan */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Jurusan:</span>
            <select
              value={selectedJurusan}
              onChange={(e) => setSelectedJurusan(e.target.value)}
              aria-label="Filter Jurusan"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {jurusanOptions.map((j) => (
                <option key={j} value={j}>
                  {j === 'semua' ? 'Semua Jurusan' : j}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Instansi */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Instansi:</span>
            <select
              value={selectedInstansi}
              onChange={(e) => setSelectedInstansi(e.target.value)}
              aria-label="Filter Instansi"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px] truncate"
            >
              {instansiOptions.map((i) => (
                <option key={i} value={i}>
                  {i === 'semua' ? 'Semua Instansi' : i}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Guru Pembimbing */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Guru:</span>
            <select
              value={selectedGuru}
              onChange={(e) => setSelectedGuru(e.target.value)}
              aria-label="Filter Guru Pembimbing"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-purple-500 max-w-[180px] truncate"
            >
              {guruOptions.map((g) => (
                <option key={g} value={g}>
                  {g === 'semua' ? 'Semua Guru' : g}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Kelas:</span>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              aria-label="Filter Kelas"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {kelasOptions.map((k) => (
                <option key={k} value={k}>
                  {k === 'semua' ? 'Semua Kelas' : k}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Password Visibility */}
          <button
            type="button"
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              showAllPasswords
                ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAllPasswords ? 'Tutup Password' : 'Lihat Semua Password'}</span>
          </button>
        </div>
      </div>

      {/* Main Table: Master Siswa PKL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-3 text-center">Kelas</th>
                <th className="py-3 px-4">Program Keahlian</th>
                <th className="py-3 px-4 min-w-[200px]">Instansi / Tempat PKL</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4">Password Login</th>
                <th className="py-3 px-4">Guru Pembimbing</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((siswa, index) => {
                const isPasswordRevealed = showAllPasswords || revealedPasswords[siswa.id];
                const isCopied = copiedId === siswa.id;
                const matchedJurusan = findJurusanByNameOrCode(jurusanList, siswa.jurusan);
                const theme = getJurusanColorTheme(matchedJurusan?.kode || siswa.jurusan);

                return (
                  <tr key={siswa.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. No */}
                    <td className="py-3.5 px-3.5 text-center font-mono font-medium text-slate-400">
                      {index + 1}
                    </td>

                    {/* 2. NISN */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{siswa.nisn}</span>
                        <button
                          onClick={() => handleCopy(siswa.nisn, `${siswa.id}-nisn`, 'NISN')}
                          title="Salin NISN"
                          className="text-slate-400 hover:text-emerald-600 p-0.5 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* 3. Nama Lengkap */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm">{siswa.namaLengkap}</p>
                    </td>

                    {/* 4. Kelas */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        {siswa.kelas}
                      </span>
                    </td>

                    {/* 5. Jurusan (Terkoneksi ke Master Jurusan) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-black font-mono text-[11px] border ${theme.badge}`}>
                          {matchedJurusan ? matchedJurusan.kode : (siswa.jurusan.length > 5 ? siswa.jurusan.slice(0, 4).toUpperCase() : siswa.jurusan.toUpperCase())}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedJurusan(siswa.jurusan)}
                          className="font-semibold text-slate-800 text-xs hover:text-blue-600 hover:underline text-left cursor-pointer transition-colors"
                          title={`Klik untuk filter siswa jurusan ${siswa.jurusan}`}
                        >
                          {siswa.jurusan}
                        </button>
                      </div>
                    </td>

                    {/* 6. Instansi / Tempat PKL (Terkoneksi ke Master Instansi) */}
                    <td className="py-3.5 px-4">
                      {siswa.instansiNama ? (
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInstansi(siswa.instansiNama || 'semua')}
                            className="flex items-start gap-1.5 text-left group cursor-pointer"
                            title={`Filter siswa di ${siswa.instansiNama}`}
                          >
                            <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 group-hover:underline text-xs leading-tight">
                              {siswa.instansiNama}
                            </span>
                          </button>
                          {siswa.pembimbingInstansi && (
                            <p className="text-[11px] text-slate-500 pl-5 flex items-center gap-1">
                              <span className="text-slate-400">DUDI:</span>
                              <span className="font-medium text-slate-700">{siswa.pembimbingInstansi}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Belum Ditempatkan
                        </span>
                      )}
                    </td>

                    {/* 7. Email Login */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[170px]">{siswa.emailLogin}</span>
                        <button
                          onClick={() => handleCopy(siswa.emailLogin, `${siswa.id}-email`, 'Email')}
                          title="Salin Email"
                          className="text-slate-400 hover:text-emerald-600 p-0.5 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* 8. Password Login (with Peek & Copy) */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-2 py-1 rounded-lg w-fit">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-800">
                          {isPasswordRevealed ? siswa.passwordLogin : '••••••••'}
                        </span>
                        
                        {/* Toggle visibility */}
                        <button
                          type="button"
                          onClick={() => togglePasswordReveal(siswa.id)}
                          title={isPasswordRevealed ? 'Sembunyikan password' : 'Lihat password'}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          {isPasswordRevealed ? (
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Copy password */}
                        <button
                          type="button"
                          onClick={() => handleCopy(siswa.passwordLogin, siswa.id, 'Password')}
                          title="Salin password"
                          className="text-slate-400 hover:text-emerald-600 p-0.5"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 9. Guru Pembimbing (Sekolah) */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span>{siswa.guruPembimbing}</span>
                      </div>
                    </td>

                    {/* 10. Aksi: Edit & Hapus */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(siswa)}
                          title="Edit Siswa"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(siswa)}
                          title="Hapus Siswa"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{filteredList.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{siswaList.length}</span> siswa terdaftar.
          </div>
          {(selectedJurusan !== 'semua' || selectedInstansi !== 'semua' || selectedKelas !== 'semua') && (
            <button
              onClick={() => {
                setSelectedJurusan('semua');
                setSelectedInstansi('semua');
                setSelectedKelas('semua');
                setSearchTerm('');
              }}
              className="text-emerald-700 hover:underline font-bold"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT SISWA PKL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-200" />
                <h3 className="font-extrabold text-base">
                  {editingSiswa ? 'Edit Data Siswa PKL' : 'Tambah Siswa PKL Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSiswa} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NISN Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="Contoh: 0061234567"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaLengkap}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    placeholder="Nama Lengkap Siswa"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas *</label>
                  <input
                    type="text"
                    required
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    placeholder="Contoh: XII RPL 1"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jurusan (Terhubung ke Master) *</label>
                  <select
                    value={formData.jurusan}
                    onChange={(e) => handleJurusanChangeInForm(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {jurusanList && jurusanList.length > 0 ? (
                      jurusanList
                        .filter((j) => j.isActive)
                        .map((j) => (
                          <option key={j.id} value={j.nama}>
                            {j.kode} - {j.nama}
                          </option>
                        ))
                    ) : (
                      <>
                        <option value="Rekayasa Perangkat Lunak">RPL - Rekayasa Perangkat Lunak</option>
                        <option value="Teknik Komputer & Jaringan">TKJ - Teknik Komputer & Jaringan</option>
                        <option value="Sistem Informasi Jaringan & Aplikasi">SIJA - Sistem Informasi Jaringan & Aplikasi</option>
                        <option value="Desain Komunikasi Visual">DKV - Desain Komunikasi Visual</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Live Preview Card: Jurusan Terkoneksi */}
              {selectedFormJurusanObj && (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <span className={`px-2 py-0.5 rounded-md font-black font-mono text-[10px] border ${getJurusanColorTheme(selectedFormJurusanObj.kode).badge}`}>
                    {selectedFormJurusanObj.kode}
                  </span>
                  <div className="flex-1 leading-tight">
                    <p className="font-bold text-blue-950">{selectedFormJurusanObj.nama}</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Kaprog: <span className="font-semibold">{selectedFormJurusanObj.kepalaProgram || '-'}</span> • Bidang: {selectedFormJurusanObj.bidangKeahlian}
                    </p>
                  </div>
                </div>
              )}

              {/* Instansi / Perusahaan PKL (Terhubung ke Master Instansi) */}
              <div className="p-3 bg-blue-50/60 border border-blue-200/90 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Instansi / Perusahaan Tempat PKL</span>
                  </span>
                  {onNavigateToInstansi && (
                    <button
                      type="button"
                      onClick={onNavigateToInstansi}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      <span>Lihat Master Instansi</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pilih Perusahaan Mitra DUDI</label>
                    <select
                      value={formData.instansiNama}
                      onChange={(e) => handleInstansiChangeInForm(e.target.value)}
                      className="w-full p-2 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs font-semibold"
                    >
                      <option value="">-- Pilih Instansi / Perusahaan --</option>
                      {instansiList.map((inst) => {
                        const stats = calculateInstansiStats(inst, siswaList);
                        return (
                          <option key={inst.id} value={inst.nama}>
                            {inst.nama} ({stats.sisaKuota > 0 ? `${stats.sisaKuota} sisa slot` : 'Penuh'})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nama Pembimbing Instansi (DUDI)</label>
                    <input
                      type="text"
                      value={formData.pembimbingInstansi}
                      onChange={(e) => setFormData({ ...formData, pembimbingInstansi: e.target.value })}
                      placeholder="Contoh: Bambang Prasetyo, S.T."
                      className="w-full p-2 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Preview Selected Instansi Details */}
                {selectedFormInstansiObj && (
                  <div className="pt-2 border-t border-blue-200/60 flex items-start gap-2 text-[11px] text-blue-900 leading-tight">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Alamat:</span> {selectedFormInstansiObj.alamat}
                      <span className="block mt-0.5 text-blue-700 font-medium">
                        Kuota Total: <b>{selectedFormInstansiObj.kuota} Siswa</b> • Bidang Usaha: {selectedFormInstansiObj.bidangUsaha || '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Login Credentials & Generator */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Akun Akses Portal Siswa</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateCredentials}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Otomatis</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Email Login *</label>
                    <input
                      type="email"
                      required
                      value={formData.emailLogin}
                      onChange={(e) => setFormData({ ...formData, emailLogin: e.target.value })}
                      placeholder="nama@smk.belajar.id"
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Password Login *</label>
                    <input
                      type="text"
                      required
                      value={formData.passwordLogin}
                      onChange={(e) => setFormData({ ...formData, passwordLogin: e.target.value })}
                      placeholder="Password login siswa"
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Guru Pembimbing Sekolah */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Guru Pembimbing Sekolah *</label>
                <select
                  value={formData.guruPembimbing}
                  onChange={(e) => setFormData({ ...formData, guruPembimbing: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {guruList && guruList.length > 0 ? (
                    guruList.map((g) => (
                      <option key={g.id} value={g.nama}>
                        {g.nama} {g.bidangStudi ? `— ${g.bidangStudi}` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="">Belum ada data guru pembimbing (Tambahkan di Master Guru)</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  {editingSiswa ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS SISWA */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  Hapus Data Siswa PKL?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan menghapus akun dan rekam data siswa dari sistem.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900 text-sm">{deleteCandidate.namaLengkap}</p>
              <p className="font-mono text-slate-600">NISN: {deleteCandidate.nisn} • Kelas: {deleteCandidate.kelas}</p>
              <p className="text-slate-600">{deleteCandidate.jurusan}</p>
              {deleteCandidate.instansiNama && (
                <p className="text-blue-700 font-semibold pt-1">
                  Tempat PKL: {deleteCandidate.instansiNama}
                </p>
              )}
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
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Excel */}
      <UploadExcelModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          onCloseUpload?.();
        }}
        onSuccess={(_count, _msg) => {
          setIsUploadModalOpen(false);
          onCloseUpload?.();
          onSiswaUpdated();
        }}
        onOpenSupabaseModal={onOpenSupabaseModal}
      />

    </div>
  );
};
