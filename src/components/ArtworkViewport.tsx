import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minus, Plus, X } from 'lucide-react';
import {
  FIBER_CORRIDORS,
  INFRA_NODES,
  InfraNode,
  PROVIDER_META,
  ProviderId,
} from '../data/infrastructure';
import {
  FRAME_ASPECTS,
  FrameAspectId,
  PALETTES,
  PaletteId,
  ProjectionMode,
} from '../engine/projections';
import { ProjectedNodePosition, renderVisualization } from '../engine/renderer';

interface ArtworkViewportProps {
  projection: ProjectionMode;
  abstraction: number;
  paletteId: PaletteId;
  activeProvider: ProviderId | 'all';
  aspectId: FrameAspectId;
  showContinents: boolean;
  showGraticule: boolean;
  showPackets: boolean;
  showPlacard: boolean;
  isPlaying: boolean;
  zoom: number;
  panX: number;
  panY: number;
  onZoomChange: (z: number) => void;
  onPanChange: (x: number, y: number) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onResetView: () => void;
}

export const ArtworkViewport: React.FC<ArtworkViewportProps> = ({
  projection,
  abstraction,
  paletteId,
  activeProvider,
  aspectId,
  showContinents,
  showGraticule,
  showPackets,
  showPlacard,
  isPlaying,
  zoom,
  panX,
  panY,
  onZoomChange,
  onPanChange,
  selectedNodeId,
  onSelectNode,
  onResetView,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const projectedRef = useRef<ProjectedNodePosition[]>([]);
  const timeRef = useRef<number>(0);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
    moved: boolean;
  }>({ active: false, startX: 0, startY: 0, origPanX: 0, origPanY: 0, moved: false });

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState<{ w: number; h: number }>({ w: 1000, h: 700 });
  const [cursorInfo, setCursorInfo] = useState<{ x: number; y: number } | null>(null);

  // Measure outer stage container
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setStageSize({ w: Math.max(320, rect.width), h: Math.max(320, rect.height) });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute inner canvas dimensions respecting selected LinkedIn Aspect Ratio
  const aspectSpec = FRAME_ASPECTS[aspectId];
  let canvasW = stageSize.w;
  let canvasH = stageSize.h;
  if (aspectSpec.ratio !== null) {
    const availW = Math.max(280, stageSize.w - 48);
    const availH = Math.max(280, stageSize.h - 48);
    if (availW / availH > aspectSpec.ratio) {
      canvasH = availH;
      canvasW = Math.round(availH * aspectSpec.ratio);
    } else {
      canvasW = availW;
      canvasH = Math.round(availW / aspectSpec.ratio);
    }
  }

  // Animation & high-DPI render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let lastTs = performance.now();

    const frame = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      if (isPlaying && !prefersReducedMotion) {
        timeRef.current += dt;
      }

      projectedRef.current = renderVisualization(ctx, {
        width: canvasW,
        height: canvasH,
        dpr,
        projection,
        abstraction,
        palette: PALETTES[paletteId],
        activeProvider,
        showContinents,
        showGraticule,
        showPackets,
        showPlacard,
        zoom,
        panX,
        panY,
        timeSec: timeRef.current,
        hoveredNodeId,
        selectedNodeId,
      });

      if (isPlaying && !prefersReducedMotion) {
        rafId = requestAnimationFrame(frame);
      }
    };

    // Draw initial frame synchronously
    frame(performance.now());
    if (isPlaying && !prefersReducedMotion) {
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    canvasW,
    canvasH,
    projection,
    abstraction,
    paletteId,
    activeProvider,
    showContinents,
    showGraticule,
    showPackets,
    showPlacard,
    isPlaying,
    zoom,
    panX,
    panY,
    hoveredNodeId,
    selectedNodeId,
  ]);

  const findNearestNode = (cx: number, cy: number): InfraNode | null => {
    let best: InfraNode | null = null;
    let bestDist = 18;
    for (const item of projectedRef.current) {
      const dx = item.x - cx;
      const dy = item.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = item.node;
      }
    }
    return best;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origPanX: panX,
      origPanY: panY,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    setCursorInfo({ x: Math.round(lx), y: Math.round(ly) });

    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }
      onPanChange(dragRef.current.origPanX + dx, dragRef.current.origPanY + dy);
      return;
    }

    const hit = findNearestNode(lx, ly);
    setHoveredNodeId(hit ? hit.id : null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.moved) {
      const rect = e.currentTarget.getBoundingClientRect();
      const hit = findNearestNode(e.clientX - rect.left, e.clientY - rect.top);
      onSelectNode(hit ? (hit.id === selectedNodeId ? null : hit.id) : null);
    }
    dragRef.current.active = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    onZoomChange(Math.min(4.5, Math.max(0.65, zoom * factor)));
  };

  const inspectedNode =
    INFRA_NODES.find((n) => n.id === (hoveredNodeId || selectedNodeId)) || null;
  const inspectedLinks = inspectedNode
    ? FIBER_CORRIDORS.filter(
        (c) => c.source === inspectedNode.id || c.target === inspectedNode.id
      )
    : [];

  return (
    <div
      ref={stageRef}
      className="relative flex-1 bg-[#040509] flex items-center justify-center overflow-hidden min-h-[520px]"
    >
      {/* Framed Artwork Canvas */}
      <div
        className={`relative transition-shadow duration-200 ${
          aspectSpec.ratio !== null
            ? 'border border-white/15 shadow-2xl shadow-black/80'
            : ''
        }`}
        style={{ width: canvasW, height: canvasH }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: canvasW, height: canvasH }}
          className={`block ${
            hoveredNodeId ? 'cursor-pointer' : 'cursor-crosshair'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            dragRef.current.active = false;
            setHoveredNodeId(null);
            setCursorInfo(null);
          }}
          onWheel={handleWheel}
        />

        {/* Top-Left Minimal Viewport Coordinate & Frame Probe */}
        <div className="pointer-events-none absolute top-5 left-6 flex items-center gap-3 text-[11px] font-telemetry text-slate-400/80">
          <span>
            {aspectSpec.ratio === null
              ? `${Math.round(canvasW)} × ${Math.round(canvasH)}`
              : `${aspectSpec.label.toUpperCase()} (${aspectSpec.exportWidth}×${aspectSpec.exportHeight})`}
          </span>
          {cursorInfo && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                X:{cursorInfo.x} Y:{cursorInfo.y}
              </span>
            </>
          )}
        </div>

        {/* Bottom-Right Zoom & Framing Controls (placed subtly at top-right so bottom placard stays clean) */}
        <div className="absolute top-4 right-5 flex items-center gap-1 bg-[#090C13]/85 border border-white/10 rounded-md p-1 backdrop-blur-sm">
          <button
            onClick={() => onZoomChange(Math.max(0.65, zoom / 1.2))}
            aria-label="Zoom out"
            className="p-1.5 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-telemetry text-[11px] text-slate-300 px-1.5 min-w-[44px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(4.5, zoom * 1.2))}
            aria-label="Zoom in"
            className="p-1.5 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetView}
            aria-label="Fit canvas"
            className="p-1.5 text-slate-400 hover:text-slate-100 border-l border-white/10 ml-0.5 pl-2 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Museum Specimen Card for Hovered / Selected Node */}
        {inspectedNode && (
          <div className="absolute top-16 right-5 w-84 bg-[#090C13]/94 border border-white/15 rounded-md p-4 backdrop-blur-md shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-telemetry text-slate-400">
                  {inspectedNode.code} · {inspectedNode.regionGroup}
                </div>
                <h3 className="font-editorial text-2xl font-medium text-slate-100 leading-tight mt-0.5">
                  {inspectedNode.name}
                </h3>
              </div>
              {selectedNodeId && (
                <button
                  onClick={() => onSelectNode(null)}
                  aria-label="Close specimen card"
                  className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 mt-1">
              {inspectedNode.city}, {inspectedNode.country}
              <span aria-hidden="true"> · </span>
              <span className="font-telemetry">
                {inspectedNode.lat.toFixed(2)}°, {inspectedNode.lon.toFixed(2)}°
              </span>
            </div>

            <p className="text-xs text-slate-300/90 leading-relaxed mt-3 pt-3 border-t border-white/[0.08]">
              {inspectedNode.description}
            </p>

            <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5 mt-3 pt-3 border-t border-white/[0.08]">
              <div>
                <dt className="text-[11px] text-slate-500">Power</dt>
                <dd className="font-telemetry text-sm font-medium text-slate-100 mt-0.5">
                  {inspectedNode.capacityMW} MW
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Renewables</dt>
                <dd className="font-telemetry text-sm font-medium text-slate-100 mt-0.5">
                  {inspectedNode.renewablePct}%
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">PUE</dt>
                <dd className="font-telemetry text-sm font-medium text-slate-100 mt-0.5">
                  {inspectedNode.pue.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Rack Density</dt>
                <dd className="font-telemetry text-xs text-slate-200 mt-0.5">
                  {inspectedNode.rackDensityKw} kW/rack
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Landings</dt>
                <dd className="font-telemetry text-xs text-slate-200 mt-0.5">
                  {inspectedNode.subseaLandings} subsea
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Active Since</dt>
                <dd className="font-telemetry text-xs text-slate-200 mt-0.5">
                  {inspectedNode.commissionedYear}
                </dd>
              </div>
            </dl>

            <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-1.5 text-[11px] text-slate-400">
              <div>
                IXP / Fabric:{' '}
                <span className="text-slate-200">{inspectedNode.ixpFabric}</span>
              </div>
              <div>
                Operators:{' '}
                <span className="text-slate-200">
                  {inspectedNode.providers
                    .map((p) => PROVIDER_META[p].shortLabel)
                    .join(' · ')}
                </span>
              </div>
              {inspectedLinks.length > 0 && (
                <div className="pt-1">
                  <div className="text-slate-500 mb-1">
                    Primary Fiber Links ({inspectedLinks.length}):
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {inspectedLinks.slice(0, 4).map((c) => {
                      const peerId = c.source === inspectedNode.id ? c.target : c.source;
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between font-telemetry text-[11px] text-slate-300"
                        >
                          <span className="truncate pr-2">
                            {c.name} → {peerId.toUpperCase()}
                          </span>
                          <span className="text-slate-400 shrink-0">
                            {c.bandwidthTbps}T · {c.latencyMs}ms
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
