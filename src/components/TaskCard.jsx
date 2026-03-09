import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, ChevronDown, ChevronRight, Plus, Check, Clock, Copy, Archive, Flame, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { COLUMNS } from '../constants';
import { useAIAdvice } from '../hooks/useAIAdvice';

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function TaskCard({ task, columnId, isExpanded, onToggleExpand, onEdit, onDelete, onMove, onUpdateTask, onDuplicate, onArchive, tags = [] }) {
  const isDone = columnId === 'done';
  const expanded = isExpanded ?? false;
  const [subtasksOpen, setSubtasksOpen] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubIdx, setEditingSubIdx] = useState(null);
  const [editingSubText, setEditingSubText] = useState('');
  const [showAdvice, setShowAdvice] = useState(false);
  const [adviceOpen, setAdviceOpen] = useState(true);
  const { generateAdvice, loading: adviceLoading, hasApiKey } = useAIAdvice();
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

  const subtasks = task.subtasks || [];
  const doneCount = subtasks.filter(s => s.done).length;
  const taskTags = (task.tags || []).map(tid => tags.find(t => t.id === tid)).filter(Boolean);
  const links = task.links || [];

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('select')) return;
    onToggleExpand?.(task.id);
  };

  const toggleSubtask = (idx) => {
    const updated = subtasks.map((s, i) => i === idx ? { ...s, done: !s.done } : s);
    onUpdateTask?.({ ...task, subtasks: updated });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const updated = [...subtasks, { text: newSubtask.trim(), done: false }];
    onUpdateTask?.({ ...task, subtasks: updated });
    setNewSubtask('');
  };

  const removeSubtask = (idx) => {
    onUpdateTask?.({ ...task, subtasks: subtasks.filter((_, i) => i !== idx) });
  };

  const startEditSubtask = (idx) => {
    setEditingSubIdx(idx);
    setEditingSubText(subtasks[idx].text);
  };

  const saveEditSubtask = () => {
    if (editingSubIdx === null) return;
    if (!editingSubText.trim()) {
      removeSubtask(editingSubIdx);
    } else {
      const updated = subtasks.map((s, i) => i === editingSubIdx ? { ...s, text: editingSubText.trim() } : s);
      onUpdateTask?.({ ...task, subtasks: updated });
    }
    setEditingSubIdx(null);
    setEditingSubText('');
  };

  const togglePriority = () => {
    onUpdateTask?.({ ...task, priority: !task.priority });
  };

  return (
    <div
      data-task-card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative rounded-2xl transition-all duration-200 w-full overflow-hidden md:cursor-grab md:active:cursor-grabbing
        ${task.priority ? 'border-l-4 border-orange-400 bg-orange-50/50' : 'bg-white'}
        ${isDragging ? 'opacity-50 shadow-xl z-50' : 'shadow-sm hover:shadow-md'}
        ${isDone ? 'opacity-50' : ''}
        ${expanded ? 'shadow-lg ring-1 ring-black/5' : ''}
      `}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-2 p-3">
        <div className="mt-1 text-gray-300 shrink-0 p-1 hidden md:block">
          <GripVertical size={14} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-semibold break-words leading-snug ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.priority && <span className="mr-1">🔥</span>}
            {task.title}
          </p>

          {/* Tags */}
          {taskTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {taskTags.map(tag => (
                <span
                  key={tag.id}
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          {/* Date + subtask progress + link indicator */}
          <div className="flex items-center gap-2 mt-1.5">
            {task.createdAt && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <Clock size={10} />
                {formatDate(task.createdAt)}
              </span>
            )}
            {subtasks.length > 0 && (
              <span className="text-[10px] text-gray-400">
                <Check size={10} className="inline" /> {doneCount}/{subtasks.length}
              </span>
            )}
            {links.length > 0 && (
              <span className="text-[10px] text-blue-400">
                <ExternalLink size={10} className="inline" /> {links.length}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Description (shown only when expanded) */}
          {task.description && (
            <p className={`text-xs leading-relaxed break-words ${isDone ? 'line-through text-gray-300' : 'text-gray-500'}`} style={{ overflowWrap: 'anywhere' }}>
              {task.description}
            </p>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div className="space-y-1">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={11} className="shrink-0" />
                  <span className="truncate">{link.label || link.url}</span>
                </a>
              ))}
            </div>
          )}

          {/* Priority toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); togglePriority(); }}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
              task.priority
                ? 'bg-orange-50 text-orange-600'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <Flame size={12} />
            {task.priority ? '重要' : '重要にする'}
          </button>

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div>
              <button
                onClick={(e) => { e.stopPropagation(); setSubtasksOpen(v => !v); }}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 mb-1"
              >
                {subtasksOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                サブタスク ({doneCount}/{subtasks.length})
              </button>
              {subtasksOpen && (
                <div className="space-y-1 ml-1">
                  {subtasks.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2 group/st">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSubtask(idx); }}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          st.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {st.done && <Check size={10} className="text-white" />}
                      </button>
                      {editingSubIdx === idx ? (
                        <input
                          type="text"
                          value={editingSubText}
                          onChange={(e) => setEditingSubText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.isComposing || e.nativeEvent?.isComposing) return;
                            if (e.key === 'Enter') { e.preventDefault(); saveEditSubtask(); }
                            if (e.key === 'Escape') { setEditingSubIdx(null); }
                          }}
                          onBlur={saveEditSubtask}
                          autoFocus
                          className="flex-1 text-xs py-0.5 px-1.5 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className={`text-xs flex-1 ${st.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {st.text}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditSubtask(idx); }}
                        className="p-0.5 text-gray-300 hover:text-indigo-400 opacity-0 group-hover/st:opacity-100 md:opacity-0 transition-opacity"
                      >
                        <Pencil size={10} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSubtask(idx); }}
                        className="p-0.5 text-gray-300 hover:text-red-400 opacity-0 group-hover/st:opacity-100 md:opacity-0 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add subtask inline */}
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <Plus size={12} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => {
                if (e.isComposing || e.nativeEvent?.isComposing) return;
                if (e.key === 'Enter') { e.preventDefault(); addSubtask(); }
              }}
              placeholder="サブタスクを追加..."
              className="flex-1 text-xs py-1 px-2 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>

          {/* AI Advice */}
          {hasApiKey() && (
            <div className="space-y-2">
              {!task.aiAdvice && !showAdvice && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    setShowAdvice(true);
                    try {
                      const advice = await generateAdvice(task);
                      onUpdateTask?.({ ...task, aiAdvice: advice });
                    } catch {
                      // error handled in hook
                    }
                  }}
                  disabled={adviceLoading}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                >
                  {adviceLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  AIアドバイスを取得
                </button>
              )}
              {adviceLoading && showAdvice && (
                <div className="flex items-center gap-2 py-3 justify-center text-violet-500">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[11px] font-semibold">AIが分析中...</span>
                </div>
              )}
              {task.aiAdvice && (
                <div className="bg-violet-50/50 rounded-xl border border-violet-100 overflow-hidden">
                  <button
                    onClick={(e) => { e.stopPropagation(); setAdviceOpen(v => !v); }}
                    className="flex items-center gap-1.5 w-full px-3 py-2 hover:bg-violet-50 transition-colors"
                  >
                    {adviceOpen ? <ChevronDown size={12} className="text-violet-400" /> : <ChevronRight size={12} className="text-violet-400" />}
                    <Sparkles size={12} className="text-violet-500" />
                    <span className="text-[11px] font-bold text-violet-600">AIアドバイス</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const advice = await generateAdvice(task);
                            onUpdateTask?.({ ...task, aiAdvice: advice });
                          } catch {}
                        }}
                        className="text-[10px] text-violet-400 hover:text-violet-600 font-semibold"
                      >
                        {adviceLoading ? '更新中...' : '再取得'}
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateTask?.({ ...task, aiAdvice: undefined });
                          setShowAdvice(false);
                        }}
                        className="text-[10px] text-gray-400 hover:text-red-500 font-semibold"
                      >
                        削除
                      </span>
                    </div>
                  </button>
                  {adviceOpen && (
                    <div className="px-3 pb-3 space-y-2">
                      {task.aiAdvice.specificity && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400">具体性</p>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{task.aiAdvice.specificity}</p>
                        </div>
                      )}
                      {task.aiAdvice.subtasks?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400">WBS分解</p>
                          <ul className="space-y-0.5">
                            {task.aiAdvice.subtasks.map((s, i) => (
                              <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                                <span className="text-violet-400 shrink-0">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {task.aiAdvice.priority && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400">優先度・見積もり</p>
                          <p className="text-[11px] text-gray-600">{task.aiAdvice.priority}</p>
                        </div>
                      )}
                      {task.aiAdvice.risks && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400">リスク</p>
                          <p className="text-[11px] text-gray-600">{task.aiAdvice.risks}</p>
                        </div>
                      )}
                      {task.aiAdvice.firstStep && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400">最初の一歩</p>
                          <p className="text-[11px] text-gray-600 font-semibold">{task.aiAdvice.firstStep}</p>
                        </div>
                      )}
                      {task.aiAdvice.motivation && (
                        <div className="bg-gradient-to-r from-violet-100 to-pink-100 rounded-lg px-3 py-2 mt-1">
                          <p className="text-[11px] text-violet-700 font-semibold">{task.aiAdvice.motivation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Move buttons - pill style */}
          {onMove && (
            <div className="flex gap-1.5 pt-1">
              {COLUMNS.map(c => {
                const isCurrent = c.id === columnId;
                return (
                  <button
                    key={c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCurrent) { onMove(task.id, c.id); onToggleExpand?.(null); }
                    }}
                    disabled={isCurrent}
                    className={`flex-1 text-[11px] py-2 rounded-xl font-semibold transition-all ${
                      isCurrent
                        ? `${c.lightBg} ${c.lightText} ring-1 ${c.ring}`
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95'
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action bar: duplicate, archive, delete */}
          <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
            {onDuplicate && (
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(task); }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Copy size={12} />
                複製
              </button>
            )}
            {onArchive && (
              <button
                onClick={(e) => { e.stopPropagation(); onArchive(task.id); }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <Archive size={12} />
                アーカイブ
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={12} />
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
