import { useState, useEffect, useRef } from 'react';
import { X, Flame, Plus, Trash2, ExternalLink, Map } from 'lucide-react';
import { COLUMNS } from '../constants';
import { TRL_LEVELS, PERSPECTIVES_5ME, CONSTRAINT_CATEGORIES } from '../constants/mapConstants';
import TreeSelector from './KnowledgeMap/TreeSelector';
import { useMapData } from '../hooks/useMapData';

export default function TaskModal({ isOpen, task, defaultColumn, tags = [], onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [column, setColumn] = useState('idea');
  const [selectedTags, setSelectedTags] = useState([]);
  const [priority, setPriority] = useState(false);
  const [links, setLinks] = useState([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [mapNodeId, setMapNodeId] = useState(null);
  const [perspective5ME, setPerspective5ME] = useState(null);
  const [verificationLevel, setVerificationLevel] = useState(null);
  const [constraints, setConstraints] = useState([]);
  const [comments, setComments] = useState('');
  const [showMapSection, setShowMapSection] = useState(false);
  const titleRef = useRef(null);
  const { mapNodes } = useMapData();

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setColumn(task.column);
        setSelectedTags(task.tags || []);
        setPriority(task.priority || false);
        setLinks(task.links || []);
        setMapNodeId(task.mapNodeId || null);
        setPerspective5ME(task.perspective5ME || null);
        setVerificationLevel(task.verificationLevel || null);
        setConstraints(task.constraints || []);
        setComments(task.comments || '');
        setShowMapSection(!!(task.mapNodeId || task.perspective5ME || task.verificationLevel));
      } else {
        setTitle('');
        setDescription('');
        setColumn(defaultColumn || 'idea');
        setSelectedTags([]);
        setPriority(false);
        setLinks([]);
        // Check for pending map node from MapView
        const pendingNodeId = window.__pendingMapNodeId;
        const pendingTreePath = window.__pendingMapTreePath;
        setMapNodeId(pendingNodeId || null);
        setPerspective5ME(null);
        setVerificationLevel(null);
        setConstraints([]);
        setComments('');
        setShowMapSection(!!pendingNodeId);
        if (pendingNodeId) {
          window.__pendingMapNodeId = null;
          window.__pendingMapTreePath = null;
        }
      }
      setNewLinkUrl('');
      setNewLinkLabel('');
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen, task, defaultColumn]);

  if (!isOpen) return null;

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const addLink = () => {
    if (!newLinkUrl.trim()) return;
    setLinks(prev => [...prev, { url: newLinkUrl.trim(), label: newLinkLabel.trim() || '' }]);
    setNewLinkUrl('');
    setNewLinkLabel('');
  };

  const removeLink = (idx) => {
    setLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleConstraint = (cId) => {
    setConstraints(prev =>
      prev.includes(cId) ? prev.filter(x => x !== cId) : [...prev, cId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const saved = {
      id: task?.id || crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      tags: selectedTags,
      priority,
      column,
      links,
      mapNodeId: mapNodeId || null,
      perspective5ME: perspective5ME || null,
      verificationLevel: verificationLevel || null,
      constraints,
      comments: comments.trim(),
      subtasks: task?.subtasks || [],
      createdAt: task?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    if (task?.aiAdvice) saved.aiAdvice = task.aiAdvice;
    onSave(saved);
  };

  const linkedNode = mapNodeId ? mapNodes.find(n => n.id === mapNodeId) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-gray-800">
            {task ? 'タスク編集' : 'タスク追加'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">タイトル</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              placeholder="タスク名を入力"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
              placeholder="詳細（任意）"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">タグ</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => {
                const selected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                      selected
                        ? 'text-white shadow-sm scale-105'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={selected ? { backgroundColor: tag.color } : {}}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              <ExternalLink size={11} className="inline mr-1" />リンク
            </label>
            {links.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {links.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                    <ExternalLink size={12} className="text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {link.label && <p className="text-[11px] font-semibold text-gray-600 truncate">{link.label}</p>}
                      <p className="text-[10px] text-blue-500 truncate">{link.url}</p>
                    </div>
                    <button type="button" onClick={() => removeLink(i)} className="p-1 text-gray-300 hover:text-red-500 shrink-0">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-1.5">
              <input
                type="url"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="表示名（任意）"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addLink}
                  disabled={!newLinkUrl.trim()}
                  className="px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">重要度</label>
            <button
              type="button"
              onClick={() => setPriority(v => !v)}
              className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all ${
                priority
                  ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Flame size={14} />
              {priority ? '重要' : '通常'}
            </button>
          </div>

          {/* Map linkage section */}
          <div>
            <button
              type="button"
              onClick={() => setShowMapSection(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              <Map size={12} />
              {showMapSection ? 'マップ紐付けを閉じる' : 'マップに紐付け'}
            </button>

            {showMapSection && (
              <div className="mt-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                {/* Tree position selector */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">ツリー位置</label>
                  <TreeSelector mapNodes={mapNodes} value={mapNodeId} onChange={setMapNodeId} />
                  {linkedNode && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: linkedNode.color }} />
                      <span className="text-[10px] text-gray-500">{linkedNode.name}</span>
                      <button type="button" onClick={() => setMapNodeId(null)} className="text-[10px] text-red-400 hover:text-red-600 ml-auto">解除</button>
                    </div>
                  )}
                </div>

                {/* 5M+E */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">5M+E</label>
                  <select
                    value={perspective5ME || ''}
                    onChange={(e) => setPerspective5ME(e.target.value || null)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">未設定</option>
                    {PERSPECTIVES_5ME.map(p => (
                      <option key={p.id} value={p.id}>{p.label} ({p.desc})</option>
                    ))}
                  </select>
                </div>

                {/* TRL */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">TRL レベル</label>
                  <select
                    value={verificationLevel || ''}
                    onChange={(e) => setVerificationLevel(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">未設定</option>
                    {TRL_LEVELS.map(l => (
                      <option key={l.level} value={l.level}>Lv{l.level}: {l.label}</option>
                    ))}
                  </select>
                </div>

                {/* Constraints */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">与件</label>
                  <div className="flex flex-wrap gap-1">
                    {CONSTRAINT_CATEGORIES.map(c => {
                      const active = constraints.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleConstraint(c.id)}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-colors ${
                            active ? 'text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                          }`}
                          style={active ? { backgroundColor: c.color } : {}}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">コメント</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={2}
                    placeholder="コメント（任意）"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Column */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">カラム</label>
            <div className="flex gap-1.5">
              {COLUMNS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColumn(c.id)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${
                    column === c.id
                      ? `${c.lightBg} ${c.lightText} ring-1 ${c.ring}`
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              {task ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
