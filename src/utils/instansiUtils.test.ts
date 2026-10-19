import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateInstansiStats, 
  getSiswaByInstansi, 
  findInstansiByName, 
  generateInstansiCSV 
} from './instansiUtils.ts';
import type { MasterInstansi, MasterSiswaPKL } from '../types/index.ts';

const mockInstansiList: MasterInstansi[] = [
  {
    id: 'inst-1',
    nama: 'PT Telekomunikasi Indonesia (Telkom Regional)',
    alamat: 'Jl. Japati No. 1, Bandung',
    kuota: 4,
    pembimbingInstansi: 'Bambang Prasetyo, S.T.',
    isActive: true,
  },
  {
    id: 'inst-2',
    nama: 'PT Bank Central Asia Tbk (BCA)',
    alamat: 'Menara BCA, Jakarta Pusat',
    kuota: 2,
    pembimbingInstansi: 'Hendra Wijaya, M.Kom.',
    isActive: true,
  },
  {
    id: 'inst-3',
    nama: 'Astra Honda Motor',
    alamat: 'MM2100, Cikarang',
    kuota: 5,
    pembimbingInstansi: 'Ir. Joko Susilo, M.T.',
    isActive: true,
  }
];

const mockSiswaList: MasterSiswaPKL[] = [
  {
    id: 's1',
    nisn: '001',
    namaLengkap: 'Siswa Satu',
    kelas: 'XII RPL 1',
    jurusan: 'Rekayasa Perangkat Lunak',
    emailLogin: 's1@test.com',
    passwordLogin: 'pass1',
    guruPembimbing: 'Guru A',
    instansiId: 'inst-1',
    instansiNama: 'PT Telekomunikasi Indonesia (Telkom Regional)',
    pembimbingInstansi: 'Bambang Prasetyo, S.T.',
  },
  {
    id: 's2',
    nisn: '002',
    namaLengkap: 'Siswa Dua',
    kelas: 'XII RPL 2',
    jurusan: 'Rekayasa Perangkat Lunak',
    emailLogin: 's2@test.com',
    passwordLogin: 'pass2',
    guruPembimbing: 'Guru B',
    instansiId: 'inst-1',
    instansiNama: 'PT Telekomunikasi Indonesia (Telkom Regional)',
    pembimbingInstansi: 'Bambang Prasetyo, S.T.',
  },
  {
    id: 's3',
    nisn: '003',
    namaLengkap: 'Siswa Tiga',
    kelas: 'XII TKJ 1',
    jurusan: 'Teknik Komputer & Jaringan',
    emailLogin: 's3@test.com',
    passwordLogin: 'pass3',
    guruPembimbing: 'Guru A',
    instansiId: 'inst-2',
    instansiNama: 'PT Bank Central Asia Tbk (BCA)',
    pembimbingInstansi: 'Hendra Wijaya, M.Kom.',
  },
  {
    id: 's4',
    nisn: '004',
    namaLengkap: 'Siswa Empat',
    kelas: 'XII TKJ 2',
    jurusan: 'Teknik Komputer & Jaringan',
    emailLogin: 's4@test.com',
    passwordLogin: 'pass4',
    guruPembimbing: 'Guru C',
    instansiNama: 'PT Bank Central Asia Tbk (BCA)',
  }
];

test('calculateInstansiStats computes counts, remaining quota, and status correctly', () => {
  // inst-1 has 2 students, kuota 4 -> sisa 2
  const stats1 = calculateInstansiStats(mockInstansiList[0], mockSiswaList);
  assert.equal(stats1.jumlahSiswaTerisi, 2);
  assert.equal(stats1.sisaKuota, 2);
  assert.equal(stats1.persentaseTerisi, 50);
  assert.equal(stats1.isPenuh, false);

  // inst-2 has 2 students, kuota 2 -> sisa 0, isPenuh true
  const stats2 = calculateInstansiStats(mockInstansiList[1], mockSiswaList);
  assert.equal(stats2.jumlahSiswaTerisi, 2);
  assert.equal(stats2.sisaKuota, 0);
  assert.equal(stats2.persentaseTerisi, 100);
  assert.equal(stats2.isPenuh, true);
  assert.equal(stats2.statusKeterisian, 'Penuh');

  // inst-3 has 0 students, kuota 5 -> sisa 5, Kosong
  const stats3 = calculateInstansiStats(mockInstansiList[2], mockSiswaList);
  assert.equal(stats3.jumlahSiswaTerisi, 0);
  assert.equal(stats3.sisaKuota, 5);
  assert.equal(stats3.persentaseTerisi, 0);
  assert.equal(stats3.isPenuh, false);
  assert.equal(stats3.statusKeterisian, 'Kosong');
});

test('getSiswaByInstansi correctly links students by ID or Name', () => {
  const siswaTelkom = getSiswaByInstansi(mockSiswaList, mockInstansiList[0]);
  assert.equal(siswaTelkom.length, 2);
  assert.equal(siswaTelkom[0].namaLengkap, 'Siswa Satu');
  assert.equal(siswaTelkom[1].namaLengkap, 'Siswa Dua');

  const siswaBCA = getSiswaByInstansi(mockSiswaList, mockInstansiList[1]);
  assert.equal(siswaBCA.length, 2);
});

test('findInstansiByName finds company by name', () => {
  const found = findInstansiByName(mockInstansiList, 'Telkom');
  assert.ok(found);
  assert.equal(found?.id, 'inst-1');
});

test('generateInstansiCSV generates formatted CSV with required columns', () => {
  const csv = generateInstansiCSV(mockInstansiList, mockSiswaList);
  assert.ok(csv.includes('Nama Instansi / Perusahaan'));
  assert.ok(csv.includes('Alamat Lengkap'));
  assert.ok(csv.includes('Kuota Siswa'));
  assert.ok(csv.includes('Jumlah Siswa Terisi'));
  assert.ok(csv.includes('Sisa Kuota'));
  assert.ok(csv.includes('Nama Pembimbing Instansi'));
  assert.ok(csv.includes('PT Telekomunikasi Indonesia (Telkom Regional)'));
});
