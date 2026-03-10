import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';

export default function AddNodeModal({ mapNodes, onAdd, onClose }) {
  const [parentId, setParentId] = useState('root');
  const [name, setName] = useState('');

  // Build level-based selectors
  const levels = useMemo(() => {
    const result = {};
    mapNodes.forEach(n => {
      if (!result[n.level]) result[n.level] = [];
      result[n.level].push(n);
    });
    return result;
  }, [mapNodes]);

  const parentNode = mapNodes.find(n => n.id === parentId);
  const parentColor = parentNode?.color || '#6B7694';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(parentId, name.trim(), parentColor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-gray-800">ノード追加</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">親ノード</label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {Object.entries(levels).map(([level, nodes]) => (
                <optgroup key={level} label={`Lv${level}`}>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      {'  '.repeat(n.level)}{n.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">ノード名</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="新しいノード名"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
              required
            />
          </div>

          {parentNode && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-3 h-3 rounded-full" style={{ background: parentColor }} />
              <span>親: {parentNode.name} (Lv{parentNode.level})</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200">
              キャンセル
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">
              <Plus size={14} />
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
