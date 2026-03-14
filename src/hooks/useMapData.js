import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { RAW_DATA } from '../data/rawMapData';

// Flatten RAW_DATA tree into flat node array with path-based IDs
function flattenTree(node, parentPath = null, level = 0) {
  const myPath = parentPath ? `${parentPath}::${node.name}` : node.name;
  const result = [{
    id: myPath,
    name: node.name,
    parentId: parentPath,
    level,
    color: node.color || '#6B7694',
    perspective: node.perspective || '',
    kpi: node.kpi || '',
    req: node.req || '',
    fullName: node.fullName || '',
    value: node.value || 0,
  }];

  if (node.children) {
    node.children.forEach(child => result.push(...flattenTree(child, myPath, level + 1)));
  }

  return result;
}

// Helper: generate stable path-based ID from D3 node's ancestor chain (excluding root)
export function getNodeIdFromD3(d) {
  return d.ancestors().reverse().slice(1).map(a => a.data.name).join('::');
}

// Build D3 hierarchy from flat nodes
function buildTree(flatNodes) {
  const nodeMap = new Map();
  flatNodes.forEach(n => nodeMap.set(n.id, { ...n, children: [] }));

  const roots = [];
  flatNodes.forEach(n => {
    if (!n.parentId) {
      roots.push(nodeMap.get(n.id));
    } else {
      const parent = nodeMap.get(n.parentId);
      if (parent) {
        parent.children.push(nodeMap.get(n.id));
      }
    }
  });

  // Convert to D3-compatible format
  function toD3(node) {
    if (node.children.length === 0) {
      return { name: node.name, color: node.color, perspective: node.perspective, kpi: node.kpi, req: node.req, fullName: node.fullName, nodeId: node.id, value: node.value || 1 };
    }
    return { name: node.name, color: node.color, perspective: node.perspective, kpi: node.kpi, req: node.req, fullName: node.fullName, nodeId: node.id, children: node.children.map(toD3) };
  }

  if (roots.length === 1) return toD3(roots[0]);
  return { name: 'root', children: roots.map(toD3) };
}

// Initialize flat nodes from RAW_DATA
function initializeNodes() {
  return flattenTree(RAW_DATA);
}

export function useMapData() {
  const [mapNodes, setMapNodes] = useLocalStorage('kanban-map-nodes', () => initializeNodes());
  const [nodeStates, setNodeStates] = useLocalStorage('kanban-map-node-states', {});
  // nodeStates: { [nodeId]: { completed: bool, trl: number|null, perspective5ME: string|null, constraints: [], comments: '' } }

  // Ensure mapNodes is initialized
  const nodes = useMemo(() => {
    if (!mapNodes || mapNodes.length === 0) return initializeNodes();
    return mapNodes;
  }, [mapNodes]);

  const addNode = useCallback((parentId, name, color) => {
    setMapNodes(prev => {
      // D3 getNodeId excludes root name, flat nodes include it — match both
      const parent = prev.find(n => n.id === parentId)
        || prev.find(n => n.id.endsWith(`::${parentId}`) && n.id.split('::').slice(1).join('::') === parentId);
      const actualParentId = parent?.id || parentId;
      const level = parent ? parent.level + 1 : 1;
      const newNode = {
        id: `${actualParentId}::${name}_${Date.now()}`,
        name,
        parentId: actualParentId,
        level,
        color: color || parent?.color || '#6B7694',
        perspective: '',
        kpi: '',
        req: '',
        fullName: '',
        value: 1,
      };
      return [...prev, newNode];
    });
  }, [setMapNodes]);

  const updateNode = useCallback((nodeId, updates) => {
    setMapNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  }, [setMapNodes]);

  const removeNode = useCallback((nodeId) => {
    setMapNodes(prev => {
      // Remove node and all descendants
      const toRemove = new Set();
      const queue = [nodeId];
      while (queue.length) {
        const id = queue.shift();
        toRemove.add(id);
        prev.filter(n => n.parentId === id).forEach(child => queue.push(child.id));
      }
      return prev.filter(n => !toRemove.has(n.id));
    });
  }, [setMapNodes]);

  // Node state management (completion, TRL, etc.)
  const getNodeState = useCallback((nodeId) => {
    return nodeStates[nodeId] || { completed: false, trl: null, perspective5ME: null, constraints: [], comments: '' };
  }, [nodeStates]);

  const setNodeState = useCallback((nodeId, updates) => {
    setNodeStates(prev => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] || { completed: false, trl: null, perspective5ME: null, constraints: [], comments: '' }), ...updates },
    }));
  }, [setNodeStates]);

  // Build tree for D3
  const treeData = useMemo(() => buildTree(nodes), [nodes]);

  // Also provide RAW_DATA directly for D3 (original morph/buildMap use it)
  const rawTreeData = RAW_DATA;

  // Progress calculation
  const getProgress = useCallback((nodeId) => {
    if (!nodeId) {
      // Overall progress
      const leaves = nodes.filter(n => !nodes.some(c => c.parentId === n.id));
      const completed = leaves.filter(n => nodeStates[n.id]?.completed).length;
      return { completed, total: leaves.length, percent: leaves.length ? Math.round(completed / leaves.length * 100) : 0 };
    }
    // Branch progress - all leaf descendants
    const descendants = new Set();
    const queue = [nodeId];
    while (queue.length) {
      const id = queue.shift();
      descendants.add(id);
      nodes.filter(n => n.parentId === id).forEach(child => queue.push(child.id));
    }
    const leaves = nodes.filter(n => descendants.has(n.id) && !nodes.some(c => c.parentId === n.id));
    const completed = leaves.filter(n => nodeStates[n.id]?.completed).length;
    return { completed, total: leaves.length, percent: leaves.length ? Math.round(completed / leaves.length * 100) : 0 };
  }, [nodes, nodeStates]);

  // Get completed and "burning" node IDs for map coloring
  const completedNodeIds = useMemo(() => {
    return new Set(Object.entries(nodeStates).filter(([, s]) => s.completed).map(([id]) => id));
  }, [nodeStates]);

  // Get nodes matching a constraint
  const getNodesByConstraint = useCallback((constraintId) => {
    return Object.entries(nodeStates)
      .filter(([, s]) => s.constraints?.includes(constraintId))
      .map(([id]) => id);
  }, [nodeStates]);

  // Get ancestor path for a node
  const getAncestorPath = useCallback((nodeId) => {
    const path = [];
    let current = nodes.find(n => n.id === nodeId);
    while (current) {
      path.unshift(current);
      current = current.parentId ? nodes.find(n => n.id === current.parentId) : null;
    }
    return path;
  }, [nodes]);

  return {
    mapNodes: nodes,
    setMapNodes,
    nodeStates,
    setNodeStates,
    addNode,
    updateNode,
    removeNode,
    getNodeState,
    setNodeState,
    treeData,
    rawTreeData,
    getProgress,
    completedNodeIds,
    getNodesByConstraint,
    getAncestorPath,
  };
}
