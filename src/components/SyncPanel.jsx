import { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Copy, Check, Link, Unlink } from 'lucide-react';

export default function SyncPanel({ sync, onClose }) {
  const { syncId, syncing, lastSynced, error, createSync, joinSync, syncNow, pushNow, clearSync } = sync;
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(syncId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = () => {
    createSync();
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinInput.trim()) {
      joinSync(joinInput.trim());
      setJoinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-5 py-4 border-b">
          {syncId ? <Cloud size={20} className="text-blue-500" /> : <CloudOff size={20} className="text-gray-400" />}
          <h3 className="font-semibold text-gray-800">デバイス同期</h3>
        </div>

        <div className="p-5 space-y-4">
          {syncId ? (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">同期ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono text-gray-700 truncate">
                    {syncId}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="p-2 text-gray-500 hover:text-blue-500 bg-gray-100 rounded-lg"
                    title="コピー"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  このIDを別のデバイスで入力すると同期できます
                </p>
              </div>

              {lastSynced && (
                <p className="text-xs text-gray-400">
                  最終同期: {lastSynced.toLocaleTimeString('ja-JP')}
                </p>
              )}

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={syncNow}
                  disabled={syncing}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                  取得
                </button>
                <button
                  onClick={pushNow}
                  disabled={syncing}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  <Cloud size={14} />
                  送信
                </button>
              </div>

              <button
                onClick={clearSync}
                className="flex items-center justify-center gap-1 w-full px-3 py-2 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <Unlink size={14} />
                同期解除
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                同期IDを作成して、PCとスマホで同じデータを共有できます。
              </p>

              <button
                onClick={handleCreate}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <Link size={16} />
                新しい同期IDを作成
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400">または</span>
                </div>
              </div>

              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  type="text"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  placeholder="同期IDを入力"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  disabled={!joinInput.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 disabled:opacity-30"
                >
                  参加
                </button>
              </form>
            </>
          )}
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
