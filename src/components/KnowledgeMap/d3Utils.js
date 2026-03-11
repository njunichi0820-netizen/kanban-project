import * as d3 from 'd3';
import { RAW_DATA } from '../../data/rawMapData';

// ── Utility functions (from knowledge-map-6lv.html) ──
const rgba = (hex, a) => {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lin = (k, k0, k1, v0, v1) => v0 + (v1 - v0) * clamp((k - k0) / (k1 - k0), 0, 1);

export { rgba, clamp, lin };

// ── Path-based node ID helper ──
export function getNodeId(d) {
  return d.ancestors().reverse().slice(1).map(a => a.data.name).join('::');
}

// ── QCDE mode data transformation ──
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
      if (!lv2.children || lv2.children.length === 0) {
        groups[key].children.push({
          name: lv2.name, parentLabel: parentShort,
          fullName: `${parentShort} › ${key}`,
          color: qcdeColors[key] || lv2.color, value: 1,
        });
      }
    });
  });
  Object.values(groups).forEach(g => {
    const col = g.color;
    const paint = arr => { if (!arr) return; arr.forEach(c => { c.color = col; if (c.children) paint(c.children); }); };
    paint(g.children);
  });
  const children = Object.values(groups).filter(g => g.children.length > 0);
  return { name: "SPR テーマ企画連鎖", children };
}

/**
 * buildMap — D3 circle packing build (ported from knowledge-map-6lv.html)
 * DO NOT MODIFY the core logic (glow effect, label stroke colors, hit areas)
 * @param {Object} params
 * @param {d3.Selection} params.gAll - The <g> group to draw into
 * @param {number} params.W - Container width
 * @param {number} params.H - Container height
 * @param {string} params.mapMode - 'full' or 'skip'
 * @param {Set} params.completedNodeIds - Set of completed node IDs
 * @param {Set} params.burningTaskNodeIds - Set of node IDs with burning tasks
 * @param {Function} params.onNodeClick - Click handler
 * @param {Function} params.onNodeOver - Hover handler
 * @param {Function} params.onNodeOut - Mouse out handler
 * @returns {{ mapNodes, ngs }} - References for morph
 */
export function buildMap({ gAll, W, H, mapMode, onNodeClick, onNodeOver, onNodeOut }) {
  const sz = Math.min(W, H) * 0.93;
  const root = d3.hierarchy(getMapData(mapMode))
    .sum(d => d.value || (d.children ? 0 : 1))
    .sort((a, b) => b.value - a.value);
  d3.pack().size([sz, sz]).padding(d => d.depth < 2 ? 10 : d.depth < 4 ? 6 : 3)(root);
  const mapNodes = root.descendants();
  const half = sz / 2;
  mapNodes.forEach(d => { d.cx = d.x - half; d.cy = d.y - half; });
  gAll.selectAll("*").remove();
  const ngs = gAll.selectAll(".ng")
    .data([...mapNodes].sort((a, b) => a.depth - b.depth))
    .join("g").attr("class", "ng")
    .attr("transform", d => `translate(${d.cx},${d.cy})`)
    .style("cursor", d => d.depth ? "pointer" : "default");

  // Circle with glow effect for depth 1
  ngs.each(function (d) {
    const g = d3.select(this);
    if (d.depth === 1) {
      g.append("circle").attr("class", "nc-glow").attr("r", d.r + 2)
        .style("fill", "none").style("stroke", rgba(d.data.color, .08)).style("stroke-width", 4)
        .style("pointer-events", "none");
    }
    g.append("circle").attr("class", "nc").attr("r", d.r).style("pointer-events", "none");
  });

  ngs.each(function (d) {
    if (!d.depth) return;
    const g = d3.select(this);
    const isLeaf = !d.children;
    const col = d.data.color || "#6B7694";
    if (!isLeaf) {
      // Parent label — white stroke for light background
      g.append("text").attr("class", "lbl lbl-p")
        .attr("x", 0).attr("y", -d.r).attr("dy", "1.25em")
        .style("text-anchor", "middle")
        .style("font-weight", d.depth <= 2 ? "800" : "600")
        .style("fill", col)
        .style("stroke", "rgba(250,251,253,.92)")
        .style("stroke-width", "5px")
        .style("paint-order", "stroke fill")
        .text(d.data.name);
    } else {
      // Leaf label — dark text with white halo for light background
      g.append("text").attr("class", "lbl lbl-l")
        .attr("x", 0).attr("y", 0).attr("dy", "0.35em")
        .style("text-anchor", "middle").style("font-weight", "600")
        .style("fill", "#1A1F36")
        .style("stroke", "rgba(255,255,255,.85)")
        .style("stroke-width", "3px")
        .style("paint-order", "stroke fill")
        .text(d.data.name);
    }
  });

  // Hit areas for interaction
  ngs.each(function (d) {
    if (!d.depth) return;
    const g = d3.select(this);
    const hitR = d.children ? Math.min(d.r * 0.3, 20) : d.r;
    g.append("circle").attr("class", "hit").attr("r", hitR).attr("fill", "transparent")
      .on("click", (ev) => { ev.stopPropagation(); onNodeClick?.(ev, d); })
      .on("mouseover", (ev) => { ev.stopPropagation(); onNodeOver?.(ev, d, g.node()); })
      .on("mouseout", (ev) => { ev.stopPropagation(); onNodeOut?.(ev, d, g.node()); });
  });

  return { mapNodes, ngs };
}

/**
 * morph() — pixel-size-based label control (DO NOT MODIFY thresholds/lin/baseFontSize)
 */
export function morph(k, ngs) {
  if (!ngs) return;
  ngs.each(function (d) {
    const g = d3.select(this);
    if (!d.depth) { g.select(".nc").attr("fill", "none").attr("stroke", "none"); return; }
    const col = d.data.color || "#556080";
    const pixelR = d.r * k;

    // Circle styling per depth
    let fa, sa, sw;
    if (d.depth === 1) {
      fa = lin(k, .4, 2.5, .08, .02);
      sa = lin(k, .1, 2, .4, .1);
      sw = Math.max(.8, 2 / k);
      g.select(".nc-glow").style("stroke", rgba(col, lin(k, .3, 2, .06, .015))).style("stroke-width", Math.max(2, 6 / k));
    } else if (d.depth === 2) {
      fa = lin(k, .3, 2, .12, .05);
      sa = lin(k, .2, 1.5, .35, .12);
      sw = Math.max(.5, 1.5 / k);
    } else if (d.depth === 3) {
      fa = lin(k, .5, 3, .10, .04);
      sa = lin(k, .3, 2, .30, .10);
      sw = Math.max(.4, 1.2 / k);
    } else if (d.depth === 4) {
      fa = lin(k, .8, 4, .12, .06);
      sa = lin(k, .5, 3, .25, .10);
      sw = Math.max(.3, 1 / k);
    } else if (d.depth === 5) {
      fa = lin(k, 1, 5, .15, .08);
      sa = lin(k, .8, 4, .20, .10);
      sw = Math.max(.25, .8 / k);
    } else {
      // depth 6+ (leaves)
      fa = lin(k, .5, 3, .45, .75);
      sa = .6;
      sw = Math.max(.3, 1.2 / k);
    }

    g.select(".nc").attr("fill", rgba(col, fa)).attr("stroke", rgba(col, sa)).attr("stroke-width", sw);

    // ─── VISIBILITY LOGIC: pixel-size-based label hiding ───
    let nodeOpacity, labelOpacity;

    if (d.depth === 1) {
      nodeOpacity = 1;
      labelOpacity = pixelR > 30 ? 1 : lin(pixelR, 15, 30, 0, 1);
    } else if (d.depth === 2) {
      nodeOpacity = lin(pixelR, 5, 15, 0, 1);
      labelOpacity = pixelR > 25 ? lin(k, .4, 1, 0, 1) : 0;
    } else if (d.depth === 3) {
      nodeOpacity = lin(pixelR, 4, 12, 0, 1);
      labelOpacity = pixelR > 22 ? lin(k, .5, 1.5, 0, 1) : 0;
    } else if (d.depth === 4) {
      nodeOpacity = lin(pixelR, 3, 10, 0, 1);
      labelOpacity = pixelR >= 20 ? 1 : 0;
    } else if (d.depth === 5) {
      nodeOpacity = lin(pixelR, 3, 8, 0, 1);
      labelOpacity = pixelR >= 18 ? 1 : 0;
    } else {
      // depth 6+ (leaves)
      nodeOpacity = lin(pixelR, 3, 10, 0, 1);
      labelOpacity = pixelR >= 20 ? 1 : 0;
    }

    g.attr("opacity", nodeOpacity);
    g.select(".hit").style("pointer-events", nodeOpacity < 0.1 ? "none" : "all");

    // Font size: scale inversely with zoom
    const baseFontSize = d.depth <= 1 ? 18 : d.depth === 2 ? 15 : d.depth === 3 ? 13 : d.depth === 4 ? 12 : 11;
    const fs = baseFontSize / k;
    const maxFontPx = d.r * (d.children ? 0.4 : 1.6);
    const effectiveLabelOp = fs > maxFontPx ? 0 : labelOpacity;

    g.selectAll(".lbl")
      .style("font-size", `${fs}px`)
      .attr("opacity", effectiveLabelOp)
      .style("transition", "opacity 0.15s ease");

    g.selectAll(".lbl-p").style("stroke-width", `${Math.min(fs * .3, 6)}px`);
    g.selectAll(".lbl-l").style("stroke-width", `${Math.min(fs * .25, 4)}px`);
  });
}

/**
 * Apply completion/burning overlays using path-based node IDs
 */
export function applyStatusOverlay(ngs, completedNodeIds, burningTaskNodeIds) {
  if (!ngs) return;
  ngs.each(function(d) {
    const g = d3.select(this);
    g.selectAll('.status-overlay, .status-ring').remove();
    if (!d.depth) return;

    const nodeId = getNodeId(d);
    const isLeaf = !d.children;
    const isCompleted = completedNodeIds?.has(nodeId);
    const isBurning = burningTaskNodeIds?.has(nodeId);

    if (isCompleted) {
      // Fill with green - insert BEFORE hit circle
      g.insert('circle', '.hit')
        .attr('class', 'status-overlay')
        .attr('r', d.r * 0.85)
        .style('fill', isLeaf ? 'rgba(16,185,129,0.45)' : 'rgba(16,185,129,0.15)')
        .style('stroke', '#10B981')
        .style('stroke-width', isLeaf ? 2 : 1.5)
        .style('stroke-dasharray', isLeaf ? 'none' : '4,2')
        .style('pointer-events', 'none');
    }

    if (isBurning) {
      g.insert('circle', '.hit')
        .attr('class', 'status-ring burning-ring')
        .attr('r', d.r + 2)
        .style('fill', 'none')
        .style('stroke', '#EF4444')
        .style('stroke-width', 2)
        .style('pointer-events', 'none');
    }
  });
}

/**
 * Apply filter highlight — dim non-matching nodes
 */
export function applyFilterHighlight(ngs, matchingIds) {
  if (!ngs) return;
  if (!matchingIds || matchingIds.size === 0) {
    // No filter: show all
    ngs.each(function() { d3.select(this).style('opacity', null); });
    return;
  }
  ngs.each(function(d) {
    const nodeId = getNodeId(d);
    // Show node if it matches OR any ancestor matches
    const ancestorIds = d.ancestors().map(a => getNodeId(a));
    const matches = matchingIds.has(nodeId) || ancestorIds.some(id => matchingIds.has(id));
    d3.select(this).style('opacity', matches || d.depth === 0 ? 1 : 0.1);
  });
}

/**
 * Flash a node by nodeId (highlight animation for newly added nodes)
 */
export function flashNode(ngs, nodeId) {
  if (!ngs) return;
  ngs.each(function(d) {
    if (getNodeId(d) === nodeId) {
      const g = d3.select(this);
      g.select('.nc')
        .style('fill', 'rgba(79,108,247,0.6)')
        .transition().duration(800)
        .style('fill', null);
    }
  });
}

/**
 * Zoom to a specific node
 */
export function zoomToNode(svg, zoom, d, W, H) {
  const sc = clamp(Math.min(W, H) * .38 / d.r, .12, 10);
  svg.transition().duration(700).ease(d3.easeCubicInOut)
    .call(zoom.transform, d3.zoomIdentity.translate(W / 2 - sc * d.cx, H / 2 - sc * d.cy).scale(sc));
}
