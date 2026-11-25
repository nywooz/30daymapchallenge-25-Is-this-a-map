import React, { useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { FIBER_CORRIDORS, INFRA_NODES } from '../data/infrastructure';

export interface TourStep {
  id: string;
  chapter: string;
  title: string;
  description: string;
  highlightNote: string;
}

export const PRODUCT_TOUR_STEPS: TourStep[] = [
  {
    id: 'thesis-canvas',
    chapter: '01 · Cartographic Thesis',
    title: 'Is This a Map?',
    description: `Visualizing ${INFRA_NODES.length} hyperscale compute regions and ${FIBER_CORRIDORS.length} submarine & terrestrial optical arteries on a minimalist dark canvas—blending precision geodesy with modern generative network art.`,
    highlightNote: 'Winkel Tripel Geodesic · 18% Abstraction',
  },
  {
    id: 'abstraction-morph',
    chapter: '02 · Spatial Abstraction',
    title: 'Dissolving Borders into Latency',
    description:
      'As Spatial Abstraction increases toward 85%, geopolitical coastlines recede into quiet astronomical hairlines while data centers drift toward their true topological gravity.',
    highlightNote: 'Spatial Abstraction: 85% · Force-Embedded Topology',
  },
  {
    id: 'polar-azimuthal',
    chapter: '03 · Celestial Geometry',
    title: 'Polar Azimuthal Projection',
    description:
      'Centering the planet on the North Pole transforms transatlantic and transpacific fiber spines into sweeping orbital arcs—challenging conventional Atlantic-centric cartography.',
    highlightNote: 'North-Polar Azimuthal Disc · Abyssal Cyan Palette',
  },
  {
    id: 'operator-isolation',
    chapter: '04 · Hyperscale Strata',
    title: 'Isolating Cloud Fabric Dominance',
    description:
      'Filter the entire planetary mesh by operator—isolating Google Cloud, AWS, Microsoft Azure, Meta AI Fabrics, or Tier-1 Subsea IXPs to reveal sovereign routing strategies.',
    highlightNote: 'Operator Filter: Google Cloud · Optical Corridor Isolation',
  },
  {
    id: 'specimen-inspection',
    chapter: '05 · Node Telemetry',
    title: 'Deep Facility Specimen Inspection',
    description:
      'Clicking or hovering any glowing node reveals its power footprint (MW), PUE efficiency, renewable energy share, liquid-cooled rack density, IXP fabric, and direct fiber links.',
    highlightNote: 'Specimen Focused: Singapore Jurong (26 Subsea Landings)',
  },
  {
    id: 'topology-ledger',
    chapter: '06 · Global Compute Index',
    title: 'Structured Facility Ledger',
    description:
      'Switch to the Topology tab to inspect every global cluster in tabular precision—power capacity, renewable percentage, kW/rack density, and network degree—and click any row to jump back to it on the canvas.',
    highlightNote: 'Tab: Topology · Tabular Telemetry & Regional Filtering',
  },
  {
    id: 'corridors-ledger',
    chapter: '07 · Optical Spine',
    title: 'Subsea & Terrestrial Arteries',
    description:
      'The Corridors view catalogs every major submarine and terrestrial trunk—from Grace Hopper and MAREA to 2Africa and Equiano—by design bandwidth (Tbps), distance, and millisecond latency.',
    highlightNote: 'Tab: Corridors · 100+ Global Optical Trunks',
  },
  {
    id: 'linkedin-export',
    chapter: '08 · LinkedIn Studio Export',
    title: 'Editorial Framing & High-Res Export',
    description:
      'Frame the artwork in LinkedIn-native 4:5 Portrait, 1.91:1 Landscape, or 1:1 Square plates, then export a razor-sharp print-fidelity PNG complete with museum placard typography and tailored post copy.',
    highlightNote: 'LinkedIn 4:5 Editorial Plate · 2160 × 2700 px Ready',
  },
];

interface ProductTourProps {
  isOpen: boolean;
  stepIndex: number;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  onStepChange: (index: number) => void;
  onClose: () => void;
  onOpenExport: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({
  isOpen,
  stepIndex,
  isAutoPlaying,
  onToggleAutoPlay,
  onStepChange,
  onClose,
  onOpenExport,
}) => {
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return;
    const timer = setInterval(() => {
      if (stepIndex < PRODUCT_TOUR_STEPS.length - 1) {
        onStepChange(stepIndex + 1);
      } else {
        onToggleAutoPlay();
      }
    }, 4600);
    return () => clearInterval(timer);
  }, [isOpen, isAutoPlaying, stepIndex, onStepChange, onToggleAutoPlay]);

  if (!isOpen) return null;

  const step = PRODUCT_TOUR_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === PRODUCT_TOUR_STEPS.length - 1;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl bg-[#0B0F18]/95 border border-white/20 rounded-lg shadow-2xl backdrop-blur-md p-5">
      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-3.5">
        {PRODUCT_TOUR_STEPS.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => onStepChange(idx)}
            aria-label={`Go to tour step ${idx + 1}: ${s.title}`}
            className={`h-1 flex-1 rounded-full transition-colors cursor-pointer ${
              idx <= stepIndex ? 'bg-slate-100' : 'bg-white/15 hover:bg-white/30'
            }`}
          />
        ))}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-telemetry text-slate-400">
            <span>{step.chapter}</span>
            <span aria-hidden="true">·</span>
            <span>
              {String(stepIndex + 1).padStart(2, '0')} /{' '}
              {String(PRODUCT_TOUR_STEPS.length).padStart(2, '0')}
            </span>
          </div>
          <h3 className="font-editorial text-2xl font-medium text-slate-100 mt-0.5 leading-snug">
            {step.title}
          </h3>
        </div>

        <button
          onClick={onClose}
          aria-label="Exit product tour"
          className="p-1.5 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed mt-2">
        {step.description}
      </p>

      <div className="mt-3 text-[11px] font-telemetry text-slate-400">
        Active View: <span className="text-slate-200">{step.highlightNote}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-white/[0.08]">
        <button
          onClick={onToggleAutoPlay}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {isAutoPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Auto-Tour</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Auto-Play Tour</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onStepChange(Math.max(0, stepIndex - 1))}
            disabled={isFirst}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-white/15 text-slate-200 hover:bg-white/[0.06] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {isLast ? (
            <button
              onClick={() => {
                onClose();
                onOpenExport();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-slate-100 text-slate-950 rounded-md hover:bg-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Open LinkedIn Export</span>
            </button>
          ) : (
            <button
              onClick={() => onStepChange(stepIndex + 1)}
              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium bg-slate-100 text-slate-950 rounded-md hover:bg-white transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
