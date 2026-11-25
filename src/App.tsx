import { useCallback, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { ProviderId } from './data/infrastructure';
import { FrameAspectId, PALETTES, PaletteId, ProjectionMode } from './engine/projections';
import { ArtworkViewport } from './components/ArtworkViewport';
import { ExportModal } from './components/ExportModal';
import { ProductTour } from './components/ProductTour';
import { CorridorsView, ThesisView, TopologyView } from './components/SecondaryViews';
import { StudioSidebar } from './components/StudioSidebar';

type ActiveTab = 'canvas' | 'topology' | 'corridors' | 'thesis';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<ActiveTab>('canvas');
  const [projection, setProjection] = useState<ProjectionMode>('winkel');
  const [abstraction, setAbstraction] = useState<number>(18);
  const [paletteId, setPaletteId] = useState<PaletteId>('obsidian-gold');
  const [activeProvider, setActiveProvider] = useState<ProviderId | 'all'>('all');
  const [aspectId, setAspectId] = useState<FrameAspectId>('viewport');

  const [showContinents, setShowContinents] = useState<boolean>(true);
  const [showGraticule, setShowGraticule] = useState<boolean>(true);
  const [showPackets, setShowPackets] = useState<boolean>(true);
  const [showPlacard, setShowPlacard] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState<boolean>(false);

  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);
  const [tourAutoPlay, setTourAutoPlay] = useState<boolean>(false);

  // Sync root <html> .dark class for Tailwind v4 @custom-variant dark
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleThemeChange = useCallback(
    (nextTheme: 'light' | 'dark') => {
      setTheme(nextTheme);
      const currentIsLight = Boolean(PALETTES[paletteId].isLight);
      if (nextTheme === 'light' && !currentIsLight) {
        setPaletteId('archival-vellum');
      } else if (nextTheme === 'dark' && currentIsLight) {
        setPaletteId('obsidian-gold');
      }
    },
    [paletteId]
  );

  const handlePaletteChange = (id: PaletteId) => {
    setPaletteId(id);
    setTheme(PALETTES[id].isLight ? 'light' : 'dark');
  };

  const handleResetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const applyTourStep = useCallback(
    (index: number, forcedTheme?: 'light' | 'dark') => {
      setTourStep(index);
      const useLight = (forcedTheme ?? theme) === 'light';
      switch (index) {
        case 0:
          setActiveTab('canvas');
          setProjection('winkel');
          setAbstraction(18);
          setPaletteId(useLight ? 'archival-vellum' : 'obsidian-gold');
          setActiveProvider('all');
          setAspectId('viewport');
          setSelectedNodeId(null);
          setShowContinents(true);
          setShowGraticule(true);
          setShowPlacard(true);
          setZoom(1);
          setPanX(0);
          setPanY(0);
          break;
        case 1:
          setActiveTab('canvas');
          setProjection('winkel');
          setAbstraction(85);
          setPaletteId(useLight ? 'archival-vellum' : 'obsidian-gold');
          setActiveProvider('all');
          setAspectId('viewport');
          setSelectedNodeId(null);
          setZoom(1);
          setPanX(0);
          setPanY(0);
          break;
        case 2:
          setActiveTab('canvas');
          setProjection('azimuthal');
          setAbstraction(26);
          setPaletteId(useLight ? 'gallery-cobalt' : 'abyssal-cyan');
          setActiveProvider('all');
          setAspectId('viewport');
          setSelectedNodeId(null);
          setZoom(1);
          setPanX(0);
          setPanY(0);
          break;
        case 3:
          setActiveTab('canvas');
          setProjection('manifold');
          setAbstraction(72);
          setPaletteId(useLight ? 'gallery-cobalt' : 'abyssal-cyan');
          setActiveProvider('gcp');
          setAspectId('viewport');
          setSelectedNodeId(null);
          setZoom(1);
          setPanX(0);
          setPanY(0);
          break;
        case 4:
          setActiveTab('canvas');
          setProjection('winkel');
          setAbstraction(12);
          setPaletteId(useLight ? 'archival-vellum' : 'obsidian-gold');
          setActiveProvider('all');
          setAspectId('viewport');
          setSelectedNodeId('sin');
          setZoom(1.05);
          setPanX(0);
          setPanY(0);
          break;
        case 5:
          setSelectedNodeId(null);
          setActiveTab('topology');
          break;
        case 6:
          setSelectedNodeId(null);
          setActiveTab('corridors');
          break;
        case 7:
          setActiveTab('canvas');
          setProjection('azimuthal');
          setAbstraction(35);
          setPaletteId(useLight ? 'archival-vellum' : 'obsidian-gold');
          setActiveProvider('all');
          setAspectId('linkedin-portrait');
          setSelectedNodeId(null);
          setShowPlacard(true);
          setZoom(1);
          setPanX(0);
          setPanY(0);
          break;
        default:
          break;
      }
    },
    [theme]
  );

  const handleStartTour = () => {
    setExportOpen(false);
    setTheme('light');
    setTourOpen(true);
    setTourAutoPlay(false);
    applyTourStep(0, 'light');
  };

  const handleCloseTour = () => {
    setTourOpen(false);
    setTourAutoPlay(false);
  };

  const handleToggleTourTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    handleThemeChange(next);
    applyTourStep(tourStep, next);
  };

  const handleFocusNodeFromTable = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActiveTab('canvas');
  };

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'canvas', label: 'Canvas' },
    { id: 'topology', label: 'Topology' },
    { id: 'corridors', label: 'Corridors' },
    { id: 'thesis', label: 'Thesis' },
  ];

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#F6F4EF] dark:bg-[#06080D] text-stone-900 dark:text-[#E6E8EE] overflow-y-auto lg:overflow-hidden">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="h-14 shrink-0 flex items-center justify-between gap-8 px-6 border-b border-stone-200 dark:border-white/[0.08] bg-[#FBF9F5] dark:bg-[#070A10]">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('canvas')}
          className="font-editorial text-xl font-medium tracking-tight text-stone-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Atlas of Compute
        </button>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav className="flex items-center gap-6 text-xs font-medium overflow-x-auto">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b ${
                  active
                    ? 'text-stone-950 dark:text-slate-100 border-stone-950 dark:border-slate-100'
                    : 'text-stone-500 dark:text-slate-400 border-transparent hover:text-stone-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={tourOpen ? handleCloseTour : handleStartTour}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b ${
              tourOpen
                ? 'text-amber-700 dark:text-amber-300 border-amber-700 dark:border-amber-300'
                : 'text-stone-700 dark:text-slate-300 border-transparent hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            Product Tour
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white dark:text-slate-950 bg-stone-900 dark:bg-slate-100 rounded-md hover:bg-stone-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Artwork</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">
        {activeTab === 'canvas' && (
          <>
            <StudioSidebar
              theme={theme}
              onThemeChange={handleThemeChange}
              projection={projection}
              onProjectionChange={(m) => {
                setProjection(m);
                if (m === 'manifold' && abstraction < 60) {
                  setAbstraction(75);
                }
              }}
              abstraction={abstraction}
              onAbstractionChange={setAbstraction}
              paletteId={paletteId}
              onPaletteChange={handlePaletteChange}
              activeProvider={activeProvider}
              onProviderChange={setActiveProvider}
              aspectId={aspectId}
              onAspectChange={setAspectId}
              showContinents={showContinents}
              onToggleContinents={() => setShowContinents((v) => !v)}
              showGraticule={showGraticule}
              onToggleGraticule={() => setShowGraticule((v) => !v)}
              showPackets={showPackets}
              onTogglePackets={() => setShowPackets((v) => !v)}
              showPlacard={showPlacard}
              onTogglePlacard={() => setShowPlacard((v) => !v)}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((v) => !v)}
              onResetView={handleResetView}
              onStartTour={handleStartTour}
            />
            <ArtworkViewport
              projection={projection}
              abstraction={abstraction}
              paletteId={paletteId}
              activeProvider={activeProvider}
              aspectId={aspectId}
              showContinents={showContinents}
              showGraticule={showGraticule}
              showPackets={showPackets}
              showPlacard={showPlacard}
              isPlaying={isPlaying}
              zoom={zoom}
              panX={panX}
              panY={panY}
              onZoomChange={setZoom}
              onPanChange={(x, y) => {
                setPanX(x);
                setPanY(y);
              }}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onResetView={handleResetView}
            />
          </>
        )}

        {activeTab === 'topology' && (
          <TopologyView onFocusNode={handleFocusNodeFromTable} />
        )}

        {activeTab === 'corridors' && (
          <CorridorsView onFocusNode={handleFocusNodeFromTable} />
        )}

        {activeTab === 'thesis' && (
          <ThesisView onReturnCanvas={() => setActiveTab('canvas')} />
        )}
      </main>

      <ProductTour
        isOpen={tourOpen}
        stepIndex={tourStep}
        isAutoPlaying={tourAutoPlay}
        theme={theme}
        selectedNodeId={selectedNodeId}
        onSelectSpecimen={(nodeId) => setSelectedNodeId(nodeId)}
        onToggleTheme={handleToggleTourTheme}
        onToggleAutoPlay={() => setTourAutoPlay((v) => !v)}
        onStepChange={(idx) => applyTourStep(idx)}
        onClose={handleCloseTour}
        onOpenExport={() => setExportOpen(true)}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        projection={projection}
        abstraction={abstraction}
        paletteId={paletteId}
        activeProvider={activeProvider}
        aspectId={aspectId}
        onAspectChange={setAspectId}
        showContinents={showContinents}
        showGraticule={showGraticule}
        showPackets={showPackets}
        showPlacard={showPlacard}
      />
    </div>
  );
}
