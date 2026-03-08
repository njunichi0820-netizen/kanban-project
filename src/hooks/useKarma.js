import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const LEVELS = [
  { name: 'ビギナー', min: 0 },
  { name: 'ルーキー', min: 50 },
  { name: 'レギュラー', min: 150 },
  { name: 'ベテラン', min: 400 },
  { name: 'エキスパート', min: 800 },
  { name: 'マスター', min: 1500 },
  { name: 'レジェンド', min: 3000 },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - jan1) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function useKarma() {
  const [karma, setKarma] = useLocalStorage('kanban-karma', {
    total: 0,
    daily: {},
    lastActiveDate: null,
    streak: 0,
  });

  const addPoints = useCallback((points) => {
    setKarma((prev) => {
      const key = todayKey();
      const daily = { ...prev.daily };
      daily[key] = (daily[key] || 0) + points;

      // Calculate streak
      let streak = prev.streak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (prev.lastActiveDate === key) {
        // Same day, streak unchanged
      } else if (prev.lastActiveDate === yesterdayKey) {
        streak += 1;
      } else if (prev.lastActiveDate !== key) {
        streak = 1;
      }

      return {
        total: prev.total + points,
        daily,
        lastActiveDate: key,
        streak,
      };
    });
  }, [setKarma]);

  const onTaskComplete = useCallback(() => addPoints(10), [addPoints]);
  const onSubtaskComplete = useCallback(() => addPoints(3), [addPoints]);

  const getLevel = useCallback(() => {
    const total = karma.total;
    let current = LEVELS[0];
    let next = LEVELS[1] || null;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (total >= LEVELS[i].min) {
        current = LEVELS[i];
        next = LEVELS[i + 1] || null;
        break;
      }
    }
    const progress = next ? (total - current.min) / (next.min - current.min) : 1;
    return { current, next, progress };
  }, [karma.total]);

  // Get daily data for last N days
  const getDailyData = useCallback((days = 14) => {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      result.push({ date: key, label: `${d.getMonth() + 1}/${d.getDate()}`, points: karma.daily[key] || 0 });
    }
    return result;
  }, [karma.daily]);

  // Get weekly data for last N weeks
  const getWeeklyData = useCallback((weeks = 8) => {
    const weekMap = {};
    Object.entries(karma.daily).forEach(([dateStr, pts]) => {
      const wk = getWeekKey(dateStr);
      weekMap[wk] = (weekMap[wk] || 0) + pts;
    });

    const result = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const key = getWeekKey(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      if (!result.find(r => r.week === key)) {
        result.push({ week: key, points: weekMap[key] || 0 });
      }
    }
    return result;
  }, [karma.daily]);

  return {
    karma,
    addPoints,
    onTaskComplete,
    onSubtaskComplete,
    getLevel,
    getDailyData,
    getWeeklyData,
  };
}
