import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Scale, 
  FileText, 
  Presentation, 
  Calculator, 
  Info, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { KriteriaNilai } from '../types/index.ts';
import { DEFAULT_KRITERIA, GRADE_RANGES, calculateCategoryBreakdown, calculateGradeLetter, calculatePredicate, getGradeRangeInfo } from '../utils/scoring.ts';

interface RubrikGuideProps {
  kriteriaList?: KriteriaNilai[];
}

export const RubrikGuide: React.FC<RubrikGuideProps> = ({
  kriteriaList = DEFAULT_KRITERIA,
}) => {
  // Simulator State for interactive evaluation testing
  const [simScores, setSimScores] = useState<Record<string, number>>({
    k1_agenda_disiplin: 85,
    k2_agenda_kerjasama: 80,
    k3_agenda_inisiatif: 82,
    k4_agenda_tanggungjawab: 85,
    k5_agenda_kebersihan: 88,
    k6_sidang_presentasi: 85,
    k7_sidang_tanyajawab: 80,
  });

  const simItems = kriteriaList.map((k) => ({
    kriteriaId: k.id,
    skor: simScores[k.id] ?? 80,
  }));

  const simBreakdown = calculateCategoryBreakdown(simItems, kriteriaList);
  const simGrade = calculateGradeLetter(simBreakdown.totalNilai);
  const simPredicate = calculatePredicate(simBreakdown.totalNilai);
  const simRangeInfo = getGradeRangeInfo(simBreakdown.totalNilai);

  const agendaCriteria = kriteriaList.filter((k) => k.kategori === 'agenda');
  const sidangCriteria = kriteriaList.filter((k) => k.kategori === 'sidang');

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Luxury Orange Gradient */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 ring-4 ring-orange-100 flex-shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Pedoman Rubrik & Standar Penilaian Sidang PKL
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-orange-100 to-amber-100 text-orange-900 border border-orange-200">
                  Resmi 2 Kategori (50% : 50%)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Panduan baku dewan penguji dalam menilai kompetensi kejuruan: gabungan 5 Aspek Buku Agenda PSG/PKL (bobot 50%) dan 2 Aspek Ujian Sidang PKL (bobot 50%).
              </p>
            </div>
          </div>

          {/* Quick summary stats */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-200/80 p-3.5 rounded-2xl">
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-orange-800 uppercase block">Buku Agenda</span>
              <span className="text-lg font-black text-orange-950 font-mono">5 Aspek (50%)</span>
            </div>
            <div className="w-px h-8 bg-orange-300/60" />
            <div className="text-center px-2">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Ujian Sidang</span>
              <span className="text-lg font-black text-amber-950 font-mono">2 Aspek (50%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* STANDAR RANGE NILAI TABLE (EXACT USER SPECIFICATION) */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                Tabel Standar Range Nilai Sidang PKL
              </h3>
              <p className="text-xs text-slate-500">
                Klasifikasi predikat kelulusan dan batasan minimal kompetensi KKM
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Batas Minimal Lulus KKM = Skor 60 (Grade C)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GRADE_RANGES.map((range) => (
            <div 
              key={range.huruf}
              className={`p-5 rounded-2xl border ${range.badgeBorder} ${range.badgeBg} flex flex-col justify-between transition-all hover:scale-[1.01]`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                    {range.predikatSingkat}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                    range.isLulus ? 'bg-white/80 text-emerald-800' : 'bg-red-200 text-red-900'
                  }`}>
                    {range.isLulus ? 'Lulus' : 'Remedial'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black font-mono text-slate-900">
                    {range.huruf}
                  </span>
                  <span className="text-sm font-bold text-slate-600 font-mono">
                    {range.min} – {range.max}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800 leading-snug">
                  {range.keterangan}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600">
                {range.huruf === 'A' && 'Nilai tertinggi, menunjukkan keahlian dan laporan yang sangat istimewa.'}
                {range.huruf === 'B' && 'Memenuhi standar kompetensi kejuruan dengan baik dan memuaskan.'}
                {range.huruf === 'C' && 'Batas nilai minimal kelulusan KKM sekolah. Memerlukan bimbingan revisi.'}
                {range.huruf === 'D' && 'Belum mencapai batas KKM (60). Wajib mengikuti ujian sidang perbaikan / remedial.'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2 CATEGORIES BREAKDOWN & CRITERIA DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* KATEGORI 1: BUKU AGENDA PSG/PKL (50%) */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Aspek Buku Agenda PSG/PKL
                </h3>
                <p className="text-xs text-orange-700 font-bold">
                  5 Aspek Penilaian • Total Bobot 50%
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-orange-500 text-white shadow-xs">
              50 %
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Menilai kedisiplinan, etos kerja industri, dan kerapian pencatatan kegiatan harian selama siswa melaksanakan praktik kerja lapangan di instansi DUDI.
          </p>

          <div className="space-y-3 flex-1">
            {agendaCriteria.map((item, idx) => (
              <div 
                key={item.id}
                className="p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.nama}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md">
                    Bobot {item.bobot}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Rata-rata 5 Aspek Agenda × 50%</span>
            <span className="font-mono font-bold text-slate-900">Maks 50 Poin</span>
          </div>
        </div>

        {/* KATEGORI 2: UJIAN SIDANG PKL (50%) */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Presentation className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Aspek Ujian Sidang PKL
                </h3>
                <p className="text-xs text-amber-700 font-bold">
                  2 Aspek Penilaian • Total Bobot 50%
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-600 text-white shadow-xs">
              50 %
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Menilai performa langsung siswa di hadapan dewan penguji sidang dalam memaparkan hasil laporan dan mempertahankan argumentasi teknis kejuruan.
          </p>

          <div className="space-y-3 flex-1">
            {sidangCriteria.map((item, idx) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                      {idx + 6}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.nama}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    Bobot {item.bobot}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Rata-rata 2 Aspek Sidang × 50%</span>
            <span className="font-mono font-bold text-slate-900">Maks 50 Poin</span>
          </div>
        </div>

      </div>

      {/* INTERACTIVE FORMULA & SIMULATOR */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white rounded-xl shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                Simulasi Perhitungan Skor Terbobot & Predikat KKM
              </h3>
              <p className="text-xs text-slate-500">
                Uji coba pergeseran nilai untuk melihat perhitungan rumus 50% Agenda + 50% Sidang secara langsung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSimScores({
                  k1_agenda_disiplin: 88,
                  k2_agenda_kerjasama: 85,
                  k3_agenda_inisiatif: 86,
                  k4_agenda_tanggungjawab: 87,
                  k5_agenda_kebersihan: 89,
                  k6_sidang_presentasi: 88,
                  k7_sidang_tanyajawab: 85,
                });
              }}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 hover:bg-emerald-100"
            >
              Preset Grade A (87.0)
            </button>
            <button
              onClick={() => {
                setSimScores({
                  k1_agenda_disiplin: 75,
                  k2_agenda_kerjasama: 78,
                  k3_agenda_inisiatif: 74,
                  k4_agenda_tanggungjawab: 76,
                  k5_agenda_kebersihan: 77,
                  k6_sidang_presentasi: 75,
                  k7_sidang_tanyajawab: 75,
                });
              }}
              className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-800 rounded-lg border border-blue-200 hover:bg-blue-100"
            >
              Preset Grade B (75.5)
            </button>
            <button
              onClick={() => {
                setSimScores({
                  k1_agenda_disiplin: 65,
                  k2_agenda_kerjasama: 62,
                  k3_agenda_inisiatif: 64,
                  k4_agenda_tanggungjawab: 63,
                  k5_agenda_kebersihan: 66,
                  k6_sidang_presentasi: 62,
                  k7_sidang_tanyajawab: 60,
                });
              }}
              className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-800 rounded-lg border border-amber-200 hover:bg-amber-100"
            >
              Preset KKM C (62.4)
            </button>
          </div>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[11px] font-extrabold text-orange-800 uppercase tracking-wider block">
              Hasil Simulasi Nilai Akhir
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900">
                {simBreakdown.totalNilai.toFixed(2)}
              </span>
              <span className={`text-2xl font-black px-3 py-0.5 rounded-xl border ${simRangeInfo.badgeBg} ${simRangeInfo.badgeText} ${simRangeInfo.badgeBorder}`}>
                Grade {simGrade}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-700">
              {simRangeInfo.predikatSingkat} — {simPredicate}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3 bg-white rounded-xl border border-orange-200 text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 font-sans block">Subtotal Agenda (50%)</span>
              <span className="font-bold text-slate-800 text-sm">{simBreakdown.subtotalAgenda.toFixed(1)}</span>
              <span className="text-[10px] text-orange-600 block mt-0.5">+{simBreakdown.weightedAgenda.toFixed(2)} pts</span>
            </div>

            <span className="text-slate-400 font-black text-base">+</span>

            <div className="p-3 bg-white rounded-xl border border-amber-200 text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 font-sans block">Subtotal Sidang (50%)</span>
              <span className="font-bold text-slate-800 text-sm">{simBreakdown.subtotalSidang.toFixed(1)}</span>
              <span className="text-[10px] text-amber-600 block mt-0.5">+{simBreakdown.weightedSidang.toFixed(2)} pts</span>
            </div>

            <span className="text-slate-400 font-black text-base">=</span>

            <div className="p-3 bg-orange-600 text-white rounded-xl text-center shadow-md shadow-orange-500/25">
              <span className="text-[10px] text-orange-200 font-sans block">Total Terbobot</span>
              <span className="font-bold text-white text-sm">{simBreakdown.totalNilai.toFixed(2)}</span>
              <span className="text-[10px] text-white/90 block mt-0.5">/ 100</span>
            </div>
          </div>
        </div>

        {/* Sliders for the 7 Aspects in the Simulator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kriteriaList.map((k) => (
            <div key={k.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded text-[10px] font-black bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                    {k.nomor}
                  </span>
                  <span className="font-bold text-slate-800 truncate">{k.nama}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simScores[k.id] ?? 80}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSimScores((prev) => ({ ...prev, [k.id]: val }));
                  }}
                  className="w-full mt-1.5 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              <div className="w-12 text-right">
                <span className="font-mono font-bold text-sm text-slate-900">
                  {simScores[k.id] ?? 80}
                </span>
                <span className="text-[10px] text-slate-400 block">/ 100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
