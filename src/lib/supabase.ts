import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { MahasiswaSidang, PenilaianPenguji, SupabaseConfig, MasterSiswaPKL, MasterJurusan } from '../types/index.ts';
import { INITIAL_MASTER_JURUSAN } from '../data/jurusan.ts';

const STORAGE_KEY_SUPABASE = 'my_pkl_supabase_config';
const STORAGE_KEY_PESERTA = 'my_pkl_peserta_sidang';
const STORAGE_KEY_PENILAIAN = 'my_pkl_penilaian_sidang';
const STORAGE_KEY_MASTER_SISWA = 'my_pkl_master_siswa';
const STORAGE_KEY_MASTER_JURUSAN = 'my_pkl_master_jurusan';

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
      { kriteriaId: 'k1', skor: 88 },
      { kriteriaId: 'k2', skor: 92 },
      { kriteriaId: 'k3', skor: 90 },
      { kriteriaId: 'k4', skor: 86 },
    ],
    totalNilai: 89.3,
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
      { kriteriaId: 'k1', skor: 85 },
      { kriteriaId: 'k2', skor: 88 },
      { kriteriaId: 'k3', skor: 92 },
      { kriteriaId: 'k4', skor: 85 },
    ],
    totalNilai: 87.45,
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
      { kriteriaId: 'k1', skor: 90 },
      { kriteriaId: 'k2', skor: 94 },
      { kriteriaId: 'k3', skor: 88 },
      { kriteriaId: 'k4', skor: 90 },
    ],
    totalNilai: 91.0,
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
      { kriteriaId: 'k1', skor: 85 },
      { kriteriaId: 'k2', skor: 90 },
      { kriteriaId: 'k3', skor: 85 },
      { kriteriaId: 'k4', skor: 80 },
    ],
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
 * Save / Update Penilaian from an Examiner
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

  // Broadcast realtime across tabs
  broadcastRealtimeChange({
    type: 'PENILAIAN_UPDATED',
    payload: penilaian,
  });

  // Save to Supabase if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      const config = getSupabaseConfig();
      await client.from(config.tableNameNilai).upsert({
        id: penilaian.id,
        mahasiswa_id: penilaian.mahasiswaId,
        penguji_id: penilaian.pengujiId,
        penguji_nama: penilaian.pengujiNama,
        penguji_peran: penilaian.pengujiPeran,
        nilai_items: penilaian.nilaiItems,
        total_nilai: penilaian.totalNilai,
        nilai_huruf: penilaian.nilaiHuruf,
        catatan_revisi: penilaian.catatanRevisi,
        rekomendasi_status: penilaian.rekomendasiStatus,
        is_draft: penilaian.isDraft,
        updated_at: new Date().toISOString(),
      });
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
        .channel('sidang_evaluasi_room')
        .on('broadcast', { event: '*' }, (payload: any) => {
          if (payload && payload.event) {
            callback({ type: payload.event, payload: payload.payload });
          }
        })
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
        return JSON.parse(raw);
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
