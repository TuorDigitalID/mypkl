import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_KRITERIA,
  calculateCategoryBreakdown,
  calculateExaminerTotal,
  calculateGradeLetter,
  calculatePredicate,
  calculateFullPredicate,
  calculateFinalAggregate,
  getGradeRangeInfo,
  validateScores,
  generateSupabaseSQLSchema,
  generateResetAndSyncSQLScript,
  generateMasterJurusanSQLScript,
} from './scoring.ts';
import type { NilaiKriteriaItem, PenilaianPenguji } from '../types/index.ts';

test('DEFAULT_KRITERIA contains 7 aspects matching user specification (5 Agenda + 2 Sidang)', () => {
  assert.equal(DEFAULT_KRITERIA.length, 7);
  const agendaCriteria = DEFAULT_KRITERIA.filter((k) => k.kategori === 'agenda');
  const sidangCriteria = DEFAULT_KRITERIA.filter((k) => k.kategori === 'sidang');

  assert.equal(agendaCriteria.length, 5);
  assert.equal(sidangCriteria.length, 2);

  // Check all 5 Agenda aspects
  assert.ok(agendaCriteria.some((k) => k.nama.includes('Disiplin')));
  assert.ok(agendaCriteria.some((k) => k.nama.includes('Kerjasama')));
  assert.ok(agendaCriteria.some((k) => k.nama.includes('Inisiatif')));
  assert.ok(agendaCriteria.some((k) => k.nama.includes('Tanggung Jawab')));
  assert.ok(agendaCriteria.some((k) => k.nama.includes('Kebersihan')));

  // Check 2 Sidang aspects
  assert.ok(sidangCriteria.some((k) => k.nama.includes('Penyajian / Presentasi')));
  assert.ok(sidangCriteria.some((k) => k.nama.includes('Tanya Jawab & Penguasaan')));
});

test('calculateCategoryBreakdown computes 50% Agenda and 50% Sidang correctly', () => {
  // If student scores 100 on all 5 Agenda items and 80 on both Sidang items:
  // Agenda subtotal = 100, weighted (50%) = 50
  // Sidang subtotal = 80, weighted (50%) = 40
  // Total = 90
  const items: NilaiKriteriaItem[] = [
    { kriteriaId: 'k1_agenda_disiplin', skor: 100 },
    { kriteriaId: 'k2_agenda_kerjasama', skor: 100 },
    { kriteriaId: 'k3_agenda_inisiatif', skor: 100 },
    { kriteriaId: 'k4_agenda_tanggungjawab', skor: 100 },
    { kriteriaId: 'k5_agenda_kebersihan', skor: 100 },
    { kriteriaId: 'k6_sidang_presentasi', skor: 80 },
    { kriteriaId: 'k7_sidang_tanyajawab', skor: 80 },
  ];

  const breakdown = calculateCategoryBreakdown(items, DEFAULT_KRITERIA);
  assert.equal(breakdown.subtotalAgenda, 100);
  assert.equal(breakdown.weightedAgenda, 50);
  assert.equal(breakdown.subtotalSidang, 80);
  assert.equal(breakdown.weightedSidang, 40);
  assert.equal(breakdown.totalNilai, 90);

  const total = calculateExaminerTotal(items, DEFAULT_KRITERIA);
  assert.equal(total, 90);
});

test('calculateGradeLetter and calculatePredicate adhere to standard KKM boundaries', () => {
  // Range: 85 - 100 => A (Amat Kompeten / Sangat Memuaskan)
  assert.equal(calculateGradeLetter(100), 'A');
  assert.equal(calculateGradeLetter(85), 'A');
  assert.equal(calculatePredicate(85), 'Amat Kompeten / Sangat Memuaskan');
  assert.ok(calculateFullPredicate(85).includes('Baik Sekali'));

  // Range: 70 - 84 => B (Kompeten / Memuaskan)
  assert.equal(calculateGradeLetter(84.9), 'B');
  assert.equal(calculateGradeLetter(70), 'B');
  assert.equal(calculatePredicate(75), 'Kompeten / Memuaskan');
  assert.ok(calculateFullPredicate(70).includes('Baik'));

  // Range: 60 - 69 => C (Batas Minimal Lulus KKM)
  assert.equal(calculateGradeLetter(69.9), 'C');
  assert.equal(calculateGradeLetter(60), 'C');
  assert.equal(calculatePredicate(60), 'Batas Minimal Lulus KKM');
  assert.ok(calculateFullPredicate(60).includes('Cukup'));

  // Range: 0 - 59 => D (Belum Kompeten / Remedial)
  assert.equal(calculateGradeLetter(59.9), 'D');
  assert.equal(calculateGradeLetter(0), 'D');
  assert.equal(calculatePredicate(50), 'Belum Kompeten / Remedial');
  assert.ok(calculateFullPredicate(50).includes('Kurang'));
});

test('getGradeRangeInfo returns correct metadata for each grade level', () => {
  const infoA = getGradeRangeInfo(90);
  assert.equal(infoA.huruf, 'A');
  assert.equal(infoA.isLulus, true);
  assert.equal(infoA.predikatSingkat, 'Baik Sekali');

  const infoD = getGradeRangeInfo(45);
  assert.equal(infoD.huruf, 'D');
  assert.equal(infoD.isLulus, false);
  assert.equal(infoD.predikatSingkat, 'Kurang');
});

test('calculateFinalAggregate calculates 2-examiner 50% Sidang + 50% Jurnal PKL formula', () => {
  const evaluations: PenilaianPenguji[] = [
    {
      id: 'p1',
      mahasiswaId: 'm1',
      pengujiId: 'p1',
      pengujiNama: 'Dr. Ir. Hendra Kurniawan, M.T.',
      pengujiPeran: 'Penguji 1 (Ketua)',
      nilaiItems: [],
      subtotalAgenda: 90,
      subtotalSidang: 80,
      totalNilai: 85,
      nilaiHuruf: 'A',
      catatanRevisi: 'Bagus',
      rekomendasiStatus: 'Lulus',
      isDraft: false,
      updatedAt: '2026-10-18T10:00:00Z',
    },
    {
      id: 'p2',
      mahasiswaId: 'm1',
      pengujiId: 'p2',
      pengujiNama: 'Siti Nurhaliza, S.Kom., M.Cs.',
      pengujiPeran: 'Penguji 2 (Sekretaris)',
      nilaiItems: [],
      subtotalAgenda: 90,
      subtotalSidang: 84,
      totalNilai: 87,
      nilaiHuruf: 'A',
      catatanRevisi: 'Rapikan diagram alur',
      rekomendasiStatus: 'Lulus',
      isDraft: false,
      updatedAt: '2026-10-18T10:05:00Z',
    },
  ];

  // Default required examiners count is 2
  const recap = calculateFinalAggregate('m1', evaluations, 2);
  assert.equal(recap.totalPengujiMenilai, 2);
  assert.equal(recap.totalPengujiWajib, 2);
  assert.equal(recap.isLengkap, true);

  // Nilai Jurnal PKL: average of 90 & 90 = 90
  assert.equal(recap.nilaiJurnalPkl, 90);
  assert.equal(recap.poinJurnalPkl50, 45); // 90 * 0.5

  // Nilai Sidang: P1=80, P2=84 => Rata-rata (80+84)/2 = 82
  assert.equal(recap.nilaiSidangP1, 80);
  assert.equal(recap.nilaiSidangP2, 84);
  assert.equal(recap.nilaiSidangGabungan, 82);
  assert.equal(recap.poinSidang50, 41); // 82 * 0.5

  // Nilai Akhir (100%) = 45 + 41 = 86
  assert.equal(recap.nilaiAkhirAngka, 86);
  assert.equal(recap.nilaiAkhirHuruf, 'A');
  assert.equal(recap.keputusanAkhir, 'LULUS (AMAT KOMPETEN)');
});

test('calculateFinalAggregate returns BELUM DINILAI when no evaluations submitted', () => {
  const recap = calculateFinalAggregate('m_empty', [], 2);
  assert.equal(recap.totalPengujiMenilai, 0);
  assert.equal(recap.totalPengujiWajib, 2);
  assert.equal(recap.keputusanAkhir, 'BELUM DINILAI');
});

test('validateScores checks incomplete inputs and bounds', () => {
  const invalidItems: NilaiKriteriaItem[] = [
    { kriteriaId: 'k1_agenda_disiplin', skor: 85 },
    { kriteriaId: 'k2_agenda_kerjasama', skor: 120 }, // out of bounds
  ];
  const result = validateScores(invalidItems, DEFAULT_KRITERIA);
  assert.equal(result.isValid, false);
  assert.ok(result.errors.length >= 2);
});

test('generateSupabaseSQLSchema produces valid DDL script', () => {
  const sql = generateSupabaseSQLSchema();
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.peserta_sidang'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.penilaian_sidang'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.penguji'));
  assert.ok(sql.includes('ALTER TABLE public.penguji ADD COLUMN IF NOT EXISTS email'));
  assert.ok(sql.includes('ALTER TABLE public.penilaian_sidang ADD COLUMN IF NOT EXISTS subtotal_agenda'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.master_siswa_pkl'));
  assert.ok(sql.includes('ALTER PUBLICATION supabase_realtime'));
});

test('generateResetAndSyncSQLScript produces valid SQL with DELETE policy and realtime', () => {
  const sql = generateResetAndSyncSQLScript();
  assert.ok(sql.includes('ALTER TABLE public.penilaian_sidang ADD COLUMN IF NOT EXISTS subtotal_agenda'));
  assert.ok(sql.includes('GRANT ALL ON TABLE public.penilaian_sidang TO anon, authenticated'));
  assert.ok(sql.includes('CREATE POLICY "Public Write Access Penilaian"'));
  assert.ok(sql.includes('ALTER PUBLICATION supabase_realtime ADD TABLE public.penilaian_sidang'));
});

test('generateMasterJurusanSQLScript produces valid SQL with kepala_program and all SMK MA jurusans', () => {
  const sql = generateMasterJurusanSQLScript();
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.master_jurusan'));
  assert.ok(sql.includes('ALTER TABLE public.master_jurusan ADD COLUMN IF NOT EXISTS kepala_program'));
  assert.ok(sql.includes('ON CONFLICT (kode) DO UPDATE SET'));
  assert.ok(sql.includes('TBSM'));
  assert.ok(sql.includes('AKL'));
  assert.ok(sql.includes('RPL'));
  assert.ok(sql.includes('TKJ'));
  assert.ok(sql.includes('ALTER PUBLICATION supabase_realtime ADD TABLE public.master_jurusan'));
});


