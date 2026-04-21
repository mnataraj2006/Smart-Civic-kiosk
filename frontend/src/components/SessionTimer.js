import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useKiosk } from '../context/KioskContext';

/**
 * Per-screen idle durations (seconds).
 * After this time with NO user activity the WARNING popup appears.
 * The popup gives an extra 20 seconds before hard logout.
 */
const SCREEN_TIMEOUTS = {
  auth:            30,
  complaint:       45,
  bill_payment:    90,
  service_request: 60,
  transport:       60,
  health:          60,
  dashboard:       90,
  service:         90,
  success:         60,
};
const WARNING_SECS = 20;

// ─── SessionTimer ────────────────────────────────────────────────────────────
const SessionTimer = ({ screen = 'dashboard', onTimeout }) => {
  const { sessionActive, speak, t } = useKiosk();

  // Keep latest callbacks in refs so timers never hold stale closures
  const onTimeoutRef = useRef(onTimeout);
  const speakRef     = useRef(speak);
  useEffect(() => { onTimeoutRef.current = onTimeout; }, [onTimeout]);
  useEffect(() => { speakRef.current     = speak;     }, [speak]);

  const [showWarning, setShowWarning] = useState(false);
  const [countdown,   setCountdown]   = useState(WARNING_SECS);

  // All timer IDs in refs — never trigger re-renders
  const idleTimerRef = useRef(null);
  const warnTimerRef = useRef(null);
  const countRef     = useRef(WARNING_SECS);
  const warningRef   = useRef(false);    // ref-mirror of showWarning (for handlers)

  // ── helpers ────────────────────────────────────────────────────────
  const clearAllTimers = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearInterval(warnTimerRef.current);
    idleTimerRef.current = null;
    warnTimerRef.current = null;
  }, []);

  const startWarnCountdown = useCallback(() => {
    clearInterval(warnTimerRef.current);
    countRef.current = WARNING_SECS;
    setCountdown(WARNING_SECS);

    warnTimerRef.current = setInterval(() => {
      countRef.current -= 1;
      setCountdown(countRef.current);
      if (countRef.current <= 0) {
        clearInterval(warnTimerRef.current);
        warnTimerRef.current = null;
        warningRef.current = false;
        setShowWarning(false);
        onTimeoutRef.current?.();   // hard logout — uses ref, no stale closure
      }
    }, 1000);
  }, []);   // NO external deps — uses refs only

  const startIdleTimer = useCallback(() => {
    clearAllTimers();
    warningRef.current = false;
    setShowWarning(false);

    const secs = SCREEN_TIMEOUTS[screen] ?? 90;
    idleTimerRef.current = setTimeout(() => {
      warningRef.current = true;
      setShowWarning(true);
      speakRef.current?.(
        'Warning: your session will expire soon due to inactivity. Press Continue Session to stay logged in.'
      );
      startWarnCountdown();
    }, secs * 1000);
  }, [screen, clearAllTimers, startWarnCountdown]);
  // Note: `screen` IS a needed dep — different screens have different timeouts

  // ── Start / restart timer whenever screen changes ──────────────────
  useEffect(() => {
    if (!sessionActive) return;
    startIdleTimer();
    return clearAllTimers;      // cleanup on unmount or screen change
  }, [screen, sessionActive, startIdleTimer, clearAllTimers]);

  // ── Reset timer on any user activity (but NOT while warning is open) ─
  useEffect(() => {
    const events = ['touchstart', 'click', 'keydown', 'scroll'];
    const handler = () => {
      if (!warningRef.current && sessionActive) startIdleTimer();
    };
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, [sessionActive, startIdleTimer]);

  // ── Button handlers ────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    warningRef.current = false;
    setShowWarning(false);
    startIdleTimer();
  }, [startIdleTimer]);

  const handleEnd = useCallback(() => {
    clearAllTimers();
    warningRef.current = false;
    setShowWarning(false);
    onTimeoutRef.current?.();
  }, [clearAllTimers]);

  // ── Render nothing when session not active ─────────────────────────
  if (!sessionActive) return null;

  const idleSecs = SCREEN_TIMEOUTS[screen] ?? 90;

  return (
    <>
      {/* ── Warning overlay ────────────────────────────────────────── */}
      {showWarning && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Session expiring"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.90)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 19999, backdropFilter: 'blur(14px)',
            animation: 'stFadeIn 0.3s ease',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg,#0f2847,#0b1f3a)',
            border: `2px solid ${countdown <= 10 ? '#ef4444' : '#f59e0b'}`,
            borderRadius: '1.5rem',
            padding: '3rem 4rem',
            textAlign: 'center',
            maxWidth: '44rem', width: '90%',
            boxShadow: `0 0 4rem ${countdown <= 10
              ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.25)'}`,
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>

            <h2 style={{
              fontSize: '2rem',
              color: countdown <= 10 ? '#ef4444' : '#f59e0b',
              fontWeight: 900, marginBottom: '0.75rem',
            }}>
              {t('sessionExpiring') || 'Session Expiring Soon'}
            </h2>

            <p style={{ fontSize: '1.15rem', color: '#b8ceea', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {t('sessionEndInactivity') || 'Your session will end due to inactivity.'}<br />
              {t('touchContinue') || 'Press Continue Session to stay logged in.'}
            </p>

            {/* Countdown number */}
            <div style={{
              fontSize: '7rem', fontWeight: 900, lineHeight: 1,
              color: countdown <= 10 ? '#ef4444' : '#f59e0b',
              marginBottom: '1.25rem',
              animation: countdown <= 10 ? 'pulse 0.5s ease infinite' : 'none',
            }}>
              {countdown}
            </div>

            {/* Progress bar */}
            <div style={{
              height: '0.5rem', background: 'rgba(255,255,255,0.1)',
              borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem',
            }}>
              <div style={{
                height: '100%', borderRadius: '1rem',
                width: `${(countdown / WARNING_SECS) * 100}%`,
                background: countdown <= 10
                  ? 'linear-gradient(90deg,#ef4444,#b91c1c)'
                  : 'linear-gradient(90deg,#22c55e,#f59e0b)',
                transition: 'width 1s linear, background 1s',
              }} />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                id="session-continue-btn"
                onClick={handleContinue}
                style={{
                  background: 'linear-gradient(135deg,#1e4d8c,#1a3a6b)',
                  border: '2px solid rgba(37,99,176,0.6)',
                  color: '#fff', borderRadius: '0.875rem',
                  padding: '1rem 2.5rem', fontSize: '1.25rem', fontWeight: 800,
                  cursor: 'pointer', minWidth: '220px', minHeight: '60px',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#2563b0'; }}
                onMouseOut={e  => { e.currentTarget.style.background = 'linear-gradient(135deg,#1e4d8c,#1a3a6b)'; }}
              >
                ✅ {t('continueSession') || 'Continue Session'}
              </button>

              <button
                id="session-end-btn"
                onClick={handleEnd}
                style={{
                  background: 'transparent',
                  border: '2px solid rgba(239,68,68,0.5)',
                  color: '#fca5a5', borderRadius: '0.875rem',
                  padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 700,
                  cursor: 'pointer', minWidth: '160px', minHeight: '60px',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                onMouseOut={e  => { e.currentTarget.style.background = 'transparent'; }}
              >
                🚪 {t('endSession') || 'End Session'}
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#7a9abf', marginTop: '1.25rem' }}>
              🔒 {t('privacyLogout') || 'Session data will be cleared on logout'}
            </p>
          </div>
        </div>
      )}

      {/* ── Thin progress stripe (idle indicator, bottom of screen) ── */}
      {!showWarning && (
        <div style={{
          position: 'fixed', bottom: '5rem', left: 0, right: 0,
          height: '3px', zIndex: 200, pointerEvents: 'none',
          background: 'rgba(255,255,255,0.05)',
        }}>
          {/* key={screen} forces animation restart on navigation */}
          <div
            key={`${screen}-bar`}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg,#22c55e,#f59e0b)',
              animation: `stShrink ${idleSecs}s linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes stShrink {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        @keyframes stFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1);    }
        }
      `}</style>
    </>
  );
};

export default SessionTimer;
