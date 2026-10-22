import type { KriteriaNilai, NilaiKriteriaItem, PenilaianPenguji, HasilRekapitulasi } from '../types/index.ts';

export interface GradeRangeInfo {
  huruf: 'A' | 'B' | 'C' | 'D';
  predikatSingkat: string;
  min: number;
  max: number;
  keterangan: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  isLulus: boolean;
}

/**
 * Standar Range Nilai Sidang PKL:
 * Baik Sekali | A | 85 – 100 | Amat Kompeten / Sangat Memuaskan
 * Baik        | B | 70 – 84  | Kompeten / Memuaskan
 * Cukup       | C | 60 – 69  | Batas Minimal Lulus KKM
 * Kurang      | D | 0 – 59   | Belum Kompeten / Remedial
 */
export const GRADE_RANGES: GradeRangeInfo[] = [
  {
    huruf: 'A',
    predikatSingkat: 'Baik Sekali',
    min: 85,
    max: 100,
    keterangan: 'Amat Kompeten / Sangat Memuaskan',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    isLulus: true,
  },
  {
    huruf: 'B',
    predikatSingkat: 'Baik',
    min: 70,
    max: 84,
    keterangan: 'Kompeten / Memuaskan',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
    isLulus: true,
  },
  {
    huruf: 'C',
    predikatSingkat: 'Cukup',
    min: 60,
    max: 69,
    keterangan: 'Batas Minimal Lulus KKM',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    isLulus: true,
  },
  {
    huruf: 'D',
    predikatSingkat: 'Kurang',
    min: 0,
    max: 59,
    keterangan: 'Belum Kompeten / Remedial',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-800',
    badgeBorder: 'border-red-300',
    isLulus: false,
  },
];

/**
 * 7 Aspek Penilaian Sidang Siswa PKL:
 * - Aspek Buku Agenda PSG/PKL (5 Aspek): 50% (masing-masing 10%)
 * - Aspek Ujian Sidang PKL (2 Aspek): 50% (masing-masing 25%)
 */
export const DEFAULT_KRITERIA: KriteriaNilai[] = [
  // ==========================================
  // KATEGORI 1: Aspek Buku Agenda PSG/PKL (50%)
  // ==========================================
  {
    id: 'k1_agenda_disiplin',
    nomor: 1,
    nama: 'Disiplin (Buku Agenda PSG/PKL)',
    deskripsi: 'Kepatuhan jam kerja di tempat PKL/DUDI, ketepatan waktu hadir, serta kedisiplinan pengisian catatan kehadiran dan jurnal harian.',
    kategori: 'agenda',
    kategoriNama: 'Aspek Buku Agenda PSG/PKL',
    bobot: 10,
    nilaiMaksimal: 100,
  },
  {
    id: 'k2_agenda_kerjasama',
    nomor: 2,
    nama: 'Kerjasama (Buku Agenda PSG/PKL)',
    deskripsi: 'Kemampuan berkoordinasi dalam tim kerja, hubungan interpersonal dengan rekan dan instruktur DUDI, serta kekompakan kerja.',
    kategori: 'agenda',
    kategoriNama: 'Aspek Buku Agenda PSG/PKL',
    bobot: 10,
    nilaiMaksimal: 100,
  },
  {
    id: 'k3_agenda_inisiatif',
    nomor: 3,
    nama: 'Inisiatif (Buku Agenda PSG/PKL)',
    deskripsi: 'Keaktifan dalam bertindak, tanggap terhadap kebutuhan pekerjaan tanpa harus selalu diperintah, dan kemampuan mencari ide solusi.',
    kategori: 'agenda',
    kategoriNama: 'Aspek Buku Agenda PSG/PKL',
    bobot: 10,
    nilaiMaksimal: 100,
  },
  {
    id: 'k4_agenda_tanggungjawab',
    nomor: 4,
    nama: 'Tanggung Jawab (Buku Agenda PSG/PKL)',
    deskripsi: 'Kesungguhan menuntaskan tugas praktik hingga tuntas, kehati-hatian menggunakan alat/aset perusahaan, dan kepatuhan SOP.',
    kategori: 'agenda',
    kategoriNama: 'Aspek Buku Agenda PSG/PKL',
    bobot: 10,
    nilaiMaksimal: 100,
  },
  {
    id: 'k5_agenda_kebersihan',
    nomor: 5,
    nama: 'Kebersihan (Buku Agenda PSG/PKL)',
    deskripsi: 'Penerapan budaya industri 5R/5S (Ringkas, Rapi, Resik, Rawat, Rajin), kebersihan area kerja, keselamatan K3, dan kerapian buku agenda.',
    kategori: 'agenda',
    kategoriNama: 'Aspek Buku Agenda PSG/PKL',
    bobot: 10,
    nilaiMaksimal: 100,
  },

  // ==========================================
  // KATEGORI 2: Aspek Ujian Sidang PKL (50%)
  // ==========================================
  {
    id: 'k6_sidang_presentasi',
    nomor: 6,
    nama: 'Penyajian / Presentasi Laporan (Ujian Sidang)',
    deskripsi: 'Sistematika penyampaian laporan, kejelasan vokal & bahasa, penguasaan media presentasi/slide, etika sikap, dan ketepatan waktu.',
    kategori: 'sidang',
    kategoriNama: 'Aspek Ujian Sidang PKL',
    bobot: 25,
    nilaiMaksimal: 100,
  },
  {
    id: 'k7_sidang_tanyajawab',
    nomor: 7,
    nama: 'Tanya Jawab & Penguasaan Materi (Ujian Sidang)',
    deskripsi: 'Ketepatan dan kedalaman menjawab pertanyaan dewan penguji, pemahaman proses teknis lapangan, argumentasi ilmiah, dan problem solving.',
    kategori: 'sidang',
    kategoriNama: 'Aspek Ujian Sidang PKL',
    bobot: 25,
    nilaiMaksimal: 100,
  },
];

/**
 * Menghitung subtotal untuk masing-masing kategori:
 * - Aspek Buku Agenda (50%)
 * - Aspek Ujian Sidang (50%)
 */
export function calculateCategoryBreakdown(
  nilaiItems: NilaiKriteriaItem[],
  kriteriaList: KriteriaNilai[] = DEFAULT_KRITERIA
): {
  subtotalAgenda: number;     // Rata-rata 5 Aspek Agenda (0 - 100)
  weightedAgenda: number;     // Poin Terbobot Agenda (maks 50)
  subtotalSidang: number;     // Rata-rata 2 Aspek Sidang (0 - 100)
  weightedSidang: number;     // Poin Terbobot Sidang (maks 50)
  totalNilai: number;         // Total Nilai Akhir (maks 100)
} {
  const agendaItems: number[] = [];
  const sidangItems: number[] = [];

  kriteriaList.forEach((k) => {
    const item = nilaiItems.find((ni) => ni.kriteriaId === k.id);
    const score = item ? Math.max(0, Math.min(100, item.skor || 0)) : 0;
    if (k.kategori === 'agenda') {
      agendaItems.push(score);
    } else {
      sidangItems.push(score);
    }
  });

  const subtotalAgenda = agendaItems.length > 0
    ? agendaItems.reduce((a, b) => a + b, 0) / agendaItems.length
    : 0;

  const subtotalSidang = sidangItems.length > 0
    ? sidangItems.reduce((a, b) => a + b, 0) / sidangItems.length
    : 0;

  // Masing-masing berkontribusi 50%
  const weightedAgenda = Math.round((subtotalAgenda * 0.5) * 100) / 100;
  const weightedSidang = Math.round((subtotalSidang * 0.5) * 100) / 100;
  const totalNilai = Math.round((weightedAgenda + weightedSidang) * 100) / 100;

  return {
    subtotalAgenda: Math.round(subtotalAgenda * 100) / 100,
    weightedAgenda,
    subtotalSidang: Math.round(subtotalSidang * 100) / 100,
    weightedSidang,
    totalNilai,
  };
}

/**
 * Menghitung total nilai terbobot dari satu penguji
 */
export function calculateExaminerTotal(
  nilaiItems: NilaiKriteriaItem[],
  kriteriaList: KriteriaNilai[] = DEFAULT_KRITERIA
): number {
  if (!nilaiItems || nilaiItems.length === 0) return 0;
  const breakdown = calculateCategoryBreakdown(nilaiItems, kriteriaList);
  return breakdown.totalNilai;
}

/**
 * Konversi nilai angka ke huruf sesuai standar user:
 * A: 85 - 100
 * B: 70 - 84
 * C: 60 - 69
 * D: 0 - 59
 */
export function calculateGradeLetter(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

/**
 * Predikat deskriptif kelulusan:
 * A: Amat Kompeten / Sangat Memuaskan
 * B: Kompeten / Memuaskan
 * C: Batas Minimal Lulus KKM
 * D: Belum Kompeten / Remedial
 */
export function calculatePredicate(score: number): string {
  if (score >= 85) return 'Amat Kompeten / Sangat Memuaskan';
  if (score >= 70) return 'Kompeten / Memuaskan';
  if (score >= 60) return 'Batas Minimal Lulus KKM';
  return 'Belum Kompeten / Remedial';
}

/**
 * Predikat lengkap dengan label singkat
 */
export function calculateFullPredicate(score: number): string {
  if (score >= 85) return 'Baik Sekali (Amat Kompeten / Sangat Memuaskan)';
  if (score >= 70) return 'Baik (Kompeten / Memuaskan)';
  if (score >= 60) return 'Cukup (Batas Minimal Lulus KKM)';
  return 'Kurang (Belum Kompeten / Remedial)';
}

/**
 * Mendapatkan info range nilai detail
 */
export function getGradeRangeInfo(score: number): GradeRangeInfo {
  const letter = calculateGradeLetter(score);
  return GRADE_RANGES.find((r) => r.huruf === letter) || GRADE_RANGES[3];
}

/**
 * Menghitung rekapitulasi gabungan 2 dewan penguji per ruangan:
 * - Nilai Sidang = (Nilai Sidang Penguji 1 + Nilai Sidang Penguji 2) / 2
 * - Poin Sidang (50%) = Nilai Sidang * 0.50
 * - Nilai Jurnal PKL (5 Aspek Buku Agenda) = Rata-rata Subtotal Agenda
 * - Poin Jurnal PKL (50%) = Nilai Jurnal PKL * 0.50
 * - Nilai Akhir (100%) = Poin Jurnal PKL (50%) + Poin Sidang (50%)
 */
export function calculateFinalAggregate(
  mahasiswaId: string,
  evaluations: PenilaianPenguji[],
  requiredExaminersCount: number = 2
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
      nilaiJurnalPkl: 0,
      poinJurnalPkl50: 0,
      nilaiSidangP1: 0,
      nilaiSidangP2: 0,
      nilaiSidangGabungan: 0,
      poinSidang50: 0,
      nilaiAkhirAngka: 0,
      nilaiAkhirHuruf: 'D',
      predikat: 'Belum Dinilai',
      keputusanAkhir: 'BELUM DINILAI',
      isLengkap: false,
    };
  }

  // Tentukan Penguji 1 (Ketua) dan Penguji 2 (Sekretaris / Penguji 2)
  const evalP1 = mEvaluations.find(
    (e) => e.pengujiId === 'p1' || e.pengujiPeran.includes('1') || e.pengujiPeran.toLowerCase().includes('ketua')
  ) || mEvaluations[0];

  const evalP2 = mEvaluations.find(
    (e) =>
      (e.pengujiId === 'p2' ||
        e.pengujiPeran.includes('2') ||
        e.pengujiPeran.toLowerCase().includes('sekr') ||
        e.pengujiPeran.toLowerCase().includes('anggota')) &&
      e.pengujiId !== evalP1?.pengujiId
  ) || (mEvaluations.length > 1 ? mEvaluations[1] : undefined);

  // Nilai Sidang per penguji (2 Aspek Sidang)
  const nilaiSidangP1 = evalP1
    ? (typeof evalP1.subtotalSidang === 'number' && !isNaN(evalP1.subtotalSidang)
        ? evalP1.subtotalSidang
        : evalP1.totalNilai)
    : 0;

  const nilaiSidangP2 = evalP2
    ? (typeof evalP2.subtotalSidang === 'number' && !isNaN(evalP2.subtotalSidang)
        ? evalP2.subtotalSidang
        : evalP2.totalNilai)
    : 0;

  // Nilai Sidang Gabungan: Rata-rata dari nilai sidang dewan penguji ruangan
  let nilaiSidangGabungan = 0;
  if (evalP1 && evalP2) {
    nilaiSidangGabungan = Math.round(((nilaiSidangP1 + nilaiSidangP2) / 2) * 100) / 100;
  } else if (evalP1) {
    nilaiSidangGabungan = nilaiSidangP1;
  } else if (evalP2) {
    nilaiSidangGabungan = nilaiSidangP2;
  }

  // Poin Terbobot Sidang (50%)
  const poinSidang50 = Math.round((nilaiSidangGabungan * 0.5) * 100) / 100;

  // Nilai Jurnal PKL (5 Aspek Agenda: Disiplin, Kerjasama, Inisiatif, Tanggung Jawab, Kebersihan)
  const agendaScores = mEvaluations
    .map((e) => e.subtotalAgenda)
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));

  let nilaiJurnalPkl = 0;
  if (agendaScores.length > 0) {
    nilaiJurnalPkl = Math.round((agendaScores.reduce((a, b) => a + b, 0) / agendaScores.length) * 100) / 100;
  } else {
    // Fallback jika tidak ada breakdown khusus agenda
    const sumTotal = mEvaluations.reduce((sum, item) => sum + item.totalNilai, 0);
    nilaiJurnalPkl = Math.round((sumTotal / totalPengujiMenilai) * 100) / 100;
  }

  // Poin Terbobot Jurnal PKL (50%)
  const poinJurnalPkl50 = Math.round((nilaiJurnalPkl * 0.5) * 100) / 100;

  // Nilai Akhir (100%) = Poin Jurnal PKL (50%) + Poin Sidang (50%)
  const nilaiAkhirAngka = Math.round((poinJurnalPkl50 + poinSidang50) * 100) / 100;
  const letter = calculateGradeLetter(nilaiAkhirAngka);
  const predikat = calculatePredicate(nilaiAkhirAngka);

  // Periksa rekomendasi apakah ada yang menyarankan mengulang
  const hasMengulang = mEvaluations.some(
    (e) => e.rekomendasiStatus === 'Mengulang Sidang'
  );

  let keputusanAkhir: 'LULUS (AMAT KOMPETEN)' | 'LULUS (KOMPETEN)' | 'LULUS (BATAS KKM)' | 'BELUM LULUS (REMEDIAL)' | 'BELUM DINILAI';
  if (nilaiAkhirAngka < 60 || hasMengulang) {
    keputusanAkhir = 'BELUM LULUS (REMEDIAL)';
  } else if (nilaiAkhirAngka >= 85) {
    keputusanAkhir = 'LULUS (AMAT KOMPETEN)';
  } else if (nilaiAkhirAngka >= 70) {
    keputusanAkhir = 'LULUS (KOMPETEN)';
  } else {
    keputusanAkhir = 'LULUS (BATAS KKM)';
  }

  return {
    mahasiswaId,
    totalPengujiMenilai,
    totalPengujiWajib: requiredExaminersCount,
    nilaiPerPenguji: mEvaluations.map((e) => ({
      pengujiId: e.pengujiId,
      pengujiNama: e.pengujiNama,
      pengujiPeran: e.pengujiPeran,
      subtotalAgenda: e.subtotalAgenda,
      subtotalSidang: e.subtotalSidang,
      totalNilai: e.totalNilai,
      nilaiHuruf: e.nilaiHuruf,
      catatanRevisi: e.catatanRevisi,
      rekomendasiStatus: e.rekomendasiStatus,
      updatedAt: e.updatedAt,
    })),
    nilaiJurnalPkl,
    poinJurnalPkl50,
    nilaiSidangP1,
    nilaiSidangP2,
    nilaiSidangGabungan,
    poinSidang50,
    nilaiAkhirAngka,
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
    email VARCHAR(150),
    password VARCHAR(100) DEFAULT 'penguji123',
    telepon VARCHAR(50),
    instansi_asal VARCHAR(150) DEFAULT 'SMK Negeri 1 Vokasi',
    bidang_keahlian VARCHAR(150),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Migrasi kolom tabel penguji jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE public.penguji ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE public.penguji ADD COLUMN IF NOT EXISTS password VARCHAR(100) DEFAULT 'penguji123';
ALTER TABLE public.penguji ADD COLUMN IF NOT EXISTS telepon VARCHAR(50);
ALTER TABLE public.penguji ADD COLUMN IF NOT EXISTS instansi_asal VARCHAR(150) DEFAULT 'SMK Negeri 1 Vokasi';
ALTER TABLE public.penguji ADD COLUMN IF NOT EXISTS bidang_keahlian VARCHAR(150);
ALTER TABLE public.penguji ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.penguji ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Tabel Penilaian Sidang (Real-Time Submissions)
CREATE TABLE IF NOT EXISTS public.penilaian_sidang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mahasiswa_id UUID NOT NULL REFERENCES public.peserta_sidang(id) ON DELETE CASCADE,
    penguji_id UUID NOT NULL REFERENCES public.penguji(id) ON DELETE CASCADE,
    penguji_nama VARCHAR(150) NOT NULL,
    penguji_peran VARCHAR(80) NOT NULL,
    nilai_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_agenda NUMERIC(5,2) DEFAULT 0.00,
    subtotal_sidang NUMERIC(5,2) DEFAULT 0.00,
    total_nilai NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    nilai_huruf VARCHAR(2) NOT NULL DEFAULT 'E',
    catatan_revisi TEXT DEFAULT '',
    rekomendasi_status VARCHAR(50) DEFAULT 'Lulus',
    is_draft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_mahasiswa_penguji UNIQUE (mahasiswa_id, penguji_id)
);

-- Tambah kolom subtotal agenda & sidang jika tabel penilaian sudah ada sebelumnya
ALTER TABLE public.penilaian_sidang ADD COLUMN IF NOT EXISTS subtotal_agenda NUMERIC(5,2) DEFAULT 0.00;
ALTER TABLE public.penilaian_sidang ADD COLUMN IF NOT EXISTS subtotal_sidang NUMERIC(5,2) DEFAULT 0.00;

-- View Rekapitulasi Sidang PKL 2 Penguji (50% Sidang [P1+P2] + 50% Jurnal PKL = 100%)
CREATE OR REPLACE VIEW public.v_rekapitulasi_sidang_2penguji AS
SELECT 
    ps.id AS mahasiswa_id,
    ps.nim,
    ps.nama AS nama_mahasiswa,
    ps.prodi,
    ps.kelas,
    ps.perusahaan,
    ps.judul_laporan,
    ps.ruangan,
    ps.status,
    -- Nilai Jurnal PKL (Rata-rata 5 Aspek Agenda Buku PKL)
    ROUND(COALESCE(AVG(pn.subtotal_agenda), 0), 2) AS nilai_jurnal_pkl,
    ROUND(COALESCE(AVG(pn.subtotal_agenda), 0) * 0.50, 2) AS poin_jurnal_pkl_50,
    -- Nilai Sidang Penguji 1 & 2 (Gunakan ::text agar aman jika kolom penguji_id bertipe UUID)
    COALESCE(MAX(CASE WHEN pn.penguji_id::text = 'p1' OR pn.penguji_peran ILIKE '%1%' OR pn.penguji_peran ILIKE '%ketua%' THEN pn.subtotal_sidang END), 0) AS nilai_sidang_p1,
    COALESCE(MAX(CASE WHEN pn.penguji_id::text = 'p2' OR pn.penguji_peran ILIKE '%2%' OR pn.penguji_peran ILIKE '%sekr%' THEN pn.subtotal_sidang END), 0) AS nilai_sidang_p2,
    -- Nilai Sidang Gabungan (P1 + P2) / 2
    ROUND(COALESCE(AVG(pn.subtotal_sidang), 0), 2) AS nilai_sidang_gabungan,
    ROUND(COALESCE(AVG(pn.subtotal_sidang), 0) * 0.50, 2) AS poin_sidang_50,
    -- Nilai Akhir (100%) = 50% Jurnal PKL + 50% Sidang
    ROUND(
        (COALESCE(AVG(pn.subtotal_agenda), 0) * 0.50) + 
        (COALESCE(AVG(pn.subtotal_sidang), 0) * 0.50), 
        2
    ) AS nilai_akhir_angka,
    COUNT(pn.id) AS total_penguji_menilai
FROM public.peserta_sidang ps
LEFT JOIN public.penilaian_sidang pn ON ps.id = pn.mahasiswa_id AND pn.is_draft = false
GROUP BY ps.id, ps.nim, ps.nama, ps.prodi, ps.kelas, ps.perusahaan, ps.judul_laporan, ps.ruangan, ps.status;

-- 4. Tabel Master Jurusan / Program Keahlian
CREATE TABLE IF NOT EXISTS public.master_jurusan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(150) NOT NULL,
    bidang_keahlian VARCHAR(150) NOT NULL,
    kepala_program VARCHAR(150),
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabel Master Instansi / Perusahaan Tempat PKL
CREATE TABLE IF NOT EXISTS public.master_instansi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL UNIQUE,
    alamat TEXT NOT NULL,
    kuota INTEGER NOT NULL DEFAULT 5,
    pembimbing_instansi VARCHAR(150) NOT NULL,
    kontak_person VARCHAR(100),
    email VARCHAR(100),
    bidang_usaha VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Tabel Master Siswa PKL (Akun, Instansi & Pembimbing)
CREATE TABLE IF NOT EXISTS public.master_siswa_pkl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(150) NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    jurusan VARCHAR(100) NOT NULL,
    email_login VARCHAR(150) NOT NULL,
    password_login VARCHAR(100) NOT NULL,
    guru_pembimbing VARCHAR(150) NOT NULL,
    instansi_id VARCHAR(100),
    instansi_nama VARCHAR(150),
    pembimbing_instansi VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Hapus constraint unique email jika sebelumnya pernah terpasang
ALTER TABLE public.master_siswa_pkl DROP CONSTRAINT IF EXISTS master_siswa_pkl_email_login_key;

-- 7. Tabel Master Guru Pembimbing PKL
CREATE TABLE IF NOT EXISTS public.master_guru_pembimbing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nip VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(150) NOT NULL,
    telepon VARCHAR(50),
    email_login VARCHAR(150) NOT NULL,
    password_login VARCHAR(100) NOT NULL,
    bidang_studi VARCHAR(150),
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Tabel Plotting & Penempatan Siswa PKL (Relasi Siswa, DUDI, Guru, Periode)
CREATE TABLE IF NOT EXISTS public.plotting_siswa_pkl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) NOT NULL UNIQUE,
    nama_siswa VARCHAR(150) NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    jurusan VARCHAR(100) NOT NULL,
    instansi_nama VARCHAR(150),
    alamat_instansi TEXT,
    guru_nama VARCHAR(150),
    guru_nip VARCHAR(50),
    periode_mulai VARCHAR(50) DEFAULT '15 Juli 2026',
    periode_selesai VARCHAR(50) DEFAULT '15 Desember 2026',
    status_plotting VARCHAR(50) DEFAULT 'Terplotting',
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tambah kolom relasi penempatan pada master_siswa_pkl jika belum ada
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS guru_nip VARCHAR(50);
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS alamat_instansi TEXT;
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS periode_mulai VARCHAR(50);
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS periode_selesai VARCHAR(50);
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS status_plotting VARCHAR(50) DEFAULT 'Terplotting';

-- Aktifkan Realtime Publikasi untuk Supabase secara aman (Aman dijalankan berulang kali)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.peserta_sidang;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.penilaian_sidang;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.master_siswa_pkl;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.master_jurusan;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.master_instansi;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.master_guru_pembimbing;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.plotting_siswa_pkl;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- Enable Row Level Security (RLS) & Public Access Policies for Sidang
ALTER TABLE public.peserta_sidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penguji ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian_sidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_siswa_pkl ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_jurusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_instansi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_guru_pembimbing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plotting_siswa_pkl ENABLE ROW LEVEL SECURITY;

-- Berikan izin akses penuh ke role anon dan authenticated Supabase
GRANT ALL ON TABLE public.peserta_sidang TO anon, authenticated;
GRANT ALL ON TABLE public.penguji TO anon, authenticated;
GRANT ALL ON TABLE public.penilaian_sidang TO anon, authenticated;
GRANT ALL ON TABLE public.master_siswa_pkl TO anon, authenticated;
GRANT ALL ON TABLE public.master_jurusan TO anon, authenticated;
GRANT ALL ON TABLE public.master_instansi TO anon, authenticated;
GRANT ALL ON TABLE public.master_guru_pembimbing TO anon, authenticated;
GRANT ALL ON TABLE public.plotting_siswa_pkl TO anon, authenticated;

-- Policies (DROP IF EXISTS agar tidak error jika sudah ada)
DROP POLICY IF EXISTS "Public Read Access Peserta" ON public.peserta_sidang;
CREATE POLICY "Public Read Access Peserta" ON public.peserta_sidang FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Peserta" ON public.peserta_sidang;
CREATE POLICY "Public Write Access Peserta" ON public.peserta_sidang FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Penguji" ON public.penguji;
CREATE POLICY "Public Read Access Penguji" ON public.penguji FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Penguji" ON public.penguji;
CREATE POLICY "Public Write Access Penguji" ON public.penguji FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Penilaian" ON public.penilaian_sidang;
CREATE POLICY "Public Read Access Penilaian" ON public.penilaian_sidang FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Penilaian" ON public.penilaian_sidang;
CREATE POLICY "Public Write Access Penilaian" ON public.penilaian_sidang FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Master Siswa" ON public.master_siswa_pkl;
CREATE POLICY "Public Read Access Master Siswa" ON public.master_siswa_pkl FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Master Siswa" ON public.master_siswa_pkl;
CREATE POLICY "Public Write Access Master Siswa" ON public.master_siswa_pkl FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Master Jurusan" ON public.master_jurusan;
CREATE POLICY "Public Read Access Master Jurusan" ON public.master_jurusan FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Master Jurusan" ON public.master_jurusan;
CREATE POLICY "Public Write Access Master Jurusan" ON public.master_jurusan FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Master Instansi" ON public.master_instansi;
CREATE POLICY "Public Read Access Master Instansi" ON public.master_instansi FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Master Instansi" ON public.master_instansi;
CREATE POLICY "Public Write Access Master Instansi" ON public.master_instansi FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Master Guru" ON public.master_guru_pembimbing;
CREATE POLICY "Public Read Access Master Guru" ON public.master_guru_pembimbing FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Master Guru" ON public.master_guru_pembimbing;
CREATE POLICY "Public Write Access Master Guru" ON public.master_guru_pembimbing FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Access Plotting Siswa" ON public.plotting_siswa_pkl;
CREATE POLICY "Public Read Access Plotting Siswa" ON public.plotting_siswa_pkl FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Plotting Siswa" ON public.plotting_siswa_pkl;
CREATE POLICY "Public Write Access Plotting Siswa" ON public.plotting_siswa_pkl FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert Data Penguji Awal (Seed Data)
INSERT INTO public.penguji (nip, nama, peran)
VALUES 
    ('198203152008121001', 'Dr. Ir. Hendra Kurniawan, M.T.', 'Penguji 1 (Ketua)'),
    ('198705202010122003', 'Siti Nurhaliza, S.Kom., M.Cs.', 'Penguji 2 (Sekretaris)'),
    ('199108112015041002', 'Bambang Prasetyo, S.T. (DUDI)', 'Penguji 3 (Anggota)')
ON CONFLICT (nip) DO NOTHING;

-- Insert Data Master Jurusan Awal (Seed Data)
INSERT INTO public.master_jurusan (kode, nama, bidang_keahlian, kepala_program, deskripsi)
VALUES
    ('RPL', 'Rekayasa Perangkat Lunak', 'Teknologi Informasi & Komunikasi', 'Dr. Ir. Hendra Kurniawan, M.T.', 'Pengembangan web, mobile, cloud computing, dan database.'),
    ('TKJ', 'Teknik Komputer & Jaringan', 'Teknologi Informasi & Komunikasi', 'Ahmad Zulfikar, S.T., M.Kom.', 'Infrastruktur jaringan, administrasi server, dan cyber security.'),
    ('SIJA', 'Sistem Informasi Jaringan & Aplikasi', 'Teknologi Informasi & Komunikasi', 'Siti Nurhaliza, S.Kom., M.Cs.', 'Cloud platform, devops, internet of things (IoT), dan system integration.'),
    ('DKV', 'Desain Komunikasi Visual', 'Seni & Ekonomi Kreatif', 'Dra. Sri Wahyuni, M.Pd.', 'Desain grafis, UI/UX, visual branding, dan videografi digital.')
ON CONFLICT (kode) DO NOTHING;

-- Insert Data Master Instansi / Perusahaan Awal (Seed Data)
INSERT INTO public.master_instansi (nama, alamat, kuota, pembimbing_instansi, bidang_usaha)
VALUES
    ('PT Telekomunikasi Indonesia (Telkom Regional)', 'Jl. Japati No. 1, Coblong, Kota Bandung', 4, 'Bambang Prasetyo, S.T.', 'Telekomunikasi & Jaringan'),
    ('PT Bank Central Asia Tbk (BCA) - Digital Lab', 'Menara BCA Lt. 32, Grand Indonesia, Jakarta Pusat', 3, 'Hendra Wijaya, M.Kom.', 'Perbankan & Financial Tech'),
    ('Dinas Komunikasi & Informatika (Diskominfo)', 'Balai Kota Blok G Lt. 3, Jl. Medan Merdeka Selatan, Jakarta Pusat', 5, 'Agus Setiawan, S.Kom.', 'Instansi Pemerintah & TI'),
    ('PT Pixel Visual Media Kreatif', 'Gedung Creative Hub Lt. 4, Gandaria, Jakarta Selatan', 3, 'Maya Indah, S.Ds.', 'Desain Kreatif & Multimedia'),
    ('PT Tokopedia / GoTo Group', 'Tokopedia Tower Lt. 18, Ciputra World 2, Jakarta Selatan', 4, 'Kevin Sanjaya, S.T.', 'E-Commerce & Rekayasa Software'),
    ('Badan Siber dan Sandi Negara (BSSN)', 'Jl. Raya Sawangan No. 118, Pancoran Mas, Depok', 2, 'Letkol R. Santoso, M.T.', 'Keamanan Siber & Sandi'),
    ('PT Astra Honda Motor (Plant Center)', 'Kawasan Industri MM2100, Cikarang Barat', 6, 'Ir. Joko Susilo, M.T.', 'Manufaktur & Otomotif'),
    ('Kantor Pelayanan Pajak Pratama (KPP)', 'Jl. M.T. Haryono Kav. 55, Cawang, Jakarta Timur', 4, 'Dra. Sri Wahyuni, M.M.', 'Administrasi Publik & Keuangan')
ON CONFLICT (nama) DO NOTHING;

-- Insert Data Master Guru Pembimbing Awal (Seed Data)
INSERT INTO public.master_guru_pembimbing (nip, nama, telepon, email_login, password_login, bidang_studi)
VALUES
    ('19820315 200812 1 001', 'Dr. Ir. Hendra Kurniawan, M.T.', '0812-2345-6789', 'hendra.kurniawan@smk.belajar.id', 'Guru#Hendra2026', 'Rekayasa Perangkat Lunak & Basis Data'),
    ('19870520 201012 2 003', 'Siti Nurhaliza, S.Kom., M.Cs.', '0813-8899-7711', 'siti.nurhaliza@smk.belajar.id', 'Guru#Siti2026', 'Sistem Informasi Jaringan & Keamanan Siber'),
    ('19791104 200501 1 004', 'Ahmad Dahlan, S.Pd., M.T.', '0812-9988-1122', 'ahmad.dahlan@smk.belajar.id', 'Guru#Ahmad2026', 'Teknik Jaringan Komputer & Infrastruktur Cloud'),
    ('19900214 201402 2 002', 'Dewi Lestari, S.T., M.Kom.', '0856-7788-9900', 'dewi.lestari@smk.belajar.id', 'Guru#Dewi2026', 'Desain Komunikasi Visual & Animasi 3D'),
    ('32730115 04920005', 'Rizal Fahmi, S.Kom.', '0819-0123-4567', 'rizal.fahmi@smk.belajar.id', 'Guru#Rizal2026', 'Mobile App Development & IoT')
ON CONFLICT (nip) DO NOTHING;

-- Insert Data Plotting Siswa Awal (Seed Data)
INSERT INTO public.plotting_siswa_pkl (nisn, nama_siswa, kelas, jurusan, instansi_nama, alamat_instansi, guru_nama, guru_nip, periode_mulai, periode_selesai, status_plotting)
VALUES
    ('0061245678', 'Muhammad Rizky Pratama', 'XII RPL 1', 'Rekayasa Perangkat Lunak', 'PT Telekomunikasi Indonesia (Telkom Regional)', 'Jl. Japati No. 1, Coblong, Kota Bandung', 'Dr. Ir. Hendra Kurniawan, M.T.', '19820315 200812 1 001', '15 Juli 2026', '15 Desember 2026', 'Terplotting'),
    ('0062356789', 'Anisa Putri Rahmadani', 'XII SIJA 2', 'Sistem Informasi Jaringan & Aplikasi', 'PT Bank Central Asia Tbk (BCA) - Digital Lab', 'Menara BCA Grand Indonesia Lt. 32, Jakarta Pusat', 'Siti Nurhaliza, S.Kom., M.Cs.', '19870520 201012 2 003', '15 Juli 2026', '15 Desember 2026', 'Sedang PKL'),
    ('0063467890', 'Dimas Arya Pamungkas', 'XII TKJ 1', 'Teknik Komputer & Jaringan', 'Dinas Komunikasi & Informatika (Diskominfo)', 'Balai Kota Blok G Lt. 3, Gambir, Jakarta Pusat', 'Dr. Ir. Hendra Kurniawan, M.T.', '19820315 200812 1 001', '15 Juli 2026', '15 Desember 2026', 'Terplotting'),
    ('0064578901', 'Siti Aisyah Nur', 'XII DKV 2', 'Desain Komunikasi Visual', 'PT Pixel Visual Media Kreatif', 'Gedung Creative Hub Lt. 4, Gandaria, Jakarta Selatan', 'Siti Nurhaliza, S.Kom., M.Cs.', '19870520 201012 2 003', '15 Juli 2026', '15 Desember 2026', 'Selesai PKL'),
    ('0069923456', 'Aditya Pratama Putra', 'XII RPL 1', 'Rekayasa Perangkat Lunak', NULL, NULL, NULL, NULL, '15 Juli 2026', '15 Desember 2026', 'Belum Terplotting')
ON CONFLICT (nisn) DO NOTHING;

`;
}

/**
 * Menghasilkan skrip SQL khusus untuk membuat tabel plotting_siswa_pkl di Supabase
 * Berguna jika database Supabase pengguna sudah memiliki tabel master lama dan hanya perlu menambahkan tabel plotting
 */
export function generatePlottingSQLScript(): string {
  return `-- ====================================================================
-- SKRIP SQL KHUSUS: TABEL PLOTTING SISWA PKL (SUPABASE)
-- Jalankan perintah ini di Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ====================================================================

-- 1. Buat Tabel Plotting Siswa PKL
CREATE TABLE IF NOT EXISTS public.plotting_siswa_pkl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) NOT NULL UNIQUE,
    nama_siswa VARCHAR(150) NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    jurusan VARCHAR(100) NOT NULL,
    instansi_nama VARCHAR(150),
    alamat_instansi TEXT,
    guru_nama VARCHAR(150),
    guru_nip VARCHAR(50),
    periode_mulai VARCHAR(50) DEFAULT '15 Juli 2026',
    periode_selesai VARCHAR(50) DEFAULT '15 Desember 2026',
    status_plotting VARCHAR(50) DEFAULT 'Terplotting',
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tambah Kolom Relasi Plotting pada Tabel Master Siswa (Jika Belum Ada)
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS guru_nip VARCHAR(50);
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS alamat_instansi TEXT;
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS periode_mulai VARCHAR(50);
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS periode_selesai VARCHAR(50);
ALTER TABLE public.master_siswa_pkl ADD COLUMN IF NOT EXISTS status_plotting VARCHAR(50) DEFAULT 'Terplotting';

-- 3. Aktifkan Realtime Synchronisation
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.plotting_siswa_pkl;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- 4. Aktifkan Row Level Security (RLS) & Hak Akses
ALTER TABLE public.plotting_siswa_pkl ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.plotting_siswa_pkl TO anon, authenticated;

DROP POLICY IF EXISTS "Public Read Access Plotting Siswa" ON public.plotting_siswa_pkl;
CREATE POLICY "Public Read Access Plotting Siswa" ON public.plotting_siswa_pkl FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Plotting Siswa" ON public.plotting_siswa_pkl;
CREATE POLICY "Public Write Access Plotting Siswa" ON public.plotting_siswa_pkl FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`;
}

/**
 * Menghasilkan skrip SQL khusus untuk perbaikan & inisialisasi tabel master_instansi di Supabase
 */
export function generateInstansiSQLScript(): string {
  return `-- ====================================================================
-- SKRIP SQL PERBAIKAN & UPDATE TABEL MASTER INSTANSI (SUPABASE)
-- Jalankan di Supabase Dashboard > SQL Editor > New query > Run
-- ====================================================================

-- 1. Buat Tabel Master Instansi jika belum ada
CREATE TABLE IF NOT EXISTS public.master_instansi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    alamat TEXT NOT NULL,
    kuota INTEGER NOT NULL DEFAULT 5,
    pembimbing_instansi VARCHAR(150) NOT NULL DEFAULT 'Pembimbing DUDI',
    kontak_person VARCHAR(100),
    email VARCHAR(100),
    bidang_usaha VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Pastikan Kolom Id Memiliki Default UUID Otomatis
ALTER TABLE public.master_instansi ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Tambahkan Kolom Tambahan jika belum ada pada tabel lama
ALTER TABLE public.master_instansi ADD COLUMN IF NOT EXISTS kuota INTEGER DEFAULT 4;
ALTER TABLE public.master_instansi ADD COLUMN IF NOT EXISTS pembimbing_instansi VARCHAR(150) DEFAULT 'Pembimbing DUDI';
ALTER TABLE public.master_instansi ADD COLUMN IF NOT EXISTS kontak_person VARCHAR(100);
ALTER TABLE public.master_instansi ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE public.master_instansi ADD COLUMN IF NOT EXISTS bidang_usaha VARCHAR(100);
ALTER TABLE public.master_instansi ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.master_instansi ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. PENTING: Bersihkan duplikat nama instansi jika ada sebelumnya (simpan data terbaru)
-- Supaya penambahan constraint UNIQUE tidak ditolak oleh PostgreSQL
DELETE FROM public.master_instansi
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY lower(trim(nama)) 
            ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
        ) as rnum
        FROM public.master_instansi
    ) t
    WHERE t.rnum > 1
);

-- 5. Tambahkan UNIQUE Constraint pada kolom 'nama'
-- Diperlukan untuk operasi Upsert (ON CONFLICT nama)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'master_instansi_nama_key'
    ) THEN
        BEGIN
            ALTER TABLE public.master_instansi ADD CONSTRAINT master_instansi_nama_key UNIQUE (nama);
        EXCEPTION WHEN duplicate_table OR duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

-- Buat Unique Index pendukung
CREATE UNIQUE INDEX IF NOT EXISTS master_instansi_nama_unique_idx ON public.master_instansi (lower(trim(nama)));

-- 6. Aktifkan Realtime Synchronization
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.master_instansi;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- 7. Aktifkan Row Level Security (RLS) & Hak Akses Penuh (Insert, Update, Select, Delete)
ALTER TABLE public.master_instansi ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.master_instansi TO anon, authenticated;

DROP POLICY IF EXISTS "Public Read Access Master Instansi" ON public.master_instansi;
CREATE POLICY "Public Read Access Master Instansi" ON public.master_instansi FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Master Instansi" ON public.master_instansi;
CREATE POLICY "Public Write Access Master Instansi" ON public.master_instansi FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`;
}

/**
 * Menghasilkan skrip SQL khusus untuk perbaikan & inisialisasi tabel master_guru_pembimbing di Supabase
 */
export function generateGuruSQLScript(): string {
  return `-- ====================================================================
-- SKRIP SQL PERBAIKAN & UPDATE TABEL MASTER GURU PEMBIMBING (SUPABASE)
-- Jalankan di Supabase Dashboard > SQL Editor > New query > Run
-- ====================================================================

-- 1. Buat Tabel Master Guru Pembimbing jika belum ada
CREATE TABLE IF NOT EXISTS public.master_guru_pembimbing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nip VARCHAR(50) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    telepon VARCHAR(50),
    email_login VARCHAR(150) NOT NULL,
    password_login VARCHAR(100) NOT NULL,
    bidang_studi VARCHAR(150),
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Pastikan Kolom Id Memiliki Default UUID Otomatis
ALTER TABLE public.master_guru_pembimbing ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Tambahkan Kolom Tambahan jika belum ada pada tabel lama
ALTER TABLE public.master_guru_pembimbing ADD COLUMN IF NOT EXISTS telepon VARCHAR(50);
ALTER TABLE public.master_guru_pembimbing ADD COLUMN IF NOT EXISTS bidang_studi VARCHAR(150);
ALTER TABLE public.master_guru_pembimbing ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.master_guru_pembimbing ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.master_guru_pembimbing ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. Hapus Constraint Unik Email (Jika Ada di Skema Lama) Agar Impor Tidak Ditolak
ALTER TABLE public.master_guru_pembimbing DROP CONSTRAINT IF EXISTS master_guru_pembimbing_email_login_key;
DROP INDEX IF EXISTS master_guru_email_login_unique_idx;

-- 5. PENTING: Bersihkan duplikat NIP guru jika ada sebelumnya (simpan data terbaru)
-- Supaya penambahan constraint UNIQUE tidak ditolak oleh PostgreSQL
DELETE FROM public.master_guru_pembimbing
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY regexp_replace(nip, '\s+', '', 'g')
            ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
        ) as rnum
        FROM public.master_guru_pembimbing
    ) t
    WHERE t.rnum > 1
);

-- 6. Tambahkan UNIQUE Constraint pada kolom 'nip' (Wajib untuk Upsert ON CONFLICT nip)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'master_guru_pembimbing_nip_key'
    ) THEN
        BEGIN
            ALTER TABLE public.master_guru_pembimbing ADD CONSTRAINT master_guru_pembimbing_nip_key UNIQUE (nip);
        EXCEPTION WHEN duplicate_table OR duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

-- Buat Unique Index pendukung pencarian NIP bersih tanpa spasi
CREATE UNIQUE INDEX IF NOT EXISTS master_guru_nip_unique_idx ON public.master_guru_pembimbing (regexp_replace(nip, '\s+', '', 'g'));

-- 7. Aktifkan Realtime Synchronization Supabase
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.master_guru_pembimbing;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- 8. Aktifkan Row Level Security (RLS) & Hak Akses Penuh (Insert, Update, Select, Delete)
ALTER TABLE public.master_guru_pembimbing ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.master_guru_pembimbing TO anon, authenticated;

DROP POLICY IF EXISTS "Public Read Access Master Guru" ON public.master_guru_pembimbing;
CREATE POLICY "Public Read Access Master Guru" ON public.master_guru_pembimbing FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Write Access Master Guru" ON public.master_guru_pembimbing;
CREATE POLICY "Public Write Access Master Guru" ON public.master_guru_pembimbing FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`;
}

/**
 * Menghasilkan skrip SQL khusus untuk skema 2 Penguji (50% Sidang + 50% Jurnal PKL)
 * Dapat disalin langsung ke SQL Editor Supabase untuk memperbarui database.
 */
export function generateSidang2PengujiSQLScript(): string {
  return `-- ====================================================================
-- SKRIP SQL UPDATE: SKEMA 2 PENGUJI SIDANG & FORMULA 50% SIDANG + 50% JURNAL PKL
-- Salin dan jalankan perintah ini di Supabase SQL Editor
-- ====================================================================

-- 1. Pastikan kolom subtotal_agenda dan subtotal_sidang ada pada tabel penilaian
ALTER TABLE public.penilaian_sidang ADD COLUMN IF NOT EXISTS subtotal_agenda NUMERIC(5,2) DEFAULT 0.00;
ALTER TABLE public.penilaian_sidang ADD COLUMN IF NOT EXISTS subtotal_sidang NUMERIC(5,2) DEFAULT 0.00;

-- 2. Buat View Rekapitulasi Sidang 2 Penguji (50% Sidang [P1+P2] + 50% Jurnal PKL = 100%)
CREATE OR REPLACE VIEW public.v_rekapitulasi_sidang_2penguji AS
SELECT 
    ps.id AS mahasiswa_id,
    ps.nim,
    ps.nama AS nama_mahasiswa,
    ps.prodi,
    ps.kelas,
    ps.perusahaan,
    ps.judul_laporan,
    ps.ruangan,
    ps.status,
    -- Nilai Jurnal PKL (Rata-rata 5 Aspek Agenda Buku PKL)
    ROUND(COALESCE(AVG(pn.subtotal_agenda), 0), 2) AS nilai_jurnal_pkl,
    ROUND(COALESCE(AVG(pn.subtotal_agenda), 0) * 0.50, 2) AS poin_jurnal_pkl_50,
    -- Nilai Sidang Penguji 1 & 2 (Gunakan ::text agar aman jika kolom penguji_id bertipe UUID)
    COALESCE(MAX(CASE WHEN pn.penguji_id::text = 'p1' OR pn.penguji_peran ILIKE '%1%' OR pn.penguji_peran ILIKE '%ketua%' THEN pn.subtotal_sidang END), 0) AS nilai_sidang_p1,
    COALESCE(MAX(CASE WHEN pn.penguji_id::text = 'p2' OR pn.penguji_peran ILIKE '%2%' OR pn.penguji_peran ILIKE '%sekr%' THEN pn.subtotal_sidang END), 0) AS nilai_sidang_p2,
    -- Nilai Sidang Gabungan (P1 + P2) / 2
    ROUND(COALESCE(AVG(pn.subtotal_sidang), 0), 2) AS nilai_sidang_gabungan,
    ROUND(COALESCE(AVG(pn.subtotal_sidang), 0) * 0.50, 2) AS poin_sidang_50,
    -- Nilai Akhir (100%) = 50% Jurnal PKL + 50% Sidang
    ROUND(
        (COALESCE(AVG(pn.subtotal_agenda), 0) * 0.50) + 
        (COALESCE(AVG(pn.subtotal_sidang), 0) * 0.50), 
        2
    ) AS nilai_akhir_angka,
    COUNT(pn.id) AS total_penguji_menilai
FROM public.peserta_sidang ps
LEFT JOIN public.penilaian_sidang pn ON ps.id = pn.mahasiswa_id AND pn.is_draft = false
GROUP BY ps.id, ps.nim, ps.nama, ps.prodi, ps.kelas, ps.perusahaan, ps.judul_laporan, ps.ruangan, ps.status;

-- 3. Berikan Hak Akses ke View untuk Pengguna Supabase
GRANT SELECT ON public.v_rekapitulasi_sidang_2penguji TO anon, authenticated;
`;
}



