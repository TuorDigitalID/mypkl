import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { LiveEvaluationRoom } from './components/LiveEvaluationRoom.tsx';
import { MasterSiswaTable } from './components/MasterSiswaTable.tsx';
import { MasterJurusanTable } from './components/MasterJurusanTable.tsx';
import { MasterInstansiTable } from './components/MasterInstansiTable.tsx';
import { MasterGuruTable } from './components/MasterGuruTable.tsx';
import { PlottingSiswaTable } from './components/PlottingSiswaTable.tsx';
import { MasterPengujiTable } from './components/MasterPengujiTable.tsx';
import { PesertaList } from './components/PesertaList.tsx';
import { RekapitulasiView } from './components/RekapitulasiView.tsx';
import { RubrikGuide } from './components/RubrikGuide.tsx';
import { SupabaseModal } from './components/SupabaseModal.tsx';
import { BeritaAcaraModal } from './components/BeritaAcaraModal.tsx';
import { PusatUploadModal } from './components/PusatUploadModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { 
  MahasiswaSidang, 
  Penguji, 
  PenilaianPenguji, 
  SupabaseConfig, 
  MasterSiswaPKL, 
  MasterJurusan, 
  MasterInstansi, 
  MasterGuruPembimbing, 
  PlottingSiswaPKL,
  AuthUser,
  PasanganPengujiRuangan
} from './types/index.ts';
import { 
  getPesertaSidangList, 
  getPenilaianList, 
  getMasterSiswaList, 
  getMasterJurusanList, 
  getMasterInstansiList, 
  getMasterGuruList, 
  getPlottingList, 
  getPengujiList,
  savePenguji,
  deletePenguji,
  resetPengujiToDefault,
  getCurrentAuthUser,
  setCurrentAuthUser,
  logoutUser,
  getSupabaseConfig, 
  subscribeToRealtimeUpdates,
  syncPesertaFromPlotting,
  getRoomPairingsList,
  saveRoomPairings,
  getDefaultRoomPairings,
  syncSupabaseConfigFromServer,
  resetPenilaianByMahasiswa,
  resetAllPenilaian
} from './lib/supabase.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik' | 'penguji'>('plotting');
  const [pengujiList, setPengujiList] = useState<Penguji[]>([]);
  const [roomPairings, setRoomPairings] = useState<PasanganPengujiRuangan[]>([]);
  const [activePenguji, setActivePenguji] = useState<Penguji>({
    id: 'p1',
    nama: 'Penguji Sidang',
    nip: '-',
    peran: 'Penguji 1 (Ketua)',
    avatar: '',
    email: '',
    password: '',
    telepon: '',
    instansiAsal: 'SMK MA Buaranjati',
    bidangKeahlian: '',
    isActive: true,
  });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentAuthUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [pesertaList, setPesertaList] = useState<MahasiswaSidang[]>([]);
  const [penilaianList, setPenilaianList] = useState<PenilaianPenguji[]>([]);
  const [masterSiswaList, setMasterSiswaList] = useState<MasterSiswaPKL[]>([]);
  const [masterJurusanList, setMasterJurusanList] = useState<MasterJurusan[]>([]);
  const [masterInstansiList, setMasterInstansiList] = useState<MasterInstansi[]>([]);
  const [masterGuruList, setMasterGuruList] = useState<MasterGuruPembimbing[]>([]);
  const [plottingList, setPlottingList] = useState<PlottingSiswaPKL[]>([]);
  const [filterJurusanForSiswa, setFilterJurusanForSiswa] = useState<string>('semua');
  const [filterInstansiForSiswa, setFilterInstansiForSiswa] = useState<string>('semua');
  const [filterGuruForSiswa, setFilterGuruForSiswa] = useState<string>('semua');
  const [filterPlottingInstansi, setFilterPlottingInstansi] = useState<string>('semua');
  const [filterInstansiSearch, setFilterInstansiSearch] = useState<string>('');
  
  // Direct upload triggers
  const [autoOpenUploadSiswa, setAutoOpenUploadSiswa] = useState(false);
  const [autoOpenUploadInstansi, setAutoOpenUploadInstansi] = useState(false);
  const [autoOpenUploadGuru, setAutoOpenUploadGuru] = useState(false);
  const [autoOpenUploadPlotting, setAutoOpenUploadPlotting] = useState(false);
  const [isPusatUploadOpen, setIsPusatUploadOpen] = useState(false);

  const [activePesertaId, setActivePesertaId] = useState<string>('m1');
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [beritaAcaraMahasiswaId, setBeritaAcaraMahasiswaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      if (!getSupabaseConfig().isConnected) {
        await syncSupabaseConfigFromServer();
        setSupabaseConfig(getSupabaseConfig());
      }

      const [peserta, nilai, master, jurusan, instansi, guru, plotting, pengujiData, pairingsData] = await Promise.all([
        getPesertaSidangList(),
        getPenilaianList(),
        getMasterSiswaList(),
        getMasterJurusanList(),
        getMasterInstansiList(),
        getMasterGuruList(),
        getPlottingList(),
        getPengujiList(),
        getRoomPairingsList(),
      ]);

      // SINKRONISASI OTOMATIS:
      // Memastikan data jadwal antrean dan data sidang ruang live 100% sama dan selalu update dari database plotting & peserta
      let activePeserta = peserta;
      if (plotting && plotting.length > 0) {
        activePeserta = await syncPesertaFromPlotting(plotting, peserta);
      }
      setPesertaList(activePeserta);
      setPenilaianList(nilai);
      setMasterSiswaList(master);
      setMasterJurusanList(jurusan);
      setMasterInstansiList(instansi);
      setMasterGuruList(guru);
      setPlottingList(plotting);
      if (pengujiData) {
        setPengujiList(pengujiData);
        if (pengujiData.length > 0) {
          setActivePenguji((prev) => {
            const match = pengujiData.find((p) => p.id === prev.id || p.nip === prev.nip);
            return match || pengujiData[0];
          });
        }
      }
      if (pairingsData && pairingsData.length > 0) {
        setRoomPairings(pairingsData);
      } else if (pengujiData && pengujiData.length > 0) {
        setRoomPairings(getDefaultRoomPairings(pengujiData));
      }
      if (activePeserta.length > 0 && !activePeserta.some((p) => p.id === activePesertaId)) {
        setActivePesertaId(activePeserta[0].id);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activePesertaId, activePenguji.id]);

  useEffect(() => {
    loadData();

    // Subscribe to realtime updates across browser tabs & Supabase
    const unsubscribe = subscribeToRealtimeUpdates((event) => {
      if (event.type === 'PENILAIAN_UPDATED' && event.payload) {
        setPenilaianList((prev) => {
          const index = prev.findIndex(
            (p) =>
              p.mahasiswaId === event.payload.mahasiswaId &&
              p.pengujiId === event.payload.pengujiId
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload;
            return next;
          }
          return [...prev, event.payload];
        });
      } else if (event.type === 'PESERTA_UPDATED' && event.payload) {
        setPesertaList((prev) => {
          const index = prev.findIndex((p) => p.id === event.payload.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload;
            return next;
          }
          return [event.payload, ...prev];
        });
      } else if (event.type === 'PENGUJI_UPDATED' && event.payload) {
        setPengujiList((prev) => {
          const updated = Array.isArray(event.payload) ? event.payload : [event.payload];
          const next = [...prev];
          updated.forEach((item) => {
            const idx = next.findIndex((p) => p.id === item.id);
            if (idx >= 0) next[idx] = item;
            else next.push(item);
          });
          return next;
        });
      } else if (event.type === 'PENGUJI_DELETED' && event.payload) {
        setPengujiList((prev) => prev.filter((p) => p.id !== event.payload.id));
      } else if (event.type === 'AUTH_CHANGED') {
        setCurrentUser(event.payload);
      } else if (event.type === 'MASTER_SISWA_UPDATED' && event.payload) {
        setMasterSiswaList((prev) => {
          const index = prev.findIndex(
            (s) => s.id === event.payload.id || s.nisn === event.payload.nisn
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload;
            return next;
          }
          return [event.payload, ...prev];
        });
      } else if (event.type === 'MASTER_SISWA_DELETED' && event.payload) {
        setMasterSiswaList((prev) => prev.filter((s) => s.id !== event.payload.id));
      } else if (event.type === 'MASTER_JURUSAN_UPDATED' && event.payload) {
        setMasterJurusanList((prev) => {
          const index = prev.findIndex(
            (j) => j.id === event.payload.id || j.kode.toUpperCase() === event.payload.kode.toUpperCase()
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload;
            return next;
          }
          return [event.payload, ...prev];
        });
      } else if (event.type === 'MASTER_INSTANSI_UPDATED' && event.payload) {
        setMasterInstansiList((prev) => {
          const index = prev.findIndex((i) => i.id === event.payload.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload;
            return next;
          }
          return [event.payload, ...prev];
        });
      } else if (event.type === 'MASTER_GURU_UPDATED' && event.payload) {
        setMasterGuruList((prev) => {
          const index = prev.findIndex((g) => g.id === event.payload.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload;
            return next;
          }
          return [event.payload, ...prev];
        });
      } else if (event.type === 'PLOTTING_UPDATED' && event.payload) {
        setPlottingList((prev) => {
          const index = prev.findIndex((p) => p.id === event.payload.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload;
            return next;
          }
          return [event.payload, ...prev];
        });
        loadData();
      } else if ((event.type === 'ROOM_PAIRINGS_MUTATED' || event.type === 'ROOM_PAIRINGS_UPDATED') && event.payload) {
        setRoomPairings(event.payload);
      } else if (event.type === 'DATABASE_MUTATED') {
        loadData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  const handleSelectPesertaForSidang = (pesertaId: string) => {
    setActivePesertaId(pesertaId);
    setActiveTab('live');
  };

  const handleOpenBeritaAcara = (mahasiswaId: string) => {
    setBeritaAcaraMahasiswaId(mahasiswaId);
  };

  // Examiner CRUD Handlers
  const handleSavePenguji = async (p: Penguji) => {
    try {
      const updated = await savePenguji(p);
      setPengujiList(updated);
      if (activePenguji.id === p.id || activePenguji.nip === p.nip) {
        const found = updated.find((item) => item.id === p.id || item.nip === p.nip);
        if (found) setActivePenguji(found);
      }
    } catch (err) {
      console.error('Error saving examiner:', err);
      throw err;
    }
  };

  const handleDeletePenguji = async (id: string) => {
    const res = await deletePenguji(id);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setPengujiList(res.list);
    if (activePenguji.id === id && res.list.length > 0) {
      setActivePenguji(res.list[0]);
    }
  };

  const handleResetPenguji = async () => {
    if (confirm('Kembalikan susunan penguji sidang ke data bawaan?')) {
      const reset = await resetPengujiToDefault();
      setPengujiList(reset);
      setActivePenguji(reset[0]);
    }
  };

  const handleSaveRoomPairings = async (pairings: PasanganPengujiRuangan[]) => {
    try {
      setRoomPairings(pairings);
      await saveRoomPairings(pairings);
    } catch (err) {
      console.error('Error saving room pairings:', err);
      throw err;
    }
  };

  // Guard tab access for examiners: Examiners only have access to 'live', 'peserta', and 'rubrik'
  useEffect(() => {
    if (currentUser?.role === 'penguji') {
      const allowedTabs = ['live', 'peserta', 'rubrik'];
      if (!allowedTabs.includes(activeTab)) {
        setActiveTab('live');
      }
    }
  }, [currentUser, activeTab]);

  const handleLoginSuccess = (user: AuthUser, penguji?: Penguji) => {
    setCurrentUser(user);
    if (penguji) {
      setActivePenguji(penguji);
    } else if (user.role === 'penguji') {
      const matched = pengujiList.find((p) => p.id === user.pengujiId || p.nip === user.usernameOrNip);
      if (matched) setActivePenguji(matched);
    }
    if (user.role === 'penguji') {
      setActiveTab('live');
    } else {
      setActiveTab('plotting');
    }
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleResetNilaiMahasiswa = async (mahasiswaId: string, nama?: string) => {
    try {
      const res = await resetPenilaianByMahasiswa(mahasiswaId);
      if (res.success) {
        setPenilaianList(res.list);
        await loadData();
      }
    } catch (err: any) {
      alert(`Gagal mereset nilai: ${err?.message || err}`);
    }
  };

  const handleResetAllNilai = async () => {
    try {
      const res = await resetAllPenilaian();
      if (res.success) {
        setPenilaianList([]);
        await loadData();
      }
    } catch (err: any) {
      alert(`Gagal mereset semua nilai: ${err?.message || err}`);
    }
  };

  // Requirement 3: Before entering main dashboard, user must login first!
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          pengujiList={pengujiList}
          guruList={masterGuruList}
          onLoginSuccess={handleLoginSuccess}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
        <SupabaseModal
          config={supabaseConfig}
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onConfigUpdated={() => {
            setSupabaseConfig(getSupabaseConfig());
            loadData();
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased font-sans text-slate-800">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activePenguji={activePenguji}
        setActivePenguji={setActivePenguji}
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        siswaCount={masterSiswaList.length}
        jurusanCount={masterJurusanList.length}
        instansiCount={masterInstansiList.length}
        guruCount={masterGuruList.length}
        plottingCount={plottingList.length}
        pesertaCount={pesertaList.length}
        pengujiCount={pengujiList.length}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenUploadSiswa={() => {
          setActiveTab('master');
          setAutoOpenUploadSiswa(true);
        }}
        onOpenUploadInstansi={() => {
          setActiveTab('instansi');
          setAutoOpenUploadInstansi(true);
        }}
        onOpenUploadGuru={() => {
          setActiveTab('guru');
          setAutoOpenUploadGuru(true);
        }}
        onOpenUploadPlotting={() => {
          setActiveTab('plotting');
          setAutoOpenUploadPlotting(true);
        }}
        onOpenPusatUpload={() => setIsPusatUploadOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Sleek Topbar Header with Luxury Terracotta Gradient */}
        <Header
          activeTab={activeTab}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          activePenguji={activePenguji}
          setActivePenguji={setActivePenguji}
          pengujiList={pengujiList}
          currentUser={currentUser}
          supabaseConfig={supabaseConfig}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onOpenPusatUpload={() => setIsPusatUploadOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onNavigateToPenguji={() => setActiveTab('penguji')}
          onLogout={handleLogout}
        />

        {/* Viewport Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
              <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-semibold text-orange-950">Memuat Data Sidang PKL Real-Time...</p>
            </div>
          ) : (
            <>
              {activeTab === 'live' && (
                <LiveEvaluationRoom
                  pesertaList={pesertaList}
                  activePesertaId={activePesertaId}
                  setActivePesertaId={setActivePesertaId}
                  activePenguji={activePenguji}
                  penilaianList={penilaianList}
                  onOpenBeritaAcara={handleOpenBeritaAcara}
                  plottingList={plottingList}
                  onSelectPenguji={setActivePenguji}
                  onPenilaianSaved={loadData}
                  pengujiList={pengujiList}
                  roomPairings={roomPairings}
                  onSaveRoomPairings={handleSaveRoomPairings}
                  isAdmin={currentUser?.role === 'admin'}
                  onResetNilaiMahasiswa={handleResetNilaiMahasiswa}
                />
              )}

              {activeTab === 'penguji' && (
                <MasterPengujiTable
                  pengujiList={pengujiList}
                  penilaianList={penilaianList}
                  activePenguji={activePenguji}
                  currentUser={currentUser}
                  guruList={masterGuruList}
                  roomPairings={roomPairings}
                  onSetActivePenguji={setActivePenguji}
                  onSavePenguji={handleSavePenguji}
                  onDeletePenguji={handleDeletePenguji}
                  onResetDefault={handleResetPenguji}
                  onOpenLoginModal={() => setIsLoginModalOpen(true)}
                  onSaveRoomPairings={handleSaveRoomPairings}
                />
              )}

              {activeTab === 'plotting' && (
                <PlottingSiswaTable
                  plottingList={plottingList}
                  siswaList={masterSiswaList}
                  instansiList={masterInstansiList}
                  guruList={masterGuruList}
                  filterInstansiParam={filterPlottingInstansi}
                  onPlottingUpdated={loadData}
                  onNavigateToSiswa={() => setActiveTab('master')}
                  onNavigateToInstansi={(namaInstansi) => {
                    if (namaInstansi) {
                      setFilterInstansiSearch(namaInstansi);
                    }
                    setActiveTab('instansi');
                  }}
                  onNavigateToGuru={() => setActiveTab('guru')}
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                  initialOpenUpload={autoOpenUploadPlotting}
                  onCloseUpload={() => setAutoOpenUploadPlotting(false)}
                />
              )}

              {activeTab === 'master' && (
                <MasterSiswaTable
                  siswaList={masterSiswaList}
                  jurusanList={masterJurusanList}
                  instansiList={masterInstansiList}
                  guruList={masterGuruList}
                  filterJurusanParam={filterJurusanForSiswa}
                  filterInstansiParam={filterInstansiForSiswa}
                  filterGuruParam={filterGuruForSiswa}
                  onSiswaUpdated={loadData}
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                  onNavigateToJurusan={() => setActiveTab('jurusan')}
                  onNavigateToInstansi={() => setActiveTab('instansi')}
                  onNavigateToGuru={() => setActiveTab('guru')}
                  onNavigateToPlotting={() => setActiveTab('plotting')}
                  initialOpenUpload={autoOpenUploadSiswa}
                  onCloseUpload={() => setAutoOpenUploadSiswa(false)}
                />
              )}

              {activeTab === 'instansi' && (
                <MasterInstansiTable
                  instansiList={masterInstansiList}
                  siswaList={masterSiswaList}
                  plottingList={plottingList}
                  initialSearch={filterInstansiSearch}
                  onInstansiUpdated={loadData}
                  onFilterSiswaByInstansi={(namaInstansi) => {
                    setFilterInstansiForSiswa(namaInstansi);
                    setActiveTab('master');
                  }}
                  onNavigateToSiswa={() => setActiveTab('master')}
                  onNavigateToPlotting={(namaInstansi) => {
                    if (namaInstansi) {
                      setFilterPlottingInstansi(namaInstansi);
                    }
                    setActiveTab('plotting');
                  }}
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                  initialOpenUpload={autoOpenUploadInstansi}
                  onCloseUpload={() => setAutoOpenUploadInstansi(false)}
                />
              )}

              {activeTab === 'guru' && (
                <MasterGuruTable
                  guruList={masterGuruList}
                  siswaList={masterSiswaList}
                  plottingList={plottingList}
                  onGuruUpdated={loadData}
                  onFilterSiswaByGuru={(namaGuru) => {
                    setFilterGuruForSiswa(namaGuru);
                    setActiveTab('master');
                  }}
                  onNavigateToSiswa={() => setActiveTab('master')}
                  onNavigateToPlotting={() => {
                    setActiveTab('plotting');
                  }}
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                  initialOpenUpload={autoOpenUploadGuru}
                  onCloseUpload={() => setAutoOpenUploadGuru(false)}
                />
              )}

              {activeTab === 'jurusan' && (
                <MasterJurusanTable
                  jurusanList={masterJurusanList}
                  siswaList={masterSiswaList}
                  onJurusanUpdated={loadData}
                  onFilterSiswaByJurusan={(namaJurusan) => {
                    setFilterJurusanForSiswa(namaJurusan);
                    setActiveTab('master');
                  }}
                />
              )}

              {activeTab === 'peserta' && (
                <PesertaList
                  pesertaList={pesertaList}
                  penilaianList={penilaianList}
                  plottingList={plottingList}
                  onSelectPesertaForSidang={handleSelectPesertaForSidang}
                  onOpenBeritaAcara={handleOpenBeritaAcara}
                  onPesertaUpdated={loadData}
                />
              )}

              {activeTab === 'rekap' && (
                <RekapitulasiView
                  pesertaList={pesertaList}
                  penilaianList={penilaianList}
                  onOpenBeritaAcara={handleOpenBeritaAcara}
                  onSelectPesertaForSidang={handleSelectPesertaForSidang}
                  isAdmin={currentUser?.role === 'admin'}
                  onResetNilaiMahasiswa={handleResetNilaiMahasiswa}
                  onResetAllNilai={handleResetAllNilai}
                />
              )}

              {activeTab === 'rubrik' && <RubrikGuide />}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/90 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>Copyright © 2026 SMK MA Buaranjati. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('penguji')}
                className="hover:text-orange-600 font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Manajemen Penguji
              </button>
              <span>•</span>
              <button
                onClick={() => setIsPusatUploadOpen(true)}
                className="hover:text-orange-600 font-bold text-orange-950 transition-colors cursor-pointer"
              >
                Pusat Upload & Template
              </button>
              <span>•</span>
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="hover:text-orange-600 font-semibold transition-colors cursor-pointer"
              >
                Setup Supabase
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('rubrik')}
                className="hover:text-orange-600 font-semibold transition-colors cursor-pointer"
              >
                Pedoman Rubrik
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* Keren & Modern Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        pengujiList={pengujiList}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Pusat Upload & Impor Data Modal (Hub) */}
      <PusatUploadModal
        isOpen={isPusatUploadOpen}
        onClose={() => setIsPusatUploadOpen(false)}
        onOpenUploadSiswa={() => {
          setActiveTab('master');
          setAutoOpenUploadSiswa(true);
        }}
        onOpenUploadPlotting={() => {
          setActiveTab('plotting');
          setAutoOpenUploadPlotting(true);
        }}
        onOpenUploadGuru={() => {
          setActiveTab('guru');
          setAutoOpenUploadGuru(true);
        }}
        onOpenUploadInstansi={() => {
          setActiveTab('instansi');
          setAutoOpenUploadInstansi(true);
        }}
        siswaCount={masterSiswaList.length}
        plottingCount={plottingList.length}
        guruCount={masterGuruList.length}
        instansiCount={masterInstansiList.length}
      />

      {/* Supabase Config & SQL Schema Modal */}
      <SupabaseModal
        config={supabaseConfig}
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => setSupabaseConfig(getSupabaseConfig())}
      />

      {/* Official Berita Acara Modal */}
      {beritaAcaraMahasiswaId && (
        <BeritaAcaraModal
          mahasiswaId={beritaAcaraMahasiswaId}
          pesertaList={pesertaList}
          penilaianList={penilaianList}
          pengujiList={pengujiList}
          roomPairings={roomPairings}
          onClose={() => setBeritaAcaraMahasiswaId(null)}
        />
      )}

    </div>
  );
}
