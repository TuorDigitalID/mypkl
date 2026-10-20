import * as XLSX from 'xlsx';
import type { MasterGuruPembimbing } from '../types/index.ts';
import { generateGuruCredentials } from './guruUtils.ts';

export interface ParseGuruResult {
  validGuru: MasterGuruPembimbing[];
  errors: { row: number; message: string }[];
}

/**
 * Normalisasi nama header agar toleran terhadap spasi, huruf besar/kecil, dan tanda baca dari Excel/CSV
 */
export function normalizeGuruKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Memvalidasi dan mengonversi baris raw data dari file Excel ke struktur MasterGuruPembimbing
 */
export function processRawGuruExcelRows(rawRows: Record<string, any>[]): ParseGuruResult {
  const validGuru: MasterGuruPembimbing[] = [];
  const errors: { row: number; message: string }[] = [];
  const seenNip = new Set<string>();

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Mengingat baris 1 adalah header Excel

    let nip = '';
    let nama = '';
    let telepon = '';
    let emailLogin = '';
    let passwordLogin = '';
    let bidangStudi = '';

    for (const [key, value] of Object.entries(row)) {
      const norm = normalizeGuruKey(key);
      const valStr = value !== undefined && value !== null ? String(value).trim() : '';

      if (
        norm === 'nip' ||
        norm === 'nik' ||
        norm === 'nipnik' ||
        norm === 'nomorindukpegawai' ||
        norm === 'nomorinduk' ||
        norm === 'noidentitas'
      ) {
        nip = valStr;
      } else if (
        norm === 'namagurupembimbing' ||
        norm === 'namaguru' ||
        norm === 'namapembimbing' ||
        norm === 'nama' ||
        norm === 'namalengkap' ||
        norm === 'gurupembimbing'
      ) {
        nama = valStr;
      } else if (
        norm === 'telepon' ||
        norm === 'nohp' ||
        norm === 'nomorhp' ||
        norm === 'whatsapp' ||
        norm === 'wa' ||
        norm === 'kontak' ||
        norm === 'hp' ||
        norm === 'notelepon'
      ) {
        telepon = valStr;
      } else if (
        norm === 'emaillogin' ||
        norm === 'email' ||
        norm === 'surel' ||
        norm === 'emailguru'
      ) {
        emailLogin = valStr;
      } else if (
        norm === 'passwordlogin' ||
        norm === 'password' ||
        norm === 'katasandi' ||
        norm === 'pass'
      ) {
        passwordLogin = valStr;
      } else if (
        norm === 'bidangstudi' ||
        norm === 'bidangkeahlian' ||
        norm === 'mapel' ||
        norm === 'bidang' ||
        norm === 'matapelajaran' ||
        norm === 'jurusan' ||
        norm === 'keahlian'
      ) {
        bidangStudi = valStr;
      }
    }

    // Abaikan baris kosong total
    if (!nip && !nama && !telepon && !emailLogin && !passwordLogin) {
      return;
    }

    // Validasi Kolom Wajib 1: NIP / NIK
    if (!nip) {
      errors.push({ row: rowNum, message: 'Kolom NIP / NIK tidak boleh kosong.' });
      return;
    }

    // Deteksi duplikasi di dalam file yang sama
    const cleanNip = nip.replace(/\s+/g, '');
    if (seenNip.has(cleanNip)) {
      errors.push({ row: rowNum, message: `NIP/NIK "${nip}" duplikat di dalam file Excel.` });
      return;
    }
    seenNip.add(cleanNip);

    // Validasi Kolom Wajib 2: Nama Guru Pembimbing
    if (!nama) {
      errors.push({ row: rowNum, message: `Baris dengan NIP ${nip} belum memiliki Nama Guru Pembimbing.` });
      return;
    }

    // Default Telepon jika kosong
    if (!telepon) {
      telepon = '0812-0000-0000';
    }

    // Auto-generate kredensial login jika tidak diisi pada file Excel
    if (!emailLogin || !passwordLogin) {
      const generated = generateGuruCredentials(nama, nip);
      if (!emailLogin) emailLogin = generated.email;
      if (!passwordLogin) passwordLogin = generated.password;
    }

    // Default Bidang Studi jika kosong
    if (!bidangStudi) {
      bidangStudi = 'Produktif & Kejuruan';
    }

    validGuru.push({
      id: `guru-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
      nip,
      nama,
      telepon,
      emailLogin,
      passwordLogin,
      bidangStudi,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return { validGuru, errors };
}

/**
 * Membaca buffer file ArrayBuffer menggunakan library xlsx
 */
export function parseGuruExcelBuffer(data: ArrayBuffer): ParseGuruResult {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { validGuru: [], errors: [{ row: 1, message: 'File Excel kosong atau tidak memiliki sheet.' }] };
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    return { validGuru: [], errors: [{ row: 1, message: 'Tidak ada baris data ditemukan di dalam sheet.' }] };
  }

  return processRawGuruExcelRows(rawRows);
}

/**
 * Menghasilkan file template Excel (.xlsx) siap pakai untuk diunduh user
 */
export function downloadGuruExcelTemplate(): void {
  const templateData = [
    {
      'NIP / NIK': '19820315 200812 1 001',
      'Nama Guru Pembimbing': 'Dr. Ir. Hendra Kurniawan, M.T.',
      'Telepon': '0812-2345-6789',
      'Email Login': 'hendra.kurniawan@smk.belajar.id',
      'Password Login': 'Guru#Hendra2026',
      'Bidang Keahlian / Mapel': 'Rekayasa Perangkat Lunak & Basis Data',
    },
    {
      'NIP / NIK': '19870520 201012 2 003',
      'Nama Guru Pembimbing': 'Siti Nurhaliza, S.Kom., M.Cs.',
      'Telepon': '0813-8899-7711',
      'Email Login': 'siti.nurhaliza@smk.belajar.id',
      'Password Login': 'Guru#Siti2026',
      'Bidang Keahlian / Mapel': 'Sistem Informasi Jaringan & Keamanan Siber',
    },
    {
      'NIP / NIK': '19791104 200501 1 004',
      'Nama Guru Pembimbing': 'Ahmad Dahlan, S.Pd., M.T.',
      'Telepon': '0812-9988-1122',
      'Email Login': 'ahmad.dahlan@smk.belajar.id',
      'Password Login': 'Guru#Ahmad2026',
      'Bidang Keahlian / Mapel': 'Teknik Jaringan Komputer & Infrastruktur Cloud',
    },
    {
      'NIP / NIK': '19900214 201402 2 002',
      'Nama Guru Pembimbing': 'Dewi Lestari, S.T., M.Kom.',
      'Telepon': '0856-7788-9900',
      'Email Login': 'dewi.lestari@smk.belajar.id',
      'Password Login': 'Guru#Dewi2026',
      'Bidang Keahlian / Mapel': 'Desain Komunikasi Visual & Multimedia',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  // Atur lebar kolom agar rapi dan mudah dibaca
  ws['!cols'] = [
    { wch: 25 }, // NIP / NIK
    { wch: 35 }, // Nama Guru Pembimbing
    { wch: 18 }, // Telepon
    { wch: 32 }, // Email Login
    { wch: 20 }, // Password Login
    { wch: 40 }, // Bidang Keahlian / Mapel
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'MasterGuruPembimbing');

  XLSX.writeFile(wb, 'Template_Master_Guru_Pembimbing_PKL.xlsx');
}
