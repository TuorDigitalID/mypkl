import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  Award, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  Send, 
  Building2, 
  BookMarked, 
  Save, 
  ChevronRight,
  ExternalLink,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  MahasiswaSidang, 
  Penguji, 
  PenilaianPenguji, 
  KriteriaNilai, 
  NilaiKriteriaItem 
} from '../types/index.ts';
import { DAFTAR_PENGUJI } from '../data/penguji.ts';
import { 
  DEFAULT_KRITERIA, 
  calculateExaminerTotal, 
  calculateGradeLetter, 
  calculatePredicate, 
  calculateFinalAggregate,
  validateScores 
} from '../utils/scoring.ts';
import { savePenilaian, savePesertaSidang } from '../lib/supabase.ts';

interface LiveEvaluationRoomProps {
  pesertaList: MahasiswaSidang[];
  activePesertaId: string;
  setActivePesertaId: (id: string) => void;
  activePenguji: Penguji;
  penilaianList: PenilaianPenguji[];
  onOpenBeritaAcara: (mahasiswaId: string) => void;
  kriteriaList?: KriteriaNilai[];
}

export const LiveEvaluationRoom: React.FC<LiveEvaluationRoomProps> = ({
  pesertaList,
  activePesertaId,
  setActivePesertaId,
  activePenguji,
  penilaianList,
  onOpenBeritaAcara,
  kriteriaList = DEFAULT_KRITERIA,
}) => {
  // Current active student
  const activePeserta = useMemo(() => {
    return pesertaList.find((p) => p.id === activePesertaId) || pesertaList[0];
  }, [pesertaList, activePesertaId]);

  // Aggregate stats for this student across all 3 examiners
  const aggregateResult = useMemo(() => {
    if (!activePeserta) return null;
    return calculateFinalAggregate(activePeserta.id, penilaianList, 3);
  }, [activePeserta, penilaianList]);

  // Find existing evaluation for current active examiner
  const existingEvaluation = useMemo(() => {
    if (!activePeserta) return null;
    return penilaianList.find(
      (p) => p.mahasiswaId === activePeserta.id && p.pengujiId === activePenguji.id
    );
  }, [activePeserta, activePenguji, penilaianList]);

  // Scoring Form State
  const [scores, setScores] = useState<Record<string, number>>({});
  const [catatanRevisi, setCatatanRevisi] = useState<string>('');
  const [rekomendasiStatus, setRekomendasiStatus] = useState<
    'Lulus' | 'Lulus dengan Revisi' | 'Mengulang Sidang'
  >('Lulus');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Synchronize form state when active student or examiner changes
  useEffect(() => {
    if (existingEvaluation) {
      const scoreMap: Record<string, number> = {};
      existingEvaluation.nilaiItems.forEach((item) => {
        scoreMap[item.kriteriaId] = item.skor;
      });
      setScores(scoreMap);
      setCatatanRevisi(existingEvaluation.catatanRevisi || '');
      setRekomendasiStatus(existingEvaluation.rekomendasiStatus || 'Lulus');
    } else {
      // Default initial baseline score
      const defaultMap: Record<string, number> = {};
      kriteriaList.forEach((k) => {
        defaultMap[k.id] = 80; // Default sensible value
      });
      setScores(defaultMap);
      setCatatanRevisi('');
      setRekomendasiStatus('Lulus');
    }
    setFormErrors([]);
    setSubmitSuccess(false);
  }, [activePeserta?.id, activePenguji.id, existingEvaluation, kriteriaList]);

  // Real-time calculation of active examiner's total score
  const activeExaminerItems: NilaiKriteriaItem[] = useMemo(() => {
    return kriteriaList.map((k) => ({
      kriteriaId: k.id,
      skor: Number(scores[k.id]) || 0,
    }));
  }, [scores, kriteriaList]);

  const activeExaminerTotal = useMemo(() => {
    return calculateExaminerTotal(activeExaminerItems, kriteriaList);
  }, [activeExaminerItems, kriteriaList]);

  const activeExaminerGrade = useMemo(() => {
    return calculateGradeLetter(activeExaminerTotal);
  }, [activeExaminerTotal]);

  // Timer State for presentation & Q&A
  const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60); // 15 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'presentasi' | 'tanyajawab'>('presentasi');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScoreChange = (kriteriaId: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setScores((prev) => ({
      ...prev,
      [kriteriaId]: clamped,
    }));
    setSubmitSuccess(false);
  };

  const handleQuickAddFeedback = (text: string) => {
    setCatatanRevisi((prev) => {
      if (!prev) return text;
      if (prev.includes(text)) return prev;
      return `${prev}\n• ${text}`;
    });
  };

  const handleSubmitNilai = async (isDraft: boolean = false) => {
    if (!activePeserta) return;

    const validation = validateScores(activeExaminerItems, kriteriaList);
    if (!validation.isValid && !isDraft) {
      setFormErrors(validation.errors);
      return;
    }
    setFormErrors([]);

    const payload: PenilaianPenguji = {
      id: existingEvaluation?.id || `pen-${activePeserta.id}-${activePenguji.id}`,
      mahasiswaId: activePeserta.id,
      pengujiId: activePenguji.id,
      pengujiNama: activePenguji.nama,
      pengujiPeran: activePenguji.peran,
      nilaiItems: activeExaminerItems,
      totalNilai: activeExaminerTotal,
      nilaiHuruf: activeExaminerGrade,
      catatanRevisi,
      rekomendasiStatus,
      isDraft,
      updatedAt: new Date().toISOString(),
    };

    await savePenilaian(payload);
    setSubmitSuccess(true);

    // If this completes all 3 examiners with passing grade, trigger congratulatory confetti
    if (
      !isDraft &&
      aggregateResult &&
      aggregateResult.totalPengujiMenilai >= 2 &&
      rekomendasiStatus !== 'Mengulang Sidang'
    ) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
  };

  const handleChangeSidangStatus = async (
    newStatus: 'menunggu' | 'berlangsung' | 'selesai' | 'ditunda'
  ) => {
    if (!activePeserta) return;
    const updated = {
      ...activePeserta,
      status: newStatus,
    };
    await savePesertaSidang(updated);
  };

  if (!activePeserta) {
    return (
      <div className="p-12 text-center text-slate-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
        <p className="text-lg font-medium">Belum ada peserta sidang terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER: ACTIVE CANDIDATE SELECTOR & LIVE TIMER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Candidate Profile Details */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                activePeserta.status === 'berlangsung'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                  : activePeserta.status === 'selesai'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                ● Sidang {activePeserta.status}
              </span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                NIM: {activePeserta.nim}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {activePeserta.ruangan}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activePeserta.nama}
              </h1>
              {/* Quick Candidate Switcher dropdown */}
              <select
                value={activePeserta.id}
                onChange={(e) => setActivePesertaId(e.target.value)}
                aria-label="Pilih Peserta Sidang"
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-auto"
              >
                {pesertaList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.nim}) - {p.status}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span>{activePeserta.perusahaan}</span>
              <span className="text-slate-300 font-normal">|</span>
              <span className="text-slate-600 font-medium">{activePeserta.prodi}</span>
            </p>

            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <BookMarked className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Judul Laporan PKL
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                  "{activePeserta.judulLaporan}"
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-500">
                  <span>Pembimbing Lapangan: <strong className="text-slate-700">{activePeserta.pembimbingDudi}</strong></span>
                  <span>Pembimbing Sekolah: <strong className="text-slate-700">{activePeserta.pembimbingSekolah}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidang Live Presentation Timer & Controls */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-end justify-between gap-3 p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                  {timerMode === 'presentasi' ? 'Waktu Presentasi' : 'Waktu Tanya Jawab'}
                </span>
                <span className={`font-mono text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  timerSeconds < 120 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                }`}>
                  {formatTimer(timerSeconds)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-2 rounded-lg font-medium text-xs flex items-center justify-center transition-all ${
                    isTimerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                  title={isTimerRunning ? 'Jeda Timer' : 'Mulai Timer'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(15 * 60);
                  }}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs"
                  title="Reset 15 Menit"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Timer Presets & Session Status */}
            <div className="flex items-center gap-1.5 w-full justify-between sm:justify-end text-xs">
              <button
                onClick={() => {
                  setTimerMode('presentasi');
                  setTimerSeconds(15 * 60);
                  setIsTimerRunning(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  timerMode === 'presentasi'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Presentasi (15m)
              </button>
              <button
                onClick={() => {
                  setTimerMode('tanyajawab');
                  setTimerSeconds(15 * 60);
                  setIsTimerRunning(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  timerMode === 'tanyajawab'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Tanya Jawab (15m)
              </button>
            </div>

            {/* Change Candidate Status Buttons */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-700/80 w-full justify-end">
              <span className="text-[10px] text-slate-400 mr-1">Status Sidang:</span>
              <button
                onClick={() => handleChangeSidangStatus('berlangsung')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  activePeserta.status === 'berlangsung'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Mulai
              </button>
              <button
                onClick={() => handleChangeSidangStatus('selesai')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  activePeserta.status === 'selesai'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Selesaikan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME MULTI-EXAMINER SCORE MATRIX (LIVE DASHBOARD) */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-teal-800/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Dashboard Nilai Multi-Penguji (Real-Time Live Sync)
              </h2>
            </div>
            <p className="text-xs text-teal-200/80 mt-0.5">
              Nilai dari 3 dewan penguji disinkronisasi secara otomatis melalui Supabase Realtime channel.
            </p>
          </div>

          {/* Quick summary button for official Berita Acara */}
          <button
            onClick={() => onOpenBeritaAcara(activePeserta.id)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 hover:text-white border border-teal-500/40 text-xs font-semibold transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lihat Berita Acara Resmi</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </button>
        </div>

        {/* 3 Penguji Live Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {DAFTAR_PENGUJI.map((penguji) => {
            const ev = penilaianList.find(
              (p) => p.mahasiswaId === activePeserta.id && p.pengujiId === penguji.id
            );
            const isCurrentUser = penguji.id === activePenguji.id;
            const hasSubmitted = ev && !ev.isDraft;

            return (
              <div
                key={penguji.id}
                className={`relative rounded-xl p-4 transition-all ${
                  isCurrentUser
                    ? 'bg-teal-900/40 border-2 border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-800/70 border border-slate-700/80'
                }`}
              >
                {/* Header card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isCurrentUser ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {penguji.peran.includes('1') ? 'P1' : penguji.peran.includes('2') ? 'P2' : 'P3'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[130px]">
                        {penguji.nama}
                      </p>
                      <p className="text-[10px] text-teal-300 font-medium">
                        {penguji.peran}
                      </p>
                    </div>
                  </div>

                  {isCurrentUser && (
                    <span className="px-1.5 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold rounded">
                      Anda
                    </span>
                  )}
                </div>

                {/* Score Status */}
                <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                      Skor Terbobot
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      hasSubmitted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isCurrentUser
                        ? 'bg-teal-500/20 text-teal-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {hasSubmitted ? 'Sudah Dikirim' : isCurrentUser ? 'Sedang Mengisi...' : 'Menunggu Nilai'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono text-3xl font-extrabold text-white">
                      {isCurrentUser
                        ? activeExaminerTotal.toFixed(2)
                        : ev
                        ? ev.totalNilai.toFixed(2)
                        : '--'}
                    </span>
                    <span className="font-bold text-lg text-emerald-400">
                      {isCurrentUser
                        ? `(${activeExaminerGrade})`
                        : ev
                        ? `(${ev.nilaiHuruf})`
                        : ''}
                    </span>
                  </div>

                  {/* Feedback preview */}
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 truncate">
                    <span className="text-slate-400 font-medium">Catatan: </span>
                    {isCurrentUser
                      ? catatanRevisi || '(Belum ada catatan)'
                      : ev?.catatanRevisi || '(Belum ada catatan)'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Aggregate Composite Score Summary */}
        {aggregateResult && (
          <div className="mt-4 p-4 bg-teal-900/30 border border-teal-700/50 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-900 font-black text-xl shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider block">
                  Nilai Akhir Rata-Rata Gabungan ({aggregateResult.totalPengujiMenilai} dari 3 Penguji)
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="font-mono text-3xl font-extrabold text-white">
                    {aggregateResult.nilaiAkhirAngka > 0 ? aggregateResult.nilaiAkhirAngka.toFixed(2) : '--'}
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    Nilai Huruf: {aggregateResult.nilaiAkhirAngka > 0 ? aggregateResult.nilaiAkhirHuruf : '-'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {aggregateResult.keputusanAkhir}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-teal-200">
              <p className="font-semibold">{aggregateResult.predikat}</p>
              <p className="text-[11px] text-slate-400">
                {aggregateResult.isLengkap
                  ? '✅ Semua penguji telah menyerahkan nilai.'
                  : '⏳ Menunggu sisa penguji memasukkan penilaian.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. ACTIVE EXAMINER RUBRIC SCORING FORM */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        
        {/* Banner Indicating Current Evaluator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Lembar Penilaian Sidang: {activePenguji.peran}
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activePenguji.nama}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sesuaikan skor slider (0-100) per aspek rubrik penilaian. Nilai otomatis dihitung terbobot.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Nilai Anda
              </span>
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="font-mono text-2xl font-black text-slate-900">
                  {activeExaminerTotal.toFixed(2)}
                </span>
                <span className="font-bold text-emerald-600 text-base">
                  ({activeExaminerGrade})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Errors Notice */}
        {formErrors.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Harap lengkapi semua isian nilai:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-2">
              {formErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Alert */}
        {submitSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Nilai Sidang Berhasil Dikirim Secara Real-Time!</p>
              <p className="text-[11px] text-emerald-700">
                Nilai telah tersimpan dan disinkronkan ke seluruh dewan penguji dan rekapitulasi.
              </p>
            </div>
          </div>
        )}

        {/* Criteria Sliders List */}
        <div className="space-y-6">
          {kriteriaList.map((kriteria, index) => {
            const currentVal = scores[kriteria.id] ?? 80;
            const weightedPoints = ((currentVal * kriteria.bobot) / 100).toFixed(2);

            return (
              <div
                key={kriteria.id}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-slate-50/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {kriteria.nama}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-800">
                        Bobot {kriteria.bobot}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 pl-7">
                      {kriteria.deskripsi}
                    </p>
                  </div>

                  {/* Number input and weighted contribution */}
                  <div className="flex items-center gap-3 self-end sm:self-start pl-7 sm:pl-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Poin Terbobot</span>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        +{weightedPoints} pts
                      </span>
                    </div>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentVal}
                        onChange={(e) => handleScoreChange(kriteria.id, Number(e.target.value))}
                        aria-label={`Skor angka untuk ${kriteria.nama}`}
                        className="w-16 px-2 py-1.5 text-center font-mono font-bold text-slate-800 text-sm outline-none focus:bg-emerald-50"
                      />
                      <span className="px-2 text-xs font-semibold text-slate-400 bg-slate-100 border-l border-slate-200 py-2">
                        /100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Range Slider */}
                <div className="mt-3 pl-0 sm:pl-7">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={currentVal}
                    onChange={(e) => handleScoreChange(kriteria.id, Number(e.target.value))}
                    aria-label={`Penggeser skor ${kriteria.nama}`}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                  />
                  
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>Kurang (50)</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-medium mr-1">Nilai Cepat:</span>
                      {[70, 75, 80, 85, 90, 95].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleScoreChange(kriteria.id, preset)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                            currentVal === preset
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <span>Sangat Baik (100)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rekomendasi Status Kelulusan */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <label className="text-sm font-bold text-slate-900 block mb-2">
            Rekomendasi Hasil Sidang PKL
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'Lulus',
                title: 'Lulus Murni',
                desc: 'Tanpa revisi laporan atau perbaikan minor',
                color: 'border-emerald-400 bg-emerald-50/50 text-emerald-900',
              },
              {
                id: 'Lulus dengan Revisi',
                title: 'Lulus dengan Revisi',
                desc: 'Wajib perbaikan laporan dalam 7 hari kerja',
                color: 'border-amber-400 bg-amber-50/50 text-amber-900',
              },
              {
                id: 'Mengulang Sidang',
                title: 'Mengulang Sidang PKL',
                desc: 'Materi tidak memenuhi standar minimal',
                color: 'border-red-400 bg-red-50/50 text-red-900',
              },
            ].map((option) => (
              <label
                key={option.id}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  rekomendasiStatus === option.id
                    ? `${option.color} ring-2 ring-emerald-500/20 font-semibold shadow-xs`
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">{option.title}</span>
                  <input
                    type="radio"
                    name="rekomendasiStatus"
                    value={option.id}
                    checked={rekomendasiStatus === option.id}
                    onChange={(e) => setRekomendasiStatus(e.target.value as any)}
                    className="accent-emerald-600"
                  />
                </div>
                <span className="text-xs text-slate-500 font-normal">{option.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Catatan Revisi & Feedback Form */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="text-sm font-bold text-slate-900">
              Catatan Revisi & Masukan Penguji (Akan tercetak di Berita Acara)
            </label>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="text-slate-400 font-medium">Template Cepat:</span>
              <button
                type="button"
                onClick={() => handleQuickAddFeedback('Perbaiki tata tulis EYD dan daftar pustaka format APA.')}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                + EYD/Pustaka
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddFeedback('Lengkapi lembar pengesahan dan logbook bermeterai.')}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                + Pengesahan
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddFeedback('Perjelas diagram flowchart arsitektur teknis pada Bab 3.')}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                + Flowchart Bab 3
              </button>
            </div>
          </div>
          <textarea
            rows={3}
            value={catatanRevisi}
            onChange={(e) => setCatatanRevisi(e.target.value)}
            placeholder="Tuliskan catatan perbaikan teknis atau pujian atas performa sidang mahasiswa..."
            aria-label="Catatan revisi penguji"
            className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              Nilai yang dikirim akan langsung terlihat oleh Penguji 1, Penguji 2, dan Penguji 3 secara live.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSubmitNilai(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmitNilai(false)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Nilai Sidang Real-Time</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
