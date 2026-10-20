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
END $$;

-- Enable Row Level Security (RLS) & Public Access Policies for Sidang
ALTER TABLE public.peserta_sidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penguji ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian_sidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_siswa_pkl ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_jurusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_instansi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_guru_pembimbing ENABLE ROW LEVEL SECURITY;

-- Berikan izin akses penuh ke role anon dan authenticated Supabase
GRANT ALL ON TABLE public.peserta_sidang TO anon, authenticated;
GRANT ALL ON TABLE public.penguji TO anon, authenticated;
GRANT ALL ON TABLE public.penilaian_sidang TO anon, authenticated;
GRANT ALL ON TABLE public.master_siswa_pkl TO anon, authenticated;
GRANT ALL ON TABLE public.master_jurusan TO anon, authenticated;
GRANT ALL ON TABLE public.master_instansi TO anon, authenticated;
GRANT ALL ON TABLE public.master_guru_pembimbing TO anon, authenticated;

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

`;
}
