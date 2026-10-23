import React, { useState, useEffect } from 'react';
import { 
  X, 
  DoorOpen, 
  Users, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Save, 
  ShieldCheck, 
  Building2,
  RotateCcw
} from 'lucide-react';
import { Penguji, PasanganPengujiRuangan } from '../types/index.ts';

interface AturPengujiRuanganModalProps {
  isOpen: boolean;
  onClose: () => void;
  pengujiList: Penguji[];
  roomPairings: PasanganPengujiRuangan[];
  onSave: (newPairings: PasanganPengujiRuangan[]) => Promise<void>;
}

export const AturPengujiRuanganModal: React.FC<AturPengujiRuanganModalProps> = ({
  isOpen,
  onClose,
  pengujiList,
  roomPairings,
  onSave,
}) => {
  const [draftPairings, setDraftPairings] = useState<PasanganPengujiRuangan[]>(roomPairings);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftPairings(roomPairings);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, roomPairings]);

  if (!isOpen) return null;

  // Active examiners only (or all if not flagged inactive)
  const availablePenguji = pengujiList.filter((p) => p.isActive !== false);

  const handleUpdateExaminer = (ruanganId: string, role: 'p1' | 'p2', pengujiId: string) => {
    setErrorMessage(null);
    setDraftPairings((prev) =>
      prev.map((room) => {
        if (room.ruanganId === ruanganId) {
          if (role === 'p1') {
            return { ...room, penguji1Id: pengujiId };
          } else {
            return { ...room, penguji2Id: pengujiId };
          }
        }
        return room;
      })
    );
  };

  const handleUpdateInfo = (ruanganId: string, field: 'namaRuangan' | 'lokasi' | 'keterangan', val: string) => {
    setDraftPairings((prev) =>
      prev.map((room) => {
        if (room.ruanganId === ruanganId) {
          return { ...room, [field]: val };
        }
        return room;
      })
    );
  };

  // Auto-pair examiners consecutively across the 3 rooms
  const handleAutoPairConsecutive = () => {
    if (availablePenguji.length < 2) {
      setErrorMessage('Minimal harus ada 2 penguji sidang aktif untuk memasangkan ruangan.');
      return;
    }

    const newPairings: PasanganPengujiRuangan[] = draftPairings.map((room, idx) => {
      // Room 0: penguji 0 & 1
      // Room 1: penguji 2 & 3 (or cycle if not enough)
      // Room 2: penguji 4 & 5 (or cycle if not enough)
      const p1Idx = (idx * 2) % availablePenguji.length;
      let p2Idx = (idx * 2 + 1) % availablePenguji.length;
      if (p2Idx === p1Idx) {
        p2Idx = (p1Idx + 1) % availablePenguji.length;
      }

      return {
        ...room,
        penguji1Id: availablePenguji[p1Idx].id,
        penguji2Id: availablePenguji[p2Idx].id,
      };
    });

    setDraftPairings(newPairings);
    setErrorMessage(null);
  };

  const handleSavePairings = async () => {
    // Validate that no room has identical examiner for P1 & P2
    for (const room of draftPairings) {
      if (room.penguji1Id === room.penguji2Id) {
        const examiner = availablePenguji.find((p) => p.id === room.penguji1Id);
        setErrorMessage(
          `Penguji 1 dan Penguji 2 pada ${room.namaRuangan} tidak boleh orang yang sama (${examiner?.nama || 'Sama'}). Silakan pilih penguji yang berbeda.`
        );
        return;
      }
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onSave(draftPairings);
      setSuccessMessage('Susunan pasangan penguji Ruang 1, 2, dan 3 berhasil disimpan ke database!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan pengaturan pasangan penguji.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  Pengaturan Pasangan Penguji per Ruang Sidang
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30">
                  Ruang 1, 2, 3
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium mt-0.5">
                Tentukan pasangan 2 dewan penguji (Ketua & Sekretaris) untuk setiap ruangan sidang agar nilai tersinkronisasi otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: 3 Room Cards */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/60 flex-1">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <Users className="w-4 h-4 text-orange-600" />
              <span>Total Master Penguji Aktif: <strong>{availablePenguji.length} orang</strong></span>
            </div>
            <button
              type="button"
              onClick={handleAutoPairConsecutive}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-orange-950 bg-orange-100 hover:bg-orange-200 border border-orange-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-700" />
              <span>Pasangkan Otomatis Berurutan</span>
            </button>
          </div>

          {/* Cards for Ruang 1, 2, 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {draftPairings.map((room, roomIdx) => {
              const p1 = availablePenguji.find((p) => p.id === room.penguji1Id);
              const p2 = availablePenguji.find((p) => p.id === room.penguji2Id);
              const isDuplicate = room.penguji1Id === room.penguji2Id;

              const roomThemes = [
                {
                  badge: 'bg-orange-100 text-orange-900 border-orange-300',
                  border: isDuplicate ? 'border-red-400 ring-2 ring-red-200' : 'border-orange-200 hover:border-orange-400',
                  accent: 'from-amber-500 to-orange-500',
                },
                {
                  badge: 'bg-blue-100 text-blue-900 border-blue-300',
                  border: isDuplicate ? 'border-red-400 ring-2 ring-red-200' : 'border-blue-200 hover:border-blue-400',
                  accent: 'from-blue-500 to-indigo-500',
                },
                {
                  badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  border: isDuplicate ? 'border-red-400 ring-2 ring-red-200' : 'border-emerald-200 hover:border-emerald-400',
                  accent: 'from-emerald-500 to-teal-500',
                },
              ];

              const theme = roomThemes[roomIdx % roomThemes.length];

              return (
                <div
                  key={room.ruanganId}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm transition-all flex flex-col justify-between ${theme.border}`}
                >
                  <div>
                    {/* Room Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${theme.accent} text-white flex items-center justify-center text-xs font-black shadow-xs`}>
                          R{roomIdx + 1}
                        </span>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">
                            {room.namaRuangan}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {room.ruanganId}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${theme.badge}`}>
                        2 Penguji
                      </span>
                    </div>

                    {/* Room Location & Notes */}
                    <div className="mt-2.5 space-y-1">
                      <input
                        type="text"
                        value={room.lokasi || ''}
                        onChange={(e) => handleUpdateInfo(room.ruanganId, 'lokasi', e.target.value)}
                        placeholder="Lokasi ruangan (contoh: Gedung A Lt. 2)"
                        className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 text-slate-700 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    {/* Examiner 1 Selector (Ketua) */}
                    <div className="mt-4 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-black">1</span>
                          <span>Penguji 1 (Ketua)</span>
                        </span>
                        {p1 && (
                          <span className="text-[10px] text-orange-600 font-mono truncate max-w-[120px]">
                            NIP: {p1.nip}
                          </span>
                        )}
                      </label>
                      <select
                        value={room.penguji1Id}
                        onChange={(e) => handleUpdateExaminer(room.ruanganId, 'p1', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer shadow-2xs"
                      >
                        {availablePenguji.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nama} ({p.peran})
                          </option>
                        ))}
                      </select>
                      {p1 && (
                        <div className="p-2 rounded-lg bg-orange-50/70 border border-orange-100 flex items-center gap-2 mt-1">
                          <img
                            src={p1.avatar}
                            alt={p1.nama}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 truncate">{p1.nama}</p>
                            <p className="text-[10px] text-slate-500 truncate">{p1.instansiAsal || 'SMK'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Examiner 2 Selector (Sekretaris) */}
                    <div className="mt-4 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">2</span>
                          <span>Penguji 2 (Sekretaris)</span>
                        </span>
                        {p2 && (
                          <span className="text-[10px] text-blue-600 font-mono truncate max-w-[120px]">
                            NIP: {p2.nip}
                          </span>
                        )}
                      </label>
                      <select
                        value={room.penguji2Id}
                        onChange={(e) => handleUpdateExaminer(room.ruanganId, 'p2', e.target.value)}
                        className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border ${
                          isDuplicate ? 'border-red-400 bg-red-50 text-red-900' : 'border-slate-300 bg-white text-slate-900'
                        } focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer shadow-2xs`}
                      >
                        {availablePenguji.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nama} ({p.peran})
                          </option>
                        ))}
                      </select>
                      {p2 && (
                        <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center gap-2 mt-1">
                          <img
                            src={p2.avatar}
                            alt={p2.nama}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 truncate">{p2.nama}</p>
                            <p className="text-[10px] text-slate-500 truncate">{p2.instansiAsal || 'SMK'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {isDuplicate && (
                      <p className="text-[10px] font-bold text-red-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Penguji 1 dan 2 tidak boleh sama!</span>
                      </p>
                    )}
                  </div>

                  {/* Room status footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Dewan Penguji Siap</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Tersinkron
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500">
            * Pasangan penguji ini akan langsung aktif di layar <strong>Live Evaluation Room</strong> &amp; perhitungan gabungan dewan penguji.
          </p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSavePairings}
              disabled={isSaving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 shadow-md shadow-orange-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pasangan Penguji</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
