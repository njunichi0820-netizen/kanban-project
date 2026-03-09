import { useState, useCallback, useRef } from 'react';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const STORAGE_KEY = 'kanban-gemini-key';

const PROMPT_TEMPLATE = (text) => `あなたはタスク管理アシスタントです。以下の音声入力テキストからタスクを抽出してください。

ルール:
- 複数タスクがあれば分割する
- 各タスクにtitleとcolumn(idea/todo/doing)とpriority(true/false)を設定
- 緊急・重要そうなものはpriority: true
- 具体的な行動はtodo、アイデア段階はidea、すでに着手中はdoing
- JSON配列のみ返す（説明不要）

入力: "${text}"

出力形式: [{"title":"...", "column":"todo", "priority": false}, ...]`;

export function useVoiceTask() {
  const [status, setStatus] = useState('idle'); // idle | listening | processing | done | error
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [parsedTasks, setParsedTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const parseWithGemini = useCallback(async (text) => {
    const apiKey = localStorage.getItem(STORAGE_KEY);
    if (!apiKey) {
      setStatus('error');
      setErrorMessage('Gemini APIキーが設定されていません。設定画面で入力してください。');
      return;
    }

    setStatus('processing');

    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT_TEMPLATE(text) }] }],
          generationConfig: {
            temperature: 0.2,
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

      const tasks = JSON.parse(raw);
      if (!Array.isArray(tasks)) throw new Error('レスポンスが配列ではありません');

      const validColumns = ['idea', 'todo', 'doing'];
      const validated = tasks.map((t) => ({
        title: String(t.title || '').trim(),
        column: validColumns.includes(t.column) ? t.column : 'todo',
        priority: Boolean(t.priority),
      })).filter((t) => t.title.length > 0);

      setParsedTasks(validated);
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setErrorMessage(e.message);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setErrorMessage('このブラウザは音声認識に対応していません。');
      return;
    }

    const apiKey = localStorage.getItem(STORAGE_KEY);
    if (!apiKey) {
      setStatus('error');
      setErrorMessage('Gemini APIキーが設定されていません。設定画面で入力してください。');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;

    finalTranscriptRef.current = '';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      finalTranscriptRef.current = final;
      setTranscript(final);
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // no-speech is not a real error, just no input detected
        return;
      }
      setStatus('error');
      setErrorMessage(`音声認識エラー: ${event.error}`);
    };

    recognition.onend = () => {
      // If continuous mode ended unexpectedly while still listening, restart
      if (recognitionRef.current && status === 'listening') {
        // Don't restart - user will manually control
      }
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setStatus('listening');
    setTranscript('');
    setInterimText('');
    setParsedTasks([]);
    setErrorMessage('');
    recognition.start();
  }, [parseWithGemini, status]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setInterimText('');
    if (status === 'listening') {
      const text = finalTranscriptRef.current;
      if (text.trim()) {
        setTranscript(text);
        // Don't auto-parse - wait for user confirmation
        setStatus('idle');
      } else {
        setStatus('idle');
      }
    }
  }, [status]);

  const reset = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    finalTranscriptRef.current = '';
    setStatus('idle');
    setTranscript('');
    setInterimText('');
    setParsedTasks([]);
    setErrorMessage('');
  }, []);

  return { status, transcript, interimText, parsedTasks, setParsedTasks, errorMessage, startListening, stopListening, reset, parseWithGemini };
}
