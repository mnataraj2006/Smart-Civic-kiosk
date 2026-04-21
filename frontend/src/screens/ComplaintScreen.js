import React, { useState, useEffect } from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { useKiosk } from '../context/KioskContext';

// DEPARTMENTS and other constants moved inside component for t() access
// CATEGORIES moved inside
const ComplaintScreen = ({ initialDept, onSuccess, onBack, onHome }) => {
  const { submitComplaint, currentUser, speak, loading, t } = useKiosk();

  const DEPARTMENTS = [
    { id: 'electricity', key: 'electricity' },
    { id: 'gas', key: 'gas' },
    { id: 'water', key: 'water' },
    { id: 'municipal', key: 'municipal' },
    { id: 'general', key: 'general' }
  ];

  const CATEGORIES = {
    electricity: ['powerOutage', 'meterComp', 'billingError', 'other'],
    gas: ['gasLeakage', 'noSupply', 'billingError', 'cylinderIssue'],
    water: ['noSupply', 'waterLeakage', 'lowPressure', 'waterQuality'],
    municipal: ['garbageSanitation', 'streetlight', 'roadDamage', 'drainage'],
    general: ['serviceDelay', 'staffBehaviour', 'other'],
  };

  const PRIORITIES = [
    { value: 'high', label: 'high', icon: '🔴', color: '#ef4444' },
    { value: 'medium', label: 'medium', icon: '🟡', color: '#f59e0b' },
    { value: 'low', label: 'low', icon: '🟢', color: '#22c55e' },
  ];

  const [dept, setDept] = useState(initialDept || '');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => { setCategory(''); }, [dept]);

  const handleSubmit = async () => {
    if (!dept || !category || !description.trim()) {
      setMessage({ type: 'error', text: t('fillReqFields') }); return;
    }
    const res = await submitComplaint({ department: dept, category, priority, description, mobile: currentUser?.mobile });
    if (res.success) {
      speak(`${t('compRegSpeak')} ${res.complaintId}`);
      onSuccess(res);
    } else setMessage({ type: 'error', text: res.message || t('compFail') });
  };

  const quickFill = [
    { text: t('qf1') },
    { text: t('qf2') },
    { text: t('qf3') },
    { text: t('qf4') },
  ];

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title={t('regComplaint')} subtitle={`📝 ${t('fileNewComp')}`} showUser={true} />

      <div className="content-area no-scroll" style={{ padding: '1.25rem 2.5rem' }}>
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }}>

          {/* LEFT — Form */}
          <div className="anim-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Department */}
            <div>
              <label className="form-label">{t('compType')} *</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {DEPARTMENTS.map(d => (
                  <button key={d.id} onClick={() => setDept(d.id)} style={{
                    padding: '0.5rem 1rem', borderRadius: 'var(--r-sm)',
                    border: `2px solid ${dept === d.id ? 'var(--blue-light)' : 'rgba(255,255,255,0.15)'}`,
                    background: dept === d.id ? 'rgba(37,99,176,0.3)' : 'rgba(255,255,255,0.05)',
                    color: dept === d.id ? '#fff' : 'var(--text-soft)',
                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'var(--ease)',
                  }}>{t(d.key)}</button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="form-label">{t('category')} *</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(CATEGORIES[dept] || []).map(c => (
                  <button key={c} onClick={() => setCategory(c)} style={{
                    padding: '0.4rem 0.85rem', borderRadius: 'var(--r-sm)',
                    border: `2px solid ${category === c ? 'var(--blue-light)' : 'rgba(255,255,255,0.12)'}`,
                    background: category === c ? 'rgba(37,99,176,0.3)' : 'rgba(255,255,255,0.04)',
                    color: category === c ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'var(--ease)',
                  }}>{t(c)}</button>
                ))}
                {!dept && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('selectDeptFirst')}</span>}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="form-label">Priority</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {PRIORITIES.map(p => (
                  <button key={p.value} onClick={() => setPriority(p.value)} style={{
                    padding: '0.5rem 1.25rem', borderRadius: 'var(--r-sm)',
                    border: `2px solid ${priority === p.value ? p.color : 'rgba(255,255,255,0.12)'}`,
                    background: priority === p.value ? `${p.color}20` : 'rgba(255,255,255,0.04)',
                    color: priority === p.value ? p.color : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, transition: 'var(--ease)',
                  }}>{p.icon} {t(p.label)}</button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="form-label">{t('compDesc')} *</label>
              <textarea
                className="kiosk-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('describeIssuePlaceholder')}
                style={{ flex: 1, minHeight: '8rem' }}
              />
            </div>

            {message && <div className="alert alert-error anim-fade">❌ {message.text}</div>}
          </div>

          {/* RIGHT — Quick Fill & Info */}
          <div className="anim-right" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="info-card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>⚡ {t('quickFillTitle')}</h4>
              {quickFill.map((s, i) => (
                <button key={i} onClick={() => setDescription(s.text)} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'rgba(37,99,176,0.12)', border: '1px solid rgba(37,99,176,0.25)',
                  borderRadius: 'var(--r-sm)', padding: '0.6rem 0.75rem',
                  marginBottom: '0.5rem', cursor: 'pointer', color: 'var(--text-soft)',
                  fontSize: '0.82rem', lineHeight: 1.4, transition: 'var(--ease)',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  📌 {s.text}
                </button>
              ))}
            </div>
            <div className="info-card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>📷 {t('attachImage')}</h4>
              <div style={{
                border: '2px dashed rgba(37,99,176,0.4)', borderRadius: 'var(--r-md)',
                padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                <div>{t('tapCapture')}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{t('maxFileSize')}</div>
              </div>
            </div>
            <div className="info-card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>ℹ️ {t('whatNext')}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>
                {t('compFollowUp')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <KioskFooter
        onHome={onHome} onBack={onBack}
        onCancel={onHome}
        onConfirm={handleSubmit}
        confirmLabel={`${t('submitBtn')} ✓`}
        confirmDisabled={loading || !dept || !category || !description.trim()}
      />
    </div>
  );
};

export default ComplaintScreen;
