import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { RAW_DATA } from '../../data/rawMapData';
import { getNodeId } from './d3Utils';

const DEPTH_COLORS = ['#6366F1', '#4F6CF7', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];

function rgba(hex, a) {
  if (!hex || hex[0] !== '#') return `rgba(107,118,148,${a})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function getMapData(mode) {
  if (mode === 'full') return RAW_DATA;
  const qcdeColors = { "Q:品質": "#4F6CF7", "C:コスト": "#14B8A6", "D:設備": "#10B981", "M:管理": "#F59E0B" };
  const groups = {};
  RAW_DATA.children.forEach(lv1 => {
    const parentShort = lv1.name;
    (lv1.children || []).forEach(lv2 => {
      const key = lv2.name;
      if (!groups[key]) groups[key] = { name: key, color: qcdeColors[key] || lv2.color || lv1.color, children: [] };
      (lv2.children || []).forEach(lv3 => {
        groups[key].children.push({
          ...lv3, name: lv3.name, parentLabel: parentShort,
          fullName: `${parentShort} › ${key} › ${lv3.name}`,
          color: qcdeColors[key] || lv2.color || lv1.color,
          children: lv3.children ? JSON.parse(JSON.stringify(lv3.children)) : undefined,
          value: lv3.value,
        });
      });
    });
  });
  const children = Object.values(groups).filter(g => g.children.length > 0);
  return { name: "SPR テーマ企画連鎖", children };
}

// Normal arc fill (never green — completed uses separate overlay)
function getArcFill(d) {
  const col = d.data.color || DEPTH_COLORS[d.depth] || '#6B7694';
  if (!d.children) return rgba(col, 0.5 + d.depth * 0.04);
  return rgba(col, 0.12 + d.depth * 0.06);
}

function arcVisible(d) {
  return d.y1 > 0 && d.y0 >= 0 && d.x1 > d.x0 + 0.001;
}

function posFromAngle(x0, x1, y0, y1) {
  const angle = (x0 + x1) / 2;
  const r = (y0 + y1) / 2;
  return { x: r * Math.cos(angle - Math.PI / 2), y: r * Math.sin(angle - Math.PI / 2) };
}

export default function SunburstMap({
  mapMode = 'full',
  treeData: externalTreeData,
  completedNodeIds,
  burningTaskNodeIds,
  onNodeClick,
  selectedNodeId,
  filterMatchIds,
  lastAddedNodeId,
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const stateRef = useRef({});
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [tooltip, setTooltip] = useState(null);

  // Always up-to-date props for D3 event callbacks
  const propsRef = useRef({});
  propsRef.current = { completedNodeIds, burningTaskNodeIds, filterMatchIds, selectedNodeId, onNodeClick };

  // ══════════════════════════════════════════════════════
  // BUILD: only when mapMode or treeData changes
  // ══════════════════════════════════════════════════════
  const buildSunburst = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W === 0 || H === 0) return;
    const radius = Math.min(W, H) / 2 * 0.92;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `${-W / 2} ${-H / 2} ${W} ${H}`);

    svg.append('defs');

    const data = mapMode === 'full' && externalTreeData ? externalTreeData : getMapData(mapMode);
    const root = d3.hierarchy(data)
      .sum(d => d.value || (d.children ? 0 : 1))
      .sort((a, b) => b.value - a.value);

    d3.partition().size([2 * Math.PI, radius])(root);

    root.each(d => { if (!d.data.color && d.parent) d.data.color = d.parent.data.color; });
    root.each(d => { d.current = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 }; });

    const g = svg.append('g').attr('class', 'sunburst-g');

    const arc = d3.arc()
      .startAngle(d => d.x0).endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.004))
      .padRadius(radius / 3)
      .innerRadius(d => d.y0)
      .outerRadius(d => Math.max(d.y0, d.y1 - 1));

    // ── Arcs ──
    const allDesc = root.descendants().filter(d => d.depth > 0);
    const paths = g.selectAll('path.arc')
      .data(allDesc).join('path')
      .attr('class', 'arc')
      .attr('d', d => arc(d.current))
      .attr('fill', d => getArcFill(d))
      .attr('stroke', d => rgba(d.data.color || '#6B7694', 0.25))
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer');

    // ── Completed overlays: white semi-transparent wash (grayed-out look) ──
    const completedOverlays = g.selectAll('path.done-overlay')
      .data(allDesc).join('path')
      .attr('class', 'done-overlay')
      .attr('d', d => arc(d.current))
      .attr('fill', 'rgba(255,255,255,0.65)')
      .attr('stroke', 'none')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // ── Completed badge: large dark "✓" ──
    const checkMarks = g.selectAll('text.check-mark')
      .data(allDesc).join('text')
      .attr('class', 'check-mark')
      .attr('transform', d => { const p = posFromAngle(d.current.x0, d.current.x1, d.current.y0, d.current.y1); return `translate(${p.x},${p.y})`; })
      .attr('text-anchor', 'middle').attr('dy', '0.38em')
      .style('font-size', d => `${Math.max(10, Math.min(22, (d.current.y1 - d.current.y0) * 0.45))}px`)
      .style('fill', '#1E40AF').style('font-weight', '900')
      .style('pointer-events', 'none').style('opacity', 0)
      .text('✓');

    // ── Burning ring ──
    const burningOverlays = g.selectAll('path.burn-overlay')
      .data(allDesc).join('path')
      .attr('class', 'burn-overlay burning-ring')
      .attr('d', d => d3.arc().startAngle(d.current.x0).endAngle(d.current.x1)
        .innerRadius(d.current.y1 - 1).outerRadius(d.current.y1 + 3)(d.current))
      .attr('fill', 'rgba(239,68,68,0.25)')
      .attr('stroke', '#EF4444').attr('stroke-width', 1.5)
      .style('pointer-events', 'none').style('opacity', 0);

    // ── Labels: horizontal, NO stroke/outline ──
    const labels = g.selectAll('text.lbl')
      .data(allDesc).join('text')
      .attr('class', 'lbl')
      .attr('transform', d => { const p = posFromAngle(d.current.x0, d.current.x1, d.current.y0, d.current.y1); return `translate(${p.x},${p.y})`; })
      .attr('text-anchor', 'middle').attr('dy', '0.35em')
      .style('font-size', d => `${Math.max(7, Math.min(11, (d.current.y1 - d.current.y0) * 0.18))}px`)
      .style('font-weight', d => d.depth <= 2 ? '700' : '500')
      .style('fill', '#374151')
      .style('pointer-events', 'none')
      .each(function(d) {
        const span = (d.current.x1 - d.current.x0) * (d.current.y0 + d.current.y1) / 2;
        if (span < 12) { d3.select(this).text(''); return; }
        d3.select(this).text(truncate(d.data.name, Math.max(2, Math.floor(span / 6))));
      });

    // ── Hover ──
    paths
      .on('mouseover', (ev, d) => {
        const nodeId = getNodeId(d);
        const trail = d.ancestors().reverse().slice(1).map(a => a.data.name).join(' › ');
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({ x: ev.clientX - rect.left, y: ev.clientY - rect.top - 10, name: d.data.name, trail, depth: d.depth,
          isCompleted: propsRef.current.completedNodeIds?.has(nodeId),
          isBurning: propsRef.current.burningTaskNodeIds?.has(nodeId) });
        d3.select(ev.currentTarget).attr('stroke-width', 2.5).attr('stroke', d.data.color || '#4F6CF7');
      })
      .on('mousemove', (ev) => {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip(prev => prev ? { ...prev, x: ev.clientX - rect.left, y: ev.clientY - rect.top - 10 } : null);
      })
      .on('mouseout', (ev, d) => {
        setTooltip(null);
        const sel = propsRef.current.selectedNodeId === getNodeId(d);
        d3.select(ev.currentTarget)
          .attr('stroke-width', sel ? 2.5 : 0.5)
          .attr('stroke', sel ? '#4F6CF7' : rgba(d.data.color || '#6B7694', 0.25));
      });

    // ── Center ──
    const innerR = root.children ? root.children[0].y0 : radius * 0.15;
    const centerCircle = g.append('circle').attr('class', 'center-circle')
      .attr('r', innerR).attr('fill', 'rgba(255,255,255,0.97)')
      .attr('stroke', '#E5E7EB').attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('click', (ev) => {
        ev.stopPropagation();
        const cur = stateRef.current.currentNode;
        if (cur && cur.parent) {
          stateRef.current.drillTo(cur.parent);
          if (cur.parent.depth === 0) propsRef.current.onNodeClick?.(null, null);
          else propsRef.current.onNodeClick?.(cur.parent, getNodeId(cur.parent));
        }
      });
    const centerLabel = g.append('text').attr('class', 'center-label')
      .attr('text-anchor', 'middle').attr('dy', '-0.1em')
      .style('font-size', '11px').style('font-weight', '700').style('fill', '#4B5563')
      .style('pointer-events', 'none').text(truncate(root.data.name, 14));
    const centerHint = g.append('text').attr('class', 'center-hint')
      .attr('text-anchor', 'middle').attr('dy', '1.4em')
      .style('font-size', '8px').style('fill', '#9CA3AF')
      .style('pointer-events', 'none').text('');

    // ── Click: select leaf, drill into parent ──
    paths.on('click', (ev, d) => {
      ev.stopPropagation();
      const nodeId = getNodeId(d);
      propsRef.current.onNodeClick?.(d, nodeId);
      if (d.children) stateRef.current.drillTo(d);
    });

    svg.on('click.bg', () => propsRef.current.onNodeClick?.(null, null));

    // ══════════════════════════════════════
    // DRILL function (with animated transition)
    // ══════════════════════════════════════
    function drillTo(p) {
      stateRef.current.currentNode = p;
      const trail = p.ancestors().reverse();
      setBreadcrumb(trail.map(d => ({ name: d.data.name, node: d, depth: d.depth })));

      const x0 = p.x0, xSpan = (p.x1 - p.x0) || 1, y0 = p.y0;
      root.each(d => {
        d.target = {
          x0: Math.max(0, Math.min(2 * Math.PI, (d.x0 - x0) / xSpan * 2 * Math.PI)),
          x1: Math.max(0, Math.min(2 * Math.PI, (d.x1 - x0) / xSpan * 2 * Math.PI)),
          y0: Math.max(0, d.y0 - y0),
          y1: Math.max(0, d.y1 - y0),
        };
      });

      const t = g.transition().duration(650).ease(d3.easeCubicInOut);

      // Arc transition
      paths.transition(t)
        .tween('data', d => { const i = d3.interpolate(d.current, d.target); return t => { d.current = i(t); }; })
        .attrTween('d', d => () => arc(d.current))
        .style('opacity', d => arcVisible(d.target) ? 1 : 0);

      // Completed overlay transition
      completedOverlays.transition(t)
        .attrTween('d', d => () => arc(d.current))
        .style('opacity', d => {
          if (!arcVisible(d.target)) return 0;
          return propsRef.current.completedNodeIds?.has(getNodeId(d)) ? 1 : 0;
        });

      // Checkmark transition
      checkMarks.transition(t)
        .attrTween('transform', d => () => { const p = posFromAngle(d.current.x0, d.current.x1, d.current.y0, d.current.y1); return `translate(${p.x},${p.y})`; })
        .style('opacity', d => {
          if (!arcVisible(d.target)) return 0;
          return propsRef.current.completedNodeIds?.has(getNodeId(d)) ? 1 : 0;
        });

      // Burning overlay transition
      burningOverlays.transition(t)
        .attrTween('d', d => () => d3.arc().startAngle(d.current.x0).endAngle(d.current.x1)
          .innerRadius(d.current.y1 - 1).outerRadius(d.current.y1 + 3)(d.current))
        .style('opacity', d => {
          if (!arcVisible(d.target)) return 0;
          return propsRef.current.burningTaskNodeIds?.has(getNodeId(d)) ? 1 : 0;
        });

      // Label transition
      labels.transition(t)
        .attrTween('transform', d => () => { const p = posFromAngle(d.current.x0, d.current.x1, d.current.y0, d.current.y1); return `translate(${p.x},${p.y})`; })
        .style('opacity', d => {
          if (!arcVisible(d.target)) return 0;
          return (d.target.x1 - d.target.x0) * (d.target.y0 + d.target.y1) / 2 >= 12 ? 1 : 0;
        })
        .on('end', function(d) {
          const span = (d.current.x1 - d.current.x0) * (d.current.y0 + d.current.y1) / 2;
          if (span < 12) { d3.select(this).text(''); return; }
          d3.select(this).text(truncate(d.data.name, Math.max(2, Math.floor(span / 6))));
        });

      // Center transition
      const newR = p.depth === 0 ? innerR : Math.max((p.children?.[0]?.target?.y0 || radius * 0.08), radius * 0.06);
      centerCircle.transition(t).attr('r', newR);
      centerLabel.text(p.depth === 0 ? truncate(root.data.name, 14) : truncate(p.data.name, 14));
      centerHint.text(p.depth === 0 ? '' : '↩ 戻る');
    }

    // ── Zoom ──
    const zoomBehavior = d3.zoom().scaleExtent([0.3, 5])
      .on('zoom', (ev) => { g.attr('transform', ev.transform); });
    svg.call(zoomBehavior).on('dblclick.zoom', null);

    // Store D3 refs
    stateRef.current = {
      root, currentNode: root, paths, labels, completedOverlays, checkMarks, burningOverlays,
      arc, g, svg, zoomBehavior, centerCircle, centerLabel, centerHint, innerR, radius, drillTo,
    };

    setBreadcrumb([{ name: root.data.name, node: root, depth: 0 }]);
  }, [mapMode, externalTreeData]); // Only rebuild on structural changes!

  // ══════════════════════════════════════════════════════
  // OVERLAY EFFECTS: update visuals without rebuilding
  // ══════════════════════════════════════════════════════

  // Completed overlay
  useEffect(() => {
    const s = stateRef.current;
    if (!s.completedOverlays) return;
    s.completedOverlays.style('opacity', d => {
      if (!arcVisible(d.current)) return 0;
      return completedNodeIds?.has(getNodeId(d)) ? 1 : 0;
    });
    s.checkMarks?.style('opacity', d => {
      if (!arcVisible(d.current)) return 0;
      return completedNodeIds?.has(getNodeId(d)) ? 1 : 0;
    });
  }, [completedNodeIds]);

  // Burning overlay
  useEffect(() => {
    const s = stateRef.current;
    if (!s.burningOverlays) return;
    s.burningOverlays.style('opacity', d => {
      if (!arcVisible(d.current)) return 0;
      return burningTaskNodeIds?.has(getNodeId(d)) ? 1 : 0;
    });
  }, [burningTaskNodeIds]);

  // Selection highlight
  useEffect(() => {
    const s = stateRef.current;
    if (!s.paths) return;
    s.paths.each(function(d) {
      const sel = selectedNodeId === getNodeId(d);
      d3.select(this)
        .attr('stroke-width', sel ? 2.5 : 0.5)
        .attr('stroke', sel ? '#4F6CF7' : rgba(d.data.color || '#6B7694', 0.25));
    });
  }, [selectedNodeId]);

  // Filter dimming
  useEffect(() => {
    const s = stateRef.current;
    if (!s.paths) return;
    if (!filterMatchIds || filterMatchIds.size === 0) {
      s.paths.style('opacity', d => arcVisible(d.current) ? 1 : 0);
      return;
    }
    s.paths.style('opacity', d => {
      if (!arcVisible(d.current)) return 0;
      const nodeId = getNodeId(d);
      const ancestorIds = d.ancestors().map(a => getNodeId(a));
      return filterMatchIds.has(nodeId) || ancestorIds.some(id => filterMatchIds.has(id)) ? 1 : 0.1;
    });
  }, [filterMatchIds]);

  // Flash new node
  useEffect(() => {
    const s = stateRef.current;
    if (!s.paths || !lastAddedNodeId) return;
    s.paths.filter(d => getNodeId(d) === lastAddedNodeId)
      .attr('fill', 'rgba(79,108,247,0.8)')
      .attr('stroke', '#4F6CF7').attr('stroke-width', 3)
      .transition().duration(800)
      .attr('fill', d => getArcFill(d))
      .attr('stroke', d => rgba(d.data.color || '#6B7694', 0.25))
      .attr('stroke-width', 0.5);
  }, [lastAddedNodeId]);

  // ══════════════════════════════════════════════════════
  // LIFECYCLE
  // ══════════════════════════════════════════════════════
  useEffect(() => { buildSunburst(); }, [buildSunburst]);

  useEffect(() => {
    let timer;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(buildSunburst, 250); };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(timer); window.removeEventListener('resize', onResize); };
  }, [buildSunburst]);

  // Breadcrumb click → drill to that node (NOT rebuild)
  const handleBreadcrumbClick = useCallback((item) => {
    const s = stateRef.current;
    if (!s.drillTo || !item.node) return;
    s.drillTo(item.node);
    if (item.node.depth === 0) propsRef.current.onNodeClick?.(null, null);
    else propsRef.current.onNodeClick?.(item.node, getNodeId(item.node));
  }, []);

  // Reset to root
  const handleReset = useCallback(() => {
    const s = stateRef.current;
    if (!s.drillTo || !s.root) return;
    s.drillTo(s.root);
    propsRef.current.onNodeClick?.(null, null);
    if (s.svg && s.zoomBehavior) {
      s.svg.transition().duration(400).call(s.zoomBehavior.transform, d3.zoomIdentity);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 bg-[#FAFBFD] overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(79,108,247,.04) 1px,transparent 0)', backgroundSize: '32px 32px' }}
    >
      <svg ref={svgRef} className="w-full h-full" />

      {/* Tooltip — semi-transparent */}
      {tooltip && (
        <div className="absolute z-30 pointer-events-none" style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}>
          <div className="bg-gray-900/80 backdrop-blur-sm text-white rounded-lg px-3 py-2 shadow-xl text-left max-w-[280px]">
            <div className="text-[11px] font-bold leading-tight">{tooltip.name}</div>
            {tooltip.trail && <div className="text-[9px] text-gray-300 mt-0.5 leading-tight">{tooltip.trail}</div>}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-gray-400">Lv{tooltip.depth}</span>
              {tooltip.isCompleted && <span className="text-[9px] text-blue-300 font-bold">✓ 完了</span>}
              {tooltip.isBurning && <span className="text-[9px] text-red-400 font-bold">炎上</span>}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb — folder navigation, clickable at each level */}
      <div className="absolute top-3 left-3 md:left-4 flex items-center gap-0.5 bg-white/95 border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm z-10 max-w-[70%] overflow-x-auto">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-0.5 shrink-0">
            {i > 0 && <span className="text-gray-300 text-[10px] mx-0.5">/</span>}
            <button
              onClick={() => handleBreadcrumbClick(b)}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
                i === breadcrumb.length - 1
                  ? 'text-indigo-600 font-bold bg-indigo-50'
                  : 'text-gray-500 hover:text-indigo-500 hover:bg-gray-50'
              }`}
            >
              {i === 0 ? '🏠' : truncate(b.name, 16)}
            </button>
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 md:right-4 flex flex-col gap-0.5 bg-white/90 border border-gray-200 rounded-xl px-2.5 py-2 shadow-sm z-10">
        <div className="text-[8px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">状態</div>
        <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
          <div className="w-3 h-3 rounded-sm bg-white/80 border border-gray-300 flex items-center justify-center text-[7px] font-black text-blue-800">✓</div>
          完了
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
          <div className="w-3 h-3 rounded-sm bg-red-200 border border-red-400" />
          炎上
        </div>
      </div>

      {/* Reset button */}
      <div className="absolute bottom-4 right-3 md:right-4 flex flex-col gap-1.5 z-10">
        <button onClick={handleReset}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-500 text-sm transition-colors"
          title="ルートに戻る">⌂</button>
      </div>

      {/* Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-gray-400 bg-white/80 px-3 py-1 rounded-full border border-gray-100 z-10 select-none">
        クリック: ドリルダウン / 中心: 戻る / スクロール: ズーム
      </div>

      <style>{`
        .burning-ring { animation: pulse-ring 1.5s ease-in-out infinite; }
        @keyframes pulse-ring { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .lbl { font-family: 'DM Sans','Noto Sans JP',sans-serif; }
      `}</style>
    </div>
  );
}
