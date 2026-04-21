/**
 * useOfflineSync — complete offline queue + sync manager for the Kiosk.
 *
 * Features:
 *   ✅  Detect online/offline via navigator.onLine + event listeners
 *   ✅  Queue any action while offline (IndexedDB via Dexie)
 *   ✅  Attach UUID requestId to every queued item (idempotency)
 *   ✅  Auto-sync when connection is restored
 *   ✅  Retry with exponential back-off (1s → 2s → 4s → … max 64s)
 *   ✅  Dedup detection — sends X-Request-Id header; backend ignores duplicates
 *   ✅  Persist pending count across page refreshes (all data in IndexedDB)
 *   ✅  Sync logs recorded for the UI panel
 *   ✅  Manual "Sync Now" trigger via syncNow()
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api from './api';
import { db } from './OfflineDB';


// Backoff schedule: [1s, 2s, 4s, 8s, 16s, 32s, 64s] (capped at 64 s)
const BACKOFF_MS = (retries) => Math.min(1000 * Math.pow(2, retries), 64_000);

// Simple UUID v4 without dependencies
const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});

// Endpoint resolver by type
const resolveEndpoint = (type) => {
  if (type === 'complaint')    return '/complaints';
  if (type === 'payment_cash') return '/payments/cash';
  if (type === 'service')      return '/services';
  return null;
};

export const useOfflineSync = () => {
  const [isOnline, setIsOnline]       = useState(navigator.onLine);
  const [syncing, setSyncing]         = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncLogs, setSyncLogs]       = useState([]);   // last N log entries for UI
  const [syncProgress, setSyncProgress] = useState(null); // { done, total } | null

  const syncingRef = useRef(false);  // ref so callbacks don't capture stale closure

  /* ── Read pending count from DB ──────────────────────────── */
  const refreshCount = useCallback(async () => {
    const count = await db.pendingRequests
      .where('status').anyOf(['pending', 'syncing'])
      .count();
    setPendingCount(count);
  }, []);

  /* ── Read recent sync logs for display ───────────────────── */
  const refreshLogs = useCallback(async () => {
    const logs = await db.syncLogs
      .orderBy('timestamp').reverse()
      .limit(20).toArray();
    setSyncLogs(logs);
  }, []);

  /* ── Queue a new offline action ──────────────────────────── */
  /**
   * @param {'complaint'|'payment_cash'|'service'} type
   * @param {object} payload  — the full request body to send
   * @returns {string} requestId (UUID) assigned to this action
   */
  const enqueue = useCallback(async (type, payload, customEndpoint = null, method = 'POST') => {
    const requestId = uuid();
    const endpoint  = customEndpoint || resolveEndpoint(type);
    await db.pendingRequests.add({
      requestId,
      type,
      endpoint,
      method,
      payload:   JSON.stringify(payload),
      timestamp: Date.now(),
      retries:   0,
      nextRetry: 0,
      status:    'pending',
    });
    await refreshCount();
    console.log(`[OfflineQueue] Enqueued ${type} — ${requestId}`);
    return requestId;
  }, [refreshCount]);

  /* ── Core sync logic ─────────────────────────────────────── */
  const triggerSync = useCallback(async ({ manual = false } = {}) => {
    if (!navigator.onLine)    return;
    if (syncingRef.current)   return;

    syncingRef.current = true;
    setSyncing(true);

    try {
      const now     = Date.now();
      const statuses = manual ? ['pending', 'syncing', 'failed_permanent'] : ['pending', 'syncing'];
      const pending = await db.pendingRequests
        .where('status').anyOf(statuses)
        .filter(r => manual || r.nextRetry <= now)
        .sortBy('timestamp');

      if (pending.length === 0) return;

      setSyncProgress({ done: 0, total: pending.length });
      console.log(`[OfflineSync] Syncing ${pending.length} request(s)...`);

      let done = 0;
      for (const req of pending) {
        // Mark as "syncing" so parallel runs don't re-pick it
        await db.pendingRequests.update(req.id, { status: 'syncing' });

        let success = false;
        let logMessage = '';

        try {
          const payload = JSON.parse(req.payload);
          const rawEndpoint = req.endpoint || resolveEndpoint(req.type);
          
          if (!rawEndpoint) throw new Error(`Unknown type: ${req.type}`);

          // Workaround for previously queued items that incorrectly had /api/ prefix
          const cleanEndpoint = rawEndpoint.startsWith('/api/') ? rawEndpoint.substring(4) : rawEndpoint;

          await api({
            method:  req.method || 'POST',
            url:     cleanEndpoint,
            data:    payload,
            headers: {
              'X-Request-Id':  req.requestId,
              'X-Offline-Sync': 'true',
            },
            timeout: 10_000,
          });

          // ✅ Success — remove from queue
          await db.pendingRequests.delete(req.id);
          success    = true;
          logMessage = `✅ ${req.type} synced (${req.requestId.slice(0, 8)}…)`;
          console.log(`[OfflineSync] ✅ ${req.requestId}`);
        } catch (err) {


          // 409 Conflict = duplicate already processed → treat as success
          if (err.response?.status === 409) {
            await db.pendingRequests.delete(req.id);
            success    = true;
            logMessage = `⚠️ ${req.type} skipped (duplicate detected)`;
            console.log(`[OfflineSync] Duplicate ${req.requestId} — removed`);
          } else {
            const newRetries  = req.retries + 1;
            const newDelay    = BACKOFF_MS(newRetries);
            logMessage = `❌ ${req.type} failed (attempt ${newRetries}) — retry in ${newDelay / 1000}s`;

            if (newRetries >= 10) {
              // Give up after 10 attempts
              await db.pendingRequests.update(req.id, {
                status:    'failed_permanent',
                retries:   newRetries,
                nextRetry: Date.now() + newDelay,
              });
              logMessage = `🚫 ${req.type} permanently failed after 10 attempts`;
            } else {
              await db.pendingRequests.update(req.id, {
                status:    'pending',
                retries:   newRetries,
                nextRetry: Date.now() + newDelay,
              });
            }
            console.warn(`[OfflineSync] ❌ ${req.requestId}`, err.message);
          }
        }

        // Write to sync log
        await db.syncLogs.add({
          requestId: req.requestId,
          type:      req.type,
          result:    success ? 'success' : 'error',
          message:   logMessage,
          timestamp: Date.now(),
        });

        done++;
        setSyncProgress({ done, total: pending.length });
      }

      await Promise.all([refreshCount(), refreshLogs()]);
    } finally {
      syncingRef.current = false;
      setSyncing(false);
      setSyncProgress(null);
    }
  }, [refreshCount, refreshLogs]);

  /* ── Online/Offline event listeners ─────────────────────── */
  useEffect(() => {
    const goOnline  = () => { setIsOnline(true);  triggerSync({ manual: true }); };
    const goOffline = () => { setIsOnline(false); };

    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);

    // Initial: load count + logs + attempt sync
    refreshCount();
    refreshLogs();
    triggerSync({ manual: true });

    // Periodic retry for stuck items (every 60 s)
    const interval = setInterval(() => {
      if (navigator.onLine) triggerSync();
    }, 60_000);

    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Clear permanently-failed items ─────────────────────── */
  const clearFailed = useCallback(async () => {
    await db.pendingRequests.where('status').equals('failed_permanent').delete();
    await refreshCount();
  }, [refreshCount]);

  return {
    isOnline,
    syncing,
    pendingCount,
    syncProgress,
    syncLogs,
    enqueue,
    syncNow: () => triggerSync({ manual: true }),
    clearFailed,
    refreshLogs,
  };
};

export default useOfflineSync;
