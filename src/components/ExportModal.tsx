import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import {
  FIBER_CORRIDORS,
  INFRA_NODES,
  ProviderId,
  PROVIDER_META,
} from '../data/infrastructure';
import {
  FRAME_ASPECTS,
  FrameAspectId,
  PALETTES,
  PaletteId,
  ProjectionMode,
} from '../engine/projections';
import { renderVisualization } from '../engine/renderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projection: ProjectionMode;
  abstraction: number;
  paletteId: PaletteId;
  activeProvider: ProviderId | 'all';
  aspectId: FrameAspectId;
  onAspectChange: (id: FrameAspectId) => void;
  showContinents: boolean;
  showGraticule: boolean;
  showPackets: boolean;
  showPlacard: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projection,
  abstraction,
  paletteId,
  activeProvider,
  aspectId,
  onAspectChange,
  showContinents,
  showGraticule,
  showPackets,
  showPlacard,
}) => {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const spec = FRAME_ASPECTS[aspectId];

  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewW = 540;
    const previewH = Math.round(previewW * (spec.exportHeight / spec.exportWidth));
    const dpr = 2;
    canvas.width = previewW * dpr;
    canvas.height = previewH * dpr;

    renderVisualization(ctx, {
      width: previewW,
      height: previewH,
      dpr,
      projection,
      abstraction,
      palette: PALETTES[paletteId],
      activeProvider,
      showContinents,
      showGraticule,
      showPackets,
      showPlacard,
      zoom: 1,
      panX: 0,
      panY: 0,
      timeSec: 3.4,
      hoveredNodeId: null,
      selectedNodeId: null,
    });
  }, [
    isOpen,
    spec.exportWidth,
    spec.exportHeight,
    projection,
    abstraction,
    paletteId,
    activeProvider,
    showContinents,
    showGraticule,
    showPackets,
    showPlacard,
  ]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    const offscreen = document.createElement('canvas');
    offscreen.width = spec.exportWidth;
    offscreen.height = spec.exportHeight;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    renderVisualization(ctx, {
      width: spec.exportWidth,
      height: spec.exportHeight,
      dpr: 1,
      projection,
      abstraction,
      palette: PALETTES[paletteId],
      activeProvider,
      showContinents,
      showGraticule,
      showPackets,
      showPlacard,
      zoom: 1,
      panX: 0,
      panY: 0,
      timeSec: 3.4,
      hoveredNodeId: null,
      selectedNodeId: null,
    });

    const link = document.createElement('a');
    link.download = `atlas-of-compute-${projection}-${aspectId}.png`;
    link.href = offscreen.toDataURL('image/png', 1.0);
    link.click();
  };

  const projText =
    projection === 'winkel'
      ? 'Winkel Tripel geodesic'
      : projection === 'azimuthal'
      ? 'North-Polar Azimuthal'
      : projection === 'orbital'
      ? 'Orbital Sinusoidal'
      : 'Latency-embedded topological manifold';

  const operatorText =
    activeProvider === 'all'
      ? 'major hyperscalers (AWS, Google Cloud, Azure, Meta) and Tier-1 subsea meshes'
      : `${PROVIDER_META[activeProvider].label} infrastructure`;

  const activeHubs = INFRA_NODES.filter(
    (n) => activeProvider === 'all' || n.providers.includes(activeProvider)
  );
  const activeCorridors = FIBER_CORRIDORS.filter(
    (c) => activeProvider === 'all' || c.owners.includes(activeProvider)
  );
  const totalGW = (
    activeHubs.reduce((acc, n) => acc + n.capacityMW, 0) / 1000
  ).toFixed(1);
  const totalPbps = (
    activeCorridors.reduce((acc, c) => acc + c.bandwidthTbps, 0) / 1000
  ).toFixed(2);

  const linkedInCaption = `Is this a map?\n\nAt ${Math.round(
    abstraction
  )}% spatial abstraction under a ${projText} lens, borders dissolve and what remains is the true geometry of the modern cloud: ${activeHubs.length} global compute hubs (${totalGW} GW) and ${activeCorridors.length} optical arteries (${totalPbps} Pbps) linking ${operatorText}.\n\nIn planetary-scale architecture, proximity isn't measured in kilometers—it's measured in millisecond latency, subsea landing concentration, and gigawatts of firm power.\n\n#CloudInfrastructure #DataCenters #Cartography #DataVisualization #NetworkTopology #Hyperscale #AIInfrastructure`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(linkedInCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2200);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="bg-[#FBF9F5] dark:bg-[#0B0F18] border border-stone-300 dark:border-white/15 rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/[0.08]">
          <div>
            <h2
              id="export-modal-title"
              className="font-editorial text-2xl font-medium text-stone-900 dark:text-slate-100"
            >
              Export High-Resolution LinkedIn Plate
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Rendered offscreen at native {spec.exportWidth} × {spec.exportHeight} px print fidelity
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close export modal"
            className="p-2 text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* Preview Plate */}
          <div className="md:col-span-7 bg-[#E9E5DC] dark:bg-[#05070C] border border-stone-200 dark:border-white/[0.08] rounded-md p-4 flex items-center justify-center min-h-[300px]">
            <canvas
              ref={previewRef}
              className="max-w-full max-h-[380px] w-auto h-auto rounded-sm shadow-lg"
            />
          </div>

          {/* Export Options & LinkedIn Copy */}
          <div className="md:col-span-5 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-stone-600 dark:text-slate-400 mb-2">
                  Target LinkedIn Format
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(FRAME_ASPECTS) as FrameAspectId[]).map((id) => {
                    const item = FRAME_ASPECTS[id];
                    const active = aspectId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => onAspectChange(id)}
                        className={`px-3 py-2 text-left rounded-md border text-xs transition-colors cursor-pointer ${
                          active
                            ? 'bg-stone-900/[0.08] dark:bg-white/10 border-stone-400 dark:border-white/25 text-stone-900 dark:text-slate-100 font-medium'
                            : 'bg-transparent border-stone-200 dark:border-white/[0.08] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div>{item.label}</div>
                        <div className="font-telemetry text-[11px] text-stone-500 dark:text-slate-500 mt-0.5">
                          {item.exportWidth}×{item.exportHeight}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-stone-600 dark:text-slate-400">
                    Suggested LinkedIn Caption
                  </span>
                  <button
                    onClick={handleCopyCaption}
                    className="inline-flex items-center gap-1 text-xs text-stone-700 dark:text-slate-300 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCaption ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={linkedInCaption}
                  rows={6}
                  className="w-full bg-white dark:bg-[#06080D] border border-stone-200 dark:border-white/[0.08] rounded-md p-3 text-xs text-stone-700 dark:text-slate-300 leading-relaxed focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-white/[0.08]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs text-stone-600 dark:text-slate-300 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadPng}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-stone-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-md hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
