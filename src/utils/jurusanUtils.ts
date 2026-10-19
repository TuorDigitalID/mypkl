import type { MasterJurusan, MasterSiswaPKL } from '../types/index.ts';

/**
 * Menghitung jumlah siswa yang terdaftar pada jurusan tertentu
 * Mendukung pencocokan berdasarkan nama lengkap jurusan maupun kode singkatan (e.g. "RPL" / "Rekayasa Perangkat Lunak")
 */
export function countSiswaPerJurusan(
  siswaList: MasterSiswaPKL[],
  jurusan: MasterJurusan
): number {
  if (!siswaList || !jurusan) return 0;
  return getSiswaByJurusan(siswaList, jurusan).length;
}

/**
 * Mengambil daftar siswa yang terhubung dengan suatu jurusan
 */
export function getSiswaByJurusan(
  siswaList: MasterSiswaPKL[],
  jurusan: MasterJurusan
): MasterSiswaPKL[] {
  if (!siswaList || !jurusan) return [];
  const targetNama = jurusan.nama.toLowerCase().trim();
  const targetKode = jurusan.kode.toLowerCase().trim();

  return siswaList.filter((s) => {
    const sJurusan = (s.jurusan || '').toLowerCase().trim();
    return sJurusan === targetNama || sJurusan === targetKode || sJurusan.includes(targetKode) || targetNama.includes(sJurusan);
  });
}

/**
 * Mencari jurusan berdasarkan nama atau kode singkatan
 */
export function findJurusanByNameOrCode(
  jurusanList: MasterJurusan[],
  search: string
): MasterJurusan | undefined {
  if (!search) return undefined;
  const q = search.toLowerCase().trim();
  return jurusanList.find(
    (j) => j.kode.toLowerCase() === q || j.nama.toLowerCase() === q || j.nama.toLowerCase().includes(q)
  );
}

/**
 * Normalisasi input teks jurusan (bisa kode seperti 'RPL' atau nama) menjadi nama resmi jurusan
 */
export function normalizeJurusanInput(
  rawInput: string,
  jurusanList: MasterJurusan[] = []
): string {
  if (!rawInput) return '';
  const match = findJurusanByNameOrCode(jurusanList, rawInput);
  if (match) return match.nama;

  // Fallback kamus standar jika jurusanList belum termuat
  const dict: Record<string, string> = {
    rpl: 'Rekayasa Perangkat Lunak',
    tkj: 'Teknik Komputer & Jaringan',
    sija: 'Sistem Informasi Jaringan & Aplikasi',
    dkv: 'Desain Komunikasi Visual',
    tbsm: 'Teknik & Bisnis Sepeda Motor',
    mplb: 'Manajemen Perkantoran & Layanan Bisnis',
    otkp: 'Manajemen Perkantoran & Layanan Bisnis',
    tkr: 'Teknik Kendaraan Ringan Otomotif',
    tei: 'Teknik Elektronika Industri',
  };

  const key = rawInput.toLowerCase().replace(/[^a-z0-9]/g, '');
  return dict[key] || rawInput.trim();
}

/**
 * Menghasilkan warna badge yang konsisten per jurusan
 */
export function getJurusanColorTheme(kode: string): {
  badge: string;
  pill: string;
  dot: string;
  border: string;
  bgLight: string;
} {
  const norm = kode.toUpperCase().trim();
  switch (norm) {
    case 'RPL':
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        pill: 'bg-blue-100 text-blue-800',
        dot: 'bg-blue-500',
        border: 'border-blue-300',
        bgLight: 'bg-blue-50/50',
      };
    case 'TKJ':
      return {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        pill: 'bg-indigo-100 text-indigo-800',
        dot: 'bg-indigo-500',
        border: 'border-indigo-300',
        bgLight: 'bg-indigo-50/50',
      };
    case 'SIJA':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        pill: 'bg-emerald-100 text-emerald-800',
        dot: 'bg-emerald-500',
        border: 'border-emerald-300',
        bgLight: 'bg-emerald-50/50',
      };
    case 'DKV':
      return {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        pill: 'bg-purple-100 text-purple-800',
        dot: 'bg-purple-500',
        border: 'border-purple-300',
        bgLight: 'bg-purple-50/50',
      };
    case 'TBSM':
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        pill: 'bg-amber-100 text-amber-800',
        dot: 'bg-amber-500',
        border: 'border-amber-300',
        bgLight: 'bg-amber-50/50',
      };
    case 'MPLB':
    case 'OTKP':
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        pill: 'bg-rose-100 text-rose-800',
        dot: 'bg-rose-500',
        border: 'border-rose-300',
        bgLight: 'bg-rose-50/50',
      };
    default:
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        pill: 'bg-slate-200 text-slate-800',
        dot: 'bg-slate-500',
        border: 'border-slate-300',
        bgLight: 'bg-slate-50',
      };
  }
}
