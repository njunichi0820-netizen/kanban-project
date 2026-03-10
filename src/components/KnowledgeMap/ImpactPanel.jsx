import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { CONSTRAINT_CATEGORIES } from '../../constants/mapConstants';

export default function ImpactPanel({ nodeStates, mapNodes, getNodesByConstraint, onClose }) {
  const [selectedConstraint, setSelectedConstraint] = useState(null);

  const affectedNodes = selectedConstraint ? getNodesByConstraint(selectedConstraint) : [];
  const affectedNodeDetails = affectedNodes.map(id => mapNodes.find(n => n.id === id)).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-bold text-gray-800">与件影響分析</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">与件を選択</label>
            <div className="flex flex-wrap gap-2">
              {CONSTRAINT_CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConstraint(selectedConstraint === c.id ? null : c.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    selectedConstraint === c.id
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={selectedConstraint === c.id ? { backgroundColor: c.color } : {}}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {selectedConstraint && (
            <div>
              <div className="text-xs font-bold text-gray-500 mb-2">
                影響ノード: <span className="text-indigo-600">{affectedNodeDetails.length}件</span>
              </div>
              {affectedNodeDetails.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  この与件が設定されたノードはありません。<br />
                  サイドバーでノードに与件を設定してください。
                </p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {affectedNodeDetails.map(n => (
                    <div key={n.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: n.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{n.name}</p>
                        <p className="text-[10px] text-gray-400">Lv{n.level}</p>
                      </div>
                      {nodeStates[n.id]?.completed && (
                        <span className="text-[10px] font-bold text-emerald-500">完了</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedConstraint && (
            <p className="text-sm text-gray-400 py-8 text-center">
              与件カテゴリを選択すると、影響を受けるノードが表示されます
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
