import React, { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  FIBER_CORRIDORS,
  INFRA_NODES,
  PROVIDER_META,
} from '../data/infrastructure';

interface TopologyViewProps {
  onFocusNode: (nodeId: string) => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({ onFocusNode }) => {
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const regions = ['All', 'Americas', 'Europe', 'Asia-Pacific', 'Middle East & Africa'];

  const degreeMap = useMemo(() => {
    const map: Record<string, number> = {};
    FIBER_CORRIDORS.forEach((c) => {
      map[c.source] = (map[c.source] || 0) + 1;
      map[c.target] = (map[c.target] || 0) + 1;
    });
    return map;
  }, []);

  const filtered = INFRA_NODES.filter(
    (n) => regionFilter === 'All' || n.regionGroup === regionFilter
  ).sort((a, b) => b.capacityMW - a.capacityMW);

  const totalPowerGW = (
    filtered.reduce((acc, n) => acc + n.capacityMW, 0) / 1000
  ).toFixed(2);
  const avgRenewable = Math.round(
    filtered.reduce((acc, n) => acc + n.renewablePct, 0) / Math.max(1, filtered.length)
  );
  const avgPue = (
    filtered.reduce((acc, n) => acc + n.pue, 0) / Math.max(1, filtered.length)
  ).toFixed(2);

  return (
    <div className="flex-1 bg-[#F7F5F0] dark:bg-[#06080D] overflow-y-auto px-6 lg:px-12 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200 dark:border-white/[0.08]">
          <div>
            <div className="text-xs font-telemetry text-stone-500 dark:text-slate-400 tracking-wider">
              {filtered.length} Facilities · {totalPowerGW} GW Power · {avgRenewable}% Avg Clean Energy · {avgPue} Avg PUE
            </div>
            <h1 className="font-editorial text-4xl text-stone-900 dark:text-slate-100 mt-1.5 text-balance">
              Topological Concentration of Hyperscale Power
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-stone-200/70 dark:bg-[#0C1018] p-1 rounded-md border border-stone-300/80 dark:border-white/[0.08]">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  regionFilter === r
                    ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-slate-100 font-medium shadow-xs'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-white/[0.08] text-xs text-stone-500 dark:text-slate-400">
                <th className="py-3 pr-4 font-medium">Facility / IXP Fabric</th>
                <th className="py-3 px-4 font-medium">Location</th>
                <th className="py-3 px-4 font-medium text-right">Power</th>
                <th className="py-3 px-4 font-medium text-right">Clean %</th>
                <th className="py-3 px-4 font-medium text-right">kW / Rack</th>
                <th className="py-3 px-4 font-medium text-right">PUE</th>
                <th className="py-3 px-4 font-medium text-right">Degree</th>
                <th className="py-3 pl-4 font-medium text-right">Canvas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 dark:divide-white/[0.05] text-sm">
              {filtered.map((node) => (
                <tr
                  key={node.id}
                  onClick={() => onFocusNode(node.id)}
                  className="hover:bg-stone-200/40 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 pr-4">
                    <div className="font-medium text-stone-900 dark:text-slate-100">
                      {node.name}
                    </div>
                    <div className="font-telemetry text-xs text-stone-500 dark:text-slate-500 mt-0.5">
                      {node.code} · {node.ixpFabric} ·{' '}
                      {node.providers.map((p) => PROVIDER_META[p].shortLabel).join(' / ')}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 dark:text-slate-300">
                    <div>
                      {node.city}, {node.country}
                    </div>
                    <div className="font-telemetry text-xs text-stone-500 dark:text-slate-500 mt-0.5">
                      {node.lat.toFixed(2)}°, {node.lon.toFixed(2)}° · Est.{' '}
                      {node.commissionedYear}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-telemetry text-stone-900 dark:text-slate-100">
                    {node.capacityMW.toLocaleString()} MW
                  </td>
                  <td className="py-3.5 px-4 text-right font-telemetry text-stone-700 dark:text-slate-300">
                    {node.renewablePct}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-telemetry text-stone-700 dark:text-slate-300">
                    {node.rackDensityKw} kW
                  </td>
                  <td className="py-3.5 px-4 text-right font-telemetry text-stone-700 dark:text-slate-300">
                    {node.pue.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-telemetry text-stone-700 dark:text-slate-300">
                    {degreeMap[node.id] || 0}
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-slate-400 group-hover:text-stone-900 dark:group-hover:text-slate-100 transition-colors">
                      Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const CorridorsView: React.FC<{ onFocusNode: (nodeId: string) => void }> = ({
  onFocusNode,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'subsea' | 'terrestrial'>('all');

  const nodeNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    INFRA_NODES.forEach((n) => {
      m[n.id] = n.city;
    });
    return m;
  }, []);

  const filtered = FIBER_CORRIDORS.filter(
    (c) => typeFilter === 'all' || c.type === typeFilter
  ).sort((a, b) => b.bandwidthTbps - a.bandwidthTbps);

  const totalPbps = (
    filtered.reduce((acc, c) => acc + c.bandwidthTbps, 0) / 1000
  ).toFixed(2);
  const totalKm = filtered.reduce((acc, c) => acc + c.lengthKm, 0).toLocaleString();

  return (
    <div className="flex-1 bg-[#F7F5F0] dark:bg-[#06080D] overflow-y-auto px-6 lg:px-12 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200 dark:border-white/[0.08]">
          <div>
            <div className="text-xs font-telemetry text-stone-500 dark:text-slate-400 tracking-wider">
              {filtered.length} Optical Corridors · {totalPbps} Pbps Design Capacity · {totalKm} km Total Route
            </div>
            <h1 className="font-editorial text-4xl text-stone-900 dark:text-slate-100 mt-1.5 text-balance">
              Subsea & Terrestrial Fiber Arteries
            </h1>
          </div>

          <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-[#0C1018] p-1 rounded-md border border-stone-300/80 dark:border-white/[0.08]">
            {(
              [
                { id: 'all', label: 'All Corridors' },
                { id: 'subsea', label: 'Subsea Cables' },
                { id: 'terrestrial', label: 'Terrestrial Spines' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setTypeFilter(item.id)}
                className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  typeFilter === item.id
                    ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-slate-100 font-medium shadow-xs'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-white/[0.08] text-xs text-stone-500 dark:text-slate-400">
                <th className="py-3 pr-4 font-medium">System / Corridor</th>
                <th className="py-3 px-4 font-medium">Endpoints</th>
                <th className="py-3 px-4 font-medium">Medium</th>
                <th className="py-3 px-4 font-medium text-right">Design Capacity</th>
                <th className="py-3 px-4 font-medium text-right">Distance</th>
                <th className="py-3 pl-4 font-medium text-right">RTT / Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 dark:divide-white/[0.05] text-sm">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onFocusNode(c.source)}
                  className="hover:bg-stone-200/40 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="py-3.5 pr-4">
                    <div className="font-medium text-stone-900 dark:text-slate-100">
                      {c.name}
                    </div>
                    <div className="font-telemetry text-xs text-stone-500 dark:text-slate-500 mt-0.5">
                      {c.owners.map((o) => PROVIDER_META[o].shortLabel).join(' · ')}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 dark:text-slate-300">
                    {nodeNameMap[c.source] || c.source.toUpperCase()} →{' '}
                    {nodeNameMap[c.target] || c.target.toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-stone-600 dark:text-slate-300 capitalize">
                    {c.type}
                  </td>
                  <td className="py-3.5 px-4 text-right font-telemetry text-stone-900 dark:text-slate-100">
                    {c.bandwidthTbps} Tbps
                  </td>
                  <td className="py-3.5 px-4 text-right font-telemetry text-stone-700 dark:text-slate-300">
                    {c.lengthKm.toLocaleString()} km
                  </td>
                  <td className="py-3.5 pl-4 text-right font-telemetry text-stone-700 dark:text-slate-300">
                    {c.latencyMs.toFixed(1)} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ThesisView: React.FC<{ onReturnCanvas: () => void }> = ({
  onReturnCanvas,
}) => {
  const totalGW = (
    INFRA_NODES.reduce((acc, n) => acc + n.capacityMW, 0) / 1000
  ).toFixed(1);

  return (
    <div className="flex-1 bg-[#FBF9F5] dark:bg-[#06080D] overflow-y-auto px-6 py-14">
      <article className="max-w-2xl mx-auto">
        <div className="text-xs tracking-wider text-stone-500 dark:text-slate-400">
          Curatorial Note · Exhibition Catalogue · 2026
        </div>

        <h1 className="font-editorial text-5xl font-medium text-stone-900 dark:text-slate-100 mt-3 leading-tight text-balance">
          Is This a Map?
        </h1>
        <p className="font-editorial italic text-xl text-stone-600 dark:text-slate-400 mt-2">
          On dissolving physical borders into optical latency and planetary compute gravity.
        </p>

        <div className="border-t border-stone-300 dark:border-white/[0.1] my-8" />

        <div className="space-y-6 text-[15.5px] leading-[1.8] text-stone-700 dark:text-slate-300">
          <p className="first-letter:text-5xl first-letter:font-editorial first-letter:font-medium first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-stone-900 dark:first-letter:text-slate-100">
            Classical cartography was invented to measure maritime distance, imperial borders,
            and terrain elevation. Yet the modern digital economy operates on a radically
            different geometry. When an AI inference request travels from Ashburn to Dublin
            in 52 milliseconds along a subsea glass filament, or when Singapore and Johor Bahru
            share optical dark fiber across a strait at 1.4 milliseconds, physical landmass
            becomes secondary to topological adjacency.
          </p>

          <p>
            This visualization challenges the viewer at first glance: at zero percent
            abstraction, delicate vector coastlines anchor {INFRA_NODES.length} hyperscale data center
            clusters ({totalGW} GW aggregate power) and {FIBER_CORRIDORS.length} submarine and terrestrial corridors across a Winkel Tripel
            or Polar Azimuthal projection. As you advance the Spatial Abstraction control toward
            one hundred percent, geopolitical continents dissolve entirely.
          </p>

          <blockquote className="py-6 my-8 border-y border-stone-300 dark:border-white/[0.1] font-editorial italic text-2xl text-stone-900 dark:text-slate-100 leading-snug">
            “In planetary-scale infrastructure, distance is no longer measured in kilometers—it
            is measured in light-speed delay, subsea landing concentration, and megawatts of
            firm power.”
          </blockquote>

          <p>
            What remains on the canvas is a celestial constellation of capital,
            electricity, and glass: Northern Virginia, Frankfurt, Singapore, Tokyo, and
            Dublin act as gravitational wells pulling parallel optical ribbons into dense,
            luminous filaments. Switch between projections, isolate individual hyperscalers,
            or frame the plate in 4:5 or 1.91:1 to publish an editorial artifact worthy of
            technical leadership on LinkedIn.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-200 dark:border-white/[0.08] flex items-center justify-between gap-4">
          <div className="text-xs text-stone-500 dark:text-slate-500">
            Dataset: {INFRA_NODES.length} Global Regions · {FIBER_CORRIDORS.length} Fiber Corridors · Subsea & Cloud Topologies
          </div>
          <button
            onClick={onReturnCanvas}
            className="px-4 py-2 text-xs font-medium bg-stone-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-md hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Return to Canvas
          </button>
        </div>
      </article>
    </div>
  );
};
