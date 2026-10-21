import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  Award, 
  Users, 
  ChevronRight,
  Printer
} from 'lucide-react';
import { MahasiswaSidang, PenilaianPenguji } from '../types/index.ts';
import { DAFTAR_PENGUJI } from '../data/penguji.ts';
import { calculateFinalAggregate } from '../utils/scoring.ts';

interface RekapitulasiViewProps {
  pesertaList: MahasiswaSidang[];
  penilaianList: PenilaianPenguji[];
  onOpenBeritaAcara: (mahasiswaId: string) => void;
  onSelectPesertaForSidang: (mahasiswaId: string) => void;
}

export const RekapitulasiView: React.FC<RekapitulasiViewProps> = ({
  pesertaList,
  penilaianList,
  onOpenBeritaAcara,
  onSelectPesertaForSidang,
}) => {
  // Compute overall statistics
  const totalPeserta = pesertaList.length;
  const selesaiCount = pesertaList.filter((p) => p.status === 'selesai').length;
  const berlangsungCount = pesertaList.filter((p) => p.status === 'berlangsung').length;

  const validScores: number[] = [];
  pesertaList.forEach((p) => {
    const agg = calculateFinalAggregate(p.id, penilaianList, 3);
    if (agg.nilaiAkhirAngka > 0) {
      validScores.push(agg.nilaiAkhirAngka);
    }
  });

  const meanScore =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
      : '0.00';

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIM',
      'Nama Mahasiswa',
      'Program Studi',
      'Tempat PKL',
      'Penguji 1',
      'Penguji 2',
      'Penguji 3',
      'Nilai Akhir Angka',
      'Nilai Huruf',
      'Predikat',
      'Keputusan Sidang',
    ];

    const rows = pesertaList.map((p, index) => {
      const agg = calculateFinalAggregate(p.id, penilaianList, 3);
      const p1 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p1')?.totalNilai ?? '-';
      const p2 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p2')?.totalNilai ?? '-';
      const p3 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p3')?.totalNilai ?? '-';

      return [
        index + 1,
        `"${p.nim}"`,
        `"${p.nama}"`,
        `"${p.prodi}"`,
        `"${p.perusahaan}"`,
        p1,
        p2,
        p3,
        agg.nilaiAkhirAngka > 0 ? agg.nilaiAkhirAngka : '-',
        agg.nilaiAkhirHuruf,
        `"${agg.predikat}"`,
        `"${agg.keputusanAkhir}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_Sidang_PKL_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Export Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Rekapitulasi Nilai Sidang PKL</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar komprehensif nilai kumulatif 3 dewan penguji beserta status keputusan kelulusan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak Rekap</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Mahasiswa
            </span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              {totalPeserta}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Sidang Selesai
            </span>
            <span className="text-xl font-extrabold text-blue-700 font-mono">
              {selesaiCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Sedang / Menunggu
            </span>
            <span className="text-xl font-extrabold text-amber-700 font-mono">
              {berlangsungCount + (totalPeserta - selesaiCount - berlangsungCount)}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Rata-Rata Nilai
            </span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono">
              {meanScore}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Peserta & NIM</th>
                <th className="py-3 px-4">Tempat PKL (DUDI)</th>
                <th className="py-3 px-3 text-center">Penguji 1 (Ketua)</th>
                <th className="py-3 px-3 text-center">Penguji 2 (Sekr)</th>
                <th className="py-3 px-3 text-center">Penguji 3 (Angg)</th>
                <th className="py-3 px-4 text-center">Nilai Rata-Rata</th>
                <th className="py-3 px-4 text-center">Keputusan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pesertaList.map((peserta, index) => {
                const agg = calculateFinalAggregate(peserta.id, penilaianList, 3);
                const scoreP1 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p1');
                const scoreP2 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p2');
                const scoreP3 = agg.nilaiPerPenguji.find((n) => n.pengujiId === 'p3');

                return (
                  <tr key={peserta.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-400">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm">{peserta.nama}</p>
                      <p className="font-mono text-slate-500 text-[11px]">{peserta.nim} • {peserta.prodi}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{peserta.perusahaan}</p>
                      <p className="text-slate-400 text-[11px] truncate max-w-xs">{peserta.judulLaporan}</p>
                    </td>

                    {/* Penguji 1 Score */}
                    <td className="py-3.5 px-3 text-center">
                      {scoreP1 ? (
                        <div className="font-mono">
                          <span className="font-bold text-slate-800">{scoreP1.totalNilai.toFixed(1)}</span>
                          <span className="text-[10px] text-emerald-600 font-bold ml-1">({scoreP1.nilaiHuruf})</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Penguji 2 Score */}
                    <td className="py-3.5 px-3 text-center">
                      {scoreP2 ? (
                        <div className="font-mono">
                          <span className="font-bold text-slate-800">{scoreP2.totalNilai.toFixed(1)}</span>
                          <span className="text-[10px] text-emerald-600 font-bold ml-1">({scoreP2.nilaiHuruf})</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Penguji 3 Score */}
                    <td className="py-3.5 px-3 text-center">
                      {scoreP3 ? (
                        <div className="font-mono">
                          <span className="font-bold text-slate-800">{scoreP3.totalNilai.toFixed(1)}</span>
                          <span className="text-[10px] text-emerald-600 font-bold ml-1">({scoreP3.nilaiHuruf})</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Final Average Score */}
                    <td className="py-3.5 px-4 text-center">
                      {agg.nilaiAkhirAngka > 0 ? (
                        <div>
                          <span className="font-mono font-extrabold text-sm text-slate-900">
                            {agg.nilaiAkhirAngka.toFixed(2)}
                          </span>
                          <span className="ml-1.5 font-bold text-xs text-emerald-600">
                            [{agg.nilaiAkhirHuruf}]
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum Dinilai</span>
                      )}
                    </td>

                    {/* Final Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        agg.keputusanAkhir === 'LULUS (AMAT KOMPETEN)'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : agg.keputusanAkhir === 'LULUS (KOMPETEN)'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : agg.keputusanAkhir === 'LULUS (BATAS KKM)'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : agg.keputusanAkhir === 'BELUM DINILAI'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {agg.keputusanAkhir}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenBeritaAcara(peserta.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold"
                          title="Cetak Berita Acara Sidang"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Berita Acara</span>
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
};
