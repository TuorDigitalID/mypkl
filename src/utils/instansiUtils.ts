import type { MasterInstansi, MasterSiswaPKL } from '../types/index.ts';

export interface InstansiStats {
  jumlahSiswaTerisi: number;
  sisaKuota: number;
  persentaseTerisi: number;
  isPenuh: boolean;
  statusKeterisian: 'Penuh' | 'Hampir Penuh' | 'Tersedia' | 'Kosong';
}

/**
 * Normalizes company / instansi name for flexible matching
 */
export function normalizeInstansiName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mendapatkan daftar siswa yang terhubung dengan instansi/perusahaan tertentu
 * Mendukung pencocokan via instansiId maupun instansiNama
 */
export function getSiswaByInstansi(
  siswaList: MasterSiswaPKL[],
  instansi: MasterInstansi
): MasterSiswaPKL[] {
  if (!instansi || !siswaList) return [];

  const normTarget = normalizeInstansiName(instansi.nama);

  return siswaList.filter((s) => {
    // 1. Direct ID match
    if (s.instansiId && s.instansiId === instansi.id) {
      return true;
    }
    // 2. Direct Name match
    if (s.instansiNama) {
      const normStudentInstansi = normalizeInstansiName(s.instansiNama);
      if (normStudentInstansi === normTarget) return true;
      if (normTarget.length > 5 && normStudentInstansi.includes(normTarget)) return true;
      if (normStudentInstansi.length > 5 && normTarget.includes(normStudentInstansi)) return true;
    }
    return false;
  });
}

/**
 * Menghitung statistik keterisian kuota siswa pada instansi:
 * - Jumlah Siswa Terisi
 * - Sisa Kuota (Kuota Siswa - Jumlah Terisi)
 * - Persentase & Status Keterisian
 */
export function calculateInstansiStats(
  instansi: MasterInstansi,
  siswaList: MasterSiswaPKL[]
): InstansiStats {
  const connectedSiswa = getSiswaByInstansi(siswaList, instansi);
  const jumlahSiswaTerisi = connectedSiswa.length;
  const kuota = Math.max(0, instansi.kuota || 0);
  const sisaKuota = Math.max(0, kuota - jumlahSiswaTerisi);
  const persentaseTerisi = kuota > 0 ? Math.min(100, Math.round((jumlahSiswaTerisi / kuota) * 100)) : 0;
  const isPenuh = jumlahSiswaTerisi >= kuota && kuota > 0;

  let statusKeterisian: InstansiStats['statusKeterisian'] = 'Tersedia';
  if (jumlahSiswaTerisi === 0) {
    statusKeterisian = 'Kosong';
  } else if (isPenuh) {
    statusKeterisian = 'Penuh';
  } else if (sisaKuota === 1 || persentaseTerisi >= 75) {
    statusKeterisian = 'Hampir Penuh';
  }

  return {
    jumlahSiswaTerisi,
    sisaKuota,
    persentaseTerisi,
    isPenuh,
    statusKeterisian,
  };
}

/**
 * Mencari data instansi dari daftar berdasarkan ID atau Nama
 */
export function findInstansiByName(
  instansiList: MasterInstansi[],
  nameOrId: string
): MasterInstansi | undefined {
  if (!nameOrId || !instansiList) return undefined;
  const target = normalizeInstansiName(nameOrId);

  return instansiList.find((item) => {
    if (item.id === nameOrId) return true;
    const itemNorm = normalizeInstansiName(item.nama);
    return itemNorm === target || itemNorm.includes(target) || target.includes(itemNorm);
  });
}

/**
 * Generate CSV text untuk ekspor Data Master Instansi / Perusahaan
 * Berisi kolom-kolom persis sesuai format yang diminta:
 * Nama Instansi / Perusahaan, Alamat Lengkap, Kuota Siswa, Jumlah Siswa Terisi, Sisa Kuota, Nama Pembimbing Instansi
 */
export function generateInstansiCSV(
  instansiList: MasterInstansi[],
  siswaList: MasterSiswaPKL[]
): string {
  const headers = [
    'No',
    'Nama Instansi / Perusahaan',
    'Alamat Lengkap',
    'Kuota Siswa',
    'Jumlah Siswa Terisi',
    'Sisa Kuota',
    'Nama Pembimbing Instansi',
    'Bidang Usaha',
    'Kontak Person',
    'Email DUDI',
    'Status'
  ];

  const escapeCSV = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = instansiList.map((instansi, idx) => {
    const stats = calculateInstansiStats(instansi, siswaList);
    return [
      idx + 1,
      escapeCSV(instansi.nama),
      escapeCSV(instansi.alamat),
      instansi.kuota,
      stats.jumlahSiswaTerisi,
      stats.sisaKuota,
      escapeCSV(instansi.pembimbingInstansi),
      escapeCSV(instansi.bidangUsaha || '-'),
      escapeCSV(instansi.kontakPerson || '-'),
      escapeCSV(instansi.email || '-'),
      instansi.isActive ? 'Aktif' : 'Non-Aktif'
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
