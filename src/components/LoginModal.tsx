import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ArrowRight,
  Building2,
  Users
} from 'lucide-react';
import { Penguji, AuthUser } from '../types/index.ts';
import { loginUser } from '../lib/supabase.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  pengujiList: Penguji[];
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser, penguji?: Penguji) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  pengujiList,
  currentUser,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'penguji' | 'admin'>('penguji');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickLoginPenguji = async (p: Penguji) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await loginUser(p.id, p.password || 'penguji123', 'penguji');
      if (result.success && result.user) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          onLoginSuccess(result.user!, p);
          onClose();
        }, 500);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginAdmin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await loginUser('admin', 'admin123', 'admin');
      if (result.success && result.user) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal login sebagai admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const result = await loginUser(identifier, password, selectedRole);
      if (result.success && result.user) {
        setSuccessMsg(result.message);
        const matchedP = pengujiList.find((p) => p.id === result.user?.pengujiId || p.nip === result.user?.usernameOrNip);
        setTimeout(() => {
          onLoginSuccess(result.user!, matchedP);
          onClose();
        }, 500);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoCreds = (type: 'admin' | 'penguji') => {
    if (type === 'admin') {
      setSelectedRole('admin');
      setIdentifier('admin');
      setPassword('admin123');
    } else {
      setSelectedRole('penguji');
      const first = pengujiList[0];
      if (first) {
        setIdentifier(first.nip);
        setPassword(first.password || 'penguji123');
      }
    }
    setErrorMsg('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Luxury Terracotta Gradient & Badge */}
        <div className="relative px-6 py-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between flex-shrink-0 shadow-md">
          <div className="relative flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner flex-shrink-0">
              <KeyRound className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl tracking-tight text-white">
                  Autentikasi & Masuk Akun
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  My PKL
                </span>
              </div>
              <p className="text-xs text-orange-100/95 mt-0.5 max-w-md">
                Pilih akun penguji sidang untuk mulai menilai atau masuk sebagai administrator sistem.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup jendela login"
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 p-2 mx-6 mt-4 bg-slate-100 rounded-2xl text-xs sm:text-sm font-bold">
          <button
            onClick={() => {
              setActiveTab('quick');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-white text-orange-950 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Pilih Penguji (1-Klik Cepat)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('form');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'form'
                ? 'bg-white text-orange-950 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4 text-orange-600" />
            <span>Form Login (NIP / Password)</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: QUICK 1-CLICK EXAMINER CARDS */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Daftar Penguji Sidang Terdaftar
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pilih akun Anda untuk langsung menginput penilaian mahasiswa.
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {pengujiList.length} Penguji
                </span>
              </div>

              {/* Examiner Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pengujiList.map((p) => {
                  const isCurrent = currentUser?.pengujiId === p.id || currentUser?.id === p.id;
                  const isKetua = p.peran.toLowerCase().includes('ketua') || p.peran.includes('1');
                  const isSekretaris = p.peran.toLowerCase().includes('sekretaris') || p.peran.includes('2');

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleQuickLoginPenguji(p)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isCurrent
                          ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-400/40 shadow-sm'
                          : 'border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/30 bg-white shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.avatar}
                              alt={p.nama}
                              className="w-11 h-11 rounded-xl object-cover ring-2 ring-orange-200 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate leading-tight group-hover:text-orange-950">
                                {p.nama}
                              </h5>
                              <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                                NIP: {p.nip}
                              </p>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-orange-600 text-white uppercase tracking-wider">
                              Aktif
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                            isKetua
                              ? 'bg-purple-100 text-purple-900 border-purple-200'
                              : isSekretaris
                              ? 'bg-blue-100 text-blue-900 border-blue-200'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          }`}>
                            {p.peran}
                          </span>
                          {p.instansiAsal && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[170px]" title={p.instansiAsal}>
                              {p.instansiAsal}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-800 group-hover:text-orange-950">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                          <span>Masuk sebagai {isKetua ? 'Ketua' : isSekretaris ? 'Sekretaris' : 'Anggota'}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-orange-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Login as Admin shortcut */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleQuickLoginAdmin}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-xs sm:text-sm text-slate-900">
                        Masuk sebagai Administrator / Panitia Sidang
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Akses penuh pengelolaan master data penguji, plotting, dan rekapitulasi nilai.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    Login Admin →
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL FORM LOGIN */}
          {activeTab === 'form' && (
            <form onSubmit={handleFormLogin} className="space-y-4">
              {/* Role Toggle */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Peran Akun:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('penguji')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedRole === 'penguji'
                        ? 'bg-orange-100 text-orange-950 border-orange-300 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Penguji Sidang
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedRole === 'admin'
                        ? 'bg-orange-100 text-orange-950 border-orange-300 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              {/* Identifier Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {selectedRole === 'admin' ? 'Username / Email Administrator' : 'NIP / NIK / Email Penguji'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {selectedRole === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={selectedRole === 'admin' ? 'admin atau admin@mypkl.id' : 'Contoh: 198203152008121001'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kata Sandi (Password)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Demo: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">admin123</code> atau <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">penguji123</code>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Ingat sesi saya di peramban ini</span>
                </label>
                
                {/* Quick Auto-fill buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemoCreds('admin')}
                    className="text-[11px] font-bold text-orange-700 hover:underline cursor-pointer"
                  >
                    Isi Demo Admin
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => handleFillDemoCreds('penguji')}
                    className="text-[11px] font-bold text-orange-700 hover:underline cursor-pointer"
                  >
                    Isi Demo Penguji
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 shadow-md shadow-orange-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem Sidang'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-Time Broadcast & Session Active</span>
          </span>
          <span className="text-slate-400">
            Aplikasi My PKL Vokasi
          </span>
        </div>

      </div>
    </div>
  );
};
