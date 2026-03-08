import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE = 'https://api.npoint.io';

export function useCloudSync(tasks, setTasks) {
  const [syncId, setSyncId] = useState(() => localStorage.getItem('kanban-sync-id') || '');
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);
  const skipNextAutoSync = useRef(false);

  // Save sync ID to localStorage
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
        method: 'PATCH',
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

  // Create new sync bin on npoint.io
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
      const data = await res.json();
      // npoint returns the full URL, extract the ID
      const id = data.id || new URL(data.url || data).pathname.split('/').pop();
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
  const joinSync = useCallback((id) => {
    const cleanId = id.trim().split('/').pop();
    setSyncId(cleanId);
    // Auto-download after joining
    setTimeout(() => {
      setSyncing(true);
      fetch(`${API_BASE}/${cleanId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`取得失敗: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data?.tasks && Array.isArray(data.tasks)) {
            skipNextAutoSync.current = true;
            setTasks(data.tasks);
            setLastSynced(new Date());
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setSyncing(false));
    }, 100);
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
