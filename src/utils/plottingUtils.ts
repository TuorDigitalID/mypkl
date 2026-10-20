import type { PlottingSiswaPKL, StatusPlotting, MasterInstansi, MasterGuruPembimbing } from '../types/index.ts';

export interface PlottingStats {
  totalSiswa: number;
  terplotting: number;
  sedangPkl: number;
  selesaiPkl: number;
  belumTerplotting: number;
  totalTerhubung: number;
  persentaseTerplotting: number;
  totalInstansiAktif: number;
  totalGuruAktif: number;
}

/**
 * Menghitung ringkasan statistik plotting siswa PKL
 */
export function calculatePlottingStats(list: PlottingSiswaPKL[]): PlottingStats {
  const totalSiswa = list.length;
  let terplotting = 0;
  let sedangPkl = 0;
  let selesaiPkl = 0;
  let belumTerplotting = 0;

  const instansiSet = new Set<string>();
  const guruSet = new Set<string>();

  list.forEach((item) => {
    const status = item.statusPlotting || 'Belum Terplotting';
    if (status === 'Terplotting') terplotting++;
    else if (status === 'Sedang PKL') sedangPkl++;
    else if (status === 'Selesai PKL') selesaiPkl++;
    else belumTerplotting++;

    if (item.instansiNama?.trim()) {
      instansiSet.add(item.instansiNama.toLowerCase().trim());
    }
    if (item.guruNama?.trim()) {
      guruSet.add(item.guruNama.toLowerCase().trim());
    }
  });

  const totalTerhubung = terplotting + sedangPkl + selesaiPkl;
  const persentaseTerplotting = totalSiswa > 0 ? Math.round((totalTerhubung / totalSiswa) * 100) : 0;

  return {
    totalSiswa,
    terplotting,
    sedangPkl,
    selesaiPkl,
    belumTerplotting,
    totalTerhubung,
    persentaseTerplotting,
    totalInstansiAktif: instansiSet.size,
    totalGuruAktif: guruSet.size,
  };
}

/**
 * Filter data plotting berdasarkan pencarian dan kategori filter
 */
export function filterPlottingList(
  list: PlottingSiswaPKL[],
  searchTerm: string,
  filterStatus: string,
  filterJurusan: string,
  filterInstansi: string,
  filterGuru: string
): PlottingSiswaPKL[] {
  const term = searchTerm.toLowerCase().trim();

  return list.filter((item) => {
    // Filter Search
    if (term) {
      const matchNisn = item.nisn?.toLowerCase().includes(term);
      const matchNama = item.namaSiswa?.toLowerCase().includes(term);
      const matchKelas = item.kelas?.toLowerCase().includes(term);
      const matchJurusan = item.jurusan?.toLowerCase().includes(term);
      const matchInstansi = item.instansiNama?.toLowerCase().includes(term);
      const matchAlamat = item.alamatInstansi?.toLowerCase().includes(term);
      const matchGuru = item.guruNama?.toLowerCase().includes(term);
      const matchNip = item.guruNip?.toLowerCase().includes(term);

      if (
        !matchNisn &&
        !matchNama &&
        !matchKelas &&
        !matchJurusan &&
        !matchInstansi &&
        !matchAlamat &&
        !matchGuru &&
        !matchNip
      ) {
        return false;
      }
    }

    // Filter Status
    if (filterStatus && filterStatus !== 'semua') {
      if (item.statusPlotting !== filterStatus) return false;
    }

    // Filter Jurusan
    if (filterJurusan && filterJurusan !== 'semua') {
      if (item.jurusan?.toLowerCase().trim() !== filterJurusan.toLowerCase().trim()) return false;
    }

    // Filter Instansi
    if (filterInstansi && filterInstansi !== 'semua') {
      if (item.instansiNama?.toLowerCase().trim() !== filterInstansi.toLowerCase().trim()) return false;
    }

    // Filter Guru
    if (filterGuru && filterGuru !== 'semua') {
      if (item.guruNama?.toLowerCase().trim() !== filterGuru.toLowerCase().trim()) return false;
    }

    return true;
  });
}

/**
 * Menghasilkan file CSV dari data plotting siswa PKL dengan header sesuai instruksi
 */
export function generatePlottingCSV(list: PlottingSiswaPKL[]): string {
  const headers = [
    'NISN',
    'Nama Siswa',
    'Kelas',
    'Jurusan',
    'Instansi PKL (Penempatan)',
    'Alamat Instansi',
    'Guru Pembimbing Sekolah',
    'NIP Guru Pembimbing',
    'Periode Mulai PKL',
    'Periode Selesai PKL',
    'Status Plotting',
  ];

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = list.map((item) => [
    escapeCSV(item.nisn),
    escapeCSV(item.namaSiswa),
    escapeCSV(item.kelas),
    escapeCSV(item.jurusan),
    escapeCSV(item.instansiNama || '-'),
    escapeCSV(item.alamatInstansi || '-'),
    escapeCSV(item.guruNama || '-'),
    escapeCSV(item.guruNip || '-'),
    escapeCSV(item.periodeMulai || '-'),
    escapeCSV(item.periodeSelesai || '-'),
    escapeCSV(item.statusPlotting || 'Belum Terplotting'),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Style badge untuk status plotting
 */
export function getStatusPlottingBadgeConfig(status: StatusPlotting | string): {
  badgeClass: string;
  dotClass: string;
  label: string;
} {
  switch (status) {
    case 'Terplotting':
      return {
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        dotClass: 'bg-emerald-500',
        label: 'Terplotting',
      };
    case 'Sedang PKL':
      return {
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
        dotClass: 'bg-blue-500 animate-pulse',
        label: 'Sedang PKL',
      };
    case 'Selesai PKL':
      return {
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
        dotClass: 'bg-indigo-500',
        label: 'Selesai PKL',
      };
    case 'Belum Terplotting':
    default:
      return {
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
        dotClass: 'bg-amber-500',
        label: 'Belum Terplotting',
      };
  }
}
