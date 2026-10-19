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
  peran: 'Penguji 1 (Ketua)' | 'Penguji 2 (Sekretaris)' | 'Penguji 3 (Anggota)';
  avatar: string;
}

export interface KriteriaNilai {
  id: string;
  nama: string;
  deskripsi: string;
  bobot: number; // Percentage e.g. 25
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
  totalNilai: number; // 0 - 100
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
    totalNilai: number;
    nilaiHuruf: string;
    catatanRevisi: string;
    rekomendasiStatus: string;
    updatedAt: string;
  }[];
  nilaiAkhirAngka: number;
  nilaiAkhirHuruf: 'A' | 'B' | 'C' | 'D' | 'E';
  predikat: string;
  keputusanAkhir: 'LULUS DENGAN PUJIAN' | 'LULUS' | 'LULUS REVISI' | 'MENGULANG' | 'BELUM DINILAI';
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
  instansiId?: string;
  instansiNama?: string;
  pembimbingInstansi?: string;
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
