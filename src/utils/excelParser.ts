import * as XLSX from 'xlsx';
import type { MasterSiswaPKL } from '../types/index.ts';
import { normalizeJurusanInput } from './jurusanUtils.ts';

export interface ParseResult {
  validSiswa: MasterSiswaPKL[];
  errors: { row: number; message: string }[];
}

/**
 * Normalisasi nama header agar toleran terhadap variasi penulisan dari Excel
 */
export function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Memvalidasi dan mengonversi baris raw data dari file Excel ke struktur MasterSiswaPKL
 */
export function processRawExcelRows(rawRows: Record<string, any>[]): ParseResult {
  const validSiswa: MasterSiswaPKL[] = [];
  const errors: { row: number; message: string }[] = [];

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Mengingat baris 1 adalah header Excel

    // Cari nilai berdasarkan kunci ternormalisasi
    let nisn = '';
    let namaLengkap = '';
    let kelas = 'XII RPL 1';
    let jurusan = 'Rekayasa Perangkat Lunak';
    let emailLogin = '';
    let passwordLogin = '';
    let guruPembimbing = 'Dr. Ir. Hendra Kurniawan, M.T.';

    for (const [key, value] of Object.entries(row)) {
      const norm = normalizeKey(key);
      const valStr = value !== undefined && value !== null ? String(value).trim() : '';

      if (norm === 'nisn' || norm === 'nis') {
        nisn = valStr;
      } else if (
        norm === 'namalengkap' ||
        norm === 'nama' ||
        norm === 'namasiswa'
      ) {
        namaLengkap = valStr;
      } else if (norm === 'kelas' || norm === 'rombel') {
        kelas = valStr || kelas;
      } else if (
        norm === 'jurusan' ||
        norm === 'programkeahlian' ||
        norm === 'kompetensikeahlian' ||
        norm === 'prodi'
      ) {
        jurusan = normalizeJurusanInput(valStr || jurusan);
      } else if (
        norm === 'emaillogin' ||
        norm === 'email' ||
        norm === 'surel'
      ) {
        emailLogin = valStr;
      } else if (
        norm === 'passwordlogin' ||
        norm === 'password' ||
        norm === 'katasandi'
      ) {
        passwordLogin = valStr;
      } else if (
        norm === 'gurupembimbing' ||
        norm === 'pembimbing' ||
        norm === 'gurupembimbingsekolah' ||
        norm === 'guru'
      ) {
        guruPembimbing = valStr || guruPembimbing;
      }
    }

    // Validasi Kolom Wajib: NISN & Nama Lengkap
    if (!nisn) {
      errors.push({ row: rowNum, message: 'Kolom NISN tidak boleh kosong.' });
      return;
    }

    if (!namaLengkap) {
      errors.push({ row: rowNum, message: `Baris dengan NISN ${nisn} belum memiliki Nama Lengkap.` });
      return;
    }

    // Auto-generate Email jika kosong
    if (!emailLogin) {
      const cleanSlug = namaLengkap
        .toLowerCase()
        .split(' ')[0]
        .replace(/[^a-z]/g, '') || 'siswa';
      emailLogin = `${cleanSlug}.${nisn.slice(-4)}@smk.belajar.id`;
    }

    // Auto-generate Password jika kosong
    if (!passwordLogin) {
      passwordLogin = `Pkl#${nisn.slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    }

    validSiswa.push({
      id: `ms-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
      nisn,
      namaLengkap,
      kelas,
      jurusan,
      emailLogin,
      passwordLogin,
      guruPembimbing,
      createdAt: new Date().toISOString(),
    });
  });

  return { validSiswa, errors };
}

/**
 * Membaca buffer file ArrayBuffer atau binary string menggunakan library xlsx
 */
export function parseExcelFileBuffer(data: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { validSiswa: [], errors: [{ row: 1, message: 'File Excel kosong atau tidak memiliki sheet.' }] };
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    return { validSiswa: [], errors: [{ row: 1, message: 'Tidak ada baris data ditemukan di dalam sheet.' }] };
  }

  return processRawExcelRows(rawRows);
}

/**
 * Menghasilkan file template Excel (.xlsx) siap pakai untuk diunduh user
 */
export function downloadExcelTemplate(): void {
  const templateData = [
    {
      'NISN': '0061234567',
      'Nama Lengkap': 'Ahmad Fauzan',
      'Kelas': 'XII RPL 1',
      'Jurusan': 'Rekayasa Perangkat Lunak',
      'Email Login': 'fauzan.4567@smk.belajar.id',
      'Password Login': 'Pkl#Fauzan2026',
      'Guru Pembimbing': 'Dr. Ir. Hendra Kurniawan, M.T.',
    },
    {
      'NISN': '0062345678',
      'Nama Lengkap': 'Citra Kirana',
      'Kelas': 'XII SIJA 2',
      'Jurusan': 'Sistem Informasi Jaringan & Aplikasi',
      'Email Login': 'citra.5678@smk.belajar.id',
      'Password Login': 'Pkl#Citra2026',
      'Guru Pembimbing': 'Siti Nurhaliza, S.Kom., M.Cs.',
    },
    {
      'NISN': '0063456789',
      'Nama Lengkap': 'Rian Pratama',
      'Kelas': 'XII TKJ 1',
      'Jurusan': 'Teknik Komputer & Jaringan',
      'Email Login': 'rian.6789@smk.belajar.id',
      'Password Login': 'Pkl#Rian2026',
      'Guru Pembimbing': 'Dr. Ir. Hendra Kurniawan, M.T.',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  // Atur lebar kolom agar rapi
  ws['!cols'] = [
    { wch: 15 }, // NISN
    { wch: 25 }, // Nama Lengkap
    { wch: 12 }, // Kelas
    { wch: 30 }, // Jurusan
    { wch: 30 }, // Email Login
    { wch: 18 }, // Password Login
    { wch: 30 }, // Guru Pembimbing
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'MasterSiswa');

  XLSX.writeFile(wb, 'Template_Master_Siswa_PKL.xlsx');
}
