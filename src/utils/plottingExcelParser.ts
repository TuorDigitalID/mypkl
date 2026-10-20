import * as XLSX from 'xlsx';
import type { PlottingSiswaPKL, StatusPlotting } from '../types/index.ts';

export interface ParsePlottingResult {
  validPlotting: PlottingSiswaPKL[];
  errors: { row: number; message: string }[];
}

/**
 * Normalisasi header Excel/CSV agar toleran terhadap variasi spasi, kapitalisasi, dan tanda baca
 */
export function normalizePlottingKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Normalisasi string status plotting ke tipe StatusPlotting standar
 */
export function normalizeStatusPlotting(rawStatus: string, hasInstansi: boolean): StatusPlotting {
  const norm = rawStatus.toLowerCase().trim();
  if (norm.includes('sedang') || norm.includes('aktif') || norm.includes('berjalan')) {
    return 'Sedang PKL';
  }
  if (norm.includes('selesai') || norm.includes('lulus')) {
    return 'Selesai PKL';
  }
  if (norm.includes('belum') || norm.includes('kosong') || norm.includes('unassigned')) {
    return 'Belum Terplotting';
  }
  if (norm.includes('terplotting') || norm.includes('plotted') || norm.includes('ditempatkan') || norm.includes('siap')) {
    return 'Terplotting';
  }

  // Jika tidak disebutkan statusnya:
  return hasInstansi ? 'Terplotting' : 'Belum Terplotting';
}

/**
 * Memvalidasi dan mengonversi baris raw data dari file Excel / CSV ke struktur PlottingSiswaPKL
 */
export function processRawPlottingExcelRows(rawRows: Record<string, any>[]): ParsePlottingResult {
  const validPlotting: PlottingSiswaPKL[] = [];
  const errors: { row: number; message: string }[] = [];
  const seenNisn = new Set<string>();

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Mengingat baris 1 adalah header Excel

    let nisn = '';
    let namaSiswa = '';
    let kelas = '';
    let jurusan = '';
    let instansiNama = '';
    let alamatInstansi = '';
    let guruNama = '';
    let guruNip = '';
    let periodeMulai = '';
    let periodeSelesai = '';
    let rawStatus = '';

    for (const [key, value] of Object.entries(row)) {
      const norm = normalizePlottingKey(key);
      const valStr = value !== undefined && value !== null ? String(value).trim() : '';

      if (
        norm === 'nisn' ||
        norm === 'nis' ||
        norm === 'nomorinduk' ||
        norm === 'noinduk' ||
        norm === 'noidentitas'
      ) {
        nisn = valStr;
      } else if (
        norm === 'namasiswa' ||
        norm === 'nama' ||
        norm === 'namalengkap' ||
        norm === 'siswa' ||
        norm === 'namapeserta'
      ) {
        namaSiswa = valStr;
      } else if (
        norm === 'kelas' ||
        norm === 'rombel' ||
        norm === 'tingkat' ||
        norm === 'kelassiswa'
      ) {
        kelas = valStr;
      } else if (
        norm === 'jurusan' ||
        norm === 'prodi' ||
        norm === 'programkeahlian' ||
        norm === 'kompetensikeahlian' ||
        norm === 'keahlian'
      ) {
        jurusan = valStr;
      } else if (
        norm === 'instansipklpenempatan' ||
        norm === 'instansipkl' ||
        norm === 'instansipenempatan' ||
        norm === 'instansi' ||
        norm === 'dudi' ||
        norm === 'perusahaan' ||
        norm === 'tempatpkl' ||
        norm === 'namadudi' ||
        norm === 'namainstansi' ||
        norm === 'mitradudi'
      ) {
        instansiNama = valStr;
      } else if (
        norm === 'alamatinstansi' ||
        norm === 'alamat' ||
        norm === 'alamatdudi' ||
        norm === 'lokasi' ||
        norm === 'lokasipkl' ||
        norm === 'alamattempatpkl' ||
        norm === 'alamatperusahaan'
      ) {
        alamatInstansi = valStr;
      } else if (
        norm === 'gurupembimbingsekolah' ||
        norm === 'gurupembimbing' ||
        norm === 'namagurupembimbing' ||
        norm === 'pembimbingsekolah' ||
        norm === 'namaguru' ||
        norm === 'guru' ||
        norm === 'pembimbing'
      ) {
        guruNama = valStr;
      } else if (
        norm === 'nipgurupembimbing' ||
        norm === 'nipguru' ||
        norm === 'nip' ||
        norm === 'nik' ||
        norm === 'nikguru' ||
        norm === 'nipnik' ||
        norm === 'nipgurupembimbingsekolah'
      ) {
        guruNip = valStr;
      } else if (
        norm === 'periodemulaipkl' ||
        norm === 'periodemulai' ||
        norm === 'tglmulai' ||
        norm === 'tanggalmulai' ||
        norm === 'mulaipkl' ||
        norm === 'mulai' ||
        norm === 'startdate'
      ) {
        periodeMulai = valStr;
      } else if (
        norm === 'periodeselesaipkl' ||
        norm === 'periodeselesai' ||
        norm === 'tglselesai' ||
        norm === 'tanggalselesai' ||
        norm === 'selesaipkl' ||
        norm === 'selesai' ||
        norm === 'enddate'
      ) {
        periodeSelesai = valStr;
      } else if (
        norm === 'statusplotting' ||
        norm === 'status' ||
        norm === 'statuspenempatan' ||
        norm === 'statuspkl'
      ) {
        rawStatus = valStr;
      }
    }

    // Abaikan baris kosong total
    if (!nisn && !namaSiswa && !instansiNama && !guruNama) {
      return;
    }

    // Validasi Wajib 1: NISN
    if (!nisn) {
      errors.push({ row: rowNum, message: 'Kolom NISN tidak boleh kosong.' });
      return;
    }

    // Validasi Wajib 2: Nama Siswa
    if (!namaSiswa) {
      errors.push({ row: rowNum, message: `Baris dengan NISN ${nisn} belum memiliki Nama Siswa.` });
      return;
    }

    // Cek duplikasi NISN di dalam file
    const cleanNisn = nisn.replace(/\s+/g, '');
    if (seenNisn.has(cleanNisn)) {
      errors.push({ row: rowNum, message: `NISN "${nisn}" duplikat di dalam file Excel.` });
      return;
    }
    seenNisn.add(cleanNisn);

    // Fallbacks
    if (!kelas) kelas = 'XII RPL 1';
    if (!jurusan) jurusan = 'Rekayasa Perangkat Lunak';
    if (!periodeMulai) periodeMulai = '15 Juli 2026';
    if (!periodeSelesai) periodeSelesai = '15 Desember 2026';

    const hasInstansi = Boolean(instansiNama.trim());
    const statusPlotting = normalizeStatusPlotting(rawStatus, hasInstansi);

    validPlotting.push({
      id: `plot-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
      siswaId: `ms-${nisn}`,
      nisn,
      namaSiswa,
      kelas,
      jurusan,
      instansiNama,
      alamatInstansi: alamatInstansi || (hasInstansi ? 'Kota Bandung / Jakarta' : ''),
      guruNama,
      guruNip,
      periodeMulai,
      periodeSelesai,
      statusPlotting,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return { validPlotting, errors };
}

/**
 * Membaca buffer file ArrayBuffer (Excel/CSV)
 */
export function parsePlottingExcelBuffer(data: ArrayBuffer): ParsePlottingResult {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { validPlotting: [], errors: [{ row: 1, message: 'File Excel kosong atau tidak memiliki sheet.' }] };
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    return { validPlotting: [], errors: [{ row: 1, message: 'Tidak ada baris data ditemukan di dalam sheet.' }] };
  }

  return processRawPlottingExcelRows(rawRows);
}

/**
 * Menghasilkan file template Excel (.xlsx) siap pakai untuk diunduh user
 */
export function downloadPlottingExcelTemplate(): void {
  const templateData = [
    {
      'NISN': '0061245678',
      'Nama Siswa': 'Muhammad Rizky Pratama',
      'Kelas': 'XII RPL 1',
      'Jurusan': 'Rekayasa Perangkat Lunak',
      'Instansi PKL (Penempatan)': 'PT Telekomunikasi Indonesia (Telkom Regional)',
      'Alamat Instansi': 'Jl. Japati No. 1, Sadang Serang, Coblong, Kota Bandung, Jawa Barat 40133',
      'Guru Pembimbing Sekolah': 'Dr. Ir. Hendra Kurniawan, M.T.',
      'NIP Guru Pembimbing': '19820315 200812 1 001',
      'Periode Mulai PKL': '15 Juli 2026',
      'Periode Selesai PKL': '15 Desember 2026',
      'Status Plotting': 'Terplotting',
    },
    {
      'NISN': '0062356789',
      'Nama Siswa': 'Anisa Putri Rahmadani',
      'Kelas': 'XII SIJA 2',
      'Jurusan': 'Sistem Informasi Jaringan & Aplikasi',
      'Instansi PKL (Penempatan)': 'PT Bank Central Asia Tbk (BCA) - Digital Lab',
      'Alamat Instansi': 'Menara BCA Grand Indonesia Lt. 32, Jl. M.H. Thamrin No. 1, Jakarta Pusat 10310',
      'Guru Pembimbing Sekolah': 'Siti Nurhaliza, S.Kom., M.Cs.',
      'NIP Guru Pembimbing': '19870520 201012 2 003',
      'Periode Mulai PKL': '15 Juli 2026',
      'Periode Selesai PKL': '15 Desember 2026',
      'Status Plotting': 'Sedang PKL',
    },
    {
      'NISN': '0063467890',
      'Nama Siswa': 'Dimas Arya Pamungkas',
      'Kelas': 'XII TKJ 1',
      'Jurusan': 'Teknik Komputer & Jaringan',
      'Instansi PKL (Penempatan)': 'Dinas Komunikasi & Informatika (Diskominfo)',
      'Alamat Instansi': 'Kompleks Balai Kota Blok G Lt. 3, Jl. Medan Merdeka Selatan No. 8-9, Gambir, Jakarta Pusat',
      'Guru Pembimbing Sekolah': 'Dr. Ir. Hendra Kurniawan, M.T.',
      'NIP Guru Pembimbing': '19820315 200812 1 001',
      'Periode Mulai PKL': '15 Juli 2026',
      'Periode Selesai PKL': '15 Desember 2026',
      'Status Plotting': 'Terplotting',
    },
    {
      'NISN': '0064578901',
      'Nama Siswa': 'Siti Aisyah Nur',
      'Kelas': 'XII DKV 2',
      'Jurusan': 'Desain Komunikasi Visual',
      'Instansi PKL (Penempatan)': 'PT Pixel Visual Media Kreatif',
      'Alamat Instansi': 'Gedung Creative Hub Lt. 4, Jl. Gandaria 1 No. 12, Kebayoran Baru, Jakarta Selatan 12130',
      'Guru Pembimbing Sekolah': 'Siti Nurhaliza, S.Kom., M.Cs.',
      'NIP Guru Pembimbing': '19870520 201012 2 003',
      'Periode Mulai PKL': '15 Juli 2026',
      'Periode Selesai PKL': '15 Desember 2026',
      'Status Plotting': 'Selesai PKL',
    },
    {
      'NISN': '0069923456',
      'Nama Siswa': 'Aditya Pratama Putra',
      'Kelas': 'XII RPL 1',
      'Jurusan': 'Rekayasa Perangkat Lunak',
      'Instansi PKL (Penempatan)': '',
      'Alamat Instansi': '',
      'Guru Pembimbing Sekolah': '',
      'NIP Guru Pembimbing': '',
      'Periode Mulai PKL': '15 Juli 2026',
      'Periode Selesai PKL': '15 Desember 2026',
      'Status Plotting': 'Belum Terplotting',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  // Atur lebar kolom yang proporsional dan mudah dibaca
  ws['!cols'] = [
    { wch: 16 }, // NISN
    { wch: 28 }, // Nama Siswa
    { wch: 14 }, // Kelas
    { wch: 32 }, // Jurusan
    { wch: 42 }, // Instansi PKL (Penempatan)
    { wch: 55 }, // Alamat Instansi
    { wch: 32 }, // Guru Pembimbing Sekolah
    { wch: 24 }, // NIP Guru Pembimbing
    { wch: 20 }, // Periode Mulai PKL
    { wch: 20 }, // Periode Selesai PKL
    { wch: 20 }, // Status Plotting
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PlottingSiswaPKL');

  XLSX.writeFile(wb, 'Template_Plotting_Siswa_PKL.xlsx');
}
