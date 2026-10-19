import type { KriteriaNilai, NilaiKriteriaItem, PenilaianPenguji, HasilRekapitulasi } from '../types/index.ts';

export const DEFAULT_KRITERIA: KriteriaNilai[] = [
  {
    id: 'k1',
    nama: 'Sistematika & Mutu Dokumen Laporan PKL',
    deskripsi: 'Kerapian tata tulis EYD/PUEBI, kelengkapan bab & lampiran, kejelasan flowchart, logbook, dan data teknis lapangan.',
    bobot: 20,
    nilaiMaksimal: 100,
  },
  {
    id: 'k2',
    nama: 'Penguasaan Materi & Kompetensi Kejuruan',
    deskripsi: 'Kedalaman pemahaman pekerjaan teknis di DUDI, logika analisis sistem/mesin/aplikasi, pemahaman SOP industri.',
    bobot: 35,
    nilaiMaksimal: 100,
  },
  {
    id: 'k3',
    nama: 'Presentasi & Sikap/Etika Sidang',
    deskripsi: 'Kerapian seragam/jas almamater, ketepatan waktu tayang slide (15 menit), kejelasan intonasi dan artikulasi vokal.',
    bobot: 20,
    nilaiMaksimal: 100,
  },
  {
    id: 'k4',
    nama: 'Tanya Jawab & Pemecahan Masalah (Problem Solving)',
    deskripsi: 'Kemampuan mempertahankan argumentasi teknis, respon kritis terhadap temuan kendala di DUDI dan solusinya.',
    bobot: 25,
    nilaiMaksimal: 100,
  },
];

/**
 * Menghitung total nilai terbobot dari satu penguji
 */
export function calculateExaminerTotal(
  nilaiItems: NilaiKriteriaItem[],
  kriteriaList: KriteriaNilai[] = DEFAULT_KRITERIA
): number {
  if (!nilaiItems || nilaiItems.length === 0) return 0;

  const totalBobot = kriteriaList.reduce((acc, k) => acc + k.bobot, 0);
  if (totalBobot <= 0) return 0;

  let totalSkorBobot = 0;
  for (const item of nilaiItems) {
    const kriteria = kriteriaList.find((k) => k.id === item.kriteriaId);
    if (kriteria) {
      const validScore = Math.max(0, Math.min(100, item.skor || 0));
      totalSkorBobot += (validScore * kriteria.bobot) / 100;
    }
  }

  // Normalisasi jika total bobot tidak tepat 100
  if (totalBobot !== 100) {
    totalSkorBobot = (totalSkorBobot / totalBobot) * 100;
  }

  return Math.round(totalSkorBobot * 100) / 100;
}

/**
 * Konversi nilai angka ke huruf standar akademik
 */
export function calculateGradeLetter(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 55) return 'D';
  return 'E';
}

/**
 * Predikat deskriptif kelulusan
 */
export function calculatePredicate(score: number): string {
  if (score >= 90) return 'Sangat Memuaskan (Dengan Pujian / A+)';
  if (score >= 85) return 'Sangat Memuaskan (A)';
  if (score >= 80) return 'Memuaskan (B+)';
  if (score >= 75) return 'Baik / Memuaskan (B)';
  if (score >= 70) return 'Cukup Baik (C+)';
  if (score >= 65) return 'Cukup (C - Perlu Revisi)';
  if (score >= 55) return 'Kurang (D - Tidak Disarankan Lulus)';
  return 'Gagal / Tidak Lulus (E)';
}

/**
 * Menghitung rekapitulasi gabungan dari seluruh penguji untuk mahasiswa tertentu
 */
export function calculateFinalAggregate(
  mahasiswaId: string,
  evaluations: PenilaianPenguji[],
  requiredExaminersCount: number = 3
): HasilRekapitulasi {
  const mEvaluations = evaluations.filter(
    (e) => e.mahasiswaId === mahasiswaId && !e.isDraft
  );

  const totalPengujiMenilai = mEvaluations.length;
  const isLengkap = totalPengujiMenilai >= requiredExaminersCount;

  if (totalPengujiMenilai === 0) {
    return {
      mahasiswaId,
      totalPengujiMenilai: 0,
      totalPengujiWajib: requiredExaminersCount,
      nilaiPerPenguji: [],
      nilaiAkhirAngka: 0,
      nilaiAkhirHuruf: 'E',
      predikat: 'Belum Dinilai',
      keputusanAkhir: 'BELUM DINILAI',
      isLengkap: false,
    };
  }

  const sumTotal = mEvaluations.reduce((sum, item) => sum + item.totalNilai, 0);
  const averageScore = Math.round((sumTotal / totalPengujiMenilai) * 100) / 100;
  const letter = calculateGradeLetter(averageScore);
  const predikat = calculatePredicate(averageScore);

  // Periksa rekomendasi apakah ada yang menyarankan revisi atau mengulang
  const hasMengulang = mEvaluations.some(
    (e) => e.rekomendasiStatus === 'Mengulang Sidang'
  );
  const hasRevisi = mEvaluations.some(
    (e) => e.rekomendasiStatus === 'Lulus dengan Revisi'
  );

  let keputusanAkhir: 'LULUS DENGAN PUJIAN' | 'LULUS' | 'LULUS REVISI' | 'MENGULANG' | 'BELUM DINILAI' = 'LULUS';
  if (averageScore < 65 || hasMengulang) {
    keputusanAkhir = 'MENGULANG';
  } else if (hasRevisi || averageScore < 75) {
    keputusanAkhir = 'LULUS REVISI';
  } else if (averageScore >= 88) {
    keputusanAkhir = 'LULUS DENGAN PUJIAN';
  } else {
    keputusanAkhir = 'LULUS';
  }

  return {
    mahasiswaId,
    totalPengujiMenilai,
    totalPengujiWajib: requiredExaminersCount,
    nilaiPerPenguji: mEvaluations.map((e) => ({
      pengujiId: e.pengujiId,
      pengujiNama: e.pengujiNama,
      pengujiPeran: e.pengujiPeran,
      totalNilai: e.totalNilai,
      nilaiHuruf: e.nilaiHuruf,
      catatanRevisi: e.catatanRevisi,
      rekomendasiStatus: e.rekomendasiStatus,
      updatedAt: e.updatedAt,
    })),
    nilaiAkhirAngka: averageScore,
    nilaiAkhirHuruf: letter,
    predikat,
    keputusanAkhir,
    isLengkap,
  };
}

/**
 * Validasi form pengisian nilai
 */
export function validateScores(
  nilaiItems: NilaiKriteriaItem[],
  kriteriaList: KriteriaNilai[] = DEFAULT_KRITERIA
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const kriteria of kriteriaList) {
    const item = nilaiItems.find((i) => i.kriteriaId === kriteria.id);
    if (!item) {
      errors.push(`Kriteria "${kriteria.nama}" belum diberi nilai.`);
    } else if (typeof item.skor !== 'number' || isNaN(item.skor)) {
      errors.push(`Nilai untuk "${kriteria.nama}" harus berupa angka valid.`);
    } else if (item.skor < 0 || item.skor > 100) {
      errors.push(`Nilai untuk "${kriteria.nama}" harus di antara 0 dan 100.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Script SQL otomatis untuk Supabase (bisa disalin langsung ke SQL Editor di Supabase)
 */
export function generateSupabaseSQLSchema(): string {
  return `-- ========================================================
-- SCHEMA TABEL DATABASE SUPABASE UNTUK APLIKASI "MY PKL"
-- Salin dan jalankan seluruh script ini di Supabase SQL Editor
-- ========================================================

-- 1. Tabel Peserta Sidang PKL
CREATE TABLE IF NOT EXISTS public.peserta_sidang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nim VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(150) NOT NULL,
    prodi VARCHAR(100) NOT NULL,
    kelas VARCHAR(50),
    perusahaan VARCHAR(150) NOT NULL,
    judul_laporan TEXT NOT NULL,
    pembimbing_dudi VARCHAR(150),
    pembimbing_sekolah VARCHAR(150),
    jadwal_sidang TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    ruangan VARCHAR(50) DEFAULT 'Ruang Sidang 1',
    status VARCHAR(30) DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'berlangsung', 'selesai', 'ditunda')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel Daftar Dosen / Penguji
CREATE TABLE IF NOT EXISTS public.penguji (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nip VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(150) NOT NULL,
    peran VARCHAR(80) NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabel Penilaian Sidang (Real-Time Submissions)
CREATE TABLE IF NOT EXISTS public.penilaian_sidang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mahasiswa_id UUID NOT NULL REFERENCES public.peserta_sidang(id) ON DELETE CASCADE,
    penguji_id UUID NOT NULL REFERENCES public.penguji(id) ON DELETE CASCADE,
    penguji_nama VARCHAR(150) NOT NULL,
    penguji_peran VARCHAR(80) NOT NULL,
    nilai_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_nilai NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    nilai_huruf VARCHAR(2) NOT NULL DEFAULT 'E',
    catatan_revisi TEXT DEFAULT '',
    rekomendasi_status VARCHAR(50) DEFAULT 'Lulus',
    is_draft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_mahasiswa_penguji UNIQUE (mahasiswa_id, penguji_id)
);

-- 4. Tabel Master Siswa PKL (Akun & Pembimbing)
CREATE TABLE IF NOT EXISTS public.master_siswa_pkl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(150) NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    jurusan VARCHAR(100) NOT NULL,
    email_login VARCHAR(150) NOT NULL UNIQUE,
    password_login VARCHAR(100) NOT NULL,
    guru_pembimbing VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Aktifkan Realtime Publikasi untuk Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.peserta_sidang;
ALTER PUBLICATION supabase_realtime ADD TABLE public.penilaian_sidang;
ALTER PUBLICATION supabase_realtime ADD TABLE public.master_siswa_pkl;

-- Enable Row Level Security (RLS) & Public Access Policies for Sidang
ALTER TABLE public.peserta_sidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penguji ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian_sidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_siswa_pkl ENABLE ROW LEVEL SECURITY;

-- Policy agar semua penguji & admin dapat membaca dan mengupdate data sidang
CREATE POLICY "Public Read Access Peserta" ON public.peserta_sidang FOR SELECT USING (true);
CREATE POLICY "Public Write Access Peserta" ON public.peserta_sidang FOR ALL USING (true);

CREATE POLICY "Public Read Access Penguji" ON public.penguji FOR SELECT USING (true);
CREATE POLICY "Public Write Access Penguji" ON public.penguji FOR ALL USING (true);

CREATE POLICY "Public Read Access Penilaian" ON public.penilaian_sidang FOR SELECT USING (true);
CREATE POLICY "Public Write Access Penilaian" ON public.penilaian_sidang FOR ALL USING (true);

CREATE POLICY "Public Read Access Master Siswa" ON public.master_siswa_pkl FOR SELECT USING (true);
CREATE POLICY "Public Write Access Master Siswa" ON public.master_siswa_pkl FOR ALL USING (true);

-- Insert Data Penguji Awal (Seed Data)
INSERT INTO public.penguji (nip, nama, peran)
VALUES 
    ('198203152008121001', 'Dr. Ir. Hendra Kurniawan, M.T.', 'Penguji 1 (Ketua)'),
    ('198705202010122003', 'Siti Nurhaliza, S.Kom., M.Cs.', 'Penguji 2 (Sekretaris)'),
    ('199108112015041002', 'Bambang Prasetyo, S.T. (DUDI)', 'Penguji 3 (Anggota)')
ON CONFLICT (nip) DO NOTHING;
`;
}
