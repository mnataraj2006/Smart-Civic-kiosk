import React, { useState, useEffect } from 'react';
import { useKiosk } from '../context/KioskContext';

const KioskHeader = ({ title, subtitle, showUser = false }) => {
  const { currentUser, language, setLanguage, audioEnabled, setAudioEnabled, speak, t } = useKiosk();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const langs = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'ta', label: 'த', full: 'Tamil' },
    { code: 'hi', label: 'हि', full: 'Hindi' },
  ];

  return (
    <header className="kiosk-header">
      {/* LEFT — Govt logo + brand */}
      <div className="header-left">
        <div className="govt-emblem">🏛️</div>
        <div className="header-brand">
          <h1>प्रगत संगणन विकास केंद्र</h1>
          <p>{t('cdacFull')}</p>
        </div>
      </div>

      {/* CENTER — Screen title */}
      <div className="header-center">
        <div className="header-screen-title">{title || t('kioskTitle')}</div>
        {subtitle && <div className="header-screen-sub">{subtitle}</div>}
      </div>

      {/* RIGHT — Language | Accessibility | Time */}
      <div className="header-right">
        {/* Language selection */}
        <div className="lang-btns">
          {langs.map(l => (
            <button
              key={l.code}
              id={`hdr-lang-${l.code}`}
              className={`lang-btn-hdr ${language === l.code ? 'active' : ''}`}
              onClick={() => { setLanguage(l.code); speak(`Language set to ${l.full}`); }}
              title={l.full}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Accessibility / audio */}
        <button
          className={`access-btn ${audioEnabled ? 'active' : ''}`}
          onClick={() => { setAudioEnabled(!audioEnabled); if (!audioEnabled) speak('Audio enabled'); }}
          title="Toggle Audio Guidance"
          id="btn-audio-toggle"
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>

        {/* User chip */}
        {showUser && currentUser && (
          <div className="header-user">
            👤 <strong>{currentUser.name || currentUser.mobile}</strong>
          </div>
        )}

        {/* Clock */}
        <div className="header-time">
          <div className="time">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="date">
            {time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default KioskHeader;
