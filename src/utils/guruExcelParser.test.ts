import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGuruKey, processRawGuruExcelRows } from './guruExcelParser.ts';

test('normalizeGuruKey normalizes strings correctly', () => {
  assert.equal(normalizeGuruKey('NIP / NIK'), 'nipnik');
  assert.equal(normalizeGuruKey('Nama Guru Pembimbing'), 'namagurupembimbing');
  assert.equal(normalizeGuruKey('Email Login (Aktif)'), 'emailloginaktif');
  assert.equal(normalizeGuruKey('No. Telepon / WhatsApp'), 'noteleponwhatsapp');
});

test('processRawGuruExcelRows handles valid rows and auto-generates credentials if omitted', () => {
  const sampleRows = [
    {
      'NIP': '19820315 200812 1 001',
      'Nama Guru Pembimbing': 'Dr. Ir. Hendra Kurniawan, M.T.',
      'Telepon': '0812-2345-6789',
      'Email Login': 'hendra.kurniawan@smk.belajar.id',
      'Password Login': 'Guru#Hendra2026',
      'Bidang Keahlian': 'RPL',
    },
    {
      'NIP/NIK': '19950101 202001 2 005',
      'Nama': 'Maya Putri, S.Kom.',
      // Email and Password deliberately empty to verify auto-generation
    },
  ];

  const result = processRawGuruExcelRows(sampleRows);
  assert.equal(result.errors.length, 0);
  assert.equal(result.validGuru.length, 2);

  const hendra = result.validGuru[0];
  assert.equal(hendra.nip, '19820315 200812 1 001');
  assert.equal(hendra.nama, 'Dr. Ir. Hendra Kurniawan, M.T.');
  assert.equal(hendra.emailLogin, 'hendra.kurniawan@smk.belajar.id');

  const maya = result.validGuru[1];
  assert.equal(maya.nip, '19950101 202001 2 005');
  assert.equal(maya.nama, 'Maya Putri, S.Kom.');
  assert.ok(maya.emailLogin.includes('maya'));
  assert.ok(maya.passwordLogin.startsWith('Guru'));
});

test('processRawGuruExcelRows flags missing NIP or Nama and detects duplicates in file', () => {
  const invalidRows = [
    {
      // Missing NIP
      'Nama Guru Pembimbing': 'Guru Tanpa NIP',
      'Telepon': '0812-1111-2222',
    },
    {
      // Missing Nama
      'NIP': '19880101 201101 1 002',
    },
    {
      // Duplicate NIP
      'NIP': '19880101 201101 1 002',
      'Nama': 'Guru Duplikat',
    },
  ];

  const result = processRawGuruExcelRows(invalidRows);
  assert.equal(result.validGuru.length, 0);
  assert.equal(result.errors.length, 3);
  assert.ok(result.errors[0].message.includes('NIP / NIK'));
  assert.ok(result.errors[1].message.includes('Nama Guru Pembimbing'));
  assert.ok(result.errors[2].message.includes('duplikat'));
});
