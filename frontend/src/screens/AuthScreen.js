import React, { useState, useEffect } from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import NumericKeypad from '../components/NumericKeypad';
import { useKiosk } from '../context/KioskContext';

const AuthScreen = ({ onVerified, onBack }) => {
  const { sendOtp, verifyOtp, t, speak, loading } = useKiosk();
  const [step, setStep] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState(null);
  const [demoOtp, setDemoOtp] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const id = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [resendTimer]);


  const handleSendOtp = React.useCallback(async () => {
    if (mobile.length !== 10) { 
      setMessage({ type: 'error', text: t('enter10digitErr') }); 
      speak(t('enter10digitErr'));
      return; 
    }
    
    try {
      const res = await sendOtp(mobile);
      if (res && res.success) {
        setStep('otp'); 
        setResendTimer(30);
        setMessage({ type: 'info', text: `${t('otpSentTo')} +91 ${mobile}` });
        if (res.demoOtp) setDemoOtp(res.demoOtp);
        speak(t('otpSentSpeak'));
      } else {
        setMessage({ type: 'error', text: res?.message || t('otpFail') });
        speak(res?.message || t('otpFail'));
      }
    } catch (err) {
      console.error('OTP sending failed:', err);
      // Fallback for safety
      setStep('otp');
      setDemoOtp('123456');
      setMessage({ type: 'info', text: 'Demo Mode: Use 123456' });
    }
  }, [mobile, sendOtp, t, speak]);

  const handleVerifyOtp = React.useCallback(async () => {
    if (otp.length !== 6) { 
      setMessage({ type: 'error', text: t('enter6digitErr') }); 
      return; 
    }
    const res = await verifyOtp(mobile, otp);
    if (res.success) {
      speak(`${t('welcomeCitizenSpeak')} ${res.user?.name || t('citizen')}!`);
      onVerified(res.user);
    } else {
      setMessage({ type: 'error', text: res.message || t('invalidOtp') });
      setOtp('');
    }
  }, [mobile, otp, verifyOtp, t, speak, onVerified]);

  const steps = [t('enterMobile'), t('enterOtp'), t('accessServices')];
  const stepIdx = step === 'mobile' ? 0 : 1;

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title={t('citizenAuth')} subtitle={t('secureOtpLogin')} />

      <div className="content-area no-scroll" style={{ padding: '1.5rem 3rem' }}>
        {/* Step bar */}
        <div className="step-indicator" style={{ marginBottom: '1.25rem', flexShrink: 0 }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <div className={`step-dot ${i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className="step-line" />}
            </React.Fragment>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'center' }}>

          {/* LEFT — Input panel */}
          <div className="anim-up">
            {step === 'mobile' ? (
              <>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '0.5rem' }}>📱 {t('enterMobile')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  {t('mobileDesc')}
                </p>
                <div style={{
                  background: 'rgba(37,99,176,0.1)', border: '1.5px solid rgba(37,99,176,0.3)',
                  borderRadius: 'var(--r-sm)', padding: '0.5rem 1rem',
                  fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem',
                }}>+91 ({t('india')})</div>
                <input
                  className="kiosk-input"
                  value={mobile} readOnly
                  placeholder={t('enter10digit')}
                  style={{ marginBottom: '0.75rem', letterSpacing: mobile ? '0.3em' : '0' }}
                />
                <NumericKeypad value={mobile} onChange={(val) => setMobile(val)} maxLength={10} />
                {message && (
                  <div className={`alert alert-${message.type} anim-fade`} style={{ marginTop: '0.75rem' }}>
                    {message.type === 'error' ? '❌' : 'ℹ️'} {message.text}
                  </div>
                )}
                <button
                  id="btn-send-otp"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem', fontSize: '1.2rem', padding: '1rem' }}
                  onClick={handleSendOtp}
                  disabled={loading || mobile.length !== 10}
                >
                  {loading ? <span className="spinner" style={{ width: '1.4rem', height: '1.4rem', borderWidth: 3 }} /> : null}
                  {t('sendOtp')} →
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '0.5rem' }}>🔐 {t('enterOtp')}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: 'var(--r-sm)' }}>
                  <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                    {mobile}
                  </p>
                  <button 
                    className="btn btn-ghost" 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', minHeight: 'auto', border: '1px solid rgba(255,255,255,0.2)' }}
                    onClick={() => { setStep('mobile'); setOtp(''); setMessage(null); }}
                  >
                    ✏️ {t('back')}
                  </button>
                </div>
                {demoOtp && (
                  <div className="alert alert-info" style={{ marginBottom: '0.75rem' }}>
                    🎯 {t('demoOtpLabel')} <strong style={{ fontSize: '1.2rem', letterSpacing: '0.2em' }}>{demoOtp}</strong>
                  </div>
                )}
                <div className="otp-display" style={{ marginBottom: '0.5rem', gap: '0.5rem' }}>
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} className={`otp-box ${otp[i] ? 'filled' : ''}`} style={{ width: '3.2rem', height: '3.8rem', fontSize: '1.6rem' }}>{otp[i] || ''}</div>
                  ))}
                </div>
                <NumericKeypad value={otp} onChange={(val) => setOtp(val)} maxLength={6} />
                {message && (
                  <div className={`alert alert-${message.type} anim-fade`} style={{ marginTop: '0.75rem' }}>
                    {message.type === 'error' ? '❌' : 'ℹ️'} {message.text}
                  </div>
                )}
                <button
                  id="btn-verify-otp"
                  className="btn btn-success"
                  style={{ width: '100%', marginTop: '0.75rem', fontSize: '1.2rem', padding: '0.8rem', minHeight: '3.5rem' }}
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? <span className="spinner" style={{ width: '1.4rem', height: '1.4rem', borderWidth: 3 }} /> : null}
                  {t('verify')} ✓
                </button>
                <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
                  {resendTimer > 0
                    ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('resendIn')} {resendTimer}s</p>
                    : <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.85rem', minHeight: 'auto', padding: '0.4rem' }} onClick={handleSendOtp}>{t('resendOtp')}</button>
                  }
                </div>
              </>
            )}
          </div>

          {/* RIGHT — Info panel */}
          <div className="anim-right">
            <div className="info-card" style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>🔒 {t('secureVerify')}</h3>
              {[
                { icon: '📱', text: t('authStep1') },
                { icon: '📨', text: t('authStep2') },
                { icon: '✅', text: t('authStep3') },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="info-card" style={{ marginTop: '0.75rem', padding: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--warning)' }}>⚠️ {t('securityNotice')}</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  t('secItem1'),
                  t('secItem2'),
                  t('secItem4'),
                ].map((n, i) => (
                  <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-soft)', paddingLeft: '0.85rem', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--warning)' }}>•</span>{n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <KioskFooter onBack={onBack} onHome={onBack} />
    </div>
  );
};

export default AuthScreen;
