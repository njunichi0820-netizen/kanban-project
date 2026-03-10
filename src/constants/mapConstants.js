// TRL (Technology Readiness Level) - 9段階
export const TRL_LEVELS = [
  { level: 1, label: '基礎研究', desc: '基本原理の観察', color: '#E5E7EB' },
  { level: 2, label: '概念定義', desc: 'コンセプト定式化', color: '#D1D5DB' },
  { level: 3, label: '机上検証', desc: '解析的に重要機能を実証', color: '#93C5FD' },
  { level: 4, label: 'ラボ検証', desc: '実験室環境での検証', color: '#60A5FA' },
  { level: 5, label: '試作検証', desc: '実環境に近い条件', color: '#3B82F6' },
  { level: 6, label: 'パイロット実証', desc: '代表的環境でのプロトタイプ', color: '#2563EB' },
  { level: 7, label: '実環境実証', desc: '実運用環境での実証', color: '#34D399' },
  { level: 8, label: '量産検証', desc: '適格性確認', color: '#10B981' },
  { level: 9, label: '量産実績', desc: '実績確立', color: '#059669' },
];

// 5M+E 観点
export const PERSPECTIVES_5ME = [
  { id: 'man', label: 'Man', desc: '人', color: '#F59E0B' },
  { id: 'machine', label: 'Machine', desc: '設備', color: '#3B82F6' },
  { id: 'material', label: 'Material', desc: '材料', color: '#10B981' },
  { id: 'method', label: 'Method', desc: '方法', color: '#8B5CF6' },
  { id: 'measurement', label: 'Measurement', desc: '計測', color: '#EC4899' },
  { id: 'environment', label: 'Environment', desc: '環境', color: '#06B6D4' },
];

// 与件カテゴリ
export const CONSTRAINT_CATEGORIES = [
  { id: 'material', label: '材料', color: '#10B981' },
  { id: 'equipment', label: '設備', color: '#3B82F6' },
  { id: 'spec', label: 'SPEC', color: '#F59E0B' },
  { id: 'design', label: '設計', color: '#8B5CF6' },
  { id: 'factory', label: '工場与件', color: '#EF4444' },
];

// マップノードの深さラベル
export const DEPTH_LABELS_FULL = ['', '上位項目', 'QCDE分類', '要件項目', '技術確認項目', '因子', '水準'];
export const DEPTH_LABELS_SKIP = ['', 'QCDE分類', '要件項目', '技術確認項目', '因子', '水準'];

// QCDE色
export const QCDE_COLORS = {
  'Q:品質': '#4F6CF7',
  'C:コスト': '#14B8A6',
  'D:設備': '#10B981',
  'M:管理': '#F59E0B',
};
