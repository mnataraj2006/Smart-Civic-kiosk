import React from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { useKiosk } from '../context/KioskContext';

const HelpScreen = ({ onBack }) => {
  const { t, speak } = useKiosk();

  // On mount, read instructions
  React.useEffect(() => {
    speak(t('helpPageSpeak'));
  }, [speak, t]);

  const steps = [
    {
      icon: '🌍',
      title: t('helpStep1Title'),
      desc: t('helpStep1Desc')
    },
    {
      icon: '📱',
      title: t('helpStep2Title'),
      desc: t('helpStep2Desc')
    },
    {
      icon: '👆',
      title: t('helpStep3Title'),
      desc: t('helpStep3Desc')
    },
    {
      icon: '📝',
      title: t('helpStep4Title'),
      desc: t('helpStep4Desc')
    },
    {
      icon: '💳',
      title: t('helpStep5Title'),
      desc: t('helpStep5Desc')
    },
    {
      icon: '🖨️',
      title: t('helpStep6Title'),
      desc: t('helpStep6Desc')
    }
  ];

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title={t('helpTitle')} subtitle={t('helpSubtitle')} />

      <div className="content-area no-scroll" style={{ padding: '2rem 3rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem', color: 'var(--white)' }}>
          {t('needHelp')}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {t('quickGuide')}
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem',
          flex: 1, minHeight: 0
        }}>
          {steps.map((step, i) => (
            <div key={i} className="info-card anim-up" style={{
              display: 'flex', flexDirection: 'column',
              animationDelay: `${i * 0.1}s`, padding: '1.5rem',
              background: 'rgba(26,58,107,0.5)',
              borderColor: 'rgba(37,99,176,0.3)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{step.icon}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          padding: '1rem', background: 'rgba(234,108,0,0.1)',
          border: '1px solid rgba(234,108,0,0.3)', borderRadius: 'var(--r-md)',
          textAlign: 'center', marginTop: '1.5rem',
          color: 'var(--orange-light)', fontWeight: 600
        }}>
          💡 {t('marquee3')} {t('marquee5')}
        </div>
      </div>

      <KioskFooter onBack={onBack} onHome={onBack} />
    </div>
  );
};

export default HelpScreen;
