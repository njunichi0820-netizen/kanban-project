import { AlertTriangle } from 'lucide-react';

export default function ProgressBar({ progress, onImpactClick }) {
  const { completed, total, percent } = progress;

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-[11px] font-bold text-gray-500 shrink-0">進捗:</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: percent >= 80 ? '#10B981' : percent >= 50 ? '#3B82F6' : '#F59E0B',
            }}
          />
        </div>
        <span className="text-[11px] font-bold tabular-nums shrink-0" style={{
          color: percent >= 80 ? '#10B981' : percent >= 50 ? '#3B82F6' : '#F59E0B',
        }}>
          {percent}% ({completed}/{total})
        </span>
      </div>

      <button
        onClick={onImpactClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors shrink-0"
      >
        <AlertTriangle size={12} />
        与件影響分析
      </button>
    </div>
  );
}
