import { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { buildMap, morph, applyStatusOverlay, applyFilterHighlight, flashNode, zoomToNode, getNodeId } from './d3Utils';

export default function CircleMap({
  mapMode = 'full',
  completedNodeIds,
  burningTaskNodeIds,
  onNodeClick,
  selectedNodeId,
  filterMatchIds,  // Set of nodeIds that match current filter
  lastAddedNodeId, // Triggers flash animation
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const gAllRef = useRef(null);
  const zoomRef = useRef(null);
  const mapNodesRef = useRef(null);
  const ngsRef = useRef(null);
  const curKRef = useRef(1);

  const rebuildMap = useCallback((W, H) => {
    const svg = d3.select(svgRef.current);
    if (!gAllRef.current) gAllRef.current = svg.append('g');
    const gAll = gAllRef.current;

    const { mapNodes, ngs } = buildMap({
      gAll, W, H, mapMode,
      onNodeClick: (ev, d) => {
        if (!d.depth) return;
        zoomToNode(svg, zoomRef.current, d, W, H);
        onNodeClick?.(d, getNodeId(d));
      },
      onNodeOver: (ev, d, gEl) => {
        if (d.children) d3.select(gEl).attr('transform', `translate(${d.cx},${d.cy}) scale(1.05)`);
      },
      onNodeOut: (ev, d, gEl) => {
        d3.select(gEl).attr('transform', `translate(${d.cx},${d.cy})`);
      },
    });

    mapNodesRef.current = mapNodes;
    ngsRef.current = ngs;

    // POST-PROCESS: Expand parent hit areas without modifying buildMap
    ngs.filter(d => d.depth > 0 && d.children).each(function(d) {
      // Replace small hit circle with larger one for parent nodes
      const g = d3.select(this);
      const existingHit = g.select('.hit');
      const newR = Math.min(d.r * 0.65, 40);
      if (existingHit.size()) {
        existingHit.attr('r', newR);
      }
    });

    morph(curKRef.current || 1, ngs);
    applyStatusOverlay(ngs, completedNodeIds, burningTaskNodeIds);
    applyFilterHighlight(ngs, filterMatchIds);

    // Build legend
    const legendEl = document.getElementById('map-legend');
    if (legendEl) {
      legendEl.innerHTML = mapNodes
        .filter(n => n.depth === 1)
        .map(n => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <div style="width:8px;height:8px;border-radius:50%;background:${n.data.color};flex-shrink:0"></div>
          <span style="font-size:10px;color:#6B7694;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis">${n.data.name}</span>
        </div>`).join('');
    }

    svg.on('click.bg', () => onNodeClick?.(null, null));
  }, [mapMode, completedNodeIds, burningTaskNodeIds, filterMatchIds, onNodeClick]);

  // Initial build & mode change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const svg = d3.select(svgRef.current);
    const W = container.clientWidth;
    const H = container.clientHeight;

    if (!zoomRef.current) {
      zoomRef.current = d3.zoom().scaleExtent([0.05, 12])
        .on('zoom', ev => {
          gAllRef.current?.attr('transform', ev.transform);
          curKRef.current = ev.transform.k;
          morph(curKRef.current, ngsRef.current);
        });
      svg.call(zoomRef.current).on('dblclick.zoom', null);
      svg.on('mousedown', () => svg.classed('drag', true))
         .on('mouseup mouseleave', () => svg.classed('drag', false));
    }

    rebuildMap(W, H);
    svg.call(zoomRef.current.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(1));
  }, [mapMode, rebuildMap]);

  // Status overlay updates
  useEffect(() => {
    applyStatusOverlay(ngsRef.current, completedNodeIds, burningTaskNodeIds);
  }, [completedNodeIds, burningTaskNodeIds]);

  // Filter highlight updates
  useEffect(() => {
    applyFilterHighlight(ngsRef.current, filterMatchIds);
  }, [filterMatchIds]);

  // Flash newly added node
  useEffect(() => {
    if (lastAddedNodeId) flashNode(ngsRef.current, lastAddedNodeId);
  }, [lastAddedNodeId]);

  // Resize
  useEffect(() => {
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const c = containerRef.current;
        if (!c) return;
        rebuildMap(c.clientWidth, c.clientHeight);
      }, 200);
    };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(timer); window.removeEventListener('resize', onResize); };
  }, [rebuildMap]);

  const doZoom = (factor) => d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, factor);
  const doReset = () => {
    const c = containerRef.current;
    if (!c) return;
    d3.select(svgRef.current).transition().duration(650).ease(d3.easeCubicInOut)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(c.clientWidth / 2, c.clientHeight / 2).scale(1));
  };

  return (
    <div ref={containerRef} className="relative flex-1 bg-[#FAFBFD] overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(79,108,247,.04) 1px,transparent 0)', backgroundSize: '32px 32px' }}
    >
      <svg ref={svgRef} className="w-full h-full" style={{ cursor: 'grab' }} />

      {/* Level guide - top center */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 border border-gray-200 rounded-full px-3 py-1.5 shadow-sm z-10">
        {[
          { lv: 1, label: '上位項目', size: 16, opacity: 'opacity-100' },
          { lv: 2, label: 'QCDE', size: 13, opacity: 'opacity-80' },
          { lv: 3, label: '要件', size: 11, opacity: 'opacity-70' },
          { lv: 4, label: '技術確認', size: 9, opacity: 'opacity-60' },
          { lv: 5, label: '因子', size: 7, opacity: 'opacity-50' },
          { lv: 6, label: '水準', size: 6, opacity: 'opacity-40' },
        ].map(l => (
          <div key={l.lv} className="flex items-center gap-1">
            <div className={`rounded-full bg-indigo-400 ${l.opacity}`} style={{ width: l.size, height: l.size }} />
            <span className="text-[9px] text-gray-400 hidden md:block">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-16 left-3 md:bottom-6 md:left-6 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm z-10 max-w-[180px]">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">凡例</div>
        <div id="map-legend" className="space-y-0.5" />
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
            <div className="w-3 h-3 rounded-full bg-emerald-400 opacity-50" />完了
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
            <div className="w-3 h-3 rounded-full bg-red-400 opacity-70" />炎上
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-3 md:right-6 flex flex-col gap-1.5 z-10">
        <button onClick={() => doZoom(1.4)} className="w-9 h-9 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-500 text-lg transition-colors">+</button>
        <button onClick={() => doZoom(0.72)} className="w-9 h-9 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-500 text-lg transition-colors">−</button>
        <button onClick={doReset} className="w-9 h-9 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-500 text-sm transition-colors">⌂</button>
      </div>

      <style>{`
        .burning-ring { animation: pulse-ring 1.5s ease-in-out infinite; }
        @keyframes pulse-ring { 0%,100%{stroke-opacity:1} 50%{stroke-opacity:0.3} }
        svg .drag { cursor: grabbing !important; }
        .lbl { font-family: 'DM Sans','Noto Sans JP',sans-serif; pointer-events: none; }
      `}</style>
    </div>
  );
}
