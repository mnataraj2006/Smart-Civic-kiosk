import React, { useEffect, useRef, useCallback } from 'react';
import { useKiosk } from '../context/KioskContext';

/**
 * AudioGuide — invisible audio engine.
 * Plays contextual TTS/MP3 automatically on every screen change.
 * NO visible UI rendered here — the 🔊/🔇 button in KioskHeader is the sole control.
 */


const RECORDED = new Set([
  'welcome', 'login', 'dashboard', 'electricity', 'gas', 'water',
  'municipal', 'transport', 'health', 'complaint', 'payment',
  'success', 'service_request',
]);



const getMp3Key = (screen, dept) => {
  if (screen === 'auth')          return 'login';
  if (screen === 'bill_payment')  return 'payment';
  if (screen === 'service')       return RECORDED.has(dept) ? dept : null;
  if (RECORDED.has(screen))       return screen;
  return null;
};

const AudioGuide = ({ screen, currentDept }) => {
  const { language, audioEnabled } = useKiosk();

  const audioRef    = useRef(null);
  const unlockedRef = useRef(false);
  const playingRef  = useRef(false);   // avoid double-play

  const langCode  = language === 'ta' ? 'tamil' : language === 'hi' ? 'hindi' : 'en';

  // ── Stop everything ──────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch (_) {}
    if (audioRef.current) { audioRef.current.pause(); }
    playingRef.current = false;
  }, []);



  // ── One-time unlock on first user interaction ─────────────────────────
  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      // Silently unlock <audio>
      if (audioRef.current) {
        const el  = audioRef.current;
        el.muted  = true;
        el.src    = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        el.play().catch(() => {}).finally(() => { el.muted = false; el.src = ''; });
      }
    };
    window.addEventListener('click',      unlock, { capture: true, once: true });
    window.addEventListener('touchstart', unlock, { capture: true, once: true });
    return () => {
      window.removeEventListener('click',      unlock, true);
      window.removeEventListener('touchstart', unlock, true);
    };
  }, []);

  // ── Autoplay on screen / language / audioEnabled change ──────────────
  useEffect(() => {
    stopAll();
    if (!audioEnabled) return;

    const mp3Key = getMp3Key(screen, currentDept);

    if (mp3Key && audioRef.current) {
      // Set src → browser buffers → onCanPlayThrough fires → play()
      audioRef.current.src = `/assets/audio/${mp3Key}_${langCode}.mp3`;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, currentDept, language, audioEnabled]);

  // ── Mute/unmute propagation from header toggle ───────────────────────
  useEffect(() => {
    if (!audioEnabled) stopAll();
  }, [audioEnabled, stopAll]);

  // ── Render: only the hidden <audio> element, NO visible widget ────────
  return (
    <audio
      ref={audioRef}
      style={{ display: 'none' }}
      onCanPlayThrough={() => {
        if (!audioEnabled || playingRef.current) return;
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play()
            .then(() => { playingRef.current = true; })
            .catch(() => {});
        }
      }}
      onEnded={() => { playingRef.current = false; }}
      onError={() => {}}
    />
  );
};

export default AudioGuide;
