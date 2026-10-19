import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  countSiswaPerJurusan, 
  getSiswaByJurusan, 
  findJurusanByNameOrCode, 
  normalizeJurusanInput,
  getJurusanColorTheme 
} from './jurusanUtils.ts';
import type { MasterJurusan, MasterSiswaPKL } from '../types/index.ts';

const mockJurusanList: MasterJurusan[] = [
  {
    id: 'mj-1',
    kode: 'RPL',
    nama: 'Rekayasa Perangkat Lunak',
    bidangKeahlian: 'Teknologi Informasi & Komunikasi',
    kepalaProgram: 'Dr. Ir. Hendra Kurniawan, M.T.',
    isActive: true,
  },
  {
    id: 'mj-2',
    kode: 'TKJ',
    nama: 'Teknik Komputer & Jaringan',
    bidangKeahlian: 'Teknologi Informasi & Komunikasi',
    kepalaProgram: 'Ahmad Zulfikar, S.T., M.Kom.',
    isActive: true,
  },
];

const mockSiswaList: MasterSiswaPKL[] = [
  {
    id: 'ms-1',
    nisn: '0061234567',
    namaLengkap: 'Budi Santoso',
    kelas: 'XII RPL 1',
    jurusan: 'Rekayasa Perangkat Lunak',
    emailLogin: 'budi@smk.belajar.id',
    passwordLogin: 'pass123',
    guruPembimbing: 'Dr. Hendra',
  },
  {
    id: 'ms-2',
    nisn: '0062345678',
    namaLengkap: 'Citra Dewi',
    kelas: 'XII RPL 2',
    jurusan: 'RPL',
    emailLogin: 'citra@smk.belajar.id',
    passwordLogin: 'pass456',
    guruPembimbing: 'Dr. Hendra',
  },
  {
    id: 'ms-3',
    nisn: '0063456789',
    namaLengkap: 'Danu Pratama',
    kelas: 'XII TKJ 1',
    jurusan: 'Teknik Komputer & Jaringan',
    emailLogin: 'danu@smk.belajar.id',
    passwordLogin: 'pass789',
    guruPembimbing: 'Ahmad Zulfikar',
  },
];

test('countSiswaPerJurusan matches both full name and abbreviation', () => {
  const rpl = mockJurusanList[0];
  const tkj = mockJurusanList[1];
  
  assert.equal(countSiswaPerJurusan(mockSiswaList, rpl), 2);
  assert.equal(countSiswaPerJurusan(mockSiswaList, tkj), 1);
});

test('getSiswaByJurusan returns correct subset of students', () => {
  const rpl = mockJurusanList[0];
  const students = getSiswaByJurusan(mockSiswaList, rpl);
  assert.equal(students.length, 2);
  assert.equal(students[0].namaLengkap, 'Budi Santoso');
  assert.equal(students[1].namaLengkap, 'Citra Dewi');
});

test('findJurusanByNameOrCode finds by code case-insensitively', () => {
  const foundRpl = findJurusanByNameOrCode(mockJurusanList, 'rpl');
  assert.ok(foundRpl);
  assert.equal(foundRpl?.kode, 'RPL');

  const foundTkj = findJurusanByNameOrCode(mockJurusanList, 'Teknik Komputer & Jaringan');
  assert.ok(foundTkj);
  assert.equal(foundTkj?.kode, 'TKJ');
});

test('normalizeJurusanInput normalizes abbreviations to full official names', () => {
  assert.equal(normalizeJurusanInput('rpl', mockJurusanList), 'Rekayasa Perangkat Lunak');
  assert.equal(normalizeJurusanInput('TKJ', mockJurusanList), 'Teknik Komputer & Jaringan');
  assert.equal(normalizeJurusanInput('sija'), 'Sistem Informasi Jaringan & Aplikasi');
});

test('getJurusanColorTheme returns valid tailwind badge classes', () => {
  const rplTheme = getJurusanColorTheme('RPL');
  assert.ok(rplTheme.badge.includes('blue'));
  const tkjTheme = getJurusanColorTheme('TKJ');
  assert.ok(tkjTheme.badge.includes('indigo'));
});
