/**
 * OfflineDB — Dexie (IndexedDB) schema for the Smart Civic Kiosk offline queue.
 *
 * Tables:
 *   pendingRequests — every offline action waiting to be synced
 *   syncLogs        — history of sync attempts (success / failure) for display
 */

import Dexie from 'dexie';

export const db = new Dexie('KioskOfflineDB');

// ─── v1 (original, kept for migration safety) ─────────────────────────────────
db.version(1).stores({
  pendingRequests: '++id, type, data, timestamp'
});

// ─── v2 (current) ─────────────────────────────────────────────────────────────
db.version(2).stores({
  /**
   * pendingRequests fields:
   *   id          — auto-increment primary key
   *   requestId   — UUID for idempotency (prevents duplicate backend submissions)
   *   type        — 'complaint' | 'payment_cash' | 'service'
   *   endpoint    — e.g. '/api/complaints'
   *   method      — 'POST' | 'PUT'
   *   payload     — serialized body
   *   timestamp   — when action was taken (millis)
   *   retries     — number of sync attempts made so far
   *   nextRetry   — earliest epoch ms to retry (backoff)
   *   status      — 'pending' | 'syncing' | 'failed_permanent'
   */
  pendingRequests: '++id, requestId, type, status, timestamp, nextRetry',

  /**
   * syncLogs fields:
   *   id          — auto-increment primary key
   *   requestId   — matches pendingRequests.requestId
   *   type        — same as pendingRequest.type
   *   result      — 'success' | 'error'
   *   message     — human-readable outcome
   *   timestamp   — when sync attempt completed
   */
  syncLogs: '++id, requestId, result, timestamp'
});

export default db;
