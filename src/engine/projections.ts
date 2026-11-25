import { FIBER_CORRIDORS, INFRA_NODES, InfraNode, ProviderId } from '../data/infrastructure';

export type ProjectionMode = 'winkel' | 'azimuthal' | 'orbital' | 'manifold';

export type PaletteId =
  | 'obsidian-gold'
  | 'abyssal-cyan'
  | 'monochrome-silver'
  | 'thermal-spectrum'
  | 'archival-vellum'
  | 'gallery-cobalt';

export type FrameAspectId = 'viewport' | 'linkedin-landscape' | 'linkedin-portrait' | 'linkedin-square';

export interface ExhibitionPalette {
  id: PaletteId;
  name: string;
  subtitle: string;
  isLight?: boolean;
  bgInner: string;
  bgOuter: string;
  coastStroke: string;
  graticuleStroke: string;
  edgeBase: string;
  edgeHighlight: string;
  packetColor: string;
  nodeCore: string;
  providerColors: Record<ProviderId, string>;
  textPrimary: string;
  textMuted: string;
  accent: string;
}

export const PALETTES: Record<PaletteId, ExhibitionPalette> = {
  'obsidian-gold': {
    id: 'obsidian-gold',
    name: 'Obsidian & Gold',
    subtitle: 'Warm amber telemetry on matte obsidian',
    bgInner: '#0C0E14',
    bgOuter: '#050609',
    coastStroke: 'rgba(214, 198, 165, 0.20)',
    graticuleStroke: 'rgba(214, 198, 165, 0.065)',
    edgeBase: 'rgba(232, 185, 104, 0.34)',
    edgeHighlight: '#FBBF24',
    packetColor: '#FEF3C7',
    nodeCore: '#FFFBEB',
    providerColors: {
      aws: '#F59E0B',
      gcp: '#38BDF8',
      azure: '#93C5FD',
      meta: '#34D399',
      backbone: '#E7E5E4',
    },
    textPrimary: '#F5F2EB',
    textMuted: 'rgba(231, 224, 210, 0.56)',
    accent: '#F59E0B',
  },
  'abyssal-cyan': {
    id: 'abyssal-cyan',
    name: 'Abyssal Cyan',
    subtitle: 'Glacier photon corridors on deep void',
    bgInner: '#09111E',
    bgOuter: '#04070D',
    coastStroke: 'rgba(148, 184, 218, 0.22)',
    graticuleStroke: 'rgba(125, 211, 252, 0.065)',
    edgeBase: 'rgba(56, 189, 248, 0.36)',
    edgeHighlight: '#7DD3FC',
    packetColor: '#E0F2FE',
    nodeCore: '#F0F9FF',
    providerColors: {
      aws: '#FBBF24',
      gcp: '#38BDF8',
      azure: '#60A5FA',
      meta: '#2DD4BF',
      backbone: '#E2E8F0',
    },
    textPrimary: '#EEF6FF',
    textMuted: 'rgba(186, 210, 235, 0.56)',
    accent: '#38BDF8',
  },
  'monochrome-silver': {
    id: 'monochrome-silver',
    name: 'Archival Silver',
    subtitle: 'Gallery monochrome plate on carbon black',
    bgInner: '#0B0B0D',
    bgOuter: '#040405',
    coastStroke: 'rgba(255, 255, 255, 0.19)',
    graticuleStroke: 'rgba(255, 255, 255, 0.055)',
    edgeBase: 'rgba(226, 232, 240, 0.30)',
    edgeHighlight: '#FFFFFF',
    packetColor: '#FFFFFF',
    nodeCore: '#FFFFFF',
    providerColors: {
      aws: '#F4F4F5',
      gcp: '#D4D4D8',
      azure: '#A1A1AA',
      meta: '#E4E4E7',
      backbone: '#FFFFFF',
    },
    textPrimary: '#FAFAFA',
    textMuted: 'rgba(212, 212, 216, 0.55)',
    accent: '#F4F4F5',
  },
  'thermal-spectrum': {
    id: 'thermal-spectrum',
    name: 'Copper & Emerald',
    subtitle: 'Sovereign compute intensity gradient',
    bgInner: '#0C0D12',
    bgOuter: '#050608',
    coastStroke: 'rgba(203, 213, 225, 0.18)',
    graticuleStroke: 'rgba(244, 114, 182, 0.05)',
    edgeBase: 'rgba(251, 113, 133, 0.34)',
    edgeHighlight: '#FDA4AF',
    packetColor: '#FFE4E6',
    nodeCore: '#FFF1F2',
    providerColors: {
      aws: '#FB923C',
      gcp: '#34D399',
      azure: '#38BDF8',
      meta: '#FB7185',
      backbone: '#E2E8F0',
    },
    textPrimary: '#F8FAFC',
    textMuted: 'rgba(203, 213, 225, 0.56)',
    accent: '#FB7185',
  },
  'archival-vellum': {
    id: 'archival-vellum',
    name: 'Archival Vellum',
    subtitle: 'Warm parchment plate with bronze & lapis ink',
    isLight: true,
    bgInner: '#FCFBF8',
    bgOuter: '#F2EFE7',
    coastStroke: 'rgba(41, 37, 36, 0.24)',
    graticuleStroke: 'rgba(68, 64, 60, 0.09)',
    edgeBase: 'rgba(146, 64, 14, 0.36)',
    edgeHighlight: '#B45309',
    packetColor: '#1E3A8A',
    nodeCore: '#1C1917',
    providerColors: {
      aws: '#B45309',
      gcp: '#0369A1',
      azure: '#1D4ED8',
      meta: '#047857',
      backbone: '#292524',
    },
    textPrimary: '#1C1917',
    textMuted: 'rgba(41, 37, 36, 0.62)',
    accent: '#9A3412',
  },
  'gallery-cobalt': {
    id: 'gallery-cobalt',
    name: 'Gallery Cobalt',
    subtitle: 'Crisp museum stark white with cobalt filaments',
    isLight: true,
    bgInner: '#FFFFFF',
    bgOuter: '#F1F5F9',
    coastStroke: 'rgba(15, 23, 42, 0.22)',
    graticuleStroke: 'rgba(15, 23, 42, 0.08)',
    edgeBase: 'rgba(30, 58, 138, 0.34)',
    edgeHighlight: '#1D4ED8',
    packetColor: '#0284C7',
    nodeCore: '#0F172A',
    providerColors: {
      aws: '#D97706',
      gcp: '#0284C7',
      azure: '#1D4ED8',
      meta: '#059669',
      backbone: '#0F172A',
    },
    textPrimary: '#0F172A',
    textMuted: 'rgba(15, 23, 42, 0.60)',
    accent: '#1E3A8A',
  },
};

export interface FrameAspectSpec {
  id: FrameAspectId;
  label: string;
  ratioLabel: string;
  ratio: number | null; // null = fill viewport
  exportWidth: number;
  exportHeight: number;
}

export const FRAME_ASPECTS: Record<FrameAspectId, FrameAspectSpec> = {
  viewport: {
    id: 'viewport',
    label: 'Full Canvas',
    ratioLabel: 'Fluid',
    ratio: null,
    exportWidth: 2560,
    exportHeight: 1440,
  },
  'linkedin-landscape': {
    id: 'linkedin-landscape',
    label: 'LinkedIn Post',
    ratioLabel: '1.91:1',
    ratio: 1.91,
    exportWidth: 2400,
    exportHeight: 1256,
  },
  'linkedin-portrait': {
    id: 'linkedin-portrait',
    label: 'LinkedIn Editorial',
    ratioLabel: '4:5',
    ratio: 0.8,
    exportWidth: 2160,
    exportHeight: 2700,
  },
  'linkedin-square': {
    id: 'linkedin-square',
    label: 'LinkedIn Square',
    ratioLabel: '1:1',
    ratio: 1,
    exportWidth: 2400,
    exportHeight: 2400,
  },
};

const DEG2RAD = Math.PI / 180;

function sinc(x: number): number {
  return Math.abs(x) < 1e-6 ? 1 : Math.sin(x) / x;
}

// Winkel Tripel projection normalized roughly to [-1, 1] x [-0.55, 0.55]
export function projectWinkel(lonDeg: number, latDeg: number): [number, number] {
  const phi1 = Math.acos(2 / Math.PI);
  const lambda = lonDeg * DEG2RAD;
  const phi = latDeg * DEG2RAD;
  const alpha = Math.acos(Math.cos(phi) * Math.cos(lambda / 2));
  const sincAlpha = sinc(alpha);

  const aitoffX = (2 * Math.cos(phi) * Math.sin(lambda / 2)) / sincAlpha;
  const aitoffY = Math.sin(phi) / sincAlpha;

  const equirectX = lambda * Math.cos(phi1);
  const equirectY = phi;

  const x = 0.5 * (aitoffX + equirectX);
  const y = 0.5 * (aitoffY + equirectY);

  // Normalize x in [-PI, PI] -> [-1, 1], y inverted for screen coords
  return [x / 2.65, -y / 2.65];
}

// North-Polar Azimuthal Equidistant projection
export function projectAzimuthal(lonDeg: number, latDeg: number): [number, number] {
  // Radius from North Pole (lat = 90 -> r = 0, lat = -60 -> r = 0.92)
  const colat = (90 - latDeg) / 155;
  const r = Math.min(1.04, Math.pow(Math.max(0, colat), 0.92));
  // Rotate -20 deg so Americas sit gracefully left, Europe center-top, Asia right
  const theta = (lonDeg + 15) * DEG2RAD;
  const x = r * Math.sin(theta);
  const y = r * Math.cos(theta);
  return [x * 0.72, y * 0.72];
}

// Sinusoidal / Orbital ribbon projection
export function projectOrbital(lonDeg: number, latDeg: number): [number, number] {
  const lambda = lonDeg * DEG2RAD;
  const phi = latDeg * DEG2RAD;
  const x = (lambda * Math.cos(phi * 0.88)) / Math.PI;
  const y = -phi / (Math.PI * 0.52);
  return [x * 0.96, y * 0.52];
}

// Deterministic topological layout computed once from network connectivity & capacity
const MANIFOLD_POSITIONS: Record<string, [number, number]> = (() => {
  const positions: Record<string, [number, number]> = {};
  const degreeMap: Record<string, number> = {};
  INFRA_NODES.forEach((n) => {
    degreeMap[n.id] = 0;
  });
  FIBER_CORRIDORS.forEach((c) => {
    degreeMap[c.source] = (degreeMap[c.source] || 0) + 1;
    degreeMap[c.target] = (degreeMap[c.target] || 0) + 1;
  });

  // Initialize from Winkel coordinates so topology preserves recognizable macro-hemisphere symmetry
  const state: Record<string, { x: number; y: number }> = {};
  INFRA_NODES.forEach((n) => {
    const [wx, wy] = projectWinkel(n.lon, n.lat);
    state[n.id] = { x: wx * 0.85, y: wy * 0.9 };
  });

  // 140 deterministic spring-force + radial gravity iterations
  for (let iter = 0; iter < 140; iter++) {
    const forces: Record<string, { fx: number; fy: number }> = {};
    INFRA_NODES.forEach((n) => {
      forces[n.id] = { fx: 0, fy: 0 };
    });

    // Repulsion between all pairs
    for (let i = 0; i < INFRA_NODES.length; i++) {
      for (let j = i + 1; j < INFRA_NODES.length; j++) {
        const a = INFRA_NODES[i];
        const b = INFRA_NODES[j];
        const dx = state[a.id].x - state[b.id].x;
        const dy = state[a.id].y - state[b.id].y;
        const distSq = dx * dx + dy * dy + 0.0025;
        const rep = 0.0019 / distSq;
        const dist = Math.sqrt(distSq);
        const fx = (dx / dist) * rep;
        const fy = (dy / dist) * rep;
        forces[a.id].fx += fx;
        forces[a.id].fy += fy;
        forces[b.id].fx -= fx;
        forces[b.id].fy -= fy;
      }
    }

    // Attraction along fiber corridors weighted by bandwidth/latency
    FIBER_CORRIDORS.forEach((c) => {
      const a = state[c.source];
      const b = state[c.target];
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.0001;
      const ideal = Math.max(0.08, Math.min(0.45, c.latencyMs / 240));
      const pull = (dist - ideal) * 0.032;
      const fx = (dx / dist) * pull;
      const fy = (dy / dist) * pull;
      forces[c.source].fx += fx;
      forces[c.source].fy += fy;
      forces[c.target].fx -= fx;
      forces[c.target].fy -= fy;
    });

    // Central gravity weighted by node capacity & degree (superclusters drift subtly inward)
    INFRA_NODES.forEach((n) => {
      const deg = degreeMap[n.id] || 1;
      const grav = 0.015 + Math.min(0.025, deg * 0.0022);
      forces[n.id].fx -= state[n.id].x * grav;
      forces[n.id].fy -= state[n.id].y * grav;

      state[n.id].x += Math.max(-0.04, Math.min(0.04, forces[n.id].fx));
      state[n.id].y += Math.max(-0.04, Math.min(0.04, forces[n.id].fy));
    });
  }

  // Normalize bounding radius cleanly into [-0.82, 0.82] x [-0.52, 0.52]
  let maxAbsX = 0.001;
  let maxAbsY = 0.001;
  INFRA_NODES.forEach((n) => {
    maxAbsX = Math.max(maxAbsX, Math.abs(state[n.id].x));
    maxAbsY = Math.max(maxAbsY, Math.abs(state[n.id].y));
  });

  INFRA_NODES.forEach((n) => {
    positions[n.id] = [
      (state[n.id].x / maxAbsX) * 0.82,
      (state[n.id].y / maxAbsY) * 0.50,
    ];
  });

  return positions;
})();

export function projectGeo(
  lon: number,
  lat: number,
  mode: ProjectionMode
): [number, number] {
  switch (mode) {
    case 'azimuthal':
      return projectAzimuthal(lon, lat);
    case 'orbital':
      return projectOrbital(lon, lat);
    case 'manifold':
    case 'winkel':
    default:
      return projectWinkel(lon, lat);
  }
}

export function projectNode(
  node: InfraNode,
  mode: ProjectionMode,
  abstraction: number // 0..100
): [number, number] {
  const [gx, gy] = projectGeo(node.lon, node.lat, mode === 'manifold' ? 'winkel' : mode);
  const [mx, my] = MANIFOLD_POSITIONS[node.id] || [gx, gy];

  if (mode === 'manifold') {
    // Pure topological manifold blends toward concentric harmonic rings at high abstraction
    const t = Math.min(1, abstraction / 100);
    const angle = Math.atan2(my, mx);
    const radius = Math.sqrt(mx * mx + my * my);
    const ringRadius = node.tier === 'supercluster' ? 0.22 : node.tier === 'hyperscale' ? 0.42 : 0.58;
    const rx = Math.cos(angle) * (radius * 0.35 + ringRadius * 0.65) * 1.35;
    const ry = Math.sin(angle) * (radius * 0.35 + ringRadius * 0.65) * 0.92;
    return [gx * 0.15 + mx * 0.85 * (1 - t * 0.45) + rx * (t * 0.45), gy * 0.15 + my * 0.85 * (1 - t * 0.45) + ry * (t * 0.45)];
  }

  // Smooth morph between true cartographic projection (0%) and topological constellation (100%)
  const t = Math.pow(abstraction / 100, 1.15);
  return [gx * (1 - t) + mx * t, gy * (1 - t) + my * t];
}

export function toCanvasCoords(
  nx: number,
  ny: number,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  verticalOffsetRatio = 0
): [number, number] {
  // Base scale fits [-1..1] x [-0.6..0.6] comfortably inside canvas margins
  const aspectScale = Math.min(width / 2.15, height / 1.35);
  const cx = width * 0.5 + panX;
  const cy = height * (0.5 + verticalOffsetRatio) + panY;
  return [cx + nx * aspectScale * zoom, cy + ny * aspectScale * zoom];
}
