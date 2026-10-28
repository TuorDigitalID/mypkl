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
  Users,
  Scale,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Layers,
  Briefcase,
  DoorOpen,
  Settings2,
  SlidersHorizontal,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  MahasiswaSidang, 
  Penguji, 
  PenilaianPenguji, 
  KriteriaNilai, 
  NilaiKriteriaItem,
  PlottingSiswaPKL,
  PasanganPengujiRuangan
} from '../types/index.ts';
import { 
  DEFAULT_KRITERIA, 
  GRADE_RANGES,
  calculateCategoryBreakdown,
  calculateExaminerTotal, 
  calculateGradeLetter, 
  calculatePredicate, 
  calculateFullPredicate,
  getGradeRangeInfo,
  calculateFinalAggregate,
  validateScores 
} from '../utils/scoring.ts';
import { savePenilaian, savePesertaSidang, getDefaultRoomPairings } from '../lib/supabase.ts';
import { AturPengujiRuanganModal } from './AturPengujiRuanganModal.tsx';

interface LiveEvaluationRoomProps {
  pesertaList: MahasiswaSidang[];
  activePesertaId: string;
  setActivePesertaId: (id: string) => void;
  activePenguji: Penguji;
  onSelectPenguji?: (penguji: Penguji) => void;
  penilaianList: PenilaianPenguji[];
  onOpenBeritaAcara: (mahasiswaId: string) => void;
  kriteriaList?: KriteriaNilai[];
  plottingList?: PlottingSiswaPKL[];
  onPenilaianSaved?: () => void;
  pengujiList?: Penguji[];
  roomPairings?: PasanganPengujiRuangan[];
  onSaveRoomPairings?: (pairings: PasanganPengujiRuangan[]) => Promise<void>;
  isAdmin?: boolean;
  onResetNilaiMahasiswa?: (mahasiswaId: string) => Promise<void>;
  onOpenSertifikat?: (mahasiswaId: string) => void;
}

export const LiveEvaluationRoom: React.FC<LiveEvaluationRoomProps> = ({
  pesertaList,
  activePesertaId,
  setActivePesertaId,
  activePenguji,
  onSelectPenguji,
  penilaianList,
  onOpenBeritaAcara,
  onOpenSertifikat,
  kriteriaList = DEFAULT_KRITERIA,
  plottingList = [],
  onPenilaianSaved,
  pengujiList = [],
  roomPairings = [],
  onSaveRoomPairings,
  isAdmin = false,
  onResetNilaiMahasiswa,
}) => {
  // Current active student
  const activePeserta = useMemo(() => {
    return pesertaList.find((p) => p.id === activePesertaId) || pesertaList[0];
  }, [pesertaList, activePesertaId]);

  // Selected Room Navigation & Modal State
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ruang-1');
  const [isAturRuanganModalOpen, setIsAturRuanganModalOpen] = useState(false);

  // Auto-detect student's scheduled room when active student changes
  useEffect(() => {
    if (activePeserta?.ruangan) {
      if (activePeserta.ruangan.includes('2')) {
        setSelectedRoomId('ruang-2');
      } else if (activePeserta.ruangan.includes('3')) {
        setSelectedRoomId('ruang-3');
      } else {
        setSelectedRoomId('ruang-1');
      }
    }
  }, [activePeserta?.id]);

  // Effective room pairings list (Ruang 1, 2, 3)
  const effectivePairings = useMemo(() => {
    if (roomPairings && roomPairings.length >= 3) return roomPairings;
    return getDefaultRoomPairings(pengujiList);
  }, [roomPairings, pengujiList]);

  // Active room pair configuration
  const activeRoomPairing = useMemo(() => {
    return (
      effectivePairings.find((r) => r.ruanganId === selectedRoomId) ||
      effectivePairings[0]
    );
  }, [effectivePairings, selectedRoomId]);

  // Resolved Penguji 1 & Penguji 2 from Master Penguji Data (Database)
  const p1Examiner: Penguji = useMemo(() => {
    if (pengujiList && pengujiList.length > 0) {
      const found = pengujiList.find(
        (p) =>
          p.id === activeRoomPairing.penguji1Id ||
          p.nip === activeRoomPairing.penguji1Id ||
          (activeRoomPairing.penguji1Id === 'p1' && (p.peran.includes('1') || p.peran.toLowerCase().includes('ketua')))
      );
      return found || pengujiList[0];
    }
    return {
      id: 'p1',
      nama: 'Penguji 1 (Ketua)',
      nip: '-',
      peran: 'Penguji 1 (Ketua)',
      avatar: '',
      email: '',
      password: '',
      telepon: '',
      instansiAsal: 'SMK MA Buaranjati',
      bidangKeahlian: '',
      isActive: true,
    };
  }, [pengujiList, activeRoomPairing.penguji1Id]);

  const p2Examiner: Penguji = useMemo(() => {
    if (pengujiList && pengujiList.length > 0) {
      const found = pengujiList.find(
        (p) =>
          p.id === activeRoomPairing.penguji2Id ||
          p.nip === activeRoomPairing.penguji2Id ||
          (activeRoomPairing.penguji2Id === 'p2' && (p.peran.includes('2') || p.peran.toLowerCase().includes('sekr')))
      );
      return found || pengujiList[1] || pengujiList[0];
    }
    return {
      id: 'p2',
      nama: 'Penguji 2 (Sekretaris)',
      nip: '-',
      peran: 'Penguji 2 (Sekretaris)',
      avatar: '',
      email: '',
      password: '',
      telepon: '',
      instansiAsal: 'SMK MA Buaranjati',
      bidangKeahlian: '',
      isActive: true,
    };
  }, [pengujiList, activeRoomPairing.penguji2Id]);

  const activeRoomPair = useMemo(() => [p1Examiner, p2Examiner], [p1Examiner, p2Examiner]);

  // Aggregate stats for this student across 2 room examiners
  const aggregateResult = useMemo(() => {
    if (!activePeserta) return null;
    return calculateFinalAggregate(activePeserta.id, penilaianList, 2, {
      p1Id: p1Examiner.id,
      p2Id: p2Examiner.id,
    });
  }, [activePeserta, penilaianList, p1Examiner.id, p2Examiner.id]);

  // Find existing evaluation for current active examiner
  const existingEvaluation = useMemo(() => {
    if (!activePeserta) return null;
    return penilaianList.find((p) => {
      const matchMhs = p.mahasiswaId === activePeserta.id || (activePeserta.nim && p.mahasiswaId === activePeserta.nim);
      const matchPenguji =
        p.pengujiId === activePenguji.id ||
        (p.pengujiNama && activePenguji.nama && p.pengujiNama.toLowerCase().trim() === activePenguji.nama.toLowerCase().trim()) ||
        (activePenguji.nip && p.pengujiId === activePenguji.nip);
      return matchMhs && matchPenguji;
    });
  }, [activePeserta, activePenguji, penilaianList]);

  // Scoring Form State
  const [scores, setScores] = useState<Record<string, number>>({});
  const [catatanRevisi, setCatatanRevisi] = useState<string>('');
  const [rekomendasiStatus, setRekomendasiStatus] = useState<
    'Lulus' | 'Lulus dengan Revisi' | 'Mengulang Sidang'
  >('Lulus');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showGradeGuide, setShowGradeGuide] = useState<boolean>(false);

  // Grouping Siswa per Perusahaan (Antrean Sidang Berbasis Perusahaan dari Plotting & Peserta)
  const companyGroups = useMemo(() => {
    const map = new Map<string, {
      nama: string;
      alamat?: string;
      pembimbingDudi?: string;
      guruNama?: string;
      ruangan?: string;
      jadwal?: string;
      siswa: MahasiswaSidang[];
    }>();

    pesertaList.forEach((p) => {
      const companyName = p.perusahaan || 'Lainnya / Mandiri';
      if (!map.has(companyName)) {
        const plot = plottingList.find((pl) => pl.instansiNama === companyName);
        map.set(companyName, {
          nama: companyName,
          alamat: plot?.alamatInstansi || 'Lokasi DUDI Terdaftar',
          pembimbingDudi: p.pembimbingDudi || plot?.pembimbingInstansi || 'Pembimbing Lapangan DUDI',
          guruNama: p.pembimbingSekolah || plot?.guruNama || 'Guru Pembimbing Sekolah',
          ruangan: p.ruangan,
          jadwal: p.jadwalSidang,
          siswa: [],
        });
      }
      map.get(companyName)!.siswa.push(p);
    });

    return Array.from(map.values());
  }, [pesertaList, plottingList]);

  // Selected company for the current session
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');

  useEffect(() => {
    if (activePeserta?.perusahaan) {
      setSelectedCompanyName(activePeserta.perusahaan);
    } else if (companyGroups.length > 0 && !selectedCompanyName) {
      setSelectedCompanyName(companyGroups[0].nama);
    }
  }, [activePeserta?.perusahaan, companyGroups, selectedCompanyName]);

  const currentCompanyGroup = useMemo(() => {
    return companyGroups.find((cg) => cg.nama === selectedCompanyName) || companyGroups[0];
  }, [companyGroups, selectedCompanyName]);

  // Filter siswa untuk Penguji 1 dan 2
  const [filterPengujiStatus, setFilterPengujiStatus] = useState<
    'semua' | 'belum_p1' | 'belum_p2' | 'lengkap'
  >('semua');

  // Filtered students in current selected company
  const filteredStudentsInCompany = useMemo(() => {
    if (!currentCompanyGroup) return [];

    return currentCompanyGroup.siswa.filter((siswa) => {
      const agg = calculateFinalAggregate(siswa.id, penilaianList, 2);
      const evalP1 = agg.nilaiPerPenguji.find(
        (n) => n.pengujiId === 'p1' || n.pengujiPeran.includes('1') || n.pengujiPeran.toLowerCase().includes('ketua')
      );
      const evalP2 = agg.nilaiPerPenguji.find(
        (n) => n.pengujiId === 'p2' || n.pengujiPeran.includes('2') || n.pengujiPeran.toLowerCase().includes('sekr')
      );

      const hasP1 = !!evalP1 && evalP1.totalNilai > 0;
      const hasP2 = !!evalP2 && evalP2.totalNilai > 0;

      if (filterPengujiStatus === 'belum_p1') return !hasP1;
      if (filterPengujiStatus === 'belum_p2') return !hasP2;
      if (filterPengujiStatus === 'lengkap') return hasP1 && hasP2;
      return true;
    });
  }, [currentCompanyGroup, filterPengujiStatus, penilaianList]);

  // Synchronize form state when active student or examiner changes
  useEffect(() => {
    const scoreMap: Record<string, number> = {};
    // Pre-populate all 7 criteria with sensible default 80
    kriteriaList.forEach((k) => {
      scoreMap[k.id] = 80;
    });

    if (existingEvaluation) {
      existingEvaluation.nilaiItems.forEach((item) => {
        if (typeof item.skor === 'number' && !isNaN(item.skor)) {
          scoreMap[item.kriteriaId] = item.skor;
          // Legacy backwards-compatibility fallbacks
          if (item.kriteriaId === 'k1') scoreMap['k1_agenda_disiplin'] = item.skor;
          if (item.kriteriaId === 'k2') scoreMap['k2_agenda_kerjasama'] = item.skor;
          if (item.kriteriaId === 'k3') scoreMap['k3_agenda_inisiatif'] = item.skor;
          if (item.kriteriaId === 'k4') {
            scoreMap['k4_agenda_tanggungjawab'] = item.skor;
            scoreMap['k5_agenda_kebersihan'] = item.skor;
          }
        }
      });
      setScores(scoreMap);
      setCatatanRevisi(existingEvaluation.catatanRevisi || '');
      setRekomendasiStatus(existingEvaluation.rekomendasiStatus || 'Lulus');
    } else {
      setScores(scoreMap);
      setCatatanRevisi('');
      setRekomendasiStatus('Lulus');
    }
    setFormErrors([]);
    setSubmitSuccess(false);
  }, [activePeserta?.id, activePenguji.id, existingEvaluation, kriteriaList]);

  // Real-time calculation of active examiner's total score and 2-category breakdown
  const activeExaminerItems: NilaiKriteriaItem[] = useMemo(() => {
    return kriteriaList.map((k) => ({
      kriteriaId: k.id,
      skor: Number(scores[k.id]) || 0,
    }));
  }, [scores, kriteriaList]);

  const examinerBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(activeExaminerItems, kriteriaList);
  }, [activeExaminerItems, kriteriaList]);

  const activeExaminerTotal = examinerBreakdown.totalNilai;
  const activeExaminerGrade = useMemo(() => calculateGradeLetter(activeExaminerTotal), [activeExaminerTotal]);
  const activeExaminerPredicate = useMemo(() => calculatePredicate(activeExaminerTotal), [activeExaminerTotal]);
  const activeExaminerRange = useMemo(() => getGradeRangeInfo(activeExaminerTotal), [activeExaminerTotal]);

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

  // Rekan penguji di ruangan yang sama (Penguji 1 atau Penguji 2)
  const fellowExaminer: Penguji = useMemo(() => {
    if (activePenguji.id === p1Examiner.id || activePenguji.nip === p1Examiner.nip) {
      return p2Examiner;
    }
    return p1Examiner;
  }, [activePenguji.id, activePenguji.nip, p1Examiner, p2Examiner]);

  // Evaluasi rekan penguji untuk siswa aktif ini (apakah sudah ada nilai agenda yang diinput duluan)
  const fellowEvaluation = useMemo(() => {
    if (!activePeserta) return null;
    return (
      penilaianList.find((e) => {
        if (e.mahasiswaId !== activePeserta.id) return false;
        // Hindari mencocokkan penilaian diri sendiri
        if (e.pengujiId === activePenguji.id || e.pengujiId === activePenguji.nip) return false;

        // Cek apakah rekan penguji sudah memiliki nilai agenda yang valid (> 0)
        const hasAgendaScores =
          (typeof e.subtotalAgenda === 'number' && e.subtotalAgenda > 0) ||
          (e.nilaiItems &&
            e.nilaiItems.some(
              (ni) =>
                ['k1', 'k2', 'k3', 'k4', 'k5'].includes(ni.kriteriaId) &&
                typeof ni.skor === 'number' &&
                ni.skor > 0
            ));

        return Boolean(hasAgendaScores);
      }) || null
    );
  }, [activePeserta?.id, activePenguji.id, activePenguji.nip, penilaianList]);

  const [syncAgendaToast, setSyncAgendaToast] = useState<string>('');

  const handleCopyAgendaFromFellow = () => {
    if (!fellowEvaluation || !fellowEvaluation.nilaiItems || fellowEvaluation.nilaiItems.length === 0) {
      alert('Belum ada nilai buku agenda dari rekan penguji untuk siswa ini.');
      return;
    }

    const agendaKeys = ['k1', 'k2', 'k3', 'k4', 'k5'];
    let count = 0;
    setScores((prev) => {
      const next = { ...prev };
      fellowEvaluation.nilaiItems.forEach((item) => {
        const isAgenda =
          agendaKeys.includes(item.kriteriaId) ||
          item.kriteriaId.startsWith('k1') ||
          item.kriteriaId.startsWith('k2') ||
          item.kriteriaId.startsWith('k3') ||
          item.kriteriaId.startsWith('k4') ||
          item.kriteriaId.startsWith('k5') ||
          item.kriteriaId.includes('agenda');

        if (isAgenda && typeof item.skor === 'number') {
          next[item.kriteriaId] = item.skor;
          count++;
        }
      });
      return next;
    });

    setSubmitSuccess(false);
    const sourceName = fellowEvaluation.pengujiNama || fellowExaminer.nama || 'Rekan Penguji';
    const subtotalText = fellowEvaluation.subtotalAgenda ? ` (Rata-rata: ${fellowEvaluation.subtotalAgenda.toFixed(2)})` : '';
    setSyncAgendaToast(`Berhasil menyalin 5 Aspek Nilai Buku Agenda dari ${sourceName}${subtotalText}!`);
    setTimeout(() => {
      setSyncAgendaToast('');
    }, 4500);
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
      subtotalAgenda: examinerBreakdown.subtotalAgenda,
      subtotalSidang: examinerBreakdown.subtotalSidang,
      totalNilai: examinerBreakdown.totalNilai,
      nilaiHuruf: activeExaminerGrade,
      catatanRevisi,
      rekomendasiStatus,
      isDraft,
      updatedAt: new Date().toISOString(),
    };

    await savePenilaian(payload);
    setSubmitSuccess(true);
    await onPenilaianSaved?.();

    // If this completes examiners with passing grade, trigger confetti
    if (
      !isDraft &&
      aggregateResult &&
      aggregateResult.totalPengujiMenilai >= 2 &&
      rekomendasiStatus !== 'Mengulang Sidang' &&
      activeExaminerTotal >= 60
    ) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f97316', '#f59e0b', '#10b981', '#3b82f6'],
      });
    }
  };

  const handleChangeSidangStatus = async (status: 'menunggu' | 'berlangsung' | 'selesai' | 'ditunda') => {
    if (!activePeserta) return;
    const updated = {
      ...activePeserta,
      status,
    };
    await savePesertaSidang(updated);
    await onPenilaianSaved?.();
  };

  // Group criteria into the 2 official categories
  const agendaCriteria = useMemo(() => kriteriaList.filter((k) => k.kategori === 'agenda'), [kriteriaList]);
  const sidangCriteria = useMemo(() => kriteriaList.filter((k) => k.kategori === 'sidang'), [kriteriaList]);

  if (!activePeserta) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <p>Belum ada data peserta sidang PKL yang terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ROOM SELECTOR & PENGUJI RUANGAN CONTROL BAR */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-xs text-white border border-white/20">
              <DoorOpen className="w-5 h-5 text-amber-200" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full text-amber-100">
                  Sidang Ruang Berpasangan
                </span>
                <span className="text-xs text-white/90 font-medium">
                  • 2 Penguji per Ruangan
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                <span>{activeRoomPairing.namaRuangan} ({activeRoomPairing.kodeRuangan})</span>
                <span className="text-xs font-normal text-amber-200/90 font-sans">
                  — {activeRoomPairing.lokasi}
                </span>
              </h3>
            </div>
          </div>

          {/* Room Pills & Atur Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-black/20 p-1 rounded-2xl border border-white/15">
              {effectivePairings.map((r) => {
                const isActive = selectedRoomId === r.ruanganId;
                return (
                  <button
                    key={r.ruanganId}
                    type="button"
                    onClick={() => setSelectedRoomId(r.ruanganId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-orange-950 shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{r.namaRuangan}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsAturRuanganModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/25 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Settings2 className="w-4 h-4 text-amber-200" />
              <span>Atur Penguji Ruangan</span>
            </button>
          </div>
        </div>

        {/* Display Current Room's Active Pair */}
        <div className="mt-3.5 pt-3 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2.5 bg-black/15 px-3 py-2 rounded-xl border border-white/10">
            <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
              P1
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-amber-200 block">Penguji 1 (Ketua Sidang)</span>
              <p className="font-bold text-white truncate">{p1Examiner.nama}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-black/15 px-3 py-2 rounded-xl border border-white/10">
            <span className="w-6 h-6 rounded-lg bg-orange-300 text-slate-950 font-black text-[11px] flex items-center justify-center">
              P2
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-orange-200 block">Penguji 2 (Sekretaris Sidang)</span>
              <p className="font-bold text-white truncate">{p2Examiner.nama}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 0. SESI SIDANG PER PERUSAHAAN (PLOTTING DUDI) & FILTER PENGUJI 1 & 2 */}
      <div className="bg-white rounded-3xl border border-orange-200/90 p-5 sm:p-6 shadow-xs">
        {/* Top Header of Company Session */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 block">
                  Jadwal Antrean Sidang per Perusahaan (Plotting DUDI)
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {currentCompanyGroup?.nama || 'Sesi Sidang Perusahaan'}
                </h2>
              </div>
            </div>
            {currentCompanyGroup?.alamat && (
              <p className="text-xs text-slate-500 mt-1 pl-11 flex items-center gap-1.5 truncate">
                <span className="text-orange-500">📍</span>
                <span className="truncate">{currentCompanyGroup.alamat}</span>
              </p>
            )}
          </div>

          {/* Company Selector Dropdown / Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-orange-600" />
              <span>Ganti Sesi Perusahaan:</span>
            </span>
            <select
              value={selectedCompanyName}
              onChange={(e) => {
                const compName = e.target.value;
                setSelectedCompanyName(compName);
                const firstStudent = pesertaList.find((p) => (p.perusahaan || 'Lainnya') === compName);
                if (firstStudent) {
                  setActivePesertaId(firstStudent.id);
                }
              }}
              className="px-3.5 py-2 rounded-xl border border-orange-300 bg-orange-50/70 hover:bg-orange-50 font-bold text-xs text-orange-950 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer shadow-xs"
            >
              {companyGroups.map((cg) => (
                <option key={cg.nama} value={cg.nama}>
                  🏢 {cg.nama} ({cg.siswa.length} Siswa PKL)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Penguji 1 & 2 Toolbar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-3.5 border-b border-orange-100/70">
          {/* Quick Examiner Toggle (Penguji 1 vs Penguji 2) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-orange-600" />
              <span>Penguji Aktif Menilai:</span>
            </span>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
              {activeRoomPair.map((p, idx) => {
                const isSelected = activePenguji.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (onSelectPenguji) {
                        onSelectPenguji(p);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isSelected ? 'bg-white text-orange-600' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {idx === 0 ? 'P1' : 'P2'}
                    </span>
                    <span className="truncate max-w-[130px] sm:max-w-none">
                      {idx === 0 ? `P1: ${p.nama.split(',')[0]}` : `P2: ${p.nama.split(',')[0]}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Status Penilaian Siswa dalam Perusahaan */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter Siswa:</span>
            </span>
            {[
              { id: 'semua', label: `Semua (${currentCompanyGroup?.siswa.length || 0})` },
              { id: 'belum_p1', label: `Belum Dinilai P1` },
              { id: 'belum_p2', label: `Belum Dinilai P2` },
              { id: 'lengkap', label: `Lengkap (P1 & P2)` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterPengujiStatus(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterPengujiStatus === f.id
                    ? 'bg-orange-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Student Queue in Selected Company */}
        <div className="pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-600" />
              <span>Daftar Siswa PKL di {currentCompanyGroup?.nama} ({filteredStudentsInCompany.length} Siswa):</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              * Penilaian tetap individual per siswa sesuai formula 50% Sidang + 50% Jurnal PKL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredStudentsInCompany.map((siswa) => {
              const agg = calculateFinalAggregate(siswa.id, penilaianList, 2, {
                p1Id: p1Examiner.id,
                p2Id: p2Examiner.id,
              });
              const scoreP1 = agg.nilaiPerPenguji.find(
                (n) => n.pengujiId === p1Examiner.id || n.pengujiPeran.includes('1') || n.pengujiPeran.toLowerCase().includes('ketua')
              );
              const scoreP2 = agg.nilaiPerPenguji.find(
                (n) => n.pengujiId === p2Examiner.id || n.pengujiPeran.includes('2') || n.pengujiPeran.toLowerCase().includes('sekr')
              );
              const isCurrentSelected = siswa.id === activePeserta.id;

              return (
                <div
                  key={siswa.id}
                  onClick={() => setActivePesertaId(siswa.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrentSelected
                      ? 'bg-orange-50/70 border-2 border-orange-500 shadow-md ring-2 ring-orange-500/20'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-orange-50/30 hover:border-orange-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {siswa.nim}
                      </span>
                      {isCurrentSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-600 text-white animate-pulse">
                          ● Sedang Dinilai
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          siswa.status === 'selesai' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          siswa.status === 'berlangsung' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-slate-200 text-slate-700 border-slate-300'
                        }`}>
                          {siswa.status}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {siswa.nama}
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-2 truncate">
                      {siswa.kelas} • {siswa.prodi}
                    </p>
                  </div>

                  {/* Status Nilai P1 & P2 */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-500">P1 ({p1Examiner.nama.split(' ')[0]}):</span>
                      {scoreP1 && scoreP1.totalNilai > 0 ? (
                        <span className="font-bold text-emerald-700">
                          {scoreP1.totalNilai.toFixed(1)} ({scoreP1.nilaiHuruf})
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold italic text-[10px]">
                          ⏳ Belum
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-500">P2 ({p2Examiner.nama.split(' ')[0]}):</span>
                      {scoreP2 && scoreP2.totalNilai > 0 ? (
                        <span className="font-bold text-blue-700">
                          {scoreP2.totalNilai.toFixed(1)} ({scoreP2.nilaiHuruf})
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold italic text-[10px]">
                          ⏳ Belum
                        </span>
                      )}
                    </div>

                    {agg.nilaiAkhirAngka > 0 && (
                      <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-200">
                        <span className="font-bold text-slate-700">Nilai Akhir:</span>
                        <span className="font-black text-orange-600">
                          {agg.nilaiAkhirAngka.toFixed(1)} [{agg.nilaiAkhirHuruf}]
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. STUDENT IDENTITY & TIMERS (STICKY COCKPIT) */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Student Profile Info */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-orange-500/20 ring-4 ring-orange-50 flex-shrink-0">
              {activePeserta.nama.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  {activePeserta.nama}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-100 text-orange-900 border border-orange-200">
                  NISN: {activePeserta.nim}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  activePeserta.status === 'berlangsung'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    : activePeserta.status === 'selesai'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  Status: {activePeserta.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-slate-600">
                <p className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-slate-400">Kelas/Prodi:</span>
                  <span className="font-medium text-slate-800 truncate">{activePeserta.kelas} • {activePeserta.prodi}</span>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{activePeserta.perusahaan}</span>
                </p>
                <p className="col-span-1 sm:col-span-2 flex items-center gap-1.5 text-slate-700 mt-0.5 truncate">
                  <BookMarked className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="italic truncate">"{activePeserta.judulLaporan}"</span>
                </p>
              </div>
            </div>
          </div>

          {/* Sidang Timer & Status Actions */}
          <div className="flex flex-col items-end gap-2.5 w-full lg:w-auto bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex-shrink-0">
            <div className="flex items-center justify-between w-full lg:w-auto gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-orange-400 uppercase block">
                  Timer {timerMode === 'presentasi' ? 'Presentasi' : 'Tanya Jawab'}
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider">
                  {formatTimer(timerSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-2 rounded-xl transition-all ${
                    isTimerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
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
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Reset Timer 15 Menit"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 w-full justify-between text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setTimerMode('presentasi');
                    setTimerSeconds(15 * 60);
                    setIsTimerRunning(false);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    timerMode === 'presentasi' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Presentasi
                </button>
                <button
                  onClick={() => {
                    setTimerMode('tanyajawab');
                    setTimerSeconds(15 * 60);
                    setIsTimerRunning(false);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    timerMode === 'tanyajawab' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Tanya Jawab
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleChangeSidangStatus('berlangsung')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activePeserta.status === 'berlangsung' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mulai
                </button>
                <button
                  onClick={() => handleChangeSidangStatus('selesai')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activePeserta.status === 'selesai' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. REAL-TIME MULTI-EXAMINER SCORE MATRIX */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <h2 className="text-lg font-black tracking-tight text-white">
                Dashboard Nilai Dewan Penguji (Real-Time Live Sync)
              </h2>
            </div>
            <p className="text-xs text-orange-200/80 mt-0.5">
              Skema 2 Penguji Ruangan: Nilai Sidang (Penguji 1 + Penguji 2)/2 (50%) + Nilai Jurnal PKL (50%) = 100% Nilai Akhir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGradeGuide(!showGradeGuide)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-orange-200 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>{showGradeGuide ? 'Tutup Skala KKM' : 'Lihat Standar KKM'}</span>
            </button>

            <button
              onClick={() => onOpenBeritaAcara(activePeserta.id)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Berita Acara</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </button>

            {onOpenSertifikat && (
              <button
                type="button"
                onClick={() => onOpenSertifikat(activePeserta.id)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Cetak Sertifikat Kelulusan PKL A4 (2 Muka)"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Cetak Sertifikat A4</span>
              </button>
            )}

            {isAdmin && aggregateResult && (aggregateResult.totalPengujiMenilai > 0 || aggregateResult.nilaiAkhirAngka > 0) && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm(`Yakin ingin mereset seluruh nilai ujian sidang untuk siswa "${activePeserta.nama}"? Nilai dari semua dewan penguji akan dihapus dan status dikembalikan ke Menunggu.`)) {
                    await onResetNilaiMahasiswa?.(activePeserta.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                title="Reset Nilai Siswa Ini (Admin)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>Reset Nilai Siswa</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Grade Guide Legend */}
        {showGradeGuide && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-orange-500/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in">
            {GRADE_RANGES.map((r) => (
              <div key={r.huruf} className={`p-3 rounded-xl border ${r.badgeBorder} ${r.badgeBg} text-slate-900`}>
                <div className="flex items-center justify-between font-bold">
                  <span>{r.predikatSingkat} ({r.huruf})</span>
                  <span className="font-mono text-[11px]">{r.min}–{r.max}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-700 mt-1 leading-tight">
                  {r.keterangan}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 2 Penguji Ruangan Live Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {activeRoomPair.map((penguji, idx) => {
            const ev = penilaianList.find((p) => {
              const matchMhs = p.mahasiswaId === activePeserta.id || (activePeserta.nim && p.mahasiswaId === activePeserta.nim);
              const matchPenguji =
                p.pengujiId === penguji.id ||
                (p.pengujiNama && penguji.nama && p.pengujiNama.toLowerCase().trim() === penguji.nama.toLowerCase().trim()) ||
                (penguji.nip && p.pengujiId === penguji.nip) ||
                (idx === 0 && (p.pengujiPeran.includes('1') || p.pengujiPeran.toLowerCase().includes('ketua'))) ||
                (idx === 1 && (p.pengujiPeran.includes('2') || p.pengujiPeran.toLowerCase().includes('sekr')));
              return matchMhs && matchPenguji;
            });
            const isCurrentUser = penguji.id === activePenguji.id || (penguji.nip && activePenguji.nip === penguji.nip);
            const hasSubmitted = ev && !ev.isDraft;

            const displayTotal = isCurrentUser ? activeExaminerTotal : (ev ? ev.totalNilai : 0);
            const displayGrade = isCurrentUser ? activeExaminerGrade : (ev ? ev.nilaiHuruf : '-');

            return (
              <div
                key={`${penguji.id}-${idx}`}
                className={`relative rounded-2xl p-4 transition-all ${
                  isCurrentUser
                    ? 'bg-orange-950/40 border-2 border-orange-500 shadow-md ring-2 ring-orange-500/20'
                    : 'bg-slate-900/70 border border-slate-800'
                }`}
              >
                {/* Header card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                      isCurrentUser ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white' : 'bg-slate-800 text-amber-300'
                    }`}>
                      {idx === 0 ? 'P1' : 'P2'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-xs">
                        {penguji.nama}
                      </p>
                      <p className="text-[10px] text-orange-300 font-semibold">
                        {idx === 0 ? 'Penguji 1 (Ketua Sidang)' : 'Penguji 2 (Sekretaris Sidang)'} {penguji.nip ? `• NIP: ${penguji.nip}` : ''}
                      </p>
                    </div>
                  </div>

                  {isCurrentUser && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-lg shadow-xs">
                      Akun Anda
                    </span>
                  )}
                </div>

                {/* Score Status */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      Total Terbobot (50:50)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      hasSubmitted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isCurrentUser
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {hasSubmitted ? 'Terkirim' : isCurrentUser ? 'Draft Anda' : 'Menunggu'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono text-3xl font-black text-white">
                      {isCurrentUser || ev ? displayTotal.toFixed(2) : '--'}
                    </span>
                    <span className={`font-black text-lg ${
                      displayGrade === 'A' ? 'text-emerald-400' :
                      displayGrade === 'B' ? 'text-blue-400' :
                      displayGrade === 'C' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {isCurrentUser || ev ? `Grade ${displayGrade}` : ''}
                    </span>
                  </div>

                  {/* Category mini pills */}
                  {(isCurrentUser || ev) && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Agenda: {isCurrentUser ? examinerBreakdown.subtotalAgenda.toFixed(1) : (ev?.subtotalAgenda ?? '-')}</span>
                      <span>•</span>
                      <span>Sidang: {isCurrentUser ? examinerBreakdown.subtotalSidang.toFixed(1) : (ev?.subtotalSidang ?? '-')}</span>
                    </div>
                  )}

                  {/* Feedback preview */}
                  <div className="mt-1.5 text-[11px] text-slate-300 truncate">
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
          <div className="mt-4 p-5 bg-gradient-to-r from-orange-950/50 via-slate-900 to-amber-950/40 border border-orange-500/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30 flex-shrink-0">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-orange-300 uppercase tracking-wider block">
                  Nilai Akhir Rata-Rata Gabungan ({aggregateResult.totalPengujiMenilai} dari 2 Penguji)
                </span>
                <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-white">
                    {aggregateResult.nilaiAkhirAngka > 0 ? aggregateResult.nilaiAkhirAngka.toFixed(2) : '--'}
                  </span>
                  <span className="text-xl font-black text-orange-400">
                    Grade {aggregateResult.nilaiAkhirAngka > 0 ? aggregateResult.nilaiAkhirHuruf : '-'}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-black border ${
                    aggregateResult.nilaiAkhirAngka >= 85 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' :
                    aggregateResult.nilaiAkhirAngka >= 70 ? 'bg-blue-500/20 text-blue-300 border-blue-400/40' :
                    aggregateResult.nilaiAkhirAngka >= 60 ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' :
                    'bg-red-500/20 text-red-300 border-red-400/40'
                  }`}>
                    {aggregateResult.keputusanAkhir}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-orange-200">
              <p className="font-bold text-sm text-white">{aggregateResult.predikat}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {aggregateResult.isLengkap
                  ? '✅ Seluruh dewan penguji telah menyerahkan nilai.'
                  : '⏳ Menunggu dewan penguji lainnya memasukkan nilai.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. ACTIVE EXAMINER RUBRIC SCORING FORM (GROUPED BY 2 OFFICIAL CATEGORIES) */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-7 shadow-xs">
        
        {/* Banner Indicating Current Evaluator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-900">
                  Lembar Penilaian Sidang: {activePenguji.peran}
                </h3>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-100 text-orange-900 border border-orange-200">
                  {activePenguji.nama}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Input skor per aspek (0–100). Bobot otomatis terhitung: 50% Buku Agenda & 50% Ujian Sidang.
              </p>
            </div>
          </div>

          {/* Realtime breakdown header pill */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 p-3.5 rounded-2xl flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-extrabold text-orange-800 uppercase tracking-wider block">
                Total Nilai Anda
              </span>
              <div className="flex items-baseline gap-2 justify-end">
                <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
                  {activeExaminerTotal.toFixed(2)}
                </span>
                <span className={`font-black text-base ${activeExaminerRange.badgeText}`}>
                  ({activeExaminerGrade})
                </span>
              </div>
            </div>
            <div className="border-l border-orange-200 pl-3 text-left">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-black border ${activeExaminerRange.badgeBg} ${activeExaminerRange.badgeText} ${activeExaminerRange.badgeBorder}`}>
                {activeExaminerRange.predikatSingkat}
              </span>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px] mt-0.5">
                {activeExaminerPredicate}
              </p>
            </div>
          </div>
        </div>

        {/* Validation Errors Notice */}
        {formErrors.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Harap lengkapi isian nilai berikut:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-2 font-medium">
              {formErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Alert */}
        {submitSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Nilai Sidang PKL Berhasil Disimpan & Dikirim Real-Time!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Nilai telah diperbarui dan langsung disinkronkan ke seluruh dewan penguji dan rekapitulasi.
              </p>
            </div>
          </div>
        )}

        {/* FORM SECTION 1: ASPEK BUKU AGENDA PSG/PKL (50%) */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-orange-50/30 border border-orange-200/90 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                A
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900">
                  Aspek Buku Agenda PSG/PKL
                </h4>
                <p className="text-xs text-orange-800 font-semibold">
                  5 Aspek Penilaian • Total Kontribusi: 50% Nilai Akhir
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-right shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-sans">Rata-rata 5 Aspek</span>
                <span className="font-bold text-slate-900">{examinerBreakdown.subtotalAgenda.toFixed(2)} / 100</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-right shadow-xs">
                <span className="text-[10px] text-orange-200 block font-sans">Poin Terbobot (50%)</span>
                <span>+{examinerBreakdown.weightedAgenda.toFixed(2)} pts</span>
              </div>
            </div>
          </div>

          {/* SINKRONISASI BUKU AGENDA DARI REKAN PENGUJI */}
          {fellowEvaluation ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs flex-shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900">
                      Nilai Buku Agenda Sudah Diisi oleh {fellowEvaluation.pengujiNama || fellowExaminer.nama}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950 border border-amber-300">
                      {fellowEvaluation.pengujiPeran || fellowExaminer.peran}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Rekan penguji telah menginput 5 aspek buku agenda fisik siswa ini dengan rata-rata <strong>{fellowEvaluation.subtotalAgenda?.toFixed(2) || '-'}</strong>. Karena buku fisik agenda hanya 1 eksemplar, Anda dapat langsung menyalin nilai ini secara instan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyAgendaFromFellow}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all whitespace-nowrap self-stretch sm:self-auto cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Salin / Sinkronkan Nilai Agenda</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-white/80 border border-orange-200 text-xs text-slate-600 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                <span>
                  Buku agenda fisik hanya 1 eksemplar. Nilai yang Anda input di sini dapat langsung disalin oleh <strong>{fellowExaminer.nama}</strong> ({fellowExaminer.peran}) secara real-time.
                </span>
              </div>
            </div>
          )}

          {/* Toast Notifikasi Berhasil Sinkron */}
          {syncAgendaToast && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{syncAgendaToast}</span>
            </div>
          )}

          {/* The 5 Criteria Sliders */}
          <div className="space-y-4">
            {agendaCriteria.map((kriteria) => {
              const currentVal = scores[kriteria.id] ?? 80;
              const weightedPts = ((currentVal * kriteria.bobot) / 100).toFixed(2);

              return (
                <div
                  key={kriteria.id}
                  className="p-4 sm:p-5 rounded-2xl border border-orange-100 hover:border-orange-300 transition-colors bg-white shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {kriteria.nomor}
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm">
                          {kriteria.nama}
                        </h5>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-100 text-orange-900">
                          Bobot {kriteria.bobot}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 pl-8 leading-relaxed">
                        {kriteria.deskripsi}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-start pl-8 sm:pl-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-sans">Poin Nilai</span>
                        <span className="text-xs font-mono font-bold text-orange-700">
                          +{weightedPts} pts
                        </span>
                      </div>
                      <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentVal}
                          onChange={(e) => handleScoreChange(kriteria.id, Number(e.target.value))}
                          aria-label={`Skor angka untuk ${kriteria.nama}`}
                          className="w-16 px-2 py-1.5 text-center font-mono font-bold text-slate-800 text-sm outline-none focus:bg-orange-50"
                        />
                        <span className="px-2 text-xs font-semibold text-slate-400 bg-slate-100 border-l border-slate-200 py-1.5">
                          /100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="mt-3 pl-0 sm:pl-8">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={currentVal}
                      onChange={(e) => handleScoreChange(kriteria.id, Number(e.target.value))}
                      aria-label={`Penggeser skor ${kriteria.nama}`}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span className="text-red-600 font-medium">0</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-500 font-medium mr-1">Pilihan Cepat:</span>
                        {[60, 70, 75, 80, 85, 90, 95, 100].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleScoreChange(kriteria.id, preset)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                              currentVal === preset
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <span className="text-emerald-600 font-bold">100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FORM SECTION 2: ASPEK UJIAN SIDANG PKL (50%) */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-amber-50/30 border border-amber-200/90 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                B
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900">
                  Aspek Ujian Sidang PKL
                </h4>
                <p className="text-xs text-amber-800 font-semibold">
                  2 Aspek Penilaian • Total Kontribusi: 50% Nilai Akhir
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-right shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-sans">Rata-rata 2 Aspek</span>
                <span className="font-bold text-slate-900">{examinerBreakdown.subtotalSidang.toFixed(2)} / 100</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-right shadow-xs">
                <span className="text-[10px] text-amber-200 block font-sans">Poin Terbobot (50%)</span>
                <span>+{examinerBreakdown.weightedSidang.toFixed(2)} pts</span>
              </div>
            </div>
          </div>

          {/* The 2 Criteria Sliders */}
          <div className="space-y-4">
            {sidangCriteria.map((kriteria) => {
              const currentVal = scores[kriteria.id] ?? 80;
              const weightedPts = ((currentVal * kriteria.bobot) / 100).toFixed(2);

              return (
                <div
                  key={kriteria.id}
                  className="p-4 sm:p-5 rounded-2xl border border-amber-100 hover:border-amber-300 transition-colors bg-white shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {kriteria.nomor}
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm">
                          {kriteria.nama}
                        </h5>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900">
                          Bobot {kriteria.bobot}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 pl-8 leading-relaxed">
                        {kriteria.deskripsi}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-start pl-8 sm:pl-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-sans">Poin Nilai</span>
                        <span className="text-xs font-mono font-bold text-amber-700">
                          +{weightedPts} pts
                        </span>
                      </div>
                      <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentVal}
                          onChange={(e) => handleScoreChange(kriteria.id, Number(e.target.value))}
                          aria-label={`Skor angka untuk ${kriteria.nama}`}
                          className="w-16 px-2 py-1.5 text-center font-mono font-bold text-slate-800 text-sm outline-none focus:bg-amber-50"
                        />
                        <span className="px-2 text-xs font-semibold text-slate-400 bg-slate-100 border-l border-slate-200 py-1.5">
                          /100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="mt-3 pl-0 sm:pl-8">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={currentVal}
                      onChange={(e) => handleScoreChange(kriteria.id, Number(e.target.value))}
                      aria-label={`Penggeser skor ${kriteria.nama}`}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span className="text-red-600 font-medium">0</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-500 font-medium mr-1">Pilihan Cepat:</span>
                        {[60, 70, 75, 80, 85, 90, 95, 100].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleScoreChange(kriteria.id, preset)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                              currentVal === preset
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <span className="text-emerald-600 font-bold">100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rekomendasi Status Kelulusan Berdasarkan KKM */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <label className="text-sm font-black text-slate-900 block mb-2">
            Rekomendasi Keputusan Dewan Penguji
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'Lulus',
                title: 'Lulus Murni (Kompeten)',
                desc: 'Mencapai batas KKM (>= 60) tanpa kendala berat',
                color: 'border-emerald-400 bg-emerald-50/60 text-emerald-950',
              },
              {
                id: 'Lulus dengan Revisi',
                title: 'Lulus dengan Revisi',
                desc: 'Wajib perbaikan laporan dan agenda dalam 7 hari kerja',
                color: 'border-amber-400 bg-amber-50/60 text-amber-950',
              },
              {
                id: 'Mengulang Sidang',
                title: 'Belum Kompeten / Remedial',
                desc: 'Nilai di bawah KKM (< 60), wajib ujian sidang ulang',
                color: 'border-red-400 bg-red-50/60 text-red-950',
              },
            ].map((option) => (
              <label
                key={option.id}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  rekomendasiStatus === option.id
                    ? `${option.color} ring-2 ring-orange-500/20 font-semibold shadow-xs`
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
                    className="accent-orange-600"
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
              Catatan Revisi & Masukan Penguji (Tercetak di Lembar Berita Acara)
            </label>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="text-slate-400 font-medium">Template Cepat:</span>
              <button
                type="button"
                onClick={() => handleQuickAddFeedback('Lengkapi paraf pembimbing DUDI dan dokumentasi foto di Buku Agenda PSG/PKL.')}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-orange-50 text-slate-700"
              >
                + Agenda & Foto
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddFeedback('Perbaiki tata tulis format EYD dan perjelas diagram alur teknis pada Bab 3.')}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-orange-50 text-slate-700"
              >
                + Format Laporan
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddFeedback('Pertahankan pemahaman alur kerja DUDI dan penguasaan materi yang sangat baik.')}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-orange-50 text-slate-700"
              >
                + Apresiasi Sidang
              </button>
            </div>
          </div>
          <textarea
            rows={3}
            value={catatanRevisi}
            onChange={(e) => setCatatanRevisi(e.target.value)}
            placeholder="Tuliskan catatan perbaikan atau rekomendasi penguatan kompetensi siswa..."
            aria-label="Catatan revisi penguji"
            className="w-full p-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm outline-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>
              Nilai yang disimpan akan langsung disinkronkan ke seluruh dewan penguji dan rekapitulasi.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSubmitNilai(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmitNilai(false)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Nilai Sidang Real-Time</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modal Pengaturan Penguji Ruangan Sidang (Ruang 1, 2, 3) */}
      <AturPengujiRuanganModal
        isOpen={isAturRuanganModalOpen}
        onClose={() => setIsAturRuanganModalOpen(false)}
        roomPairings={effectivePairings}
        pengujiList={pengujiList}
        onSave={async (pairings: PasanganPengujiRuangan[]) => {
          if (onSaveRoomPairings) {
            await onSaveRoomPairings(pairings);
          }
        }}
      />

    </div>
  );
};
