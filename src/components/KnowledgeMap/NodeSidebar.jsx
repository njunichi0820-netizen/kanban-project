import { useState } from 'react';
import { Check, Plus, X, GitBranch, GitMerge } from 'lucide-react';
import { TRL_LEVELS, PERSPECTIVES_5ME, CONSTRAINT_CATEGORIES } from '../../constants/mapConstants';

const DEPTH_COLORS = ['', '#4F6CF7', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];

export default function NodeSidebar({ node, nodeState, onUpdateState, onToggleComplete, onCreateTask, onAddChild, onAddSibling, tasks = [] }) {
  const [addMode, setAddMode] = useState(null); // 'child' | 'sibling' | null
  const [newNodeName, setNewNodeName] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;
    if (addMode === 'child') onAddChild?.(newNodeName.trim());
    else if (addMode === 'sibling') onAddSibling?.(newNodeName.trim());
    setNewNodeName('');
    setAddMode(null);
  };

  if (!node) {
    return (
      <div className="w-72 shrink-0 bg-white border-r border-gray-200 hidden md:flex flex-col items-center justify-center text-gray-300 text-center p-8 gap-3">
        <div style={{ fontSize: 48, opacity: 0.15 }}>⬡</div>
        <p className="text-sm leading-relaxed text-gray-400">ノードをクリックすると<br />詳細が表示されます</p>
        <p className="text-[10px] text-gray-300">親ノードは外枠をクリック</p>
      </div>
    );
  }

  const col = DEPTH_COLORS[node.depth] || '#6B7694';

  return (
    <div className="w-72 shrink-0 bg-white border-r border-gray-200 hidden md:flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        {/* Level badge */}
        <div className="flex items-center gap-2 mb-2">
          {[1,2,3,4,5,6].map(lv => (
            <div key={lv} className="flex flex-col items-center gap-0.5">
              <div className="rounded-full transition-all"
                style={{
                  width: lv === node.depth ? 10 : 6,
                  height: lv === node.depth ? 10 : 6,
                  background: lv === node.depth ? DEPTH_COLORS[lv] : '#E5E7EB',
                }}
              />
              {lv === node.depth && <span className="text-[8px] font-bold" style={{ color: DEPTH_COLORS[lv] }}>Lv{lv}</span>}
            </div>
          ))}
          <span className="text-[10px] text-gray-400 ml-1">{node.depthLabel}</span>
        </div>

        {/* Breadcrumb */}
        {node.breadcrumb && (
          <p className="text-[9px] text-gray-400 mb-1.5 leading-relaxed truncate" title={node.breadcrumb}>
            {node.breadcrumb}
          </p>
        )}

        <h3 className="text-base font-bold text-gray-900 leading-tight">{node.name}</h3>

        {/* Add child/sibling buttons */}
        <div className="flex gap-1.5 mt-2">
          <button onClick={() => setAddMode(addMode === 'child' ? null : 'child')}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors ${addMode === 'child' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
            <GitBranch size={10} />子を追加
          </button>
          <button onClick={() => setAddMode(addMode === 'sibling' ? null : 'sibling')}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors ${addMode === 'sibling' ? 'bg-violet-500 text-white' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'}`}>
            <GitMerge size={10} />同階層に追加
          </button>
        </div>

        {/* Inline add form */}
        {addMode && (
          <form onSubmit={handleAddSubmit} className="mt-2 flex gap-1">
            <input
              type="text"
              value={newNodeName}
              onChange={e => setNewNodeName(e.target.value)}
              placeholder={addMode === 'child' ? `"${node.name}"の子ノード名` : `"${node.name}"と同階層のノード名`}
              className="flex-1 px-2 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoFocus
            />
            <button type="submit" className="px-2 py-1.5 text-[11px] font-bold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600">
              <Plus size={12} />
            </button>
            <button type="button" onClick={() => { setAddMode(null); setNewNodeName(''); }} className="px-2 py-1.5 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          </form>
        )}
      </div>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Node data */}
        {node.req && <Section title="要件値" color={col}><p className="text-[12px] text-gray-500">{node.req}</p></Section>}
        {node.kpi && <Section title="KPI" color={col}><p className="text-[12px] text-gray-500">{node.kpi}</p></Section>}
        {node.perspective && <Section title="確認観点" color={col}><p className="text-[12px] text-gray-500">{node.perspective}</p></Section>}

        {/* Completion toggle */}
        {node.nodeId && nodeState && (
          <Section title="ステータス" color={col}>
            <button onClick={onToggleComplete}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors w-full ${nodeState.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${nodeState.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                {nodeState.completed && <Check size={10} className="text-white" />}
              </div>
              {nodeState.completed ? '✓ 完了' : '未完了'}
            </button>
          </Section>
        )}

        {/* 5M+E */}
        {node.nodeId && nodeState && (
          <Section title="5M+E 観点" color={col}>
            <div className="flex flex-wrap gap-1">
              {PERSPECTIVES_5ME.map(p => {
                const active = nodeState.perspective5ME === p.id;
                return (
                  <button key={p.id} onClick={() => onUpdateState({ perspective5ME: active ? null : p.id })}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${active ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    style={active ? { backgroundColor: p.color } : {}}>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* TRL */}
        {node.nodeId && nodeState && (
          <Section title="TRL レベル" color={col}>
            <select value={nodeState.trl || ''} onChange={e => onUpdateState({ trl: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">未設定</option>
              {TRL_LEVELS.map(l => <option key={l.level} value={l.level}>Lv{l.level}: {l.label}</option>)}
            </select>
            {nodeState.trl && (
              <div className="mt-1 text-[10px] text-gray-400">{TRL_LEVELS.find(l => l.level === nodeState.trl)?.desc}</div>
            )}
          </Section>
        )}

        {/* Constraints */}
        {node.nodeId && nodeState && (
          <Section title="与件" color={col}>
            <div className="flex flex-wrap gap-1">
              {CONSTRAINT_CATEGORIES.map(c => {
                const active = (nodeState.constraints || []).includes(c.id);
                return (
                  <button key={c.id} onClick={() => {
                    const cur = nodeState.constraints || [];
                    onUpdateState({ constraints: active ? cur.filter(x => x !== c.id) : [...cur, c.id] });
                  }} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${active ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    style={active ? { backgroundColor: c.color } : {}}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Linked tasks */}
        {tasks.length > 0 && (
          <Section title={`紐付きタスク (${tasks.length})`} color={col}>
            <div className="space-y-1">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg text-[11px]">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.column === 'done' ? 'bg-emerald-500' : t.priority ? 'bg-orange-400' : 'bg-indigo-400'}`} />
                  <span className="truncate text-gray-700">{t.title}</span>
                  {t.verificationLevel && <span className="text-[9px] text-gray-400 shrink-0">TRL{t.verificationLevel}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Children list */}
        {node.children.length > 0 && (
          <Section title={`子ノード (${node.children.length})`} color={col}>
            {node.children.map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 text-[12px]">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color || col }} />
                <span className="text-gray-700 truncate">{c.name}</span>
              </div>
            ))}
          </Section>
        )}

        {/* Comments */}
        {node.nodeId && nodeState && (
          <Section title="コメント" color="#9BA3B8">
            <textarea rows={2} value={nodeState.comments || ''} onChange={e => onUpdateState({ comments: e.target.value })}
              placeholder="コメントを入力..." className="w-full text-[12px] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
          </Section>
        )}

        {/* Node info */}
        <Section title="情報" color={col}>
          <InfoRow label="Lv / タイプ" value={`Lv${node.depth} — ${node.depthLabel}`} />
          <InfoRow label={node.isLeaf ? 'タイプ' : '子ノード数'} value={node.isLeaf ? 'リーフノード' : `${node.childCount}件`} />
        </Section>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        <button onClick={onCreateTask}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
          <Plus size={13} />タスク作成（自動紐付け）
        </button>
      </div>
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-gray-400">
        <div className="w-0.5 h-2.5 rounded" style={{ background: color }} />
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-0.5 border-b border-gray-50 last:border-b-0">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-[11px] font-medium text-gray-700">{value}</span>
    </div>
  );
}
