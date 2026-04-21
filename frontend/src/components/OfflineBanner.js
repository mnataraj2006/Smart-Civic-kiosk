/**
 * OfflineBanner — Fixed UI indicator showing:
 *   - Online / Offline status with colour coding
 *   - Pending request count
 *   - Syncing spinner + progress bar
 *   - Expandable Sync Log panel
 *   - "Sync Now" and "Clear Failed" buttons
 */

import React, { useState } from 'react';
import { useKiosk } from '../context/KioskContext';

const OfflineBanner = () => {
  const {
    isOnline, syncing, pendingCount, syncProgress, syncLogs,
    syncNow, clearFailed, t,
  } = useKiosk();

  const [logOpen, setLogOpen] = useState(false);

  // If fully online with nothing pending — show mini green pill only
  const isIdle = isOnline && !syncing && pendingCount === 0;

  const failedCount = syncLogs.filter(l => l.result === 'error').length;
  const hasLogs     = syncLogs.length > 0;

  return (
    <>
      {/* ─── Main banner ──────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 10002,
        pointerEvents: 'none',
      }}>
        {/* ── Online indicator (tiny pill, floating below header right) ── */}
        {isIdle ? (
          <div style={{
            position: 'absolute',
            top: '6rem',
            right: '2rem',
            background: 'rgba(16,185,129,0.85)',
            backdropFilter: 'blur(6px)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '0.73rem',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.04em',
            pointerEvents: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            Online
          </div>
        ) : (
          /* ── Offline / syncing full banner ── */
          <div style={{
            width: '100%',
            background: isOnline
              ? syncing ? 'rgba(37,99,176,0.97)' : 'rgba(17,94,89,0.97)'
              : 'rgba(185,28,28,0.97)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '0.55rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            pointerEvents: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}>
            {/* Left — icon + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '180px' }}>
              {!isOnline && <span style={{ fontSize: '1.2rem' }}>📡</span>}
              {isOnline && syncing && (
                <span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              )}
              {isOnline && !syncing && pendingCount > 0 && <span style={{ fontSize: '1.2rem' }}>🔄</span>}
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                  {!isOnline && '⚠️ Offline Mode'}
                  {isOnline && syncing && `Syncing… ${syncProgress ? `(${syncProgress.done}/${syncProgress.total})` : ''}`}
                  {isOnline && !syncing && pendingCount > 0 && `${pendingCount} request${pendingCount > 1 ? 's' : ''} pending sync`}
                </div>
                {!isOnline && pendingCount > 0 && (
                  <div style={{ fontSize: '0.77rem', opacity: 0.85, fontWeight: 500 }}>
                    {pendingCount} {t('offlinePendingMsg')}
                  </div>
                )}
                {!isOnline && pendingCount === 0 && (
                  <div style={{ fontSize: '0.77rem', opacity: 0.85, fontWeight: 500 }}>
                    No pending requests. Working offline.
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar while syncing */}
            {isOnline && syncing && syncProgress && (
              <div style={{ flex: 2, minWidth: '120px', maxWidth: '240px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', height: '6px', overflow: 'hidden' }}>
                  <div style={{
                    background: '#fff',
                    height: '100%',
                    borderRadius: '20px',
                    width: `${Math.round((syncProgress.done / syncProgress.total) * 100)}%`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '2px', textAlign: 'center' }}>
                  {syncProgress.done} of {syncProgress.total} uploaded
                </div>
              </div>
            )}

            {/* Right — action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {hasLogs && (
                <button onClick={() => setLogOpen(o => !o)}
                  style={{ ...btnStyle, background: 'rgba(255,255,255,0.15)' }}>
                  📋 {logOpen ? 'Hide Log' : 'Show Log'}
                </button>
              )}
              {isOnline && !syncing && pendingCount > 0 && (
                <button onClick={syncNow} style={{ ...btnStyle, background: 'rgba(255,255,255,0.2)', fontWeight: 800 }}>
                  ⬆ Sync Now
                </button>
              )}
              {isOnline && !syncing && failedCount > 0 && (
                <button onClick={clearFailed} style={{ ...btnStyle, background: 'rgba(239,68,68,0.4)' }}>
                  🗑 Clear Failed
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Sync Log Panel (slide-down) ──────────────────────── */}
      {logOpen && (
        <div style={{
          position: 'fixed',
          top: isIdle ? '36px' : '56px',
          right: '24px',
          width: '340px',
          maxHeight: '300px',
          background: 'rgba(10,25,50,0.97)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '0 0 1rem 1rem',
          overflowY: 'auto',
          zIndex: 10003,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          padding: '0.75rem 1rem',
        }}>
          <div style={{ fontWeight: 800, color: '#fff', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            📋 Sync Log
          </div>
          {syncLogs.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>No sync activity yet.</div>
          ) : (
            syncLogs.map((log, i) => (
              <div key={i} style={{
                fontSize: '0.78rem',
                color: log.result === 'success' ? '#6ee7b7' : log.result === 'error' ? '#fca5a5' : '#fde68a',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '0.3rem 0',
                lineHeight: 1.4,
              }}>
                <span>{log.message}</span>
                <span style={{ float: 'right', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
                  {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

const btnStyle = {
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '20px',
  color: '#fff',
  padding: '4px 14px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  background: 'transparent',
};

export default OfflineBanner;
