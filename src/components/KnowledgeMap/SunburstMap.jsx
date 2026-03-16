import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { RAW_DATA } from '../../data/rawMapData';
import { rgba, QCDE_COLORS } from './d3Utils';

// ── Sunburst-local utilities ──

/** Stable ID: use flat nodeId when available, fallback to ancestor path */
function getStableId(d) {
  if (d.data?.nodeId) return d.data.nodeId;
  return d.ancestors().reverse().slice(1).map(a => a.data.name).join('::');
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function arcVisible(d) {
  return d.y1 > 0 && d.y0 >= 0 && d.x1 > d.x0 + 0.001;
}

/** Cartesian midpoint of an arc segment */
function midpoint(x0, x1, y0, y1) {
  const a = (x0 + x1) / 2;
  const r = (y0 + y1) / 2;
  return { x: r * Math.cos(a - Math.PI / 2), y: r * Math.sin(a - Math.PI / 2) };
}

// ── Data helpers (sunburst-specific) ──

function paintColor(nodes, col) {
  if (!nodes) return;
  nodes.forEach(n => { n.color = col; if (n.children) paintColor(n.children, col); });
}

function getMapData(mode) {
  if (mode === 'full') return RAW_DATA;
  const groups = {};
  RAW_DATA.children.forEach(lv1 => {
    const parentShort = lv1.name;
    (lv1.children || []).forEach(lv2 => {
      const key = lv2.name;
      const col = QCDE_COLORS[key] || lv2.color || lv1.color;
      if (!groups[key]) groups[key] = { name: key, color: col, children: [] };
      (lv2.children || []).forEach(lv3 => {
        const cloned = lv3.children ? JSON.parse(JSON.stringify(lv3.children)) : undefined;
        paintColor(cloned, col);
        groups[key].children.push({
          ...lv3, name: lv3.name, parentLabel: parentShort,
          fullName: `${parentShort} › ${key} › ${lv3.name}`,
          color: col,
          children: cloned,
          value: lv3.value,
        });
      });
    });
  });
  const children = Object.values(groups).filter(g => g.children.length > 0);
  return { name: "SPR テーマ企画連鎖", children };
}

function getArcFill(d) {
  const col = d.data.color || '#6B7694';
  if (!d.children) return rgba(col, 0.5 + d.depth * 0.04);
  return rgba(col, 0.12 + d.depth * 0.06);
}

// ══════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════

export default function SunburstMap({
  mapMode = 'full',
  treeData: externalTreeData,
  completedNodeIds,
  onNodeClick,
  selectedNodeId,
  filterMatchIds,
  lastAddedNodeId,
  taskCountByNodeId,
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const stateRef = useRef({});
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [tooltip, setTooltip] = useState(null);

  const propsRef = useRef({});
  propsRef.current = { completedNodeIds, filterMatchIds, selectedNodeId, onNodeClick, taskCountByNodeId };

  // ══════════════════════════════════════════════════════
  // BUILD — only on mapMode / treeData change
  // ══════════════════════════════════════════════════════
  const buildSunburst = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W === 0 || H === 0) return;
    const radius = Math.min(W, H) / 2 * 0.92;

    // 1. Setup: SVG viewBox
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `${-W / 2} ${-H / 2} ${W} ${H}`);

    // 2. Hierarchy: d3.hierarchy + partition + color propagation
    const data = mapMode === 'full' && externalTreeData ? externalTreeData : getMapData(mapMode);
    const root = d3.hierarchy(data)
      .sum(d => d.value || (d.children ? 0 : 1))
      .sort((a, b) => b.value - a.value);

    d3.partition().size([2 * Math.PI, radius])(root);

    // 色伝播: 親の色を子に継承（Lv1の色が全子孫に統一される）
    root.each(d => {
      if (!d.data.color && d.parent) d.data.color = d.parent.data.color;
    });

    root.each(d => { d.current = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 }; });

    const g = svg.append('g').attr('class', 'sunburst-g');
    let curZoomK = 1;

    // 3. Arc paths (main arcs)
    const arc = d3.arc()
      .startAngle(d => d.x0).endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.004))
      .padRadius(radius / 3)
      .innerRadius(d => d.y0)
      .outerRadius(d => Math.max(d.y0, d.y1 - 1));

    const allDesc = root.descendants().filter(d => d.depth > 0);

    const paths = g.selectAll('path.arc')
      .data(allDesc).join('path')
      .attr('class', 'arc')
      .attr('d', d => arc(d.current))
      .attr('fill', d => getArcFill(d))
      .attr('stroke', d => rgba(d.data.color || '#6B7694', 0.25))
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer');

    // 4. Overlay layers (completed, burning, checkmarks)
    const completedOverlays = g.selectAll('path.done-overlay')
      .data(allDesc).join('path')
      .attr('class', 'done-overlay')
      .attr('d', d => arc(d.current))
      .attr('fill', 'rgba(52,211,153,0.7)')
      .attr('stroke', '#34D399')
      .attr('stroke-width', 1)
      .style('filter', 'drop-shadow(0 0 6px rgba(52,211,153,0.8)) drop-shadow(0 0 12px rgba(16,185,129,0.4))')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    const checkMarks = g.selectAll('text.check-mark')
      .data(allDesc).join('text')
      .attr('class', 'check-mark')
      .attr('transform', d => { const p = midpoint(d.current.x0, d.current.x1, d.current.y0, d.current.y1); return `translate(${p.x},${p.y})`; })
      .attr('text-anchor', 'middle').attr('dy', '0.38em')
      .style('font-size', d => `${Math.max(10, Math.min(22, (d.current.y1 - d.current.y0) * 0.45))}px`)
      .style('fill', '#059669').style('font-weight', '900')
      .style('pointer-events', 'none').style('opacity', 0)
      .text('✓');

    // 5. Labels + updateLabels()
    const labels = g.selectAll('text.lbl')
      .data(allDesc).join('text')
      .attr('class', 'lbl')
      .attr('transform', d => { const p = midpoint(d.current.x0, d.current.x1, d.current.y0, d.current.y1); return `translate(${p.x},${p.y})`; })
      .attr('text-anchor', 'middle').attr('dy', '0.35em')
      .style('font-weight', d => d.depth <= 2 ? '700' : '500')
      .style('fill', '#374151')
      .style('pointer-events', 'none');

    // 深度別の目標ピクセルサイズ (画面上px)
    const LABEL_PX = { 1: 16, 2: 14, 3: 12, 4: 11, 5: 10 };
    const LABEL_MIN_SHOW = { 1: 30, 2: 18, 3: 12, 4: 10, 5: 8 };

    function updateLabels(k) {
      labels.each(function(d) {
        const span = (d.current.x1 - d.current.x0) * (d.current.y0 + d.current.y1) / 2;
        const screenSpan = span * k;
        const el = d3.select(this);
        const minShow = LABEL_MIN_SHOW[d.depth] || 8;
        if (screenSpan < minShow || !arcVisible(d.current)) {
          el.text('').style('opacity', 0);
          return;
        }
        const targetPx = LABEL_PX[d.depth] || 10;
        const arcThickness = (d.current.y1 - d.current.y0) * k;
        // 画面上pxをtargetに近づけつつ、アーク幅の40%を超えない
        const screenPx = Math.min(targetPx, arcThickness * 0.4);
        const fs = Math.max(screenPx, 7) / k;
        el.style('font-size', `${fs}px`).style('opacity', 1);
        const maxChars = Math.max(2, Math.floor(screenSpan / (screenPx * 0.55)));
        el.text(truncate(d.data.name, maxChars));
      });

      // 中央テキストもズーム連動（初回呼び出し時は未定義のためガード）
      if (stateRef.current.centerLabel) {
        const innerRadius = stateRef.current.innerR || radius * 0.15;
        const maxSvgFs = innerRadius * 0.35;
        const centerPx = Math.min(24, Math.max(13, 18 / Math.sqrt(k)));
        const centerFs = Math.min(centerPx / k, maxSvgFs);
        stateRef.current.centerLabel.style('font-size', `${centerFs}px`);
        stateRef.current.centerHint.style('font-size', `${centerFs * 0.55}px`);
      }
    }
    updateLabels(1);

    // 6. Hover / tooltip
    paths
      .on('mouseover', (ev, d) => {
        const nodeId = getStableId(d);
        const trail = d.ancestors().reverse().slice(1).map(a => a.data.name).join(' › ');
        const rect = containerRef.current.getBoundingClientRect();
        const taskCount = propsRef.current.taskCountByNodeId?.[nodeId] || 0;
        setTooltip({ x: ev.clientX - rect.left, y: ev.clientY - rect.top - 10, name: d.data.name, trail, depth: d.depth,
          req: d.data.req || '', kpi: d.data.kpi || '', taskCount,
          isCompleted: propsRef.current.completedNodeIds?.has(nodeId) });
        d3.select(ev.currentTarget).attr('stroke-width', 2.5).attr('stroke', d.data.color || '#4F6CF7');
      })
      .on('mousemove', (ev) => {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip(prev => prev ? { ...prev, x: ev.clientX - rect.left, y: ev.clientY - rect.top - 10 } : null);
      })
      .on('mouseout', (ev, d) => {
        setTooltip(null);
        const sel = propsRef.current.selectedNodeId === getStableId(d);
        d3.select(ev.currentTarget)
          .attr('stroke-width', sel ? 2.5 : 0.5)
          .attr('stroke', sel ? '#4F6CF7' : rgba(d.data.color || '#6B7694', 0.25));
      });

    // 7. Center circle + back navigation
    const innerR = root.children ? root.children[0].y0 : radius * 0.15;
    const centerCircle = g.append('circle').attr('class', 'center-circle')
      .attr('r', innerR).attr('fill', 'rgba(255,255,255,0.97)')
      .attr('stroke', '#E5E7EB').attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .style('transition', 'fill 0.2s, stroke 0.2s')
      .on('mouseover', function() {
        d3.select(this).attr('fill', 'rgba(79,108,247,0.06)').attr('stroke', '#A5B4FC');
        centerHint.style('fill', '#6366F1');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', 'rgba(255,255,255,0.97)').attr('stroke', '#E5E7EB');
        centerHint.style('fill', '#9CA3AF');
      })
      .on('click', (ev) => {
        ev.stopPropagation();
        const cur = stateRef.current.currentNode;
        if (cur && cur.parent) {
          stateRef.current.drillTo(cur.parent);
          if (cur.parent.depth === 0) propsRef.current.onNodeClick?.(null, null);
          else propsRef.current.onNodeClick?.(cur.parent, getStableId(cur.parent));
        }
      });
    const centerLabel = g.append('text').attr('class', 'center-label')
      .attr('text-anchor', 'middle').attr('dy', '-0.1em')
      .style('font-size', '18px').style('font-weight', '700').style('fill', '#4B5563')
      .style('pointer-events', 'none').text(truncate(root.data.name, 14));
    const centerHint = g.append('text').attr('class', 'center-hint')
      .attr('text-anchor', 'middle').attr('dy', '1.4em')
      .style('font-size', '8px').style('fill', '#9CA3AF')
      .style('pointer-events', 'none').text('');

    // 8. Click → select + drill
    paths.on('click', (ev, d) => {
      ev.stopPropagation();
      const nodeId = getStableId(d);
      propsRef.current.onNodeClick?.(d, nodeId);
      if (d.children) stateRef.current.drillTo(d);
    });
    svg.on('click.bg', () => propsRef.current.onNodeClick?.(null, null));

    // 9. drillTo() function
    function drillTo(p) {
      stateRef.current.currentNode = p;
      setBreadcrumb(p.ancestors().reverse().map(d => ({ name: d.data.name, node: d, depth: d.depth })));

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

      paths.transition(t)
        .tween('data', d => { const i = d3.interpolate(d.current, d.target); return t => { d.current = i(t); }; })
        .attrTween('d', d => () => arc(d.current))
        .style('opacity', d => arcVisible(d.target) ? 1 : 0);

      completedOverlays.transition(t)
        .attrTween('d', d => () => arc(d.current))
        .style('opacity', d => !arcVisible(d.target) ? 0 : propsRef.current.completedNodeIds?.has(getStableId(d)) ? 1 : 0);

      checkMarks.transition(t)
        .attrTween('transform', d => () => { const p = midpoint(d.current.x0, d.current.x1, d.current.y0, d.current.y1); return `translate(${p.x},${p.y})`; })
        .style('opacity', d => !arcVisible(d.target) ? 0 : propsRef.current.completedNodeIds?.has(getStableId(d)) ? 1 : 0);

      labels.transition(t)
        .attrTween('transform', d => () => { const p = midpoint(d.current.x0, d.current.x1, d.current.y0, d.current.y1); return `translate(${p.x},${p.y})`; })
        .on('end', () => updateLabels(curZoomK));

      const newR = p.depth === 0 ? innerR : Math.max((p.children?.[0]?.target?.y0 || radius * 0.08), radius * 0.06);
      centerCircle.transition(t).attr('r', newR);
      centerLabel.text(p.depth === 0 ? truncate(root.data.name, 14) : truncate(p.data.name, 14));
      centerHint.text(p.depth === 0 ? '' : '↩ 戻る');
    }

    // 10. Zoom behavior
    const zoomBehavior = d3.zoom().scaleExtent([0.3, 8])
      .on('zoom', (ev) => {
        g.attr('transform', ev.transform);
        curZoomK = ev.transform.k;
        updateLabels(curZoomK);
      });
    svg.call(zoomBehavior).on('dblclick.zoom', null);

    // 11. Store refs
    stateRef.current = {
      root, currentNode: root, paths, labels, completedOverlays, checkMarks,
      arc, g, svg, zoomBehavior, centerCircle, centerLabel, centerHint, innerR, radius, drillTo, updateLabels,
      getCurZoomK: () => curZoomK,
    };

    // 初期描画時に完了・炎上状態を即反映
    const p0 = propsRef.current;
    completedOverlays.style('opacity', d => p0.completedNodeIds?.has(getStableId(d)) ? 1 : 0);
    checkMarks.style('opacity', d => p0.completedNodeIds?.has(getStableId(d)) ? 1 : 0);

    setBreadcrumb([{ name: root.data.name, node: root, depth: 0 }]);
  }, [mapMode, externalTreeData]);

  // ══════════════════════════════════════════════════════
  // OVERLAY EFFECTS
  // ══════════════════════════════════════════════════════

  // — Completion overlay sync
  useEffect(() => {
    const s = stateRef.current;
    if (!s.completedOverlays) return;
    s.completedOverlays.style('opacity', d => !arcVisible(d.current) ? 0 : completedNodeIds?.has(getStableId(d)) ? 1 : 0);
    s.checkMarks?.style('opacity', d => !arcVisible(d.current) ? 0 : completedNodeIds?.has(getStableId(d)) ? 1 : 0);
  }, [completedNodeIds]);

  // — Selection highlight sync
  useEffect(() => {
    const s = stateRef.current;
    if (!s.paths) return;
    s.paths.each(function(d) {
      const sel = selectedNodeId === getStableId(d);
      d3.select(this)
        .attr('stroke-width', sel ? 2.5 : 0.5)
        .attr('stroke', sel ? '#4F6CF7' : rgba(d.data.color || '#6B7694', 0.25));
    });
  }, [selectedNodeId]);

  // — Filter highlight sync
  useEffect(() => {
    const s = stateRef.current;
    if (!s.paths) return;
    if (!filterMatchIds || filterMatchIds.size === 0) {
      s.paths.style('opacity', d => arcVisible(d.current) ? 1 : 0);
      return;
    }
    s.paths.style('opacity', d => {
      if (!arcVisible(d.current)) return 0;
      const nodeId = getStableId(d);
      const ancestorIds = d.ancestors().map(a => getStableId(a));
      return filterMatchIds.has(nodeId) || ancestorIds.some(id => filterMatchIds.has(id)) ? 1 : 0.1;
    });
  }, [filterMatchIds]);

  // — Flash new node
  useEffect(() => {
    const s = stateRef.current;
    if (!s.paths || !lastAddedNodeId) return;
    s.paths.filter(d => getStableId(d) === lastAddedNodeId)
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

  const handleBreadcrumbClick = useCallback((item) => {
    const s = stateRef.current;
    if (!s.drillTo || !item.node) return;
    s.drillTo(item.node);
    if (item.node.depth === 0) propsRef.current.onNodeClick?.(null, null);
    else propsRef.current.onNodeClick?.(item.node, getStableId(item.node));
  }, []);

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

      {tooltip && (
        <div className="absolute z-30 pointer-events-none" style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}>
          <div className="bg-gray-900/80 backdrop-blur-sm text-white rounded-lg px-3 py-2 shadow-xl text-left max-w-[300px]">
            <div className="text-[11px] font-bold leading-tight">{tooltip.name}</div>
            {tooltip.trail && <div className="text-[9px] text-gray-300 mt-0.5 leading-tight">{tooltip.trail}</div>}
            {(tooltip.req || tooltip.kpi) && (
              <div className="mt-1 space-y-0.5">
                {tooltip.req && <div className="text-[9px] text-amber-200 leading-tight">要件: {tooltip.req}</div>}
                {tooltip.kpi && <div className="text-[9px] text-sky-200 leading-tight">KPI: {tooltip.kpi}</div>}
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-gray-400">Lv{tooltip.depth}</span>
              {tooltip.taskCount > 0 && <span className="text-[9px] text-indigo-300">タスク {tooltip.taskCount}件</span>}
              {tooltip.isCompleted && <span className="text-[9px] text-emerald-300 font-bold">✓ 完了</span>}
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 md:left-4 flex items-center gap-0.5 bg-white/95 border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm z-10 max-w-[70%] overflow-x-auto">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-0.5 shrink-0">
            {i > 0 && <span className="text-gray-300 text-[10px] mx-0.5">/</span>}
            <button onClick={() => handleBreadcrumbClick(b)}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
                i === breadcrumb.length - 1 ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-gray-500 hover:text-indigo-500 hover:bg-gray-50'
              }`}>
              {i === 0 ? '🏠' : truncate(b.name, 16)}
            </button>
          </span>
        ))}
      </div>

      <div className="absolute top-3 right-3 md:right-4 flex flex-col gap-0.5 bg-white/90 border border-gray-200 rounded-xl px-2.5 py-2 shadow-sm z-10">
        <div className="text-[8px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">状態</div>
        <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
          <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-400 flex items-center justify-center text-[7px] font-black text-emerald-600">✓</div>
          完了
        </div>
      </div>

      <div className="absolute bottom-4 right-3 md:right-4 flex flex-col gap-1.5 z-10">
        <button onClick={handleReset}
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-500 text-sm transition-colors"
          title="ルートに戻る">⌂</button>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-gray-400 bg-white/80 px-3 py-1 rounded-full border border-gray-100 z-10 select-none">
        クリック: ドリルダウン / 中心: 戻る / スクロール: ズーム
      </div>

      <style>{`
        .lbl { font-family: 'DM Sans','Noto Sans JP',sans-serif; }
      `}</style>
    </div>
  );
}
