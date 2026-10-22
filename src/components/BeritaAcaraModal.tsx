import React from 'react';
import { 
  X, 
  Printer, 
  FileText
} from 'lucide-react';
import { MahasiswaSidang, PenilaianPenguji } from '../types/index.ts';
import { calculateFinalAggregate } from '../utils/scoring.ts';
import { DAFTAR_PENGUJI } from '../data/penguji.ts';

interface BeritaAcaraModalProps {
  mahasiswaId: string | null;
  pesertaList: MahasiswaSidang[];
  penilaianList: PenilaianPenguji[];
  onClose: () => void;
}

export const BeritaAcaraModal: React.FC<BeritaAcaraModalProps> = ({
  mahasiswaId,
  pesertaList,
  penilaianList,
  onClose,
}) => {
  const mahasiswa = pesertaList.find((p) => p.id === mahasiswaId);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!mahasiswa) return null;

  // 2 examiners per room formula
  const aggregate = calculateFinalAggregate(mahasiswa.id, penilaianList, 2);

  // Filter 2 dewan penguji ruangan (Penguji 1 & Penguji 2)
  const dewanPengujiRuangan = DAFTAR_PENGUJI.slice(0, 2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Control Bar (Hidden when printed) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Berita Acara & Lembar Penilaian Resmi Sidang PKL (2 Penguji)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Academic Document Sheet */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 font-sans leading-normal">
          
          {/* KOP SURAT RESMI */}
          <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
            <p className="text-xs uppercase tracking-widest font-bold text-slate-600">
              Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
            </p>
            <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight mt-0.5">
              Panitia Ujian Sidang Praktik Kerja Lapangan (PKL)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistem Penilaian Terpadu 2 Penguji Ruangan (50% Sidang + 50% Jurnal PKL) • TA 2026/2027
            </p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-base sm:text-lg font-extrabold underline uppercase tracking-wide">
              BERITA ACARA SIDANG PKL
            </h2>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Nomor Dokumen: BA-PKL/{new Date().getFullYear()}/{mahasiswa.nim}
            </p>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed mb-4">
            Pada hari ini, dewan penguji yang bertugas di ruangan sidang telah melaksanakan Ujian Sidang Praktik Kerja Lapangan (PKL) bagi mahasiswa berikut:
          </p>

          {/* Identitas Mahasiswa */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 mb-6">
            <div className="grid grid-cols-3 sm:grid-cols-4">
              <span className="font-semibold text-slate-500">Nama Mahasiswa</span>
              <span className="col-span-2 sm:col-span-3 font-bold text-slate-900">: {mahasiswa.nama}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4">
              <span className="font-semibold text-slate-500">NIM / NISN</span>
              <span className="col-span-2 sm:col-span-3 font-mono font-bold text-slate-800">: {mahasiswa.nim}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4">
              <span className="font-semibold text-slate-500">Program Keahlian / Prodi</span>
              <span className="col-span-2 sm:col-span-3 text-slate-800">: {mahasiswa.prodi} ({mahasiswa.kelas})</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4">
              <span className="font-semibold text-slate-500">Instansi / Perusahaan (DUDI)</span>
              <span className="col-span-2 sm:col-span-3 font-semibold text-emerald-800">: {mahasiswa.perusahaan}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4">
              <span className="font-semibold text-slate-500">Judul Laporan PKL</span>
              <span className="col-span-2 sm:col-span-3 text-slate-900 font-medium italic">: "{mahasiswa.judulLaporan}"</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4">
              <span className="font-semibold text-slate-500">Ruangan Sidang</span>
              <span className="col-span-2 sm:col-span-3 text-slate-700">: {mahasiswa.ruangan} (2 Penguji)</span>
            </div>
          </div>

          {/* Rincian Komponen Nilai: 50% Sidang + 50% Jurnal PKL */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              A. Rincian & Rekapitulasi Formula Nilai Akhir (50% Sidang + 50% Jurnal PKL)
            </h4>
            <table className="w-full text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                  <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border-r border-slate-300 text-left">Komponen Penilaian</th>
                  <th className="p-2 border-r border-slate-300 text-center w-28">Skor Angka (0-100)</th>
                  <th className="p-2 border-r border-slate-300 text-center w-24">Bobot</th>
                  <th className="p-2 text-center w-28">Poin Terbobot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 1. Nilai Jurnal PKL */}
                <tr>
                  <td className="p-2 border-r border-slate-200 text-center font-mono">1</td>
                  <td className="p-2 border-r border-slate-200">
                    <p className="font-semibold text-slate-900">Nilai Jurnal PKL (Buku Agenda PSG/PKL)</p>
                    <p className="text-[10px] text-slate-500">5 Aspek: Disiplin, Kerjasama, Inisiatif, Tanggung Jawab, Kebersihan</p>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-800">
                    {aggregate.nilaiJurnalPkl > 0 ? aggregate.nilaiJurnalPkl.toFixed(2) : '-'}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-700">
                    50%
                  </td>
                  <td className="p-2 text-center font-mono font-bold text-amber-700">
                    {aggregate.poinJurnalPkl50 > 0 ? aggregate.poinJurnalPkl50.toFixed(2) : '-'}
                  </td>
                </tr>

                {/* 2. Ujian Sidang PKL: Penguji 1 */}
                <tr className="bg-slate-50/50">
                  <td className="p-2 border-r border-slate-200 text-center font-mono" rowSpan={3}>2</td>
                  <td className="p-2 border-r border-slate-200">
                    <p className="font-semibold text-slate-900">Ujian Sidang — Penguji 1 (Ketua)</p>
                    <p className="text-[10px] text-slate-500">{dewanPengujiRuangan[0]?.nama || 'Dr. Ir. Hendra Kurniawan, M.T.'}</p>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-800">
                    {aggregate.nilaiSidangP1 > 0 ? aggregate.nilaiSidangP1.toFixed(2) : '-'}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center text-slate-500 text-[11px]" rowSpan={2}>
                    (P1 + P2) / 2
                  </td>
                  <td className="p-2 text-center text-slate-400 text-[11px]" rowSpan={2}>
                    -
                  </td>
                </tr>

                {/* Ujian Sidang PKL: Penguji 2 */}
                <tr className="bg-slate-50/50">
                  <td className="p-2 border-r border-slate-200">
                    <p className="font-semibold text-slate-900">Ujian Sidang — Penguji 2 (Sekretaris)</p>
                    <p className="text-[10px] text-slate-500">{dewanPengujiRuangan[1]?.nama || 'Siti Nurhaliza, S.Kom., M.Cs.'}</p>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-800">
                    {aggregate.nilaiSidangP2 > 0 ? aggregate.nilaiSidangP2.toFixed(2) : '-'}
                  </td>
                </tr>

                {/* Nilai Sidang Gabungan */}
                <tr className="bg-orange-50/40">
                  <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                    Rata-Rata Nilai Sidang (Penguji 1 + Penguji 2)
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                    {aggregate.nilaiSidangGabungan > 0 ? aggregate.nilaiSidangGabungan.toFixed(2) : '-'}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-700">
                    50%
                  </td>
                  <td className="p-2 text-center font-mono font-bold text-orange-700">
                    {aggregate.poinSidang50 > 0 ? aggregate.poinSidang50.toFixed(2) : '-'}
                  </td>
                </tr>

                {/* Total Nilai Akhir (100%) */}
                <tr className="bg-emerald-50 font-bold border-t-2 border-slate-300">
                  <td colSpan={2} className="p-2.5 border-r border-slate-300 text-right uppercase text-slate-900">
                    Total Nilai Akhir (50% Jurnal PKL + 50% Nilai Sidang):
                  </td>
                  <td className="p-2.5 border-r border-slate-300 text-center font-mono text-base text-slate-900">
                    {aggregate.nilaiAkhirAngka > 0 ? aggregate.nilaiAkhirAngka.toFixed(2) : '-'}
                  </td>
                  <td className="p-2.5 border-r border-slate-300 text-center font-black text-xs text-slate-900">
                    100%
                  </td>
                  <td className="p-2.5 text-center font-black text-sm text-emerald-800">
                    Grade {aggregate.nilaiAkhirAngka > 0 ? aggregate.nilaiAkhirHuruf : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Keputusan Akhir */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-600 block mb-1">
              B. Keputusan Dewan Penguji Ruangan
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-700">Berdasarkan hasil sidang, mahasiswa bersangkutan dinyatakan:</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                {aggregate.keputusanAkhir} ({aggregate.predikat})
              </span>
            </div>
          </div>

          {/* Catatan Revisi Penguji */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              C. Catatan Revisi & Masukan Dewan Penguji
            </h4>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
              {aggregate.nilaiPerPenguji.some((n) => n.catatanRevisi) ? (
                aggregate.nilaiPerPenguji.map((n, i) => (
                  <div key={i} className="border-b border-slate-200 pb-1.5 last:border-none last:pb-0">
                    <span className="font-bold text-slate-700">{n.pengujiPeran}: </span>
                    <span className="text-slate-800 italic">{n.catatanRevisi || 'Tidak ada catatan perbaikan khusus.'}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">Tidak ada catatan revisi perbaikan.</p>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * Batas waktu penyelesaian revisi maksimal 7 (tujuh) hari kalender sejak berita acara ini diterbitkan.
            </p>
          </div>

          {/* Tanda Tangan 2 Dewan Penguji Ruangan */}
          <div>
            <p className="text-xs text-right text-slate-600 mb-6">
              Ditetapkan di Ruang Sidang PKL, {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            <div className="grid grid-cols-2 gap-8 max-w-xl mx-auto text-center text-xs">
              {dewanPengujiRuangan.map((penguji) => (
                <div key={penguji.id} className="flex flex-col justify-between h-36 border border-slate-300 p-3 rounded-xl bg-slate-50/70 shadow-xs">
                  <p className="font-bold text-slate-800 uppercase tracking-wide">{penguji.peran}</p>
                  <div className="my-auto py-2">
                    <span className="text-[10px] text-emerald-700 font-mono font-bold border border-dashed border-emerald-400 px-2.5 py-0.5 rounded bg-emerald-50">
                      Telah Diverifikasi Digital
                    </span>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 border-t border-slate-300 pt-1.5">
                      {penguji.nama}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">NIP: {penguji.nip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
