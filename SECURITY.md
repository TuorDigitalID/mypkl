# Panduan Keamanan (Security Guidelines) - My PKL

Dokumen ini menjelaskan praktik keamanan penting sebelum dan sesudah Anda mengunggah atau mendistribusikan kode sumber proyek **My PKL** ke GitHub atau layanan hosting produksi.

---

## 1. Pemisahan Kunci API Supabase (SANGAT PENTING)

Supabase memiliki dua jenis API Key:
1. **`anon` (public)**:
   - **Boleh berada di frontend**: Kunci ini dirancang untuk browser pengguna.
   - **Aman**: Hak akses dibatasi oleh aturan **Row Level Security (RLS)** yang telah terpasang di database.
   - Aplikasi My PKL ini sudah dilengkapi pendeteksi otomatis yang mencegah kunci admin masuk ke frontend.
2. **`service_role` (Super Admin)**:
   - ⚠️ **DILARANG KERAS** dimasukkan ke dalam kode frontend atau diunggah ke GitHub!
   - Kunci ini membypass seluruh RLS dan memiliki hak akses total untuk membaca/menghapus seluruh database Anda.

---

## 2. Aturan File Git (.gitignore)

Sebelum melakukan `git push`, pastikan file-file berikut tidak terlacak oleh Git:
- `.env` dan `.env.*.local` (berisi URL atau Key sesungguhnya).
- `node_modules/` (dependensi pihak ketiga).
- File spreadsheet / Excel asli yang berisi data pribadi siswa sesungguhnya.

File `.gitignore` pada repositori ini telah dikonfigurasi untuk memblokir otomatis file-file tersebut. Gunakan `.env.example` sebagai contoh acuan.

---

## 3. Row Level Security (RLS) di Supabase

Skrip SQL yang disertakan di menu **Supabase: Siap Setup** sudah mengaktifkan RLS:
```sql
ALTER TABLE public.peserta_sidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penguji ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian_sidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_siswa_pkl ENABLE ROW LEVEL SECURITY;
```
Pastikan seluruh skrip SQL dijalankan di *Supabase SQL Editor* Anda untuk menjamin keamanan tabel.

---

## 4. Perlindungan Input Pengguna (Sanitasi & XSS)

- Semua data dari formulir dan unggahan file Excel divalidasi dan dinormalisasi sebelum disimpan.
- Password login siswa disamarkan secara default (`••••••••`) di tampilan dashboard untuk menjaga privasi di ruang sidang umum atau proyektor.

---

## 5. Checklist Sebelum Push ke GitHub:

Jalankan perintah berikut di terminal komputer Anda:
```bash
# 1. Cek apakah ada file rahasia yang tidak sengaja staged:
git status

# 2. Tambahkan file dan commit:
git add .
git commit -m "feat: initial commit for My PKL dashboard"

# 3. Push ke GitHub:
git push origin main
```
