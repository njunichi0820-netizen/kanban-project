import { useState, useCallback, useRef, useEffect } from 'react';

const GITHUB_API = 'https://api.github.com';

export function useCloudSync(tasks, setTasks, archivedTasks, setArchivedTasks, points, setPoints) {
  const [gistId, setGistId] = useState(() => localStorage.getItem('kanban-gist-id') || '');
  const [token, setToken] = useState(() => localStorage.getItem('kanban-gh-token') || '');
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);
  const suppressUntil = useRef(0);
  const initialFetchDone = useRef(false);

  const isConfigured = !!(gistId && token);

  useEffect(() => {
    if (gistId) localStorage.setItem('kanban-gist-id', gistId);
    if (token) localStorage.setItem('kanban-gh-token', token);
  }, [gistId, token]);

  // Download from Gist
  const downloadTasks = useCallback(async (gId, tk) => {
    const useGistId = gId || gistId;
    const useToken = tk || token;
    if (!useGistId || !useToken) return false;
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(`${GITHUB_API}/gists/${useGistId}`, {
        headers: { 'Authorization': `Bearer ${useToken}` },
      });
      if (res.status === 401) throw new Error('トークンが無効です');
      if (res.status === 404) throw new Error('Gist IDが見つかりません');
      if (!res.ok) throw new Error(`取得失敗: ${res.status}`);
      const gist = await res.json();
      const file = gist.files?.['kanban-data.json'];
      if (!file) throw new Error('kanban-data.json が見つかりません');
      const data = JSON.parse(file.content);
      if (data?.tasks && Array.isArray(data.tasks)) {
        suppressUntil.current = Date.now() + 5000;
        setTasks(data.tasks);
        if (data.archivedTasks && Array.isArray(data.archivedTasks) && setArchivedTasks) {
          setArchivedTasks(data.archivedTasks);
        }
        if (data.points && setPoints) {
          setPoints(data.points);
        }
        setLastSynced(new Date());
        return true;
      }
      return false;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [gistId, token, setTasks, setArchivedTasks, setPoints]);

  // Upload to Gist
  const uploadTasks = useCallback(async (data, archived, pts) => {
    if (!isConfigured) return;
    setSyncing(true);
    setError(null);
    try {
      const payload = { tasks: data, updatedAt: Date.now() };
      if (archived) payload.archivedTasks = archived;
      if (pts) payload.points = pts;
      const res = await fetch(`${GITHUB_API}/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            'kanban-data.json': {
              content: JSON.stringify(payload),
            },
          },
        }),
      });
      if (res.status === 401) throw new Error('トークンが無効です');
      if (res.status === 404) throw new Error('Gist IDが見つかりません');
      if (!res.ok) throw new Error(`送信失敗: ${res.status}`);
      setLastSynced(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [gistId, token, isConfigured]);

  // AUTO-FETCH on app load
  useEffect(() => {
    if (isConfigured && !initialFetchDone.current) {
      initialFetchDone.current = true;
      downloadTasks();
    }
  }, [isConfigured, downloadTasks]);

  // Auto-upload when data changes (debounced)
  useEffect(() => {
    if (!isConfigured) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (Date.now() < suppressUntil.current) return;
      uploadTasks(tasks, archivedTasks, points);
    }, 3000);
    return () => clearTimeout(debounceTimer.current);
  }, [tasks, archivedTasks, points, isConfigured, uploadTasks]);

  // Create new Gist
  const createGist = useCallback(async (ghToken) => {
    setSyncing(true);
    setError(null);
    try {
      const payload = { tasks, updatedAt: Date.now() };
      if (archivedTasks) payload.archivedTasks = archivedTasks;
      if (points) payload.points = points;
      const res = await fetch(`${GITHUB_API}/gists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Kanban Board Sync Data',
          public: false,
          files: {
            'kanban-data.json': {
              content: JSON.stringify(payload),
            },
          },
        }),
      });
      if (res.status === 401) throw new Error('トークンが無効です。gistスコープを確認してください');
      if (!res.ok) throw new Error(`作成失敗: ${res.status}`);
      const gist = await res.json();
      suppressUntil.current = Date.now() + 5000;
      setToken(ghToken);
      setGistId(gist.id);
      initialFetchDone.current = true;
      setLastSynced(new Date());
      return gist.id;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [tasks, archivedTasks, points]);

  // Setup with existing Gist
  const setupSync = useCallback(async (ghToken, existingGistId) => {
    setToken(ghToken);
    setGistId(existingGistId);
    initialFetchDone.current = true;
    await downloadTasks(existingGistId, ghToken);
  }, [downloadTasks]);

  // Export
  const exportData = useCallback(() => {
    const payload = { tasks, exportedAt: Date.now() };
    if (archivedTasks) payload.archivedTasks = archivedTasks;
    if (points) payload.points = points;
    return JSON.stringify(payload, null, 2);
  }, [tasks, archivedTasks, points]);

  // Import
  const importData = useCallback((jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data?.tasks && Array.isArray(data.tasks)) {
        suppressUntil.current = Date.now() + 5000;
        setTasks(data.tasks);
        if (data.archivedTasks && Array.isArray(data.archivedTasks) && setArchivedTasks) {
          setArchivedTasks(data.archivedTasks);
        }
        if (data.points && setPoints) {
          setPoints(data.points);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [setTasks, setArchivedTasks, setPoints]);

  return {
    gistId,
    token,
    isConfigured,
    syncing,
    lastSynced,
    error,
    createGist,
    setupSync,
    syncNow: () => downloadTasks(),
    pushNow: () => uploadTasks(tasks, archivedTasks, points),
    exportData,
    importData,
    clearSync: () => {
      setGistId('');
      setToken('');
      localStorage.removeItem('kanban-gist-id');
      localStorage.removeItem('kanban-gh-token');
      setLastSynced(null);
      setError(null);
      initialFetchDone.current = false;
    },
  };
}
