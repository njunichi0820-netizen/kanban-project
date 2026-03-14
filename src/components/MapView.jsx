import { useState, useMemo, useCallback } from 'react';
import { X, Filter } from 'lucide-react';
import SunburstMap from './KnowledgeMap/SunburstMap';
import NodeSidebar from './KnowledgeMap/NodeSidebar';
import AddNodeModal from './KnowledgeMap/AddNodeModal';
import ProgressBar from './KnowledgeMap/ProgressBar';
import ImpactPanel from './KnowledgeMap/ImpactPanel';
import { DEPTH_LABELS_FULL, DEPTH_LABELS_SKIP, PERSPECTIVES_5ME, CONSTRAINT_CATEGORIES } from '../constants/mapConstants';

export default function MapView({ mapData, tasks, onCreateTask, onCompleteTask, isMobile }) {
  const {
    mapNodes, nodeStates, setNodeState, getNodeState,
    addNode, getProgress, completedNodeIds,
    getNodesByConstraint, treeData,
  } = mapData;

  const [selectedNode, setSelectedNode] = useState(null);
  const [mapMode, setMapMode] = useState('full');
  const [addNodeModalOpen, setAddNodeModalOpen] = useState(false);
  const [impactPanelOpen, setImpactPanelOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterState, setFilterState] = useState({ perspective: null, constraint: null, completion: null, hasTask: false });
  const [lastAddedNodeId, setLastAddedNodeId] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const burningTaskNodeIds = useMemo(() => {
    const ids = new Set();
    tasks.forEach(t => { if (t.priority && t.mapNodeId) ids.add(t.mapNodeId); });
    return ids;
  }, [tasks]);

  const progress = useMemo(() => getProgress(null), [getProgress]);

  // Compute filter-matching node IDs
  const filterMatchIds = useMemo(() => {
    const { perspective, constraint, completion, hasTask } = filterState;
    const anyFilter = perspective || constraint || completion !== null || hasTask;
    if (!anyFilter) return null;

    const taskNodeIds = new Set(tasks.filter(t => t.mapNodeId).map(t => t.mapNodeId));
    const matching = new Set();

    mapNodes.forEach(n => {
      let matches = true;
      if (perspective) {
        const state = nodeStates[n.id] || {};
        matches = matches && state.perspective5ME === perspective;
      }
      if (constraint) {
        const state = nodeStates[n.id] || {};
        matches = matches && (state.constraints || []).includes(constraint);
      }
      if (completion === 'done') {
        matches = matches && !!(nodeStates[n.id]?.completed);
      } else if (completion === 'todo') {
        matches = matches && !(nodeStates[n.id]?.completed);
      }
      if (hasTask) {
        matches = matches && taskNodeIds.has(n.id);
      }
      if (matches) matching.add(n.id);
    });
    return matching;
  }, [filterState, mapNodes, nodeStates, tasks]);

  const handleNodeClick = useCallback((d, nodeId) => {
    if (!d) { setSelectedNode(null); setMobileSidebarOpen(false); return; }
    const depthLabels = mapMode === 'full' ? DEPTH_LABELS_FULL : DEPTH_LABELS_SKIP;
    setSelectedNode({
      d3Node: d,
      nodeId: nodeId || null,
      name: d.data.name,
      depth: d.depth,
      depthLabel: depthLabels[d.depth] || 'ノード',
      color: d.data.color || '#4F6CF7',
      breadcrumb: d.ancestors().reverse().slice(1).map(a => a.data.name).join(' › '),
      perspective: d.data.perspective || '',
      kpi: d.data.kpi || '',
      req: d.data.req || '',
      fullName: d.data.fullName || '',
      isLeaf: !d.children,
      childCount: d.children?.length || 0,
      children: d.children?.map(c => ({ name: c.data.name, color: c.data.color })) || [],
    });
    if (isMobile) setMobileSidebarOpen(true);
  }, [mapMode, isMobile]);

  const handleToggleComplete = useCallback((nodeId) => {
    const state = getNodeState(nodeId);
    setNodeState(nodeId, { completed: !state.completed });
    if (!state.completed) onCompleteTask?.(nodeId);
  }, [getNodeState, setNodeState, onCompleteTask]);

  const handleCreateTask = useCallback(() => {
    if (!selectedNode) return;
    onCreateTask?.({
      mapNodeId: selectedNode.nodeId,
      treePath: selectedNode.breadcrumb,
      name: selectedNode.name,
    });
  }, [selectedNode, onCreateTask]);

  const handleAddChild = useCallback((name) => {
    if (!selectedNode?.nodeId) return;
    addNode(selectedNode.nodeId, name, selectedNode.color);
    setLastAddedNodeId(null);
    setTimeout(() => setLastAddedNodeId(`${selectedNode.nodeId}::${name}`), 100);
  }, [selectedNode, addNode]);

  const handleAddSibling = useCallback((name) => {
    if (!selectedNode?.nodeId) return;
    const nodeId = selectedNode.nodeId;
    // D3 getNodeId excludes root, flat nodes include it — match both
    const currentNode = mapNodes.find(n => n.id === nodeId)
      || mapNodes.find(n => n.id.endsWith(`::${nodeId}`) && n.id.split('::').slice(1).join('::') === nodeId);
    if (!currentNode?.parentId) return;
    addNode(currentNode.parentId, name, selectedNode.color);
    setLastAddedNodeId(null);
    setTimeout(() => setLastAddedNodeId(`${currentNode.parentId}::${name}`), 100);
  }, [selectedNode, mapNodes, addNode]);

  const clearFilter = () => setFilterState({ perspective: null, constraint: null, completion: null, hasTask: false });
  const hasActiveFilter = filterState.perspective || filterState.constraint || filterState.completion !== null || filterState.hasTask;
  const activeFilterCount = [filterState.perspective, filterState.constraint, filterState.completion, filterState.hasTask].filter(Boolean).length;

  const sidebarProps = {
    node: selectedNode,
    nodeState: selectedNode?.nodeId ? getNodeState(selectedNode.nodeId) : null,
    onUpdateState: (updates) => selectedNode?.nodeId && setNodeState(selectedNode.nodeId, updates),
    onToggleComplete: () => selectedNode?.nodeId && handleToggleComplete(selectedNode.nodeId),
    onCreateTask: handleCreateTask,
    onAddChild: handleAddChild,
    onAddSibling: handleAddSibling,
    tasks: tasks.filter(t => t.mapNodeId === selectedNode?.nodeId),
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Progress bar */}
      <ProgressBar progress={progress} onImpactClick={() => setImpactPanelOpen(true)} />

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-white border-b border-gray-100 shrink-0">
        <button onClick={() => setFilterOpen(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${filterOpen || hasActiveFilter ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          <Filter size={11} />
          フィルタ
          {activeFilterCount > 0 && <span className="bg-white text-indigo-600 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">{activeFilterCount}</span>}
        </button>

        {filterOpen && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* 5M+E */}
            <select value={filterState.perspective || ''} onChange={e => setFilterState(s => ({ ...s, perspective: e.target.value || null }))}
              className="px-2 py-1 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300">
              <option value="">5M+E: すべて</option>
              {PERSPECTIVES_5ME.map(p => <option key={p.id} value={p.id}>{p.label} ({p.desc})</option>)}
            </select>
            {/* Constraint */}
            <select value={filterState.constraint || ''} onChange={e => setFilterState(s => ({ ...s, constraint: e.target.value || null }))}
              className="px-2 py-1 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300">
              <option value="">与件: すべて</option>
              {CONSTRAINT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {/* Completion */}
            <select value={filterState.completion || ''} onChange={e => setFilterState(s => ({ ...s, completion: e.target.value || null }))}
              className="px-2 py-1 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300">
              <option value="">進捗: すべて</option>
              <option value="done">完了済み</option>
              <option value="todo">未完了</option>
            </select>
            {/* Has task */}
            <button onClick={() => setFilterState(s => ({ ...s, hasTask: !s.hasTask }))}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${filterState.hasTask ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
              タスクあり
            </button>
            {hasActiveFilter && (
              <button onClick={clearFilter} className="text-[11px] text-red-400 hover:text-red-600 flex items-center gap-0.5">
                <X size={11} />クリア
              </button>
            )}
          </div>
        )}

        {/* Mode toggle right side */}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setMapMode('full')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${mapMode === 'full' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            6階層
          </button>
          <button onClick={() => setMapMode('skip')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${mapMode === 'skip' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            QCDE
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Desktop sidebar */}
        {!isMobile && <NodeSidebar {...sidebarProps} />}

        {/* Map */}
        <div className="flex-1 flex flex-col min-h-0">
          <SunburstMap
            mapMode={mapMode}
            treeData={treeData}
            completedNodeIds={completedNodeIds}
            burningTaskNodeIds={burningTaskNodeIds}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNode?.nodeId}
            filterMatchIds={filterMatchIds}
            lastAddedNodeId={lastAddedNodeId}
          />
        </div>

        {/* Mobile sidebar bottom sheet */}
        {isMobile && mobileSidebarOpen && selectedNode && (
          <div className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl z-20 max-h-[60%] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-700 truncate">{selectedNode.name}</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <NodeSidebar {...sidebarProps} />
          </div>
        )}
      </div>

      {/* Modals */}
      {addNodeModalOpen && (
        <AddNodeModal mapNodes={mapNodes}
          onAdd={(parentId, name, color) => { addNode(parentId, name, color); setAddNodeModalOpen(false); }}
          onClose={() => setAddNodeModalOpen(false)} />
      )}
      {impactPanelOpen && (
        <ImpactPanel nodeStates={nodeStates} mapNodes={mapNodes}
          getNodesByConstraint={getNodesByConstraint} onClose={() => setImpactPanelOpen(false)} />
      )}
    </div>
  );
}
