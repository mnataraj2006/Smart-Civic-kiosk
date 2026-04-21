import React from 'react';
import { useKiosk } from '../context/KioskContext';/**
 * KioskFooter — fixed bottom navigation bar
 * Buttons shown: Home | Back | Cancel | Confirm
 * Pass null/undefined handler to hide a button
 */
const KioskFooter = ({
  onHome, onBack, onCancel, onConfirm,
  confirmLabel = 'Confirm ✓',
  confirmDisabled = false,
  sessionPercent = 100,
  showSessionBar = false,
  centerText = null,
}) => {
  const { t } = useKiosk();

  return (
    <nav className="kiosk-footer">
      {/* LEFT: Home + Back */}
      <div className="footer-left">
        {onHome && (
          <button className="nav-btn home" onClick={onHome} id="nav-home">
            🏠 {t('home')}
          </button>
        )}
        {onBack && (
          <button className="nav-btn back" onClick={onBack} id="nav-back">
            ← {t('back')}
          </button>
        )}
      </div>

      {/* CENTER: session bar or text */}
      <div className="footer-center">
        {showSessionBar && (
          <div className="session-bar-wrap">
            <span className="session-bar-label">Session</span>
            <div className="session-bar">
              <div className="session-bar-fill" style={{ width: `${sessionPercent}%` }} />
            </div>
          </div>
        )}
        {centerText && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{centerText}</span>
        )}
        {!showSessionBar && !centerText && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {t('kioskTitle')} · {t('marquee5')}
          </span>
        )}
      </div>

      {/* RIGHT: Cancel + Confirm */}
      <div className="footer-right">
        {onCancel && (
          <button className="nav-btn cancel" onClick={onCancel} id="nav-cancel">
            ✕ {t('cancel')}
          </button>
        )}
        {onConfirm && (
          <button
            className="nav-btn confirm"
            onClick={onConfirm}
            disabled={confirmDisabled}
            id="nav-confirm"
            style={{ opacity: confirmDisabled ? 0.45 : 1, cursor: confirmDisabled ? 'not-allowed' : 'pointer' }}
          >
            {confirmLabel}
          </button>
        )}
      </div>
    </nav>
  );
};

export default KioskFooter;
