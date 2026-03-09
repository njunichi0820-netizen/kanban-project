import { useState, useRef, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Lightbulb, ClipboardList, Zap, PartyPopper } from 'lucide-react';
import TaskCard from './TaskCard';
import { EMPTY_MESSAGES, GTD_DETAILS } from '../constants';

const ICON_MAP = {
  Lightbulb,
  ClipboardList,
  Zap,
  PartyPopper,
};

export default function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask, onMoveTask, onUpdateTask, onDuplicate, onArchive, tags }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const emptyState = EMPTY_MESSAGES[column.id];
  const IconComp = ICON_MAP[column.icon];
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [gtdOpen, setGtdOpen] = useState(false);
  const longPressTimer = useRef(null);

  const handleToggleExpand = useCallback((taskId) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleColumnClick = (e) => {
    if (e.target.closest('[data-task-card]')) return;
    setExpandedTaskId(null);
  };

  // Long press for GTD details
  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setGtdOpen(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const gtd = GTD_DETAILS[column.id];

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-100 rounded-xl overflow-hidden" onClick={handleColumnClick}>
      {/* Card-style header banner */}
      <div
        className={`bg-gradient-to-r ${column.gradient} p-3.5 shrink-0 select-none`}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {IconComp && (
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                <IconComp size={16} className="text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-sm">{column.title}</h2>
                <span className="text-[11px] font-semibold bg-white/25 text-white rounded-full px-2 py-0.5">
                  {tasks.length}
                </span>
              </div>
              {column.desc && (
                <p className="text-[11px] text-white/75 mt-0.5">{column.desc}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white transition-colors"
            title="タスクを追加"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto px-3 pb-3 pt-2 space-y-2 min-h-[120px] transition-colors ${isOver ? 'bg-blue-50' : ''}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 && emptyState ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
              <span className="text-3xl mb-2">{emptyState.icon}</span>
              <p className="text-xs font-medium text-gray-300">{emptyState.message}</p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                columnId={column.id}
                isExpanded={expandedTaskId === task.id}
                onToggleExpand={handleToggleExpand}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onMove={onMoveTask}
                onUpdateTask={onUpdateTask}
                onDuplicate={onDuplicate}
                onArchive={onArchive}
                tags={tags}
              />
            ))
          )}
        </SortableContext>

        {/* Bottom add button */}
        <button
          onClick={() => onAddTask(column.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          タスクを追加
        </button>
      </div>

      {/* GTD Detail Modal */}
      {gtdOpen && gtd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGtdOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${column.gradient} p-4 rounded-t-2xl`}>
              <div className="flex items-center gap-2.5">
                {IconComp && (
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <IconComp size={20} className="text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white">{gtd.title}</h3>
                  <p className="text-[11px] text-white/75 mt-0.5">GTD ルール</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {gtd.rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-[11px] font-bold text-gray-400 mt-0.5 shrink-0">{i + 1}.</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4">
              <button onClick={() => setGtdOpen(false)} className="w-full px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
