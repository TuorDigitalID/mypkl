import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  Award, 
  Users, 
  Printer,
  Trash2,
  RotateCcw,
  AlertTriangle,
  X,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { MahasiswaSidang, PenilaianPenguji } from '../types/index.ts';
import { calculateFinalAggregate } from '../utils/scoring.ts';

interface RekapitulasiViewProps {
  pesertaList: MahasiswaSidang[];
  penilaianList: PenilaianPenguji[];
  onOpenBeritaAcara: (mahasiswaId: string) => void;
  onSelectPesertaForSidang: (mahasiswaId: string) => void;
  onOpenSertifikat?: (mahasiswaId: string) => void;
  isAdmin?: boolean;
  onResetNilaiMahasiswa?: (mahasiswaId: string, nama: string) => Promise<void>;
  onResetAllNilai?: () => Promise<void>;
}

export const RekapitulasiView: React.FC<RekapitulasiViewProps> = ({
  pesertaList,
  penilaianList,
  onOpenBeritaAcara,
  onOpenSertifikat,
  isAdmin = false,
  onResetNilaiMahasiswa,
  onResetAllNilai,
}) => {
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  // Compute overall statistics with 2 examiners per room
  const totalPeserta = pesertaList.length;
  const selesaiCount = pesertaList.filter((p) => p.status === 'selesai').length;
  const berlangsungCount = pesertaList.filter((p) => p.status === 'berlangsung').length;

  const validScores: number[] = [];
  pesertaList.forEach((p) => {
    const agg = calculateFinalAggregate(p.id, penilaianList, 2);
    if (agg.nilaiAkhirAngka > 0) {
      validScores.push(agg.nilaiAkhirAngka);
    }
  });

  const meanScore =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
      : '0.00';

  // Export to CSV function matching the 2-examiner 50:50 formula
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIM',
      'Nama Mahasiswa',
      'Program Studi',
      'Tempat PKL',
      'Nilai Jurnal PKL (Skor 0-100)',
      'Poin Jurnal PKL (Bobot 50%)',
      'Nilai Sidang Penguji 1',
      'Nilai Sidang Penguji 2',
      'Nilai Sidang Gabungan (P1+P2)/2',
      'Poin Sidang (Bobot 50%)',
      'Nilai Akhir Angka (100%)',
      'Nilai Huruf',
      'Predikat',
      'Keputusan Sidang',
    ];

    const rows = pesertaList.map((p, index) => {
      const agg = calculateFinalAggregate(p.id, penilaianList, 2);

      return [
        index + 1,
        `"${p.nim}"`,
        `"${p.nama}"`,
        `"${p.prodi}"`,
        `"${p.perusahaan}"`,
        agg.nilaiJurnalPkl > 0 ? agg.nilaiJurnalPkl.toFixed(1) : '-',
        agg.poinJurnalPkl50 > 0 ? agg.poinJurnalPkl50.toFixed(1) : '-',
        agg.nilaiSidangP1 > 0 ? agg.nilaiSidangP1.toFixed(1) : '-',
        agg.nilaiSidangP2 > 0 ? agg.nilaiSidangP2.toFixed(1) : '-',
        agg.nilaiSidangGabungan > 0 ? agg.nilaiSidangGabungan.toFixed(1) : '-',
        agg.poinSidang50 > 0 ? agg.poinSidang50.toFixed(1) : '-',
        agg.nilaiAkhirAngka > 0 ? agg.nilaiAkhirAngka.toFixed(2) : '-',
        agg.nilaiAkhirHuruf,
        `"${agg.predikat}"`,
        `"${agg.keputusanAkhir}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_Sidang_PKL_2Penguji_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span>Rekapitulasi Nilai Sidang PKL (2 Penguji per Ruangan)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Formula Resmi: Nilai Sidang (Penguji 1 + Penguji 2)/2 berkontribusi <strong>50%</strong> + Nilai Jurnal PKL (5 Aspek Agenda) berkontribusi <strong>50%</strong> = <strong>100% Nilai Akhir</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={() => setIsResetAllModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
              title="Reset Seluruh Nilai Uji Coba (Khusus Administrator)"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Semua Nilai Uji Coba</span>
            </button>
          )}

          {onOpenSertifikat && pesertaList.length > 0 && (
            <button
              onClick={() => onOpenSertifikat(pesertaList[0].id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              title="Buka &amp; Cetak Sertifikat PKL A4 2 Muka"
            >
              <Award className="w-4 h-4" />
              <span>Cetak Sertifikat A4</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak Rekap</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Toast Notifikasi Sukses */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
              Rata-Rata Nilai Akhir
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
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-4">Peserta & NIM</th>
                <th className="py-3 px-4">Tempat PKL (DUDI)</th>
                <th className="py-3 px-3 text-center bg-amber-50/50">Jurnal PKL (50%)</th>
                <th className="py-3 px-3 text-center">Sidang P1 (Ketua)</th>
                <th className="py-3 px-3 text-center">Sidang P2 (Sekr)</th>
                <th className="py-3 px-3 text-center bg-orange-50/50">Rata-Rata Sidang (50%)</th>
                <th className="py-3 px-4 text-center bg-emerald-50/50">Nilai Akhir (100%)</th>
                <th className="py-3 px-4 text-center">Keputusan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pesertaList.map((peserta, index) => {
                const agg = calculateFinalAggregate(peserta.id, penilaianList, 2);

                return (
                  <tr key={peserta.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-400">
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

                    {/* Nilai Jurnal PKL (50%) */}
                    <td className="py-3.5 px-3 text-center bg-amber-50/20">
                      {agg.nilaiJurnalPkl > 0 ? (
                        <div className="font-mono">
                          <span className="font-bold text-slate-900">{agg.nilaiJurnalPkl.toFixed(1)}</span>
                          <span className="text-[10px] text-amber-700 font-bold block">
                            (Poin: {agg.poinJurnalPkl50.toFixed(1)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Penguji 1 Sidang */}
                    <td className="py-3.5 px-3 text-center">
                      {agg.nilaiSidangP1 > 0 ? (
                        <div className="font-mono">
                          <span className="font-bold text-slate-800">{agg.nilaiSidangP1.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Penguji 2 Sidang */}
                    <td className="py-3.5 px-3 text-center">
                      {agg.nilaiSidangP2 > 0 ? (
                        <div className="font-mono">
                          <span className="font-bold text-slate-800">{agg.nilaiSidangP2.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Nilai Sidang Gabungan (50%) */}
                    <td className="py-3.5 px-3 text-center bg-orange-50/20">
                      {agg.nilaiSidangGabungan > 0 ? (
                        <div className="font-mono">
                          <span className="font-bold text-slate-900">{agg.nilaiSidangGabungan.toFixed(1)}</span>
                          <span className="text-[10px] text-orange-700 font-bold block">
                            (Poin: {agg.poinSidang50.toFixed(1)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Final 100% Score */}
                    <td className="py-3.5 px-4 text-center bg-emerald-50/20">
                      {agg.nilaiAkhirAngka > 0 ? (
                        <div>
                          <span className="font-mono font-black text-sm text-slate-900">
                            {agg.nilaiAkhirAngka.toFixed(2)}
                          </span>
                          <span className="ml-1.5 font-bold text-xs text-emerald-700">
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
                        {isAdmin && (agg.nilaiAkhirAngka > 0 || agg.totalPengujiMenilai > 0) && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Yakin ingin mereset seluruh nilai ujian sidang untuk siswa "${peserta.nama}"? Nilai dari semua dewan penguji akan dihapus dan status dikembalikan ke Menunggu.`)) {
                                await onResetNilaiMahasiswa?.(peserta.id, peserta.nama);
                                setToastMessage(`Nilai siswa ${peserta.nama} berhasil direset.`);
                                setTimeout(() => setToastMessage(''), 4000);
                              }
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold cursor-pointer transition-colors"
                            title="Reset Nilai Siswa Ini (Admin)"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                            <span className="hidden sm:inline">Reset Nilai</span>
                          </button>
                        )}

                        {onOpenSertifikat && (
                          <button
                            type="button"
                            onClick={() => onOpenSertifikat(peserta.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold cursor-pointer transition-colors shadow-2xs"
                            title="Cetak Sertifikat Kelulusan PKL A4 (2 Muka)"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span>Sertifikat</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenBeritaAcara(peserta.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
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

      {/* Modal Konfirmasi Reset Seluruh Nilai (Khusus Administrator) */}
      {isResetAllModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget && !isResetting) setIsResetAllModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl border border-red-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-100 text-red-600 shadow-xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    Reset Seluruh Nilai Sidang
                  </h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block">
                    Fitur Khusus Administrator
                  </span>
                </div>
              </div>
              <button
                disabled={isResetting}
                onClick={() => setIsResetAllModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs text-red-950 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="font-bold leading-relaxed">
                  Tindakan ini akan menghapus permanen seluruh nilai sidang yang tersimpan di database Supabase ({penilaianList.length} rekaman nilai).
                </p>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 font-medium">
                <li>Seluruh nilai dari <strong>Penguji 1 &amp; Penguji 2</strong> akan dihapus bersih.</li>
                <li>Status sidang seluruh peserta akan dikembalikan menjadi <strong>Menunggu</strong>.</li>
                <li>Fitur ini dirancang khusus untuk membersihkan data hasil uji coba / simulasi.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetAllModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={async () => {
                  setIsResetting(true);
                  try {
                    await onResetAllNilai?.();
                    setIsResetAllModalOpen(false);
                    setToastMessage('Seluruh nilai sidang uji coba berhasil dibersihkan.');
                    setTimeout(() => setToastMessage(''), 4000);
                  } finally {
                    setIsResetting(false);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isResetting ? (
                  <span>Sedang Menghapus...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Bersihkan &amp; Reset Semua Nilai</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
