import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { LiveEvaluationRoom } from './components/LiveEvaluationRoom.tsx';
import { MasterSiswaTable } from './components/MasterSiswaTable.tsx';
import { MasterJurusanTable } from './components/MasterJurusanTable.tsx';
import { MasterInstansiTable } from './components/MasterInstansiTable.tsx';
import { MasterGuruTable } from './components/MasterGuruTable.tsx';
import { PlottingSiswaTable } from './components/PlottingSiswaTable.tsx';
import { PesertaList } from './components/PesertaList.tsx';
import { RekapitulasiView } from './components/RekapitulasiView.tsx';
import { RubrikGuide } from './components/RubrikGuide.tsx';
import { SupabaseModal } from './components/SupabaseModal.tsx';
import { BeritaAcaraModal } from './components/BeritaAcaraModal.tsx';
import { 
  MahasiswaSidang, 
  Penguji, 
  PenilaianPenguji, 
  SupabaseConfig,
  MasterSiswaPKL,
  MasterJurusan,
  MasterInstansi,
  MasterGuruPembimbing,
  PlottingSiswaPKL
} from './types/index.ts';
import { DAFTAR_PENGUJI } from './data/penguji.ts';
import { 
  getPesertaSidangList, 
  getPenilaianList, 
  getMasterSiswaList,
  getMasterJurusanList,
  getMasterInstansiList,
  getMasterGuruList,
  getPlottingList,
  getSupabaseConfig, 
  subscribeToRealtimeUpdates 
} from './lib/supabase.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'master' | 'jurusan' | 'instansi' | 'guru' | 'plotting' | 'peserta' | 'rekap' | 'rubrik'>('plotting');
  const [activePenguji, setActivePenguji] = useState<Penguji>(DAFTAR_PENGUJI[0]);
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
  const [autoOpenUploadInstansi, setAutoOpenUploadInstansi] = useState(false);
  const [autoOpenUploadGuru, setAutoOpenUploadGuru] = useState(false);
  const [autoOpenUploadPlotting, setAutoOpenUploadPlotting] = useState(false);
  const [activePesertaId, setActivePesertaId] = useState<string>('m1');
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [beritaAcaraMahasiswaId, setBeritaAcaraMahasiswaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [peserta, nilai, master, jurusan, instansi, guru, plotting] = await Promise.all([
        getPesertaSidangList(),
        getPenilaianList(),
        getMasterSiswaList(),
        getMasterJurusanList(),
        getMasterInstansiList(),
        getMasterGuruList(),
        getPlottingList(),
      ]);
      setPesertaList(peserta);
      setPenilaianList(nilai);
      setMasterSiswaList(master);
      setMasterJurusanList(jurusan);
      setMasterInstansiList(instansi);
      setMasterGuruList(guru);
      setPlottingList(plotting);
      if (peserta.length > 0 && !peserta.some((p) => p.id === activePesertaId)) {
        setActivePesertaId(peserta[0].id);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activePesertaId]);

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
          return [...prev, event.payload];
        });
      } else if (event.type === 'MASTER_JURUSAN_DELETED' && event.payload) {
        setMasterJurusanList((prev) => prev.filter((j) => j.id !== event.payload.id));
      } else if (event.type === 'MASTER_INSTANSI_UPDATED' && event.payload) {
        setMasterInstansiList((prev) => {
          const index = prev.findIndex(
            (i) => i.id === event.payload.id || i.nama.toLowerCase().trim() === event.payload.nama.toLowerCase().trim()
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload;
            return next;
          }
          return [...prev, event.payload];
        });
      } else if (event.type === 'MASTER_INSTANSI_DELETED' && event.payload) {
        setMasterInstansiList((prev) => prev.filter((i) => i.id !== event.payload.id));
      } else if (event.type === 'MASTER_GURU_UPDATED' && event.payload) {
        setMasterGuruList((prev) => {
          const index = prev.findIndex(
            (g) => g.id === event.payload.id || g.nip.replace(/\s+/g, '') === event.payload.nip.replace(/\s+/g, '')
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = event.payload;
            return next;
          }
          return [...prev, event.payload];
        });
      } else if (event.type === 'MASTER_GURU_DELETED' && event.payload) {
        setMasterGuruList((prev) => prev.filter((g) => g.id !== event.payload.id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  const handleSelectPesertaForSidang = (id: string) => {
    setActivePesertaId(id);
    setActiveTab('live');
  };

  const handleOpenBeritaAcara = (id: string) => {
    setBeritaAcaraMahasiswaId(id);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      
      {/* Left Sidebar with Groups & Submenus */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activePenguji={activePenguji}
        setActivePenguji={setActivePenguji}
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsMobileSidebarOpen(false)}
        siswaCount={masterSiswaList.length}
        jurusanCount={masterJurusanList.length}
        instansiCount={masterInstansiList.length}
        guruCount={masterGuruList.length}
        plottingCount={plottingList.length}
        pesertaCount={pesertaList.length}
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
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Sleek Topbar Header */}
        <Header
          activeTab={activeTab}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          activePenguji={activePenguji}
          setActivePenguji={setActivePenguji}
          supabaseConfig={supabaseConfig}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-semibold">Memuat Data Sidang PKL Real-Time...</p>
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
                />
              )}

              {activeTab === 'plotting' && (
                <PlottingSiswaTable
                  plottingList={plottingList}
                  siswaList={masterSiswaList}
                  instansiList={masterInstansiList}
                  guruList={masterGuruList}
                  onPlottingUpdated={loadData}
                  onNavigateToSiswa={() => setActiveTab('master')}
                  onNavigateToInstansi={() => setActiveTab('instansi')}
                  onNavigateToGuru={() => setActiveTab('guru')}
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                  initialOpenUpload={autoOpenUploadPlotting}
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
                />
              )}

              {activeTab === 'instansi' && (
                <MasterInstansiTable
                  instansiList={masterInstansiList}
                  siswaList={masterSiswaList}
                  onInstansiUpdated={loadData}
                  onFilterSiswaByInstansi={(namaInstansi) => {
                    setFilterInstansiForSiswa(namaInstansi);
                    setActiveTab('master');
                  }}
                  onNavigateToSiswa={() => setActiveTab('master')}
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                  initialOpenUpload={autoOpenUploadInstansi}
                />
              )}

              {activeTab === 'guru' && (
                <MasterGuruTable
                  guruList={masterGuruList}
                  siswaList={masterSiswaList}
                  onGuruUpdated={loadData}
                  onFilterSiswaByGuru={(namaGuru) => {
                    setFilterGuruForSiswa(namaGuru);
                    setActiveTab('master');
                  }}
                  onNavigateToSiswa={() => setActiveTab('master')}
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                  initialOpenUpload={autoOpenUploadGuru}
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
                  onSelectPesertaForSidang={handleSelectPesertaForSidang}
                  onOpenBeritaAcara={handleOpenBeritaAcara}
                />
              )}

              {activeTab === 'rekap' && (
                <RekapitulasiView
                  pesertaList={pesertaList}
                  penilaianList={penilaianList}
                  onOpenBeritaAcara={handleOpenBeritaAcara}
                  onSelectPesertaForSidang={handleSelectPesertaForSidang}
                />
              )}

              {activeTab === 'rubrik' && <RubrikGuide />}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} My PKL — Aplikasi Penilaian Sidang Praktik Kerja Lapangan Real-Time.</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="hover:text-emerald-700 font-semibold"
              >
                Setup Supabase & Schema SQL
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('rubrik')}
                className="hover:text-emerald-700 font-semibold"
              >
                Pedoman Rubrik
              </button>
            </div>
          </div>
        </footer>

      </div>

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
          onClose={() => setBeritaAcaraMahasiswaId(null)}
        />
      )}

    </div>
  );
}
