export const COLUMNS = [
  { id: 'idea', title: 'アイデア', color: 'bg-yellow-500', lightBg: 'bg-yellow-50', lightText: 'text-yellow-600', ring: 'ring-yellow-200' },
  { id: 'todo', title: '未着手', color: 'bg-purple-500', lightBg: 'bg-purple-50', lightText: 'text-purple-600', ring: 'ring-purple-200' },
  { id: 'doing', title: '進行中', color: 'bg-blue-500', lightBg: 'bg-blue-50', lightText: 'text-blue-600', ring: 'ring-blue-200' },
  { id: 'done', title: '完了', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-600', ring: 'ring-emerald-200' },
];

export const EMPTY_MESSAGES = {
  idea: { icon: '💡', message: 'アイデアを追加しましょう' },
  todo: { icon: '📋', message: 'タスクを計画しましょう' },
  doing: { icon: '🔥', message: '作業を始めましょう' },
  done: { icon: '🎉', message: '完了タスクがここに表示されます' },
};

export const DEFAULT_TAGS = [
  { id: 'project', label: 'Project', color: '#6366f1' },
  { id: 'purchase', label: 'Purchase', color: '#f59e0b' },
  { id: 'travel', label: 'Travel', color: '#06b6d4' },
  { id: 'health', label: 'Health', color: '#10b981' },
  { id: 'study', label: 'Study', color: '#8b5cf6' },
  { id: 'work', label: 'Work', color: '#3b82f6' },
  { id: 'personal', label: 'Personal', color: '#ec4899' },
  { id: 'finance', label: 'Finance', color: '#14b8a6' },
];
