import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateGuruStats, 
  findGuruByNameOrNip, 
  generateGuruCredentials, 
  generateGuruCSV 
} from './guruUtils.ts';
import type { MasterGuruPembimbing, MasterSiswaPKL } from '../types/index.ts';

const mockGuru: MasterGuruPembimbing = {
  id: 'guru-1',
  nip: '19820315 200812 1 001',
  nama: 'Dr. Ir. Hendra Kurniawan, M.T.',
  telepon: '0812-2345-6789',
  emailLogin: 'hendra.kurniawan@smk.belajar.id',
  passwordLogin: 'Guru#Hendra2026',
  bidangStudi: 'RPL',
  isActive: true,
};

const mockSiswaList: MasterSiswaPKL[] = [
  {
    id: 's-1',
    nisn: '001',
    namaLengkap: 'Siswa A',
    kelas: 'XII RPL 1',
    jurusan: 'Rekayasa Perangkat Lunak',
    emailLogin: 'a@smk.id',
    passwordLogin: 'pass1',
    guruPembimbing: 'Dr. Ir. Hendra Kurniawan, M.T.',
  },
  {
    id: 's-2',
    nisn: '002',
    namaLengkap: 'Siswa B',
    kelas: 'XII RPL 2',
    jurusan: 'Rekayasa Perangkat Lunak',
    emailLogin: 'b@smk.id',
    passwordLogin: 'pass2',
    guruPembimbing: 'Dr. Ir. Hendra Kurniawan, M.T.',
  },
  {
    id: 's-3',
    nisn: '003',
    namaLengkap: 'Siswa C',
    kelas: 'XII TKJ 1',
    jurusan: 'Teknik Komputer & Jaringan',
    emailLogin: 'c@smk.id',
    passwordLogin: 'pass3',
    guruPembimbing: 'Siti Nurhaliza, S.Kom., M.Cs.',
  },
];

test('calculateGuruStats counts matching students correctly', () => {
  const stats = calculateGuruStats(mockGuru, mockSiswaList);
  assert.equal(stats.jumlahSiswaBimbingan, 2);
  assert.equal(stats.siswaBimbinganList.length, 2);
  assert.equal(stats.siswaBimbinganList[0].namaLengkap, 'Siswa A');
  assert.equal(stats.siswaBimbinganList[1].namaLengkap, 'Siswa B');
});

test('findGuruByNameOrNip finds teacher by NIP or partial name', () => {
  const list = [mockGuru];
  const byNip = findGuruByNameOrNip(list, '19820315 200812 1 001');
  assert.ok(byNip);
  assert.equal(byNip.nama, mockGuru.nama);

  const byName = findGuruByNameOrNip(list, 'Hendra Kurniawan');
  assert.ok(byName);
  assert.equal(byName.id, 'guru-1');
});

test('generateGuruCredentials creates proper email and strong password', () => {
  const creds = generateGuruCredentials('Dr. Ir. Hendra Kurniawan, M.T.', '198203152008121001');
  assert.ok(creds.email.includes('hendra'));
  assert.ok(creds.email.endsWith('@smk.belajar.id'));
  assert.ok(creds.password.startsWith('Guru'));
});

test('generateGuruCSV outputs valid CSV with required column headers', () => {
  const csv = generateGuruCSV([mockGuru], mockSiswaList);
  assert.ok(csv.includes('NIP / NIK'));
  assert.ok(csv.includes('Nama Guru Pembimbing'));
  assert.ok(csv.includes('Telepon'));
  assert.ok(csv.includes('Email Login'));
  assert.ok(csv.includes('Password Login'));
  assert.ok(csv.includes('Jumlah Siswa Bimbingan'));
  assert.ok(csv.includes('Dr. Ir. Hendra Kurniawan, M.T.'));
  assert.ok(csv.includes('2')); // 2 siswa bimbingan
});
