import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Building2, 
  Calendar, 
  Clock, 
  Award, 
  FileText, 
  Play, 
  Filter, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MahasiswaSidang, PenilaianPenguji, StatusSidang } from '../types/index.ts';
import { calculateFinalAggregate } from '../utils/scoring.ts';
import { savePesertaSidang } from '../lib/supabase.ts';

interface PesertaListProps {
  pesertaList: MahasiswaSidang[];
  penilaianList: PenilaianPenguji[];
  onSelectPesertaForSidang: (id: string) => void;
  onOpenBeritaAcara: (id: string) => void;
}

export const PesertaList: React.FC<PesertaListProps> = ({
  pesertaList,
  penilaianList,
  onSelectPesertaForSidang,
  onOpenBeritaAcara,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | StatusSidang>('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Student Form State
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    prodi: 'Teknik Informatika (RPL)',
    kelas: 'TI-3A',
    perusahaan: '',
    judulLaporan: '',
    pembimbingDudi: '',
    pembimbingSekolah: 'Dr. Ir. Hendra Kurniawan, M.T.',
    ruangan: 'Ruang Sidang Utama A-201',
    jadwalSidang: new Date().toISOString().slice(0, 16),
  });
  const [formError, setFormError] = useState('');

  // Filtered List
  const filteredList = useMemo(() => {
    return pesertaList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.perusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.judulLaporan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'semua' || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [pesertaList, searchTerm, statusFilter]);

  const handleAddNewPeserta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nim.trim() || !formData.nama.trim() || !formData.perusahaan.trim() || !formData.judulLaporan.trim()) {
      setFormError('Harap lengkapi semua kolom wajib (NIM, Nama, Perusahaan, Judul Laporan).');
      return;
    }

    const newPeserta: MahasiswaSidang = {
      id: `m-${Date.now()}`,
      nim: formData.nim.trim(),
      nama: formData.nama.trim(),
      prodi: formData.prodi,
      kelas: formData.kelas,
      perusahaan: formData.perusahaan.trim(),
      judulLaporan: formData.judulLaporan.trim(),
      pembimbingDudi: formData.pembimbingDudi.trim() || 'Pembimbing Lapangan DUDI',
      pembimbingSekolah: formData.pembimbingSekolah,
      jadwalSidang: formData.jadwalSidang,
      ruangan: formData.ruangan,
      status: 'menunggu',
    };

    await savePesertaSidang(newPeserta);
    setIsModalOpen(false);
    setFormError('');
    setFormData({
      nim: '',
      nama: '',
      prodi: 'Teknik Informatika (RPL)',
      kelas: 'TI-3A',
      perusahaan: '',
      judulLaporan: '',
      pembimbingDudi: '',
      pembimbingSekolah: 'Dr. Ir. Hendra Kurniawan, M.T.',
      ruangan: 'Ruang Sidang Utama A-201',
      jadwalSidang: new Date().toISOString().slice(0, 16),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Title, Search, Filter & Add Button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Daftar Peserta Sidang PKL</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold font-mono">
              Total: {pesertaList.length} Mahasiswa
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola jadwal, ruangan, dan pantau status kelengkapan penilaian sidang magang industri.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Peserta Sidang</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari NIM, Nama, Perusahaan DUDI..."
            aria-label="Cari peserta sidang"
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
          {[
            { id: 'semua', label: 'Semua Status' },
            { id: 'berlangsung', label: 'Sedang Berlangsung' },
            { id: 'menunggu', label: 'Menunggu' },
            { id: 'selesai', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((peserta) => {
          const aggregate = calculateFinalAggregate(peserta.id, penilaianList, 2);
          const isOngoing = peserta.status === 'berlangsung';
          const isDone = peserta.status === 'selesai';

          return (
            <div
              key={peserta.id}
              className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between hover:shadow-md ${
                isOngoing
                  ? 'border-emerald-400 ring-2 ring-emerald-500/10'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Top Badge & NIM */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    isOngoing
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isDone
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {peserta.status === 'berlangsung' ? '● Sedang Sidang' : peserta.status}
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    NIM: {peserta.nim}
                  </span>
                </div>

                {/* Candidate Name & Class */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {peserta.nama}
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  {peserta.prodi} • {peserta.kelas}
                </p>

                {/* DUDI & Project Title */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{peserta.perusahaan}</span>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs line-clamp-2 italic">
                    "{peserta.judulLaporan}"
                  </p>
                </div>

                {/* Schedule & Room */}
                <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(peserta.jadwalSidang).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {peserta.ruangan}
                  </span>
                </div>
              </div>

              {/* Bottom Evaluation Status & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      aggregate.totalPengujiMenilai >= 2
                        ? 'bg-emerald-500'
                        : aggregate.totalPengujiMenilai > 0
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`} />
                    <span className="text-xs font-semibold text-slate-700">
                      {aggregate.totalPengujiMenilai} dari 2 Penguji
                    </span>
                  </div>
                  {aggregate.nilaiAkhirAngka > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      Nilai: {aggregate.nilaiAkhirAngka.toFixed(1)} ({aggregate.nilaiAkhirHuruf})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenBeritaAcara(peserta.id)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium"
                    title="Cetak Berita Acara"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectPesertaForSidang(peserta.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Buka Sidang</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="font-semibold text-slate-800">Tidak ada peserta sidang yang sesuai pencarian.</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter status Anda.</p>
        </div>
      )}

      {/* Modal: Tambah Peserta Sidang Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Tambah Peserta Sidang PKL Baru</span>
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

            <form onSubmit={handleAddNewPeserta} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIM / NISN *</label>
                  <input
                    type="text"
                    required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Contoh: 220101099"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Rian Anggara"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Program Studi / Jurusan</label>
                  <input
                    type="text"
                    value={formData.prodi}
                    onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    placeholder="Contoh: TI-3A"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Perusahaan Tempat PKL / DUDI *</label>
                <input
                  type="text"
                  required
                  value={formData.perusahaan}
                  onChange={(e) => setFormData({ ...formData, perusahaan: e.target.value })}
                  placeholder="Contoh: PT Telekomunikasi Indonesia Tbk"
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Laporan PKL *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.judulLaporan}
                  onChange={(e) => setFormData({ ...formData, judulLaporan: e.target.value })}
                  placeholder="Contoh: Implementasi Sistem Monitoring Server..."
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pembimbing DUDI / Industri</label>
                  <input
                    type="text"
                    value={formData.pembimbingDudi}
                    onChange={(e) => setFormData({ ...formData, pembimbingDudi: e.target.value })}
                    placeholder="Nama Pembimbing Lapangan"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ruangan Sidang</label>
                  <input
                    type="text"
                    value={formData.ruangan}
                    onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
