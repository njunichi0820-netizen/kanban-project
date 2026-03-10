import { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { buildMap, morph, applyStatusOverlay, zoomToNode } from './d3Utils';

export default function CircleMap({ mapMode = 'full', completedNodeIds, burningTaskNodeIds, onNodeClick, selectedNodeId }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const gAllRef = useRef(null);
  const zoomRef = useRef(null);
  const mapNodesRef = useRef(null);
  const ngsRef = useRef(null);
  const curKRef = useRef(1);

  const handleNodeClick = useCallback((ev, d) => {
    if (!d.depth) return;
    const container = containerRef.current;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    zoomToNode(d3.select(svgRef.current), zoomRef.current, d, W, H);
    onNodeClick?.(d);
  }, [onNodeClick]);

  const handleNodeOver = useCallback((ev, d, gEl) => {
    if (d.children) d3.select(gEl).attr("transform", `translate(${d.cx},${d.cy}) scale(1.05)`);
  }, []);

  const handleNodeOut = useCallback((ev, d, gEl) => {
    d3.select(gEl).attr("transform", `translate(${d.cx},${d.cy})`);
  }, []);

  // Build the map
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const svg = d3.select(svgRef.current);
    if (!gAllRef.current) {
      gAllRef.current = svg.append("g");
    }
    const gAll = gAllRef.current;

    const W = container.clientWidth;
    const H = container.clientHeight;

    if (!zoomRef.current) {
      zoomRef.current = d3.zoom().scaleExtent([0.05, 12])
        .on("zoom", ev => {
          gAll.attr("transform", ev.transform);
          curKRef.current = ev.transform.k;
          morph(curKRef.current, ngsRef.current);
        });
      svg.call(zoomRef.current).on("dblclick.zoom", null);
      svg.on("mousedown", () => svg.classed("drag", true))
        .on("mouseup mouseleave", () => svg.classed("drag", false));
    }

    const { mapNodes, ngs } = buildMap({
      gAll, W, H, mapMode,
      onNodeClick: handleNodeClick,
      onNodeOver: handleNodeOver,
      onNodeOut: handleNodeOut,
    });

    mapNodesRef.current = mapNodes;
    ngsRef.current = ngs;

    svg.call(zoomRef.current.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(1));
    morph(1, ngs);
    applyStatusOverlay(ngs, completedNodeIds, burningTaskNodeIds);

    // Click on background to deselect
    svg.on("click.bg", () => onNodeClick?.(null));

  }, [mapMode, handleNodeClick, handleNodeOver, handleNodeOut, completedNodeIds, burningTaskNodeIds, onNodeClick]);

  // Update overlays when status changes
  useEffect(() => {
    if (ngsRef.current) {
      applyStatusOverlay(ngsRef.current, completedNodeIds, burningTaskNodeIds);
    }
  }, [completedNodeIds, burningTaskNodeIds]);

  // Resize handler
  useEffect(() => {
    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const W = container.clientWidth;
        const H = container.clientHeight;
        const svg = d3.select(svgRef.current);
        const gAll = gAllRef.current;
        if (!gAll) return;

        const { mapNodes, ngs } = buildMap({
          gAll, W, H, mapMode,
          onNodeClick: handleNodeClick,
          onNodeOver: handleNodeOver,
          onNodeOut: handleNodeOut,
        });
        mapNodesRef.current = mapNodes;
        ngsRef.current = ngs;
        svg.call(zoomRef.current.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(1));
        morph(1, ngs);
        applyStatusOverlay(ngs, completedNodeIds, burningTaskNodeIds);
      }, 200);
    };
    window.addEventListener('resize', handleResize);
    return () => { clearTimeout(timer); window.removeEventListener('resize', handleResize); };
  }, [mapMode, handleNodeClick, handleNodeOver, handleNodeOut, completedNodeIds, burningTaskNodeIds]);

  // Zoom controls
  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(250).call(zoomRef.current.scaleBy, 1.4);
  };
  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(250).call(zoomRef.current.scaleBy, 0.72);
  };
  const handleZoomReset = () => {
    const container = containerRef.current;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(650).ease(d3.easeCubicInOut)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(1));
  };

  return (
    <div ref={containerRef} className="relative flex-1 bg-[#FAFBFD] overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(79,108,247,.04) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: 'grab' }}
      />

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm z-10">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">凡例</div>
        <div id="map-legend" className="space-y-1" />
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-1.5 z-10">
        <button onClick={handleZoomIn} className="w-9 h-9 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors text-lg">+</button>
        <button onClick={handleZoomOut} className="w-9 h-9 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors text-lg">−</button>
        <button onClick={handleZoomReset} className="w-9 h-9 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors text-sm">⌂</button>
      </div>

      {/* Burning pulse animation */}
      <style>{`
        .burning-ring {
          animation: pulse-ring 1.5s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0%, 100% { stroke-opacity: 1; }
          50% { stroke-opacity: 0.3; }
        }
        svg .drag { cursor: grabbing !important; }
        .lbl { font-family: 'DM Sans', 'Noto Sans JP', sans-serif; pointer-events: none; }
      `}</style>
    </div>
  );
}
