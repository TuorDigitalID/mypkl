export type StatusSidang = 'menunggu' | 'berlangsung' | 'selesai' | 'ditunda';

export interface MahasiswaSidang {
  id: string;
  nim: string;
  nama: string;
  prodi: string; // Jurusan / Program Keahlian
  kelas: string;
  perusahaan: string; // Tempat PKL / DUDI
  judulLaporan: string;
  pembimbingDudi: string;
  pembimbingSekolah: string;
  jadwalSidang: string; // format ISO or date-time
  ruangan: string;
  status: StatusSidang;
  avatarUrl?: string;
}

export interface Penguji {
  id: string;
  nama: string;
  nip: string;
  peran: string; // e.g. 'Penguji 1 (Ketua)', 'Penguji 2 (Sekretaris)', 'Penguji 3 (Anggota)', 'Penguji DUDI'
  avatar: string;
  email?: string;
  password?: string;
  telepon?: string;
  instansiAsal?: string;
  bidangKeahlian?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  nama: string;
  usernameOrNip: string;
  role: 'admin' | 'penguji';
  pengujiId?: string;
  email?: string;
  avatar?: string;
  loginAt: string;
}

export interface KriteriaNilai {
  id: string;
  nomor?: number;
  nama: string;
  deskripsi: string;
  kategori?: 'agenda' | 'sidang';
  kategoriNama?: string;
  bobot: number; // Persentase bobot e.g. 10 atau 25
  nilaiMaksimal: number; // 100
}

export interface NilaiKriteriaItem {
  kriteriaId: string;
  skor: number; // 0 - 100
}

export interface PenilaianPenguji {
  id: string;
  mahasiswaId: string;
  pengujiId: string;
  pengujiNama: string;
  pengujiPeran: string;
  nilaiItems: NilaiKriteriaItem[];
  subtotalAgenda?: number; // Skor rata-rata Buku Agenda (0-100)
  subtotalSidang?: number; // Skor rata-rata Ujian Sidang (0-100)
  totalNilai: number; // 0 - 100 (50% Agenda + 50% Sidang)
  nilaiHuruf: 'A' | 'B' | 'C' | 'D' | 'E';
  catatanRevisi: string;
  rekomendasiStatus: 'Lulus' | 'Lulus dengan Revisi' | 'Mengulang Sidang';
  isDraft: boolean;
  updatedAt: string;
}

export interface HasilRekapitulasi {
  mahasiswaId: string;
  totalPengujiMenilai: number;
  totalPengujiWajib: number;
  nilaiPerPenguji: {
    pengujiId: string;
    pengujiNama: string;
    pengujiPeran: string;
    subtotalAgenda?: number;
    subtotalSidang?: number;
    totalNilai: number;
    nilaiHuruf: string;
    catatanRevisi: string;
    rekomendasiStatus: string;
    updatedAt: string;
  }[];
  // Rincian Formula 2 Penguji (50% Sidang [P1+P2] + 50% Jurnal PKL)
  nilaiJurnalPkl: number;       // Rata-rata 5 Aspek Buku Agenda (0 - 100)
  poinJurnalPkl50: number;      // Poin Terbobot Jurnal PKL (maks 50)
  nilaiSidangP1: number;        // Nilai Sidang Penguji 1 (0 - 100)
  nilaiSidangP2: number;        // Nilai Sidang Penguji 2 (0 - 100)
  nilaiSidangGabungan: number;  // Rata-rata Nilai Sidang (P1 + P2)/2 (0 - 100)
  poinSidang50: number;         // Poin Terbobot Sidang (maks 50)
  nilaiAkhirAngka: number;      // Nilai Akhir (100%): poinJurnalPkl50 + poinSidang50
  nilaiAkhirHuruf: 'A' | 'B' | 'C' | 'D' | 'E';
  predikat: string;
  keputusanAkhir: 'LULUS (AMAT KOMPETEN)' | 'LULUS (KOMPETEN)' | 'LULUS (BATAS KKM)' | 'BELUM LULUS (REMEDIAL)' | 'BELUM DINILAI';
  isLengkap: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableNameSidang: string;
  tableNameNilai: string;
  isConnected: boolean;
}

export interface MasterSiswaPKL {
  id: string;
  nisn: string;
  namaLengkap: string;
  kelas: string;
  jurusan: string;
  emailLogin: string;
  passwordLogin: string;
  guruPembimbing: string;
  guruNip?: string;
  instansiId?: string;
  instansiNama?: string;
  alamatInstansi?: string;
  pembimbingInstansi?: string;
  periodeMulai?: string;
  periodeSelesai?: string;
  statusPlotting?: StatusPlotting;
  createdAt?: string;
}

export interface MasterJurusan {
  id: string;
  kode: string; // e.g. 'RPL', 'TKJ', 'SIJA', 'DKV'
  nama: string; // e.g. 'Rekayasa Perangkat Lunak'
  bidangKeahlian: string; // e.g. 'Teknologi Informasi & Komunikasi'
  kepalaProgram: string;
  deskripsi?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterInstansi {
  id: string;
  nama: string; // Nama Instansi / Perusahaan
  alamat: string; // Alamat Lengkap
  kuota: number; // Kuota Siswa
  pembimbingInstansi: string; // Nama Pembimbing Instansi
  kontakPerson?: string; // No HP / Telepon / PIC
  email?: string;
  bidangUsaha?: string; // Bidang Usaha / Industri
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterGuruPembimbing {
  id: string;
  nip: string; // NIP / NIK
  nama: string; // Nama Guru Pembimbing
  telepon: string; // Telepon / WhatsApp
  emailLogin: string; // Email Login
  passwordLogin: string; // Password Login
  bidangStudi?: string; // Bidang Keahlian / Mata Pelajaran
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type StatusPlotting = 'Terplotting' | 'Belum Terplotting' | 'Sedang PKL' | 'Selesai PKL';

export interface PlottingSiswaPKL {
  id: string;
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  kelas: string;
  jurusan: string;
  instansiId?: string;
  instansiNama: string; // Instansi PKL (Penempatan)
  alamatInstansi: string; // Alamat Instansi
  pembimbingInstansi?: string;
  guruId?: string;
  guruNama: string; // Guru Pembimbing Sekolah
  guruNip: string; // NIP Guru Pembimbing
  guruTelepon?: string;
  periodeMulai: string; // Periode Mulai PKL
  periodeSelesai: string; // Periode Selesai PKL
  statusPlotting: StatusPlotting;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}
