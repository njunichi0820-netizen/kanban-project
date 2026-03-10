import { useState, useCallback } from 'react';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const STORAGE_KEY = 'kanban-gemini-key';

const buildPrompt = (nodeInfo) => `あなたはSPR（Self-Piercing Rivet）技術の専門家です。以下の検証項目に関連する過去事例やナレッジをJSON形式で提案してください。

ツリー位置: ${nodeInfo.breadcrumb || nodeInfo.name}
ノード名: ${nodeInfo.name}
${nodeInfo.perspective ? `確認観点(5M+E): ${nodeInfo.perspective}` : ''}
${nodeInfo.req ? `要件値: ${nodeInfo.req}` : ''}
${nodeInfo.kpi ? `KPI: ${nodeInfo.kpi}` : ''}
${nodeInfo.constraints?.length ? `与件: ${nodeInfo.constraints.join(', ')}` : ''}

以下のJSON形式で返してください（説明文不要、JSONのみ）:
{
  "cases": [
    {
      "title": "過去事例のタイトル",
      "description": "事例の概要（1-2文）",
      "relevance": "この検証項目との関連性",
      "excelLink": ""
    }
  ],
  "recommendations": ["推奨アクション1", "推奨アクション2"],
  "relatedKeywords": ["関連キーワード1", "関連キーワード2"]
}`;

export function useAICaseMatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const hasApiKey = useCallback(() => {
    return !!localStorage.getItem(STORAGE_KEY);
  }, []);

  const searchCases = useCallback(async (nodeInfo) => {
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
          contents: [{ parts: [{ text: buildPrompt(nodeInfo) }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API Error: ${res.status}`);
      }

      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error('APIからの応答が空です');

      const parsed = JSON.parse(raw);
      setResult(parsed);
      return parsed;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchCases, loading, error, result, hasApiKey };
}
