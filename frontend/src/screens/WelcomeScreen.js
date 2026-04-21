import React from 'react';
import { useKiosk } from '../context/KioskContext';

const WelcomeScreen = ({ onStart, onHelp }) => {
  const { t, speak, language, setLanguage, accessMode, setAccessMode } = useKiosk();

  const langs = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'hi', label: 'हिंदी' },
  ];

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />

      {/* Header band */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(10,26,63,0.97), rgba(15,40,71,0.95))',
        borderBottom: '2px solid rgba(37,99,176,0.45)',
        padding: '0 2.5rem',
        height: '5.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="govt-emblem">🏛️</div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{t('cdacHindi')}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{t('cdacFull')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '0.5rem' }}>
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); speak(`${t('langSetSpeak')} ${l.label}`); }}
              style={{
                padding: '0.4rem 1rem', borderRadius: '0.3rem',
                border: language === l.code ? '2px solid rgba(37,99,176,0.8)' : '1px solid transparent',
                background: language === l.code ? 'var(--blue-light)' : 'transparent',
                color: language === l.code ? '#fff' : 'var(--text-soft)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn btn-outline"
            style={{
              padding: '0.5rem 1rem', fontSize: '0.85rem',
              borderColor: accessMode ? 'var(--success)' : 'rgba(255,255,255,0.2)',
              color: accessMode ? 'var(--success)' : '#fff',
              background: accessMode ? 'rgba(34,197,94,0.1)' : 'transparent'
            }}
            onClick={() => {
              const newMode = !accessMode;
              setAccessMode(newMode);
              speak(newMode ? t('accessEnabledSpeak') : t('accessDisabledSpeak'));
            }}
          >
            {accessMode ? '✓ ' + t('accessMode') : '👁️ ' + t('accessMode')}
          </button>
          <button
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => { speak(t('openingHelpSpeak')); onHelp(); }}
          >
            ℹ️ {t('help')}
          </button>
        </div>
      </div>

      {/* Main welcome content */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '2rem',
          textAlign: 'center', maxWidth: '60rem',
        }}>
          <div className="welcome-emblem">🏛️</div>

          <div>
            <h1 className="welcome-title">{t('welcome')}</h1>
            <p className="welcome-sub" style={{ marginTop: '0.5rem' }}>
              {t('allGovtServices')}
            </p>
            <p className="welcome-tag" style={{ marginTop: '0.25rem' }}>
              {t('allGovtServicesTag')}
            </p>
          </div>

          {/* Service preview icons */}
          <div style={{ display: 'flex', gap: '2rem', opacity: 0.6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: '⚡', key: 'electricity' },
              { icon: '🔥', key: 'gas' },
              { icon: '💧', key: 'water' },
              { icon: '🏛', key: 'municipal' },
              { icon: '📝', key: 'complaint' },
              { icon: '🔍', key: 'track' }
            ].map((s, i) => (
              <div key={i} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {s.icon} {t(s.key)}
              </div>
            ))}
          </div>

          <button
            id="btn-start-service"
            className="btn btn-accent"
            style={{ fontSize: '1.6rem', padding: '1.4rem 5rem', borderRadius: '1.4rem' }}
            onClick={() => { speak(t('startService')); onStart(); }}
          >
            🚀 {t('startService')}
          </button>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t('touchToBegin')}
          </p>
        </div>
      </div>

      {/* Marquee footer */}
      <div style={{
        padding: '0.7rem 0',
        background: 'rgba(26,58,107,0.4)',
        borderTop: '1px solid rgba(37,99,176,0.2)',
        position: 'relative', zIndex: 1, overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div className="marquee-text">
          {t('marquee1')} &nbsp;&nbsp;&nbsp;
          {t('marquee2')} &nbsp;&nbsp;&nbsp;
          {t('marquee3')} &nbsp;&nbsp;&nbsp;
          {t('marquee4')} &nbsp;&nbsp;&nbsp;
          {t('marquee5')}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
