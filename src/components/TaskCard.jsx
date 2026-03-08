import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { PRIORITY_COLORS, COLUMNS } from '../constants';

export default function TaskCard({ task, columnId, onEdit, onDelete, onMove }) {
  const isDone = columnId === 'done';
  const [expanded, setExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { columnId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    setExpanded((v) => !v);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative bg-white rounded-xl border-l-4 transition-all duration-200
        ${PRIORITY_COLORS[task.priority]}
        ${isDragging ? 'opacity-50 shadow-xl z-50' : 'shadow-sm'}
        ${isDone ? 'opacity-50' : ''}
        ${expanded ? 'shadow-lg scale-[1.02] ring-1 ring-black/5' : ''}
      `}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-1.5 p-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 touch-none text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
          aria-label="ドラッグ"
        >
          <GripVertical size={16} />
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold break-words ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className={`mt-1 text-xs break-words ${isDone ? 'line-through text-gray-300' : 'text-gray-500'}`}>
              {task.description}
            </p>
          )}
        </div>

        <div className="flex gap-0.5 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="編集"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Move buttons with column colors */}
      {expanded && onMove && (
        <div className="flex gap-1.5 px-3 pb-3">
          {COLUMNS.map((col) => {
            const isCurrent = col.id === columnId;
            return (
              <button
                key={col.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isCurrent) {
                    onMove(task.id, col.id);
                    setExpanded(false);
                  }
                }}
                disabled={isCurrent}
                className={`flex-1 text-xs py-2 rounded-lg font-bold tracking-wide transition-all ${
                  isCurrent
                    ? `${col.lightBg} ${col.lightText} ring-2 ring-current cursor-default`
                    : `${col.btnBg} text-white ${col.btnHover} active:scale-95 shadow-sm`
                }`}
              >
                {col.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
