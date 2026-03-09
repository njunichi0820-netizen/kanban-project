import { useState } from 'react';
import { Mic, MicOff, Loader2, X, Trash2, Sparkles, AlertTriangle, Square } from 'lucide-react';

const COLUMN_LABELS = { idea: 'アイデア', todo: '未着手', doing: '実行中' };

export default function VoiceInput({ voice, onAddTasks, size = 20 }) {
  const { status, transcript, interimText, parsedTasks, setParsedTasks, errorMessage, startListening, stopListening, reset } = voice;
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpen = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    reset();
    setModalOpen(false);
  };

  const handleStart = () => {
    startListening();
  };

  const handleStop = () => {
    stopListening();
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

  const statusLabel = {
    idle: '待機中',
    listening: '聴取中...',
    processing: '解析中...',
    done: '完了',
    error: 'エラー',
  };

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
              {/* Status indicator */}
              <div className="flex items-center justify-center">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                  status === 'listening' ? 'bg-red-100 text-red-600' :
                  status === 'processing' ? 'bg-indigo-100 text-indigo-600' :
                  status === 'done' ? 'bg-emerald-100 text-emerald-600' :
                  status === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {status === 'listening' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  {status === 'processing' && <Loader2 size={12} className="animate-spin" />}
                  {statusLabel[status]}
                </span>
              </div>

              {/* Big start/stop button */}
              {(status === 'idle' || status === 'listening' || status === 'error') && !parsedTasks.length && (
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
              )}

              {status === 'idle' && !parsedTasks.length && (
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

              {/* Final transcript (after listening) */}
              {status !== 'listening' && transcript && (
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">認識テキスト</p>
                  <p className="text-sm text-gray-700">{transcript}</p>
                </div>
              )}

              {/* Processing */}
              {status === 'processing' && (
                <div className="flex items-center justify-center gap-2 py-6 text-indigo-500">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm font-semibold">Geminiで解析中...</span>
                </div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div className="flex items-start gap-2 bg-red-50 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Task list */}
              {status === 'done' && parsedTasks.length > 0 && (
                <>
                  <p className="text-xs font-bold text-gray-500">{parsedTasks.length}件のタスクを検出</p>
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

                  {/* Actions */}
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
                      すべて追加 ({parsedTasks.length})
                    </button>
                  </div>
                </>
              )}

              {status === 'done' && parsedTasks.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  タスクが検出されませんでした
                </div>
              )}

              {/* Retry for errors */}
              {status === 'error' && (
                <div className="flex gap-2">
                  <button onClick={handleClose} className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                    閉じる
                  </button>
                  <button onClick={handleStart} className="flex-1 px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">
                    もう一度
                  </button>
                </div>
              )}

              {/* Close button when done with no tasks or after idle */}
              {(status === 'done' && parsedTasks.length === 0) && (
                <button onClick={handleClose} className="w-full px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                  閉じる
                </button>
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
