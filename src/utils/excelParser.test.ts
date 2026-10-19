import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeKey, processRawExcelRows } from './excelParser.ts';

test('normalizeKey handles casing, spaces, and punctuation', () => {
  assert.equal(normalizeKey('Nama Lengkap'), 'namalengkap');
  assert.equal(normalizeKey('Email Login (Aktif)'), 'emailloginaktif');
  assert.equal(normalizeKey('NISN / NIS'), 'nisnnis');
  assert.equal(normalizeKey('Password_Login'), 'passwordlogin');
});

test('processRawExcelRows processes valid rows and handles auto-generation', () => {
  const sampleRows = [
    {
      'NISN': '0061112223',
      'Nama Lengkap': 'Bayu Saputra',
      'Kelas': 'XII RPL 1',
      'Jurusan': 'Rekayasa Perangkat Lunak',
      'Email Login': 'bayu.saputra@smk.belajar.id',
      'Password Login': 'Pass#Bayu2026',
      'Guru Pembimbing': 'Dr. Ir. Hendra Kurniawan, M.T.',
    },
    {
      'nisn': '0069998887',
      'nama': 'Intan Permata',
      // email & password deliberately empty to test auto-generation
    },
  ];

  const result = processRawExcelRows(sampleRows);
  assert.equal(result.errors.length, 0);
  assert.equal(result.validSiswa.length, 2);

  const bayu = result.validSiswa[0];
  assert.equal(bayu.nisn, '0061112223');
  assert.equal(bayu.namaLengkap, 'Bayu Saputra');
  assert.equal(bayu.emailLogin, 'bayu.saputra@smk.belajar.id');

  const intan = result.validSiswa[1];
  assert.equal(intan.nisn, '0069998887');
  assert.equal(intan.namaLengkap, 'Intan Permata');
  // Verify auto-generated email & password
  assert.ok(intan.emailLogin.includes('intan'));
  assert.ok(intan.passwordLogin.startsWith('Pkl#'));
});

test('processRawExcelRows captures errors for missing required fields', () => {
  const invalidRows = [
    {
      'Nama Lengkap': 'Tanpa NISN',
    },
    {
      'NISN': '0065554443',
      // missing Nama Lengkap
    },
  ];

  const result = processRawExcelRows(invalidRows);
  assert.equal(result.validSiswa.length, 0);
  assert.equal(result.errors.length, 2);
  assert.ok(result.errors[0].message.includes('NISN'));
  assert.ok(result.errors[1].message.includes('Nama Lengkap'));
});
