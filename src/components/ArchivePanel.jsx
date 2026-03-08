import { useState } from 'react';
import { X, RotateCcw, Trash2, Archive, Clock } from 'lucide-react';
import { COLUMNS } from '../constants';

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ArchivePanel({ archivedTasks, onRestore, onDelete, onClose }) {
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const colMap = Object.fromEntries(COLUMNS.map((c) => [c.id, c]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Archive size={18} className="text-gray-500" />
            <h2 className="text-base font-bold text-gray-800">アーカイブ</h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {archivedTasks.length}件
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {archivedTasks.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-12">
              <Archive size={32} className="mx-auto mb-2 opacity-40" />
              <p>アーカイブされたタスクはありません</p>
            </div>
          ) : (
            archivedTasks.map((task) => {
              const col = colMap[task.column];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {col && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <div className={`w-2 h-2 rounded-full ${col.color}`} />
                          {col.title}
                        </span>
                      )}
                      {task.archivedAt && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <Clock size={10} />
                          {formatDate(task.archivedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => onRestore(task.id)}
                      className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="復元"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="完全削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {archivedTasks.length > 0 && (
          <div className="px-5 py-3 border-t shrink-0">
            {confirmDeleteAll ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">全て削除しますか？</span>
                <button
                  onClick={() => {
                    archivedTasks.forEach((t) => onDelete(t.id));
                    setConfirmDeleteAll(false);
                  }}
                  className="px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  削除
                </button>
                <button
                  onClick={() => setConfirmDeleteAll(false)}
                  className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteAll(true)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                全てのアーカイブを削除
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
