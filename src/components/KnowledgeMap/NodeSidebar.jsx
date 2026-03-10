import { useState } from 'react';
import { Check, Plus, Sparkles, ExternalLink } from 'lucide-react';
import { TRL_LEVELS, PERSPECTIVES_5ME, CONSTRAINT_CATEGORIES } from '../../constants/mapConstants';

export default function NodeSidebar({ node, nodeState, onUpdateState, onToggleComplete, onCreateTask, tasks = [] }) {
  const [aiLoading, setAiLoading] = useState(false);

  if (!node) {
    return (
      <div className="w-80 shrink-0 bg-white border-r border-gray-200 hidden md:flex flex-col items-center justify-center text-gray-400 text-center p-8 gap-3">
        <div className="text-4xl opacity-20">🗺️</div>
        <p className="text-sm leading-relaxed">
          マップ上のノードをクリックすると<br />詳細が表示されます
        </p>
      </div>
    );
  }

  const rgba = (hex, a) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const col = node.color;

  return (
    <div className="w-80 shrink-0 bg-white border-r border-gray-200 hidden md:flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
          Lv{node.depth} — {node.depthLabel}
        </div>
        <span
          className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2"
          style={{ background: rgba(col, .08), color: col }}
        >
          {node.breadcrumb.split(' › ')[0] || node.name}
        </span>
        <h3 className="text-lg font-bold text-gray-900 leading-tight">{node.name}</h3>
      </div>

      <div className="h-px bg-gray-100 mx-5" />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Full name */}
        {node.fullName && node.fullName !== node.name && (
          <Section title="正式名称" color={col}>
            <p className="text-[13px] text-gray-500 leading-relaxed">{node.fullName}</p>
          </Section>
        )}

        {/* Req */}
        {node.req && (
          <Section title="要件値" color={col}>
            <p className="text-[13px] text-gray-500">{node.req}</p>
          </Section>
        )}

        {/* KPI */}
        {node.kpi && (
          <Section title="KPI" color={col}>
            <p className="text-[13px] text-gray-500">{node.kpi}</p>
          </Section>
        )}

        {/* Perspective (from data) */}
        {node.perspective && (
          <Section title="確認観点" color={col}>
            <p className="text-[13px] text-gray-500">{node.perspective}</p>
          </Section>
        )}

        {/* Completion toggle */}
        {node.nodeId && nodeState && (
          <Section title="ステータス" color={col}>
            <button
              onClick={onToggleComplete}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                nodeState.completed
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                nodeState.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
              }`}>
                {nodeState.completed && <Check size={12} className="text-white" />}
              </div>
              {nodeState.completed ? '完了' : '未完了'}
            </button>
          </Section>
        )}

        {/* 5M+E */}
        {node.nodeId && nodeState && (
          <Section title="5M+E" color={col}>
            <div className="flex flex-wrap gap-1">
              {PERSPECTIVES_5ME.map(p => {
                const active = nodeState.perspective5ME === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onUpdateState({ perspective5ME: active ? null : p.id })}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-colors ${
                      active ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={active ? { backgroundColor: p.color } : {}}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* TRL Level */}
        {node.nodeId && nodeState && (
          <Section title="TRL レベル" color={col}>
            <select
              value={nodeState.trl || ''}
              onChange={(e) => onUpdateState({ trl: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">未設定</option>
              {TRL_LEVELS.map(l => (
                <option key={l.level} value={l.level}>
                  Lv{l.level}: {l.label} — {l.desc}
                </option>
              ))}
            </select>
          </Section>
        )}

        {/* Constraints */}
        {node.nodeId && nodeState && (
          <Section title="与件" color={col}>
            <div className="flex flex-wrap gap-1">
              {CONSTRAINT_CATEGORIES.map(c => {
                const active = (nodeState.constraints || []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      const current = nodeState.constraints || [];
                      onUpdateState({
                        constraints: active ? current.filter(x => x !== c.id) : [...current, c.id],
                      });
                    }}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-colors ${
                      active ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={active ? { backgroundColor: c.color } : {}}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Linked tasks */}
        {tasks.length > 0 && (
          <Section title="紐付きタスク" color={col}>
            <div className="space-y-1">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg text-xs">
                  <div className={`w-2 h-2 rounded-full ${t.column === 'done' ? 'bg-emerald-500' : t.priority ? 'bg-orange-400' : 'bg-indigo-400'}`} />
                  <span className="truncate text-gray-700">{t.title}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Children */}
        {node.children.length > 0 && (
          <Section title="子ノード" color={col}>
            {node.children.map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-default text-[13px]">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color || col }} />
                <span className="text-gray-800">{c.name}</span>
              </div>
            ))}
          </Section>
        )}

        {/* Comments */}
        {node.nodeId && nodeState && (
          <Section title="コメント" color="var(--gray-400)">
            <textarea
              rows={3}
              value={nodeState.comments || ''}
              onChange={(e) => onUpdateState({ comments: e.target.value })}
              placeholder="コメントを入力..."
              className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </Section>
        )}

        {/* Info */}
        <Section title="情報" color={col}>
          <div className="space-y-1">
            <InfoRow label="深さ" value={`Lv${node.depth} (${node.depthLabel})`} />
            {node.isLeaf ? (
              <InfoRow label="タイプ" value="リーフノード" />
            ) : (
              <InfoRow label="子ノード数" value={`${node.childCount}件`} />
            )}
          </div>
        </Section>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 border-t border-gray-100 space-y-2 shrink-0">
        <button
          onClick={onCreateTask}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} />
          タスク作成
        </button>
      </div>
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div className="space-y-2">
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
    <div className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-[13px] font-medium text-gray-800">{value}</span>
    </div>
  );
}
