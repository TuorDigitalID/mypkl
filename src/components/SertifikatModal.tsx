import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  SlidersHorizontal,
  QrCode,
  ShieldCheck,
  GraduationCap,
  Upload,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
  Wrench,
  Palette,
  Eye,
  Wallpaper,
  FileCheck2,
  Database,
  Barcode as BarcodeIcon
} from 'lucide-react';
import { MahasiswaSidang, PenilaianPenguji, MasterSiswaPKL, MasterJurusan, Penguji } from '../types/index.ts';
import { calculateFinalAggregate } from '../utils/scoring.ts';
import { getMasterJurusanList } from '../lib/supabase.ts';
import { CertificateBarcode, BarcodeType, BarcodeFormat } from './CertificateBarcode.tsx';

interface SertifikatModalProps {
  mahasiswaId: string | null;
  pesertaList: MahasiswaSidang[];
  penilaianList: PenilaianPenguji[];
  masterSiswaList?: MasterSiswaPKL[];
  masterJurusanList?: MasterJurusan[];
  pengujiList?: Penguji[];
  onClose: () => void;
  onSelectMahasiswa?: (id: string) => void;
}

export const SertifikatModal: React.FC<SertifikatModalProps> = ({
  mahasiswaId,
  pesertaList,
  penilaianList,
  masterSiswaList = [],
  masterJurusanList = [],
  onClose,
  onSelectMahasiswa,
}) => {
  // Current student resolution
  const currentIndex = pesertaList.findIndex((p) => p.id === mahasiswaId);
  const mahasiswa = pesertaList[currentIndex] || pesertaList[0];

  // Matched Master Siswa for NISN
  const masterSiswa = useMemo(() => {
    if (!mahasiswa) return null;
    return masterSiswaList.find(
      (m) => m.id === mahasiswa.id || m.nisn === mahasiswa.nim || m.namaLengkap.toLowerCase() === mahasiswa.nama.toLowerCase()
    );
  }, [mahasiswa, masterSiswaList]);

  // View mode tab: 'both' (2 Muka A4) | 'front' (Muka Depan) | 'back' (Muka Belakang / Transkrip)
  const [viewMode, setViewMode] = useState<'both' | 'front' | 'back' | 'all-fronts' | 'all-backs'>('both');
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'logo' | 'background' | 'data' | 'barcode'>('background');
  const [fontJudul, setFontJudul] = useState<'certificate' | 'pinyon' | 'cinzel-dec' | 'playfair' | 'cinzel'>(() => {
    return (localStorage.getItem('sertifikat_font_judul') as any) || 'certificate';
  });

  // =========================================================================
  // BARCODE & URUTAN GENERATION STATE (Derived from NISN & Urutan Peserta)
  // =========================================================================
  const [barcodeType, setBarcodeType] = useState<BarcodeType>(() => {
    return (localStorage.getItem('sertifikat_barcode_type') as BarcodeType) || 'barcode';
  });
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>(() => {
    return (localStorage.getItem('sertifikat_barcode_format') as BarcodeFormat) || 'simple';
  });
  const [customUrutan, setCustomUrutan] = useState<string>('');
  const [showBarcodeOnBack, setShowBarcodeOnBack] = useState<boolean>(() => {
    return localStorage.getItem('sertifikat_show_barcode_back') !== 'false';
  });

  // Effective sequence number: auto-padded from student index (e.g. 1 -> 001) or custom override
  const effectiveUrutan = useMemo(() => {
    if (customUrutan && customUrutan.trim()) {
      return customUrutan.trim();
    }
    return String(currentIndex + 1).padStart(3, '0');
  }, [customUrutan, currentIndex]);

  // =========================================================================
  // CERTIFICATE BACKGROUND STATE (User uploaded asset as default)
  // =========================================================================
  const DEFAULT_BG_ASSET = '/assets/aistudio/Background-Sertifikat_cd0f813e.png';

  const [bgSertifikatUrl, setBgSertifikatUrl] = useState<string | null>(() => {
    return localStorage.getItem('sertifikat_bg_image') || DEFAULT_BG_ASSET;
  });

  const [showBackground, setShowBackground] = useState<boolean>(() => {
    return localStorage.getItem('sertifikat_show_bg') !== 'false';
  });

  const [showBgOnBack, setShowBgOnBack] = useState<boolean>(() => {
    return localStorage.getItem('sertifikat_show_bg_back') !== 'false';
  });

  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('sertifikat_bg_opacity');
    return saved ? Number(saved) : 100;
  });

  // Background orientation / alignment of the geometric shapes
  // 'left' (default, origami along left border)
  // 'right' (mirrored horizontal, origami on right)
  // 'top' (rotated 90deg, origami along top)
  // 'bottom' (rotated -90deg, origami along bottom)
  const [bgOrientation, setBgOrientation] = useState<'left' | 'right' | 'top' | 'bottom'>(() => {
    return (localStorage.getItem('sertifikat_bg_orientation') as any) || 'left';
  });

  const fileBgRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // LOGO UPLOAD & MANAGEMENT STATE (Persistent in localStorage)
  // =========================================================================
  const [logoSekolah, setLogoSekolah] = useState<string | null>(() => {
    return localStorage.getItem('sertifikat_logo_sekolah');
  });

  // Transparent logo blend mode (removes solid white bounding boxes)
  const [isLogoSekolahMultiply, setIsLogoSekolahMultiply] = useState<boolean>(() => {
    return localStorage.getItem('sertifikat_logo_sekolah_multiply') !== 'false';
  });

  const [logoJurusan1, setLogoJurusan1] = useState<string | null>(() => {
    return localStorage.getItem('sertifikat_logo_jurusan_1');
  });
  const [namaJurusan1, setNamaJurusan1] = useState<string>(() => {
    return localStorage.getItem('sertifikat_nama_jurusan_1') || 'Teknik Komputer & Jaringan (TKJ)';
  });

  const [logoJurusan2, setLogoJurusan2] = useState<string | null>(() => {
    return localStorage.getItem('sertifikat_logo_jurusan_2');
  });
  const [namaJurusan2, setNamaJurusan2] = useState<string>(() => {
    return localStorage.getItem('sertifikat_nama_jurusan_2') || 'Teknik & Bisnis Sepeda Motor (TBSM)';
  });

  const [isLogoJurusanMultiply, setIsLogoJurusanMultiply] = useState<boolean>(() => {
    return localStorage.getItem('sertifikat_logo_jurusan_multiply') !== 'false';
  });

  // Display mode for the right-hand logos:
  // 'both' (show both department logos side-by-side)
  // 'auto' (match student's major)
  // 'jurusan1' (always show major 1)
  // 'jurusan2' (always show major 2)
  const [modeLogoJurusan, setModeLogoJurusan] = useState<'both' | 'auto' | 'jurusan1' | 'jurusan2'>(() => {
    return (localStorage.getItem('sertifikat_mode_logo_jurusan') as any) || 'both';
  });

  // File input refs for uploading logos
  const fileSekolahRef = useRef<HTMLInputElement>(null);
  const fileJurusan1Ref = useRef<HTMLInputElement>(null);
  const fileJurusan2Ref = useRef<HTMLInputElement>(null);

  const handleFileUpload = (type: 'sekolah' | 'jurusan1' | 'jurusan2', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPG, SVG, WebP)!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar (maksimal 2 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'sekolah') {
        setLogoSekolah(dataUrl);
        localStorage.setItem('sertifikat_logo_sekolah', dataUrl);
      } else if (type === 'jurusan1') {
        setLogoJurusan1(dataUrl);
        localStorage.setItem('sertifikat_logo_jurusan_1', dataUrl);
      } else if (type === 'jurusan2') {
        setLogoJurusan2(dataUrl);
        localStorage.setItem('sertifikat_logo_jurusan_2', dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetLogo = (type: 'sekolah' | 'jurusan1' | 'jurusan2') => {
    if (type === 'sekolah') {
      setLogoSekolah(null);
      localStorage.removeItem('sertifikat_logo_sekolah');
    } else if (type === 'jurusan1') {
      setLogoJurusan1(null);
      localStorage.removeItem('sertifikat_logo_jurusan_1');
    } else if (type === 'jurusan2') {
      setLogoJurusan2(null);
      localStorage.removeItem('sertifikat_logo_jurusan_2');
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPG, WebP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBgSertifikatUrl(dataUrl);
      localStorage.setItem('sertifikat_bg_image', dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetBg = () => {
    setBgSertifikatUrl(DEFAULT_BG_ASSET);
    localStorage.setItem('sertifikat_bg_image', DEFAULT_BG_ASSET);
  };

  const handleSaveMode = (mode: 'both' | 'auto' | 'jurusan1' | 'jurusan2') => {
    setModeLogoJurusan(mode);
    localStorage.setItem('sertifikat_mode_logo_jurusan', mode);
  };

  // Internal Jurusan list synced from database
  const [internalJurusanList, setInternalJurusanList] = useState<MasterJurusan[]>(masterJurusanList);
  const [isSyncingKaprodi, setIsSyncingKaprodi] = useState(false);

  // Sync internalJurusanList whenever prop changes or on initial mount
  useEffect(() => {
    if (masterJurusanList && masterJurusanList.length > 0) {
      setInternalJurusanList(masterJurusanList);
    } else {
      getMasterJurusanList()
        .then((data) => {
          if (data && data.length > 0) {
            setInternalJurusanList(data);
          }
        })
        .catch((err) => console.warn('Gagal memuat master_jurusan:', err));
    }
  }, [masterJurusanList]);

  // Helper: Resolve Kaprodi directly from database (master_jurusan.kepala_program)
  const resolveKaprodiFromDatabase = (prodiName: string | undefined, jurusans: MasterJurusan[]): string => {
    if (!prodiName) {
      const firstActive = jurusans.find((j) => j.isActive && j.kepalaProgram?.trim()) || jurusans[0];
      return firstActive?.kepalaProgram || 'Ahmad Zulfikar, S.T., M.Kom.';
    }

    const p = prodiName.toLowerCase().trim();

    // 1. Exact match with kode or nama from database
    const matched = jurusans.find((j) => {
      const kode = (j.kode || '').toLowerCase().trim();
      const nama = (j.nama || '').toLowerCase().trim();
      if (!kode && !nama) return false;
      return (
        (kode && (p === kode || p.includes(kode))) ||
        (nama && (p === nama || p.includes(nama) || nama.includes(p)))
      );
    });

    if (matched && matched.kepalaProgram?.trim()) {
      return matched.kepalaProgram.trim();
    }

    // 2. Vocational keyword matching fallback to database records
    const heuristicMatch = jurusans.find((j) => {
      const k = (j.kode || '').toLowerCase();
      const n = (j.nama || '').toLowerCase();
      if ((p.includes('rpl') || p.includes('perangkat') || p.includes('software')) && (k.includes('rpl') || n.includes('perangkat'))) return true;
      if ((p.includes('tkj') || p.includes('jaringan') || p.includes('komputer')) && (k.includes('tkj') || n.includes('jaringan') || n.includes('komputer'))) return true;
      if ((p.includes('tbsm') || p.includes('motor') || p.includes('otomotif') || p.includes('sepeda')) && (k.includes('tbsm') || n.includes('motor') || n.includes('otomotif'))) return true;
      if ((p.includes('dkv') || p.includes('desain') || p.includes('visual')) && (k.includes('dkv') || n.includes('desain') || n.includes('visual'))) return true;
      if ((p.includes('sija') || p.includes('sistem informasi') || p.includes('aplikasi')) && (k.includes('sija') || n.includes('sistem informasi'))) return true;
      if ((p.includes('akl') || p.includes('akuntansi')) && (k.includes('akl') || n.includes('akuntansi'))) return true;
      return false;
    });

    if (heuristicMatch && heuristicMatch.kepalaProgram?.trim()) {
      return heuristicMatch.kepalaProgram.trim();
    }

    // 3. Fallback to any active record with kepalaProgram
    const anyWithKaprodi = jurusans.find((j) => j.kepalaProgram?.trim());
    if (anyWithKaprodi) {
      return anyWithKaprodi.kepalaProgram.trim();
    }

    // 4. Default fallback
    return 'Ahmad Zulfikar, S.T., M.Kom.';
  };

  // Editable Certificate Parameters
  const [noSertifikat, setNoSertifikat] = useState('');
  const [tanggalTerbit, setTanggalTerbit] = useState('');
  const [tempatTerbit, setTempatTerbit] = useState('Tangerang');
  const [namaKepsek, setNamaKepsek] = useState(() => {
    return localStorage.getItem('sertifikat_nama_kepsek') || 'Drs. H. Ahmad Fauzi, M.Pd.';
  });
  const [nipKepsek, setNipKepsek] = useState(() => {
    return localStorage.getItem('sertifikat_nip_kepsek') || '19720815 199803 1 004';
  });
  const [namaKetuaPanitia, setNamaKetuaPanitia] = useState(() => {
    return localStorage.getItem('sertifikat_nama_ketua_panitia') || 'Dr. Ir. Hendra Kurniawan, M.T.';
  });
  const [nipKetuaPanitia, setNipKetuaPanitia] = useState(() => {
    return localStorage.getItem('sertifikat_nip_ketua_panitia') || '19800512 200501 1 008';
  });
  const [namaKaprodi, setNamaKaprodi] = useState('');
  const [nipKaprodi, setNipKaprodi] = useState(() => {
    return localStorage.getItem('sertifikat_nip_kaprodi') || '19820718 200604 1 012';
  });
  const [namaPimpinanDudi, setNamaPimpinanDudi] = useState('');
  const [jabatanPimpinanDudi, setJabatanPimpinanDudi] = useState('Pimpinan / Pembimbing Industri');

  // Initialize certificate fields whenever active student or jurusan list changes
  useEffect(() => {
    if (mahasiswa) {
      const year = new Date().getFullYear();
      const numCode = String(currentIndex + 1).padStart(3, '0');
      setNoSertifikat(`421.5/PKL-${numCode}/SMK-MA/${year}`);
      
      const now = new Date();
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      setTanggalTerbit(`${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
      
      setNamaPimpinanDudi(mahasiswa.pembimbingDudi || `Pimpinan ${mahasiswa.perusahaan}`);

      // Update nama Kaprodi otomatis dari data database master_jurusan sesuai jurusan siswa
      const resolvedKaprodi = resolveKaprodiFromDatabase(mahasiswa.prodi, internalJurusanList);
      setNamaKaprodi(resolvedKaprodi);
    }
  }, [mahasiswa?.id, currentIndex, internalJurusanList]);

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0 && onSelectMahasiswa) {
        onSelectMahasiswa(pesertaList[currentIndex - 1].id);
      }
      if (e.key === 'ArrowRight' && currentIndex < pesertaList.length - 1 && onSelectMahasiswa) {
        onSelectMahasiswa(pesertaList[currentIndex + 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, pesertaList, onClose, onSelectMahasiswa]);

  if (!mahasiswa) return null;

  // Evaluation calculations for this student
  const studentEvaluations = penilaianList.filter((p) => p.mahasiswaId === mahasiswa.id);
  const aggregate = calculateFinalAggregate(mahasiswa.id, penilaianList);

  // Criteria scores helper
  const getCriteriaScore = (kriteriaId: string): number => {
    if (studentEvaluations.length === 0) return 85;
    const scores: number[] = [];
    studentEvaluations.forEach((e) => {
      const item = e.nilaiItems?.find((ni) => ni.kriteriaId === kriteriaId);
      if (item && typeof item.skor === 'number' && !isNaN(item.skor)) {
        scores.push(item.skor);
      }
    });
    if (scores.length === 0) return 85;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg);
  };

  const studentNISN = masterSiswa?.nisn || mahasiswa.nim || '0071234567';
  const studentNIS = masterSiswa?.nisn ? `2024.${masterSiswa.nisn.slice(-4)}` : '2024.10.012';

  const handlePrint = () => {
    window.print();
  };

  // Determine which right logo to show
  const showJurusan1 = modeLogoJurusan === 'both' || modeLogoJurusan === 'jurusan1' || 
    (modeLogoJurusan === 'auto' && (mahasiswa.prodi.toLowerCase().includes('jaringan') || mahasiswa.prodi.toLowerCase().includes('tkj') || mahasiswa.prodi.toLowerCase().includes('rpl') || mahasiswa.prodi.toLowerCase().includes('sija') || !mahasiswa.prodi.toLowerCase().includes('motor')));
  
  const showJurusan2 = modeLogoJurusan === 'both' || modeLogoJurusan === 'jurusan2' || 
    (modeLogoJurusan === 'auto' && (mahasiswa.prodi.toLowerCase().includes('motor') || mahasiswa.prodi.toLowerCase().includes('tbsm') || mahasiswa.prodi.toLowerCase().includes('otomotif') || mahasiswa.prodi.toLowerCase().includes('akl') || mahasiswa.prodi.toLowerCase().includes('akuntansi')));

  // Render Transparent School Logo
  const renderSchoolLogo = (sizeClass = "w-14 h-14 sm:w-16 sm:h-16") => {
    if (logoSekolah) {
      return (
        <img 
          src={logoSekolah} 
          alt="Logo Sekolah" 
          className={`${sizeClass} object-contain bg-transparent ${isLogoSekolahMultiply ? 'mix-blend-multiply' : ''}`}
        />
      );
    }
    return (
      <div className={`${sizeClass} bg-transparent flex flex-col items-center justify-center relative flex-shrink-0`}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-emerald-700/80 bg-transparent flex items-center justify-center text-emerald-800">
          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-700" />
        </div>
      </div>
    );
  };

  // Render Transparent Jurusan 1 Logo
  const renderJurusan1Logo = (sizeClass = "w-12 h-12 sm:w-14 sm:h-14") => {
    if (logoJurusan1) {
      return (
        <img 
          src={logoJurusan1} 
          alt={namaJurusan1} 
          className={`${sizeClass} object-contain bg-transparent ${isLogoJurusanMultiply ? 'mix-blend-multiply' : ''}`}
          title={namaJurusan1}
        />
      );
    }
    return (
      <div className={`${sizeClass} bg-transparent flex flex-col items-center justify-center relative flex-shrink-0`}>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-cyan-600/80 bg-transparent flex items-center justify-center text-cyan-800">
          <Cpu className="w-6 h-6 text-cyan-700" />
        </div>
      </div>
    );
  };

  // Render Transparent Jurusan 2 Logo
  const renderJurusan2Logo = (sizeClass = "w-12 h-12 sm:w-14 sm:h-14") => {
    if (logoJurusan2) {
      return (
        <img 
          src={logoJurusan2} 
          alt={namaJurusan2} 
          className={`${sizeClass} object-contain bg-transparent ${isLogoJurusanMultiply ? 'mix-blend-multiply' : ''}`}
          title={namaJurusan2}
        />
      );
    }
    return (
      <div className={`${sizeClass} bg-transparent flex flex-col items-center justify-center relative flex-shrink-0`}>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-600/80 bg-transparent flex items-center justify-center text-blue-800">
          <Wrench className="w-6 h-6 text-blue-700" />
        </div>
      </div>
    );
  };

  // Dynamic CSS classes for Background orientation
  const getBgOrientationClass = () => {
    switch (bgOrientation) {
      case 'right':
        return 'scale-x-[-1]';
      case 'top':
        return 'rotate-90 scale-[1.42]';
      case 'bottom':
        return '-rotate-90 scale-[1.42]';
      case 'left':
      default:
        return 'rotate-0';
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-slate-100 rounded-3xl border border-slate-300 shadow-2xl max-w-6xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        
        {/* ========================================================================= */}
        {/* TOP CONTROL BAR (Hidden during printing)                                  */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 text-white no-print border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-teal-900/40 flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>Cetak Sertifikat PKL (A4 Landscape 2 Muka)</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-xs">
                  Gradasi Hijau &amp; Biru
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium truncate max-w-md mt-0.5">
                {mahasiswa.nama} ({studentNISN}) • {mahasiswa.prodi}
              </p>
            </div>
          </div>

          {/* Center Actions: View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl self-start md:self-auto border border-emerald-800/40 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'both' 
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              2 Muka
            </button>
            <button
              type="button"
              onClick={() => setViewMode('front')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'front' 
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Muka 1
            </button>
            <button
              type="button"
              onClick={() => setViewMode('back')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'back' 
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Muka 2
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all-fronts')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'all-fronts' 
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Cetak Halaman 1 untuk Semua Peserta"
            >
              Semua Hal. 1 ({pesertaList.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all-backs')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'all-backs' 
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Cetak Halaman 2 untuk Semua Peserta"
            >
              Semua Hal. 2 ({pesertaList.length})
            </button>
          </div>

          {/* Right Controls: Navigation, Logo & Background Settings, Print & Close */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Prev / Next Student */}
            {onSelectMahasiswa && pesertaList.length > 1 && (
              <div className="flex items-center gap-1 border-r border-emerald-800/50 pr-2 mr-1">
                <button
                  type="button"
                  disabled={currentIndex <= 0}
                  onClick={() => onSelectMahasiswa(pesertaList[currentIndex - 1].id)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Siswa Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-emerald-300 px-1">
                  {currentIndex + 1}/{pesertaList.length}
                </span>
                <button
                  type="button"
                  disabled={currentIndex >= pesertaList.length - 1}
                  onClick={() => onSelectMahasiswa(pesertaList[currentIndex + 1].id)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Siswa Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Toggle Settings Drawer */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                showSettings 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 border-emerald-400 shadow-md' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Upload Logo, Background & Atur Dokumen"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Background &amp; Logo</span>
            </button>

            {/* Print Trigger */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-teal-900/40 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLLAPSIBLE BACKGROUND, LOGO & SETTINGS DRAWER (No-print)                 */}
        {/* ========================================================================= */}
        {showSettings && (
          <div className="p-4 bg-slate-900 border-b border-emerald-800/40 text-white text-xs space-y-4 no-print animate-in slide-in-from-top-2">
            
            {/* Drawer Subtabs */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('background')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeSettingsTab === 'background'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Wallpaper className="w-3.5 h-3.5" />
                  <span>Background Sertifikat di Belakang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('logo')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeSettingsTab === 'logo'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Logo Transparan (Kiri: Sekolah, Kanan: Dua Jurusan)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('data')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeSettingsTab === 'data'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Teks Surat &amp; Tanda Tangan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('barcode')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeSettingsTab === 'barcode'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <BarcodeIcon className="w-3.5 h-3.5" />
                  <span>Barcode &amp; Urutan Siswa</span>
                </button>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                Semua perubahan otomatis tersimpan &amp; diterapkan saat mencetak
              </span>
            </div>

            {/* TAB 1: BACKGROUND SERTIFIKAT DI BELAKANG */}
            {activeSettingsTab === 'background' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Left: Background Thumbnail Preview */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-amber-600/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                          <Wallpaper className="w-4 h-4 text-amber-400" />
                          <span>Background Sertifikat Aktif</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/80">
                          Layer Belakang
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Gambar latar belakang geometrik origami (Biru, Oranye &amp; Merah) terpasang di belakang sertifikat.
                      </p>

                      <div className="relative aspect-[297/210] rounded-xl border-2 border-slate-700 bg-white overflow-hidden shadow-inner flex items-center justify-center">
                        {bgSertifikatUrl ? (
                          <img 
                            src={bgSertifikatUrl} 
                            alt="Preview Background" 
                            className={`w-full h-full object-cover transition-transform ${getBgOrientationClass()}`}
                            style={{ opacity: bgOpacity / 100 }}
                          />
                        ) : (
                          <span className="text-slate-400 text-xs">Tidak Ada Background</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-2 pointer-events-none">
                          <span className="text-[10px] font-mono text-white">
                            Ukuran: A4 Landscape Presisi
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-700 mt-3">
                      <input 
                        type="file" 
                        ref={fileBgRef}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden" 
                        onChange={handleBgUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileBgRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Background Baru</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetBg}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        title="Kembalikan ke Background Resmi"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Middle: Background Options & Alignment */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-3">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                      <span>Posisi &amp; Penyelarasan Ornamen Geometris</span>
                    </span>
                    
                    <p className="text-[11px] text-slate-400">
                      Pilih posisi ornamen warna di lembar A4 landscape sertifikat:
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBgOrientation('left');
                          localStorage.setItem('sertifikat_bg_orientation', 'left');
                        }}
                        className={`p-2 rounded-xl text-left font-bold text-xs border transition-all ${
                          bgOrientation === 'left'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className="block text-[11px]">Sisi Kiri (Bawaan)</span>
                        <span className="text-[9px] font-normal opacity-80">Ornamen di tepi kiri</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBgOrientation('right');
                          localStorage.setItem('sertifikat_bg_orientation', 'right');
                        }}
                        className={`p-2 rounded-xl text-left font-bold text-xs border transition-all ${
                          bgOrientation === 'right'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className="block text-[11px]">Sisi Kanan (Cermin)</span>
                        <span className="text-[9px] font-normal opacity-80">Ornamen di tepi kanan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBgOrientation('top');
                          localStorage.setItem('sertifikat_bg_orientation', 'top');
                        }}
                        className={`p-2 rounded-xl text-left font-bold text-xs border transition-all ${
                          bgOrientation === 'top'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className="block text-[11px]">Sisi Atas (Landscape)</span>
                        <span className="text-[9px] font-normal opacity-80">Rotasi 90 derajat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBgOrientation('bottom');
                          localStorage.setItem('sertifikat_bg_orientation', 'bottom');
                        }}
                        className={`p-2 rounded-xl text-left font-bold text-xs border transition-all ${
                          bgOrientation === 'bottom'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className="block text-[11px]">Sisi Bawah</span>
                        <span className="text-[9px] font-normal opacity-80">Rotasi 270 derajat</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-300">
                          Tingkat Transparansi / Opasitas:
                        </label>
                        <span className="font-mono font-bold text-amber-400 text-xs">{bgOpacity}%</span>
                      </div>
                      <input 
                        type="range"
                        min="20"
                        max="100"
                        value={bgOpacity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBgOpacity(val);
                          localStorage.setItem('sertifikat_bg_opacity', String(val));
                        }}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right: Visibility Controls */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-white flex items-center gap-1.5 text-xs mb-2">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>Keterlihatan &amp; Halaman Belakang</span>
                      </span>

                      <div className="space-y-2.5">
                        <label className="flex items-start gap-2.5 cursor-pointer bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                          <input 
                            type="checkbox"
                            checked={showBackground}
                            onChange={(e) => {
                              setShowBackground(e.target.checked);
                              localStorage.setItem('sertifikat_show_bg', String(e.target.checked));
                            }}
                            className="mt-0.5 rounded-md text-amber-500 focus:ring-0"
                          />
                          <div>
                            <span className="font-bold text-white block text-xs">Aktifkan Background Sertifikat</span>
                            <span className="text-[10px] text-slate-400">Tampilkan ornamen background saat cetak dan pratinjau</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                          <input 
                            type="checkbox"
                            checked={showBgOnBack}
                            onChange={(e) => {
                              setShowBgOnBack(e.target.checked);
                              localStorage.setItem('sertifikat_show_bg_back', String(e.target.checked));
                            }}
                            className="mt-0.5 rounded-md text-amber-500 focus:ring-0"
                          />
                          <div>
                            <span className="font-bold text-white block text-xs">Terapkan pada Muka 2 (Transkrip)</span>
                            <span className="text-[10px] text-slate-400">Halaman belakang transkrip juga memiliki background geometrik</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                      <span>Background otomatis pas ke ukuran A4 landscape (297 × 210 mm) tanpa terpotong teks penting.</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: UPLOAD LOGO SEKOLAH (TRANSPARAN) & DUA JURUSAN */}
            {activeSettingsTab === 'logo' && (
              <div className="space-y-4">
                
                {/* 3 Upload Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* CARD 1: LOGO SEKOLAH (KIRI) - TRANSPARAN */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-emerald-700/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                          <GraduationCap className="w-4 h-4 text-emerald-400" />
                          <span>Logo Sekolah (Kiri - Transparan)</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                          Posisi Kiri
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Logo SMK Mathla'ul Anwar Buaranjati tanpa kotak latar belakang (100% transparan).
                      </p>

                      <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 mb-2.5">
                        <div className="w-14 h-14 bg-transparent flex items-center justify-center border border-dashed border-slate-700 rounded-lg p-1">
                          {renderSchoolLogo("w-12 h-12")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">
                            {logoSekolah ? 'Logo Sekolah Kustom' : 'Vektor Transparan (SMK MA)'}
                          </p>
                          <p className="text-[10px] text-emerald-400 truncate">
                            ✓ Latar Belakang Transparan
                          </p>
                        </div>
                      </div>

                      {/* Multiply Transparency Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-2 rounded-lg border border-slate-700/80 mb-2">
                        <input 
                          type="checkbox"
                          checked={isLogoSekolahMultiply}
                          onChange={(e) => {
                            setIsLogoSekolahMultiply(e.target.checked);
                            localStorage.setItem('sertifikat_logo_sekolah_multiply', String(e.target.checked));
                          }}
                          className="rounded text-emerald-500"
                        />
                        <span className="text-[10px] text-slate-300">
                          Hilangkan Latar Putih Otomatis (*Multiply Blend*)
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                      <input 
                        type="file" 
                        ref={fileSekolahRef}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden" 
                        onChange={(e) => handleFileUpload('sekolah', e)}
                      />
                      <button
                        type="button"
                        onClick={() => fileSekolahRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo Sekolah</span>
                      </button>
                      {logoSekolah && (
                        <button
                          type="button"
                          onClick={() => handleResetLogo('sekolah')}
                          className="p-1.5 bg-slate-700 hover:bg-red-900/80 text-slate-300 hover:text-red-200 rounded-lg transition-colors cursor-pointer"
                          title="Kembalikan ke Logo Bawaan"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CARD 2: LOGO JURUSAN 1 (KANAN) */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-cyan-700/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <span>Logo Jurusan 1 (Kanan)</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                          Jurusan A
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Nama Jurusan 1:</label>
                        <input
                          type="text"
                          value={namaJurusan1}
                          onChange={(e) => {
                            setNamaJurusan1(e.target.value);
                            localStorage.setItem('sertifikat_nama_jurusan_1', e.target.value);
                          }}
                          placeholder="misal: Teknik Komputer & Jaringan"
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 mb-2">
                        <div className="w-14 h-14 bg-transparent flex items-center justify-center border border-dashed border-slate-700 rounded-lg p-1">
                          {renderJurusan1Logo("w-12 h-12")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">
                            {logoJurusan1 ? 'Logo Kustom Terpasang' : 'Logo Bawaan IT / TKJ'}
                          </p>
                          <p className="text-[10px] text-cyan-400 truncate">
                            {namaJurusan1}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                      <input 
                        type="file" 
                        ref={fileJurusan1Ref}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden" 
                        onChange={(e) => handleFileUpload('jurusan1', e)}
                      />
                      <button
                        type="button"
                        onClick={() => fileJurusan1Ref.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo</span>
                      </button>
                      {logoJurusan1 && (
                        <button
                          type="button"
                          onClick={() => handleResetLogo('jurusan1')}
                          className="p-1.5 bg-slate-700 hover:bg-red-900/80 text-slate-300 hover:text-red-200 rounded-lg transition-colors cursor-pointer"
                          title="Kembalikan ke Logo Bawaan"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CARD 3: LOGO JURUSAN 2 (KANAN) */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-blue-700/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-blue-300 flex items-center gap-1.5 text-xs">
                          <Wrench className="w-4 h-4 text-blue-400" />
                          <span>Logo Jurusan 2 (Kanan)</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/80">
                          Jurusan B
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Nama Jurusan 2:</label>
                        <input
                          type="text"
                          value={namaJurusan2}
                          onChange={(e) => {
                            setNamaJurusan2(e.target.value);
                            localStorage.setItem('sertifikat_nama_jurusan_2', e.target.value);
                          }}
                          placeholder="misal: Teknik & Bisnis Sepeda Motor"
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] outline-none focus:border-blue-400"
                        />
                      </div>

                      <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 mb-2">
                        <div className="w-14 h-14 bg-transparent flex items-center justify-center border border-dashed border-slate-700 rounded-lg p-1">
                          {renderJurusan2Logo("w-12 h-12")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">
                            {logoJurusan2 ? 'Logo Kustom Terpasang' : 'Logo Bawaan Otomotif'}
                          </p>
                          <p className="text-[10px] text-blue-400 truncate">
                            {namaJurusan2}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                      <input 
                        type="file" 
                        ref={fileJurusan2Ref}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden" 
                        onChange={(e) => handleFileUpload('jurusan2', e)}
                      />
                      <button
                        type="button"
                        onClick={() => fileJurusan2Ref.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo</span>
                      </button>
                      {logoJurusan2 && (
                        <button
                          type="button"
                          onClick={() => handleResetLogo('jurusan2')}
                          className="p-1.5 bg-slate-700 hover:bg-red-900/80 text-slate-300 hover:text-red-200 rounded-lg transition-colors cursor-pointer"
                          title="Kembalikan ke Logo Bawaan"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* LOGO DISPLAY SELECTOR */}
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-bold text-white text-xs">Pilihan Mode Tampilan Logo Kanan:</p>
                      <p className="text-[10px] text-slate-400">Atur apakah menampilkan kedua logo jurusan berdampingan atau dinamis per siswa</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSaveMode('both')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        modeLogoJurusan === 'both'
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-xs'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Dua Logo Jurusan (Berdampingan)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveMode('auto')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        modeLogoJurusan === 'auto'
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-xs'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Otomatis Sesuai Jurusan Siswa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveMode('jurusan1')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        modeLogoJurusan === 'jurusan1'
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-xs'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Hanya Jurusan 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveMode('jurusan2')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        modeLogoJurusan === 'jurusan2'
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-xs'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Hanya Jurusan 2
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: DATA CETAK, NOMOR SURAT & TANDA TANGAN */}
            {activeSettingsTab === 'data' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Pilihan Font Judul Sertifikat:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setFontJudul('certificate');
                          localStorage.setItem('sertifikat_font_judul', 'certificate');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                          fontJudul === 'certificate'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs ring-1 ring-emerald-300'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                        }`}
                      >
                        Certificate Font ✨
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFontJudul('pinyon');
                          localStorage.setItem('sertifikat_font_judul', 'pinyon');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                          fontJudul === 'pinyon'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs ring-1 ring-emerald-300'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                        }`}
                      >
                        Pinyon Script
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFontJudul('cinzel-dec');
                          localStorage.setItem('sertifikat_font_judul', 'cinzel-dec');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                          fontJudul === 'cinzel-dec'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs ring-1 ring-emerald-300'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                        }`}
                      >
                        Cinzel Dec.
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFontJudul('playfair');
                          localStorage.setItem('sertifikat_font_judul', 'playfair');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                          fontJudul === 'playfair'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs ring-1 ring-emerald-300'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                        }`}
                      >
                        Playfair
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Tanggal &amp; Tempat Terbit
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempatTerbit}
                        onChange={(e) => setTempatTerbit(e.target.value)}
                        placeholder="Kota"
                        className="w-1/3 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-emerald-400"
                      />
                      <input
                        type="text"
                        value={tanggalTerbit}
                        onChange={(e) => setTanggalTerbit(e.target.value)}
                        placeholder="Tanggal Terbit"
                        className="w-2/3 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                  {/* Depan: Kepala Sekolah */}
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-emerald-700/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-emerald-300">
                        Tanda Tangan Depan:
                      </label>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                        Muka 1
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Kepala SMK MA Buaranjati</p>
                    <input
                      type="text"
                      value={namaKepsek}
                      onChange={(e) => {
                        setNamaKepsek(e.target.value);
                        localStorage.setItem('sertifikat_nama_kepsek', e.target.value);
                      }}
                      placeholder="Nama Kepala Sekolah"
                      className="w-full p-1.5 mb-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-emerald-400"
                    />
                    <input
                      type="text"
                      value={nipKepsek}
                      onChange={(e) => {
                        setNipKepsek(e.target.value);
                        localStorage.setItem('sertifikat_nip_kepsek', e.target.value);
                      }}
                      placeholder="NIP Kepala Sekolah"
                      className="w-full p-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 font-mono text-[10px] outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Belakang Kiri: Ketua Panitia Sidang PKL */}
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-teal-700/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-teal-300">
                        Tanda Tangan Belakang (Kiri):
                      </label>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-950 text-teal-300">
                        Muka 2 Kiri
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Ketua Panitia Sidang PKL</p>
                    <input
                      type="text"
                      value={namaKetuaPanitia}
                      onChange={(e) => {
                        setNamaKetuaPanitia(e.target.value);
                        localStorage.setItem('sertifikat_nama_ketua_panitia', e.target.value);
                      }}
                      placeholder="Nama Ketua Panitia"
                      className="w-full p-1.5 mb-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-teal-400"
                    />
                    <input
                      type="text"
                      value={nipKetuaPanitia}
                      onChange={(e) => {
                        setNipKetuaPanitia(e.target.value);
                        localStorage.setItem('sertifikat_nip_ketua_panitia', e.target.value);
                      }}
                      placeholder="NIP Ketua Panitia"
                      className="w-full p-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 font-mono text-[10px] outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Belakang Kanan: Kaprodi Jurusan */}
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-blue-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-blue-300">
                        Tanda Tangan Belakang (Kanan):
                      </label>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300">
                        Muka 2 Kanan
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <p className="text-[10px] text-slate-300 font-medium truncate">
                        Jurusan: <span className="text-emerald-400 font-bold">{mahasiswa.prodi}</span>
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsSyncingKaprodi(true);
                          try {
                            const fresh = await getMasterJurusanList();
                            setInternalJurusanList(fresh);
                            const updated = resolveKaprodiFromDatabase(mahasiswa.prodi, fresh);
                            setNamaKaprodi(updated);
                          } catch (err) {
                            console.warn('Sync kaprodi error:', err);
                          } finally {
                            setIsSyncingKaprodi(false);
                          }
                        }}
                        disabled={isSyncingKaprodi}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-600/50 flex items-center gap-1 transition-colors shrink-0"
                        title="Ambil data Kaprodi terbaru dari database master_jurusan"
                      >
                        <RotateCcw className={`w-2.5 h-2.5 ${isSyncingKaprodi ? 'animate-spin' : ''}`} />
                        <span>{isSyncingKaprodi ? 'Sinkron...' : 'Sync DB'}</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={namaKaprodi}
                      onChange={(e) => {
                        setNamaKaprodi(e.target.value);
                      }}
                      placeholder="Nama Kaprodi Jurusan"
                      className="w-full p-1.5 mb-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-400"
                    />
                    <div className="flex items-center gap-1 text-[9px] text-emerald-400">
                      <Database className="w-2.5 h-2.5 shrink-0" />
                      <span>Otomatis sinkron dengan database (tabel master_jurusan)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GENERATE BARCODE DARI NISN DAN URUTAN */}
            {activeSettingsTab === 'barcode' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left: Live Barcode & QR Preview */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-teal-600/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-teal-300 flex items-center gap-1.5 text-xs">
                          <BarcodeIcon className="w-4 h-4 text-emerald-400" />
                          <span>Pratinjau Barcode Ter-generate</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800/80">
                          Live Render
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Barcode resmi ter-generate otomatis secara dinamis dari kombinasi NISN dan nomor urut peserta.
                      </p>

                      <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-inner flex flex-col items-center justify-center min-h-[100px]">
                        <CertificateBarcode
                          nisn={studentNISN}
                          urutan={effectiveUrutan}
                          type={barcodeType}
                          format={barcodeFormat}
                          showDetails={true}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Status Generator:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aktif &amp; Terverifikasi
                      </span>
                    </div>
                  </div>

                  {/* Middle: Barcode Type & Format Selection */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-3">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <SlidersHorizontal className="w-4 h-4 text-teal-400" />
                      <span>Format &amp; Tipe Barcode</span>
                    </span>

                    {/* Mode Barcode: 1D Barcode vs QR Code vs Both */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                        Tipe Barcode:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setBarcodeType('barcode');
                            localStorage.setItem('sertifikat_barcode_type', 'barcode');
                          }}
                          className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                            barcodeType === 'barcode'
                              ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-xs'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <BarcodeIcon className="w-4 h-4 mx-auto mb-1" />
                          <span className="block text-[10.5px]">Barcode 1D</span>
                          <span className="text-[8.5px] font-normal opacity-80">Garis Batang</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBarcodeType('qrcode');
                            localStorage.setItem('sertifikat_barcode_type', 'qrcode');
                          }}
                          className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                            barcodeType === 'qrcode'
                              ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-xs'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <QrCode className="w-4 h-4 mx-auto mb-1" />
                          <span className="block text-[10.5px]">QR Code 2D</span>
                          <span className="text-[8.5px] font-normal opacity-80">Matriks</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBarcodeType('both');
                            localStorage.setItem('sertifikat_barcode_type', 'both');
                          }}
                          className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                            barcodeType === 'both'
                              ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-xs'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 mx-auto mb-1" />
                          <span className="block text-[10.5px]">Keduanya</span>
                          <span className="text-[8.5px] font-normal opacity-80">Barcode + QR</span>
                        </button>
                      </div>
                    </div>

                    {/* Format Nomor Seri */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                        Format Kode Barcode (NISN + Urutan):
                      </label>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setBarcodeFormat('simple');
                            localStorage.setItem('sertifikat_barcode_format', 'simple');
                          }}
                          className={`w-full p-2 rounded-xl text-left font-bold text-xs border transition-all flex items-center justify-between cursor-pointer ${
                            barcodeFormat === 'simple'
                              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div>
                            <span className="block text-[11px]">NISN-Urutan (Rekomendasi)</span>
                            <span className="text-[9.5px] font-mono text-slate-400">{studentNISN}-{effectiveUrutan}</span>
                          </div>
                          {barcodeFormat === 'simple' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBarcodeFormat('prefix');
                            localStorage.setItem('sertifikat_barcode_format', 'prefix');
                          }}
                          className={`w-full p-2 rounded-xl text-left font-bold text-xs border transition-all flex items-center justify-between cursor-pointer ${
                            barcodeFormat === 'prefix'
                              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div>
                            <span className="block text-[11px]">SMKMA-NISN-Urutan</span>
                            <span className="text-[9.5px] font-mono text-slate-400">SMKMA-{studentNISN}-{effectiveUrutan}</span>
                          </div>
                          {barcodeFormat === 'prefix' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBarcodeFormat('full');
                            localStorage.setItem('sertifikat_barcode_format', 'full');
                          }}
                          className={`w-full p-2 rounded-xl text-left font-bold text-xs border transition-all flex items-center justify-between cursor-pointer ${
                            barcodeFormat === 'full'
                              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div>
                            <span className="block text-[11px]">PKL-2026-NISN-Urutan</span>
                            <span className="text-[9.5px] font-mono text-slate-400">PKL-2026-{studentNISN}-{effectiveUrutan}</span>
                          </div>
                          {barcodeFormat === 'full' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Urutan Siswa & Options */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-3">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      <span>Data Sumber Barcode</span>
                    </span>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Nama Siswa:</span>
                        <span className="font-bold text-white truncate max-w-[150px]">{mahasiswa.nama}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">NISN Siswa:</span>
                        <span className="font-mono font-bold text-emerald-400">{studentNISN}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Urutan Otomatis:</span>
                        <span className="font-mono font-bold text-cyan-400">
                          #{currentIndex + 1} dari {pesertaList.length}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Kustomisasi Nomor Urut (Opsional):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customUrutan}
                          onChange={(e) => setCustomUrutan(e.target.value)}
                          placeholder={String(currentIndex + 1).padStart(3, '0')}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs outline-none focus:border-teal-400"
                        />
                        {customUrutan && (
                          <button
                            type="button"
                            onClick={() => setCustomUrutan('')}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                            title="Reset ke otomatis"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Kosongkan untuk menggunakan nomor urut otomatis (#{String(currentIndex + 1).padStart(3, '0')}).
                      </p>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer bg-slate-900 p-2.5 rounded-xl border border-slate-700 mt-2">
                      <input
                        type="checkbox"
                        checked={showBarcodeOnBack}
                        onChange={(e) => {
                          setShowBarcodeOnBack(e.target.checked);
                          localStorage.setItem('sertifikat_show_barcode_back', String(e.target.checked));
                        }}
                        className="mt-0.5 rounded-md text-teal-500 focus:ring-0"
                      />
                      <div>
                        <span className="font-bold text-white block text-xs">Tampilkan No. Seri di Transkrip</span>
                        <span className="text-[10px] text-slate-400">Cantumkan kode seri verifikasi di halaman 2 (transkrip nilai)</span>
                      </div>
                    </label>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CERTIFICATE PREVIEW & PRINT CANVAS                                        */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-6 lg:p-8 max-h-[82vh] overflow-y-auto space-y-8 bg-slate-300/80">
          
          {/* ======================================================================= */}
          {/* 1. MUKA 1: HALAMAN DEPAN (SERTIFIKAT UTAMA DENGAN BACKGROUND & LOGO TRANSPARAN) */}
          {/* ======================================================================= */}
          {(viewMode === 'both' || viewMode === 'front') && (
            <div className="certificate-sheet bg-[#fcfeff] text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 relative overflow-hidden mx-auto max-w-[1050px] aspect-[297/210] flex flex-col justify-between select-text border-[6px] border-emerald-900/15">
              
              {/* ------------------------------------------------------------- */}
              {/* LAYER BACKGROUND SERTIFIKAT (USER ATTACHMENT ASSET)           */}
              {/* ------------------------------------------------------------- */}
              {showBackground && bgSertifikatUrl && (
                <img 
                  src={bgSertifikatUrl} 
                  alt="Background Sertifikat" 
                  className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 ${getBgOrientationClass()}`}
                  style={{ opacity: bgOpacity / 100 }}
                />
              )}

              {/* Outer Elegant Framing */}
              <div className="absolute inset-1.5 rounded-xl border-2 border-emerald-700/60 pointer-events-none z-10"></div>
              <div className="absolute inset-3 rounded-lg border border-teal-500/40 pointer-events-none z-10"></div>
              <div className="absolute inset-4 rounded-md border-2 border-blue-800/40 pointer-events-none z-10"></div>
              
              {/* 4 Luxury Corner Ornaments in Emerald-Blue Gradient */}
              <div className="absolute top-4 left-4 w-14 h-14 border-t-4 border-l-4 border-emerald-700 rounded-tl-xl pointer-events-none flex items-start justify-start p-1 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600"></div>
              </div>
              <div className="absolute top-4 right-4 w-14 h-14 border-t-4 border-r-4 border-blue-700 rounded-tr-xl pointer-events-none flex items-start justify-end p-1 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-emerald-600"></div>
              </div>
              <div className="absolute bottom-4 left-4 w-14 h-14 border-b-4 border-l-4 border-emerald-700 rounded-bl-xl pointer-events-none flex items-end justify-start p-1 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600"></div>
              </div>
              <div className="absolute bottom-4 right-4 w-14 h-14 border-b-4 border-r-4 border-blue-700 rounded-br-xl pointer-events-none flex items-end justify-end p-1 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-emerald-600"></div>
              </div>

              {/* Center Transparent Watermark Logo Sekolah */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                {logoSekolah ? (
                  <img
                    src={logoSekolah}
                    alt="Watermark Logo Sekolah"
                    className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] object-contain opacity-[0.055] mix-blend-multiply pointer-events-none select-none"
                  />
                ) : (
                  <div className="opacity-[0.035] pointer-events-none flex flex-col items-center justify-center">
                    <GraduationCap className="w-[380px] h-[380px] text-teal-900" />
                  </div>
                )}
              </div>

              {/* Top Accent Strip in Emerald-Blue Gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 z-10"></div>

              {/* Header Kop Resmi Sertifikat: Logo Sekolah (Kiri) - Teks Tengah - Logo Jurusan (Kanan) */}
              <div className="relative z-10 pt-2 pb-2.5 border-b-2 border-emerald-800/20">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  
                  {/* LOGO SEKOLAH (KIRI - 100% TRANSPARAN) */}
                  <div className="w-16 sm:w-20 flex items-center justify-center flex-shrink-0 bg-transparent">
                    {renderSchoolLogo("w-14 h-14 sm:w-16 sm:h-16")}
                  </div>

                  {/* KOP TEKS TENGAH RESMI */}
                  <div className="text-center flex-1 px-1 sm:px-2">
                    <h1 className="text-xl sm:text-2xl md:text-[27px] font-black uppercase tracking-tight leading-tight bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-900 bg-clip-text text-transparent">
                      SMK MATHLA'UL ANWAR BUARANJATI
                    </h1>
                    <div className="inline-flex items-center gap-2 my-0.5">
                      <span className="h-px w-6 sm:w-10 bg-emerald-600"></span>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-800">
                        TERAKREDITASI • KABUPATEN TANGERANG - BANTEN
                      </p>
                      <span className="h-px w-6 sm:w-10 bg-blue-600"></span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 font-medium">
                      Jl. Raya Mauk KM. 16, Buaran Jati, Kec. Sukadiri, Kab. Tangerang, Banten 15530
                    </p>
                  </div>

                  {/* LOGO JURUSAN (KANAN - DUA JURUSAN) */}
                  <div className="flex items-center justify-center flex-shrink-0 bg-transparent">
                    {modeLogoJurusan === 'both' ? (
                      <div className="flex items-center gap-2 bg-transparent p-1">
                        <div className="flex items-center justify-center">
                          {renderJurusan1Logo("w-11 h-11 sm:w-13 sm:h-13")}
                        </div>
                        <div className="flex items-center justify-center">
                          {renderJurusan2Logo("w-11 h-11 sm:w-13 sm:h-13")}
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 sm:w-20 flex items-center justify-center bg-transparent">
                        {showJurusan1 ? renderJurusan1Logo("w-14 h-14 sm:w-16 sm:h-16") : renderJurusan2Logo("w-14 h-14 sm:w-16 sm:h-16")}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Title Section with Certificate Font */}
              <div className="relative z-10 text-center my-auto py-1 sm:py-2">
                <div className="inline-block relative">
                  {fontJudul === 'certificate' ? (
                    <div className="flex flex-col items-center">
                      <h2 className="text-5xl sm:text-6xl md:text-[68px] lg:text-[76px] font-certificate-script text-slate-950 leading-[0.95] py-1 select-none drop-shadow-xs tracking-normal">
                        Sertifikat
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base font-extrabold tracking-[0.32em] uppercase text-teal-950 font-serif mt-1">
                        Praktik Kerja Lapangan
                      </p>
                    </div>
                  ) : fontJudul === 'pinyon' ? (
                    <div className="flex flex-col items-center">
                      <h2 className="text-5xl sm:text-6xl md:text-[66px] lg:text-[72px] font-pinyon text-slate-950 leading-[0.95] py-1 select-none drop-shadow-xs">
                        Sertifikat
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base font-extrabold tracking-[0.32em] uppercase text-teal-950 font-serif mt-1">
                        Praktik Kerja Lapangan
                      </p>
                    </div>
                  ) : (
                    <h2 className={`text-2xl sm:text-3xl md:text-[34px] lg:text-[37px] font-black uppercase tracking-[0.12em] text-slate-950 ${
                      fontJudul === 'cinzel-dec' 
                        ? 'font-cinzel-decorative' 
                        : fontJudul === 'cinzel' 
                        ? 'font-cinzel' 
                        : 'font-playfair'
                    } drop-shadow-xs leading-tight`}>
                      SERTIFIKAT PRAKTIK KERJA LAPANGAN
                    </h2>
                  )}
                  <div className="flex items-center justify-center gap-3 mt-1.5">
                    <span className="h-0.5 w-16 sm:w-28 bg-gradient-to-r from-transparent via-emerald-600 to-teal-500 rounded-full"></span>
                    <span className="text-teal-700 text-xs">✦</span>
                    <span className="h-0.5 w-16 sm:w-28 bg-gradient-to-r from-teal-500 via-blue-600 to-transparent rounded-full"></span>
                  </div>
                </div>
              </div>

              {/* Statement & Awardee Credentials */}
              <div className="relative z-10 text-center space-y-2 my-auto px-2 sm:px-10">
                <p className="text-xs sm:text-sm font-bold text-slate-700 tracking-wider">
                  Diberikan Kepada :
                </p>

                {/* Student Full Name in Majestic Serif */}
                <div className="py-0.5">
                  <h3 className="text-2xl sm:text-3xl md:text-[33px] font-black text-slate-950 uppercase tracking-tight font-serif">
                    {mahasiswa.nama}
                  </h3>
                  <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-teal-600 to-transparent mx-auto mt-1 mb-1.5"></div>
                  
                  {/* Student Details in Gradient Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50/90 border border-emerald-200 text-emerald-950 font-bold font-mono shadow-2xs">
                      NISN: {studentNISN}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50/90 border border-blue-200 text-blue-950 font-bold shadow-2xs">
                      Kelas: {mahasiswa.kelas || 'XII'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-extrabold text-teal-950 uppercase tracking-wide mt-1.5">
                    Program Keahlian: <span className="text-emerald-800">{mahasiswa.prodi}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed max-w-3xl mx-auto">
                  Telah melaksanakan dan menyelesaikan Program <strong>Praktik Kerja Lapangan (PKL)</strong> serta Ujian Sidang PKL Tahun Pelajaran 2026/2027 pada:
                </p>

                {/* Company Name in Emerald-Blue Gradient Card */}
                <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-blue-50/90 border-2 border-emerald-300/80 rounded-2xl py-2 px-4 max-w-2xl mx-auto shadow-xs backdrop-blur-xs">
                  <p className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight">
                    {mahasiswa.perusahaan}
                  </p>
                  {mahasiswa.judulLaporan && (
                    <p className="text-[11px] text-teal-900 italic mt-0.5 truncate max-w-xl mx-auto font-medium">
                      "{mahasiswa.judulLaporan}"
                    </p>
                  )}
                </div>

                {/* Achievement Badge with Cool Gradient Ribbon */}
                <div className="pt-1 flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-800">Dinyatakan telah memenuhi seluruh aspek kompetensi dan berhak atas predikat:</span>
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-sm shadow-teal-900/30">
                    LULUS ({aggregate.predikat})
                  </span>
                </div>
              </div>

              {/* Signatures & Security Validation (Tanda Tangan Depan: Kepala SMK Mathla'ul Anwar Buaranjati) */}
              <div className="relative z-10 pt-2 border-t-2 border-emerald-800/20 mt-auto">
                <div className="flex items-end justify-between text-xs px-4 sm:px-8">
                  
                  {/* Left: Official Digital Verification Shield & Barcode (Generated from NISN & Urutan) */}
                  <div className="flex items-center">
                    <CertificateBarcode
                      nisn={studentNISN}
                      urutan={effectiveUrutan}
                      type={barcodeType}
                      format={barcodeFormat}
                      showDetails={false}
                    />
                  </div>

                  {/* Right: Kepala SMK Mathla'ul Anwar Buaranjati */}
                  <div className="space-y-1 text-center min-w-[260px]">
                    <p className="text-[11px] text-slate-600 font-medium">{tempatTerbit}, {tanggalTerbit}</p>
                    <p className="font-extrabold text-slate-900 text-xs sm:text-[13px]">
                      Kepala SMK Mathla'ul Anwar Buaranjati
                    </p>
                    <div className="h-16 sm:h-20"></div>
                    <p className="font-black text-slate-950 underline decoration-blue-600 underline-offset-4 text-xs sm:text-[13px]">
                      {namaKepsek}
                    </p>
                  </div>

                </div>
              </div>

              {/* Bottom Decorative Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 z-10"></div>

            </div>
          )}

          {/* Page break marker for duplex/two-sided printing */}
          {viewMode === 'both' && (
            <div className="print-page-break my-4 no-print flex items-center justify-center gap-3 text-xs text-slate-500 font-bold">
              <span className="w-24 h-px bg-slate-400"></span>
              <span className="px-3 py-1 rounded-full bg-slate-300 text-slate-700 uppercase tracking-wider text-[11px]">
                Halaman Belakang: Transkrip Nilai &amp; Capaian Kompetensi PKL
              </span>
              <span className="w-24 h-px bg-slate-400"></span>
            </div>
          )}

          {/* ======================================================================= */}
          {/* 2. MUKA 2: HALAMAN BELAKANG (TRANSKRIP NILAI & CAPAIAN KOMPETENSI)     */}
          {/* ======================================================================= */}
          {(viewMode === 'both' || viewMode === 'back') && (
            <div className="certificate-sheet bg-white text-slate-900 rounded-2xl shadow-2xl p-3 sm:p-4 lg:p-5 relative overflow-hidden mx-auto max-w-[1050px] aspect-[297/210] flex flex-col justify-between select-text border-[6px] border-slate-300">
              
              {/* Optional Background in Muka 2 */}
              {showBackground && showBgOnBack && bgSertifikatUrl && (
                <img 
                  src={bgSertifikatUrl} 
                  alt="Background Transkrip" 
                  className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 ${getBgOrientationClass()}`}
                  style={{ opacity: (bgOpacity * 0.8) / 100 }}
                />
              )}

              {/* Outer Neat Border */}
              <div className="absolute inset-1.5 rounded-xl border-2 border-slate-300 pointer-events-none z-10"></div>
              <div className="absolute inset-3 rounded-lg border border-teal-500/30 pointer-events-none z-10"></div>
              
              {/* Top Accent Strip in Emerald-Blue Gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 z-10"></div>

              {/* Header Transkrip: Logo Sekolah (Kiri) - Teks Tengah - Logo Jurusan (Kanan) */}
              <div className="relative z-10 pt-0.5 pb-1.5 border-b-2 border-slate-900 px-2 sm:px-4 md:px-6">
                <div className="flex items-center justify-between gap-3 sm:gap-6">
                  
                  {/* LOGO SEKOLAH (KIRI - TRANSPARAN) */}
                  <div className="w-12 sm:w-14 flex items-center justify-center flex-shrink-0 bg-transparent">
                    {renderSchoolLogo("w-10 h-10 sm:w-12 sm:h-12")}
                  </div>

                  {/* KOP TRANSKRIP TENGAH */}
                  <div className="text-center flex-1 px-1 sm:px-3">
                    <p className="text-[9.5px] font-bold text-emerald-900 uppercase tracking-widest">
                      SMK MATHLA'UL ANWAR BUARANJATI
                    </p>
                    <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-tight text-slate-950">
                      DAFTAR NILAI DAN CAPAIAN KOMPETENSI PRAKTIK KERJA LAPANGAN
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                      Lampiran Transkrip Capaian Kompetensi Praktik Kerja Lapangan
                    </p>
                  </div>

                  {/* LOGO JURUSAN (KANAN - TRANSPARAN) */}
                  <div className="w-12 sm:w-14 flex items-center justify-center flex-shrink-0 bg-transparent">
                    {modeLogoJurusan === 'both' ? (
                      <div className="flex items-center gap-1.5">
                        {renderJurusan1Logo("w-8 h-8 sm:w-9 sm:h-9")}
                        {renderJurusan2Logo("w-8 h-8 sm:w-9 sm:h-9")}
                      </div>
                    ) : (
                      showJurusan1 ? renderJurusan1Logo("w-10 h-10 sm:w-12 sm:h-12") : renderJurusan2Logo("w-10 h-10 sm:w-12 sm:h-12")
                    )}
                  </div>

                </div>
              </div>

              {/* Student Identification Info Card (Compact 3-Column Layout) */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-[10px] sm:text-[11px] py-1 px-3 bg-gradient-to-r from-emerald-50/70 via-slate-50/80 to-blue-50/70 rounded-lg border border-teal-200/80 mt-1 backdrop-blur-xs">
                <div>
                  <span className="text-slate-500">Nama: </span>
                  <span className="font-bold text-slate-950">{mahasiswa.nama}</span>
                </div>
                <div>
                  <span className="text-slate-500">NISN: </span>
                  <span className="font-mono font-bold text-slate-950">{studentNISN}</span>
                </div>
                <div>
                  <span className="text-slate-500">Kompetensi: </span>
                  <span className="font-bold text-emerald-900">{mahasiswa.prodi}</span>
                </div>
                <div>
                  <span className="text-slate-500">Tempat DUDI: </span>
                  <span className="font-bold text-slate-950 truncate">{mahasiswa.perusahaan}</span>
                </div>
                <div>
                  <span className="text-slate-500">Pembimbing: </span>
                  <span className="font-bold text-slate-950">{mahasiswa.pembimbingDudi || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Tahun Pelajaran: </span>
                  <span className="font-bold text-slate-950">2026 / 2027</span>
                </div>
              </div>

              {/* Official Score Breakdown Table (Streamlined Row Heights) */}
              <div className="relative z-10 my-auto py-0.5">
                <table className="w-full text-left border-collapse text-[10px] sm:text-[11px] border border-slate-300 bg-white/95">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-800 via-teal-800 to-blue-900 text-white font-extrabold uppercase border-b border-slate-400 text-center">
                      <th className="py-1 px-1.5 border-r border-teal-700/60 w-8">No</th>
                      <th className="py-1 px-2.5 border-r border-teal-700/60 text-left">Komponen / Aspek Penilaian Kompetensi</th>
                      <th className="py-1 px-1.5 border-r border-teal-700/60 w-16">Bobot</th>
                      <th className="py-1 px-1.5 border-r border-teal-700/60 w-20">Nilai (0–100)</th>
                      <th className="py-1 px-1.5 border-r border-teal-700/60 w-20">Poin Bobot</th>
                      <th className="py-1 px-2.5">Kualifikasi Capaian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* BAGIAN I: ASPEK BUKU AGENDA (50%) - EMERALD GREEN THEME */}
                    <tr className="bg-emerald-50/90 font-bold border-b border-slate-300 text-emerald-950">
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-300">I</td>
                      <td className="py-0.5 px-2.5 border-r border-slate-300" colSpan={5}>
                        ASPEK BUKU AGENDA &amp; JURNAL KEGIATAN PKL DI INDUSTRI (BOBOT 50%)
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">1</td>
                      <td className="py-0.5 px-2.5 border-r border-slate-200">Disiplin dan Kehadiran di Lingkungan Kerja PKL</td>
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getCriteriaScore('k1_agenda_disiplin')}</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getCriteriaScore('k1_agenda_disiplin') * 0.1)).toFixed(1)}</td>
                      <td className="py-0.5 px-2.5 text-slate-600">Sangat Disiplin &amp; Tepat Waktu</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">2</td>
                      <td className="py-0.5 px-2.5 border-r border-slate-200">Kerjasama dan Komunikasi Interpersonal dengan Tim</td>
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getCriteriaScore('k2_agenda_kerjasama')}</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getCriteriaScore('k2_agenda_kerjasama') * 0.1)).toFixed(1)}</td>
                      <td className="py-0.5 px-2.5 text-slate-600">Komunikatif &amp; Adaptif</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">3</td>
                      <td className="py-0.5 px-2.5 border-r border-slate-200">Inisiatif dan Kreativitas Penyelesaian Tugas</td>
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getCriteriaScore('k3_agenda_inisiatif')}</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getCriteriaScore('k3_agenda_inisiatif') * 0.1)).toFixed(1)}</td>
                      <td className="py-0.5 px-2.5 text-slate-600">Responsif &amp; Inisiatif Tinggi</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">4</td>
                      <td className="py-0.5 px-2.5 border-r border-slate-200">Tanggung Jawab dan Ketepatan Pengisian Agenda</td>
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getCriteriaScore('k4_agenda_tanggungjawab')}</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getCriteriaScore('k4_agenda_tanggungjawab') * 0.1)).toFixed(1)}</td>
                      <td className="py-0.5 px-2.5 text-slate-600">Bertanggung Jawab Penuh</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">5</td>
                      <td className="py-0.5 px-2.5 border-r border-slate-200">Kebersihan, K3, dan Kerapian Hasil Pekerjaan</td>
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getCriteriaScore('k5_agenda_kebersihan')}</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getCriteriaScore('k5_agenda_kebersihan') * 0.1)).toFixed(1)}</td>
                      <td className="py-0.5 px-2.5 text-slate-600">Menjaga Standar K3 Industri</td>
                    </tr>
                    <tr className="bg-emerald-100/80 font-bold border-b-2 border-slate-300 text-slate-900">
                      <td className="py-1 px-2.5 text-right border-r border-slate-300" colSpan={2}>
                        SUBTOTAL NILAI ASPEK BUKU AGENDA PKL (A)
                      </td>
                      <td className="py-1 px-1.5 text-center border-r border-slate-300">50%</td>
                      <td className="py-1 px-1.5 text-center font-mono border-r border-slate-300">{aggregate.nilaiJurnalPkl.toFixed(1)}</td>
                      <td className="py-1 px-1.5 text-center font-mono border-r border-slate-300 text-emerald-950 font-black">{aggregate.poinJurnalPkl50.toFixed(2)}</td>
                      <td className="py-1 px-2.5 font-semibold text-emerald-900">Kontribusi: 50%</td>
                    </tr>

                    {/* BAGIAN II: ASPEK SIDANG DEWAN PENGUJI (50%) - SAPPHIRE BLUE THEME */}
                    <tr className="bg-blue-50/90 font-bold border-b border-slate-300 text-blue-950">
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-300">II</td>
                      <td className="py-0.5 px-2.5 border-r border-slate-300" colSpan={5}>
                        ASPEK UJIAN SIDANG LISAN DEWAN PENGUJI (BOBOT 50%)
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">1</td>
                      <td className="py-0.5 px-2.5 border-r border-slate-200">Presentasi, Artikulasi &amp; Sistematika Penyampaian Laporan</td>
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">25%</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getCriteriaScore('k6_sidang_presentasi')}</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getCriteriaScore('k6_sidang_presentasi') * 0.25)).toFixed(1)}</td>
                      <td className="py-0.5 px-2.5 text-slate-600">Penyajian Runtut &amp; Jelas</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">2</td>
                      <td className="py-0.5 px-2.5 border-r border-slate-200">Penguasaan Materi Teknis Kejuruan &amp; Tanya Jawab</td>
                      <td className="py-0.5 px-1.5 text-center border-r border-slate-200">25%</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getCriteriaScore('k7_sidang_tanyajawab')}</td>
                      <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getCriteriaScore('k7_sidang_tanyajawab') * 0.25)).toFixed(1)}</td>
                      <td className="py-0.5 px-2.5 text-slate-600">Menguasai Praktik &amp; Teori Kejuruan</td>
                    </tr>
                    <tr className="bg-blue-100/80 font-bold border-b-2 border-slate-400 text-slate-900">
                      <td className="py-1 px-2.5 text-right border-r border-slate-300" colSpan={2}>
                        SUBTOTAL NILAI UJIAN SIDANG GABUNGAN DEWAN PENGUJI (B)
                      </td>
                      <td className="py-1 px-1.5 text-center border-r border-slate-300">50%</td>
                      <td className="py-1 px-1.5 text-center font-mono border-r border-slate-300">{aggregate.nilaiSidangGabungan.toFixed(1)}</td>
                      <td className="py-1 px-1.5 text-center font-mono border-r border-slate-300 text-blue-950 font-black">{aggregate.poinSidang50.toFixed(2)}</td>
                      <td className="py-1 px-2.5 font-semibold text-blue-900">Kontribusi: 50%</td>
                    </tr>

                    {/* REKAPITULASI NILAI AKHIR (100%) - DUAL GRADIENT FINALE */}
                    <tr className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white font-black text-xs sm:text-sm border-b-2 border-slate-900">
                      <td className="py-1.5 px-2.5 text-right border-r border-teal-500" colSpan={2}>
                        NILAI AKHIR KUMULATIF SIDANG PKL (A + B)
                      </td>
                      <td className="py-1.5 px-1.5 text-center border-r border-teal-500">100%</td>
                      <td className="py-1.5 px-1.5 text-center font-mono border-r border-teal-500 text-sm sm:text-base">{aggregate.nilaiAkhirAngka.toFixed(2)}</td>
                      <td className="py-1.5 px-1.5 text-center font-mono border-r border-teal-500 text-sm sm:text-base text-yellow-300">[{aggregate.nilaiAkhirHuruf}]</td>
                      <td className="py-1.5 px-2.5 text-white uppercase font-black tracking-wide">
                        {aggregate.predikat}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Compact Conversion Legend & Final Status Row */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-3 py-1 bg-slate-50/90 rounded-lg border border-slate-200 text-[9.5px] sm:text-[10px] my-1 backdrop-blur-xs">
                <div className="flex items-center gap-2 sm:gap-3 text-slate-600 font-mono">
                  <span className="font-bold text-slate-800 font-sans">Standar KKM:</span>
                  <span>A (85–100)</span>
                  <span>•</span>
                  <span>B (70–84)</span>
                  <span>•</span>
                  <span>C (60–69)</span>
                  <span>•</span>
                  <span>D (&lt;60)</span>
                </div>
                {showBarcodeOnBack && (
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-700 bg-white/90 px-2 py-0.5 rounded border border-slate-300 shadow-2xs">
                    <span className="font-sans font-bold text-slate-800">No. Seri:</span>
                    <span className="font-bold text-teal-900">
                      {barcodeFormat === 'prefix' ? `SMKMA-${studentNISN}-${effectiveUrutan}` : barcodeFormat === 'full' ? `PKL-2026-${studentNISN}-${effectiveUrutan}` : `${studentNISN}-${effectiveUrutan}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-emerald-800 font-bold">Hasil Sidang:</span>
                  <span className="font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    LULUS (TERVERIFIKASI)
                  </span>
                </div>
              </div>

              {/* Footer Signatures: Ketua Panitia Sidang PKL (Kiri) & Kaprodi Jurusan (Kanan) with Generous Signing Room */}
              <div className="relative z-10 pt-2 border-t-2 border-slate-900 mt-1">
                <div className="grid grid-cols-2 text-center text-xs">
                  {/* Left: Committee Chair */}
                  <div className="flex flex-col items-center">
                    <p className="text-[11px] text-slate-600">Mengetahui,</p>
                    <p className="font-extrabold text-slate-900 text-xs sm:text-sm">Ketua Panitia Sidang PKL</p>
                    
                    {/* Clear space for physical stamp and signature */}
                    <div className="h-16 sm:h-20"></div>

                    <p className="font-black text-slate-950 underline decoration-teal-600 underline-offset-4 text-xs sm:text-sm">
                      {namaKetuaPanitia || 'Dr. Ir. Hendra Kurniawan, M.T.'}
                    </p>
                  </div>

                  {/* Right: Head of Department / Kaprodi */}
                  <div className="flex flex-col items-center">
                    <p className="text-[11px] text-slate-600">{tempatTerbit}, {tanggalTerbit}</p>
                    <p className="font-extrabold text-slate-900 text-xs sm:text-sm">Ketua Program Keahlian (Kaprodi)</p>
                    <p className="text-[10px] text-emerald-800 font-bold">{mahasiswa.prodi}</p>
                    
                    {/* Clear space for physical signature */}
                    <div className="h-16 sm:h-20"></div>

                    <p className="font-black text-slate-950 underline decoration-blue-600 underline-offset-4 text-xs sm:text-sm">
                      {namaKaprodi || 'Ahmad Zulfikar, S.T., M.Kom.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 z-10"></div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* 3. CETAK SEMUA HALAMAN PERTAMA (ALL-FRONTS)                              */}
          {/* ======================================================================= */}
          {viewMode === 'all-fronts' && pesertaList.map((p, idx) => {
            const pMasterSiswa = masterSiswaList.find(
              (m) => m.id === p.id || m.nisn === p.nim || m.namaLengkap.toLowerCase() === p.nama.toLowerCase()
            );
            const pNisn = pMasterSiswa?.nisn || p.nim || '0071234567';
            const pUrutan = String(idx + 1).padStart(3, '0');
            const pAggregate = calculateFinalAggregate(p.id, penilaianList);
            const pShowJurusan1 = modeLogoJurusan === 'both' || modeLogoJurusan === 'jurusan1' || 
              (modeLogoJurusan === 'auto' && (p.prodi.toLowerCase().includes('jaringan') || p.prodi.toLowerCase().includes('tkj') || p.prodi.toLowerCase().includes('rpl') || p.prodi.toLowerCase().includes('sija') || !p.prodi.toLowerCase().includes('motor')));

            return (
              <div key={`all-front-${p.id}`} className="certificate-sheet bg-[#fcfeff] text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 relative overflow-hidden mx-auto max-w-[1050px] aspect-[297/210] flex flex-col justify-between select-text border-[6px] border-emerald-900/15 mb-8">
                {showBackground && bgSertifikatUrl && (
                  <img 
                    src={bgSertifikatUrl} 
                    alt="Background Sertifikat" 
                    className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 ${getBgOrientationClass()}`}
                    style={{ opacity: bgOpacity / 100 }}
                  />
                )}
                <div className="absolute inset-1.5 rounded-xl border-2 border-emerald-700/60 pointer-events-none z-10"></div>
                <div className="absolute inset-3 rounded-lg border border-teal-500/40 pointer-events-none z-10"></div>
                <div className="absolute inset-4 rounded-md border-2 border-blue-800/40 pointer-events-none z-10"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 z-10"></div>

                <div className="relative z-10 pt-2 pb-2.5 border-b-2 border-emerald-800/20">
                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="w-16 sm:w-20 flex items-center justify-center flex-shrink-0 bg-transparent">
                      {renderSchoolLogo("w-14 h-14 sm:w-16 sm:h-16")}
                    </div>
                    <div className="text-center flex-1 px-1 sm:px-2">
                      <h1 className="text-xl sm:text-2xl md:text-[27px] font-black uppercase tracking-tight leading-tight bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-900 bg-clip-text text-transparent">
                        SMK MATHLA'UL ANWAR BUARANJATI
                      </h1>
                      <div className="inline-flex items-center gap-2 my-0.5">
                        <span className="h-px w-6 sm:w-10 bg-emerald-600"></span>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-800">
                          TERAKREDITASI • KABUPATEN TANGERANG - BANTEN
                        </p>
                        <span className="h-px w-6 sm:w-10 bg-blue-600"></span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-600 font-medium">
                        Jl. Raya Mauk KM. 16, Buaran Jati, Kec. Sukadiri, Kab. Tangerang, Banten 15530
                      </p>
                    </div>
                    <div className="flex items-center justify-center flex-shrink-0 bg-transparent">
                      {modeLogoJurusan === 'both' ? (
                        <div className="flex items-center gap-2 bg-transparent p-1">
                          {renderJurusan1Logo("w-11 h-11 sm:w-13 sm:h-13")}
                          {renderJurusan2Logo("w-11 h-11 sm:w-13 sm:h-13")}
                        </div>
                      ) : (
                        <div className="w-16 sm:w-20 flex items-center justify-center bg-transparent">
                          {pShowJurusan1 ? renderJurusan1Logo("w-14 h-14 sm:w-16 sm:h-16") : renderJurusan2Logo("w-14 h-14 sm:w-16 sm:h-16")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-center my-auto py-1 sm:py-2">
                  <div className="inline-block relative">
                    <h2 className="text-5xl sm:text-6xl md:text-[68px] lg:text-[76px] font-certificate-script text-slate-950 leading-[0.95] py-1 select-none">
                      Sertifikat
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base font-extrabold tracking-[0.32em] uppercase text-teal-950 font-serif mt-1">
                      Praktik Kerja Lapangan
                    </p>
                  </div>
                </div>

                <div className="relative z-10 text-center space-y-2 my-auto px-2 sm:px-10">
                  <p className="text-xs sm:text-sm font-bold text-slate-700 tracking-wider">Diberikan Kepada :</p>
                  <div className="py-0.5">
                    <h3 className="text-2xl sm:text-3xl md:text-[33px] font-black text-slate-950 uppercase tracking-tight font-serif">
                      {p.nama}
                    </h3>
                    <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-teal-600 to-transparent mx-auto mt-1 mb-1.5"></div>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50/90 border border-emerald-200 text-emerald-950 font-bold font-mono">
                        NISN: {pNisn}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50/90 border border-blue-200 text-blue-950 font-bold">
                        Kelas: {p.kelas || 'XII'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-teal-950 uppercase tracking-wide mt-1.5">
                      Program Keahlian: <span className="text-emerald-800">{p.prodi}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-3xl mx-auto">
                    Telah melaksanakan dan menyelesaikan Program <strong>Praktik Kerja Lapangan (PKL)</strong> serta Ujian Sidang PKL Tahun Pelajaran 2026/2027 pada:
                  </p>

                  <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-blue-50/90 border-2 border-emerald-300/80 rounded-2xl py-2 px-4 max-w-2xl mx-auto shadow-xs">
                    <p className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight">{p.perusahaan}</p>
                    {p.judulLaporan && (
                      <p className="text-[11px] text-teal-900 italic mt-0.5 truncate max-w-xl mx-auto font-medium">"{p.judulLaporan}"</p>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-center gap-2">
                    <span className="text-xs text-slate-800">Dinyatakan telah memenuhi seluruh aspek kompetensi dan berhak atas predikat:</span>
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white font-black text-xs uppercase tracking-wider">
                      LULUS ({pAggregate.predikat})
                    </span>
                  </div>
                </div>

                <div className="relative z-10 pt-2 border-t-2 border-emerald-800/20 mt-auto">
                  <div className="flex items-end justify-between text-xs px-4 sm:px-8">
                    <div className="flex items-center">
                      <CertificateBarcode
                        nisn={pNisn}
                        urutan={pUrutan}
                        type={barcodeType}
                        format={barcodeFormat}
                        showDetails={false}
                      />
                    </div>
                    <div className="space-y-1 text-center min-w-[260px]">
                      <p className="text-[11px] text-slate-600 font-medium">{tempatTerbit}, {tanggalTerbit}</p>
                      <p className="font-extrabold text-slate-900 text-xs sm:text-[13px]">Kepala SMK Mathla'ul Anwar Buaranjati</p>
                      <div className="h-16 sm:h-20"></div>
                      <p className="font-black text-slate-950 underline decoration-blue-600 underline-offset-4 text-xs sm:text-[13px]">{namaKepsek}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 z-10"></div>
              </div>
            );
          })}

          {/* ======================================================================= */}
          {/* 4. CETAK SEMUA HALAMAN KEDUA (ALL-BACKS)                                 */}
          {/* ======================================================================= */}
          {viewMode === 'all-backs' && pesertaList.map((p, idx) => {
            const pMasterSiswa = masterSiswaList.find(
              (m) => m.id === p.id || m.nisn === p.nim || m.namaLengkap.toLowerCase() === p.nama.toLowerCase()
            );
            const pNisn = pMasterSiswa?.nisn || p.nim || '0071234567';
            const pUrutan = String(idx + 1).padStart(3, '0');
            const pAggregate = calculateFinalAggregate(p.id, penilaianList);
            const pEvaluations = penilaianList.filter((ev) => ev.mahasiswaId === p.id);
            const pShowJurusan1 = modeLogoJurusan === 'both' || modeLogoJurusan === 'jurusan1' || 
              (modeLogoJurusan === 'auto' && (p.prodi.toLowerCase().includes('jaringan') || p.prodi.toLowerCase().includes('tkj') || p.prodi.toLowerCase().includes('rpl') || p.prodi.toLowerCase().includes('sija') || !p.prodi.toLowerCase().includes('motor')));

            const getPCriteriaScore = (kriteriaId: string): number => {
              if (pEvaluations.length === 0) return 85;
              const scores: number[] = [];
              pEvaluations.forEach((e) => {
                const item = e.nilaiItems?.find((ni) => ni.kriteriaId === kriteriaId);
                if (item && typeof item.skor === 'number' && !isNaN(item.skor)) {
                  scores.push(item.skor);
                }
              });
              if (scores.length === 0) return 85;
              const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
              return Math.round(avg);
            };

            const pKaprodi = resolveKaprodiFromDatabase(p.prodi, internalJurusanList);

            return (
              <div key={`all-back-${p.id}`} className="certificate-sheet bg-white text-slate-900 rounded-2xl shadow-2xl p-3 sm:p-4 lg:p-5 relative overflow-hidden mx-auto max-w-[1050px] aspect-[297/210] flex flex-col justify-between select-text border-[6px] border-slate-300 mb-8">
                {showBackground && showBgOnBack && bgSertifikatUrl && (
                  <img 
                    src={bgSertifikatUrl} 
                    alt="Background Transkrip" 
                    className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 ${getBgOrientationClass()}`}
                    style={{ opacity: (bgOpacity * 0.8) / 100 }}
                  />
                )}
                <div className="absolute inset-1.5 rounded-xl border-2 border-slate-300 pointer-events-none z-10"></div>
                <div className="absolute inset-3 rounded-lg border border-teal-500/30 pointer-events-none z-10"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 z-10"></div>

                <div className="relative z-10 pt-0.5 pb-1.5 border-b-2 border-slate-900 px-2 sm:px-4 md:px-6">
                  <div className="flex items-center justify-between gap-3 sm:gap-6">
                    <div className="w-12 sm:w-14 flex items-center justify-center flex-shrink-0 bg-transparent">
                      {renderSchoolLogo("w-10 h-10 sm:w-12 sm:h-12")}
                    </div>
                    <div className="text-center flex-1 px-1 sm:px-3">
                      <p className="text-[9.5px] font-bold text-emerald-900 uppercase tracking-widest">
                        SMK MATHLA'UL ANWAR BUARANJATI
                      </p>
                      <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-tight text-slate-950">
                        DAFTAR NILAI DAN CAPAIAN KOMPETENSI PRAKTIK KERJA LAPANGAN
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                        Lampiran Transkrip Capaian Kompetensi Praktik Kerja Lapangan
                      </p>
                    </div>
                    <div className="w-12 sm:w-14 flex items-center justify-center flex-shrink-0 bg-transparent">
                      {modeLogoJurusan === 'both' ? (
                        <div className="flex items-center gap-1.5">
                          {renderJurusan1Logo("w-8 h-8 sm:w-9 sm:h-9")}
                          {renderJurusan2Logo("w-8 h-8 sm:w-9 sm:h-9")}
                        </div>
                      ) : (
                        pShowJurusan1 ? renderJurusan1Logo("w-10 h-10 sm:w-12 sm:h-12") : renderJurusan2Logo("w-10 h-10 sm:w-12 sm:h-12")
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-[10px] sm:text-[11px] py-1 px-3 bg-gradient-to-r from-emerald-50/70 via-slate-50/80 to-blue-50/70 rounded-lg border border-teal-200/80 mt-1">
                  <div>
                    <span className="text-slate-500">Nama: </span>
                    <span className="font-bold text-slate-950">{p.nama}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">NISN: </span>
                    <span className="font-mono font-bold text-slate-950">{pNisn}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Kompetensi: </span>
                    <span className="font-bold text-emerald-900">{p.prodi}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tempat DUDI: </span>
                    <span className="font-bold text-slate-950 truncate">{p.perusahaan}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Pembimbing: </span>
                    <span className="font-bold text-slate-950">{p.pembimbingDudi || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tahun Pelajaran: </span>
                    <span className="font-bold text-slate-950">2026 / 2027</span>
                  </div>
                </div>

                <div className="relative z-10 my-auto py-0.5">
                  <table className="w-full text-left border-collapse text-[10px] sm:text-[11px] border border-slate-300 bg-white/95">
                    <thead>
                      <tr className="bg-gradient-to-r from-emerald-800 via-teal-800 to-blue-900 text-white font-extrabold uppercase border-b border-slate-400 text-center">
                        <th className="py-1 px-1.5 border-r border-teal-700/60 w-8">No</th>
                        <th className="py-1 px-2.5 border-r border-teal-700/60 text-left">Komponen / Aspek Penilaian Kompetensi</th>
                        <th className="py-1 px-1.5 border-r border-teal-700/60 w-16">Bobot</th>
                        <th className="py-1 px-1.5 border-r border-teal-700/60 w-20">Nilai (0–100)</th>
                        <th className="py-1 px-1.5 border-r border-teal-700/60 w-20">Poin Bobot</th>
                        <th className="py-1 px-2.5">Kualifikasi Capaian</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-emerald-50/90 font-bold border-b border-slate-300 text-emerald-950">
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-300">I</td>
                        <td className="py-0.5 px-2.5 border-r border-slate-300" colSpan={5}>
                          ASPEK BUKU AGENDA &amp; JURNAL KEGIATAN PKL DI INDUSTRI (BOBOT 50%)
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">1</td>
                        <td className="py-0.5 px-2.5 border-r border-slate-200">Disiplin dan Kehadiran di Lingkungan Kerja PKL</td>
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getPCriteriaScore('k1_agenda_disiplin')}</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getPCriteriaScore('k1_agenda_disiplin') * 0.1)).toFixed(1)}</td>
                        <td className="py-0.5 px-2.5 text-slate-600">Sangat Disiplin &amp; Tepat Waktu</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">2</td>
                        <td className="py-0.5 px-2.5 border-r border-slate-200">Kerjasama dan Komunikasi Interpersonal dengan Tim</td>
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getPCriteriaScore('k2_agenda_kerjasama')}</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getPCriteriaScore('k2_agenda_kerjasama') * 0.1)).toFixed(1)}</td>
                        <td className="py-0.5 px-2.5 text-slate-600">Komunikatif &amp; Adaptif</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">3</td>
                        <td className="py-0.5 px-2.5 border-r border-slate-200">Inisiatif dan Kreativitas Penyelesaian Tugas</td>
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getPCriteriaScore('k3_agenda_inisiatif')}</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getPCriteriaScore('k3_agenda_inisiatif') * 0.1)).toFixed(1)}</td>
                        <td className="py-0.5 px-2.5 text-slate-600">Responsif &amp; Inisiatif Tinggi</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">4</td>
                        <td className="py-0.5 px-2.5 border-r border-slate-200">Tanggung Jawab dan Ketepatan Pengisian Agenda</td>
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getPCriteriaScore('k4_agenda_tanggungjawab')}</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getPCriteriaScore('k4_agenda_tanggungjawab') * 0.1)).toFixed(1)}</td>
                        <td className="py-0.5 px-2.5 text-slate-600">Bertanggung Jawab Penuh</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">5</td>
                        <td className="py-0.5 px-2.5 border-r border-slate-200">Kebersihan, K3, dan Kerapian Hasil Pekerjaan</td>
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">10%</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getPCriteriaScore('k5_agenda_kebersihan')}</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getPCriteriaScore('k5_agenda_kebersihan') * 0.1)).toFixed(1)}</td>
                        <td className="py-0.5 px-2.5 text-slate-600">Menjaga Standar K3 Industri</td>
                      </tr>
                      <tr className="bg-emerald-100/80 font-bold border-b-2 border-slate-300 text-slate-900">
                        <td className="py-1 px-2.5 text-right border-r border-slate-300" colSpan={2}>
                          SUBTOTAL NILAI ASPEK BUKU AGENDA PKL (A)
                        </td>
                        <td className="py-1 px-1.5 text-center border-r border-slate-300">50%</td>
                        <td className="py-1 px-1.5 text-center font-mono border-r border-slate-300">{pAggregate.nilaiJurnalPkl.toFixed(1)}</td>
                        <td className="py-1 px-1.5 text-center font-mono border-r border-slate-300 text-emerald-950 font-black">{pAggregate.poinJurnalPkl50.toFixed(2)}</td>
                        <td className="py-1 px-2.5 font-semibold text-emerald-900">Kontribusi: 50%</td>
                      </tr>

                      <tr className="bg-blue-50/90 font-bold border-b border-slate-300 text-blue-950">
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-300">II</td>
                        <td className="py-0.5 px-2.5 border-r border-slate-300" colSpan={5}>
                          ASPEK UJIAN SIDANG LISAN DEWAN PENGUJI (BOBOT 50%)
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">1</td>
                        <td className="py-0.5 px-2.5 border-r border-slate-200">Presentasi, Artikulasi &amp; Sistematika Penyampaian Laporan</td>
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">25%</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getPCriteriaScore('k6_sidang_presentasi')}</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getPCriteriaScore('k6_sidang_presentasi') * 0.25)).toFixed(1)}</td>
                        <td className="py-0.5 px-2.5 text-slate-600">Penyajian Runtut &amp; Jelas</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">2</td>
                        <td className="py-0.5 px-2.5 border-r border-slate-200">Penguasaan Materi Teknis Kejuruan &amp; Tanya Jawab</td>
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200">25%</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{getPCriteriaScore('k7_sidang_tanyajawab')}</td>
                        <td className="py-0.5 px-1.5 text-center font-mono border-r border-slate-200">{((getPCriteriaScore('k7_sidang_tanyajawab') * 0.25)).toFixed(1)}</td>
                        <td className="py-0.5 px-2.5 text-slate-600">Menguasai Praktik &amp; Teori Kejuruan</td>
                      </tr>
                      <tr className="bg-blue-100/80 font-bold border-b-2 border-slate-400 text-slate-900">
                        <td className="py-1 px-2.5 text-right border-r border-slate-300" colSpan={2}>
                          SUBTOTAL NILAI UJIAN SIDANG GABUNGAN DEWAN PENGUJI (B)
                        </td>
                        <td className="py-1 px-1.5 text-center border-r border-slate-300">50%</td>
                        <td className="py-1 px-1.5 text-center font-mono border-r border-slate-300">{pAggregate.nilaiSidangGabungan.toFixed(1)}</td>
                        <td className="py-1 px-1.5 text-center font-mono border-r border-slate-300 text-blue-950 font-black">{pAggregate.poinSidang50.toFixed(2)}</td>
                        <td className="py-1 px-2.5 font-semibold text-blue-900">Kontribusi: 50%</td>
                      </tr>

                      <tr className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white font-black text-xs sm:text-sm border-b-2 border-slate-900">
                        <td className="py-1.5 px-2.5 text-right border-r border-teal-500" colSpan={2}>
                          NILAI AKHIR KUMULATIF SIDANG PKL (A + B)
                        </td>
                        <td className="py-1.5 px-1.5 text-center border-r border-teal-500">100%</td>
                        <td className="py-1.5 px-1.5 text-center font-mono border-r border-teal-500 text-sm sm:text-base">{pAggregate.nilaiAkhirAngka.toFixed(2)}</td>
                        <td className="py-1.5 px-1.5 text-center font-mono border-r border-teal-500 text-sm sm:text-base text-yellow-300">[{pAggregate.nilaiAkhirHuruf}]</td>
                        <td className="py-1.5 px-2.5 text-white uppercase font-black tracking-wide">
                          {pAggregate.predikat}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-3 py-1 bg-slate-50/90 rounded-lg border border-slate-200 text-[9.5px] sm:text-[10px] my-1">
                  <div className="flex items-center gap-2 sm:gap-3 text-slate-600 font-mono">
                    <span className="font-bold text-slate-800 font-sans">Standar KKM:</span>
                    <span>A (85–100)</span>
                    <span>•</span>
                    <span>B (70–84)</span>
                    <span>•</span>
                    <span>C (60–69)</span>
                  </div>
                  {showBarcodeOnBack && (
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-700 bg-white/90 px-2 py-0.5 rounded border border-slate-300">
                      <span className="font-sans font-bold text-slate-800">No. Seri:</span>
                      <span className="font-bold text-teal-900">
                        {barcodeFormat === 'prefix' ? `SMKMA-${pNisn}-${pUrutan}` : barcodeFormat === 'full' ? `PKL-2026-${pNisn}-${pUrutan}` : `${pNisn}-${pUrutan}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-800 font-bold">Hasil Sidang:</span>
                    <span className="font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      LULUS
                    </span>
                  </div>
                </div>

                <div className="relative z-10 pt-2 border-t-2 border-slate-900 mt-1">
                  <div className="grid grid-cols-2 text-center text-xs">
                    <div className="flex flex-col items-center">
                      <p className="text-[11px] text-slate-600">Mengetahui,</p>
                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm">Ketua Panitia Sidang PKL</p>
                      <div className="h-16 sm:h-20"></div>
                      <p className="font-black text-slate-950 underline decoration-teal-600 underline-offset-4 text-xs sm:text-sm">
                        {namaKetuaPanitia || 'Dr. Ir. Hendra Kurniawan, M.T.'}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[11px] text-slate-600">{tempatTerbit}, {tanggalTerbit}</p>
                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm">Ketua Program Keahlian (Kaprodi)</p>
                      <p className="text-[10px] text-emerald-800 font-bold">{p.prodi}</p>
                      <div className="h-16 sm:h-20"></div>
                      <p className="font-black text-slate-950 underline decoration-blue-600 underline-offset-4 text-xs sm:text-sm">
                        {pKaprodi}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 z-10"></div>
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};
