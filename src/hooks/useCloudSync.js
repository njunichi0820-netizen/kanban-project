import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE = 'https://jsonblob.com/api/jsonBlob';

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

  // Create new sync blob
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
      // jsonblob returns ID in x-jsonblob-id header and location header
      const blobId = res.headers.get('x-jsonblob-id')
        || res.headers.get('location')?.split('/').pop();
      if (!blobId) throw new Error('IDの取得に失敗しました');
      setSyncId(blobId);
      setLastSynced(new Date());
      return blobId;
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
