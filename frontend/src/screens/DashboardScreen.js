import React from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { useKiosk } from '../context/KioskContext';

const services = [
  { id: 'electricity', icon: '⚡', label: 'electricity', sub: 'elecSub',      cls: 'electricity' },
  { id: 'gas',         icon: '🔥', label: 'gas',         sub: 'gasSub',       cls: 'gas' },
  { id: 'water',       icon: '💧', label: 'water',       sub: 'waterSub',     cls: 'water' },
  { id: 'municipal',   icon: '🏛️', label: 'municipal',   sub: 'muniSub',      cls: 'municipal' },
  { id: 'complaint',   icon: '📝', label: 'complaint',   sub: 'compSub',      cls: 'complaint-tile' },
  { id: 'transport',   icon: '🚗', label: 'transport',   sub: 'transportSub', cls: 'transport-dash' },
  { id: 'health',      icon: '🏥', label: 'health',      sub: 'healthSub',    cls: 'health-dash' },
];

const DashboardScreen = ({ onSelectService, onHome, onLogout }) => {
  const { currentUser, t, speak } = useKiosk();

  const greeting = `${t('welcomeMsg')}, ${currentUser?.name || t('citizen')}!`;

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title={t('serviceDashboard')} showUser={true} />

      <div className="content-area no-scroll" style={{ padding: '1rem 2.5rem' }}>
        {/* Greeting row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '0.75rem', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.15rem' }}>
              👋 {greeting}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {t('selectServiceBelow')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {currentUser?.consumerNumbers && Object.entries(currentUser.consumerNumbers).filter(([,v])=>v).slice(0,2).map(([k,v]) => (
              <div key={k} style={{
                background: 'rgba(37,99,176,0.15)', border: '1px solid rgba(37,99,176,0.3)',
                borderRadius: 'var(--r-sm)', padding: '0.3rem 0.75rem',
                fontSize: '0.78rem', color: 'var(--text-soft)',
              }}>
                <span style={{ fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{t(k)}: </span>{v}
              </div>
            ))}
            <button id="btn-logout" className="btn btn-outline"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1.2rem', borderColor: 'rgba(239,68,68,0.45)', color: '#fca5a5' }}
              onClick={onLogout}>
              🚪 {t('logoutText')}
            </button>
          </div>
        </div>

        {/* Service tile grid */}
        <div className="service-grid dashboard-extended" style={{ flex: 1, minHeight: 0 }}>
          {services.map((s, i) => (
            <button
              key={s.id}
              id={`svc-${s.id}`}
              className={`service-tile ${s.cls} anim-up`}
              style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => { speak(t(s.label) || s.label); onSelectService(s.id); }}
            >
              <span className="tile-icon">{s.icon}</span>
              <div className="tile-label">{t(s.label) || s.label}</div>
              <div className="tile-sub">{t(s.sub) || s.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <KioskFooter onHome={onHome} />
    </div>
  );
};

export default DashboardScreen;
