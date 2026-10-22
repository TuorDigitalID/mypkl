import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ArrowRight
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
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'penguji' | 'admin'>('penguji');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg(
        selectedRole === 'admin' 
          ? 'Masukkan username atau ID administrator.' 
          : 'Masukkan NIP atau Email penguji sidang.'
      );
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Masukkan kata sandi akun Anda.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const result = await loginUser(identifier.trim(), password.trim(), selectedRole);
      if (result.success && result.user) {
        setSuccessMsg(result.message);
        const matchedP = pengujiList.find(
          (p) => p.id === result.user?.pengujiId || p.nip === result.user?.usernameOrNip
        );
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
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
                  Autentikasi Akun
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  Live
                </span>
              </div>
              <p className="text-xs text-orange-100/95 mt-0.5 max-w-md">
                Masuk ke ruang penilaian sidang atau panel administrasi.
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

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleFormLogin} className="space-y-4">
            {/* Role Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Peran Hak Akses:</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('penguji');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedRole === 'penguji'
                      ? 'bg-white text-orange-950 shadow-xs border border-slate-200/80 ring-1 ring-orange-600/10'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className={`w-3.5 h-3.5 ${selectedRole === 'penguji' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span>Penguji Sidang</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('admin');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedRole === 'admin'
                      ? 'bg-white text-orange-950 shadow-xs border border-slate-200/80 ring-1 ring-orange-600/10'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${selectedRole === 'admin' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span>Administrator</span>
                </button>
              </div>
            </div>

            {/* Identifier Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {selectedRole === 'admin' ? 'Username / ID Administrator' : 'NIP / NIK / Email Penguji'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {selectedRole === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={selectedRole === 'admin' ? 'Masukkan username admin' : 'Masukkan NIP atau Email penguji'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none font-mono transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 shadow-md shadow-orange-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memverifikasi Kredensial...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Sistem Sidang</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-600">Sesi Sidang Aktif</span>
          </span>
          <span className="text-slate-500 font-medium">
            SMK MA Buaranjati
          </span>
        </div>

      </div>
    </div>
  );
};
