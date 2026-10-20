import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlottingKey, normalizeStatusPlotting, processRawPlottingExcelRows } from './plottingExcelParser.ts';
import { calculatePlottingStats, filterPlottingList, generatePlottingCSV } from './plottingUtils.ts';
import type { PlottingSiswaPKL } from '../types/index.ts';

test('normalizePlottingKey normalizes headers correctly', () => {
  assert.equal(normalizePlottingKey('NISN'), 'nisn');
  assert.equal(normalizePlottingKey('Nama Siswa'), 'namasiswa');
  assert.equal(normalizePlottingKey('Instansi PKL (Penempatan)'), 'instansipklpenempatan');
  assert.equal(normalizePlottingKey('Guru Pembimbing Sekolah'), 'gurupembimbingsekolah');
  assert.equal(normalizePlottingKey('NIP Guru Pembimbing'), 'nipgurupembimbing');
  assert.equal(normalizePlottingKey('Periode Mulai PKL'), 'periodemulaipkl');
  assert.equal(normalizePlottingKey('Status Plotting'), 'statusplotting');
});

test('normalizeStatusPlotting normalizes various status labels', () => {
  assert.equal(normalizeStatusPlotting('Sedang PKL', true), 'Sedang PKL');
  assert.equal(normalizeStatusPlotting('Selesai PKL', true), 'Selesai PKL');
  assert.equal(normalizeStatusPlotting('Terplotting', true), 'Terplotting');
  assert.equal(normalizeStatusPlotting('Belum Terplotting', false), 'Belum Terplotting');
  assert.equal(normalizeStatusPlotting('', true), 'Terplotting');
  assert.equal(normalizeStatusPlotting('', false), 'Belum Terplotting');
});

test('processRawPlottingExcelRows parses valid rows with complete fields', () => {
  const rawRows = [
    {
      'NISN': '0061245678',
      'Nama Siswa': 'Muhammad Rizky Pratama',
      'Kelas': 'XII RPL 1',
      'Jurusan': 'Rekayasa Perangkat Lunak',
      'Instansi PKL (Penempatan)': 'PT Telkom Indonesia',
      'Alamat Instansi': 'Jl. Japati No. 1 Bandung',
      'Guru Pembimbing Sekolah': 'Dr. Ir. Hendra Kurniawan, M.T.',
      'NIP Guru Pembimbing': '19820315 200812 1 001',
      'Periode Mulai PKL': '15 Juli 2026',
      'Periode Selesai PKL': '15 Desember 2026',
      'Status Plotting': 'Terplotting',
    },
  ];

  const result = processRawPlottingExcelRows(rawRows);
  assert.equal(result.errors.length, 0);
  assert.equal(result.validPlotting.length, 1);
  const p = result.validPlotting[0];
  assert.equal(p.nisn, '0061245678');
  assert.equal(p.namaSiswa, 'Muhammad Rizky Pratama');
  assert.equal(p.instansiNama, 'PT Telkom Indonesia');
  assert.equal(p.guruNip, '19820315 200812 1 001');
  assert.equal(p.statusPlotting, 'Terplotting');
});

test('processRawPlottingExcelRows catches missing NISN and duplicates', () => {
  const rawRows = [
    {
      'Nama Siswa': 'Tanpa NISN',
      'Instansi PKL (Penempatan)': 'PT Alpha',
    },
    {
      'NISN': '0011223344',
      'Nama Siswa': 'Siswa A',
    },
    {
      'NISN': '0011223344',
      'Nama Siswa': 'Siswa Duplikat',
    },
  ];

  const result = processRawPlottingExcelRows(rawRows);
  assert.equal(result.validPlotting.length, 1);
  assert.equal(result.errors.length, 2);
  assert.match(result.errors[0].message, /NISN tidak boleh kosong/);
  assert.match(result.errors[1].message, /duplikat/);
});

test('calculatePlottingStats computes accurate counts and percentages', () => {
  const sampleList: PlottingSiswaPKL[] = [
    {
      id: '1',
      siswaId: 'ms-1',
      nisn: '001',
      namaSiswa: 'Siswa 1',
      kelas: 'XII RPL 1',
      jurusan: 'RPL',
      instansiNama: 'PT A',
      alamatInstansi: 'Alamat A',
      guruNama: 'Guru 1',
      guruNip: '111',
      periodeMulai: '15 Juli 2026',
      periodeSelesai: '15 Des 2026',
      statusPlotting: 'Terplotting',
    },
    {
      id: '2',
      siswaId: 'ms-2',
      nisn: '002',
      namaSiswa: 'Siswa 2',
      kelas: 'XII RPL 2',
      jurusan: 'RPL',
      instansiNama: 'PT B',
      alamatInstansi: 'Alamat B',
      guruNama: 'Guru 2',
      guruNip: '222',
      periodeMulai: '15 Juli 2026',
      periodeSelesai: '15 Des 2026',
      statusPlotting: 'Sedang PKL',
    },
    {
      id: '3',
      siswaId: 'ms-3',
      nisn: '003',
      namaSiswa: 'Siswa 3',
      kelas: 'XII TKJ 1',
      jurusan: 'TKJ',
      instansiNama: '',
      alamatInstansi: '',
      guruNama: '',
      guruNip: '',
      periodeMulai: '15 Juli 2026',
      periodeSelesai: '15 Des 2026',
      statusPlotting: 'Belum Terplotting',
    },
  ];

  const stats = calculatePlottingStats(sampleList);
  assert.equal(stats.totalSiswa, 3);
  assert.equal(stats.terplotting, 1);
  assert.equal(stats.sedangPkl, 1);
  assert.equal(stats.belumTerplotting, 1);
  assert.equal(stats.totalTerhubung, 2);
  assert.equal(stats.persentaseTerplotting, 67);
  assert.equal(stats.totalInstansiAktif, 2);
  assert.equal(stats.totalGuruAktif, 2);
});

test('filterPlottingList filters by search and categories correctly', () => {
  const sampleList: PlottingSiswaPKL[] = [
    {
      id: '1',
      siswaId: 'ms-1',
      nisn: '001',
      namaSiswa: 'Budi Santoso',
      kelas: 'XII RPL 1',
      jurusan: 'RPL',
      instansiNama: 'PT Telekomunikasi',
      alamatInstansi: 'Bandung',
      guruNama: 'Dr. Hendra',
      guruNip: '111',
      periodeMulai: '15 Juli 2026',
      periodeSelesai: '15 Des 2026',
      statusPlotting: 'Terplotting',
    },
    {
      id: '2',
      siswaId: 'ms-2',
      nisn: '002',
      namaSiswa: 'Siti Rahma',
      kelas: 'XII TKJ 1',
      jurusan: 'TKJ',
      instansiNama: '',
      alamatInstansi: '',
      guruNama: '',
      guruNip: '',
      periodeMulai: '15 Juli 2026',
      periodeSelesai: '15 Des 2026',
      statusPlotting: 'Belum Terplotting',
    },
  ];

  const filteredSearch = filterPlottingList(sampleList, 'Budi', 'semua', 'semua', 'semua', 'semua');
  assert.equal(filteredSearch.length, 1);
  assert.equal(filteredSearch[0].namaSiswa, 'Budi Santoso');

  const filteredStatus = filterPlottingList(sampleList, '', 'Belum Terplotting', 'semua', 'semua', 'semua');
  assert.equal(filteredStatus.length, 1);
  assert.equal(filteredStatus[0].namaSiswa, 'Siti Rahma');
});

test('generatePlottingCSV outputs expected header and escaped data', () => {
  const sampleList: PlottingSiswaPKL[] = [
    {
      id: '1',
      siswaId: 'ms-1',
      nisn: '0061234567',
      namaSiswa: 'Ahmad "Test"',
      kelas: 'XII RPL 1',
      jurusan: 'RPL',
      instansiNama: 'PT DUDI',
      alamatInstansi: 'Jl. Merdeka',
      guruNama: 'Guru A',
      guruNip: '12345',
      periodeMulai: '15 Juli 2026',
      periodeSelesai: '15 Des 2026',
      statusPlotting: 'Terplotting',
    },
  ];

  const csv = generatePlottingCSV(sampleList);
  assert.match(csv, /NISN,Nama Siswa,Kelas,Jurusan,Instansi PKL \(Penempatan\),Alamat Instansi,Guru Pembimbing Sekolah,NIP Guru Pembimbing,Periode Mulai PKL,Periode Selesai PKL,Status Plotting/);
  assert.match(csv, /"0061234567","Ahmad ""Test"""/);
});
