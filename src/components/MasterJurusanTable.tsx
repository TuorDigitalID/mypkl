import React, { useState, useMemo } from 'react';
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
  Layers, 
  Briefcase,
  ArrowRight,
  Download,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { MasterJurusan, MasterSiswaPKL } from '../types/index.ts';
import { saveMasterJurusan, deleteMasterJurusan } from '../lib/supabase.ts';
import { 
  countSiswaPerJurusan, 
  getSiswaByJurusan, 
  getJurusanColorTheme 
} from '../utils/jurusanUtils.ts';

interface MasterJurusanTableProps {
  jurusanList: MasterJurusan[];
  siswaList: MasterSiswaPKL[];
  onJurusanUpdated: () => void;
  onFilterSiswaByJurusan?: (namaJurusan: string) => void;
}

export const MasterJurusanTable: React.FC<MasterJurusanTableProps> = ({
  jurusanList,
  siswaList,
  onJurusanUpdated,
  onFilterSiswaByJurusan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBidang, setSelectedBidang] = useState<string>('semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJurusan, setEditingJurusan] = useState<MasterJurusan | null>(null);
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    bidangKeahlian: 'Teknologi Informasi & Komunikasi',
    kepalaProgram: '',
    deskripsi: '',
    isActive: true,
  });
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Connected Students Preview
  const [viewSiswaJurusan, setViewSiswaJurusan] = useState<MasterJurusan | null>(null);

  // Modal State for Safe Deletion Confirmation (No window.confirm)
  const [deleteCandidate, setDeleteCandidate] = useState<MasterJurusan | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (viewSiswaJurusan) setViewSiswaJurusan(null);
        if (deleteCandidate) setDeleteCandidate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, viewSiswaJurusan, deleteCandidate]);

  // Unique Bidang Keahlian options
  const bidangOptions = useMemo(() => {
    const set = new Set(jurusanList.map((j) => j.bidangKeahlian).filter(Boolean));
    return ['semua', ...Array.from(set)];
  }, [jurusanList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return jurusanList.filter((j) => {
      const matchSearch =
        j.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.bidangKeahlian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.kepalaProgram || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchBidang = selectedBidang === 'semua' || j.bidangKeahlian === selectedBidang;
      const matchStatus =
        selectedStatus === 'semua' ||
        (selectedStatus === 'aktif' && j.isActive) ||
        (selectedStatus === 'nonaktif' && !j.isActive);

      return matchSearch && matchBidang && matchStatus;
    });
  }, [jurusanList, searchTerm, selectedBidang, selectedStatus]);

  // Stats calculation
  const totalSiswaCount = useMemo(() => {
    return siswaList.length;
  }, [siswaList]);

  const activeJurusanCount = useMemo(() => {
    return jurusanList.filter((j) => j.isActive).length;
  }, [jurusanList]);

  const handleOpenAddModal = () => {
    setEditingJurusan(null);
    setFormData({
      kode: '',
      nama: '',
      bidangKeahlian: 'Teknologi Informasi & Komunikasi',
      kepalaProgram: '',
      deskripsi: '',
      isActive: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (j: MasterJurusan) => {
    setEditingJurusan(j);
    setFormData({
      kode: j.kode,
      nama: j.nama,
      bidangKeahlian: j.bidangKeahlian,
      kepalaProgram: j.kepalaProgram || '',
      deskripsi: j.deskripsi || '',
      isActive: j.isActive,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (j: MasterJurusan) => {
    const updated: MasterJurusan = {
      ...j,
      isActive: !j.isActive,
      updatedAt: new Date().toISOString(),
    };
    await saveMasterJurusan(updated);
    onJurusanUpdated();
    setToastMessage(`Status jurusan ${j.kode} diubah menjadi ${updated.isActive ? 'Aktif' : 'Nonaktif'}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    const kode = deleteCandidate.kode;
    await deleteMasterJurusan(deleteCandidate.id);
    setDeleteCandidate(null);
    onJurusanUpdated();
    setToastMessage(`Data master jurusan ${kode} berhasil dihapus.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanKode = formData.kode.toUpperCase().trim();
    const cleanNama = formData.nama.trim();

    if (!cleanKode) {
      setFormError('Kode jurusan wajib diisi (contoh: RPL, TKJ).');
      return;
    }
    if (!cleanNama) {
      setFormError('Nama lengkap program keahlian wajib diisi.');
      return;
    }

    // Check duplicate code
    const isDuplicate = jurusanList.some(
      (j) => j.kode.toUpperCase() === cleanKode && j.id !== editingJurusan?.id
    );
    if (isDuplicate) {
      setFormError(`Kode jurusan "${cleanKode}" sudah terdaftar.`);
      return;
    }

    const newOrUpdated: MasterJurusan = {
      id: editingJurusan ? editingJurusan.id : `mj-${Date.now()}`,
      kode: cleanKode,
      nama: cleanNama,
      bidangKeahlian: formData.bidangKeahlian.trim() || 'Teknologi Informasi & Komunikasi',
      kepalaProgram: formData.kepalaProgram.trim() || '-',
      deskripsi: formData.deskripsi.trim(),
      isActive: formData.isActive,
      createdAt: editingJurusan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveMasterJurusan(newOrUpdated);
    onJurusanUpdated();
    setIsModalOpen(false);
    setToastMessage(editingJurusan ? `Jurusan ${cleanKode} berhasil diperbarui!` : `Jurusan baru ${cleanKode} berhasil ditambahkan!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export Jurusan to CSV
  const handleExportJurusanCSV = () => {
    const headers = ['No', 'Kode Jurusan', 'Program Keahlian', 'Bidang Keahlian', 'Kepala Program', 'Siswa Terhubung', 'Status'];
    const rows = filteredList.map((j, idx) => [
      idx + 1,
      `"${j.kode}"`,
      `"${j.nama}"`,
      `"${j.bidangKeahlian}"`,
      `"${j.kepalaProgram || '-'}"`,
      countSiswaPerJurusan(siswaList, j),
      j.isActive ? 'Aktif' : 'Nonaktif',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Data_Jurusan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // List of students for the active drawer / preview
  const connectedStudents = useMemo(() => {
    if (!viewSiswaJurusan) return [];
    return getSiswaByJurusan(siswaList, viewSiswaJurusan);
  }, [viewSiswaJurusan, siswaList]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Data Master Jurusan / Program Keahlian</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {jurusanList.length} Jurusan
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Master data acuan program keahlian yang terhubung langsung dengan form input, filter, dan data akun master siswa PKL.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportJurusanCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            title="Ekspor CSV Data Jurusan"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jurusan Baru</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Jurusan</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{jurusanList.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{activeJurusanCount} Program Aktif</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{totalSiswaCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Terhubung ke Master Siswa</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bidang Keahlian</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{bidangOptions.length - 1}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Klaster Vokasi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Status Sinkronisasi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-black text-emerald-600 mt-1">Terkoneksi Otomatis</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Dropdown Siswa & Filter</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode jurusan, nama keahlian, atau kaprog..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Bidang:</span>
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
            >
              {bidangOptions.map((b) => (
                <option key={b} value={b}>
                  {b === 'semua' ? 'Semua Bidang' : b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table: Master Jurusan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-4 w-28">Kode</th>
                <th className="py-3 px-4">Program Keahlian</th>
                <th className="py-3 px-4">Bidang Keahlian</th>
                <th className="py-3 px-4">Kepala Program (Kaprog)</th>
                <th className="py-3 px-4 text-center">Siswa Terhubung</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((j, index) => {
                const siswaCount = countSiswaPerJurusan(siswaList, j);
                const color = getJurusanColorTheme(j.kode);

                return (
                  <tr key={j.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3.5 text-center font-mono text-slate-400">
                      {index + 1}
                    </td>

                    {/* Kode Jurusan */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-black font-mono text-xs border ${color.badge}`}>
                        {j.kode}
                      </span>
                    </td>

                    {/* Nama Program Keahlian */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {j.nama}
                      </div>
                      {j.deskripsi && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-sm">
                          {j.deskripsi}
                        </p>
                      )}
                    </td>

                    {/* Bidang Keahlian */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                        <Briefcase className="w-3 h-3 text-slate-500" />
                        <span>{j.bidangKeahlian}</span>
                      </span>
                    </td>

                    {/* Kepala Program */}
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {j.kepalaProgram || '-'}
                    </td>

                    {/* Siswa Terhubung */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewSiswaJurusan(j)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors cursor-pointer"
                        title="Klik untuk melihat daftar siswa di jurusan ini"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{siswaCount} Siswa</span>
                      </button>
                    </td>

                    {/* Status Aktif */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(j)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                          j.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                        }`}
                        title="Klik untuk ubah status aktif/nonaktif"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${j.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{j.isActive ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onFilterSiswaByJurusan?.(j.nama)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Buka & Filter di Master Siswa"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(j)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Jurusan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(j)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Jurusan"
                        >
                          <Trash2 className="w-4 h-4" />
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
            <p className="font-semibold text-slate-800">Tidak ada data jurusan yang cocok.</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        )}
      </div>

      {/* Modal: Tambah / Edit Jurusan */}
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
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>{editingJurusan ? 'Edit Data Master Jurusan' : 'Tambah Jurusan / Program Keahlian Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Kode Jurusan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                    placeholder="RPL"
                    maxLength={10}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900 uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Nama Program Keahlian *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Rekayasa Perangkat Lunak"
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Bidang Keahlian *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bidangKeahlian}
                  onChange={(e) => setFormData({ ...formData, bidangKeahlian: e.target.value })}
                  placeholder="Teknologi Informasi & Komunikasi"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Kepala Program Keahlian (Kaprog)
                </label>
                <input
                  type="text"
                  value={formData.kepalaProgram}
                  onChange={(e) => setFormData({ ...formData, kepalaProgram: e.target.value })}
                  placeholder="Nama Lengkap & Gelar Kaprog"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Deskripsi / Profil Singkat
                </label>
                <textarea
                  rows={2}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Kompetensi inti dan profil lulusan..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="isActiveCheck" className="text-slate-800 font-semibold cursor-pointer">
                  Aktifkan Jurusan (Dapat dipilih saat pendaftaran siswa baru)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-colors"
                >
                  {editingJurusan ? 'Simpan Perubahan' : 'Tambahkan Jurusan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Daftar Siswa Terhubung */}
      {viewSiswaJurusan && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewSiswaJurusan(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-lg font-black font-mono text-xs border ${getJurusanColorTheme(viewSiswaJurusan.kode).badge}`}>
                  {viewSiswaJurusan.kode}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Daftar Siswa Terhubung - {viewSiswaJurusan.nama}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kaprog: {viewSiswaJurusan.kepalaProgram || '-'} | {connectedStudents.length} siswa terdaftar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewSiswaJurusan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto">
              {connectedStudents.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2 px-3 text-center">No</th>
                      <th className="py-2 px-3 font-mono">NISN</th>
                      <th className="py-2 px-3">Nama Lengkap</th>
                      <th className="py-2 px-3 text-center">Kelas</th>
                      <th className="py-2 px-3">Email Login</th>
                      <th className="py-2 px-3">Guru Pembimbing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {connectedStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{s.nisn}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{s.namaLengkap}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold text-slate-700">
                            {s.kelas}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{s.emailLogin}</td>
                        <td className="py-2 px-3 text-slate-700">{s.guruPembimbing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700 text-xs">Belum ada siswa yang terdaftar di jurusan ini.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Siswa dapat didaftarkan lewat menu Tambah Siswa atau Upload Excel.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Total: <strong>{connectedStudents.length}</strong> Siswa
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewSiswaJurusan(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                >
                  Tutup
                </button>
                {onFilterSiswaByJurusan && connectedStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const jurusanName = viewSiswaJurusan.nama;
                      setViewSiswaJurusan(null);
                      onFilterSiswaByJurusan(jurusanName);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>Buka di Master Siswa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Jurusan (No window.confirm) */}
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
              Hapus Data Master Jurusan?
            </h3>
            
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Anda akan menghapus jurusan <strong className="text-slate-900 font-mono">[{deleteCandidate.kode}] {deleteCandidate.nama}</strong>.
            </p>

            {countSiswaPerJurusan(siswaList, deleteCandidate) > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Perhatian:</strong> Ada <strong>{countSiswaPerJurusan(siswaList, deleteCandidate)} siswa</strong> yang saat ini terhubung dengan jurusan ini di database.
                </span>
              </div>
            )}

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
                Ya, Hapus Jurusan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
