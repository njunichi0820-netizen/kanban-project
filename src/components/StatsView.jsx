import { useMemo } from 'react';
import { COLUMNS } from '../constants';
import { BarChart3, Flame, Trophy, TrendingUp } from 'lucide-react';

export default function StatsView({ tasks, tags, karma, getLevel, getDailyData, getWeeklyData }) {
  const level = getLevel();
  const dailyData = getDailyData(14);
  const weeklyData = getWeeklyData(8);
  const maxDaily = Math.max(...dailyData.map((d) => d.points), 1);
  const maxWeekly = Math.max(...weeklyData.map((w) => w.points), 1);

  // Column stats
  const columnStats = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      count: tasks.filter((t) => t.column === col.id).length,
    }));
  }, [tasks]);

  const totalTasks = tasks.length;

  // Tag distribution
  const tagStats = useMemo(() => {
    const counts = {};
    tasks.forEach((t) => {
      (t.tags || []).forEach((tid) => {
        counts[tid] = (counts[tid] || 0) + 1;
      });
    });
    return tags
      .map((tag) => ({ ...tag, count: counts[tag.id] || 0 }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [tasks, tags]);

  const maxTagCount = Math.max(...tagStats.map((t) => t.count), 1);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Karma summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Trophy size={18} />} label="レベル" value={level.current.name} accent="text-yellow-600" bg="bg-yellow-50" />
        <StatCard icon={<TrendingUp size={18} />} label="総カルマ" value={`${karma.total} pt`} accent="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={<Flame size={18} />} label="連続日数" value={`${karma.streak}日`} accent="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={<BarChart3 size={18} />} label="タスク数" value={totalTasks} accent="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Level progress */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-2">レベル進捗</h3>
        <div className="flex items-center gap-3">
          <span className="text-lg">{level.current.name}</span>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
              style={{ width: `${Math.min(level.progress * 100, 100)}%` }}
            />
          </div>
          {level.next && <span className="text-sm text-gray-400">{level.next.name}</span>}
        </div>
        {level.next && (
          <p className="text-xs text-gray-400 mt-1">
            あと {level.next.min - karma.total} pt で {level.next.name}
          </p>
        )}
      </div>

      {/* Column breakdown */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">カラム別タスク数</h3>
        <div className="space-y-2">
          {columnStats.map((col) => (
            <div key={col.id} className="flex items-center gap-3">
              <div className="w-16 text-xs text-gray-600 font-medium shrink-0">{col.title}</div>
              <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${col.color} rounded-lg transition-all flex items-center justify-end pr-2`}
                  style={{ width: totalTasks ? `${Math.max((col.count / totalTasks) * 100, col.count > 0 ? 12 : 0)}%` : '0%' }}
                >
                  {col.count > 0 && (
                    <span className="text-[10px] font-bold text-white">{col.count}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tag distribution */}
      {tagStats.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-3">タグ分布</h3>
          <div className="space-y-2">
            {tagStats.map((tag) => (
              <div key={tag.id} className="flex items-center gap-3">
                <div className="w-20 text-xs font-medium shrink-0 truncate" style={{ color: tag.color }}>
                  {tag.label}
                </div>
                <div className="flex-1 h-5 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max((tag.count / maxTagCount) * 100, 12)}%`,
                      backgroundColor: tag.color + '40',
                    }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: tag.color }}>
                      {tag.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily karma chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">日別カルマ（14日間）</h3>
        <div className="flex items-end gap-1 h-32">
          {dailyData.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-400 font-medium">
                {d.points > 0 ? d.points : ''}
              </span>
              <div
                className="w-full bg-indigo-400 rounded-t-sm transition-all min-h-[2px]"
                style={{ height: `${(d.points / maxDaily) * 100}%` }}
              />
              <span className="text-[8px] text-gray-400 rotate-[-45deg] origin-top-left whitespace-nowrap">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly karma chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">週別カルマ</h3>
        <div className="flex items-end gap-2 h-28">
          {weeklyData.map((w) => (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-400 font-medium">
                {w.points > 0 ? w.points : ''}
              </span>
              <div
                className="w-full bg-emerald-400 rounded-t-sm transition-all min-h-[2px]"
                style={{ height: `${(w.points / maxWeekly) * 100}%` }}
              />
              <span className="text-[8px] text-gray-400 truncate w-full text-center">{w.week.split('-')[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-3 md:p-4`}>
      <div className={`${accent} mb-1`}>{icon}</div>
      <p className="text-[10px] text-gray-500 font-medium">{label}</p>
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}
