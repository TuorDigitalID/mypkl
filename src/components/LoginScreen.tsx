import React, { useState } from 'react';
import { 
  GraduationCap, 
  KeyRound, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  ClipboardCheck,
  FolderTree,
  Scale
} from 'lucide-react';
import { Penguji, AuthUser, MasterGuruPembimbing } from '../types/index.ts';
import { loginUser } from '../lib/supabase.ts';

interface LoginScreenProps {
  pengujiList: Penguji[];
  guruList?: MasterGuruPembimbing[];
  onLoginSuccess: (user: AuthUser, penguji?: Penguji) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  pengujiList,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'penguji' | 'admin'>('penguji');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Login as Examiner via Form
  const handleSubmitPengujiForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Masukkan NIP atau Email Penguji Sidang.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await loginUser(identifier.trim(), password.trim(), 'penguji');
      if (res.success && res.user) {
        setSuccessMsg(res.message);
        const matched = pengujiList.find(
          (p) => p.id === res.user?.pengujiId || p.nip === res.user?.usernameOrNip
        );
        setTimeout(() => {
          onLoginSuccess(res.user!, matched);
        }, 400);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Quick Login for Examiner (1-Click)
  const handleQuickLoginPenguji = async (penguji: Penguji) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await loginUser(penguji.id, penguji.password || 'penguji123', 'penguji');
      if (res.success && res.user) {
        setSuccessMsg(`Berhasil masuk sebagai ${penguji.nama}!`);
        setTimeout(() => {
          onLoginSuccess(res.user!, penguji);
        }, 300);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login as Admin via Form
  const handleSubmitAdminForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Masukkan username atau email admin.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await loginUser(identifier.trim(), password.trim(), 'admin');
      if (res.success && res.user) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 400);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal masuk sebagai admin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 1-Click Admin Quick Login
  const handleQuickAdminLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await loginUser('admin', 'admin123', 'admin');
      if (res.success && res.user) {
        setSuccessMsg('Berhasil masuk sebagai Administrator!');
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 300);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal login admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-between antialiased selection:bg-orange-500 selection:text-white">
      {/* Top Banner Accent */}
      <div className="h-2 w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-xs" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
          
          {/* Left Hero & Role Guidance Column (5 cols on lg) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-700 via-orange-700 to-orange-950 p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Circles */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-orange-400/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg text-amber-200">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-2xl tracking-tight text-white">
                      My PKL
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                      Vokasi
                    </span>
                  </div>
                  <p className="text-xs text-orange-200/90 font-medium">
                    Portal Sidang & Plotting Industri
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Selamat Datang di Portal Evaluasi Sidang PKL
                </h2>
                <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed">
                  Silakan masuk sesuai peran dan hak akses Anda. Sistem menerapkan pembatasan hak akses ketat antara <strong>Dewan Penguji</strong> dan <strong>Administrator</strong>.
                </p>
              </div>

              {/* Role Cards Explanation */}
              <div className="space-y-3 pt-2">
                {/* Penguji Card */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  activeTab === 'penguji'
                    ? 'bg-white/15 border-white/40 shadow-md ring-1 ring-white/30'
                    : 'bg-white/5 border-white/10 opacity-80'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>Dewan Penguji Sidang</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/30 text-amber-100 border border-amber-300/30">
                          Penguji 1 & 2
                        </span>
                      </h4>
                      <p className="text-xs text-orange-200/90 mt-0.5">
                        Hak akses khusus: <strong>Hanya input penilaian sidang</strong> & antrean siswa per perusahaan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Card */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white/15 border-white/40 shadow-md ring-1 ring-white/30'
                    : 'bg-white/5 border-white/10 opacity-80'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-400/20 text-orange-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Administrator PKL</h4>
                      <p className="text-xs text-orange-200/90 mt-0.5">
                        Hak akses penuh: Manajemen Master Siswa, DUDI, Guru, Plotting, Rekapitulasi & Supabase.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Badge Footer */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 text-xs text-orange-200/80 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-300" />
                <span>Formula 50% Jurnal + 50% Sidang (P1+P2)</span>
              </span>
              <span className="font-mono text-[11px] bg-black/20 px-2 py-0.5 rounded border border-white/10">
                TA 2026/2027
              </span>
            </div>
          </div>

          {/* Right Login Interaction Column (7 cols on lg) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Role Switcher Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('penguji');
                    setIdentifier('');
                    setPassword('');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'penguji'
                      ? 'bg-white text-orange-950 shadow-xs border border-slate-200/80 ring-1 ring-orange-600/10'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className={`w-4 h-4 ${activeTab === 'penguji' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span>Penguji Sidang</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    setIdentifier('admin');
                    setPassword('admin123');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'admin'
                      ? 'bg-white text-orange-950 shadow-xs border border-slate-200/80 ring-1 ring-orange-600/10'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span>Administrator</span>
                </button>
              </div>

              {/* Status Notifications */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="font-semibold leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="font-semibold leading-relaxed">{successMsg}</p>
                </div>
              )}

              {/* FORM PENGUJI */}
              {activeTab === 'penguji' && (
                <div className="space-y-6">
                  {/* Quick Examiner One-Click Login Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                        <span>Pilih Cepat Akun Penguji di Ruangan:</span>
                      </label>
                      <span className="text-[11px] text-slate-600">Klik untuk langsung menilai</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {pengujiList.slice(0, 4).map((p) => {
                        const isKetua = p.peran.toLowerCase().includes('ketua') || p.peran.includes('1');
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleQuickLoginPenguji(p)}
                            className="p-3 rounded-xl border border-slate-200/90 hover:border-orange-500 bg-slate-50/70 hover:bg-orange-50/60 transition-all text-left group cursor-pointer shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={p.avatar} 
                                alt={p.nama} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-300 group-hover:border-orange-500 flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-xs text-slate-900 group-hover:text-orange-950 truncate">
                                  {p.nama}
                                </p>
                                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                                  isKetua 
                                    ? 'bg-orange-100 text-orange-900 border border-orange-200' 
                                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                                }`}>
                                  {p.peran}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      atau masuk via NIP & Password
                    </span>
                    <div className="flex-1 border-t border-slate-200" />
                  </div>

                  {/* Standard Form */}
                  <form onSubmit={handleSubmitPengujiForm} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        NIP / Nomor Identitas Penguji
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Contoh: 198203152008121001"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs sm:text-sm outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Kata Sandi Penguji
                        </label>
                        <span className="text-[11px] text-slate-600">
                          Default: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">penguji123</code>
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan kata sandi..."
                          className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs sm:text-sm outline-none transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span>Memverifikasi Akun...</span>
                      ) : (
                        <>
                          <span>Masuk ke Ruang Sidang</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* FORM ADMIN */}
              {activeTab === 'admin' && (
                <div className="space-y-6">
                  <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl text-xs text-orange-950 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Akses Penuh Administrator</p>
                      <p className="text-orange-900/90 leading-relaxed">
                        Administrator berwenang mengelola Master Siswa, Guru Pembimbing, Mitra DUDI, Plotting Penempatan, dan Manajemen Dewan Penguji Sidang.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitAdminForm} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Username / ID Administrator
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Username admin"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs sm:text-sm outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Kata Sandi
                        </label>
                        <span className="text-[11px] text-slate-600">
                          Demo: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">admin123</code>
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Kata sandi admin..."
                          className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs sm:text-sm outline-none transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span>Memproses...</span>
                        ) : (
                          <>
                            <span>Masuk Dashboard Admin</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleQuickAdminLogin}
                        className="py-3 px-4 rounded-xl font-bold text-xs text-orange-950 bg-orange-100 hover:bg-orange-200 border border-orange-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-orange-700" />
                        <span>1-Click Masuk Admin</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Security Note */}
            <div className="mt-8 pt-4 border-t border-slate-200/90 text-center text-xs text-slate-600">
              Sistem Informasi Praktik Kerja Lapangan & Sidang Kelulusan SMK Vokasi
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
