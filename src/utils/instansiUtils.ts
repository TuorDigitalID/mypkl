import type { MasterInstansi, MasterSiswaPKL, PlottingSiswaPKL } from '../types/index.ts';

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
 * Menggabungkan dan menyinkronkan data dari:
 * 1. Tabel Plotting Siswa PKL (PlottingSiswaPKL)
 * 2. Tabel Master Siswa PKL (MasterSiswaPKL)
 * Otomatis di-deduplikasi berdasarkan NISN sehingga tidak terjadi penghitungan ganda.
 */
export function getSiswaByInstansi(
  siswaList: MasterSiswaPKL[] = [],
  instansi: MasterInstansi,
  plottingList: PlottingSiswaPKL[] = []
): MasterSiswaPKL[] {
  if (!instansi) return [];

  const normTarget = normalizeInstansiName(instansi.nama);
  const matchedMap = new Map<string, MasterSiswaPKL>();

  // 1. Prioritaskan data dari Tabel Plotting Siswa PKL
  if (Array.isArray(plottingList) && plottingList.length > 0) {
    plottingList.forEach((plot) => {
      // Siswa dengan status 'Belum Terplotting' atau tanpa instansi TIDAK dihitung sebagai siswa terisi
      if (!plot.instansiNama || plot.statusPlotting === 'Belum Terplotting') {
        return;
      }

      const normPlotInstansi = normalizeInstansiName(plot.instansiNama);
      const isMatch =
        normPlotInstansi === normTarget ||
        (normTarget.length > 5 && normPlotInstansi.includes(normTarget)) ||
        (normPlotInstansi.length > 5 && normTarget.includes(normPlotInstansi)) ||
        (plot.instansiId && plot.instansiId === instansi.id);

      if (isMatch) {
        const cleanNisn = (plot.nisn || '').replace(/\s+/g, '');
        if (!cleanNisn) return;

        // Cari data lengkap dari master siswa jika tersedia
        const existingSiswa = (siswaList || []).find(
          (s) => (s.nisn || '').replace(/\s+/g, '') === cleanNisn
        );

        const mergedStudent: MasterSiswaPKL = {
          id: existingSiswa?.id || plot.siswaId || plot.id,
          nisn: plot.nisn,
          namaLengkap: plot.namaSiswa || existingSiswa?.namaLengkap || 'Siswa PKL',
          kelas: plot.kelas || existingSiswa?.kelas || '',
          jurusan: plot.jurusan || existingSiswa?.jurusan || '',
          emailLogin:
            existingSiswa?.emailLogin ||
            `${plot.namaSiswa.toLowerCase().replace(/[^a-z0-9]/g, '.')}@smk.belajar.id`,
          passwordLogin: existingSiswa?.passwordLogin || `Pkl#${plot.nisn.slice(-4)}`,
          guruPembimbing: plot.guruNama || existingSiswa?.guruPembimbing || 'Belum Ditentukan',
          guruNip: plot.guruNip || existingSiswa?.guruNip,
          instansiId: instansi.id,
          instansiNama: instansi.nama,
          alamatInstansi: plot.alamatInstansi || instansi.alamat,
          pembimbingInstansi: instansi.pembimbingInstansi,
          periodeMulai: plot.periodeMulai || existingSiswa?.periodeMulai,
          periodeSelesai: plot.periodeSelesai || existingSiswa?.periodeSelesai,
          statusPlotting: plot.statusPlotting || 'Terplotting',
          createdAt: existingSiswa?.createdAt,
        };

        matchedMap.set(cleanNisn, mergedStudent);
      }
    });
  }

  // 2. Periksa data dari Master Siswa PKL (untuk siswa yang belum terpetakan di plottingList)
  if (Array.isArray(siswaList) && siswaList.length > 0) {
    siswaList.forEach((s) => {
      const cleanNisn = (s.nisn || '').replace(/\s+/g, '');
      if (!cleanNisn || matchedMap.has(cleanNisn)) return; // Sudah terhitung dari plotting

      // Jika di tabel plotting siswa ini tercatat sebagai 'Belum Terplotting', jangan hitung terisi
      if (Array.isArray(plottingList) && plottingList.length > 0) {
        const plotMatch = plottingList.find(
          (p) => (p.nisn || '').replace(/\s+/g, '') === cleanNisn
        );
        if (plotMatch) {
          if (plotMatch.statusPlotting === 'Belum Terplotting' || !plotMatch.instansiNama) {
            return;
          }
          const normPlotInst = normalizeInstansiName(plotMatch.instansiNama);
          if (
            normPlotInst !== normTarget &&
            !normPlotInst.includes(normTarget) &&
            !normTarget.includes(normPlotInst)
          ) {
            return;
          }
        }
      }

      // Cek kecocokan di master siswa
      let isMatch = false;
      if (s.instansiId && s.instansiId === instansi.id) {
        isMatch = true;
      } else if (s.instansiNama) {
        const normStudentInstansi = normalizeInstansiName(s.instansiNama);
        if (
          normStudentInstansi === normTarget ||
          (normTarget.length > 5 && normStudentInstansi.includes(normTarget)) ||
          (normStudentInstansi.length > 5 && normTarget.includes(normStudentInstansi))
        ) {
          isMatch = true;
        }
      }

      if (isMatch) {
        matchedMap.set(cleanNisn, {
          ...s,
          instansiId: s.instansiId || instansi.id,
          instansiNama: instansi.nama,
          pembimbingInstansi: s.pembimbingInstansi || instansi.pembimbingInstansi,
        });
      }
    });
  }

  return Array.from(matchedMap.values());
}

/**
 * Menghitung statistik keterisian kuota siswa pada instansi:
 * - Jumlah Siswa Terisi (disinkronkan dari data Plotting Siswa & Master Siswa)
 * - Sisa Kuota (Kuota Siswa - Jumlah Terisi)
 * - Persentase & Status Keterisian
 */
export function calculateInstansiStats(
  instansi: MasterInstansi,
  siswaList: MasterSiswaPKL[] = [],
  plottingList: PlottingSiswaPKL[] = []
): InstansiStats {
  const connectedSiswa = getSiswaByInstansi(siswaList, instansi, plottingList);
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
  siswaList: MasterSiswaPKL[] = [],
  plottingList: PlottingSiswaPKL[] = []
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
    const stats = calculateInstansiStats(instansi, siswaList, plottingList);
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
