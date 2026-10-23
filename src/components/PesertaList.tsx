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
  AlertCircle,
  Briefcase,
  Layers,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { MahasiswaSidang, PenilaianPenguji, StatusSidang, PlottingSiswaPKL } from '../types/index.ts';
import { calculateFinalAggregate } from '../utils/scoring.ts';
import { savePesertaSidang, syncPesertaFromPlotting } from '../lib/supabase.ts';

interface PesertaListProps {
  pesertaList: MahasiswaSidang[];
  penilaianList: PenilaianPenguji[];
  plottingList?: PlottingSiswaPKL[];
  onSelectPesertaForSidang: (id: string) => void;
  onOpenBeritaAcara: (id: string) => void;
  onPesertaUpdated?: () => void;
}

export const PesertaList: React.FC<PesertaListProps> = ({
  pesertaList,
  penilaianList,
  plottingList = [],
  onSelectPesertaForSidang,
  onOpenBeritaAcara,
  onPesertaUpdated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'perusahaan' | 'siswa'>('perusahaan');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | StatusSidang>('semua');
  const [filterP1, setFilterP1] = useState<'semua' | 'belum' | 'sudah'>('semua');
  const [filterP2, setFilterP2] = useState<'semua' | 'belum' | 'sudah'>('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // New Student Form State
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    prodi: 'Teknik Informatika (RPL)',
    kelas: 'TI-3A',
    perusahaan: '',
    judulLaporan: '',
    pembimbingDudi: '',
    pembimbingSekolah: 'Guru Pembimbing Sekolah',
    ruangan: 'Ruang Sidang Utama A-201',
    jadwalSidang: new Date().toISOString().slice(0, 16),
  });
  const [formError, setFormError] = useState('');

  // Handle Sync Antrean dari Data Plotting
  const handleSyncPlotting = async () => {
    setIsSyncing(true);
    try {
      await syncPesertaFromPlotting(plottingList);
      setSyncMessage('Berhasil menyinkronkan antrean sidang dari data plotting siswa per perusahaan.');
      setTimeout(() => setSyncMessage(null), 3500);
      onPesertaUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Group Peserta Sidang by Perusahaan (Plotting DUDI)
  const companySessions = useMemo(() => {
    const map = new Map<string, {
      nama: string;
      alamat?: string;
      pembimbingDudi?: string;
      guruNama?: string;
      ruangan: string;
      jadwalSidang: string;
      siswa: MahasiswaSidang[];
    }>();

    pesertaList.forEach((p) => {
      const compName = p.perusahaan || 'Lainnya / Mandiri';
      if (!map.has(compName)) {
        const plot = plottingList.find((pl) => pl.instansiNama === compName);
        map.set(compName, {
          nama: compName,
          alamat: plot?.alamatInstansi || 'Alamat Terdaftar di DUDI',
          pembimbingDudi: p.pembimbingDudi || plot?.pembimbingInstansi || 'Pembimbing Lapangan DUDI',
          guruNama: p.pembimbingSekolah || plot?.guruNama || 'Guru Pembimbing Sekolah',
          ruangan: p.ruangan || 'Ruang Sidang Utama A-201',
          jadwalSidang: p.jadwalSidang,
          siswa: [],
        });
      }
      map.get(compName)!.siswa.push(p);
    });

    return Array.from(map.values());
  }, [pesertaList, plottingList]);

  // Unique companies list for dropdown filter
  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(pesertaList.map((p) => p.perusahaan || 'Lainnya / Mandiri')));
  }, [pesertaList]);

  // Filtered Students (Individual)
  const filteredStudents = useMemo(() => {
    return pesertaList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.perusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.judulLaporan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCompany = selectedCompanyFilter === 'semua' || item.perusahaan === selectedCompanyFilter;
      const matchStatus = statusFilter === 'semua' || item.status === statusFilter;

      // Evaluation status filters for P1 & P2
      const agg = calculateFinalAggregate(item.id, penilaianList, 2);
      const evalP1 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p1' || n.pengujiPeran.includes('1'));
      const evalP2 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p2' || n.pengujiPeran.includes('2'));
      const hasP1 = !!evalP1 && evalP1.totalNilai > 0;
      const hasP2 = !!evalP2 && evalP2.totalNilai > 0;

      const matchP1 = filterP1 === 'semua' || (filterP1 === 'sudah' ? hasP1 : !hasP1);
      const matchP2 = filterP2 === 'semua' || (filterP2 === 'sudah' ? hasP2 : !hasP2);

      return matchSearch && matchCompany && matchStatus && matchP1 && matchP2;
    });
  }, [pesertaList, searchTerm, selectedCompanyFilter, statusFilter, filterP1, filterP2, penilaianList]);

  // Filtered Company Sessions
  const filteredCompanySessions = useMemo(() => {
    return companySessions.filter((comp) => {
      const matchCompany = selectedCompanyFilter === 'semua' || comp.nama === selectedCompanyFilter;

      // Search match across company name, address, or students inside
      const matchSearch =
        comp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comp.alamat && comp.alamat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        comp.siswa.some(
          (s) =>
            s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.judulLaporan.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Student filters within company
      const hasMatchingStudent = comp.siswa.some((s) => {
        const matchStatus = statusFilter === 'semua' || s.status === statusFilter;
        const agg = calculateFinalAggregate(s.id, penilaianList, 2);
        const evalP1 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p1' || n.pengujiPeran.includes('1'));
        const evalP2 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p2' || n.pengujiPeran.includes('2'));
        const hasP1 = !!evalP1 && evalP1.totalNilai > 0;
        const hasP2 = !!evalP2 && evalP2.totalNilai > 0;

        const matchP1 = filterP1 === 'semua' || (filterP1 === 'sudah' ? hasP1 : !hasP1);
        const matchP2 = filterP2 === 'semua' || (filterP2 === 'sudah' ? hasP2 : !hasP2);

        return matchStatus && matchP1 && matchP2;
      });

      return matchCompany && matchSearch && hasMatchingStudent;
    });
  }, [companySessions, selectedCompanyFilter, searchTerm, statusFilter, filterP1, filterP2, penilaianList]);

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
    onPesertaUpdated?.();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Jadwal Antrean Sidang per Perusahaan</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-950 font-bold font-mono border border-orange-200">
                  {companySessions.length} Perusahaan • {pesertaList.length} Siswa
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sidang dikelompokkan per perusahaan (tempat PKL), penilaian dilakukan tetap per siswa dengan formula 50% Sidang (P1+P2)/2 + 50% Jurnal PKL.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {plottingList.length > 0 && (
            <button
              onClick={handleSyncPlotting}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold text-xs transition-colors cursor-pointer shadow-xs"
              title="Sinkronkan data siswa dari tabel Plotting Siswa PKL ke antrean sidang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sinkron dari Plotting</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Peserta Sidang</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* View Mode Toggle & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Mode Switcher: Antrean per Perusahaan vs Daftar Siswa */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200 self-start">
            <button
              onClick={() => setViewMode('perusahaan')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'perusahaan'
                  ? 'bg-orange-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Sesi per Perusahaan ({companySessions.length})</span>
            </button>
            <button
              onClick={() => setViewMode('siswa')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'siswa'
                  ? 'bg-orange-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Daftar Seluruh Siswa ({pesertaList.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Perusahaan, Nama Siswa, NIM..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Filter Row: Perusahaan, Penguji 1, Penguji 2 & Status */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-500">Filter:</span>
          </div>

          {/* Perusahaan Dropdown */}
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="semua">Semua Perusahaan DUDI ({uniqueCompanies.length})</option>
            {uniqueCompanies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Filter Penguji 1 */}
          <select
            value={filterP1}
            onChange={(e) => setFilterP1(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="semua">Status Penguji 1 (Semua)</option>
            <option value="belum">⏳ Belum Dinilai Penguji 1</option>
            <option value="sudah">✅ Sudah Dinilai Penguji 1</option>
          </select>

          {/* Filter Penguji 2 */}
          <select
            value={filterP2}
            onChange={(e) => setFilterP2(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="semua">Status Penguji 2 (Semua)</option>
            <option value="belum">⏳ Belum Dinilai Penguji 2</option>
            <option value="sudah">✅ Sudah Dinilai Penguji 2</option>
          </select>

          {/* Filter Status Sidang */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="semua">Status Sidang (Semua)</option>
            <option value="berlangsung">● Sedang Sidang</option>
            <option value="menunggu">Menunggu</option>
            <option value="selesai">Selesai</option>
          </select>

          {(selectedCompanyFilter !== 'semua' || filterP1 !== 'semua' || filterP2 !== 'semua' || statusFilter !== 'semua' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCompanyFilter('semua');
                setFilterP1('semua');
                setFilterP2('semua');
                setStatusFilter('semua');
                setSearchTerm('');
              }}
              className="text-[11px] text-orange-600 hover:text-orange-800 font-bold underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: SESI SIDANG PER PERUSAHAAN (DEFAULT) */}
      {viewMode === 'perusahaan' && (
        <div className="space-y-5">
          {filteredCompanySessions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-sm">Tidak ada sesi perusahaan yang cocok dengan filter.</p>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau klik tombol "Reset Filter".</p>
            </div>
          ) : (
            filteredCompanySessions.map((session, sIdx) => {
              // Calculate completion in this company
              const completedCount = session.siswa.filter((s) => {
                const agg = calculateFinalAggregate(s.id, penilaianList, 2);
                return agg.isLengkap;
              }).length;

              const isAllDone = completedCount === session.siswa.length;
              const hasOngoing = session.siswa.some((s) => s.status === 'berlangsung');

              return (
                <div
                  key={session.nama}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:border-orange-300 transition-all"
                >
                  {/* Company Session Card Header */}
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/40 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-orange-950 text-white">
                          Sesi #{sIdx + 1}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          hasOngoing
                            ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                            : isAllDone
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {hasOngoing ? '● Sedang Sidang' : isAllDone ? '✓ Sidang Selesai' : 'Antrean Menunggu'}
                        </span>
                        <span className="text-xs font-bold font-mono text-orange-900 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
                          {session.siswa.length} Siswa PKL
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <span className="truncate">{session.nama}</span>
                      </h3>

                      {session.alamat && (
                        <p className="text-xs text-slate-500 mt-1 truncate pl-7">
                          📍 {session.alamat}
                        </p>
                      )}
                    </div>

                    {/* Schedule & DUDI Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-600 bg-white/80 p-3 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Jadwal & Ruangan:</span>
                        <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-orange-600" />
                          <span>{new Date(session.jadwalSidang).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.ruangan}</span>
                        </p>
                      </div>

                      <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Pembimbing DUDI / Sekolah:</span>
                        <p className="font-semibold text-slate-800 truncate max-w-xs mt-0.5">
                          {session.pembimbingDudi} • {session.guruNama}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Student Table within Company Session */}
                  <div className="p-4 sm:p-6 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Daftar Siswa dalam Sesi Perusahaan Ini ({session.siswa.length} Siswa):
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Kelengkapan Nilai: <strong>{completedCount}</strong> dari {session.siswa.length} Selesai
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-2.5 px-3">No</th>
                            <th className="py-2.5 px-3">Nama Siswa & NISN</th>
                            <th className="py-2.5 px-3">Kelas & Prodi</th>
                            <th className="py-2.5 px-3 text-center bg-amber-50/40">Jurnal PKL (50%)</th>
                            <th className="py-2.5 px-3 text-center">Penguji 1 (Ketua)</th>
                            <th className="py-2.5 px-3 text-center">Penguji 2 (Sekr)</th>
                            <th className="py-2.5 px-3 text-center bg-orange-50/40">Sidang (50%)</th>
                            <th className="py-2.5 px-3 text-center bg-emerald-50/40">Nilai Akhir</th>
                            <th className="py-2.5 px-3 text-right">Aksi Penilaian</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {session.siswa.map((siswa, idx) => {
                            const agg = calculateFinalAggregate(siswa.id, penilaianList, 2);
                            const scoreP1 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p1' || n.pengujiPeran.includes('1'));
                            const scoreP2 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p2' || n.pengujiPeran.includes('2'));

                            return (
                              <tr key={siswa.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-3 font-mono font-medium text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-3">
                                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{siswa.nama}</p>
                                  <p className="font-mono text-slate-500 text-[10px]">NISN/NIM: {siswa.nim}</p>
                                </td>
                                <td className="py-3 px-3">
                                  <p className="font-semibold text-slate-700">{siswa.kelas}</p>
                                  <p className="text-[10px] text-slate-400">{siswa.prodi}</p>
                                </td>
                                <td className="py-3 px-3 text-center font-mono bg-amber-50/20">
                                  {agg.nilaiJurnalPkl > 0 ? (
                                    <div>
                                      <span className="font-bold text-slate-900">{agg.nilaiJurnalPkl.toFixed(1)}</span>
                                      <span className="text-[10px] text-amber-700 block">({agg.poinJurnalPkl50.toFixed(1)} pt)</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center font-mono">
                                  {scoreP1 && scoreP1.totalNilai > 0 ? (
                                    <span className="font-bold text-emerald-700">
                                      {scoreP1.totalNilai.toFixed(1)} ({scoreP1.nilaiHuruf})
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 text-[10px] font-semibold italic">⏳ Belum</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center font-mono">
                                  {scoreP2 && scoreP2.totalNilai > 0 ? (
                                    <span className="font-bold text-blue-700">
                                      {scoreP2.totalNilai.toFixed(1)} ({scoreP2.nilaiHuruf})
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 text-[10px] font-semibold italic">⏳ Belum</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center font-mono bg-orange-50/20">
                                  {agg.nilaiSidangGabungan > 0 ? (
                                    <div>
                                      <span className="font-bold text-slate-900">{agg.nilaiSidangGabungan.toFixed(1)}</span>
                                      <span className="text-[10px] text-orange-700 block">({agg.poinSidang50.toFixed(1)} pt)</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center font-mono bg-emerald-50/20">
                                  {agg.nilaiAkhirAngka > 0 ? (
                                    <div>
                                      <span className="font-black text-slate-900">{agg.nilaiAkhirAngka.toFixed(1)}</span>
                                      <span className="ml-1 text-[11px] font-bold text-emerald-700">[{agg.nilaiAkhirHuruf}]</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">Belum</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => onSelectPesertaForSidang(siswa.id)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[11px] shadow-xs cursor-pointer transition-all"
                                      title="Masuk ke Ruang Penilaian Siswa Ini"
                                    >
                                      <Play className="w-3 h-3 ml-0.5" />
                                      <span>Mulai Nilai</span>
                                    </button>
                                    <button
                                      onClick={() => onOpenBeritaAcara(siswa.id)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] cursor-pointer"
                                      title="Buka Berita Acara"
                                    >
                                      <FileText className="w-3 h-3 text-emerald-600" />
                                      <span>BA</span>
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
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: DAFTAR SELURUH SISWA (INDIVIDUAL CARDS) */}
      {viewMode === 'siswa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((peserta) => {
            const aggregate = calculateFinalAggregate(peserta.id, penilaianList, 2);
            const isOngoing = peserta.status === 'berlangsung';
            const isDone = peserta.status === 'selesai';

            return (
              <div
                key={peserta.id}
                className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between hover:shadow-md ${
                  isOngoing
                    ? 'border-orange-400 ring-2 ring-orange-500/10'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      isOngoing
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {peserta.status === 'berlangsung' ? '● Sedang Sidang' : peserta.status}
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      NIM: {peserta.nim}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {peserta.nama}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">
                    {peserta.prodi} • {peserta.kelas}
                  </p>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-orange-700 font-semibold">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{peserta.perusahaan}</span>
                    </div>

                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs line-clamp-2 italic">
                      "{peserta.judulLaporan}"
                    </p>
                  </div>

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
                      <span className="text-xs font-mono font-bold text-orange-700">
                        Nilai: {aggregate.nilaiAkhirAngka.toFixed(1)} ({aggregate.nilaiAkhirHuruf})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectPesertaForSidang(peserta.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                      <span>Nilai Sidang</span>
                    </button>
                    <button
                      onClick={() => onOpenBeritaAcara(peserta.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Berita Acara"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Peserta Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" />
                <span>Tambah Peserta Sidang Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewPeserta} className="mt-4 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIM / NISN *</label>
                  <input
                    type="text"
                    required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Contoh: 220101099"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Mahasiswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama Lengkap Siswa"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Program Studi / Keahlian</label>
                  <input
                    type="text"
                    value={formData.prodi}
                    onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tempat PKL (Perusahaan / DUDI) *</label>
                <input
                  type="text"
                  required
                  value={formData.perusahaan}
                  onChange={(e) => setFormData({ ...formData, perusahaan: e.target.value })}
                  placeholder="Contoh: PT Telekomunikasi Indonesia"
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ruangan Sidang</label>
                  <input
                    type="text"
                    value={formData.ruangan}
                    onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xs cursor-pointer"
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
