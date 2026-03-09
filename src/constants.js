export const COLUMNS = [
  { id: 'idea', title: 'Inbox', desc: '気になること全部ここへ', color: 'bg-yellow-500', gradient: 'from-yellow-400 to-amber-500', lightBg: 'bg-yellow-50', lightText: 'text-yellow-600', ring: 'ring-yellow-200', icon: 'Lightbulb' },
  { id: 'todo', title: 'Next Action', desc: '次にやる具体的な行動', color: 'bg-purple-500', gradient: 'from-purple-400 to-violet-500', lightBg: 'bg-purple-50', lightText: 'text-purple-600', ring: 'ring-purple-200', icon: 'ClipboardList' },
  { id: 'doing', title: 'Focus', desc: '今集中している作業', color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600', lightBg: 'bg-blue-50', lightText: 'text-blue-600', ring: 'ring-blue-200', icon: 'Zap' },
  { id: 'done', title: 'Done', desc: '完了した成果', color: 'bg-emerald-500', gradient: 'from-emerald-400 to-teal-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-600', ring: 'ring-emerald-200', icon: 'PartyPopper' },
];

export const GTD_DETAILS = {
  idea: {
    title: 'Inbox (収集)',
    rules: [
      '頭の中の「気になること」をすべてここに入れる',
      '判断・整理は後回し、まず全部出し切る',
      '定期的にレビューして Next Action に移すか削除する',
      '2分以内にできるものはすぐやって Done へ',
    ],
  },
  todo: {
    title: 'Next Action (次の行動)',
    rules: [
      '「具体的に何をするか」が明確なタスクだけ置く',
      '曖昧なら分解してから入れる（例: 調べる→〇〇を検索する）',
      '優先度をつけて上から順に着手する',
      '週次レビューで棚卸しする',
    ],
  },
  doing: {
    title: 'Focus (実行中)',
    rules: [
      '同時に進めるのは1〜3個まで（WIP制限）',
      '「今やっている」ものだけをここに置く',
      '終わったらすぐ Done へ移動する',
      '詰まったら Next Action に戻して別のタスクに着手',
    ],
  },
  done: {
    title: 'Done (完了)',
    rules: [
      '完了したタスクの記録を残す',
      '振り返りに活用する（週次レビュー）',
      '溜まってきたらアーカイブで整理',
      '達成感を味わってモチベーションを維持！',
    ],
  },
};

export const EMPTY_MESSAGES = {
  idea: { icon: '💡', message: 'まず頭の中を全部出そう' },
  todo: { icon: '📋', message: '次の具体的アクションを決めよう' },
  doing: { icon: '🔥', message: '集中する作業を選ぼう' },
  done: { icon: '🎉', message: '完了タスクがここに表示されます' },
};

export const POINT_RULES = [
  { action: 'タスク追加', points: '+1 pt', description: 'アイデアやタスクを新規作成' },
  { action: 'タスク完了', points: '+10 pt', description: 'タスクを完了カラムに移動' },
  { action: 'サブタスク完了', points: '+3 pt', description: 'サブタスクをチェック' },
];

export const LEVEL_TABLE = [
  { name: 'ビギナー', min: 0 },
  { name: 'ルーキー', min: 30 },
  { name: 'レギュラー', min: 100 },
  { name: 'エキスパート', min: 300 },
  { name: 'マスター', min: 600 },
  { name: 'レジェンド', min: 1000 },
];

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
