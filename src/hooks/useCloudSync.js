import { useState, useCallback, useRef, useEffect } from 'react';

// jsonbin-zeta.vercel.app: free, no signup, CORS OK, ID in response body
const API_BASE = 'https://jsonbin-zeta.vercel.app/api/bins';

export function useCloudSync(tasks, setTasks) {
  const [syncId, setSyncId] = useState(() => localStorage.getItem('kanban-sync-id') || '');
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);
  const skipNextAutoSync = useRef(false);

  useEffect(() => {
    if (syncId) {
      localStorage.setItem('kanban-sync-id', syncId);
    }
  }, [syncId]);

  // Upload tasks to cloud
  const uploadTasks = useCallback(async (data) => {
    if (!syncId) return;
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${syncId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: data, updatedAt: Date.now() }),
      });
      if (!res.ok) throw new Error(`送信失敗: ${res.status}`);
      setLastSynced(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [syncId]);

  // Download tasks from cloud
  const downloadTasks = useCallback(async () => {
    if (!syncId) return;
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${syncId}`);
      if (!res.ok) throw new Error(`取得失敗: ${res.status}`);
      const data = await res.json();
      if (data?.tasks && Array.isArray(data.tasks)) {
        skipNextAutoSync.current = true;
        setTasks(data.tasks);
        setLastSynced(new Date());
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [syncId, setTasks]);

  // Auto-upload when tasks change (debounced)
  useEffect(() => {
    if (!syncId || tasks.length === 0) return;
    if (skipNextAutoSync.current) {
      skipNextAutoSync.current = false;
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      uploadTasks(tasks);
    }, 3000);
    return () => clearTimeout(debounceTimer.current);
  }, [tasks, syncId, uploadTasks]);

  // Create new sync bin - ID comes from response JSON body
  const createSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, updatedAt: Date.now() }),
      });
      if (!res.ok) throw new Error(`作成失敗: ${res.status}`);
      const result = await res.json();
      const id = result.id;
      if (!id) throw new Error('IDの取得に失敗しました');
      setSyncId(id);
      setLastSynced(new Date());
      return id;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [tasks]);

  // Join existing sync
  const joinSync = useCallback(async (id) => {
    const cleanId = id.trim().split('/').pop();
    setSyncId(cleanId);
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${cleanId}`);
      if (!res.ok) throw new Error(`取得失敗: ${res.status}`);
      const data = await res.json();
      if (data?.tasks && Array.isArray(data.tasks)) {
        skipNextAutoSync.current = true;
        setTasks(data.tasks);
        setLastSynced(new Date());
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [setTasks]);

  return {
    syncId,
    syncing,
    lastSynced,
    error,
    createSync,
    joinSync,
    syncNow: downloadTasks,
    pushNow: () => uploadTasks(tasks),
    clearSync: () => {
      setSyncId('');
      localStorage.removeItem('kanban-sync-id');
      setLastSynced(null);
      setError(null);
    },
  };
}
