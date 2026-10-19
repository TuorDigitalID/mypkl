import * as XLSX from 'xlsx';
import type { MasterInstansi } from '../types/index.ts';

export interface ParseInstansiResult {
  validInstansi: MasterInstansi[];
  errors: { row: number; message: string }[];
}

/**
 * Normalisasi nama header agar toleran terhadap spasi, huruf besar/kecil, dan tanda baca dari Excel/CSV
 */
export function normalizeInstansiKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Memvalidasi dan mengonversi baris raw data dari file Excel ke struktur MasterInstansi
 */
export function processRawInstansiExcelRows(rawRows: Record<string, any>[]): ParseInstansiResult {
  const validInstansi: MasterInstansi[] = [];
  const errors: { row: number; message: string }[] = [];
  const seenNames = new Set<string>();

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Mengingat baris 1 adalah header Excel

    // Cari nilai berdasarkan kunci ternormalisasi
    let nama = '';
    let alamat = '';
    let kuotaRaw = '';
    let pembimbingInstansi = '';
    let bidangUsaha = '';
    let kontakPerson = '';
    let email = '';

    for (const [key, value] of Object.entries(row)) {
      const norm = normalizeInstansiKey(key);
      const valStr = value !== undefined && value !== null ? String(value).trim() : '';

      if (
        norm === 'namainstansi' ||
        norm === 'namaperusahaan' ||
        norm === 'instansi' ||
        norm === 'perusahaan' ||
        norm === 'namainstansiperusahaan' ||
        norm === 'instansiperusahaan' ||
        norm === 'namadudi' ||
        norm === 'dudi' ||
        norm === 'mitra' ||
        norm === 'nama'
      ) {
        nama = valStr;
      } else if (
        norm === 'alamatlengkap' ||
        norm === 'alamat' ||
        norm === 'alamatperusahaan' ||
        norm === 'alamatinstansi' ||
        norm === 'lokasi' ||
        norm === 'domisili'
      ) {
        alamat = valStr;
      } else if (
        norm === 'kuotasiswa' ||
        norm === 'kuota' ||
        norm === 'kapasitas' ||
        norm === 'kapasitassiswa' ||
        norm === 'jumlahkuota' ||
        norm === 'slot' ||
        norm === 'kuotapkl'
      ) {
        kuotaRaw = valStr;
      } else if (
        norm === 'namapembimbinginstansi' ||
        norm === 'pembimbinginstansi' ||
        norm === 'pembimbingdudi' ||
        norm === 'namapembimbing' ||
        norm === 'pembimbing' ||
        norm === 'mentor' ||
        norm === 'mentordudi' ||
        norm === 'namamentor'
      ) {
        pembimbingInstansi = valStr;
      } else if (
        norm === 'bidangusaha' ||
        norm === 'bidang' ||
        norm === 'sektor' ||
        norm === 'sektorusaha' ||
        norm === 'industri' ||
        norm === 'kategori'
      ) {
        bidangUsaha = valStr;
      } else if (
        norm === 'kontakperson' ||
        norm === 'kontak' ||
        norm === 'nohp' ||
        norm === 'nomorhp' ||
        norm === 'telepon' ||
        norm === 'notelepon' ||
        norm === 'whatsapp' ||
        norm === 'wa' ||
        norm === 'hp' ||
        norm === 'narahubung'
      ) {
        kontakPerson = valStr;
      } else if (
        norm === 'email' ||
        norm === 'surel' ||
        norm === 'emailinstansi' ||
        norm === 'emailperusahaan' ||
        norm === 'emailresmi'
      ) {
        email = valStr;
      }
    }

    // Abaikan baris kosong total
    if (!nama && !alamat && !kuotaRaw && !pembimbingInstansi) {
      return;
    }

    // Validasi Kolom Wajib 1: Nama Instansi
    if (!nama) {
      errors.push({ row: rowNum, message: 'Kolom Nama Instansi / Perusahaan tidak boleh kosong.' });
      return;
    }

    // Deteksi duplikasi di dalam file yang sama
    const lowerName = nama.toLowerCase();
    if (seenNames.has(lowerName)) {
      errors.push({ row: rowNum, message: `Nama instansi "${nama}" duplikat di dalam file Excel.` });
      return;
    }
    seenNames.add(lowerName);

    // Validasi Kolom Wajib 2: Alamat Lengkap
    if (!alamat) {
      errors.push({ row: rowNum, message: `Instansi "${nama}" belum memiliki Alamat Lengkap.` });
      return;
    }

    // Validasi Kolom Wajib 3: Kuota Siswa (Angka Positif)
    let kuota = 4; // default
    if (kuotaRaw) {
      const parsedKuota = parseInt(kuotaRaw, 10);
      if (isNaN(parsedKuota) || parsedKuota < 1) {
        errors.push({ row: rowNum, message: `Kuota siswa untuk "${nama}" harus berupa angka bulat minimal 1 (ditemukan: "${kuotaRaw}").` });
        return;
      }
      kuota = parsedKuota;
    }

    // Default pembimbing jika kosong
    if (!pembimbingInstansi) {
      pembimbingInstansi = 'Pembimbing DUDI';
    }

    // Default bidang usaha jika kosong
    if (!bidangUsaha) {
      bidangUsaha = 'Umum & Teknologi';
    }

    validInstansi.push({
      id: `inst-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
      nama,
      alamat,
      kuota,
      pembimbingInstansi,
      kontakPerson,
      email,
      bidangUsaha,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return { validInstansi, errors };
}

/**
 * Membaca buffer file ArrayBuffer atau binary string menggunakan library xlsx
 */
export function parseInstansiExcelBuffer(data: ArrayBuffer): ParseInstansiResult {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { validInstansi: [], errors: [{ row: 1, message: 'File Excel kosong atau tidak memiliki sheet.' }] };
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    return { validInstansi: [], errors: [{ row: 1, message: 'Tidak ada baris data ditemukan di dalam sheet.' }] };
  }

  return processRawInstansiExcelRows(rawRows);
}

/**
 * Menghasilkan file template Excel (.xlsx) siap pakai untuk diunduh user
 */
export function downloadInstansiExcelTemplate(): void {
  const templateData = [
    {
      'Nama Instansi / Perusahaan': 'PT Telekomunikasi Indonesia (Telkom Regional)',
      'Alamat Lengkap': 'Jl. Japati No. 1, Sadang Serang, Kecamatan Coblong, Kota Bandung, Jawa Barat 40133',
      'Kuota Siswa': 4,
      'Nama Pembimbing Instansi': 'Bambang Prasetyo, S.T.',
      'Bidang Usaha': 'Telekomunikasi & Jaringan Digital',
      'Kontak Person': '0812-2345-6789',
      'Email Instansi': 'pkl.career@telkom.co.id',
    },
    {
      'Nama Instansi / Perusahaan': 'PT Bank Central Asia Tbk (BCA) - Digital Innovation',
      'Alamat Lengkap': 'Jl. Asia Afrika No. 122-124, Braga, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40111',
      'Kuota Siswa': 3,
      'Nama Pembimbing Instansi': 'Rina Kusuma Dewi, S.Kom.',
      'Bidang Usaha': 'Finansial & Software Engineering',
      'Kontak Person': '0813-8899-7711',
      'Email Instansi': 'internship@bca.co.id',
    },
    {
      'Nama Instansi / Perusahaan': 'Dinas Komunikasi dan Informatika (Diskominfo)',
      'Alamat Lengkap': 'Jl. Tamansari No. 56, Babakan Ciamis, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40117',
      'Kuota Siswa': 5,
      'Nama Pembimbing Instansi': 'Ir. M. Taufik Hidayat, M.Cs.',
      'Bidang Usaha': 'Pemerintahan & Smart City',
      'Kontak Person': '0811-2233-4455',
      'Email Instansi': 'diskominfo@jabarprov.go.id',
    },
    {
      'Nama Instansi / Perusahaan': 'Pixel Visual Media Kreatif',
      'Alamat Lengkap': 'Jl. Riau No. 89, Citarum, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40115',
      'Kuota Siswa': 2,
      'Nama Pembimbing Instansi': 'Fajar Ramadhan, S.Ds.',
      'Bidang Usaha': 'Desain Grafis, Animasi & Multimedia',
      'Kontak Person': '0818-0912-3456',
      'Email Instansi': 'studio@pixelkreatif.com',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  // Atur lebar kolom agar rapi dan mudah dibaca di Excel
  ws['!cols'] = [
    { wch: 45 }, // Nama Instansi / Perusahaan
    { wch: 65 }, // Alamat Lengkap
    { wch: 14 }, // Kuota Siswa
    { wch: 30 }, // Nama Pembimbing Instansi
    { wch: 35 }, // Bidang Usaha
    { wch: 20 }, // Kontak Person
    { wch: 32 }, // Email Instansi
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'MasterInstansi');

  XLSX.writeFile(wb, 'Template_Master_Instansi_Perusahaan_PKL.xlsx');
}
