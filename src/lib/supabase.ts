import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { 
  MahasiswaSidang, 
  PenilaianPenguji, 
  SupabaseConfig, 
  MasterSiswaPKL, 
  MasterJurusan, 
  MasterInstansi, 
  MasterGuruPembimbing, 
  PlottingSiswaPKL,
  Penguji,
  AuthUser,
  PasanganPengujiRuangan
} from '../types/index.ts';
import { INITIAL_MASTER_JURUSAN } from '../data/jurusan.ts';
import { INITIAL_MASTER_INSTANSI } from '../data/instansi.ts';
import { INITIAL_MASTER_GURU } from '../data/guruPembimbing.ts';
import { INITIAL_PLOTTING_SISWA } from '../data/plotting.ts';
import { DAFTAR_PENGUJI } from '../data/penguji.ts';

const STORAGE_KEY_SUPABASE = 'my_pkl_supabase_config';
const STORAGE_KEY_PESERTA = 'my_pkl_peserta_sidang';
const STORAGE_KEY_PENILAIAN = 'my_pkl_penilaian_sidang';
const STORAGE_KEY_MASTER_SISWA = 'my_pkl_master_siswa';
const STORAGE_KEY_MASTER_JURUSAN = 'my_pkl_master_jurusan';
const STORAGE_KEY_MASTER_INSTANSI = 'my_pkl_master_instansi';
const STORAGE_KEY_MASTER_GURU = 'my_pkl_master_guru';
const STORAGE_KEY_PLOTTING = 'my_pkl_plotting_siswa';
const STORAGE_KEY_PENGUJI = 'my_pkl_daftar_penguji';
const STORAGE_KEY_ROOM_PAIRINGS = 'my_pkl_room_pairings';
const STORAGE_KEY_AUTH = 'my_pkl_current_auth';

// Initial Seed Data for immediate high-fidelity testing
export const INITIAL_PESERTA: MahasiswaSidang[] = [
  {
    id: 'm1',
    nim: '220101045',
    nama: 'Muhammad Rizky Pratama',
    prodi: 'Teknik Informatika (RPL)',
    kelas: 'TI-3A',
    perusahaan: 'PT Telekomunikasi Indonesia (Telkom Regional)',
    judulLaporan: 'Implementasi RESTful API & Real-time Monitoring Jaringan Berbasis Docker di Divisi Network Engineering',
    pembimbingDudi: 'Bambang Prasetyo, S.T.',
    pembimbingSekolah: 'Dr. Ir. Hendra Kurniawan, M.T.',
    jadwalSidang: '2026-10-19T08:30:00',
    ruangan: 'Ruang Sidang Utama A-201',
    status: 'berlangsung',
  },
  {
    id: 'm2',
    nim: '220101052',
    nama: 'Anisa Putri Rahmadani',
    prodi: 'Sistem Informasi Industri',
    kelas: 'SI-3B',
    perusahaan: 'PT Bank Central Asia Tbk (BCA) - Digital Lab',
    judulLaporan: 'Rancang Bangun Modul Verifikasi Dokumen KYC Otomatis Menggunakan Python & Optical Character Recognition',
    pembimbingDudi: 'Hendra Wijaya, M.Kom.',
    pembimbingSekolah: 'Siti Nurhaliza, S.Kom., M.Cs.',
    jadwalSidang: '2026-10-19T09:30:00',
    ruangan: 'Ruang Sidang Utama A-201',
    status: 'menunggu',
  },
  {
    id: 'm3',
    nim: '220101019',
    nama: 'Dimas Arya Pamungkas',
    prodi: 'Teknik Komputer & Jaringan',
    kelas: 'TKJ-3A',
    perusahaan: 'Dinas Komunikasi & Informatika (Diskominfo)',
    judulLaporan: 'Konfigurasi Firewall Mikrotik & Segmentasi VLAN untuk Keamanan Data Server Pemerintahan Daerah',
    pembimbingDudi: 'Agus Setiawan, S.Kom.',
    pembimbingSekolah: 'Dr. Ir. Hendra Kurniawan, M.T.',
    jadwalSidang: '2026-10-19T10:30:00',
    ruangan: 'Ruang Sidang Utama A-201',
    status: 'menunggu',
  },
  {
    id: 'm4',
    nim: '220101088',
    nama: 'Siti Aisyah Nur',
    prodi: 'Desain Komunikasi Visual & Multimedia',
    kelas: 'DKV-3C',
    perusahaan: 'PT Pixel Visual Media Kreatif',
    judulLaporan: 'UI/UX Redesign Landing Page Platform E-Commerce Berdasarkan User Journey Mapping & Heuristic Evaluation',
    pembimbingDudi: 'Maya Indah, S.Ds.',
    pembimbingSekolah: 'Siti Nurhaliza, S.Kom., M.Cs.',
    jadwalSidang: '2026-10-18T13:00:00',
    ruangan: 'Ruang Multimedia B-102',
    status: 'selesai',
  },
  {
    id: 'm5',
    nim: '220101031',
    nama: 'Farhan Maulana',
    prodi: 'Teknik Informatika (RPL)',
    kelas: 'TI-3B',
    perusahaan: 'PT Tokopedia / GoTo Group',
    judulLaporan: 'Optimasi Query Database PostgreSQL dan Caching Redis pada Layanan Keranjang Belanja',
    pembimbingDudi: 'Kevin Sanjaya, S.T.',
    pembimbingSekolah: 'Dr. Ir. Hendra Kurniawan, M.T.',
    jadwalSidang: '2026-10-19T13:30:00',
    ruangan: 'Ruang Sidang Utama A-201',
    status: 'menunggu',
  },
  {
    id: 'm6',
    nim: '220101067',
    nama: 'Nadia Zahrani',
    prodi: 'Keamanan Siber & Jaringan',
    kelas: 'KS-3A',
    perusahaan: 'Badan Siber dan Sandi Negara (BSSN)',
    judulLaporan: 'Analisis Kerentanan Website Institusi Publik Menggunakan OWASP ZAP & Rekomendasi Remediasi Bug',
    pembimbingDudi: 'Letkol R. Santoso, M.T.',
    pembimbingSekolah: 'Siti Nurhaliza, S.Kom., M.Cs.',
    jadwalSidang: '2026-10-19T14:30:00',
    ruangan: 'Ruang Sidang Utama A-201',
    status: 'menunggu',
  },
  {
    id: 'm7',
    nim: '220101089',
    nama: 'Dewi Lestari Anggraeni',
    prodi: 'Desain Komunikasi Visual & Multimedia',
    kelas: 'DKV-3A',
    perusahaan: 'PT Telekomunikasi Indonesia (Telkom Regional)',
    judulLaporan: 'Desain UI/UX Design System & Grafis Promosi Produk Telkom IndiHome Enterprise',
    pembimbingDudi: 'Bambang Prasetyo, S.T.',
    pembimbingSekolah: 'Dr. Ir. Hendra Kurniawan, M.T.',
    jadwalSidang: '2026-10-19T08:30:00',
    ruangan: 'Ruang Sidang Utama A-201',
    status: 'menunggu',
  },
  {
    id: 'm8',
    nim: '220101072',
    nama: 'Fajar Nugraha',
    prodi: 'Sistem Informasi Industri',
    kelas: 'SI-3B',
    perusahaan: 'PT Bank Central Asia Tbk (BCA) - Digital Lab',
    judulLaporan: 'Pengembangan Dashboard Fraud Analytics Real-Time Menggunakan Apache Kafka & Streamlit',
    pembimbingDudi: 'Hendra Wijaya, M.Kom.',
    pembimbingSekolah: 'Siti Nurhaliza, S.Kom., M.Cs.',
    jadwalSidang: '2026-10-19T09:30:00',
    ruangan: 'Ruang Sidang Utama A-201',
    status: 'menunggu',
  },
  {
    id: 'm9',
    nim: '220101034',
    nama: 'Bagus Tri Wicaksono',
    prodi: 'Teknik Komputer & Jaringan',
    kelas: 'TKJ-3A',
    perusahaan: 'Dinas Komunikasi & Informatika (Diskominfo)',
    judulLaporan: 'Implementasi Bandwidth Management & Monitoring Router Core Menggunakan Zabbix & Telegram Bot',
    pembimbingDudi: 'Agus Setiawan, S.Kom.',
    pembimbingSekolah: 'Dr. Ir. Hendra Kurniawan, M.T.',
    jadwalSidang: '2026-10-19T10:30:00',
    ruangan: 'Ruang Sidang Utama A-201',
    status: 'menunggu',
  },
];

export const INITIAL_PENILAIAN: PenilaianPenguji[] = [
  // Contoh penilaian yang sudah masuk untuk Siti Aisyah (m4) yang sudah selesai
  {
    id: 'pen-m4-p1',
    mahasiswaId: 'm4',
    pengujiId: 'p1',
    pengujiNama: 'Dr. Ir. Hendra Kurniawan, M.T.',
    pengujiPeran: 'Penguji 1 (Ketua)',
    nilaiItems: [
      { kriteriaId: 'k1_agenda_disiplin', skor: 88 },
      { kriteriaId: 'k2_agenda_kerjasama', skor: 90 },
      { kriteriaId: 'k3_agenda_inisiatif', skor: 92 },
      { kriteriaId: 'k4_agenda_tanggungjawab', skor: 86 },
      { kriteriaId: 'k5_agenda_kebersihan', skor: 90 },
      { kriteriaId: 'k6_sidang_presentasi', skor: 92 },
      { kriteriaId: 'k7_sidang_tanyajawab', skor: 88 },
    ],
    subtotalAgenda: 89.2,
    subtotalSidang: 90.0,
    totalNilai: 89.6,
    nilaiHuruf: 'A',
    catatanRevisi: 'Penyajian portofolio desain sangat baik. Tambahkan penjelasan uji usability test pada Bab 4.',
    rekomendasiStatus: 'Lulus',
    isDraft: false,
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'pen-m4-p2',
    mahasiswaId: 'm4',
    pengujiId: 'p2',
    pengujiNama: 'Siti Nurhaliza, S.Kom., M.Cs.',
    pengujiPeran: 'Penguji 2 (Sekretaris)',
    nilaiItems: [
      { kriteriaId: 'k1_agenda_disiplin', skor: 85 },
      { kriteriaId: 'k2_agenda_kerjasama', skor: 88 },
      { kriteriaId: 'k3_agenda_inisiatif', skor: 85 },
      { kriteriaId: 'k4_agenda_tanggungjawab', skor: 88 },
      { kriteriaId: 'k5_agenda_kebersihan', skor: 84 },
      { kriteriaId: 'k6_sidang_presentasi', skor: 90 },
      { kriteriaId: 'k7_sidang_tanyajawab', skor: 86 },
    ],
    subtotalAgenda: 86.0,
    subtotalSidang: 88.0,
    totalNilai: 87.0,
    nilaiHuruf: 'A',
    catatanRevisi: 'Format sitasi daftar pustaka agar diselaraskan dengan gaya APA 7th edition.',
    rekomendasiStatus: 'Lulus dengan Revisi',
    isDraft: false,
    updatedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
  },
  {
    id: 'pen-m4-p3',
    mahasiswaId: 'm4',
    pengujiId: 'p3',
    pengujiNama: 'Bambang Prasetyo, S.T.',
    pengujiPeran: 'Penguji 3 (Anggota)',
    nilaiItems: [
      { kriteriaId: 'k1_agenda_disiplin', skor: 90 },
      { kriteriaId: 'k2_agenda_kerjasama', skor: 94 },
      { kriteriaId: 'k3_agenda_inisiatif', skor: 88 },
      { kriteriaId: 'k4_agenda_tanggungjawab', skor: 90 },
      { kriteriaId: 'k5_agenda_kebersihan', skor: 92 },
      { kriteriaId: 'k6_sidang_presentasi', skor: 90 },
      { kriteriaId: 'k7_sidang_tanyajawab', skor: 92 },
    ],
    subtotalAgenda: 90.8,
    subtotalSidang: 91.0,
    totalNilai: 90.9,
    nilaiHuruf: 'A',
    catatanRevisi: 'Hasil desain di industri sudah diadopsi dan diimplementasikan. Sangat memuaskan.',
    rekomendasiStatus: 'Lulus',
    isDraft: false,
    updatedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  // Muhammad Rizky (m1) sedang berlangsung, penguji 1 sudah memasukkan nilai
  {
    id: 'pen-m1-p1',
    mahasiswaId: 'm1',
    pengujiId: 'p1',
    pengujiNama: 'Dr. Ir. Hendra Kurniawan, M.T.',
    pengujiPeran: 'Penguji 1 (Ketua)',
    nilaiItems: [
      { kriteriaId: 'k1_agenda_disiplin', skor: 85 },
      { kriteriaId: 'k2_agenda_kerjasama', skor: 90 },
      { kriteriaId: 'k3_agenda_inisiatif', skor: 85 },
      { kriteriaId: 'k4_agenda_tanggungjawab', skor: 85 },
      { kriteriaId: 'k5_agenda_kebersihan', skor: 85 },
      { kriteriaId: 'k6_sidang_presentasi', skor: 86 },
      { kriteriaId: 'k7_sidang_tanyajawab', skor: 84 },
    ],
    subtotalAgenda: 86.0,
    subtotalSidang: 85.0,
    totalNilai: 85.5,
    nilaiHuruf: 'A',
    catatanRevisi: 'Diagram arsitektur Docker Compose harap diperjelas mapping port-nya.',
    rekomendasiStatus: 'Lulus dengan Revisi',
    isDraft: false,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_MASTER_SISWA: MasterSiswaPKL[] = [
  {
    id: 'ms-1',
    nisn: '0061245678',
    namaLengkap: 'Muhammad Rizky Pratama',
    kelas: 'XII RPL 1',
    jurusan: 'Rekayasa Perangkat Lunak',
    emailLogin: 'rizky.pratama@smk.belajar.id',
    passwordLogin: 'Pkl#Rizky2026',
    guruPembimbing: 'Dr. Ir. Hendra Kurniawan, M.T.',
    instansiId: 'inst-1',
    instansiNama: 'PT Telekomunikasi Indonesia (Telkom Regional)',
    pembimbingInstansi: 'Bambang Prasetyo, S.T.',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ms-2',
    nisn: '0062356789',
    namaLengkap: 'Anisa Putri Rahmadani',
    kelas: 'XII SIJA 2',
    jurusan: 'Sistem Informasi Jaringan & Aplikasi',
    emailLogin: 'anisa.putri@smk.belajar.id',
    passwordLogin: 'Siswa*Anisa88',
    guruPembimbing: 'Siti Nurhaliza, S.Kom., M.Cs.',
    instansiId: 'inst-2',
    instansiNama: 'PT Bank Central Asia Tbk (BCA) - Digital Lab',
    pembimbingInstansi: 'Hendra Wijaya, M.Kom.',
    createdAt: '2026-08-01T08:15:00Z',
  },
  {
    id: 'ms-3',
    nisn: '0063467890',
    namaLengkap: 'Dimas Arya Pamungkas',
    kelas: 'XII TKJ 1',
    jurusan: 'Teknik Komputer & Jaringan',
    emailLogin: 'dimas.arya@smk.belajar.id',
    passwordLogin: 'Dimas#Pkl992',
    guruPembimbing: 'Dr. Ir. Hendra Kurniawan, M.T.',
    instansiId: 'inst-3',
    instansiNama: 'Dinas Komunikasi & Informatika (Diskominfo)',
    pembimbingInstansi: 'Agus Setiawan, S.Kom.',
    createdAt: '2026-08-01T08:30:00Z',
  },
  {
    id: 'ms-4',
    nisn: '0064578901',
    namaLengkap: 'Siti Aisyah Nur',
    kelas: 'XII DKV 2',
    jurusan: 'Desain Komunikasi Visual',
    emailLogin: 'siti.aisyah@smk.belajar.id',
    passwordLogin: 'Dkv*Aisyah2026',
    guruPembimbing: 'Siti Nurhaliza, S.Kom., M.Cs.',
    instansiId: 'inst-4',
    instansiNama: 'PT Pixel Visual Media Kreatif',
    pembimbingInstansi: 'Maya Indah, S.Ds.',
    createdAt: '2026-08-01T08:45:00Z',
  },
  {
    id: 'ms-5',
    nisn: '0065689012',
    namaLengkap: 'Farhan Maulana',
    kelas: 'XII RPL 2',
    jurusan: 'Rekayasa Perangkat Lunak',
    emailLogin: 'farhan.maulana@smk.belajar.id',
    passwordLogin: 'Pkl#Farhan401',
    guruPembimbing: 'Dr. Ir. Hendra Kurniawan, M.T.',
    instansiId: 'inst-5',
    instansiNama: 'PT Tokopedia / GoTo Group',
    pembimbingInstansi: 'Kevin Sanjaya, S.T.',
    createdAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'ms-6',
    nisn: '0066790123',
    namaLengkap: 'Nadia Zahrani',
    kelas: 'XII SIJA 1',
    jurusan: 'Sistem Informasi Jaringan & Aplikasi',
    emailLogin: 'nadia.zahrani@smk.belajar.id',
    passwordLogin: 'Pass*Nadia77',
    guruPembimbing: 'Siti Nurhaliza, S.Kom., M.Cs.',
    instansiId: 'inst-6',
    instansiNama: 'Badan Siber dan Sandi Negara (BSSN)',
    pembimbingInstansi: 'Letkol R. Santoso, M.T.',
    createdAt: '2026-08-01T09:15:00Z',
  },
  {
    id: 'ms-7',
    nisn: '0067801234',
    namaLengkap: 'Bagus Tri Wicaksono',
    kelas: 'XII TKJ 2',
    jurusan: 'Teknik Komputer & Jaringan',
    emailLogin: 'bagus.wicaksono@smk.belajar.id',
    passwordLogin: 'Bagus#Tkj2026',
    guruPembimbing: 'Dr. Ir. Hendra Kurniawan, M.T.',
    instansiId: 'inst-3',
    instansiNama: 'Dinas Komunikasi & Informatika (Diskominfo)',
    pembimbingInstansi: 'Agus Setiawan, S.Kom.',
    createdAt: '2026-08-01T09:30:00Z',
  },
  {
    id: 'ms-8',
    nisn: '0068912345',
    namaLengkap: 'Dewi Lestari Anggraeni',
    kelas: 'XII DKV 1',
    jurusan: 'Desain Komunikasi Visual',
    emailLogin: 'dewi.lestari@smk.belajar.id',
    passwordLogin: 'Dewi*Dkv892',
    guruPembimbing: 'Siti Nurhaliza, S.Kom., M.Cs.',
    instansiId: 'inst-1',
    instansiNama: 'PT Telekomunikasi Indonesia (Telkom Regional)',
    pembimbingInstansi: 'Bambang Prasetyo, S.T.',
    createdAt: '2026-08-01T09:45:00Z',
  },
];

let cachedSupabaseClient: SupabaseClient | null = null;
let broadcastChannel: BroadcastChannel | null = null;

// Realtime cross-tab broadcast channel
function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('my_pkl_realtime_sync');
  }
  return broadcastChannel;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || '';

  if (typeof window === 'undefined') {
    return {
      url: envUrl,
      anonKey: envKey,
      tableNameSidang: 'peserta_sidang',
      tableNameNilai: 'penilaian_sidang',
      isConnected: Boolean(envUrl && envKey),
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY_SUPABASE);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const url = parsed.url || envUrl;
      const anonKey = parsed.anonKey || envKey;
      return {
        url,
        anonKey,
        tableNameSidang: parsed.tableNameSidang || 'peserta_sidang',
        tableNameNilai: parsed.tableNameNilai || 'penilaian_sidang',
        isConnected: Boolean(url && anonKey),
      };
    } catch {
      // ignore
    }
  }

  return {
    url: envUrl,
    anonKey: envKey,
    tableNameSidang: 'peserta_sidang',
    tableNameNilai: 'penilaian_sidang',
    isConnected: Boolean(envUrl && envKey),
  };
}

export function saveSupabaseConfig(config: Partial<SupabaseConfig>): void {
  const current = getSupabaseConfig();
  const updated: SupabaseConfig = {
    ...current,
    ...config,
    isConnected: Boolean((config.url || current.url) && (config.anonKey || current.anonKey)),
  };
  localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(updated));
  cachedSupabaseClient = null; // reset client to reinit
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  if (!cachedSupabaseClient) {
    try {
      cachedSupabaseClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to init Supabase client:', e);
      return null;
    }
  }
  return cachedSupabaseClient;
}

/**
 * Load Peserta Sidang: prioritizes Supabase if connected, falls back to LocalStorage
 */
export async function getPesertaSidangList(): Promise<MahasiswaSidang[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const config = getSupabaseConfig();
      const { data, error } = await client
        .from(config.tableNameSidang)
        .select('*')
        .order('jadwal_sidang', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          nim: d.nim,
          nama: d.nama,
          prodi: d.prodi,
          kelas: d.kelas,
          perusahaan: d.perusahaan,
          judulLaporan: d.judul_laporan,
          pembimbingDudi: d.pembimbing_dudi,
          pembimbingSekolah: d.pembimbing_sekolah,
          jadwalSidang: d.jadwal_sidang,
          ruangan: d.ruangan,
          status: d.status,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch peserta error, falling back to local store:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_PESERTA);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    // initialize default
    localStorage.setItem(STORAGE_KEY_PESERTA, JSON.stringify(INITIAL_PESERTA));
  }

  return INITIAL_PESERTA;
}

/**
 * Save / Update Peserta Sidang
 */
export async function savePesertaSidang(peserta: MahasiswaSidang): Promise<MahasiswaSidang[]> {
  const currentList = await getPesertaSidangList();
  const existingIdx = currentList.findIndex((p) => p.id === peserta.id);
  let updatedList: MahasiswaSidang[];

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = peserta;
  } else {
    updatedList = [peserta, ...currentList];
  }

  // Save to local storage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PESERTA, JSON.stringify(updatedList));
  }

  // Broadcast to other tabs/windows
  broadcastRealtimeChange({
    type: 'PESERTA_UPDATED',
    payload: peserta,
  });

  // Try saving to Supabase if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      const config = getSupabaseConfig();
      await client.from(config.tableNameSidang).upsert({
        id: peserta.id,
        nim: peserta.nim,
        nama: peserta.nama,
        prodi: peserta.prodi,
        kelas: peserta.kelas,
        perusahaan: peserta.perusahaan,
        judul_laporan: peserta.judulLaporan,
        pembimbing_dudi: peserta.pembimbingDudi,
        pembimbing_sekolah: peserta.pembimbingSekolah,
        jadwal_sidang: peserta.jadwalSidang,
        ruangan: peserta.ruangan,
        status: peserta.status,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase upsert error:', err);
    }
  }

  return updatedList;
}

/**
 * Sinkronisasi Antrean Peserta Sidang dari Tabel Plotting Siswa per Perusahaan
 * Memastikan data antrean sidang dan ruang sidang live 100% sama dan selalu update dari database
 */
export async function syncPesertaFromPlotting(
  plottingList: PlottingSiswaPKL[],
  basePesertaList?: MahasiswaSidang[]
): Promise<MahasiswaSidang[]> {
  const currentList = basePesertaList && basePesertaList.length > 0 ? basePesertaList : await getPesertaSidangList();
  const validPlots = plottingList.filter((p) => p.instansiNama && p.instansiNama.trim() !== '');

  if (validPlots.length === 0) {
    return currentList;
  }

  // Bangun daftar peserta yang bersumber langsung dari plotting per perusahaan
  const result: MahasiswaSidang[] = [];

  for (const plot of validPlots) {
    const cleanNisn = (plot.nisn || '').replace(/\s+/g, '');
    const existing = currentList.find(
      (p) => (p.nim && p.nim.replace(/\s+/g, '') === cleanNisn) ||
             p.nama.toLowerCase().trim() === plot.namaSiswa.toLowerCase().trim()
    );

    if (existing) {
      result.push({
        ...existing,
        nim: plot.nisn || existing.nim,
        nama: plot.namaSiswa || existing.nama,
        kelas: plot.kelas || existing.kelas,
        prodi: plot.jurusan || existing.prodi,
        perusahaan: plot.instansiNama,
        pembimbingDudi: plot.pembimbingInstansi || existing.pembimbingDudi || 'Pembimbing Lapangan DUDI',
        pembimbingSekolah: plot.guruNama || existing.pembimbingSekolah || 'Dr. Ir. Hendra Kurniawan, M.T.',
        judulLaporan: existing.judulLaporan || `Laporan Praktik Kerja Lapangan di ${plot.instansiNama}`,
        jadwalSidang: existing.jadwalSidang || '2026-10-19T08:30:00',
        ruangan: existing.ruangan || 'Ruang Sidang Utama A-201',
        status: existing.status || 'menunggu',
      });
    } else {
      result.push({
        id: isValidUUID(plot.id) ? plot.id : `m-${cleanNisn || Date.now()}`,
        nim: plot.nisn || `NIM-${Math.floor(100000 + Math.random() * 900000)}`,
        nama: plot.namaSiswa,
        prodi: plot.jurusan || 'Teknik Informatika (RPL)',
        kelas: plot.kelas || 'XII RPL',
        perusahaan: plot.instansiNama,
        judulLaporan: `Laporan Praktik Kerja Lapangan di ${plot.instansiNama}`,
        pembimbingDudi: plot.pembimbingInstansi || 'Pembimbing Lapangan DUDI',
        pembimbingSekolah: plot.guruNama || 'Dr. Ir. Hendra Kurniawan, M.T.',
        jadwalSidang: '2026-10-19T08:30:00',
        ruangan: 'Ruang Sidang Utama A-201',
        status: 'menunggu',
      });
    }
  }

  // Simpan ke local storage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PESERTA, JSON.stringify(result));
  }

  // Simpan ke Supabase jika terhubung agar database peserta_sidang selalu sinkron dengan plotting_siswa_pkl
  const client = getSupabaseClient();
  if (client) {
    try {
      const config = getSupabaseConfig();
      const recordsToUpsert = result.map((p) => {
        const rec: any = {
          nim: p.nim,
          nama: p.nama,
          prodi: p.prodi,
          kelas: p.kelas,
          perusahaan: p.perusahaan,
          judul_laporan: p.judulLaporan,
          pembimbing_dudi: p.pembimbingDudi,
          pembimbing_sekolah: p.pembimbingSekolah,
          jadwal_sidang: p.jadwalSidang,
          ruangan: p.ruangan,
          status: p.status,
          updated_at: new Date().toISOString(),
        };
        if (isValidUUID(p.id)) {
          rec.id = p.id;
        }
        return rec;
      });
      await client.from(config.tableNameSidang).upsert(recordsToUpsert, { onConflict: 'nim' });
    } catch (supaErr) {
      console.warn('Sync peserta_sidang to Supabase error:', supaErr);
    }
  }

  broadcastRealtimeChange({
    type: 'PESERTA_UPDATED',
    payload: result,
  });

  return result;
}

/**
 * Load Penilaian Penguji
 */
export async function getPenilaianList(): Promise<PenilaianPenguji[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const config = getSupabaseConfig();
      const { data, error } = await client
        .from(config.tableNameNilai)
        .select('*');

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          mahasiswaId: d.mahasiswa_id,
          pengujiId: d.penguji_id,
          pengujiNama: d.penguji_nama,
          pengujiPeran: d.penguji_peran,
          nilaiItems: d.nilai_items || [],
          subtotalAgenda: d.subtotal_agenda !== null && d.subtotal_agenda !== undefined ? Number(d.subtotal_agenda) : undefined,
          subtotalSidang: d.subtotal_sidang !== null && d.subtotal_sidang !== undefined ? Number(d.subtotal_sidang) : undefined,
          totalNilai: Number(d.total_nilai) || 0,
          nilaiHuruf: d.nilai_huruf,
          catatanRevisi: d.catatan_revisi || '',
          rekomendasiStatus: d.rekomendasi_status,
          isDraft: Boolean(d.is_draft),
          updatedAt: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch penilaian error, falling back to local store:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_PENILAIAN);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    // initialize default
    localStorage.setItem(STORAGE_KEY_PENILAIAN, JSON.stringify(INITIAL_PENILAIAN));
  }

  return INITIAL_PENILAIAN;
}

/**
 * Save / Update Penilaian from an Examiner (Online Sync & Real-Time)
 */
export async function savePenilaian(penilaian: PenilaianPenguji): Promise<PenilaianPenguji[]> {
  const currentList = await getPenilaianList();
  const existingIdx = currentList.findIndex(
    (p) => p.mahasiswaId === penilaian.mahasiswaId && p.pengujiId === penilaian.pengujiId
  );

  let updatedList: PenilaianPenguji[];
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = penilaian;
  } else {
    updatedList = [...currentList, penilaian];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PENILAIAN, JSON.stringify(updatedList));
  }

  // Update status peserta sidang jika nilai sudah masuk
  try {
    const currentPeserta = await getPesertaSidangList();
    const pIdx = currentPeserta.findIndex((p) => p.id === penilaian.mahasiswaId || p.nim === penilaian.mahasiswaId);
    if (pIdx >= 0) {
      const targetPeserta = currentPeserta[pIdx];
      const otherEval = updatedList.find(
        (p) => (p.mahasiswaId === penilaian.mahasiswaId || p.mahasiswaId === targetPeserta.id) &&
               p.pengujiId !== penilaian.pengujiId && !p.isDraft
      );
      const newStatus = (!penilaian.isDraft && otherEval) ? 'selesai' : 'berlangsung';
      if (targetPeserta.status !== newStatus) {
        await savePesertaSidang({ ...targetPeserta, status: newStatus });
      }
    }
  } catch (statusErr) {
    console.warn('Auto-update student status on score save warning:', statusErr);
  }

  // Broadcast realtime across tabs & windows
  broadcastRealtimeChange({
    type: 'PENILAIAN_UPDATED',
    payload: penilaian,
  });

  // Save to Supabase if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      const config = getSupabaseConfig();

      // Pastikan data peserta_sidang tersimpan di Supabase
      let mahasiswaUuid = isValidUUID(penilaian.mahasiswaId) ? penilaian.mahasiswaId : null;
      const currentPeserta = await getPesertaSidangList();
      const matchedP = currentPeserta.find(
        (p) => p.id === penilaian.mahasiswaId || (p.nim && p.nim === penilaian.mahasiswaId)
      );
      if (matchedP) {
        try {
          const pRecord: any = {
            nim: matchedP.nim,
            nama: matchedP.nama,
            prodi: matchedP.prodi,
            kelas: matchedP.kelas,
            perusahaan: matchedP.perusahaan,
            judul_laporan: matchedP.judulLaporan,
            pembimbing_dudi: matchedP.pembimbingDudi,
            pembimbing_sekolah: matchedP.pembimbingSekolah,
            jadwal_sidang: matchedP.jadwalSidang,
            ruangan: matchedP.ruangan,
            status: matchedP.status,
            updated_at: new Date().toISOString(),
          };
          if (isValidUUID(matchedP.id)) {
            pRecord.id = matchedP.id;
          }
          const { data: dbPeserta } = await client
            .from(config.tableNameSidang)
            .upsert(pRecord, { onConflict: 'nim' })
            .select('id')
            .single();

          if (dbPeserta?.id) {
            mahasiswaUuid = dbPeserta.id;
          }
        } catch (pErr) {
          console.warn('Supabase ensure peserta error:', pErr);
        }
      }

      // Pastikan data penguji terdaftar di Supabase
      let pengujiUuid = isValidUUID(penilaian.pengujiId) ? penilaian.pengujiId : null;
      const currentPenguji = await getPengujiList();
      const matchedPenguji = currentPenguji.find(
        (p) => p.id === penilaian.pengujiId || (p.nama && p.nama.toLowerCase().trim() === penilaian.pengujiNama?.toLowerCase()?.trim())
      );
      if (matchedPenguji) {
        try {
          const pengRecord: any = {
            nama: matchedPenguji.nama,
            nip: matchedPenguji.nip,
            peran: matchedPenguji.peran,
            avatar: matchedPenguji.avatar,
            email: matchedPenguji.email,
            password: matchedPenguji.password,
            telepon: matchedPenguji.telepon,
            instansi_asal: matchedPenguji.instansiAsal,
            bidang_keahlian: matchedPenguji.bidangKeahlian,
            is_active: matchedPenguji.isActive !== false,
            updated_at: new Date().toISOString(),
          };
          if (isValidUUID(matchedPenguji.id)) {
            pengRecord.id = matchedPenguji.id;
          }
          const { data: dbPenguji } = await client
            .from('penguji')
            .upsert(pengRecord, { onConflict: 'nip' })
            .select('id')
            .single();

          if (dbPenguji?.id) {
            pengujiUuid = dbPenguji.id;
          }
        } catch (pengErr) {
          console.warn('Supabase ensure penguji error:', pengErr);
        }
      }

      const nRecord: any = {
        mahasiswa_id: mahasiswaUuid || penilaian.mahasiswaId,
        penguji_id: pengujiUuid || penilaian.pengujiId,
        penguji_nama: penilaian.pengujiNama,
        penguji_peran: penilaian.pengujiPeran,
        nilai_items: penilaian.nilaiItems,
        subtotal_agenda: penilaian.subtotalAgenda ?? 0,
        subtotal_sidang: penilaian.subtotalSidang ?? 0,
        total_nilai: penilaian.totalNilai,
        nilai_huruf: penilaian.nilaiHuruf,
        catatan_revisi: penilaian.catatanRevisi || '',
        rekomendasi_status: penilaian.rekomendasiStatus || 'Lulus',
        is_draft: Boolean(penilaian.isDraft),
        updated_at: new Date().toISOString(),
      };
      if (isValidUUID(penilaian.id)) {
        nRecord.id = penilaian.id;
      }

      const { error: supaErr } = await client
        .from(config.tableNameNilai)
        .upsert(nRecord, { onConflict: 'mahasiswa_id, penguji_id' });

      if (supaErr) {
        console.warn('Supabase upsert penilaian warning:', supaErr);
      }
    } catch (err) {
      console.warn('Supabase upsert penilaian error:', err);
    }
  }

  return updatedList;
}

/**
 * Realtime broadcast helper
 */
export function broadcastRealtimeChange(message: { type: string; payload: any }): void {
  const bc = getBroadcastChannel();
  if (bc) {
    bc.postMessage(message);
  }

  // Also dispatch window custom event for current window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('my_pkl_realtime_event', { detail: message }));
  }

  // Also publish to Supabase Channel if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      const channel = client.channel('sidang_evaluasi_room');
      channel.send({
        type: 'broadcast',
        event: message.type,
        payload: message.payload,
      });
    } catch {
      // ignore
    }
  }
}

/**
 * Subscribe to realtime updates from any source (BroadcastChannel + Supabase + CustomEvent)
 */
export function subscribeToRealtimeUpdates(
  callback: (event: { type: string; payload: any }) => void
): () => void {
  const bc = getBroadcastChannel();

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      callback(e.data);
    }
  };

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  if (bc) {
    bc.addEventListener('message', handleBroadcast);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('my_pkl_realtime_event', handleCustomEvent);
  }

  // Also connect to Supabase realtime if client available
  const client = getSupabaseClient();
  let supabaseChannel: any = null;
  if (client) {
    try {
      supabaseChannel = client
        .channel('sidang_evaluasi_room_and_db')
        .on('broadcast', { event: '*' }, (payload: any) => {
          if (payload && payload.event) {
            callback({ type: payload.event, payload: payload.payload });
          }
        })
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'penilaian_sidang' },
          (payload: any) => {
            if (payload && payload.new) {
              const d = payload.new;
              const formatted: PenilaianPenguji = {
                id: d.id,
                mahasiswaId: d.mahasiswa_id,
                pengujiId: d.penguji_id,
                pengujiNama: d.penguji_nama,
                pengujiPeran: d.penguji_peran,
                nilaiItems: d.nilai_items || [],
                subtotalAgenda: d.subtotal_agenda !== null && d.subtotal_agenda !== undefined ? Number(d.subtotal_agenda) : undefined,
                subtotalSidang: d.subtotal_sidang !== null && d.subtotal_sidang !== undefined ? Number(d.subtotal_sidang) : undefined,
                totalNilai: Number(d.total_nilai) || 0,
                nilaiHuruf: d.nilai_huruf || 'E',
                catatanRevisi: d.catatan_revisi || '',
                rekomendasiStatus: d.rekomendasi_status || 'Lulus',
                isDraft: Boolean(d.is_draft),
                updatedAt: d.updated_at || new Date().toISOString(),
              };
              callback({ type: 'PENILAIAN_UPDATED', payload: formatted });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'peserta_sidang' },
          (payload: any) => {
            if (payload && payload.new) {
              const d = payload.new;
              const formatted: MahasiswaSidang = {
                id: d.id,
                nim: d.nim,
                nama: d.nama,
                prodi: d.prodi,
                kelas: d.kelas,
                perusahaan: d.perusahaan,
                judulLaporan: d.judul_laporan,
                pembimbingDudi: d.pembimbing_dudi,
                pembimbingSekolah: d.pembimbing_sekolah,
                jadwalSidang: d.jadwal_sidang,
                ruangan: d.ruangan,
                status: d.status,
              };
              callback({ type: 'PESERTA_UPDATED', payload: formatted });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'plotting_siswa_pkl' },
          () => {
            callback({ type: 'DATABASE_MUTATED', payload: 'plotting_siswa_pkl' });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'penguji' },
          (payload: any) => {
            if (payload && payload.eventType === 'DELETE' && payload.old) {
              callback({ type: 'PENGUJI_DELETED', payload: { id: payload.old.id } });
            } else if (payload && payload.new) {
              const d = payload.new;
              const formatted: Penguji = {
                id: d.id,
                nama: d.nama,
                nip: d.nip,
                peran: d.peran,
                avatar: d.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                email: d.email || `${d.nip}@smk-vokasi.sch.id`,
                password: d.password || 'penguji123',
                telepon: d.telepon || '0812-0000-0000',
                instansiAsal: d.instansi_asal || 'SMK Negeri Vokasi',
                bidangKeahlian: d.bidang_keahlian || 'Teknologi Informasi',
                isActive: d.is_active !== false,
                createdAt: d.created_at,
                updatedAt: d.updated_at,
              };
              callback({ type: 'PENGUJI_UPDATED', payload: formatted });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pengaturan_ruangan_sidang' },
          () => {
            callback({ type: 'ROOM_PAIRINGS_MUTATED', payload: null });
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase subscription error:', e);
    }
  }

  return () => {
    if (bc) {
      bc.removeEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('my_pkl_realtime_event', handleCustomEvent);
    }
    if (supabaseChannel && client) {
      client.removeChannel(supabaseChannel);
    }
  };
}

/**
 * Security Guard: Memeriksa apakah token adalah service_role (Super Admin).
 * Kunci service_role TIDAK BOLEH berada di frontend browser karena membobol RLS dan hak akses.
 */
export function isServiceRoleKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  try {
    const parts = key.split('.');
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(jsonPayload);
      return parsed.role === 'service_role';
    }
  } catch {
    // abaikan jika bukan format JWT
  }
  return false;
}

/**
 * Test Supabase connection with security verification
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL dan Anon Key Supabase wajib diisi.' };
    }

    // Security Check: Cegah kebocoran service_role key di browser
    if (isServiceRoleKey(anonKey)) {
      return {
        success: false,
        message:
          '🚨 PERINGATAN KEAMANAN: Kunci yang Anda masukkan adalah "service_role" (Super Admin). Kunci ini TIDAK BOLEH digunakan di frontend karena dapat disalahgunakan untuk memodifikasi seluruh database! Harap salin kunci "anon" (public).',
      };
    }

    const testClient = createClient(url, anonKey);
    // Simple ping check
    const { error } = await testClient.from('peserta_sidang').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, but credentials are valid, Supabase will return a 42P01 table error
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Koneksi ke Supabase berhasil! Namun tabel belum dibuat. Silakan salin & jalankan Schema SQL yang disediakan.',
        };
      }
      return {
        success: false,
        message: `Koneksi gagal: ${error.message} (Kode: ${error.code})`,
      };
    }

    return {
      success: true,
      message: 'Koneksi ke Supabase sukses! Tabel "peserta_sidang" siap digunakan secara real-time.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Terjadi kendala koneksi: ${err?.message || 'Periksa format URL dan Key Anda.'}`,
    };
  }
}

/**
 * Load Master Siswa PKL: prioritizes Supabase, falls back to LocalStorage
 */
export async function getMasterSiswaList(): Promise<MasterSiswaPKL[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('master_siswa_pkl')
        .select('*')
        .order('nisn', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          nisn: d.nisn,
          namaLengkap: d.nama_lengkap,
          kelas: d.kelas,
          jurusan: d.jurusan,
          emailLogin: d.email_login,
          passwordLogin: d.password_login,
          guruPembimbing: d.guru_pembimbing,
          guruNip: d.guru_nip || undefined,
          instansiId: d.instansi_id || undefined,
          instansiNama: d.instansi_nama || undefined,
          alamatInstansi: d.alamat_instansi || undefined,
          pembimbingInstansi: d.pembimbing_instansi || undefined,
          periodeMulai: d.periode_mulai || undefined,
          periodeSelesai: d.periode_selesai || undefined,
          statusPlotting: d.status_plotting || undefined,
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch master_siswa_pkl error, falling back to local store:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_MASTER_SISWA);
    if (raw) {
      try {
        const parsed: MasterSiswaPKL[] = JSON.parse(raw);
        let needsUpdate = false;
        const merged = parsed.map((s) => {
          const initMatch = INITIAL_MASTER_SISWA.find((init) => init.nisn === s.nisn);
          if (initMatch && (!s.instansiNama || !s.pembimbingInstansi)) {
            needsUpdate = true;
            return {
              ...s,
              instansiId: s.instansiId || initMatch.instansiId,
              instansiNama: s.instansiNama || initMatch.instansiNama,
              alamatInstansi: s.alamatInstansi || initMatch.alamatInstansi,
              pembimbingInstansi: s.pembimbingInstansi || initMatch.pembimbingInstansi,
              guruNip: s.guruNip || initMatch.guruNip,
              periodeMulai: s.periodeMulai || initMatch.periodeMulai,
              periodeSelesai: s.periodeSelesai || initMatch.periodeSelesai,
              statusPlotting: s.statusPlotting || initMatch.statusPlotting,
            };
          }
          return s;
        });

        if (needsUpdate) {
          localStorage.setItem(STORAGE_KEY_MASTER_SISWA, JSON.stringify(merged));
        }
        return merged;
      } catch {
        // ignore
      }
    }
    // initialize default
    localStorage.setItem(STORAGE_KEY_MASTER_SISWA, JSON.stringify(INITIAL_MASTER_SISWA));
  }

  return INITIAL_MASTER_SISWA;
}

/**
 * Helper validasi format UUID v4
 */
export function isValidUUID(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Generate standard RFC4122 v4 UUID
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Save / Update Master Siswa
 */
export async function saveMasterSiswa(siswa: MasterSiswaPKL): Promise<MasterSiswaPKL[]> {
  const currentList = await getMasterSiswaList();
  const existingIdx = currentList.findIndex((s) => s.id === siswa.id || s.nisn === siswa.nisn);
  let updatedList: MasterSiswaPKL[];

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = siswa;
  } else {
    updatedList = [siswa, ...currentList];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_SISWA, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_SISWA_UPDATED',
    payload: siswa,
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      const record: any = {
        nisn: siswa.nisn,
        nama_lengkap: siswa.namaLengkap,
        kelas: siswa.kelas,
        jurusan: siswa.jurusan,
        email_login: siswa.emailLogin,
        password_login: siswa.passwordLogin,
        guru_pembimbing: siswa.guruPembimbing,
        guru_nip: siswa.guruNip || null,
        instansi_id: siswa.instansiId || null,
        instansi_nama: siswa.instansiNama || null,
        alamat_instansi: siswa.alamatInstansi || null,
        pembimbing_instansi: siswa.pembimbingInstansi || null,
        periode_mulai: siswa.periodeMulai || null,
        periode_selesai: siswa.periodeSelesai || null,
        status_plotting: siswa.statusPlotting || 'Terplotting',
        updated_at: new Date().toISOString(),
      };
      // Jika id adalah UUID valid, sertakan. Jika id dummy seperti 'ms-1', biarkan Supabase generate UUID
      if (isValidUUID(siswa.id)) {
        record.id = siswa.id;
      }

      const { data, error } = await client
        .from('master_siswa_pkl')
        .upsert(record, { onConflict: 'nisn' })
        .select();

      if (error) {
        console.error('Supabase upsert master_siswa_pkl error:', error);
      } else if (data && data[0]) {
        // Sinkronisasi UUID yang digenerate oleh Postgres
        const realId = data[0].id;
        const idx = updatedList.findIndex((s) => s.nisn === siswa.nisn);
        if (idx >= 0) {
          updatedList[idx].id = realId;
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_MASTER_SISWA, JSON.stringify(updatedList));
          }
        }
      }
    } catch (err) {
      console.warn('Supabase upsert master_siswa_pkl error:', err);
    }
  }

  return updatedList;
}

export interface BatchInsertResult {
  success: boolean;
  count: number;
  savedToDatabase: boolean;
  message: string;
}

/**
 * Batch insert / upsert master siswa langsung ke database Supabase
 */
export async function insertMasterSiswaBatch(siswaList: MasterSiswaPKL[]): Promise<BatchInsertResult> {
  const client = getSupabaseClient();
  const currentLocal = await getMasterSiswaList();

  if (client) {
    try {
      const recordsToInsert = siswaList.map((s) => {
        const item: any = {
          nisn: s.nisn,
          nama_lengkap: s.namaLengkap,
          kelas: s.kelas,
          jurusan: s.jurusan,
          email_login: s.emailLogin,
          password_login: s.passwordLogin,
          guru_pembimbing: s.guruPembimbing,
          guru_nip: s.guruNip || null,
          instansi_id: s.instansiId || null,
          instansi_nama: s.instansiNama || null,
          alamat_instansi: s.alamatInstansi || null,
          pembimbing_instansi: s.pembimbingInstansi || null,
          periode_mulai: s.periodeMulai || null,
          periode_selesai: s.periodeSelesai || null,
          status_plotting: s.statusPlotting || 'Terplotting',
          updated_at: new Date().toISOString(),
        };
        if (isValidUUID(s.id)) {
          item.id = s.id;
        }
        return item;
      });

      const { data, error } = await client
        .from('master_siswa_pkl')
        .upsert(recordsToInsert, { onConflict: 'nisn' })
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // Gabungkan hasil dari database ke state lokal
      const dbItems: MasterSiswaPKL[] = (data || []).map((d: any) => ({
        id: d.id,
        nisn: d.nisn,
        namaLengkap: d.nama_lengkap,
        kelas: d.kelas,
        jurusan: d.jurusan,
        emailLogin: d.email_login,
        passwordLogin: d.password_login,
        guruPembimbing: d.guru_pembimbing,
        guruNip: d.guru_nip || undefined,
        instansiId: d.instansi_id || undefined,
        instansiNama: d.instansi_nama || undefined,
        alamatInstansi: d.alamat_instansi || undefined,
        pembimbingInstansi: d.pembimbing_instansi || undefined,
        periodeMulai: d.periode_mulai || undefined,
        periodeSelesai: d.periode_selesai || undefined,
        statusPlotting: d.status_plotting || undefined,
        createdAt: d.created_at,
      }));

      const merged = [...currentLocal];
      dbItems.forEach((dbItem) => {
        const idx = merged.findIndex((m) => m.nisn === dbItem.nisn);
        if (idx >= 0) merged[idx] = dbItem;
        else merged.unshift(dbItem);
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MASTER_SISWA, JSON.stringify(merged));
      }

      broadcastRealtimeChange({
        type: 'MASTER_SISWA_BATCH_UPDATED',
        payload: dbItems,
      });

      return {
        success: true,
        count: dbItems.length,
        savedToDatabase: true,
        message: `${dbItems.length} data siswa berhasil disimpan LANGSUNG ke Database Supabase (tabel master_siswa_pkl).`,
      };
    } catch (dbErr: any) {
      console.error('Gagal menyimpan ke database Supabase:', dbErr);
      return {
        success: false,
        count: 0,
        savedToDatabase: false,
        message: `Gagal menyimpan ke database Supabase: ${dbErr?.message || 'Pastikan tabel master_siswa_pkl sudah dibuat di Supabase.'}`,
      };
    }
  }

  // Jika Supabase belum dikonfigurasi sama sekali
  return {
    success: false,
    count: 0,
    savedToDatabase: false,
    message: 'Database Supabase belum terhubung! Silakan klik tombol "Supabase" di kanan atas dan masukkan Project URL serta Anon Key agar data dapat disimpan langsung ke database server.',
  };
}

/**
 * Delete Master Siswa
 */
export async function deleteMasterSiswa(id: string): Promise<MasterSiswaPKL[]> {
  const currentList = await getMasterSiswaList();
  const updatedList = currentList.filter((s) => s.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_SISWA, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_SISWA_DELETED',
    payload: { id },
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('master_siswa_pkl').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete master_siswa_pkl error:', err);
    }
  }

  return updatedList;
}

/**
 * Load Master Jurusan: prioritizes Supabase, falls back to LocalStorage
 */
export async function getMasterJurusanList(): Promise<MasterJurusan[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('master_jurusan')
        .select('*')
        .order('kode', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          kode: d.kode,
          nama: d.nama,
          bidangKeahlian: d.bidang_keahlian,
          kepalaProgram: d.kepala_program || '',
          deskripsi: d.deskripsi || '',
          isActive: d.is_active !== false,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch master_jurusan error, using fallback:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_MASTER_JURUSAN);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    localStorage.setItem(STORAGE_KEY_MASTER_JURUSAN, JSON.stringify(INITIAL_MASTER_JURUSAN));
  }

  return INITIAL_MASTER_JURUSAN;
}

/**
 * Save / Update Master Jurusan
 */
export async function saveMasterJurusan(jurusan: MasterJurusan): Promise<MasterJurusan[]> {
  const currentList = await getMasterJurusanList();
  const existingIdx = currentList.findIndex(
    (j) => j.id === jurusan.id || j.kode.toUpperCase() === jurusan.kode.toUpperCase()
  );
  let updatedList: MasterJurusan[];

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = jurusan;
  } else {
    updatedList = [...currentList, jurusan];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_JURUSAN, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_JURUSAN_UPDATED',
    payload: jurusan,
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      const record: any = {
        kode: jurusan.kode.toUpperCase().trim(),
        nama: jurusan.nama.trim(),
        bidang_keahlian: jurusan.bidangKeahlian.trim(),
        kepala_program: jurusan.kepalaProgram.trim(),
        deskripsi: jurusan.deskripsi || '',
        is_active: jurusan.isActive,
        updated_at: new Date().toISOString(),
      };
      if (isValidUUID(jurusan.id)) {
        record.id = jurusan.id;
      }

      const { data, error } = await client
        .from('master_jurusan')
        .upsert(record, { onConflict: 'kode' })
        .select();

      if (error) {
        console.error('Supabase upsert master_jurusan error:', error);
      } else if (data && data[0]) {
        const realId = data[0].id;
        const idx = updatedList.findIndex((j) => j.kode.toUpperCase() === jurusan.kode.toUpperCase());
        if (idx >= 0) {
          updatedList[idx].id = realId;
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_MASTER_JURUSAN, JSON.stringify(updatedList));
          }
        }
      }
    } catch (err) {
      console.warn('Supabase upsert master_jurusan error:', err);
    }
  }

  return updatedList;
}

/**
 * Delete Master Jurusan
 */
export async function deleteMasterJurusan(id: string): Promise<MasterJurusan[]> {
  const currentList = await getMasterJurusanList();
  const updatedList = currentList.filter((j) => j.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_JURUSAN, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_JURUSAN_DELETED',
    payload: { id },
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('master_jurusan').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete master_jurusan error:', err);
    }
  }

  return updatedList;
}

/**
 * Load Master Instansi / Perusahaan: prioritizes Supabase, falls back to LocalStorage
 */
export async function getMasterInstansiList(): Promise<MasterInstansi[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('master_instansi')
        .select('*')
        .order('nama', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          nama: d.nama,
          alamat: d.alamat,
          kuota: Number(d.kuota) || 0,
          pembimbingInstansi: d.pembimbing_instansi || '',
          kontakPerson: d.kontak_person || '',
          email: d.email || '',
          bidangUsaha: d.bidang_usaha || '',
          isActive: d.is_active !== false,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch master_instansi error, using fallback:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_MASTER_INSTANSI);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    localStorage.setItem(STORAGE_KEY_MASTER_INSTANSI, JSON.stringify(INITIAL_MASTER_INSTANSI));
  }

  return INITIAL_MASTER_INSTANSI;
}

/**
 * Save / Update Master Instansi / Perusahaan
 */
export async function saveMasterInstansi(instansi: MasterInstansi): Promise<MasterInstansi[]> {
  const currentList = await getMasterInstansiList();
  const existingIdx = currentList.findIndex(
    (i) => i.id === instansi.id || i.nama.toLowerCase().trim() === instansi.nama.toLowerCase().trim()
  );
  let updatedList: MasterInstansi[];

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = instansi;
  } else {
    updatedList = [...currentList, instansi];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_INSTANSI, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_INSTANSI_UPDATED',
    payload: instansi,
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      const record: any = {
        nama: instansi.nama.trim(),
        alamat: instansi.alamat.trim(),
        kuota: Number(instansi.kuota) || 0,
        pembimbing_instansi: instansi.pembimbingInstansi.trim(),
        kontak_person: instansi.kontakPerson?.trim() || '',
        email: instansi.email?.trim() || '',
        bidang_usaha: instansi.bidangUsaha?.trim() || '',
        is_active: instansi.isActive,
        updated_at: new Date().toISOString(),
      };
      if (isValidUUID(instansi.id)) {
        record.id = instansi.id;
      }

      const { data, error } = await client
        .from('master_instansi')
        .upsert(record, { onConflict: 'nama' })
        .select();

      if (error) {
        console.error('Supabase upsert master_instansi error:', error);
      } else if (data && data[0]) {
        const realId = data[0].id;
        const idx = updatedList.findIndex((i) => i.nama.toLowerCase().trim() === instansi.nama.toLowerCase().trim());
        if (idx >= 0) {
          updatedList[idx].id = realId;
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_MASTER_INSTANSI, JSON.stringify(updatedList));
          }
        }
      }
    } catch (err) {
      console.warn('Supabase upsert master_instansi error:', err);
    }
  }

  return updatedList;
}

/**
 * Delete Master Instansi
 */
export async function deleteMasterInstansi(id: string): Promise<MasterInstansi[]> {
  const currentList = await getMasterInstansiList();
  const updatedList = currentList.filter((i) => i.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_INSTANSI, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_INSTANSI_DELETED',
    payload: { id },
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('master_instansi').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete master_instansi error:', err);
    }
  }

  return updatedList;
}

/**
 * Batch insert / upsert master instansi ke Supabase Cloud atau LocalStorage
 */
export async function insertMasterInstansiBatch(incomingList: MasterInstansi[]): Promise<BatchInsertResult> {
  const client = getSupabaseClient();
  const currentList = await getMasterInstansiList();

  // Deduplikasi incomingList berdasarkan nama instansi yang dinormalisasi (ambil record terakhir jika ada nama ganda di file Excel)
  const dedupedMap = new Map<string, MasterInstansi>();
  incomingList.forEach((incoming) => {
    if (incoming.nama && incoming.nama.trim()) {
      dedupedMap.set(incoming.nama.toLowerCase().trim(), incoming);
    }
  });
  const cleanIncomingList = Array.from(dedupedMap.values());

  // Gabungkan ke penyimpanan lokal (upsert berdasarkan nama instansi yang dinormalisasi)
  const updatedList = [...currentList];
  cleanIncomingList.forEach((incoming) => {
    const existingIdx = updatedList.findIndex(
      (item) => item.nama.toLowerCase().trim() === incoming.nama.toLowerCase().trim()
    );
    if (existingIdx >= 0) {
      updatedList[existingIdx] = {
        ...updatedList[existingIdx],
        alamat: incoming.alamat || updatedList[existingIdx].alamat,
        kuota: Number(incoming.kuota) > 0 ? Number(incoming.kuota) : updatedList[existingIdx].kuota,
        pembimbingInstansi: incoming.pembimbingInstansi || updatedList[existingIdx].pembimbingInstansi,
        bidangUsaha: incoming.bidangUsaha || updatedList[existingIdx].bidangUsaha,
        kontakPerson: incoming.kontakPerson || updatedList[existingIdx].kontakPerson,
        email: incoming.email || updatedList[existingIdx].email,
        isActive: incoming.isActive !== false,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedList.push(incoming);
    }
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_INSTANSI, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_INSTANSI_UPDATED',
    payload: updatedList,
  });

  if (client) {
    try {
      // 1. Siapkan record lengkap (deduplikasi menjamin tidak ada duplikat nama dalam satu batch upsert)
      const recordsToInsert = cleanIncomingList.map((inst) => {
        const item: any = {
          nama: inst.nama.trim(),
          alamat: inst.alamat?.trim() || 'Alamat belum diisi',
          kuota: Number(inst.kuota) > 0 ? Number(inst.kuota) : 4,
          pembimbing_instansi: inst.pembimbingInstansi?.trim() || 'Pembimbing DUDI',
          kontak_person: inst.kontakPerson?.trim() || '',
          email: inst.email?.trim() || '',
          bidang_usaha: inst.bidangUsaha?.trim() || '',
          is_active: inst.isActive !== false,
          updated_at: new Date().toISOString(),
        };
        if (isValidUUID(inst.id)) {
          item.id = inst.id;
        }
        return item;
      });

      // 2. Coba upsert langsung dengan onConflict 'nama'
      let { data, error } = await client
        .from('master_instansi')
        .upsert(recordsToInsert, { onConflict: 'nama' })
        .select();

      // 3. Fallback jika tabel di Supabase belum memiliki kolom baru (misal kontak_person, bidang_usaha, email) -> kode error 42703
      if (error && (error.code === '42703' || error.message?.toLowerCase().includes('column'))) {
        console.warn('Optional columns missing in Supabase master_instansi, retrying with core columns...');
        const coreRecords = recordsToInsert.map((rec) => {
          const core: any = {
            nama: rec.nama,
            alamat: rec.alamat,
            kuota: rec.kuota,
            pembimbing_instansi: rec.pembimbing_instansi,
            updated_at: rec.updated_at,
          };
          if (rec.id) core.id = rec.id;
          return core;
        });

        const retryRes = await client
          .from('master_instansi')
          .upsert(coreRecords, { onConflict: 'nama' })
          .select();

        if (!retryRes.error) {
          data = retryRes.data;
          error = null;
        } else {
          error = retryRes.error;
        }
      }

      // 4. Fallback jika belum ada constraint UNIQUE pada kolom 'nama' (kode error 42P10)
      if (
        error &&
        (error.code === '42P10' ||
          error.message?.toLowerCase().includes('on conflict') ||
          error.message?.toLowerCase().includes('constraint'))
      ) {
        console.warn('Supabase onConflict nama constraint missing, attempting manual match & update fallback...');
        const { data: existingRows } = await client.from('master_instansi').select('id, nama');
        const existingMap = new Map<string, string>();
        if (existingRows) {
          existingRows.forEach((r: any) => {
            if (r.nama) existingMap.set(r.nama.toLowerCase().trim(), r.id);
          });
        }

        const toUpdate: any[] = [];
        const toInsert: any[] = [];

        recordsToInsert.forEach((rec) => {
          const matchId = existingMap.get(rec.nama.toLowerCase().trim());
          if (matchId) {
            toUpdate.push({ ...rec, id: matchId });
          } else {
            toInsert.push(rec);
          }
        });

        // Jalankan update untuk baris yang sudah ada
        for (const item of toUpdate) {
          const { id, ...fields } = item;
          try {
            await client.from('master_instansi').update(fields).eq('id', id);
          } catch {
            // Fallback dengan core fields saja jika gagal
            await client
              .from('master_instansi')
              .update({
                nama: fields.nama,
                alamat: fields.alamat,
                kuota: fields.kuota,
                pembimbing_instansi: fields.pembimbing_instansi,
                updated_at: fields.updated_at,
              })
              .eq('id', id);
          }
        }

        // Jalankan insert untuk data instansi baru
        if (toInsert.length > 0) {
          let insertRes = await client.from('master_instansi').insert(toInsert).select();
          if (insertRes.error && (insertRes.error.code === '42703' || insertRes.error.message?.toLowerCase().includes('column'))) {
            const coreToInsert = toInsert.map((rec) => ({
              nama: rec.nama,
              alamat: rec.alamat,
              kuota: rec.kuota,
              pembimbing_instansi: rec.pembimbing_instansi,
              updated_at: rec.updated_at,
            }));
            insertRes = await client.from('master_instansi').insert(coreToInsert).select();
          }
          if (insertRes.error) {
            throw insertRes.error;
          }
          data = [...toUpdate, ...(insertRes.data || [])];
        } else {
          data = toUpdate;
        }
        error = null;
      }

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        data.forEach((dbRow: any) => {
          const idx = updatedList.findIndex(
            (i) => i.nama.toLowerCase().trim() === dbRow.nama.toLowerCase().trim()
          );
          if (idx >= 0) {
            updatedList[idx].id = dbRow.id;
          }
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_MASTER_INSTANSI, JSON.stringify(updatedList));
        }
      }

      return {
        success: true,
        count: cleanIncomingList.length,
        savedToDatabase: true,
        message: `Berhasil menyimpan & memperbarui ${cleanIncomingList.length} data instansi ke database Supabase Cloud!`,
      };
    } catch (err: any) {
      console.warn('Supabase batch insert master_instansi warning, saved locally:', err);
      const isTableMissing =
        err?.code === '42P01' ||
        err?.message?.toLowerCase().includes('does not exist') ||
        err?.message?.toLowerCase().includes('master_instansi');

      const isConstraintMissing =
        err?.code === '42P10' ||
        err?.message?.toLowerCase().includes('on conflict');

      const isPermissionDenied =
        err?.code === '42501' ||
        err?.message?.toLowerCase().includes('policy') ||
        err?.message?.toLowerCase().includes('permission');

      let message = `Tersimpan di penyimpanan lokal (${cleanIncomingList.length} instansi). Catatan Supabase: ${err?.message || 'Database offline.'}`;

      if (isTableMissing) {
        message = `Tersimpan di browser lokal (${cleanIncomingList.length} instansi). Perhatian: Tabel "master_instansi" belum dibuat di Supabase Cloud. Silakan jalankan skrip SQL skema di Supabase SQL Editor.`;
      } else if (isConstraintMissing) {
        message = `Tersimpan di browser lokal (${cleanIncomingList.length} instansi). Perlu menambahkan constraint UNIQUE pada kolom 'nama' di tabel master_instansi Supabase. Silakan jalankan query SQL pembaruan.`;
      } else if (isPermissionDenied) {
        message = `Tersimpan di browser lokal (${cleanIncomingList.length} instansi). Izin akses RLS ditolak di Supabase. Jalankan skrip SQL pembaruan untuk mengaktifkan izin public anon write.`;
      }

      return {
        success: true,
        count: cleanIncomingList.length,
        savedToDatabase: false,
        message,
      };
    }
  }

  return {
    success: true,
    count: incomingList.length,
    savedToDatabase: false,
    message: `Tersimpan di penyimpanan lokal (${incomingList.length} instansi). Database Supabase belum terhubung (klik menu Supabase di kanan atas untuk menghubungkan URL & Key).`,
  };
}

/**
 * Sinkronkan seluruh data Master Instansi dari LocalStorage ke database Supabase Cloud
 */
export async function syncMasterInstansiToSupabase(): Promise<BatchInsertResult> {
  const currentList = await getMasterInstansiList();
  if (currentList.length === 0) {
    return {
      success: false,
      count: 0,
      savedToDatabase: false,
      message: 'Tidak ada data instansi yang tersimpan di lokal untuk disinkronkan.',
    };
  }
  return await insertMasterInstansiBatch(currentList);
}

/**
 * Cek apakah tabel master_instansi sudah ada di database Supabase Cloud
 */
export async function checkMasterInstansiTableStatus(): Promise<{
  connected: boolean;
  tableExists: boolean;
  rowCount: number;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      tableExists: false,
      rowCount: 0,
      message: 'Database Supabase belum terhubung. Konfigurasikan URL dan Anon Key di menu Supabase.',
    };
  }

  try {
    const { count, error } = await client
      .from('master_instansi')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist')) {
        return {
          connected: true,
          tableExists: false,
          rowCount: 0,
          message: 'Tabel "master_instansi" belum dibuat di database Supabase Anda. Perlu menjalankan skrip SQL.',
        };
      }
      return {
        connected: true,
        tableExists: false,
        rowCount: 0,
        message: `Koneksi ke tabel master_instansi gagal: ${error.message}`,
      };
    }

    return {
      connected: true,
      tableExists: true,
      rowCount: count ?? 0,
      message: `Tabel "master_instansi" aktif di Supabase Cloud (${count ?? 0} perusahaan terdaftar).`,
    };
  } catch (err: any) {
    return {
      connected: true,
      tableExists: false,
      rowCount: 0,
      message: err?.message || 'Gagal memeriksa status tabel master_instansi.',
    };
  }
}

/**
 * Load Master Guru Pembimbing: prioritas Supabase, fallback ke LocalStorage & initial seed
 */
export async function getMasterGuruList(): Promise<MasterGuruPembimbing[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('master_guru_pembimbing')
        .select('*')
        .order('nama', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          nip: d.nip,
          nama: d.nama,
          telepon: d.telepon || '',
          emailLogin: d.email_login || '',
          passwordLogin: d.password_login || '',
          bidangStudi: d.bidang_studi || '',
          avatar: d.avatar || '',
          isActive: d.is_active ?? true,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getMasterGuruList error, fallback to LocalStorage:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY_MASTER_GURU);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore parse error
      }
    }
    // Seed initial data
    localStorage.setItem(STORAGE_KEY_MASTER_GURU, JSON.stringify(INITIAL_MASTER_GURU));
  }

  return INITIAL_MASTER_GURU;
}

/**
 * Save / Update Master Guru Pembimbing
 */
export async function saveMasterGuru(guru: MasterGuruPembimbing): Promise<MasterGuruPembimbing[]> {
  const currentList = await getMasterGuruList();
  const cleanNip = guru.nip.replace(/\s+/g, '');
  const existingIdx = currentList.findIndex(
    (g) => g.id === guru.id || g.nip.replace(/\s+/g, '') === cleanNip
  );
  let updatedList: MasterGuruPembimbing[];

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = guru;
  } else {
    updatedList = [...currentList, guru];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_GURU, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_GURU_UPDATED',
    payload: guru,
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      const assignedId = isValidUUID(guru.id) ? guru.id : generateUUID();
      const record: any = {
        id: assignedId,
        nip: guru.nip.trim(),
        nama: guru.nama.trim(),
        telepon: guru.telepon.trim(),
        email_login: guru.emailLogin.trim(),
        password_login: guru.passwordLogin.trim(),
        bidang_studi: guru.bidangStudi?.trim() || '',
        avatar: guru.avatar || '',
        is_active: guru.isActive ?? true,
        updated_at: new Date().toISOString(),
      };

      // Cek apakah ada record yang sudah ada di Supabase
      const { data: existingRows } = await client
        .from('master_guru_pembimbing')
        .select('id, nip');

      let matchedRowId: string | null = null;
      if (existingRows && existingRows.length > 0) {
        const found = existingRows.find(
          (r: any) =>
            r.id === guru.id || (r.nip && r.nip.replace(/\s+/g, '') === cleanNip)
        );
        if (found) matchedRowId = found.id;
      }

      if (matchedRowId) {
        // Update record yang sudah ada berdasarkan ID primer
        const { error: updateErr } = await client
          .from('master_guru_pembimbing')
          .update(record)
          .eq('id', matchedRowId);

        if (updateErr) {
          // Fallback ke kolom core jika skema database lama belum punya avatar/bidang_studi
          await client
            .from('master_guru_pembimbing')
            .update({
              nip: record.nip,
              nama: record.nama,
              telepon: record.telepon,
              email_login: record.email_login,
              password_login: record.password_login,
              updated_at: record.updated_at,
            })
            .eq('id', matchedRowId);
        }
      } else {
        // Insert record baru
        const { data: insertData, error: insertErr } = await client
          .from('master_guru_pembimbing')
          .insert([record])
          .select();

        if (insertErr && (insertErr.code === '42703' || insertErr.message?.toLowerCase().includes('column'))) {
          await client.from('master_guru_pembimbing').insert([
            {
              id: assignedId,
              nip: record.nip,
              nama: record.nama,
              telepon: record.telepon,
              email_login: record.email_login,
              password_login: record.password_login,
              updated_at: record.updated_at,
            },
          ]);
        }

        if (insertData && insertData[0]) {
          const idx = updatedList.findIndex((g) => g.nip.replace(/\s+/g, '') === cleanNip);
          if (idx >= 0) {
            updatedList[idx].id = insertData[0].id;
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY_MASTER_GURU, JSON.stringify(updatedList));
            }
          }
        }
      }
    } catch (err) {
      console.warn('Supabase saveMasterGuru error:', err);
    }
  }

  return updatedList;
}

/**
 * Delete Master Guru Pembimbing
 */
export async function deleteMasterGuru(id: string): Promise<MasterGuruPembimbing[]> {
  const currentList = await getMasterGuruList();
  const updatedList = currentList.filter((g) => g.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_GURU, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_GURU_DELETED',
    payload: { id },
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('master_guru_pembimbing').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete master_guru_pembimbing error:', err);
    }
  }

  return updatedList;
}

/**
 * Batch insert Master Guru Pembimbing
 * Dirancang toleran terhadap perbedaan spasi NIP, ketiadaan default UUID, dan perbedaan kolom skema Supabase.
 */
export async function insertMasterGuruBatch(incomingList: MasterGuruPembimbing[]): Promise<BatchInsertResult> {
  const client = getSupabaseClient();
  const currentList = await getMasterGuruList();

  // 1. Deduplikasi incomingList berdasarkan NIP bersih (ambil record terakhir jika ada NIP ganda di file Excel)
  const dedupedMap = new Map<string, MasterGuruPembimbing>();
  incomingList.forEach((incoming) => {
    const cleanNip = (incoming.nip || '').replace(/\s+/g, '');
    if (cleanNip) {
      dedupedMap.set(cleanNip, incoming);
    }
  });
  const cleanIncomingList = Array.from(dedupedMap.values());

  // 2. Gabungkan data ke LocalStorage browser terlebih dahulu (Offline-first safety)
  const updatedList = [...currentList];
  cleanIncomingList.forEach((incoming) => {
    const cleanNip = incoming.nip.replace(/\s+/g, '');
    const existingIdx = updatedList.findIndex(
      (item) => item.nip.replace(/\s+/g, '') === cleanNip
    );
    if (existingIdx >= 0) {
      updatedList[existingIdx] = {
        ...updatedList[existingIdx],
        nama: incoming.nama || updatedList[existingIdx].nama,
        telepon: incoming.telepon || updatedList[existingIdx].telepon,
        emailLogin: incoming.emailLogin || updatedList[existingIdx].emailLogin,
        passwordLogin: incoming.passwordLogin || updatedList[existingIdx].passwordLogin,
        bidangStudi: incoming.bidangStudi || updatedList[existingIdx].bidangStudi,
        isActive: incoming.isActive !== false,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedList.push({
        ...incoming,
        id: isValidUUID(incoming.id) ? incoming.id : generateUUID(),
      });
    }
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MASTER_GURU, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'MASTER_GURU_UPDATED',
    payload: updatedList,
  });

  // 3. Simpan dan sinkronkan ke database Supabase Cloud
  if (client) {
    try {
      // Periksa apakah tabel master_guru_pembimbing ada di database Supabase
      const { data: existingRows, error: fetchErr } = await client
        .from('master_guru_pembimbing')
        .select('id, nip');

      if (fetchErr) {
        if (fetchErr.code === '42P01' || fetchErr.message?.toLowerCase().includes('does not exist')) {
          return {
            success: true,
            count: cleanIncomingList.length,
            savedToDatabase: false,
            message: `Tersimpan di browser lokal (${cleanIncomingList.length} guru). Tabel "master_guru_pembimbing" belum dibuat di Supabase Cloud. Silakan salin & jalankan Skrip SQL skema di Supabase SQL Editor.`,
          };
        }
        if (fetchErr.code === '42501' || fetchErr.message?.toLowerCase().includes('permission') || fetchErr.message?.toLowerCase().includes('policy')) {
          return {
            success: true,
            count: cleanIncomingList.length,
            savedToDatabase: false,
            message: `Tersimpan di browser lokal (${cleanIncomingList.length} guru). Izin akses RLS ditolak di Supabase. Silakan jalankan Skrip SQL pembaruan untuk mengaktifkan izin public anon write.`,
          };
        }
      }

      // Bangun map baris yang sudah ada di Supabase berdasarkan NIP yang dinormalisasi
      const existingDbMap = new Map<string, string>();
      if (existingRows) {
        existingRows.forEach((r: any) => {
          if (r.nip) {
            existingDbMap.set(r.nip.replace(/\s+/g, ''), r.id);
          }
        });
      }

      const toUpdate: any[] = [];
      const toInsert: any[] = [];

      cleanIncomingList.forEach((g) => {
        const cleanNip = g.nip.replace(/\s+/g, '');
        const matchedDbId = existingDbMap.get(cleanNip);

        const rec: any = {
          nip: g.nip.trim(),
          nama: g.nama.trim(),
          telepon: g.telepon?.trim() || '',
          email_login: g.emailLogin?.trim() || `${g.nama.toLowerCase().replace(/[^a-z0-9]/g, '.')}@smk.belajar.id`,
          password_login: g.passwordLogin?.trim() || `Guru#${g.nip.slice(-4)}`,
          bidang_studi: g.bidangStudi?.trim() || 'Produktif & Kejuruan',
          avatar: g.avatar || '',
          is_active: g.isActive !== false,
          updated_at: new Date().toISOString(),
        };

        if (matchedDbId) {
          toUpdate.push({ id: matchedDbId, ...rec });
        } else {
          toInsert.push({
            id: isValidUUID(g.id) ? g.id : generateUUID(),
            ...rec,
          });
        }
      });

      // Jalankan UPDATE untuk guru yang sudah ada di database
      for (const item of toUpdate) {
        const { id, ...fields } = item;
        const { error: errUpd } = await client
          .from('master_guru_pembimbing')
          .update(fields)
          .eq('id', id);

        if (errUpd && (errUpd.code === '42703' || errUpd.message?.toLowerCase().includes('column'))) {
          // Fallback update tanpa kolom baru jika tabel lama belum memiliki kolom avatar/bidang_studi
          await client
            .from('master_guru_pembimbing')
            .update({
              nip: fields.nip,
              nama: fields.nama,
              telepon: fields.telepon,
              email_login: fields.email_login,
              password_login: fields.password_login,
              updated_at: fields.updated_at,
            })
            .eq('id', id);
        }
      }

      // Jalankan INSERT untuk guru baru
      if (toInsert.length > 0) {
        let insertRes = await client.from('master_guru_pembimbing').insert(toInsert).select();
        
        if (insertRes.error && (insertRes.error.code === '42703' || insertRes.error.message?.toLowerCase().includes('column'))) {
          // Fallback insert dengan core columns
          const coreToInsert = toInsert.map((rec) => ({
            id: rec.id,
            nip: rec.nip,
            nama: rec.nama,
            telepon: rec.telepon,
            email_login: rec.email_login,
            password_login: rec.password_login,
            updated_at: rec.updated_at,
          }));
          insertRes = await client.from('master_guru_pembimbing').insert(coreToInsert).select();
        }

        if (insertRes.data && insertRes.data.length > 0) {
          insertRes.data.forEach((dbRow: any) => {
            const idx = updatedList.findIndex(
              (i) => i.nip.replace(/\s+/g, '') === dbRow.nip.replace(/\s+/g, '')
            );
            if (idx >= 0) {
              updatedList[idx].id = dbRow.id;
            }
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_MASTER_GURU, JSON.stringify(updatedList));
          }
        }
      }

      return {
        success: true,
        count: cleanIncomingList.length,
        savedToDatabase: true,
        message: `Berhasil menyimpan & memperbarui ${cleanIncomingList.length} guru pembimbing ke database Supabase Cloud!`,
      };
    } catch (err: any) {
      console.warn('Supabase batch insert master_guru_pembimbing warning, saved locally:', err);
      const isTableMissing =
        err?.code === '42P01' ||
        err?.message?.toLowerCase().includes('does not exist') ||
        err?.message?.toLowerCase().includes('master_guru_pembimbing');

      const isPermissionDenied =
        err?.code === '42501' ||
        err?.message?.toLowerCase().includes('policy') ||
        err?.message?.toLowerCase().includes('permission');

      let message = `Tersimpan di penyimpanan lokal (${cleanIncomingList.length} guru). Catatan Supabase: ${err?.message || 'Database offline.'}`;

      if (isTableMissing) {
        message = `Tersimpan di browser lokal (${cleanIncomingList.length} guru). Perhatian: Tabel "master_guru_pembimbing" belum dibuat di Supabase Cloud. Silakan jalankan skrip SQL skema di Supabase SQL Editor.`;
      } else if (isPermissionDenied) {
        message = `Tersimpan di browser lokal (${cleanIncomingList.length} guru). Izin akses RLS ditolak di Supabase. Jalankan skrip SQL pembaruan untuk mengaktifkan izin public anon write.`;
      }

      return {
        success: true,
        count: cleanIncomingList.length,
        savedToDatabase: false,
        message,
      };
    }
  }

  return {
    success: true,
    count: cleanIncomingList.length,
    savedToDatabase: false,
    message: `Tersimpan di penyimpanan lokal (${cleanIncomingList.length} guru). Database Supabase belum terhubung (klik menu Supabase di kanan atas untuk menghubungkan URL & Key).`,
  };
}

/**
 * Sinkronkan seluruh data Master Guru dari LocalStorage ke database Supabase Cloud
 */
export async function syncMasterGuruToSupabase(): Promise<BatchInsertResult> {
  const currentList = await getMasterGuruList();
  if (currentList.length === 0) {
    return {
      success: false,
      count: 0,
      savedToDatabase: false,
      message: 'Tidak ada data guru pembimbing yang tersimpan di lokal untuk disinkronkan.',
    };
  }
  return await insertMasterGuruBatch(currentList);
}

/**
 * Cek apakah tabel master_guru_pembimbing sudah ada di database Supabase Cloud
 */
export async function checkMasterGuruTableStatus(): Promise<{
  connected: boolean;
  tableExists: boolean;
  rowCount: number;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      tableExists: false,
      rowCount: 0,
      message: 'Database Supabase belum terhubung. Konfigurasikan URL dan Anon Key di menu Supabase.',
    };
  }

  try {
    const { count, error } = await client
      .from('master_guru_pembimbing')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist')) {
        return {
          connected: true,
          tableExists: false,
          rowCount: 0,
          message: 'Tabel "master_guru_pembimbing" belum dibuat di database Supabase Anda. Perlu menjalankan skrip SQL.',
        };
      }
      return {
        connected: true,
        tableExists: false,
        rowCount: 0,
        message: `Koneksi ke tabel master_guru_pembimbing gagal: ${error.message}`,
      };
    }

    return {
      connected: true,
      tableExists: true,
      rowCount: count ?? 0,
      message: `Tabel master_guru_pembimbing aktif dan terhubung di cloud (${count ?? 0} data).`,
    };
  } catch (err: any) {
    return {
      connected: true,
      tableExists: false,
      rowCount: 0,
      message: err?.message || 'Gagal memeriksa status tabel master_guru_pembimbing.',
    };
  }
}

/**
 * Load Plotting Siswa PKL: prioritas Supabase, fallback ke LocalStorage & initial seed
 */
export async function getPlottingList(): Promise<PlottingSiswaPKL[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('plotting_siswa_pkl')
        .select('*')
        .order('nama_siswa', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          siswaId: d.siswa_id || `ms-${d.nisn}`,
          nisn: d.nisn,
          namaSiswa: d.nama_siswa,
          kelas: d.kelas,
          jurusan: d.jurusan,
          instansiId: d.instansi_id || '',
          instansiNama: d.instansi_nama || '',
          alamatInstansi: d.alamat_instansi || '',
          pembimbingInstansi: d.pembimbing_instansi || '',
          guruId: d.guru_id || '',
          guruNama: d.guru_nama || '',
          guruNip: d.guru_nip || '',
          guruTelepon: d.guru_telepon || '',
          periodeMulai: d.periode_mulai || '15 Juli 2026',
          periodeSelesai: d.periode_selesai || '15 Desember 2026',
          statusPlotting: d.status_plotting || 'Terplotting',
          catatan: d.catatan || '',
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getPlottingList error, fallback to LocalStorage:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY_PLOTTING);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore parse error
      }
    }
    // Seed initial data
    localStorage.setItem(STORAGE_KEY_PLOTTING, JSON.stringify(INITIAL_PLOTTING_SISWA));
  }

  return INITIAL_PLOTTING_SISWA;
}

/**
 * Save / Update Single Plotting Item & sync to Master Siswa
 */
export async function savePlottingItem(item: PlottingSiswaPKL): Promise<PlottingSiswaPKL[]> {
  const currentList = await getPlottingList();
  const cleanNisn = item.nisn.replace(/\s+/g, '');
  const existingIdx = currentList.findIndex(
    (p) => p.id === item.id || p.nisn.replace(/\s+/g, '') === cleanNisn
  );
  let updatedList: PlottingSiswaPKL[];

  const updatedItem: PlottingSiswaPKL = {
    ...item,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = updatedItem;
  } else {
    updatedList = [updatedItem, ...currentList];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PLOTTING, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'PLOTTING_SISWA_UPDATED',
    payload: updatedItem,
  });

  // Cross-sync ke Master Siswa
  try {
    const currentSiswa = await getMasterSiswaList();
    const siswaIdx = currentSiswa.findIndex((s) => s.nisn.replace(/\s+/g, '') === cleanNisn);
    if (siswaIdx >= 0) {
      const updatedSiswa = [...currentSiswa];
      updatedSiswa[siswaIdx] = {
        ...updatedSiswa[siswaIdx],
        instansiNama: item.instansiNama,
        alamatInstansi: item.alamatInstansi,
        guruPembimbing: item.guruNama,
        guruNip: item.guruNip,
        periodeMulai: item.periodeMulai,
        periodeSelesai: item.periodeSelesai,
        statusPlotting: item.statusPlotting,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MASTER_SISWA, JSON.stringify(updatedSiswa));
      }
    }
  } catch (syncErr) {
    console.warn('Cross-sync plotting to master siswa warning:', syncErr);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const record: any = {
        nisn: item.nisn.trim(),
        nama_siswa: item.namaSiswa.trim(),
        kelas: item.kelas.trim(),
        jurusan: item.jurusan.trim(),
        instansi_nama: item.instansiNama?.trim() || '',
        alamat_instansi: item.alamatInstansi?.trim() || '',
        guru_nama: item.guruNama?.trim() || '',
        guru_nip: item.guruNip?.trim() || '',
        periode_mulai: item.periodeMulai?.trim() || '',
        periode_selesai: item.periodeSelesai?.trim() || '',
        status_plotting: item.statusPlotting || 'Terplotting',
        catatan: item.catatan?.trim() || '',
        updated_at: new Date().toISOString(),
      };
      if (isValidUUID(item.id)) {
        record.id = item.id;
      }

      await client
        .from('plotting_siswa_pkl')
        .upsert(record, { onConflict: 'nisn' });

      // Sinkronisasi otomatis ke master_siswa_pkl di Supabase
      try {
        await client
          .from('master_siswa_pkl')
          .upsert(
            {
              nisn: item.nisn.trim(),
              nama_lengkap: item.namaSiswa.trim(),
              kelas: item.kelas.trim(),
              jurusan: item.jurusan.trim(),
              guru_pembimbing: item.guruNama?.trim() || 'Belum Ditentukan',
              guru_nip: item.guruNip?.trim() || null,
              instansi_nama: item.instansiNama?.trim() || null,
              alamat_instansi: item.alamatInstansi?.trim() || null,
              periode_mulai: item.periodeMulai?.trim() || null,
              periode_selesai: item.periodeSelesai?.trim() || null,
              status_plotting: item.statusPlotting || 'Terplotting',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'nisn' }
          );
      } catch (siswaSyncErr) {
        console.warn('Auto-sync to master_siswa_pkl in savePlottingItem warning:', siswaSyncErr);
      }
    } catch (err) {
      console.warn('Supabase upsert plotting_siswa_pkl error:', err);
    }
  }

  return updatedList;
}

/**
 * Delete Plotting Item
 */
export async function deletePlottingItem(id: string): Promise<PlottingSiswaPKL[]> {
  const currentList = await getPlottingList();
  const updatedList = currentList.filter((p) => p.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PLOTTING, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'PLOTTING_SISWA_DELETED',
    payload: { id },
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('plotting_siswa_pkl').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete plotting_siswa_pkl error:', err);
    }
  }

  return updatedList;
}

/**
 * Batch insert / upsert Plotting Siswa PKL ke Supabase Cloud atau LocalStorage
 * Sekaligus melakukan sinkronisasi otomatis ke data Master Siswa, Master DUDI, dan Master Guru
 */
export async function insertPlottingBatch(incomingList: PlottingSiswaPKL[]): Promise<BatchInsertResult> {
  const client = getSupabaseClient();
  const currentList = await getPlottingList();

  const updatedList = [...currentList];
  incomingList.forEach((incoming) => {
    const cleanNisn = incoming.nisn.replace(/\s+/g, '');
    const existingIdx = updatedList.findIndex(
      (item) => item.nisn.replace(/\s+/g, '') === cleanNisn
    );
    if (existingIdx >= 0) {
      updatedList[existingIdx] = {
        ...updatedList[existingIdx],
        namaSiswa: incoming.namaSiswa || updatedList[existingIdx].namaSiswa,
        kelas: incoming.kelas || updatedList[existingIdx].kelas,
        jurusan: incoming.jurusan || updatedList[existingIdx].jurusan,
        instansiNama: incoming.instansiNama || updatedList[existingIdx].instansiNama,
        alamatInstansi: incoming.alamatInstansi || updatedList[existingIdx].alamatInstansi,
        guruNama: incoming.guruNama || updatedList[existingIdx].guruNama,
        guruNip: incoming.guruNip || updatedList[existingIdx].guruNip,
        periodeMulai: incoming.periodeMulai || updatedList[existingIdx].periodeMulai,
        periodeSelesai: incoming.periodeSelesai || updatedList[existingIdx].periodeSelesai,
        statusPlotting: incoming.statusPlotting || updatedList[existingIdx].statusPlotting,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedList.push(incoming);
    }
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PLOTTING, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'PLOTTING_SISWA_UPDATED',
    payload: updatedList,
  });

  // Sinkronisasi otomatis ke Master Siswa
  try {
    const currentSiswa = await getMasterSiswaList();
    const updatedSiswa = [...currentSiswa];

    incomingList.forEach((item) => {
      const cleanNisn = item.nisn.replace(/\s+/g, '');
      const sIdx = updatedSiswa.findIndex((s) => s.nisn.replace(/\s+/g, '') === cleanNisn);
      if (sIdx >= 0) {
        updatedSiswa[sIdx] = {
          ...updatedSiswa[sIdx],
          instansiNama: item.instansiNama || updatedSiswa[sIdx].instansiNama,
          alamatInstansi: item.alamatInstansi || updatedSiswa[sIdx].alamatInstansi,
          guruPembimbing: item.guruNama || updatedSiswa[sIdx].guruPembimbing,
          guruNip: item.guruNip || updatedSiswa[sIdx].guruNip,
          periodeMulai: item.periodeMulai || updatedSiswa[sIdx].periodeMulai,
          periodeSelesai: item.periodeSelesai || updatedSiswa[sIdx].periodeSelesai,
          statusPlotting: item.statusPlotting || updatedSiswa[sIdx].statusPlotting,
        };
      } else {
        // Jika siswa belum ada di master_siswa, tambahkan otomatis
        updatedSiswa.push({
          id: `ms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nisn: item.nisn,
          namaLengkap: item.namaSiswa,
          kelas: item.kelas,
          jurusan: item.jurusan,
          emailLogin: `${item.namaSiswa.toLowerCase().replace(/[^a-z0-9]/g, '.')}@smk.belajar.id`,
          passwordLogin: `Pkl#${item.nisn.slice(-4)}`,
          guruPembimbing: item.guruNama,
          guruNip: item.guruNip,
          instansiNama: item.instansiNama,
          alamatInstansi: item.alamatInstansi,
          periodeMulai: item.periodeMulai,
          periodeSelesai: item.periodeSelesai,
          statusPlotting: item.statusPlotting,
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MASTER_SISWA, JSON.stringify(updatedSiswa));
    }
  } catch (syncErr) {
    console.warn('Auto-sync to master siswa failed:', syncErr);
  }

  // Sinkronisasi otomatis ke Master Instansi jika ada DUDI baru
  try {
    const currentInstansi = await getMasterInstansiList();
    const newInstansiMap = new Map<string, string>();
    incomingList.forEach((item) => {
      if (item.instansiNama?.trim()) {
        const norm = item.instansiNama.toLowerCase().trim();
        if (!currentInstansi.some((i) => i.nama.toLowerCase().trim() === norm)) {
          newInstansiMap.set(norm, item.alamatInstansi || 'Kota Bandung / Jakarta');
        }
      }
    });

    if (newInstansiMap.size > 0) {
      const addedInstansi: MasterInstansi[] = Array.from(newInstansiMap.entries()).map(([normName, alamat], idx) => {
        // Ambil nama asli dari item
        const origItem = incomingList.find((i) => i.instansiNama.toLowerCase().trim() === normName);
        return {
          id: `inst-auto-${Date.now()}-${idx}`,
          nama: origItem ? origItem.instansiNama : normName,
          alamat: alamat,
          kuota: 4,
          pembimbingInstansi: 'Pembimbing Industri',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      const mergedInstansi = [...currentInstansi, ...addedInstansi];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MASTER_INSTANSI, JSON.stringify(mergedInstansi));
      }
    }
  } catch (instSyncErr) {
    console.warn('Auto-sync to master instansi warning:', instSyncErr);
  }

  // Sinkronisasi otomatis ke Master Guru jika ada Guru baru
  try {
    const currentGuru = await getMasterGuruList();
    const newGuruMap = new Map<string, { nip: string; nama: string }>();
    incomingList.forEach((item) => {
      if (item.guruNama?.trim()) {
        const cleanNip = item.guruNip?.replace(/\s+/g, '') || '';
        const normNama = item.guruNama.toLowerCase().trim();
        const exists = currentGuru.some(
          (g) => (cleanNip && g.nip.replace(/\s+/g, '') === cleanNip) || g.nama.toLowerCase().trim() === normNama
        );
        if (!exists) {
          newGuruMap.set(cleanNip || normNama, { nip: item.guruNip || '19800000 000000 0 000', nama: item.guruNama });
        }
      }
    });

    if (newGuruMap.size > 0) {
      const addedGuru: MasterGuruPembimbing[] = Array.from(newGuruMap.values()).map((g, idx) => ({
        id: `guru-auto-${Date.now()}-${idx}`,
        nip: g.nip,
        nama: g.nama,
        telepon: '0812-0000-0000',
        emailLogin: `${g.nama.toLowerCase().replace(/[^a-z0-9]/g, '.')}@smk.belajar.id`,
        passwordLogin: `Guru#${Date.now().toString().slice(-4)}`,
        bidangStudi: 'Produktif & Kejuruan',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      const mergedGuru = [...currentGuru, ...addedGuru];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MASTER_GURU, JSON.stringify(mergedGuru));
      }
    }
  } catch (guruSyncErr) {
    console.warn('Auto-sync to master guru warning:', guruSyncErr);
  }

  // Kirim ke Supabase jika terhubung
  if (client) {
    try {
      const recordsToInsert = incomingList.map((p) => {
        const item: any = {
          nisn: p.nisn.trim(),
          nama_siswa: p.namaSiswa.trim(),
          kelas: p.kelas.trim(),
          jurusan: p.jurusan.trim(),
          instansi_nama: p.instansiNama?.trim() || '',
          alamat_instansi: p.alamatInstansi?.trim() || '',
          guru_nama: p.guruNama?.trim() || '',
          guru_nip: p.guruNip?.trim() || '',
          periode_mulai: p.periodeMulai?.trim() || '',
          periode_selesai: p.periodeSelesai?.trim() || '',
          status_plotting: p.statusPlotting || 'Terplotting',
          catatan: p.catatan?.trim() || '',
          updated_at: new Date().toISOString(),
        };
        if (isValidUUID(p.id)) {
          item.id = p.id;
        }
        return item;
      });

      const { data, error } = await client
        .from('plotting_siswa_pkl')
        .upsert(recordsToInsert, { onConflict: 'nisn' })
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        data.forEach((dbRow: any) => {
          const idx = updatedList.findIndex((i) => i.nisn.replace(/\s+/g, '') === dbRow.nisn.replace(/\s+/g, ''));
          if (idx >= 0) {
            updatedList[idx].id = dbRow.id;
          }
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_PLOTTING, JSON.stringify(updatedList));
        }
      }

      // Sinkronisasi otomatis juga ke tabel master_siswa_pkl di Supabase jika ada
      try {
        const siswaSyncRecords = incomingList.map((p) => ({
          nisn: p.nisn.trim(),
          nama_lengkap: p.namaSiswa.trim(),
          kelas: p.kelas.trim(),
          jurusan: p.jurusan.trim(),
          guru_pembimbing: p.guruNama?.trim() || 'Belum Ditentukan',
          guru_nip: p.guruNip?.trim() || null,
          instansi_nama: p.instansiNama?.trim() || null,
          alamat_instansi: p.alamatInstansi?.trim() || null,
          periode_mulai: p.periodeMulai?.trim() || null,
          periode_selesai: p.periodeSelesai?.trim() || null,
          status_plotting: p.statusPlotting || 'Terplotting',
          updated_at: new Date().toISOString(),
        }));

        await client
          .from('master_siswa_pkl')
          .upsert(siswaSyncRecords, { onConflict: 'nisn' });
      } catch (siswaSyncErr) {
        console.warn('Auto-sync to Supabase master_siswa_pkl warning:', siswaSyncErr);
      }

      return {
        success: true,
        count: incomingList.length,
        savedToDatabase: true,
        message: `Berhasil menyimpan ${incomingList.length} data plotting siswa ke tabel "plotting_siswa_pkl" dan menyelaraskan "master_siswa_pkl" di Supabase Cloud!`,
      };
    } catch (err: any) {
      console.warn('Supabase batch insert plotting_siswa_pkl warning, saved locally:', err);
      const isTableMissing =
        err?.code === '42P01' ||
        err?.message?.toLowerCase().includes('does not exist') ||
        err?.message?.toLowerCase().includes('plotting_siswa_pkl');

      const message = isTableMissing
        ? `Tersimpan di penyimpanan lokal browser (${incomingList.length} data). Perhatian: Tabel "plotting_siswa_pkl" belum dibuat di Supabase Cloud Anda. Silakan salin & jalankan skrip SQL di Supabase SQL Editor.`
        : `Tersimpan di penyimpanan lokal (${incomingList.length} plotting). Catatan Supabase: ${err?.message || 'Database offline.'}`;

      return {
        success: true,
        count: incomingList.length,
        savedToDatabase: false,
        message,
      };
    }
  }

  return {
    success: true,
    count: incomingList.length,
    savedToDatabase: false,
    message: `Tersimpan di penyimpanan lokal browser (${incomingList.length} plotting). Supabase belum dihubungkan (klik menu Supabase di kanan atas untuk menghubungkan database online).`,
  };
}

/**
 * Sinkronkan seluruh data plotting dari LocalStorage ke database Supabase Cloud
 */
export async function syncPlottingToSupabase(): Promise<BatchInsertResult> {
  const currentList = await getPlottingList();
  if (currentList.length === 0) {
    return {
      success: false,
      count: 0,
      savedToDatabase: false,
      message: 'Tidak ada data plotting yang tersimpan di lokal untuk disinkronkan.',
    };
  }
  return await insertPlottingBatch(currentList);
}

/**
 * Cek apakah tabel plotting_siswa_pkl sudah ada di database Supabase Cloud
 */
export async function checkPlottingTableStatus(): Promise<{
  connected: boolean;
  tableExists: boolean;
  rowCount: number;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      tableExists: false,
      rowCount: 0,
      message: 'Database Supabase belum terhubung. Konfigurasikan URL dan Anon Key di menu Supabase.',
    };
  }

  try {
    const { count, error } = await client
      .from('plotting_siswa_pkl')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist')) {
        return {
          connected: true,
          tableExists: false,
          rowCount: 0,
          message: 'Tabel "plotting_siswa_pkl" belum dibuat di database Supabase Anda. Perlu menjalankan skrip SQL.',
        };
      }
      return {
        connected: true,
        tableExists: false,
        rowCount: 0,
        message: `Koneksi ke tabel gagal: ${error.message}`,
      };
    }

    return {
      connected: true,
      tableExists: true,
      rowCount: count ?? 0,
      message: `Tabel "plotting_siswa_pkl" aktif di Supabase Cloud (${count ?? 0} data tersimpan).`,
    };
  } catch (err: any) {
    return {
      connected: true,
      tableExists: false,
      rowCount: 0,
      message: err?.message || 'Gagal memeriksa status tabel database.',
    };
  }
}

// =========================================================================
// PENGUJI SIDANG & USER MANAGEMENT CRUD
// =========================================================================

/**
 * Mengambil daftar penguji sidang dari Supabase Cloud atau LocalStorage
 */
export async function getPengujiList(): Promise<Penguji[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('penguji')
        .select('*')
        .order('nip', { ascending: true });

      if (!error && data) {
        if (data.length > 0) {
          const mapped: Penguji[] = data.map((d: any) => ({
            id: d.id,
            nama: d.nama,
            nip: d.nip,
            peran: d.peran,
            avatar: d.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            email: d.email || `${d.nip}@smk-vokasi.sch.id`,
            password: d.password || 'penguji123',
            telepon: d.telepon || '0812-0000-0000',
            instansiAsal: d.instansi_asal || 'SMK Negeri Vokasi',
            bidangKeahlian: d.bidang_keahlian || 'Teknologi Informasi',
            isActive: d.is_active !== false,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));

          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_PENGUJI, JSON.stringify(mapped));
          }
          return mapped;
        } else {
          // Tabel penguji ada di Supabase tetapi masih kosong -> Seed data bawaan secara otomatis
          try {
            const seedPayload = DAFTAR_PENGUJI.map((p) => ({
              nip: p.nip,
              nama: p.nama,
              peran: p.peran,
              avatar: p.avatar,
              email: p.email,
              password: p.password,
              telepon: p.telepon,
              instansi_asal: p.instansiAsal,
              bidang_keahlian: p.bidangKeahlian,
              is_active: p.isActive !== false,
            }));

            const { data: seededRows, error: seedErr } = await client
              .from('penguji')
              .upsert(seedPayload, { onConflict: 'nip' })
              .select();

            if (!seedErr && seededRows && seededRows.length > 0) {
              const mappedSeeded: Penguji[] = seededRows.map((d: any) => ({
                id: d.id,
                nama: d.nama,
                nip: d.nip,
                peran: d.peran,
                avatar: d.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                email: d.email || `${d.nip}@smk-vokasi.sch.id`,
                password: d.password || 'penguji123',
                telepon: d.telepon || '0812-0000-0000',
                instansiAsal: d.instansi_asal || 'SMK Negeri Vokasi',
                bidangKeahlian: d.bidang_keahlian || 'Teknologi Informasi',
                isActive: d.is_active !== false,
                createdAt: d.created_at,
                updatedAt: d.updated_at,
              }));
              if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY_PENGUJI, JSON.stringify(mappedSeeded));
              }
              return mappedSeeded;
            }
          } catch (seedError) {
            console.warn('Auto-seed penguji to Supabase warning:', seedError);
          }
        }
      }
    } catch (err) {
      console.warn('Supabase fetch penguji error, falling back to local store:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_PENGUJI);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    // initialize default seed
    localStorage.setItem(STORAGE_KEY_PENGUJI, JSON.stringify(DAFTAR_PENGUJI));
  }

  return DAFTAR_PENGUJI;
}

/**
 * Menyimpan / memperbarui data penguji sidang
 */
export async function savePenguji(penguji: Penguji): Promise<Penguji[]> {
  const currentList = await getPengujiList();
  const existingIdx = currentList.findIndex(
    (p) => p.id === penguji.id || p.nip.trim() === penguji.nip.trim()
  );

  const now = new Date().toISOString();
  let pengujiWithTimestamps: Penguji = {
    ...penguji,
    nama: penguji.nama.trim(),
    nip: penguji.nip.trim(),
    peran: penguji.peran.trim(),
    isActive: penguji.isActive !== false,
    createdAt: penguji.createdAt || now,
    updatedAt: now,
  };

  const client = getSupabaseClient();
  if (client) {
    const recordToUpsert: any = {
      nama: pengujiWithTimestamps.nama,
      nip: pengujiWithTimestamps.nip,
      peran: pengujiWithTimestamps.peran,
      avatar: pengujiWithTimestamps.avatar,
      email: pengujiWithTimestamps.email?.trim() || null,
      password: pengujiWithTimestamps.password?.trim() || 'penguji123',
      telepon: pengujiWithTimestamps.telepon?.trim() || null,
      instansi_asal: pengujiWithTimestamps.instansiAsal?.trim() || 'SMK Negeri 1 Vokasi',
      bidang_keahlian: pengujiWithTimestamps.bidangKeahlian?.trim() || null,
      is_active: pengujiWithTimestamps.isActive,
      updated_at: now,
    };

    // PENTING: Hanya sertakan 'id' jika merupakan UUID valid.
    // Jika 'id' adalah string biasa (seperti 'p1', 'penguji-172...'), jangan sertakan
    // agar Supabase PostgreSQL otomatis mengenerate gen_random_uuid() dan mencocokkan via NIP unik.
    if (isValidUUID(pengujiWithTimestamps.id)) {
      recordToUpsert.id = pengujiWithTimestamps.id;
    }

    const { data: supaData, error: supaError } = await client
      .from('penguji')
      .upsert(recordToUpsert, { onConflict: 'nip' })
      .select()
      .single();

    if (supaError) {
      console.error('Supabase upsert penguji error:', supaError);
      if (supaError.code === '42P01' || supaError.message?.toLowerCase().includes('does not exist')) {
        throw new Error(
          'Tabel "penguji" belum dibuat di database Supabase Anda. Silakan buka menu Supabase di pojok kanan atas dan jalankan Skrip SQL Penguji & Guru.'
        );
      }
      if (supaError.code === '23505') {
        throw new Error(`NIP "${pengujiWithTimestamps.nip}" sudah digunakan oleh penguji lain di database.`);
      }
      throw new Error(`Gagal menyimpan ke database Supabase: ${supaError.message} (Kode: ${supaError.code})`);
    }

    if (supaData && supaData.id) {
      pengujiWithTimestamps = {
        ...pengujiWithTimestamps,
        id: supaData.id,
        createdAt: supaData.created_at || pengujiWithTimestamps.createdAt,
        updatedAt: supaData.updated_at || pengujiWithTimestamps.updatedAt,
      };
    }
  }

  let updatedList: Penguji[];
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = pengujiWithTimestamps;
  } else {
    updatedList = [...currentList, pengujiWithTimestamps];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PENGUJI, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'PENGUJI_UPDATED' as any,
    payload: pengujiWithTimestamps,
  });

  return updatedList;
}

/**
 * Menghapus penguji sidang
 */
export async function deletePenguji(id: string): Promise<{ success: boolean; list: Penguji[]; message: string }> {
  const currentList = await getPengujiList();
  if (currentList.length <= 1) {
    return {
      success: false,
      list: currentList,
      message: 'Minimal harus ada 1 penguji sidang aktif yang terdaftar di sistem.',
    };
  }

  const target = currentList.find((p) => p.id === id);
  const updatedList = currentList.filter((p) => p.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PENGUJI, JSON.stringify(updatedList));
  }

  broadcastRealtimeChange({
    type: 'PENGUJI_DELETED' as any,
    payload: { id, nip: target?.nip },
  });

  const client = getSupabaseClient();
  if (client && target) {
    try {
      if (isValidUUID(target.id)) {
        const { error } = await client.from('penguji').delete().eq('id', target.id);
        if (error) console.warn('Supabase delete penguji by id error:', error);
      } else {
        const { error } = await client.from('penguji').delete().eq('nip', target.nip);
        if (error) console.warn('Supabase delete penguji by nip error:', error);
      }
    } catch (err) {
      console.warn('Supabase delete penguji error:', err);
    }
  }

  return {
    success: true,
    list: updatedList,
    message: 'Data penguji sidang berhasil dihapus.',
  };
}

/**
 * Reset data penguji kembali ke seed default
 */
export async function resetPengujiToDefault(): Promise<Penguji[]> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PENGUJI, JSON.stringify(DAFTAR_PENGUJI));
  }

  broadcastRealtimeChange({
    type: 'PENGUJI_UPDATED' as any,
    payload: DAFTAR_PENGUJI,
  });

  return DAFTAR_PENGUJI;
}

// =========================================================================
// PENGATURAN PASANGAN PENGUJI PER RUANGAN (RUANG 1, 2, 3)
// =========================================================================

/**
 * Menghasilkan susunan pasangan penguji default untuk Ruang 1, Ruang 2, dan Ruang 3
 */
export function getDefaultRoomPairings(pengujiList?: Penguji[]): PasanganPengujiRuangan[] {
  const pList = pengujiList && pengujiList.length > 0 ? pengujiList : DAFTAR_PENGUJI;

  // Pasangkan penguji secara seimbang
  const p1 = pList[0]?.id || 'p1';
  const p2 = pList[1]?.id || pList[0]?.id || 'p2';

  const p3 = pList[2]?.id || pList[0]?.id || 'p1';
  const p4 = pList[3]?.id || pList[1]?.id || 'p2';

  const p5 = pList[4]?.id || pList[0]?.id || 'p1';
  const p6 = pList[5]?.id || pList[1]?.id || 'p2';

  const now = new Date().toISOString();

  return [
    {
      ruanganId: 'ruang-1',
      namaRuangan: 'Ruang Sidang 1',
      kodeRuangan: 'Ruang 1',
      lokasi: 'Gedung A Lt. 2 (Ruang Utama Sidang RPL)',
      penguji1Id: p1,
      penguji2Id: p2,
      keterangan: 'Sesi Pengujian Bidang Rekayasa Perangkat Lunak & Basis Data',
      updatedAt: now,
    },
    {
      ruanganId: 'ruang-2',
      namaRuangan: 'Ruang Sidang 2',
      kodeRuangan: 'Ruang 2',
      lokasi: 'Gedung B Lt. 1 (Lab SIJA & Internet of Things)',
      penguji1Id: p3,
      penguji2Id: p4,
      keterangan: 'Sesi Pengujian Bidang Sistem Informasi Jaringan & Cloud',
      updatedAt: now,
    },
    {
      ruanganId: 'ruang-3',
      namaRuangan: 'Ruang Sidang 3',
      kodeRuangan: 'Ruang 3',
      lokasi: 'Gedung C Lt. 2 (Studio Multimedia & DKV)',
      penguji1Id: p5,
      penguji2Id: p6,
      keterangan: 'Sesi Pengujian Bidang Desain Komunikasi Visual & TKJ',
      updatedAt: now,
    },
  ];
}

/**
 * Mengambil data pasangan penguji ruangan (Ruang 1, 2, 3) dari Supabase / LocalStorage
 */
export async function getRoomPairingsList(pengujiList?: Penguji[]): Promise<PasanganPengujiRuangan[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('pengaturan_ruangan_sidang')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: PasanganPengujiRuangan[] = data.map((d: any) => ({
          ruanganId: d.id,
          namaRuangan: d.nama_ruangan,
          kodeRuangan: d.nama_ruangan.replace(/Sidang\s+/i, ''),
          lokasi: d.lokasi,
          penguji1Id: d.penguji1_id,
          penguji2Id: d.penguji2_id,
          keterangan: d.keterangan,
          updatedAt: d.updated_at,
        }));

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_ROOM_PAIRINGS, JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch (supaErr) {
      console.warn('Fetch pengaturan_ruangan_sidang error, fallback to local store:', supaErr);
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_ROOM_PAIRINGS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
  }

  // Gunakan data bawaan jika belum pernah diatur
  const defaults = getDefaultRoomPairings(pengujiList);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ROOM_PAIRINGS, JSON.stringify(defaults));
  }
  return defaults;
}

/**
 * Menyimpan pengaturan pasangan penguji ruangan (Ruang 1, Ruang 2, Ruang 3)
 */
export async function saveRoomPairings(
  pairings: PasanganPengujiRuangan[]
): Promise<PasanganPengujiRuangan[]> {
  const now = new Date().toISOString();
  const withTimestamps = pairings.map((p) => ({
    ...p,
    updatedAt: now,
  }));

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ROOM_PAIRINGS, JSON.stringify(withTimestamps));
  }

  broadcastRealtimeChange({
    type: 'ROOM_PAIRINGS_UPDATED' as any,
    payload: withTimestamps,
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      const recordsToUpsert = withTimestamps.map((p) => ({
        id: p.ruanganId,
        nama_ruangan: p.namaRuangan,
        lokasi: p.lokasi || null,
        penguji1_id: p.penguji1Id,
        penguji2_id: p.penguji2Id,
        keterangan: p.keterangan || null,
        updated_at: now,
      }));

      const { error } = await client
        .from('pengaturan_ruangan_sidang')
        .upsert(recordsToUpsert, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase upsert pengaturan_ruangan_sidang warning:', error);
      }
    } catch (err) {
      console.warn('Supabase upsert pengaturan_ruangan_sidang error:', err);
    }
  }

  return withTimestamps;
}

// =========================================================================
// AUTHENTICATION & SESSION MANAGEMENT
// =========================================================================

/**
 * Mengambil session user saat ini (Admin atau Penguji)
 * Mengembalikan null jika pengguna belum login sehingga dialihkan ke layar login utama
 */
export function getCurrentAuthUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.role) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
  }
  return null;
}

/**
 * Mengimpor Guru Pembimbing menjadi Penguji Sidang
 */
export async function importGuruAsPenguji(
  guru: MasterGuruPembimbing,
  peran: string = 'Penguji 2 (Sekretaris)'
): Promise<Penguji[]> {
  const currentList = await getPengujiList();
  const cleanNip = guru.nip.replace(/\s+/g, '');

  const existingIdx = currentList.findIndex(
    (p) => p.nip.replace(/\s+/g, '') === cleanNip || p.id === guru.id
  );

  const pengujiData: Penguji = {
    id: existingIdx >= 0 ? currentList[existingIdx].id : (isValidUUID(guru.id) ? guru.id : `p-${Date.now()}`),
    nip: guru.nip,
    nama: guru.nama,
    peran: peran,
    avatar: guru.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: guru.emailLogin,
    password: guru.passwordLogin || 'penguji123',
    telepon: guru.telepon || '0812-0000-0000',
    instansiAsal: 'SMK Negeri 1 Vokasi',
    bidangKeahlian: guru.bidangStudi || 'Produktif & Kejuruan',
    isActive: true,
  };

  return await savePenguji(pengujiData);
}

/**
 * Simpan session user yang sedang aktif
 */
export function setCurrentAuthUser(user: AuthUser | null): void {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }

  broadcastRealtimeChange({
    type: 'AUTH_CHANGED' as any,
    payload: user,
  });
}

/**
 * Login user (Admin atau Penguji)
 */
export async function loginUser(
  identifier: string,
  password: string,
  targetRole?: 'admin' | 'penguji'
): Promise<{ success: boolean; user?: AuthUser; message: string }> {
  const cleanId = identifier.trim();
  const cleanPass = password.trim();

  if (!cleanId) {
    return { success: false, message: 'Masukkan NIP, Email, atau Username Anda.' };
  }
  if (!cleanPass) {
    return { success: false, message: 'Masukkan kata sandi akun Anda.' };
  }

  // 1. Cek Admin Login
  if (
    cleanId.toLowerCase() === 'admin' ||
    cleanId.toLowerCase() === 'admin@mypkl.id' ||
    targetRole === 'admin'
  ) {
    if (cleanPass === 'admin123' || cleanPass === 'adminPKL2026') {
      const adminUser: AuthUser = {
        id: 'admin-01',
        nama: 'Administrator PKL & Sidang',
        usernameOrNip: 'admin',
        role: 'admin',
        email: 'admin@mypkl.id',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        loginAt: new Date().toISOString(),
      };
      setCurrentAuthUser(adminUser);
      return { success: true, user: adminUser, message: 'Berhasil masuk sebagai Administrator!' };
    } else if (targetRole === 'admin' || cleanId.toLowerCase() === 'admin') {
      return { success: false, message: 'Kata sandi administrator tidak sesuai. Silakan coba lagi.' };
    }
  }

  // 2. Cek Penguji Login
  const pengujiList = await getPengujiList();
  const matchedPenguji = pengujiList.find(
    (p) =>
      p.nip.toLowerCase() === cleanId.toLowerCase() ||
      p.email?.toLowerCase() === cleanId.toLowerCase() ||
      p.nama.toLowerCase() === cleanId.toLowerCase()
  );

  if (matchedPenguji) {
    // Verifikasi password akun penguji
    const validPassword = matchedPenguji.password || 'penguji123';
    if (cleanPass === validPassword) {
      const pengujiUser: AuthUser = {
        id: matchedPenguji.id,
        nama: matchedPenguji.nama,
        usernameOrNip: matchedPenguji.nip,
        role: 'penguji',
        pengujiId: matchedPenguji.id,
        email: matchedPenguji.email,
        avatar: matchedPenguji.avatar,
        loginAt: new Date().toISOString(),
      };
      setCurrentAuthUser(pengujiUser);
      return {
        success: true,
        user: pengujiUser,
        message: `Selamat datang, ${matchedPenguji.nama} (${matchedPenguji.peran})!`,
      };
    } else {
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali kata sandi Anda.' };
    }
  }

  return {
    success: false,
    message: 'Akun tidak ditemukan. Periksa kembali NIP, Email, atau Username yang Anda masukkan.',
  };
}

/**
 * Logout user
 */
export function logoutUser(): void {
  setCurrentAuthUser(null);
}
