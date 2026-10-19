import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { LiveEvaluationRoom } from './components/LiveEvaluationRoom.tsx';
import { MasterSiswaTable } from './components/MasterSiswaTable.tsx';
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
  MasterSiswaPKL
} from './types/index.ts';
import { DAFTAR_PENGUJI } from './data/penguji.ts';
import { 
  getPesertaSidangList, 
  getPenilaianList, 
  getMasterSiswaList,
  getSupabaseConfig, 
  subscribeToRealtimeUpdates 
} from './lib/supabase.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'master' | 'peserta' | 'rekap' | 'rubrik'>('master');
  const [activePenguji, setActivePenguji] = useState<Penguji>(DAFTAR_PENGUJI[0]);
  const [pesertaList, setPesertaList] = useState<MahasiswaSidang[]>([]);
  const [penilaianList, setPenilaianList] = useState<PenilaianPenguji[]>([]);
  const [masterSiswaList, setMasterSiswaList] = useState<MasterSiswaPKL[]>([]);
  const [activePesertaId, setActivePesertaId] = useState<string>('m1');
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [beritaAcaraMahasiswaId, setBeritaAcaraMahasiswaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [peserta, nilai, master] = await Promise.all([
        getPesertaSidangList(),
        getPenilaianList(),
        getMasterSiswaList(),
      ]);
      setPesertaList(peserta);
      setPenilaianList(nilai);
      setMasterSiswaList(master);
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePenguji={activePenguji}
        setActivePenguji={setActivePenguji}
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Area */}
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

            {activeTab === 'master' && (
              <MasterSiswaTable
                siswaList={masterSiswaList}
                onSiswaUpdated={loadData}
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
