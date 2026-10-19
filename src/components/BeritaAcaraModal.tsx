import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  CheckCircle2, 
  FileText, 
  AlertCircle 
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

  const aggregate = calculateFinalAggregate(mahasiswa.id, penilaianList, 3);

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
              Berita Acara & Lembar Penilaian Resmi Sidang PKL
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
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
              Sistem Penilaian Terpadu & Terverifikasi Real-Time • Tahun Ajaran 2026/2027
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
            Pada hari ini, dewan penguji telah melaksanakan Ujian Sidang Praktik Kerja Lapangan (PKL) bagi mahasiswa berikut:
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
              <span className="font-semibold text-slate-500">Ruangan & Waktu</span>
              <span className="col-span-2 sm:col-span-3 text-slate-700">: {mahasiswa.ruangan}</span>
            </div>
          </div>

          {/* Rincian Penilaian Dewan Penguji */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              A. Rekapitulasi Penilaian Dewan Penguji
            </h4>
            <table className="w-full text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                  <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border-r border-slate-300 text-left">Nama Dewan Penguji</th>
                  <th className="p-2 border-r border-slate-300 text-left">Jabatan Sidang</th>
                  <th className="p-2 border-r border-slate-300 text-center w-24">Nilai Angka</th>
                  <th className="p-2 text-center w-24">Nilai Huruf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DAFTAR_PENGUJI.map((penguji, idx) => {
                  const ev = aggregate.nilaiPerPenguji.find((n) => n.pengujiId === penguji.id);
                  return (
                    <tr key={penguji.id}>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-200 font-semibold">{penguji.nama}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-600">{penguji.peran}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">
                        {ev ? ev.totalNilai.toFixed(2) : '-'}
                      </td>
                      <td className="p-2 text-center font-bold text-emerald-700">
                        {ev ? ev.nilaiHuruf : '-'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <td colSpan={3} className="p-2 border-r border-slate-300 text-right uppercase">
                    Nilai Akhir Rata-Rata Gabungan:
                  </td>
                  <td className="p-2 border-r border-slate-300 text-center font-mono text-sm text-slate-900">
                    {aggregate.nilaiAkhirAngka > 0 ? aggregate.nilaiAkhirAngka.toFixed(2) : '-'}
                  </td>
                  <td className="p-2 text-center font-black text-sm text-emerald-700">
                    {aggregate.nilaiAkhirAngka > 0 ? aggregate.nilaiAkhirHuruf : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Keputusan Akhir */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-600 block mb-1">
              B. Keputusan Dewan Penguji
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

          {/* Tanda Tangan Dewan Penguji */}
          <div>
            <p className="text-xs text-right text-slate-600 mb-6">
              Ditetapkan di Ruang Sidang PKL, {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              {DAFTAR_PENGUJI.map((penguji) => (
                <div key={penguji.id} className="flex flex-col justify-between h-32 border border-slate-200 p-2.5 rounded-lg bg-slate-50/50">
                  <p className="font-semibold text-slate-600">{penguji.peran}</p>
                  <div className="my-auto py-2">
                    <span className="text-[10px] text-emerald-600 font-mono font-medium border border-dashed border-emerald-300 px-2 py-0.5 rounded bg-emerald-50">
                      Telah Diverifikasi Digital
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
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
