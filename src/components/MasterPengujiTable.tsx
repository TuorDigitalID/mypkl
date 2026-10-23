import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  RotateCcw, 
  UserCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  X, 
  Grid, 
  List,
  AlertTriangle,
  Briefcase,
  DoorOpen,
  Settings2
} from 'lucide-react';
import { Penguji, PenilaianPenguji, AuthUser, MasterGuruPembimbing, PasanganPengujiRuangan } from '../types/index.ts';
import { generateUUID, isValidUUID, getDefaultRoomPairings } from '../lib/supabase.ts';
import { AturPengujiRuanganModal } from './AturPengujiRuanganModal.tsx';

interface MasterPengujiTableProps {
  pengujiList: Penguji[];
  penilaianList: PenilaianPenguji[];
  activePenguji: Penguji;
  currentUser: AuthUser | null;
  guruList?: MasterGuruPembimbing[];
  roomPairings?: PasanganPengujiRuangan[];
  onSetActivePenguji: (p: Penguji) => void;
  onSavePenguji: (p: Penguji) => Promise<void>;
  onDeletePenguji: (id: string) => Promise<void>;
  onResetDefault: () => Promise<void>;
  onOpenLoginModal: () => void;
  onSaveRoomPairings?: (pairings: PasanganPengujiRuangan[]) => Promise<void>;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
];

export const MasterPengujiTable: React.FC<MasterPengujiTableProps> = ({
  pengujiList,
  penilaianList,
  activePenguji,
  currentUser,
  guruList = [],
  roomPairings = [],
  onSetActivePenguji,
  onSavePenguji,
  onDeletePenguji,
  onResetDefault,
  onOpenLoginModal,
  onSaveRoomPairings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeran, setFilterPeran] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State for Assigning from Guru Pembimbing
  const [isAssignGuruModalOpen, setIsAssignGuruModalOpen] = useState(false);
  const [guruSearchQuery, setGuruSearchQuery] = useState('');

  // Modal State for Room Pairings (Ruang 1, 2, 3)
  const [isAturRuanganModalOpen, setIsAturRuanganModalOpen] = useState(false);

  // Effective room pairings list
  const effectivePairings = useMemo(() => {
    if (roomPairings && roomPairings.length >= 3) return roomPairings;
    return getDefaultRoomPairings(pengujiList);
  }, [roomPairings, pengujiList]);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPenguji, setEditingPenguji] = useState<Penguji | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [peran, setPeran] = useState('Penguji 3 (Anggota)');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telepon, setTelepon] = useState('');
  const [instansiAsal, setInstansiAsal] = useState('SMK Negeri 1 Vokasi');
  const [bidangKeahlian, setBidangKeahlian] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [isActive, setIsActive] = useState(true);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pengujiList.length;
    const activeCount = pengujiList.filter((p) => p.isActive !== false).length;
    const ketuaCount = pengujiList.filter((p) => p.peran.toLowerCase().includes('ketua') || p.peran.includes('1')).length;
    const sekretarisCount = pengujiList.filter((p) => p.peran.toLowerCase().includes('sekretaris') || p.peran.includes('2')).length;
    const totalPenilaian = penilaianList.length;

    return { total, activeCount, ketuaCount, sekretarisCount, totalPenilaian };
  }, [pengujiList, penilaianList]);

  // Count evaluations per examiner
  const evaluationCounts = useMemo(() => {
    const map: Record<string, number> = {};
    penilaianList.forEach((p) => {
      map[p.pengujiId] = (map[p.pengujiId] || 0) + 1;
    });
    return map;
  }, [penilaianList]);

  // Filtered List
  const filteredPenguji = useMemo(() => {
    return pengujiList.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        p.nama.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.instansiAsal && p.instansiAsal.toLowerCase().includes(q));

      const matchPeran = 
        filterPeran === 'semua' ||
        (filterPeran === 'ketua' && (p.peran.toLowerCase().includes('ketua') || p.peran.includes('1'))) ||
        (filterPeran === 'sekretaris' && (p.peran.toLowerCase().includes('sekretaris') || p.peran.includes('2'))) ||
        (filterPeran === 'anggota' && (p.peran.toLowerCase().includes('anggota') || p.peran.includes('3'))) ||
        (filterPeran === 'dudi' && p.peran.toLowerCase().includes('dudi'));

      const matchStatus = 
        filterStatus === 'semua' ||
        (filterStatus === 'aktif' && p.isActive !== false) ||
        (filterStatus === 'nonaktif' && p.isActive === false);

      return matchSearch && matchPeran && matchStatus;
    });
  }, [pengujiList, searchQuery, filterPeran, filterStatus]);

  const handleOpenAddModal = () => {
    setEditingPenguji(null);
    setNama('');
    setNip('');
    setPeran('Penguji 3 (Anggota)');
    setEmail('');
    setPassword('');
    setTelepon('');
    setInstansiAsal('SMK Negeri 1 Vokasi');
    setBidangKeahlian('');
    setAvatar(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Penguji) => {
    setEditingPenguji(p);
    setNama(p.nama);
    setNip(p.nip);
    setPeran(p.peran);
    setEmail(p.email || '');
    setPassword('');
    setTelepon(p.telepon || '');
    setInstansiAsal(p.instansiAsal || 'SMK Negeri 1 Vokasi');
    setBidangKeahlian(p.bidangKeahlian || '');
    setAvatar(p.avatar || AVATAR_PRESETS[0]);
    setIsActive(p.isActive !== false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setFormError('Nama lengkap penguji wajib diisi.');
      return;
    }
    if (!nip.trim()) {
      setFormError('NIP / NIK penguji wajib diisi.');
      return;
    }

    // Check duplicate NIP
    const duplicate = pengujiList.find(
      (p) => p.nip.trim() === nip.trim() && (!editingPenguji || p.id !== editingPenguji.id)
    );
    if (duplicate) {
      setFormError(`NIP "${nip}" sudah digunakan oleh penguji lain (${duplicate.nama}).`);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const existingPass = editingPenguji?.password;
      const finalPass = password.trim() ? password.trim() : (existingPass || `smk${Math.floor(100000 + Math.random() * 900000)}`);

      const newOrUpdatedPenguji: Penguji = {
        id: editingPenguji && isValidUUID(editingPenguji.id) ? editingPenguji.id : generateUUID(),
        nama: nama.trim(),
        nip: nip.trim(),
        peran: peran.trim(),
        email: email.trim() || `${nip.trim()}@smk-vokasi.sch.id`,
        password: finalPass,
        telepon: telepon.trim() || '0812-0000-0000',
        instansiAsal: instansiAsal.trim(),
        bidangKeahlian: bidangKeahlian.trim(),
        avatar: avatar.trim(),
        isActive,
      };

      await onSavePenguji(newOrUpdatedPenguji);
      setIsModalOpen(false);
      setSuccessToast(`Data penguji "${newOrUpdatedPenguji.nama}" berhasil disimpan ke database.`);
      setTimeout(() => setSuccessToast(null), 4500);
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan data penguji.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Autofill form from selected MasterGuruPembimbing
  const handleSelectGuruToFill = (guru: MasterGuruPembimbing) => {
    setNama(guru.nama);
    setNip(guru.nip);
    setTelepon(guru.telepon || '');
    setEmail(guru.emailLogin || '');
    setPassword(guru.passwordLogin || '');
    setBidangKeahlian(guru.bidangStudi || 'Produktif & Kejuruan');
    if (guru.avatar) setAvatar(guru.avatar);
  };

  // Direct 1-Click Assignment of Guru as Examiner with specified role
  const handleAssignGuruDirectly = async (guru: MasterGuruPembimbing, peranSidang: string) => {
    try {
      setIsSubmitting(true);
      const cleanNip = guru.nip.replace(/\s+/g, '');
      const existing = pengujiList.find(
        (p) => p.nip.replace(/\s+/g, '') === cleanNip
      );
      const pengujiToSave: Penguji = {
        id: existing && isValidUUID(existing.id) ? existing.id : generateUUID(),
        nip: guru.nip,
        nama: guru.nama,
        peran: peranSidang,
        email: guru.emailLogin,
        password: guru.passwordLogin || 'penguji123',
        telepon: guru.telepon || '0812-0000-0000',
        instansiAsal: 'SMK Negeri 1 Vokasi',
        bidangKeahlian: guru.bidangStudi || 'Produktif & Kejuruan',
        avatar: guru.avatar || AVATAR_PRESETS[0],
        isActive: true,
      };
      await onSavePenguji(pengujiToSave);
      setSuccessToast(`Guru "${guru.nama}" berhasil ditugaskan sebagai ${peranSidang} ke database.`);
      setTimeout(() => setSuccessToast(null), 4500);
    } catch (err: any) {
      alert(err?.message || 'Gagal menugaskan guru sebagai penguji.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await onDeletePenguji(id);
      setDeletingId(null);
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus penguji.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Lengkap', 'NIP', 'Peran Sidang', 'Email', 'Telepon', 'Instansi', 'Bidang Keahlian', 'Status'];
    const rows = pengujiList.map((p) => [
      p.id,
      `"${p.nama.replace(/"/g, '""')}"`,
      `"${p.nip}"`,
      `"${p.peran}"`,
      p.email || '',
      p.telepon || '',
      `"${(p.instansiAsal || '').replace(/"/g, '""')}"`,
      `"${(p.bidangKeahlian || '').replace(/"/g, '""')}"`,
      p.isActive !== false ? 'Aktif' : 'Nonaktif',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Daftar_Penguji_Sidang_PKL_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Success Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner Card: Management Header & Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-100/40 via-amber-50/20 to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-center shadow-md shadow-orange-600/25 flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Manajemen & Hak Akses Penguji Sidang
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
                  User Management
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Kelola akun dewan penguji sidang PKL, peran (Ketua/Sekretaris/Anggota), kredensial login, dan pantau status pengujian.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* User Request 1: Ambil dari Tabel Guru Pembimbing */}
            {guruList && guruList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAssignGuruModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-2xs transition-all cursor-pointer"
                title="Tugaskan Guru Pembimbing menjadi Penguji Sidang"
              >
                <GraduationCap className="w-4 h-4 text-amber-700" />
                <span>Ambil dari Guru Pembimbing</span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-200 text-amber-900 text-[11px] font-black">
                  {guruList.length} Guru
                </span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Penguji Baru</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAturRuanganModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-orange-950 bg-orange-100 hover:bg-orange-200 border border-orange-300 shadow-2xs transition-all cursor-pointer"
              title="Atur Pasangan 2 Penguji Sidang untuk Ruang 1, Ruang 2, dan Ruang 3"
            >
              <DoorOpen className="w-4 h-4 text-orange-700" />
              <span>Atur Pasangan Ruangan (1, 2, 3)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Ekspor seluruh data penguji ke format CSV"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onResetDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-500 hover:text-orange-950 hover:bg-orange-50 border border-slate-200 transition-colors cursor-pointer"
              title="Kembalikan daftar penguji ke data default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Seed</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/80">
            <span className="text-xs font-bold text-orange-900 block">Total Penguji Sidang</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{stats.total}</span>
              <span className="text-xs text-orange-700 font-semibold">Dewan Penguji</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <span className="text-xs font-bold text-emerald-900 block">Penguji Aktif</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-950">{stats.activeCount}</span>
              <span className="text-xs text-emerald-700 font-semibold">Dapat Menilai</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/80">
            <span className="text-xs font-bold text-purple-900 block">Ketua & Sekretaris</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-950">{stats.ketuaCount + stats.sekretarisCount}</span>
              <span className="text-xs text-purple-700 font-semibold">Pimpinan Sidang</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <span className="text-xs font-bold text-amber-900 block">Total Penilaian Masuk</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-950">{stats.totalPenilaian}</span>
              <span className="text-xs text-amber-700 font-semibold">Form Tersimpan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama penguji, NIP, email, instansi..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Peran:</span>
          </div>
          <select
            value={filterPeran}
            onChange={(e) => setFilterPeran(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-orange-500 outline-hidden"
          >
            <option value="semua">Semua Peran</option>
            <option value="ketua">Ketua Sidang (P1)</option>
            <option value="sekretaris">Sekretaris (P2)</option>
            <option value="anggota">Anggota (P3)</option>
            <option value="dudi">Penguji DUDI</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-orange-500 outline-hidden"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-orange-950 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Tampilan Grid Kartu"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-orange-950 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Tampilan Tabel Rinci"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Grid or Table View */}
      {filteredPenguji.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Tidak ada penguji yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter untuk menampilkan kembali data penguji sidang.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterPeran('semua');
              setFilterStatus('semua');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-50 text-orange-950 border border-orange-200 font-bold text-xs hover:bg-orange-100 transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPenguji.map((p) => {
            const isCurrentActive = activePenguji.id === p.id;
            const isKetua = p.peran.toLowerCase().includes('ketua') || p.peran.includes('1');
            const isSekretaris = p.peran.toLowerCase().includes('sekretaris') || p.peran.includes('2');
            const countNilai = evaluationCounts[p.id] || 0;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl border transition-all duration-200 p-5 flex flex-col justify-between relative group ${
                  isCurrentActive
                    ? 'border-orange-500 shadow-md ring-2 ring-orange-400/40'
                    : 'border-slate-200/90 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Card Top: Avatar & Roles */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={p.avatar}
                          alt={p.nama}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-200 shadow-xs flex-shrink-0"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                          p.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} title={p.isActive !== false ? 'Penguji Aktif' : 'Nonaktif'} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-orange-950 transition-colors leading-tight">
                          {p.nama}
                        </h4>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">
                          NIP: {p.nip}
                        </p>
                      </div>
                    </div>

                    {isCurrentActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-2xs">
                        Aktif Saya
                      </span>
                    )}
                  </div>

                  {/* Badge & Affiliation */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                        isKetua
                          ? 'bg-purple-100 text-purple-900 border-purple-200'
                          : isSekretaris
                          ? 'bg-blue-100 text-blue-900 border-blue-200'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}>
                        {p.peran}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        p.isActive !== false
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {p.isActive !== false ? 'Akun Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    {p.instansiAsal && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{p.instansiAsal}</span>
                      </div>
                    )}

                    {p.bidangKeahlian && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{p.bidangKeahlian}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Info & Stats */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[170px]">{p.email || `${p.nip}@smk.sch.id`}</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold text-orange-900 bg-orange-100/80 px-2 py-0.5 rounded">
                        {countNilai} Nilai Masuk
                      </span>
                    </div>
                    {p.telepon && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.telepon}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSetActivePenguji(p)}
                    disabled={isCurrentActive}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCurrentActive
                        ? 'bg-orange-100 text-orange-950 border border-orange-300 font-black cursor-default'
                        : 'bg-white hover:bg-orange-50 border border-slate-200 text-slate-800 hover:text-orange-950 hover:border-orange-300'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                    <span>{isCurrentActive ? 'Sedang Digunakan' : 'Gunakan Akun Ini'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-2 rounded-xl text-slate-600 hover:text-orange-950 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 transition-colors cursor-pointer"
                    title="Edit Profil Penguji"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingId(p.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                    title="Hapus Penguji"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Penguji Sidang</th>
                  <th className="py-3 px-4">NIP / NIK</th>
                  <th className="py-3 px-4">Peran Sidang</th>
                  <th className="py-3 px-4">Kontak & Instansi</th>
                  <th className="py-3 px-4 text-center">Nilai Terinput</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPenguji.map((p) => {
                  const isCurrentActive = activePenguji.id === p.id;
                  const countNilai = evaluationCounts[p.id] || 0;

                  return (
                    <tr 
                      key={p.id}
                      className={`hover:bg-orange-50/30 transition-colors ${
                        isCurrentActive ? 'bg-orange-50/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar}
                            alt={p.nama}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-orange-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {p.nama}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                              {p.bidangKeahlian || 'Teknologi Informasi'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {p.nip}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-100 text-orange-950 border border-orange-200">
                          {p.peran}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <p>{p.email}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">{p.instansiAsal}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-950 font-mono">
                          {countNilai} Mahasiswa
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          p.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.isActive !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSetActivePenguji(p)}
                            disabled={isCurrentActive}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCurrentActive
                                ? 'bg-orange-100 text-orange-950 cursor-default'
                                : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-950'
                            }`}
                          >
                            {isCurrentActive ? 'Aktif' : 'Pilih'}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-orange-950 hover:bg-orange-50 cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Hapus"
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
        </div>
      )}

      {/* MODAL: Tambah / Edit Penguji Sidang */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/65 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    {editingPenguji ? 'Edit Data Penguji Sidang' : 'Tambah Penguji Sidang Baru'}
                  </h3>
                  <p className="text-xs text-orange-100/90">
                    Lengkapi identitas, peran sidang, kredensial, dan kontak penguji.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Quick Pick from Master Guru Pembimbing */}
              {guruList && guruList.length > 0 && !editingPenguji && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-amber-700" />
                      <span>Ambil Data dari Guru Pembimbing Sekolah:</span>
                    </label>
                    <span className="text-[11px] text-amber-800 font-bold">Otomatis Isi Form</span>
                  </div>
                  <select
                    onChange={(e) => {
                      const selectedNip = e.target.value;
                      if (!selectedNip) return;
                      const g = guruList.find((item) => item.nip === selectedNip);
                      if (g) {
                        handleSelectGuruToFill(g);
                      }
                    }}
                    defaultValue=""
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-semibold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  >
                    <option value="">-- Pilih Guru Pembimbing untuk Diambil Datanya --</option>
                    {guruList.map((g) => (
                      <option key={g.id || g.nip} value={g.nip}>
                        {g.nama} (NIP: {g.nip}) - {g.bidangStudi || 'Guru Produktif'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-amber-800/90 leading-tight">
                    Memilih guru akan mengisi NIP, Nama, Telepon, Email, Password, dan Bidang Keahlian secara otomatis.
                  </p>
                </div>
              )}

              {/* Nama Lengkap & Gelar */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Nama Lengkap & Gelar Akademik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Dr. Ir. Hendra Kurniawan, M.T."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium"
                />
              </div>

              {/* NIP / NIK & Peran Sidang */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    NIP / NIK / ID Penguji <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: 198203152008121001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-mono font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Peran dalam Sidang <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={peran}
                    onChange={(e) => setPeran(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium bg-white"
                  >
                    <option value="Penguji 1 (Ketua)">Penguji 1 (Ketua Sidang)</option>
                    <option value="Penguji 2 (Sekretaris)">Penguji 2 (Sekretaris)</option>
                    <option value="Penguji 3 (Anggota)">Penguji 3 (Anggota)</option>
                    <option value="Penguji 3 (DUDI)">Penguji 3 (Mitra DUDI)</option>
                    <option value="Penguji Eksternal">Penguji Eksternal / Industri</option>
                  </select>
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Email Login
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama.penguji@smk.sch.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 block">
                      Password Login
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword(`smk${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[11px] text-orange-700 font-bold hover:underline cursor-pointer"
                    >
                      Acak Sandi
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasswordInput ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingPenguji ? "Kosongkan jika tidak ingin diubah" : "Minimal 6 karakter"}
                      className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInput(!showPasswordInput)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Telepon / WA & Instansi Asal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    No. WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Instansi / Unit Asal
                  </label>
                  <input
                    type="text"
                    value={instansiAsal}
                    onChange={(e) => setInstansiAsal(e.target.value)}
                    placeholder="SMK Negeri 1 Vokasi atau Nama DUDI"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Bidang Keahlian */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Bidang Keahlian / Kompetensi
                </label>
                <input
                  type="text"
                  value={bidangKeahlian}
                  onChange={(e) => setBidangKeahlian(e.target.value)}
                  placeholder="Contoh: Software Engineering, Rekayasa Perangkat Lunak, Jaringan Komputer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium"
                />
              </div>

              {/* Avatar Preset Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-800 block">
                  Foto Profil / Avatar
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar preset ${idx + 1}`}
                      onClick={() => setAvatar(url)}
                      className={`w-10 h-10 rounded-xl object-cover cursor-pointer transition-all flex-shrink-0 ${
                        avatar === url
                          ? 'ring-3 ring-orange-500 scale-105 shadow-sm'
                          : 'opacity-60 hover:opacity-100 ring-1 ring-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Status Aktif Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">Status Akun Penguji</p>
                  <p className="text-[11px] text-slate-500">Penguji yang aktif dapat login dan menginput penilaian.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 shadow-md shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : editingPenguji ? 'Perbarui Penguji' : 'Simpan Penguji Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-extrabold text-base text-slate-900">
                Hapus Data Penguji Sidang?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini akan menghapus akun penguji dari daftar. Pastikan tidak ada berkas penting yang sedang bergantung pada akun ini.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer shadow-md shadow-rose-600/20"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TUGASKAN GURU PEMBIMBING SEBAGAI PENGUJI SIDANG */}
      {isAssignGuruModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/65 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAssignGuruModalOpen(false);
          }}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    Tugaskan Guru Pembimbing Menjadi Penguji Sidang
                  </h3>
                  <p className="text-xs text-orange-100/90">
                    Pilih guru pembimbing untuk langsung didaftarkan ke dewan penguji sidang tanpa input manual.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignGuruModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={guruSearchQuery}
                  onChange={(e) => setGuruSearchQuery(e.target.value)}
                  placeholder="Cari nama guru, NIP, atau bidang studi..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                />
              </div>
              <span className="text-xs font-bold text-slate-500">
                {guruList.length} Guru
              </span>
            </div>

            {/* List of Teachers */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              {guruList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">Belum Ada Data Master Guru Pembimbing</p>
                  <p className="text-xs text-slate-500">
                    Silakan tambahkan data guru pembimbing terlebih dahulu melalui menu <strong>Master Guru Pembimbing</strong> atau Pusat Upload.
                  </p>
                </div>
              ) : (
                guruList
                  .filter((g) => {
                    const q = guruSearchQuery.toLowerCase().trim();
                    return (
                      !q ||
                      g.nama.toLowerCase().includes(q) ||
                      g.nip.toLowerCase().includes(q) ||
                      (g.bidangStudi && g.bidangStudi.toLowerCase().includes(q))
                    );
                  })
                  .map((guru) => {
                    const cleanNip = guru.nip.replace(/\s+/g, '');
                    const existingPenguji = pengujiList.find(
                      (p) => p.nip.replace(/\s+/g, '') === cleanNip
                    );

                    return (
                      <div
                        key={guru.id || guru.nip}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          existingPenguji
                            ? 'bg-orange-50/40 border-orange-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={guru.avatar || AVATAR_PRESETS[0]}
                              alt={guru.nama}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900 truncate">
                                  {guru.nama}
                                </h4>
                                {existingPenguji ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                                    Aktif: {existingPenguji.peran}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">
                                    Belum Ditugaskan
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                NIP: {guru.nip} &bull; {guru.bidangStudi || 'Produktif'}
                              </p>
                              {guru.telepon && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  WhatsApp: {guru.telepon}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quick Assign Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleAssignGuruDirectly(guru, 'Penguji 1 (Ketua)')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                existingPenguji?.peran.includes('1') || existingPenguji?.peran.toLowerCase().includes('ketua')
                                  ? 'bg-orange-600 text-white shadow-2xs'
                                  : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200'
                              }`}
                              title="Tugaskan sebagai Penguji 1 (Ketua)"
                            >
                              + P1 (Ketua)
                            </button>

                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleAssignGuruDirectly(guru, 'Penguji 2 (Sekretaris)')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                existingPenguji?.peran.includes('2') || existingPenguji?.peran.toLowerCase().includes('sekr')
                                  ? 'bg-amber-600 text-white shadow-2xs'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                              title="Tugaskan sebagai Penguji 2 (Sekretaris)"
                            >
                              + P2 (Sekr)
                            </button>

                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleAssignGuruDirectly(guru, 'Penguji 3 (Anggota)')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                existingPenguji?.peran.includes('3') || existingPenguji?.peran.toLowerCase().includes('anggota')
                                  ? 'bg-slate-700 text-white shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                              title="Tugaskan sebagai Penguji 3 (Anggota)"
                            >
                              + P3 (Anggota)
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <span>Guru yang ditugaskan otomatis tersinkronisasi ke database penguji.</span>
              <button
                type="button"
                onClick={() => setIsAssignGuruModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengaturan Penguji Ruangan Sidang (Ruang 1, 2, 3) */}
      <AturPengujiRuanganModal
        isOpen={isAturRuanganModalOpen}
        onClose={() => setIsAturRuanganModalOpen(false)}
        roomPairings={effectivePairings}
        pengujiList={pengujiList}
        onSave={async (pairings: PasanganPengujiRuangan[]) => {
          if (onSaveRoomPairings) {
            await onSaveRoomPairings(pairings);
          }
          setSuccessToast('Pengaturan pasangan penguji Ruang 1, 2, dan 3 berhasil disimpan.');
          setTimeout(() => setSuccessToast(null), 4500);
        }}
      />

    </div>
  );
};
