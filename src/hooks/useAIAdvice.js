import { useState, useCallback } from 'react';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const STORAGE_KEY = 'kanban-gemini-key';

const buildPrompt = (task) => `あなたはタスク管理のプロフェッショナルアドバイザーです。以下のタスクについて分析し、6つの観点からアドバイスをJSON形式で返してください。

タスク名: ${task.title}
${task.description ? `説明: ${task.description}` : ''}
${task.subtasks?.length ? `サブタスク: ${task.subtasks.map(s => s.text).join(', ')}` : ''}

以下のJSON形式で返してください（説明文不要、JSONのみ）:
{
  "specificity": "タスクの具体性についてのフィードバック（曖昧なら具体化の提案）",
  "subtasks": ["WBS分解した具体的なサブタスク1", "サブタスク2", "サブタスク3"],
  "priority": "優先度と工数の見積もり（高/中/低、所要時間の目安）",
  "risks": "考えられるリスクや障害",
  "firstStep": "最初の一歩として今すぐできる具体的なアクション",
  "motivation": "やる気が出る応援メッセージ（短く元気に）"
}`;

export function useAIAdvice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasApiKey = useCallback(() => {
    return !!localStorage.getItem(STORAGE_KEY);
  }, []);

  const generateAdvice = useCallback(async (task) => {
    const apiKey = localStorage.getItem(STORAGE_KEY);
    if (!apiKey) {
      throw new Error('Gemini APIキーが設定されていません');
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(task) }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || `API Error: ${res.status}`;
        if (msg.includes('quota') || msg.includes('Quota')) {
          throw new Error('APIの利用制限に達しました。しばらく待ってから再試行するか、APIキーの課金プランをご確認ください。');
        }
        throw new Error(msg);
      }

      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error('APIからの応答が空です');

      const advice = JSON.parse(raw);
      return {
        ...advice,
        generatedAt: Date.now(),
      };
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateAdvice, loading, error, hasApiKey };
}
