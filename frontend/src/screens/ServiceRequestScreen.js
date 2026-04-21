import React, { useState } from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { useKiosk } from '../context/KioskContext';

const ServiceRequestScreen = ({ department, serviceType, onSuccess, onBack, onHome }) => {
  const { submitServiceRequest, currentUser, speak, loading, t } = useKiosk();
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);

  const deptInfo = {
    electricity: { icon: '⚡', color: 'var(--electricity)' },
    water: { icon: '💧', color: 'var(--water)' },
    gas: { icon: '🔥', color: 'var(--gas)' },
    municipal: { icon: '🏙️', color: 'var(--municipal)' },
  };

  const info = deptInfo[department] || { icon: '🔧', color: 'var(--blue-light)' };

  const handleSubmit = async () => {
    if (!description.trim()) { setError(t('provideDescErr')); return; }
    setError(null);
    speak(t('submittingReqSpeak'));
    const res = await submitServiceRequest({ department, serviceType, description, address });
    if (res.success) {
      speak(`${t('reqSubmitSuccessSpeak')} ${res.requestId}`);
      onSuccess({ requestId: res.requestId, serviceType, department, description });
    } else {
      setError(t('reqSubmitFail'));
    }
  };

  const docsMap = {
    newConnReq: ['aadhaarCard', 'addrProof', 'propertyDocs', 'passportPhoto'],
    gasRefillDesc: ['lpgId', 'mobNum'],
    newGasConnDesc: ['aadhaarCard', 'addrProof', 'nocOwner'],
    newWaterConnDesc: ['aadhaarCard', 'taxReceipt', 'buildingPlan'],
  };

  const requiredDocKeys = docsMap[serviceType] || ['aadhaarCard', 'addrProof'];

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title={`${info.icon} ${t(serviceType)}`} showUser={true} />

      <div className="content-area no-scroll" style={{ padding: '1.25rem 2.5rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem', flexShrink: 0 }}>
          🏠 {t('home')} › {info.icon} {t(department)} › {t(serviceType)}
        </div>

        {/* Service info banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem',
          padding: '0.75rem 1.5rem', background: `${info.color}15`, border: `1px solid ${info.color}30`,
          borderRadius: 'var(--r-md)', flexShrink: 0 }}>
          <span style={{ fontSize: '2.5rem' }}>{info.icon}</span>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t(serviceType)}</h2>
            <p style={{ color: 'var(--text-muted)', textTransform: 'capitalize', fontSize: '0.9rem' }}>{t(department)} {t('dept')}</p>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">👤 {t('applicantName')}</label>
                <div className="kiosk-input" style={{ fontSize: '1rem', textAlign: 'left', padding: '0.7rem 1.2rem', letterSpacing: 0 }}>
                  {currentUser?.name || 'Demo Citizen'}
                </div>
              </div>
              <div>
                <label className="form-label">📱 {t('mobileNum')}</label>
                <div className="kiosk-input" style={{ fontSize: '1rem', textAlign: 'left', padding: '0.7rem 1.2rem', letterSpacing: 0 }}>
                  {currentUser?.mobile || 'N/A'}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">📍 {t('installAddr')}</label>
                <textarea className="kiosk-textarea" rows={3} value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder={t('enterAddrPlaceholder')}
                  style={{ userSelect: 'text' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">📝 {t('addDetails')}</label>
                <textarea className="kiosk-textarea" rows={3} value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('addInfoPlaceholder')}
                  style={{ userSelect: 'text' }} />
              </div>
              {error && <div className="alert alert-error anim-fade">❌ {error}</div>}
            </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="info-card" style={{ borderColor: `${info.color}40` }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: info.color }}>
                📄 {t('docsReq')}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                {t('docsReadyMsg')}
              </p>
              {requiredDocKeys.map((docKey, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{t(docKey)}</span>
                </div>
              ))}
            </div>

            <div className="info-card">
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--info)' }}>
                ℹ️ {t('procInfo')}
              </h4>
              {[
                { label: t('processingTime'), value: t('fiveToSevenDays') },
                { label: t('physInsp'), value: t('required') },
                { label: t('appFee'), value: t('asPerNorms') },
                { label: t('statusUpdates'), value: t('smsUpdateLabel') },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <KioskFooter
        onBack={onBack} onHome={onHome} onCancel={onHome}
        onConfirm={handleSubmit}
        confirmLabel={`${t('submitReq')} ✓`}
        confirmDisabled={loading || !description.trim()}
      />
    </div>
  );
};

export default ServiceRequestScreen;
