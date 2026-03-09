import { useState } from 'react';
import { Mic, Loader2, X, Trash2, Sparkles, AlertTriangle, Square, CheckCircle2, Plus } from 'lucide-react';

const COLUMN_LABELS = { idea: 'アイデア', todo: '未着手', doing: '実行中' };

export default function VoiceInput({ voice, onAddTasks, size = 20 }) {
  const { status, transcript, interimText, parsedTasks, setParsedTasks, errorMessage, startListening, stopListening, reset, parseWithGemini } = voice;
  const [modalOpen, setModalOpen] = useState(false);
  // 'recording' | 'confirm-transcript' | 'parsing' | 'confirm-tasks'
  const [step, setStep] = useState('recording');

  const handleOpen = () => {
    setModalOpen(true);
    setStep('recording');
  };

  const handleClose = () => {
    reset();
    setModalOpen(false);
    setStep('recording');
  };

  const handleStart = () => {
    startListening();
  };

  const handleStop = () => {
    stopListening();
    // After stopping, move to confirm-transcript step
    setStep('confirm-transcript');
  };

  const handleConfirmTranscript = () => {
    // User confirmed transcript, now parse with Gemini
    setStep('parsing');
    if (voice.parseWithGemini) {
      voice.parseWithGemini(transcript);
    }
  };

  const handleSkipGemini = () => {
    // Create a single task from transcript directly
    setParsedTasks([{ title: transcript, column: 'idea', priority: false }]);
    setStep('confirm-tasks');
  };

  const handleRemoveTask = (index) => {
    setParsedTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditTitle = (index, newTitle) => {
    setParsedTasks((prev) => prev.map((t, i) => (i === index ? { ...t, title: newTitle } : t)));
  };

  const handleEditColumn = (index, newColumn) => {
    setParsedTasks((prev) => prev.map((t, i) => (i === index ? { ...t, column: newColumn } : t)));
  };

  const handleTogglePriority = (index) => {
    setParsedTasks((prev) => prev.map((t, i) => (i === index ? { ...t, priority: !t.priority } : t)));
  };

  const handleAddAll = () => {
    if (parsedTasks.length > 0) {
      onAddTasks(parsedTasks);
      handleClose();
    }
  };

  // Track step transitions based on status changes
  const effectiveStep = (() => {
    if (status === 'listening') return 'recording';
    if (step === 'confirm-transcript' && status === 'idle' && transcript) return 'confirm-transcript';
    if (status === 'processing') return 'parsing';
    if (status === 'done' && parsedTasks.length > 0) return 'confirm-tasks';
    if (status === 'done' && parsedTasks.length === 0) return 'confirm-tasks';
    if (status === 'error' && transcript) return 'confirm-transcript';
    return step;
  })();

  const statusConfig = {
    recording: { label: status === 'listening' ? '聴取中...' : '待機中', color: status === 'listening' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500' },
    'confirm-transcript': { label: 'テキスト確認', color: 'bg-amber-100 text-amber-600' },
    parsing: { label: '解析中...', color: 'bg-indigo-100 text-indigo-600' },
    'confirm-tasks': { label: 'タスク確認', color: 'bg-emerald-100 text-emerald-600' },
  };

  const currentStatus = statusConfig[effectiveStep] || statusConfig.recording;

  return (
    <>
      {/* Mic button - opens modal */}
      <button
        onClick={handleOpen}
        className="p-2 rounded-xl transition-all text-gray-400 hover:bg-gray-100"
        aria-label="音声入力"
      >
        <Mic size={size} />
      </button>

      {/* Full modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={handleClose}>
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" />
                <h3 className="font-bold text-gray-800">音声タスク追加</h3>
              </div>
              <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2">
                {['recording', 'confirm-transcript', 'confirm-tasks'].map((s, i) => {
                  const stepLabels = ['録音', '確認', 'タスク'];
                  const stepIdx = ['recording', 'confirm-transcript', 'confirm-tasks'].indexOf(effectiveStep === 'parsing' ? 'confirm-tasks' : effectiveStep);
                  const isActive = i === stepIdx;
                  const isDone = i < stepIdx;
                  return (
                    <div key={s} className="flex items-center gap-1.5">
                      {i > 0 && <div className={`w-6 h-0.5 ${isDone ? 'bg-indigo-400' : 'bg-gray-200'}`} />}
                      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                        isActive ? 'bg-indigo-100 text-indigo-600' :
                        isDone ? 'bg-indigo-500 text-white' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {isDone && <CheckCircle2 size={10} />}
                        {stepLabels[i]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status badge */}
              <div className="flex items-center justify-center">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${currentStatus.color}`}>
                  {status === 'listening' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  {effectiveStep === 'parsing' && <Loader2 size={12} className="animate-spin" />}
                  {currentStatus.label}
                </span>
              </div>

              {/* ===== STEP 1: Recording ===== */}
              {effectiveStep === 'recording' && (
                <>
                  <div className="flex justify-center py-4">
                    {status === 'listening' ? (
                      <button
                        onClick={handleStop}
                        className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-200 hover:bg-red-600 transition-all animate-pulse"
                      >
                        <Square size={32} fill="white" />
                      </button>
                    ) : (
                      <button
                        onClick={handleStart}
                        className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                      >
                        <Mic size={32} />
                      </button>
                    )}
                  </div>

                  {status === 'idle' && (
                    <p className="text-center text-xs text-gray-400">
                      ボタンを押して話しかけてください
                    </p>
                  )}

                  {status === 'listening' && (
                    <p className="text-center text-xs text-gray-400">
                      停止ボタンで録音を終了できます
                    </p>
                  )}

                  {/* Live transcript during listening */}
                  {status === 'listening' && (transcript || interimText) && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold text-gray-400 mb-1">認識中...</p>
                      <p className="text-sm text-gray-700">
                        {transcript}
                        {interimText && <span className="text-gray-400">{interimText}</span>}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ===== STEP 2: Confirm Transcript ===== */}
              {effectiveStep === 'confirm-transcript' && (
                <>
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-gray-400 mb-1">認識テキスト</p>
                    <p className="text-sm text-gray-700">{transcript}</p>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-start gap-2 bg-red-50 rounded-xl px-4 py-3">
                      <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 text-center font-semibold">
                    この内容でタスクを作成しますか？
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={handleConfirmTranscript}
                      className="w-full px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} />
                      AIで分析してタスク作成
                    </button>
                    <button
                      onClick={handleSkipGemini}
                      className="w-full px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      そのままタスクとして追加
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { reset(); setStep('recording'); }}
                        className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100"
                      >
                        録り直す
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ===== STEP 3a: Parsing ===== */}
              {effectiveStep === 'parsing' && (
                <>
                  {transcript && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold text-gray-400 mb-1">認識テキスト</p>
                      <p className="text-sm text-gray-700">{transcript}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 py-6 text-indigo-500">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-semibold">Geminiで解析中...</span>
                  </div>
                </>
              )}

              {/* ===== STEP 3b: Confirm Tasks ===== */}
              {effectiveStep === 'confirm-tasks' && (
                <>
                  {transcript && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold text-gray-400 mb-1">認識テキスト</p>
                      <p className="text-sm text-gray-700">{transcript}</p>
                    </div>
                  )}

                  {parsedTasks.length > 0 ? (
                    <>
                      <p className="text-xs font-bold text-gray-500">
                        以下のタスクを追加しますか？（{parsedTasks.length}件）
                      </p>
                      <div className="space-y-2">
                        {parsedTasks.map((task, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <input
                                type="text"
                                value={task.title}
                                onChange={(e) => handleEditTitle(i, e.target.value)}
                                className="flex-1 text-sm font-medium bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none py-0.5"
                              />
                              <button onClick={() => handleRemoveTask(i)} className="p-1 text-gray-300 hover:text-red-500 shrink-0">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={task.column}
                                onChange={(e) => handleEditColumn(i, e.target.value)}
                                className="text-[11px] font-semibold bg-white border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                              >
                                {Object.entries(COLUMN_LABELS).map(([id, label]) => (
                                  <option key={id} value={id}>{label}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleTogglePriority(i)}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                                  task.priority
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {task.priority ? '重要' : '通常'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleClose}
                          className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={handleAddAll}
                          className="flex-1 px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                        >
                          追加する ({parsedTasks.length})
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center py-6 text-gray-400 text-sm">
                        タスクが検出されませんでした
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSkipGemini}
                          className="flex-1 px-4 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100"
                        >
                          テキストをそのまま追加
                        </button>
                        <button
                          onClick={handleClose}
                          className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                        >
                          閉じる
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
