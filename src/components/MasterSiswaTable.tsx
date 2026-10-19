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
  ArrowRight
} from 'lucide-react';
import { MasterSiswaPKL, MasterJurusan } from '../types/index.ts';
import { saveMasterSiswa, deleteMasterSiswa } from '../lib/supabase.ts';
import { DAFTAR_PENGUJI } from '../data/penguji.ts';
import { UploadExcelModal } from './UploadExcelModal.tsx';
import { findJurusanByNameOrCode, getJurusanColorTheme } from '../utils/jurusanUtils.ts';

interface MasterSiswaTableProps {
  siswaList: MasterSiswaPKL[];
  jurusanList?: MasterJurusan[];
  onSiswaUpdated: () => void;
  onJadwalkanSidang?: (siswa: MasterSiswaPKL) => void;
  onOpenSupabaseModal?: () => void;
  onNavigateToJurusan?: () => void;
  filterJurusanParam?: string;
}

export const MasterSiswaTable: React.FC<MasterSiswaTableProps> = ({
  siswaList,
  jurusanList = [],
  onSiswaUpdated,
  onOpenSupabaseModal,
  onNavigateToJurusan,
  filterJurusanParam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState<string>(filterJurusanParam || 'semua');
  const [selectedKelas, setSelectedKelas] = useState<string>('semua');
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for Add / Edit / Upload Excel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<MasterSiswaPKL | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MasterSiswaPKL | null>(null);

  const [formData, setFormData] = useState({
    nisn: '',
    namaLengkap: '',
    kelas: 'XII RPL 1',
    jurusan: 'Rekayasa Perangkat Lunak',
    emailLogin: '',
    passwordLogin: '',
    guruPembimbing: DAFTAR_PENGUJI[0]?.nama || 'Dr. Ir. Hendra Kurniawan, M.T.',
  });
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync if filterJurusanParam changes from parent (e.g. from Master Jurusan table)
  React.useEffect(() => {
    if (filterJurusanParam) {
      setSelectedJurusan(filterJurusanParam);
    }
  }, [filterJurusanParam]);

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

  // Available unique jurusan & kelas for filters
  const jurusanOptions = useMemo(() => {
    const fromMaster = jurusanList.map((j) => j.nama);
    const fromSiswa = siswaList.map((s) => s.jurusan);
    const list = Array.from(new Set([...fromMaster, ...fromSiswa])).filter(Boolean);
    return ['semua', ...list];
  }, [siswaList, jurusanList]);

  const kelasOptions = useMemo(() => {
    const list = Array.from(new Set(siswaList.map((s) => s.kelas))).filter(Boolean);
    return ['semua', ...list];
  }, [siswaList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return siswaList.filter((item) => {
      const matchSearch =
        item.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.emailLogin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guruPembimbing.toLowerCase().includes(searchTerm.toLowerCase());

      const matchJurusan = selectedJurusan === 'semua' || item.jurusan === selectedJurusan;
      const matchKelas = selectedKelas === 'semua' || item.kelas === selectedKelas;

      return matchSearch && matchJurusan && matchKelas;
    });
  }, [siswaList, searchTerm, selectedJurusan, selectedKelas]);

  // Selected Jurusan detail for Form Modal
  const selectedFormJurusanObj = useMemo(() => {
    return findJurusanByNameOrCode(jurusanList, formData.jurusan);
  }, [jurusanList, formData.jurusan]);

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

    setFormData({
      nisn: initialNisn,
      namaLengkap: '',
      kelas: `XII ${kode} 1`,
      jurusan: jurusanName,
      emailLogin: `siswa.${initialNisn.slice(-4)}@smk.belajar.id`,
      passwordLogin: `Pkl#${Math.floor(1000 + Math.random() * 9000)}`,
      guruPembimbing: DAFTAR_PENGUJI[0]?.nama || 'Dr. Ir. Hendra Kurniawan, M.T.',
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

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Lengkap',
      'Kelas',
      'Jurusan',
      'Email Login',
      'Password Login',
      'Guru Pembimbing',
    ];

    const rows = filteredList.map((item, idx) => [
      idx + 1,
      `"${item.nisn}"`,
      `"${item.namaLengkap}"`,
      `"${item.kelas}"`,
      `"${item.jurusan}"`,
      `"${item.emailLogin}"`,
      `"${item.passwordLogin}"`,
      `"${item.guruPembimbing}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-150">
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
                Pengelolaan akun login siswa, NISN, rombel kelas, program keahlian terintegrasi, dan guru pembimbing sekolah.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          {onNavigateToJurusan && (
            <button
              onClick={onNavigateToJurusan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs transition-colors shadow-xs"
              title="Kelola Data Master Jurusan"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Master Jurusan ({jurusanList.length})</span>
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
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
            placeholder="Cari NISN, Nama Lengkap, Email, atau Guru..."
            aria-label="Cari data master siswa"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
          />
        </div>

        {/* Filter Dropdowns and Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
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

          {/* Toggle Reveal All Passwords */}
          <button
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              showAllPasswords
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {showAllPasswords ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showAllPasswords ? 'Sembunyikan Semua Password' : 'Lihat Semua Password'}</span>
          </button>
        </div>
      </div>

      {/* Main Table: Exact Columns Requested with connected Jurusan badge */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-4 font-mono">NISN</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-3 text-center">Kelas</th>
                <th className="py-3 px-4">Program Keahlian (Jurusan)</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4">Password Login</th>
                <th className="py-3 px-4">Guru Pembimbing</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
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

                    {/* 6. Email Login */}
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

                    {/* 7. Password Login (with Peek & Copy) */}
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

                    {/* 8. Guru Pembimbing */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span>{siswa.guruPembimbing}</span>
                      </div>
                    </td>

                    {/* Aksi: Edit & Hapus */}
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

        {filteredList.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-800">Tidak ada data siswa yang cocok.</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        )}
      </div>

      {/* Modal: Tambah / Edit Siswa Master */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>{editingSiswa ? 'Edit Data Siswa PKL' : 'Tambah Data Master Siswa PKL'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveSiswa} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NISN (10 Digit) *</label>
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

              {/* Guru Pembimbing */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Guru Pembimbing Sekolah *</label>
                <select
                  value={formData.guruPembimbing}
                  onChange={(e) => setFormData({ ...formData, guruPembimbing: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {DAFTAR_PENGUJI.map((p) => (
                    <option key={p.id} value={p.nama}>
                      {p.nama} ({p.peran})
                    </option>
                  ))}
                  <option value="Dra. Sri Wahyuni, M.Pd.">Dra. Sri Wahyuni, M.Pd.</option>
                  <option value="Ahmad Zulfikar, S.T., M.Kom.">Ahmad Zulfikar, S.T., M.Kom.</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
                >
                  {editingSiswa ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Siswa (No window.confirm) */}
      {deleteCandidate && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteCandidate(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <h3 className="font-extrabold text-slate-900 text-base">
              Hapus Data Siswa PKL?
            </h3>
            
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Anda akan menghapus data siswa <strong className="text-slate-900">{deleteCandidate.namaLengkap}</strong> (NISN: <span className="font-mono">{deleteCandidate.nisn}</span>). Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold text-xs text-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
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
        onClose={() => setIsUploadModalOpen(false)}
        onOpenSupabaseModal={onOpenSupabaseModal}
        onSuccess={(count, message) => {
          onSiswaUpdated();
          setToastMessage(message || `Berhasil mengimpor ${count} data siswa dari Excel!`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

    </div>
  );
};
