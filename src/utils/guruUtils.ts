import type { MasterGuruPembimbing, MasterSiswaPKL } from '../types/index.ts';

export interface GuruStats {
  jumlahSiswaBimbingan: number;
  siswaBimbinganList: MasterSiswaPKL[];
}

/**
 * Normalisasi string nama guru untuk perbandingan yang toleran terhadap spasi dan gelar
 */
export function normalizeGuruName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Menghitung jumlah dan daftar siswa yang dibimbing oleh Guru Pembimbing
 */
export function calculateGuruStats(
  guru: MasterGuruPembimbing,
  siswaList: MasterSiswaPKL[]
): GuruStats {
  const normGuruNama = normalizeGuruName(guru.nama);

  const siswaBimbinganList = (siswaList || []).filter((s) => {
    if (!s) return false;
    // Cek kecocokan nama atau NIP jika ada
    const normSiswaGuru = normalizeGuruName(s.guruPembimbing);
    return (
      normSiswaGuru === normGuruNama ||
      (normGuruNama.length > 5 && normSiswaGuru.includes(normGuruNama)) ||
      (normSiswaGuru.length > 5 && normGuruNama.includes(normSiswaGuru))
    );
  });

  return {
    jumlahSiswaBimbingan: siswaBimbinganList.length,
    siswaBimbinganList,
  };
}

/**
 * Mencari data guru berdasarkan Nama atau NIP/NIK
 */
export function findGuruByNameOrNip(
  guruList: MasterGuruPembimbing[],
  search: string
): MasterGuruPembimbing | undefined {
  if (!search) return undefined;
  const cleanSearch = search.trim().toLowerCase();
  const normSearch = normalizeGuruName(search);

  return guruList.find((g) => {
    return (
      g.nama.toLowerCase().includes(cleanSearch) ||
      g.nip.replace(/\s+/g, '') === search.replace(/\s+/g, '') ||
      normalizeGuruName(g.nama) === normSearch
    );
  });
}

/**
 * Generate akun email login dan password acak yang aman untuk Guru Pembimbing
 */
export function generateGuruCredentials(nama: string, nip: string): { email: string; password: string } {
  const cleanSlug = nama
    .toLowerCase()
    .replace(/^dr\.\s*|ir\.\s*|dra\.\s*|drs\.\s*/gi, '') // Hilangkan gelar depan
    .split(',')[0] // Hilangkan gelar belakang
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('.')
    .replace(/[^a-z.]/g, '') || 'guru';

  const cleanNip = nip.replace(/[^0-9]/g, '');
  const suffix = cleanNip ? cleanNip.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();

  const email = `${cleanSlug}.${suffix}@smk.belajar.id`;
  const randomChars = ['@', '#', '*', '!'][Math.floor(Math.random() * 4)];
  const randomDigits = Math.floor(10 + Math.random() * 90);
  const password = `Guru${randomChars}${suffix}${randomDigits}`;

  return { email, password };
}

/**
 * Export data master guru pembimbing ke format CSV dengan escape character yang aman
 */
export function generateGuruCSV(
  guruList: MasterGuruPembimbing[],
  siswaList: MasterSiswaPKL[]
): string {
  const headers = [
    'No',
    'NIP / NIK',
    'Nama Guru Pembimbing',
    'Telepon',
    'Email Login',
    'Password Login',
    'Jumlah Siswa Bimbingan',
    'Bidang Keahlian'
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = guruList.map((guru, index) => {
    const stats = calculateGuruStats(guru, siswaList);
    return [
      index + 1,
      escapeCSV(guru.nip),
      escapeCSV(guru.nama),
      escapeCSV(guru.telepon),
      escapeCSV(guru.emailLogin),
      escapeCSV(guru.passwordLogin),
      stats.jumlahSiswaBimbingan,
      escapeCSV(guru.bidangStudi || '-')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
