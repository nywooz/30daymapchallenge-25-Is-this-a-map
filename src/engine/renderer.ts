import { FIBER_CORRIDORS, INFRA_NODES, InfraNode, ProviderId } from '../data/infrastructure';
import { WORLD_CONTINENTS } from '../data/worldGeo';
import {
  ExhibitionPalette,
  ProjectionMode,
  projectGeo,
  projectNode,
  toCanvasCoords,
} from './projections';

export interface RenderOptions {
  width: number;
  height: number;
  dpr: number;
  projection: ProjectionMode;
  abstraction: number; // 0..100
  palette: ExhibitionPalette;
  activeProvider: ProviderId | 'all';
  showContinents: boolean;
  showGraticule: boolean;
  showPackets: boolean;
  showPlacard: boolean;
  zoom: number;
  panX: number;
  panY: number;
  timeSec: number;
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
}

export interface ProjectedNodePosition {
  node: InfraNode;
  x: number;
  y: number;
  radius: number;
}

function getEdgeControlPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strandOffset: number,
  abstraction: number
): [number, number] {
  const mx = (x1 + x2) * 0.5;
  const my = (y1 + y2) * 0.5;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return [mx, my];

  // Perpendicular normal
  const nx = -dy / dist;
  const ny = dx / dist;

  // Curvature increases gracefully with distance and abstraction
  const curveAmp = dist * (strandOffset * (1 + (abstraction / 100) * 0.35));
  return [mx + nx * curveAmp, my + ny * curveAmp];
}

function evalQuadBezier(
  t: number,
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number
): [number, number] {
  const u = 1 - t;
  return [
    u * u * x1 + 2 * u * t * cx + t * t * x2,
    u * u * y1 + 2 * u * t * cy + t * t * y2,
  ];
}

export function renderVisualization(
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
): ProjectedNodePosition[] {
  const {
    width,
    height,
    dpr,
    projection,
    abstraction,
    palette,
    activeProvider,
    showContinents,
    showGraticule,
    showPackets,
    showPlacard,
    zoom,
    panX,
    panY,
    timeSec,
    hoveredNodeId,
    selectedNodeId,
  } = opts;

  const focusId = hoveredNodeId || selectedNodeId;
  const verticalOffset = showPlacard ? -0.045 : 0;

  ctx.save();
  ctx.scale(dpr, dpr);

  // 1. Deep Atmospheric Matte Canvas Background
  const bgGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    width * 0.05,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.8
  );
  bgGrad.addColorStop(0, palette.bgInner);
  bgGrad.addColorStop(1, palette.bgOuter);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const isLight = Boolean(palette.isLight);

  // Subtle architectural framing hairline
  const pad = Math.max(18, Math.min(width, height) * 0.025);
  ctx.strokeStyle = isLight ? 'rgba(28, 25, 23, 0.10)' : 'rgba(255, 255, 255, 0.045)';
  ctx.lineWidth = 1;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  // Corner registration ticks (museum print aesthetic)
  const tick = 10;
  ctx.strokeStyle = isLight ? 'rgba(28, 25, 23, 0.32)' : 'rgba(255, 255, 255, 0.16)';
  ctx.beginPath();
  // Top-left
  ctx.moveTo(pad, pad + tick);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + tick, pad);
  // Top-right
  ctx.moveTo(width - pad - tick, pad);
  ctx.lineTo(width - pad, pad);
  ctx.lineTo(width - pad, pad + tick);
  // Bottom-left
  ctx.moveTo(pad, height - pad - tick);
  ctx.lineTo(pad, height - pad);
  ctx.lineTo(pad + tick, height - pad);
  // Bottom-right
  ctx.moveTo(width - pad - tick, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.lineTo(width - pad, height - pad - tick);
  ctx.stroke();

  const geoFade =
    projection === 'manifold'
      ? Math.max(0.03, 0.25 * (1 - abstraction / 100))
      : Math.max(0.0, 1 - Math.pow(abstraction / 95, 1.35));

  // 2. Cartographic Graticule & Celestial Orbital Rings
  if (showGraticule) {
    ctx.save();
    ctx.lineWidth = 0.75;

    if (projection === 'azimuthal' || projection === 'manifold' || abstraction > 60) {
      // Concentric celestial rings blend in as abstraction rises or in azimuthal mode
      const ringAlpha =
        projection === 'azimuthal' ? 1 : Math.min(1, (abstraction - 35) / 55);
      if (ringAlpha > 0.02) {
        const [cx, cy] = toCanvasCoords(0, 0, width, height, zoom, panX, panY, verticalOffset);
        const baseR = Math.min(width / 2.15, height / 1.35) * zoom;
        ctx.strokeStyle = palette.graticuleStroke;
        ctx.globalAlpha = ringAlpha;
        [0.18, 0.34, 0.50, 0.66, 0.82].forEach((r) => {
          ctx.beginPath();
          ctx.arc(cx, cy, baseR * r, 0, Math.PI * 2);
          ctx.stroke();
        });
        // Radial azimuth spokes every 30 degrees
        for (let deg = 0; deg < 360; deg += 30) {
          const rad = (deg * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rad) * baseR * 0.1, cy + Math.sin(rad) * baseR * 0.1);
          ctx.lineTo(cx + Math.cos(rad) * baseR * 0.84, cy + Math.sin(rad) * baseR * 0.84);
          ctx.stroke();
        }
      }
    }

    if (geoFade > 0.03 && projection !== 'azimuthal') {
      ctx.globalAlpha = geoFade;
      ctx.strokeStyle = palette.graticuleStroke;
      const geoMode = projection === 'manifold' ? 'winkel' : projection;
      // Parallels
      for (let lat = -60; lat <= 75; lat += 15) {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 6) {
          const [nx, ny] = projectGeo(lon, lat, geoMode);
          const [px, py] = toCanvasCoords(nx, ny, width, height, zoom, panX, panY, verticalOffset);
          if (lon === -180) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      // Meridians
      for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        for (let lat = -75; lat <= 80; lat += 5) {
          const [nx, ny] = projectGeo(lon, lat, geoMode);
          const [px, py] = toCanvasCoords(nx, ny, width, height, zoom, panX, panY, verticalOffset);
          if (lat === -75) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 3. Delicate Continental Vector Contours (dissolving smoothly with abstraction)
  if (showContinents && geoFade > 0.02) {
    ctx.save();
    ctx.globalAlpha = geoFade;
    const geoMode = projection === 'manifold' ? 'winkel' : projection;

    // Subtle continental fill + fine coastal contour
    ctx.fillStyle = isLight ? 'rgba(28, 25, 23, 0.035)' : 'rgba(255, 255, 255, 0.018)';
    ctx.strokeStyle = palette.coastStroke;
    ctx.lineWidth = isLight ? 0.95 : 0.85;

    WORLD_CONTINENTS.forEach((poly) => {
      ctx.beginPath();
      poly.forEach(([lon, lat], idx) => {
        const [nx, ny] = projectGeo(lon, lat, geoMode);
        const [px, py] = toCanvasCoords(nx, ny, width, height, zoom, panX, panY, verticalOffset);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  // 4. Compute Projected Node Positions
  const nodeMap: Record<string, ProjectedNodePosition> = {};
  const projectedList: ProjectedNodePosition[] = [];

  INFRA_NODES.forEach((node) => {
    const [nx, ny] = projectNode(node, projection, abstraction);
    const [x, y] = toCanvasCoords(nx, ny, width, height, zoom, panX, panY, verticalOffset);
    const baseR =
      node.tier === 'supercluster' ? 4.4 : node.tier === 'hyperscale' ? 3.2 : 2.5;
    const radius = baseR * Math.min(1.5, Math.max(0.8, Math.sqrt(zoom)));
    const entry = { node, x, y, radius };
    nodeMap[node.id] = entry;
    projectedList.push(entry);
  });

  // Determine connected neighborhood if a node is hovered/selected
  const connectedIds = new Set<string>();
  if (focusId) {
    connectedIds.add(focusId);
    FIBER_CORRIDORS.forEach((c) => {
      if (c.source === focusId) connectedIds.add(c.target);
      if (c.target === focusId) connectedIds.add(c.source);
    });
  }

  // 5. Render Fiber Corridors with Multi-Pass Optical Glow (Dark) / Ink Wash (Light)
  ctx.save();
  ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';

  FIBER_CORRIDORS.forEach((corridor, idx) => {
    const src = nodeMap[corridor.source];
    const dst = nodeMap[corridor.target];
    if (!src || !dst) return;

    const matchesProvider =
      activeProvider === 'all' || corridor.owners.includes(activeProvider);
    const isFocusedEdge =
      focusId !== null && (corridor.source === focusId || corridor.target === focusId);

    let alphaMultiplier = 1;
    if (!matchesProvider) alphaMultiplier *= 0.14;
    if (focusId && !isFocusedEdge) alphaMultiplier *= 0.16;

    const [cx, cy] = getEdgeControlPoint(
      src.x,
      src.y,
      dst.x,
      dst.y,
      corridor.strandOffset,
      abstraction
    );

    // Subtle glow pass for high-capacity arteries
    const strokeColor =
      activeProvider !== 'all' && matchesProvider
        ? palette.providerColors[activeProvider]
        : isFocusedEdge
        ? palette.edgeHighlight
        : palette.edgeBase;

    const bandwidthWeight = Math.min(2.1, Math.max(0.65, corridor.bandwidthTbps / 240));

    // Outer optical halo
    if (isFocusedEdge || (matchesProvider && corridor.bandwidthTbps >= 200)) {
      ctx.save();
      ctx.globalAlpha = (isFocusedEdge ? 0.28 : 0.11) * alphaMultiplier;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = bandwidthWeight * 3.4;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(cx, cy, dst.x, dst.y);
      ctx.stroke();
      ctx.restore();
    }

    // Core crisp fiber strand
    ctx.save();
    ctx.globalAlpha = (isFocusedEdge ? 0.95 : 0.58) * alphaMultiplier;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isFocusedEdge ? bandwidthWeight * 1.45 : bandwidthWeight * 0.85;
    if (corridor.type === 'terrestrial' && !isFocusedEdge && abstraction < 40) {
      ctx.setLineDash([2.5, 2.5]);
    }
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.quadraticCurveTo(cx, cy, dst.x, dst.y);
    ctx.stroke();
    ctx.restore();

    // Animated Photon Packets traveling along fiber pathways
    if (showPackets && matchesProvider && (!focusId || isFocusedEdge)) {
      const speed = 0.085 + (140 / Math.max(25, corridor.latencyMs)) * 0.035;
      const phase = ((timeSec * speed + idx * 0.37) % 1 + 1) % 1;
      const [px, py] = evalQuadBezier(phase, src.x, src.y, cx, cy, dst.x, dst.y);

      const pAlpha = isFocusedEdge ? 0.95 : 0.65 * alphaMultiplier;
      const pRadius = isFocusedEdge ? 2.4 : 1.5;

      const glow = ctx.createRadialGradient(px, py, 0, px, py, pRadius * 3.8);
      glow.addColorStop(0, palette.packetColor);
      glow.addColorStop(1, isLight ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)');
      ctx.save();
      ctx.globalAlpha = pAlpha;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, pRadius * 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isLight ? palette.packetColor : palette.nodeCore;
      ctx.beginPath();
      ctx.arc(px, py, pRadius * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
  ctx.restore();

  // 6. Render Glowing Data Center Nodes
  projectedList.forEach(({ node, x, y, radius }) => {
    const matchesProvider =
      activeProvider === 'all' || node.providers.includes(activeProvider);
    const isFocus = node.id === focusId;
    const isNeighbor = focusId ? connectedIds.has(node.id) : false;

    let nodeAlpha = 1;
    if (!matchesProvider) nodeAlpha *= 0.2;
    if (focusId && !isNeighbor) nodeAlpha *= 0.22;

    const nodeColor =
      activeProvider !== 'all' && matchesProvider
        ? palette.providerColors[activeProvider]
        : palette.providerColors[node.primaryProvider];

    ctx.save();
    ctx.globalAlpha = nodeAlpha;

    // Outer radial bloom (Dark) / soft pigment halo (Light)
    const bloomR = radius * (isFocus ? 7.5 : node.tier === 'supercluster' ? 5.2 : 3.8);
    ctx.save();
    ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
    const bloom = ctx.createRadialGradient(x, y, 0, x, y, bloomR);
    bloom.addColorStop(0, isLight ? `${nodeColor}36` : nodeColor);
    bloom.addColorStop(0.35, isLight ? `${nodeColor}18` : `${nodeColor}44`);
    bloom.addColorStop(1, isLight ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)');
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(x, y, bloomR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Supercluster architectural orbital ring
    if (node.tier === 'supercluster' || isFocus) {
      ctx.strokeStyle = nodeColor;
      ctx.globalAlpha = nodeAlpha * (isFocus ? 0.9 : 0.48);
      ctx.lineWidth = isFocus ? 1.2 : 0.75;
      ctx.beginPath();
      ctx.arc(x, y, radius * (isFocus ? 3.2 : 2.35), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crisp luminous core
    ctx.globalAlpha = nodeAlpha;
    ctx.fillStyle = palette.nodeCore;
    ctx.beginPath();
    ctx.arc(x, y, radius * (isFocus ? 1.25 : 0.95), 0, Math.PI * 2);
    ctx.fill();

    // Subtle colored ring around core
    ctx.strokeStyle = nodeColor;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(x, y, radius * (isFocus ? 1.35 : 1.05), 0, Math.PI * 2);
    ctx.stroke();

    // Typographic label for Superclusters (when zoomed or high clarity) and Focused/Neighbor nodes
    const showLabel =
      isFocus ||
      (focusId && isNeighbor) ||
      (node.tier === 'supercluster' && matchesProvider && !focusId);

    if (showLabel) {
      const fontSize = isFocus ? 12 : 9.5;
      ctx.font = `${isFocus ? 500 : 400} ${fontSize}px "IBM Plex Mono", monospace`;
      ctx.textBaseline = 'middle';
      const labelText = isFocus ? `${node.city.toUpperCase()} · ${node.capacityMW} MW` : node.id.toUpperCase();
      const offsetX = radius * 2.2 + 5;
      ctx.fillStyle = isFocus ? palette.textPrimary : palette.textMuted;
      ctx.fillText(labelText, x + offsetX, y);
    }

    ctx.restore();
  });

  // 7. Museum / LinkedIn Editorial Placard Overlay (burned cleanly into PNG exports too!)
  if (showPlacard) {
    ctx.save();
    const margin = pad + Math.max(18, width * 0.022);
    const titleSize = Math.max(22, Math.min(54, width * 0.032));
    const subSize = Math.max(10.5, Math.min(15, width * 0.0105));
    const monoSize = Math.max(9.5, Math.min(13, width * 0.0085));
    const isNarrow = width < 880;

    // Bottom scrim for legibility
    const scrimTop = isNarrow ? height * 0.68 : height * 0.72;
    const scrim = ctx.createLinearGradient(0, scrimTop, 0, height);
    scrim.addColorStop(0, isLight ? 'rgba(248, 246, 241, 0)' : 'rgba(0,0,0,0)');
    scrim.addColorStop(1, isLight ? 'rgba(244, 241, 234, 0.94)' : 'rgba(4, 5, 9, 0.90)');
    ctx.fillStyle = scrim;
    ctx.fillRect(pad + 1, scrimTop, width - pad * 2 - 2, height - scrimTop - pad - 1);

    const activeNodes = INFRA_NODES.filter(
      (n) => activeProvider === 'all' || n.providers.includes(activeProvider)
    );
    const activeEdges = FIBER_CORRIDORS.filter(
      (c) => activeProvider === 'all' || c.owners.includes(activeProvider)
    );
    const totalMW = activeNodes.reduce((acc, n) => acc + n.capacityMW, 0);
    const totalTbps = activeEdges.reduce((acc, e) => acc + e.bandwidthTbps, 0);
    const projLabel =
      projection === 'winkel'
        ? 'WINKEL TRIPEL'
        : projection === 'azimuthal'
        ? 'POLAR AZIMUTHAL'
        : projection === 'orbital'
        ? 'ORBITAL SINUSOIDAL'
        : 'LATENCY MANIFOLD';

    ctx.textBaseline = 'alphabetic';

    if (isNarrow) {
      // Stacked composition for narrow/preview canvases
      ctx.textAlign = 'left';
      ctx.fillStyle = palette.textPrimary;
      ctx.font = `italic 500 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
      ctx.fillText('Is this a map?', margin, height - margin - subSize * 4.1);

      ctx.fillStyle = palette.textMuted;
      ctx.font = `400 ${subSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(
        'Global hyperscale compute & subsea optical topology.',
        margin,
        height - margin - subSize * 2.5
      );

      ctx.fillStyle = palette.textPrimary;
      ctx.font = `500 ${monoSize}px "IBM Plex Mono", monospace`;
      ctx.fillText(
        `${activeNodes.length} HUBS · ${activeEdges.length} CORRIDORS · ${(totalMW / 1000).toFixed(1)} GW · ${(totalTbps / 1000).toFixed(2)} PBPS`,
        margin,
        height - margin - subSize * 1.1
      );

      ctx.fillStyle = palette.textMuted;
      ctx.fillText(
        `PROJECTION: ${projLabel} · ABSTRACTION: ${Math.round(abstraction)}%`,
        margin,
        height - margin
      );
    } else {
      // Wide editorial split composition
      ctx.textAlign = 'left';
      ctx.fillStyle = palette.textPrimary;
      ctx.font = `italic 500 ${titleSize}px "Cormorant Garamond", Georgia, serif`;
      ctx.fillText('Is this a map?', margin, height - margin - subSize * 2.1);

      ctx.fillStyle = palette.textMuted;
      ctx.font = `400 ${subSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(
        'Global hyperscale compute density, subsea optical arteries & topological latency.',
        margin,
        height - margin - subSize * 0.45
      );

      const rightX = width - margin;
      ctx.textAlign = 'right';
      ctx.fillStyle = palette.textPrimary;
      ctx.font = `500 ${monoSize}px "IBM Plex Mono", monospace`;
      ctx.fillText(
        `${activeNodes.length} HUBS  ·  ${activeEdges.length} CORRIDORS  ·  ${(
          totalMW / 1000
        ).toFixed(1)} GW  ·  ${(totalTbps / 1000).toFixed(2)} PBPS`,
        rightX,
        height - margin - subSize * 1.4
      );

      ctx.fillStyle = palette.textMuted;
      ctx.fillText(
        `PROJECTION: ${projLabel}  ·  ABSTRACTION: ${Math.round(abstraction)}%`,
        rightX,
        height - margin - subSize * 0.25
      );
    }
    ctx.restore();
  }

  ctx.restore();
  return projectedList;
}
