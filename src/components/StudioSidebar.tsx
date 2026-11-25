import React from 'react';
import { Compass, Eye, EyeOff, Pause, Play, RotateCcw } from 'lucide-react';
import { FIBER_CORRIDORS, INFRA_NODES, PROVIDER_META, ProviderId } from '../data/infrastructure';
import {
  FRAME_ASPECTS,
  FrameAspectId,
  PALETTES,
  PaletteId,
  ProjectionMode,
} from '../engine/projections';

interface StudioSidebarProps {
  projection: ProjectionMode;
  onProjectionChange: (mode: ProjectionMode) => void;
  abstraction: number;
  onAbstractionChange: (val: number) => void;
  paletteId: PaletteId;
  onPaletteChange: (id: PaletteId) => void;
  activeProvider: ProviderId | 'all';
  onProviderChange: (p: ProviderId | 'all') => void;
  aspectId: FrameAspectId;
  onAspectChange: (id: FrameAspectId) => void;
  showContinents: boolean;
  onToggleContinents: () => void;
  showGraticule: boolean;
  onToggleGraticule: () => void;
  showPackets: boolean;
  onTogglePackets: () => void;
  showPlacard: boolean;
  onTogglePlacard: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetView: () => void;
  onStartTour: () => void;
}

const PROJECTIONS: { id: ProjectionMode; label: string; note: string }[] = [
  { id: 'winkel', label: 'Winkel Geodesic', note: 'Balanced global cartography' },
  { id: 'azimuthal', label: 'Polar Azimuthal', note: 'Celestial disc projection' },
  { id: 'orbital', label: 'Orbital Ribbon', note: 'Sinusoidal meridian sweep' },
  { id: 'manifold', label: 'Latency Manifold', note: 'Force-embedded topology' },
];

const PROVIDERS: { id: ProviderId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Hyperscale' },
  { id: 'aws', label: 'AWS' },
  { id: 'gcp', label: 'Google Cloud' },
  { id: 'azure', label: 'Azure' },
  { id: 'meta', label: 'Meta AI' },
  { id: 'backbone', label: 'Subsea IXP' },
];

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  projection,
  onProjectionChange,
  abstraction,
  onAbstractionChange,
  paletteId,
  onPaletteChange,
  activeProvider,
  onProviderChange,
  aspectId,
  onAspectChange,
  showContinents,
  onToggleContinents,
  showGraticule,
  onToggleGraticule,
  showPackets,
  onTogglePackets,
  showPlacard,
  onTogglePlacard,
  isPlaying,
  onTogglePlay,
  onResetView,
  onStartTour,
}) => {
  const totalGW = (
    INFRA_NODES.reduce((acc, n) => acc + n.capacityMW, 0) / 1000
  ).toFixed(1);
  const totalPbps = (
    FIBER_CORRIDORS.reduce((acc, c) => acc + c.bandwidthTbps, 0) / 1000
  ).toFixed(2);

  return (
    <aside className="w-full lg:w-[320px] shrink-0 bg-[#090C13] border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col overflow-y-auto">
      {/* Section 0: Guided Product Tour & Global Telemetry */}
      <div className="p-5 border-b border-white/[0.07] bg-[#0B0F18]">
        <button
          onClick={onStartTour}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border border-white/20 bg-white/[0.06] hover:bg-white/[0.11] text-slate-100 text-xs font-medium transition-colors cursor-pointer"
        >
          <span className="inline-flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-slate-200" />
            <span>Start Product Tour</span>
          </span>
          <span className="font-telemetry text-[11px] text-slate-400">8 Steps</span>
        </button>

        <div className="mt-3 flex items-center justify-between text-[11px] font-telemetry text-slate-400">
          <span>{INFRA_NODES.length} Hubs</span>
          <span aria-hidden="true">·</span>
          <span>{FIBER_CORRIDORS.length} Corridors</span>
          <span aria-hidden="true">·</span>
          <span>{totalGW} GW</span>
          <span aria-hidden="true">·</span>
          <span>{totalPbps} Pbps</span>
        </div>
      </div>

      {/* Section 1: Projection Lens */}
      <div className="p-5 border-b border-white/[0.07]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium tracking-wider text-slate-400">
            Cartographic Lens
          </h2>
          <button
            onClick={onResetView}
            title="Reset zoom and pan"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {PROJECTIONS.map((item) => {
            const active = projection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onProjectionChange(item.id)}
                className={`text-left px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                  active
                    ? 'bg-white/[0.08] border-white/25 text-slate-100'
                    : 'bg-transparent border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                <div className="text-xs font-medium whitespace-nowrap truncate">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {item.note}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Cartographic Abstraction Morph */}
      <div className="p-5 border-b border-white/[0.07]">
        <div className="flex items-baseline justify-between mb-2">
          <label
            htmlFor="abstraction-slider"
            className="text-xs font-medium tracking-wider text-slate-400"
          >
            Spatial Abstraction
          </label>
          <span className="font-telemetry text-xs text-slate-200">
            {Math.round(abstraction)}%
          </span>
        </div>

        <input
          id="abstraction-slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={abstraction}
          onChange={(e) => onAbstractionChange(Number(e.target.value))}
          className="studio-slider my-3"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <button
            onClick={() => onAbstractionChange(0)}
            className={`hover:text-slate-200 transition-colors cursor-pointer ${
              abstraction === 0 ? 'text-slate-200 font-medium' : ''
            }`}
          >
            Geodetic
          </button>
          <button
            onClick={() => onAbstractionChange(45)}
            className={`hover:text-slate-200 transition-colors cursor-pointer ${
              abstraction === 45 ? 'text-slate-200 font-medium' : ''
            }`}
          >
            Hybrid Morph
          </button>
          <button
            onClick={() => onAbstractionChange(100)}
            className={`hover:text-slate-200 transition-colors cursor-pointer ${
              abstraction === 100 ? 'text-slate-200 font-medium' : ''
            }`}
          >
            Pure Topology
          </button>
        </div>
      </div>

      {/* Section 3: Infrastructure Strata */}
      <div className="p-5 border-b border-white/[0.07]">
        <h2 className="text-xs font-medium tracking-wider text-slate-400 mb-3">
          Infrastructure Operator
        </h2>
        <div className="grid grid-cols-2 gap-1.5">
          {PROVIDERS.map((p) => {
            const active = activeProvider === p.id;
            const color =
              p.id === 'all' ? '#E2E8F0' : PALETTES[paletteId].providerColors[p.id];
            return (
              <button
                key={p.id}
                onClick={() => onProviderChange(p.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white/[0.08] border-white/25 text-slate-100 font-medium'
                    : 'bg-transparent border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4: Exhibition Palette */}
      <div className="p-5 border-b border-white/[0.07]">
        <h2 className="text-xs font-medium tracking-wider text-slate-400 mb-3">
          Exhibition Palette
        </h2>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(PALETTES) as PaletteId[]).map((id) => {
            const p = PALETTES[id];
            const active = paletteId === id;
            return (
              <button
                key={id}
                onClick={() => onPaletteChange(id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md border text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-white/[0.08] border-white/25 text-slate-100'
                    : 'bg-transparent border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-sm border border-white/20 shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${p.bgInner} 45%, ${p.accent} 100%)`,
                  }}
                />
                <span className="text-xs truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 5: LinkedIn Frame Aspect */}
      <div className="p-5 border-b border-white/[0.07]">
        <h2 className="text-xs font-medium tracking-wider text-slate-400 mb-3">
          LinkedIn Composition Frame
        </h2>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(FRAME_ASPECTS) as FrameAspectId[]).map((id) => {
            const spec = FRAME_ASPECTS[id];
            const active = aspectId === id;
            return (
              <button
                key={id}
                onClick={() => onAspectChange(id)}
                className={`flex items-center justify-between px-3 py-2 rounded-md border text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white/[0.08] border-white/25 text-slate-100 font-medium'
                    : 'bg-transparent border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                <span className="truncate">{spec.label}</span>
                <span className="font-telemetry text-[11px] text-slate-500 ml-1.5">
                  {spec.ratioLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 6: Layer Calibration */}
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium tracking-wider text-slate-400">
            Visual Layers
          </h2>
          <button
            onClick={onTogglePlay}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Animate'}</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {[
            { label: 'Continental Contours', active: showContinents, toggle: onToggleContinents },
            { label: 'Celestial Graticule', active: showGraticule, toggle: onToggleGraticule },
            { label: 'Photon Traffic Pulses', active: showPackets, toggle: onTogglePackets },
            { label: 'Editorial Title Placard', active: showPlacard, toggle: onTogglePlacard },
          ].map((layer) => (
            <button
              key={layer.label}
              onClick={layer.toggle}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-white/[0.06] hover:border-white/15 text-xs transition-colors cursor-pointer"
            >
              <span className={layer.active ? 'text-slate-200' : 'text-slate-500'}>
                {layer.label}
              </span>
              {layer.active ? (
                <Eye className="w-3.5 h-3.5 text-slate-300" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
          ))}
        </div>

        {activeProvider !== 'all' && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-slate-400 leading-relaxed">
            Isolating <span className="text-slate-200 font-medium">{PROVIDER_META[activeProvider].label}</span> compute clusters and optical corridors.
          </div>
        )}
      </div>
    </aside>
  );
};
