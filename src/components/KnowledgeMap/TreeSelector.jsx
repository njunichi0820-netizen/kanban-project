import { useState, useMemo } from 'react';

export default function TreeSelector({ mapNodes, value, onChange }) {
  const [expandedLevels, setExpandedLevels] = useState({});

  // Build cascade: for each level, filter by parent selection
  const levels = useMemo(() => {
    const maxLevel = Math.max(...mapNodes.map(n => n.level));
    const result = [];
    for (let i = 0; i <= maxLevel; i++) {
      result.push(mapNodes.filter(n => n.level === i));
    }
    return result;
  }, [mapNodes]);

  // Current selection path
  const selectedNode = mapNodes.find(n => n.id === value);
  const selectionPath = useMemo(() => {
    if (!selectedNode) return {};
    const path = {};
    let current = selectedNode;
    while (current) {
      path[current.level] = current.id;
      current = current.parentId ? mapNodes.find(n => n.id === current.parentId) : null;
    }
    return path;
  }, [selectedNode, mapNodes]);

  const handleLevelChange = (level, nodeId) => {
    if (nodeId) {
      onChange(nodeId);
    } else {
      // Find parent at level-1
      const parentId = selectionPath[level - 1] || null;
      onChange(parentId);
    }
  };

  // Get children at each level based on selection
  const getNodesForLevel = (level) => {
    if (level === 0) return levels[0] || [];
    const parentId = selectionPath[level - 1];
    if (!parentId) return [];
    return mapNodes.filter(n => n.level === level && n.parentId === parentId);
  };

  const maxLevelToShow = useMemo(() => {
    let max = 0;
    for (let i = 0; i < levels.length; i++) {
      if (selectionPath[i]) max = i + 1;
    }
    return Math.min(max + 1, levels.length);
  }, [selectionPath, levels]);

  const levelLabels = ['上位項目', 'QCDE分類', '要件項目', '技術確認項目', '因子', '水準'];

  return (
    <div className="space-y-2">
      {Array.from({ length: maxLevelToShow }, (_, i) => {
        const nodesAtLevel = getNodesForLevel(i);
        if (nodesAtLevel.length === 0 && i > 0) return null;
        return (
          <div key={i}>
            <label className="block text-[10px] font-bold text-gray-400 mb-0.5">
              Lv{i + 1}: {levelLabels[i] || `レベル${i + 1}`}
            </label>
            <select
              value={selectionPath[i] || ''}
              onChange={(e) => handleLevelChange(i, e.target.value || null)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">-- 選択 --</option>
              {nodesAtLevel.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        );
      })}

      {selectedNode && (
        <div className="text-[10px] text-indigo-500 font-medium">
          選択: {selectedNode.name} (Lv{selectedNode.level})
        </div>
      )}
    </div>
  );
}
