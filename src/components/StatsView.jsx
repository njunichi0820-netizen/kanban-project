import { useMemo } from 'react';
import { COLUMNS } from '../constants';
import { Flame, Trophy, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';

export default function StatsView({ tasks, tags, points, getLevel, getDailyData, getWeeklyData }) {
  const level = getLevel();
  const dailyData = getDailyData(14);
  const weeklyData = getWeeklyData(8);
  const maxDaily = Math.max(...dailyData.map((d) => d.points), 1);
  const maxWeekly = Math.max(...weeklyData.map((w) => w.points), 1);

  const columnStats = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      count: tasks.filter((t) => t.column === col.id).length,
    }));
  }, [tasks]);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.column === 'done').length;

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
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">

        {/* Hero card — level & points */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-5 md:p-6 text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-xs font-semibold tracking-wider uppercase mb-1">Your Level</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">{level.current.name}</h2>
              <p className="text-indigo-200 text-sm mt-1">{points.total} pt 獲得済み</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
                <Flame size={16} className="text-orange-300" />
                <span className="text-lg font-bold">{points.streak}</span>
                <span className="text-xs text-indigo-200">日連続</span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          {level.next && (
            <div className="relative mt-4">
              <div className="flex justify-between text-[10px] text-indigo-200 mb-1">
                <span>{level.current.name}</span>
                <span>{level.next.name}まで あと {level.next.min - points.total} pt</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-white/80 to-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(level.progress * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Metric cards row */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard icon={<Zap size={16} />} value={points.total} unit="pt" label="総ポイント" gradient="from-violet-500 to-purple-600" />
          <MetricCard icon={<CheckCircle2 size={16} />} value={doneTasks} unit="" label="完了タスク" gradient="from-emerald-500 to-teal-600" />
          <MetricCard icon={<TrendingUp size={16} />} value={totalTasks} unit="" label="全タスク" gradient="from-blue-500 to-cyan-600" />
        </div>

        {/* Column breakdown — donut style cards */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4">ステータス別</h3>
          <div className="grid grid-cols-4 gap-2">
            {columnStats.map((col) => {
              const pct = totalTasks ? Math.round((col.count / totalTasks) * 100) : 0;
              return (
                <div key={col.id} className="text-center">
                  <div className="relative w-14 h-14 mx-auto mb-2">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15" fill="none"
                        strokeWidth="3" strokeLinecap="round"
                        className="transition-all duration-500"
                        stroke={col.id === 'idea' ? '#eab308' : col.id === 'todo' ? '#a855f7' : col.id === 'doing' ? '#3b82f6' : '#10b981'}
                        strokeDasharray={`${pct * 0.942} 94.2`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                      {col.count}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-500">{col.title}</p>
                  <p className="text-[10px] text-gray-400">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tag distribution — horizontal pills */}
        {tagStats.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4">タグ分布</h3>
            <div className="space-y-2.5">
              {tagStats.map((tag) => (
                <div key={tag.id} className="flex items-center gap-3">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color + '18', color: tag.color }}
                  >
                    {tag.label}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(tag.count / maxTagCount) * 100}%`,
                        backgroundColor: tag.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 tabular-nums w-6 text-right">{tag.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily activity chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-1">デイリーアクティビティ</h3>
          <p className="text-[11px] text-gray-400 mb-4">過去14日間のポイント推移</p>
          <div className="flex items-end gap-[3px] h-28">
            {dailyData.map((d, i) => {
              const h = d.points > 0 ? Math.max((d.points / maxDaily) * 100, 8) : 3;
              const isToday = i === dailyData.length - 1;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {d.label}: {d.points}pt
                  </div>
                  <div
                    className={`w-full rounded-sm transition-all duration-300 ${
                      isToday
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                        : d.points > 0
                        ? 'bg-gradient-to-t from-indigo-400 to-indigo-300 group-hover:from-indigo-500 group-hover:to-indigo-400'
                        : 'bg-gray-100'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                  <span className={`text-[8px] tabular-nums ${isToday ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                    {d.label.split('/')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly trend */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-1">ウィークリートレンド</h3>
          <p className="text-[11px] text-gray-400 mb-4">週ごとの合計ポイント</p>
          <div className="flex items-end gap-2 h-24">
            {weeklyData.map((w, i) => {
              const h = w.points > 0 ? Math.max((w.points / maxWeekly) * 100, 8) : 3;
              const isLast = i === weeklyData.length - 1;
              return (
                <div key={w.week} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {w.week}: {w.points}pt
                  </div>
                  {w.points > 0 && (
                    <span className="text-[9px] font-semibold text-gray-400 tabular-nums">{w.points}</span>
                  )}
                  <div
                    className={`w-full rounded-md transition-all duration-300 ${
                      isLast
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        : w.points > 0
                        ? 'bg-gradient-to-t from-emerald-400 to-emerald-300 group-hover:from-emerald-500 group-hover:to-emerald-400'
                        : 'bg-gray-100'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                  <span className={`text-[9px] tabular-nums ${isLast ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    {w.week.split('-')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ icon, value, unit, label, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-3.5 text-white`}>
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="opacity-80 mb-2">{icon}</div>
        <p className="text-xl md:text-2xl font-black leading-none">
          {value}<span className="text-sm font-semibold opacity-70 ml-0.5">{unit}</span>
        </p>
        <p className="text-[10px] opacity-70 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}
