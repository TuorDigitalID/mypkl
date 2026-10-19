import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_KRITERIA,
  calculateExaminerTotal,
  calculateGradeLetter,
  calculatePredicate,
  calculateFinalAggregate,
  validateScores,
  generateSupabaseSQLSchema,
} from './scoring.ts';
import type { NilaiKriteriaItem, PenilaianPenguji } from '../types/index.ts';

test('calculateExaminerTotal calculates weighted sum correctly', () => {
  // k1: 20%, k2: 35%, k3: 20%, k4: 25%
  // Test case: 100 on all = 100
  const itemsAll100: NilaiKriteriaItem[] = [
    { kriteriaId: 'k1', skor: 100 },
    { kriteriaId: 'k2', skor: 100 },
    { kriteriaId: 'k3', skor: 100 },
    { kriteriaId: 'k4', skor: 100 },
  ];
  assert.equal(calculateExaminerTotal(itemsAll100, DEFAULT_KRITERIA), 100);

  // Test case mixed: k1(80)=16, k2(90)=31.5, k3(85)=17, k4(80)=20 => Total: 84.5
  const itemsMixed: NilaiKriteriaItem[] = [
    { kriteriaId: 'k1', skor: 80 },
    { kriteriaId: 'k2', skor: 90 },
    { kriteriaId: 'k3', skor: 85 },
    { kriteriaId: 'k4', skor: 80 },
  ];
  assert.equal(calculateExaminerTotal(itemsMixed, DEFAULT_KRITERIA), 84.5);
});

test('calculateGradeLetter maps scores to standard letters', () => {
  assert.equal(calculateGradeLetter(92), 'A');
  assert.equal(calculateGradeLetter(85), 'A');
  assert.equal(calculateGradeLetter(84.9), 'B');
  assert.equal(calculateGradeLetter(75), 'B');
  assert.equal(calculateGradeLetter(74.5), 'C');
  assert.equal(calculateGradeLetter(65), 'C');
  assert.equal(calculateGradeLetter(60), 'D');
  assert.equal(calculateGradeLetter(45), 'E');
});

test('calculatePredicate provides clear status', () => {
  assert.ok(calculatePredicate(95).includes('Sangat Memuaskan'));
  assert.ok(calculatePredicate(78).includes('Baik'));
  assert.ok(calculatePredicate(50).includes('Gagal'));
});

test('calculateFinalAggregate calculates multi-examiner mean and decision', () => {
  const evaluations: PenilaianPenguji[] = [
    {
      id: 'p1',
      mahasiswaId: 'm1',
      pengujiId: 'd1',
      pengujiNama: 'Dr. Hendra',
      pengujiPeran: 'Penguji 1 (Ketua)',
      nilaiItems: [],
      totalNilai: 90,
      nilaiHuruf: 'A',
      catatanRevisi: 'Bagus',
      rekomendasiStatus: 'Lulus',
      isDraft: false,
      updatedAt: '2026-10-18T10:00:00Z',
    },
    {
      id: 'p2',
      mahasiswaId: 'm1',
      pengujiId: 'd2',
      pengujiNama: 'Siti Nurhaliza',
      pengujiPeran: 'Penguji 2 (Sekretaris)',
      nilaiItems: [],
      totalNilai: 88,
      nilaiHuruf: 'A',
      catatanRevisi: 'Rapikan diagram',
      rekomendasiStatus: 'Lulus dengan Revisi',
      isDraft: false,
      updatedAt: '2026-10-18T10:05:00Z',
    },
    {
      id: 'p3',
      mahasiswaId: 'm1',
      pengujiId: 'd3',
      pengujiNama: 'Bambang',
      pengujiPeran: 'Penguji 3 (Anggota)',
      nilaiItems: [],
      totalNilai: 86,
      nilaiHuruf: 'A',
      catatanRevisi: 'Oke',
      rekomendasiStatus: 'Lulus',
      isDraft: false,
      updatedAt: '2026-10-18T10:08:00Z',
    },
  ];

  const recap = calculateFinalAggregate('m1', evaluations, 3);
  assert.equal(recap.totalPengujiMenilai, 3);
  assert.equal(recap.isLengkap, true);
  // Average of 90, 88, 86 = 88
  assert.equal(recap.nilaiAkhirAngka, 88);
  assert.equal(recap.nilaiAkhirHuruf, 'A');
  // Since one has 'Lulus dengan Revisi', decision is 'LULUS REVISI'
  assert.equal(recap.keputusanAkhir, 'LULUS REVISI');
});

test('calculateFinalAggregate returns BELUM DINILAI when no evaluations submitted', () => {
  const recap = calculateFinalAggregate('m_empty', [], 3);
  assert.equal(recap.totalPengujiMenilai, 0);
  assert.equal(recap.keputusanAkhir, 'BELUM DINILAI');
});

test('validateScores checks incomplete inputs and bounds', () => {
  const invalidItems: NilaiKriteriaItem[] = [
    { kriteriaId: 'k1', skor: 85 },
    { kriteriaId: 'k2', skor: 120 }, // out of bounds
  ];
  const result = validateScores(invalidItems, DEFAULT_KRITERIA);
  assert.equal(result.isValid, false);
  assert.ok(result.errors.length >= 2);
});

test('generateSupabaseSQLSchema produces valid DDL script', () => {
  const sql = generateSupabaseSQLSchema();
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.peserta_sidang'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.penilaian_sidang'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.master_siswa_pkl'));
  assert.ok(sql.includes('ALTER PUBLICATION supabase_realtime'));
});
