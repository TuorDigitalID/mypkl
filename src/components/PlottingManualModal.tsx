import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  Building2,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  User,
  MapPin,
  Clock,
  FileText,
  Users
} from 'lucide-react';
import { PlottingSiswaPKL, MasterSiswaPKL, MasterInstansi, MasterGuruPembimbing, StatusPlotting } from '../types/index.ts';

interface PlottingManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  plottingItem?: PlottingSiswaPKL | null;
  siswaList: MasterSiswaPKL[];
  instansiList: MasterInstansi[];
  guruList: MasterGuruPembimbing[];
  existingPlottingList: PlottingSiswaPKL[];
  onSave: (item: PlottingSiswaPKL) => void;
}

export const PlottingManualModal: React.FC<PlottingManualModalProps> = ({
  isOpen,
  onClose,
  plottingItem,
  siswaList,
  instansiList,
  guruList,
  existingPlottingList,
  onSave,
}) => {
  const isEditing = Boolean(plottingItem);

  const [selectedNisn, setSelectedNisn] = useState('');
  const [selectedInstansiId, setSelectedInstansiId] = useState('');
  const [selectedGuruNip, setSelectedGuruNip] = useState('');
  const [periodeMulai, setPeriodeMulai] = useState('15 Juli 2026');
  const [periodeSelesai, setPeriodeSelesai] = useState('15 Desember 2026');
  const [statusPlotting, setStatusPlotting] = useState<StatusPlotting>('Terplotting');
  const [catatan, setCatatan] = useState('');
  const [formError, setFormError] = useState('');

  // Prefill saat modal dibuka
  useEffect(() => {
    if (plottingItem) {
      setSelectedNisn(plottingItem.nisn);
      const matchInstansi = instansiList.find(
        (i) => i.nama.toLowerCase().trim() === plottingItem.instansiNama?.toLowerCase().trim()
      );
      setSelectedInstansiId(matchInstansi ? matchInstansi.id : '');

      const matchGuru = guruList.find(
        (g) => g.nip.replace(/\s+/g, '') === plottingItem.guruNip?.replace(/\s+/g, '') ||
               g.nama.toLowerCase().trim() === plottingItem.guruNama?.toLowerCase().trim()
      );
      setSelectedGuruNip(matchGuru ? matchGuru.nip : (plottingItem.guruNip || ''));

      setPeriodeMulai(plottingItem.periodeMulai || '15 Juli 2026');
      setPeriodeSelesai(plottingItem.periodeSelesai || '15 Desember 2026');
      setStatusPlotting(plottingItem.statusPlotting || 'Terplotting');
      setCatatan(plottingItem.catatan || '');
    } else {
      // Find first unassigned student if available
      const plottedNisnSet = new Set(existingPlottingList.map((p) => p.nisn.replace(/\s+/g, '')));
      const unassignedStudent = siswaList.find((s) => !plottedNisnSet.has(s.nisn.replace(/\s+/g, '')));
      setSelectedNisn(unassignedStudent ? unassignedStudent.nisn : (siswaList[0]?.nisn || ''));
      setSelectedInstansiId(instansiList[0]?.id || '');
      setSelectedGuruNip(guruList[0]?.nip || '');
      setPeriodeMulai('15 Juli 2026');
      setPeriodeSelesai('15 Desember 2026');
      setStatusPlotting('Terplotting');
      setCatatan('');
    }
    setFormError('');
  }, [plottingItem, isOpen, siswaList, instansiList, guruList, existingPlottingList]);

  if (!isOpen) return null;

  // Selected entities
  const currentSiswa = siswaList.find((s) => s.nisn === selectedNisn) || {
    nisn: selectedNisn,
    namaLengkap: plottingItem?.namaSiswa || 'Siswa',
    kelas: plottingItem?.kelas || 'XII RPL',
    jurusan: plottingItem?.jurusan || 'Rekayasa Perangkat Lunak',
  };

  const currentInstansi = instansiList.find((i) => i.id === selectedInstansiId);
  const currentGuru = guruList.find((g) => g.nip.replace(/\s+/g, '') === selectedGuruNip.replace(/\s+/g, ''));

  // Hitung jumlah siswa di instansi terpilih saat ini
  const instansiAssignedCount = currentInstansi
    ? existingPlottingList.filter(
        (p) =>
          p.instansiNama?.toLowerCase().trim() === currentInstansi.nama.toLowerCase().trim() &&
          p.nisn !== selectedNisn
      ).length
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedNisn) {
      setFormError('Silakan pilih Siswa yang akan di-plotting.');
      return;
    }

    const payload: PlottingSiswaPKL = {
      id: plottingItem?.id || `plot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      siswaId: plottingItem?.siswaId || `ms-${selectedNisn}`,
      nisn: selectedNisn,
      namaSiswa: currentSiswa.namaLengkap,
      kelas: currentSiswa.kelas,
      jurusan: currentSiswa.jurusan,
      instansiId: currentInstansi?.id || '',
      instansiNama: currentInstansi?.nama || '',
      alamatInstansi: currentInstansi?.alamat || '',
      pembimbingInstansi: currentInstansi?.pembimbingInstansi || '',
      guruId: currentGuru?.id || '',
      guruNama: currentGuru?.nama || '',
      guruNip: currentGuru?.nip || '',
      guruTelepon: currentGuru?.telepon || '',
      periodeMulai: periodeMulai.trim() || '15 Juli 2026',
      periodeSelesai: periodeSelesai.trim() || '15 Desember 2026',
      statusPlotting: statusPlotting,
      catatan: catatan.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-700 via-emerald-700 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Compass className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                {isEditing ? 'Perbarui Data Plotting Siswa PKL' : 'Plotting & Penempatan Siswa Baru'}
              </h3>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Hubungkan siswa dengan instansi mitra DUDI, guru pembimbing, dan periode waktu magang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Pilih Siswa PKL */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>Pilih Siswa PKL <span className="text-red-500">*</span></span>
            </label>
            <select
              value={selectedNisn}
              onChange={(e) => setSelectedNisn(e.target.value)}
              disabled={isEditing}
              className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden transition-all ${
                isEditing ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''
              }`}
            >
              <option value="">-- Pilih Siswa dari Master Siswa --</option>
              {siswaList.map((siswa) => (
                <option key={siswa.id} value={siswa.nisn}>
                  {siswa.namaLengkap} ({siswa.nisn}) &bull; {siswa.kelas} - {siswa.jurusan}
                </option>
              ))}
            </select>
            {currentSiswa && selectedNisn && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                <span>Kelas: <b className="text-slate-900">{currentSiswa.kelas}</b></span>
                <span>Jurusan: <b className="text-slate-900">{currentSiswa.jurusan}</b></span>
              </div>
            )}
          </div>

          {/* 2. Pilih Instansi PKL (DUDI) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Instansi PKL (Penempatan DUDI)</span>
              </span>
              {currentInstansi && (
                <span className={`text-[11px] font-bold ${
                  instansiAssignedCount >= currentInstansi.kuota ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  Kapasitas Terisi: {instansiAssignedCount} / {currentInstansi.kuota} Siswa
                </span>
              )}
            </label>
            <select
              value={selectedInstansiId}
              onChange={(e) => setSelectedInstansiId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden transition-all"
            >
              <option value="">-- Belum Ditempatkan / Kosongkan --</option>
              {instansiList.map((instansi) => (
                <option key={instansi.id} value={instansi.id}>
                  {instansi.nama} (Kuota: {instansi.kuota} siswa)
                </option>
              ))}
            </select>
            {currentInstansi && (
              <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 space-y-1">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{currentInstansi.alamat}</span>
                </div>
                <div className="text-slate-600 pl-5">
                  Pembimbing DUDI: <b>{currentInstansi.pembimbingInstansi || '-'}</b> &bull; Kontak: {currentInstansi.kontakPerson || '-'}
                </div>
              </div>
            )}
          </div>

          {/* 3. Pilih Guru Pembimbing Sekolah */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Guru Pembimbing Sekolah</span>
            </label>
            <select
              value={selectedGuruNip}
              onChange={(e) => setSelectedGuruNip(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden transition-all"
            >
              <option value="">-- Belum Ditentukan / Kosongkan --</option>
              {guruList.map((guru) => (
                <option key={guru.id} value={guru.nip}>
                  {guru.nama} (NIP: {guru.nip})
                </option>
              ))}
            </select>
            {currentGuru && (
              <div className="p-2.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-[11px] text-purple-900 flex items-center justify-between">
                <span>NIP: <b className="font-mono">{currentGuru.nip}</b></span>
                <span>Kontak: {currentGuru.telepon || '-'}</span>
                <span>Bidang: {currentGuru.bidangStudi || '-'}</span>
              </div>
            )}
          </div>

          {/* 4. Periode Mulai & Selesai PKL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Periode Mulai PKL</span>
              </label>
              <input
                type="text"
                value={periodeMulai}
                onChange={(e) => setPeriodeMulai(e.target.value)}
                placeholder="Contoh: 15 Juli 2026 atau 2026-07-15"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Periode Selesai PKL</span>
              </label>
              <input
                type="text"
                value={periodeSelesai}
                onChange={(e) => setPeriodeSelesai(e.target.value)}
                placeholder="Contoh: 15 Desember 2026 atau 2026-12-15"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* 5. Status Plotting */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Status Plotting Penempatan</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Terplotting', 'Belum Terplotting', 'Sedang PKL', 'Selesai PKL'] as StatusPlotting[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusPlotting(status)}
                  className={`px-3 py-2 rounded-xl font-bold text-xs border text-center transition-all ${
                    statusPlotting === status
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Catatan Penempatan */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Catatan / Keterangan Penempatan (Opsional)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
              placeholder="Catatan divisi magang, nomor surat pengantar, atau status verifikasi berkas..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden transition-all"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              {isEditing ? 'Simpan Perubahan' : 'Terapkan Plotting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
