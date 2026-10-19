import React from 'react';
import { BookOpen, CheckCircle, Award, Scale, HelpCircle } from 'lucide-react';
import { KriteriaNilai } from '../types/index.ts';
import { DEFAULT_KRITERIA } from '../utils/scoring.ts';

interface RubrikGuideProps {
  kriteriaList?: KriteriaNilai[];
}

export const RubrikGuide: React.FC<RubrikGuideProps> = ({
  kriteriaList = DEFAULT_KRITERIA,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Panduan Rubrik & Standar Penilaian Sidang PKL
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pedoman baku dewan penguji dalam menilai kompetensi kejuruan dan laporan Praktik Kerja Lapangan.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Rubrik Criteria Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {kriteriaList.map((kriteria, idx) => (
          <div
            key={kriteria.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Bobot Penilaian {kriteria.bobot}%
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {kriteria.nama}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {kriteria.deskripsi}
              </p>

              {/* Rubric Band Descriptors */}
              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60">
                  <span className="font-bold text-emerald-900 block">Sangat Baik (Skor 85 - 100)</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Memenuhi seluruh indikator secara sempurna, sistematis, mendalam, dan mampu mendemonstrasikan keahlian industri dengan prima.
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/60">
                  <span className="font-bold text-blue-900 block">Baik (Skor 75 - 84)</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Memenuhi sebagian besar indikator dengan tepat, pemahaman konsep baik, hanya terdapat sedikit kekurangan teknis minor.
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60">
                  <span className="font-bold text-amber-900 block">Cukup (Skor 65 - 74)</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Memenuhi standar minimal kejuruan, namun membutuhkan arahan dan perbaikan revisi laporan.
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-red-50/70 border border-red-200/60">
                  <span className="font-bold text-red-900 block">Kurang / Mengulang (&lt; 65)</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Tidak menguasai materi atau laporan tidak memenuhi standar minimum PKL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pedoman Konversi & Predikat */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-600" />
          <span>Tabel Konversi Nilai Huruf & Ketentuan Kelulusan Sidang</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50">
            <span className="text-xs font-mono font-bold text-emerald-800 block">Skor 85 - 100</span>
            <span className="text-2xl font-black text-emerald-700">A</span>
            <p className="text-[11px] text-emerald-800 mt-1 font-semibold">Lulus Murni / Sangat Memuaskan</p>
          </div>

          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50">
            <span className="text-xs font-mono font-bold text-blue-800 block">Skor 75 - 84.99</span>
            <span className="text-2xl font-black text-blue-700">B</span>
            <p className="text-[11px] text-blue-800 mt-1 font-semibold">Lulus / Memuaskan</p>
          </div>

          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50">
            <span className="text-xs font-mono font-bold text-amber-800 block">Skor 65 - 74.99</span>
            <span className="text-2xl font-black text-amber-700">C</span>
            <p className="text-[11px] text-amber-800 mt-1 font-semibold">Lulus dengan Revisi (Maks 7 Hari)</p>
          </div>

          <div className="p-3 rounded-xl border border-red-200 bg-red-50">
            <span className="text-xs font-mono font-bold text-red-800 block">Skor &lt; 65</span>
            <span className="text-2xl font-black text-red-700">D / E</span>
            <p className="text-[11px] text-red-800 mt-1 font-semibold">Wajib Mengulang Sidang PKL</p>
          </div>
        </div>
      </div>

    </div>
  );
};
