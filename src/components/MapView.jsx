import { useState, useMemo, useCallback } from 'react';
import { Map, Plus, ChevronRight } from 'lucide-react';
import CircleMap from './KnowledgeMap/CircleMap';
import NodeSidebar from './KnowledgeMap/NodeSidebar';
import AddNodeModal from './KnowledgeMap/AddNodeModal';
import ProgressBar from './KnowledgeMap/ProgressBar';
import ImpactPanel from './KnowledgeMap/ImpactPanel';
import { DEPTH_LABELS_FULL, DEPTH_LABELS_SKIP } from '../constants/mapConstants';

export default function MapView({ mapData, tasks, onCreateTask, onCompleteTask }) {
  const {
    mapNodes, nodeStates, setNodeState, getNodeState,
    addNode, getProgress, completedNodeIds,
    getNodesByConstraint, getAncestorPath,
  } = mapData;

  const [selectedNode, setSelectedNode] = useState(null);
  const [mapMode, setMapMode] = useState('full');
  const [addNodeModalOpen, setAddNodeModalOpen] = useState(false);
  const [impactPanelOpen, setImpactPanelOpen] = useState(false);

  // Get node IDs that have burning (priority) tasks linked
  const burningTaskNodeIds = useMemo(() => {
    const ids = new Set();
    tasks.forEach(t => {
      if (t.priority && t.mapNodeId) ids.add(t.mapNodeId);
    });
    return ids;
  }, [tasks]);

  const progress = useMemo(() => getProgress(null), [getProgress]);

  const handleNodeClick = useCallback((d) => {
    if (!d) {
      setSelectedNode(null);
      return;
    }
    // Build node info from D3 node
    const ancestors = d.ancestors().reverse().slice(1).map(a => a.data.name);
    const depthLabels = mapMode === 'full' ? DEPTH_LABELS_FULL : DEPTH_LABELS_SKIP;
    setSelectedNode({
      d3Node: d,
      nodeId: d.data.nodeId || null,
      name: d.data.name,
      depth: d.depth,
      depthLabel: depthLabels[d.depth] || 'ノード',
      color: d.data.color || '#4F6CF7',
      breadcrumb: ancestors.join(' › '),
      perspective: d.data.perspective || '',
      kpi: d.data.kpi || '',
      req: d.data.req || '',
      fullName: d.data.fullName || '',
      isLeaf: !d.children,
      childCount: d.children?.length || 0,
      children: d.children?.map(c => ({ name: c.data.name, color: c.data.color })) || [],
    });
  }, [mapMode]);

  const handleToggleComplete = useCallback((nodeId) => {
    const state = getNodeState(nodeId);
    setNodeState(nodeId, { completed: !state.completed });
    // If there's a linked task, sync it
    if (!state.completed) {
      onCompleteTask?.(nodeId);
    }
  }, [getNodeState, setNodeState, onCompleteTask]);

  const handleCreateTask = useCallback(() => {
    if (!selectedNode) return;
    onCreateTask?.({
      mapNodeId: selectedNode.nodeId,
      treePath: selectedNode.breadcrumb,
      name: selectedNode.name,
    });
  }, [selectedNode, onCreateTask]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Progress bar */}
      <ProgressBar progress={progress} onImpactClick={() => setImpactPanelOpen(true)} />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <NodeSidebar
          node={selectedNode}
          nodeState={selectedNode?.nodeId ? getNodeState(selectedNode.nodeId) : null}
          onUpdateState={(updates) => selectedNode?.nodeId && setNodeState(selectedNode.nodeId, updates)}
          onToggleComplete={() => selectedNode?.nodeId && handleToggleComplete(selectedNode.nodeId)}
          onCreateTask={handleCreateTask}
          tasks={tasks.filter(t => t.mapNodeId === selectedNode?.nodeId)}
        />

        {/* Main map area */}
        <div className="flex-1 flex flex-col min-h-0">
          <CircleMap
            mapMode={mapMode}
            completedNodeIds={completedNodeIds}
            burningTaskNodeIds={burningTaskNodeIds}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNode?.nodeId}
          />

          {/* Bottom controls */}
          <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMapMode('full')}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                  mapMode === 'full' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                6階層
              </button>
              <button
                onClick={() => setMapMode('skip')}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                  mapMode === 'skip' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                QCDE
              </button>
            </div>

            {/* Breadcrumb */}
            {selectedNode && (
              <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate max-w-[50%]">
                <Map size={12} />
                {selectedNode.breadcrumb.split(' › ').map((part, i, arr) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="truncate max-w-[80px]">{part}</span>
                    {i < arr.length - 1 && <ChevronRight size={10} />}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => setAddNodeModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus size={12} />
              ノード追加
            </button>
          </div>
        </div>
      </div>

      {/* Add Node Modal */}
      {addNodeModalOpen && (
        <AddNodeModal
          mapNodes={mapNodes}
          onAdd={(parentId, name, color) => {
            addNode(parentId, name, color);
            setAddNodeModalOpen(false);
          }}
          onClose={() => setAddNodeModalOpen(false)}
        />
      )}

      {/* Impact Panel */}
      {impactPanelOpen && (
        <ImpactPanel
          nodeStates={nodeStates}
          mapNodes={mapNodes}
          getNodesByConstraint={getNodesByConstraint}
          onClose={() => setImpactPanelOpen(false)}
        />
      )}
    </div>
  );
}
