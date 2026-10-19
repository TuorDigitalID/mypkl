import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeInstansiKey, processRawInstansiExcelRows } from './instansiExcelParser.ts';

test('normalizeInstansiKey trims, lowercases, and removes special chars', () => {
  assert.equal(normalizeInstansiKey('Nama Instansi / Perusahaan'), 'namainstansiperusahaan');
  assert.equal(normalizeInstansiKey('Kuota Siswa (Orang)'), 'kuotasiswaorang');
  assert.equal(normalizeInstansiKey('Nama Pembimbing Instansi (DUDI)'), 'namapembimbinginstansidudi');
  assert.equal(normalizeInstansiKey('No. WhatsApp / HP'), 'nowhatsapphp');
});

test('processRawInstansiExcelRows parses valid rows with varied header aliases', () => {
  const sampleRows = [
    {
      'Nama Instansi': 'PT GoTo Gojek Tokopedia Tbk',
      'Alamat Lengkap': 'Gedung Pasaraya Blok M, Jl. Iskandarsyah II No. 2, Jakarta Selatan',
      'Kuota': '5',
      'Pembimbing Instansi': 'Budi Setiawan, S.T.',
      'Bidang Usaha': 'E-Commerce & Digital Logistics',
      'Kontak Person': '0812-9988-7766',
      'Email': 'internship@goto.com',
    },
    {
      'Perusahaan': 'Studio Animasi Nusantara',
      'Alamat': 'Jl. Diponegoro No. 12, Bandung',
      'Kuota Siswa': 3,
      // Pembimbing & bidang usaha empty, should get sensible defaults
    },
  ];

  const result = processRawInstansiExcelRows(sampleRows);
  assert.equal(result.errors.length, 0);
  assert.equal(result.validInstansi.length, 2);

  const goto = result.validInstansi[0];
  assert.equal(goto.nama, 'PT GoTo Gojek Tokopedia Tbk');
  assert.equal(goto.kuota, 5);
  assert.equal(goto.pembimbingInstansi, 'Budi Setiawan, S.T.');
  assert.equal(goto.email, 'internship@goto.com');

  const studio = result.validInstansi[1];
  assert.equal(studio.nama, 'Studio Animasi Nusantara');
  assert.equal(studio.alamat, 'Jl. Diponegoro No. 12, Bandung');
  assert.equal(studio.kuota, 3);
  assert.equal(studio.pembimbingInstansi, 'Pembimbing DUDI');
  assert.equal(studio.bidangUsaha, 'Umum & Teknologi');
});

test('processRawInstansiExcelRows flags missing mandatory fields and invalid kuota', () => {
  const invalidRows = [
    {
      // Missing Nama
      'Alamat': 'Jl. Sudirman No. 10',
      'Kuota': 4,
    },
    {
      // Missing Alamat
      'Nama Instansi': 'PT Maju Bersama',
      'Kuota': 2,
    },
    {
      // Invalid Kuota
      'Nama Instansi': 'PT Angka Negatif',
      'Alamat': 'Jl. Merdeka No. 45',
      'Kuota': '-2',
    },
  ];

  const result = processRawInstansiExcelRows(invalidRows);
  assert.equal(result.validInstansi.length, 0);
  assert.equal(result.errors.length, 3);
  assert.ok(result.errors[0].message.includes('Nama Instansi'));
  assert.ok(result.errors[1].message.includes('Alamat Lengkap'));
  assert.ok(result.errors[2].message.includes('angka bulat'));
});

test('processRawInstansiExcelRows detects duplicate company names in file', () => {
  const duplicateRows = [
    {
      'Nama Instansi': 'PT Sinar Harapan',
      'Alamat': 'Jl. Gatot Subroto No. 10',
      'Kuota': 2,
    },
    {
      'Nama Instansi': 'pt sinar harapan',
      'Alamat': 'Jl. Lain No. 20',
      'Kuota': 4,
    },
  ];

  const result = processRawInstansiExcelRows(duplicateRows);
  assert.equal(result.validInstansi.length, 1);
  assert.equal(result.errors.length, 1);
  assert.ok(result.errors[0].message.includes('duplikat'));
});
