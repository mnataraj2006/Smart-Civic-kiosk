import React, { useEffect } from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { useKiosk } from '../context/KioskContext';

const SuccessScreen = ({ type = 'payment', data, onHome }) => {
  const { t, speak } = useKiosk();

  const isOffline = data?.offline === true;


  useEffect(() => {
    const msg = type === 'payment'   ? t('paySuccessSpeak')
              : type === 'complaint' ? `${t('compRegSpeak')} ${data?.complaintId || ''}`
              : t('reqSuccessSpeak');
    speak(msg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Receipt detail rows per type ────────────────────────────────────── */
  const buildDetails = () => {
    const receiptId = data?.receiptNumber || data?.transactionId || ('RCP-' + Date.now().toString().slice(-8));

    if (type === 'payment') {
      return [
        { label: t('receiptNo'),    value: receiptId },
        { label: t('consumerNo'),   value: data?.bill?.consumerNumber || data?.consumerNumber || 'N/A' },
        { label: 'Department',      value: data?.department ? t(data.department) : t('utility') },
        { label: t('amountPaid'),   value: `₹${(data?.bill?.amount || data?.amount || 0).toLocaleString('en-IN')}` },
        { label: t('payMode'),      value: isOffline ? `${(data?.paymentMethod || 'cash').toUpperCase()} (Offline)` : (data?.paymentMethod || 'UPI').toUpperCase() },
        { label: t('dateTime'),     value: new Date().toLocaleString('en-IN') },
        { label: t('statusLabel'),  value: isOffline ? '⏳ Pending Sync' : `✅ ${t('confirmed')}` },
      ];
    }

    if (type === 'complaint') {
      return [
        { label: 'Complaint ID',        value: String(data?.complaintId || 'CMP-' + Date.now().toString().slice(-8)) },
        { label: 'Department',          value: data?.department ? t(data.department) : 'General' },
        { label: t('category'),         value: data?.category ? t(data.category) : 'N/A' },
        { label: 'Priority',            value: data?.priority ? data.priority.toUpperCase() : 'MEDIUM' },
        { label: t('dateFiled'),        value: new Date().toLocaleString('en-IN') },
        { label: t('expRes'),           value: '48–72 Working Hours' },
        { label: 'Status',              value: isOffline ? '⏳ Queued (will sync)' : '✅ Registered' },
      ];
    }

    return [
      { label: 'Request ID',   value: String(data?.requestId || 'REQ-' + Date.now().toString().slice(-8)) },
      { label: 'Service',      value: data?.serviceType || 'Service Request' },
      { label: 'Department',   value: data?.department ? t(data.department) : 'N/A' },
      { label: t('dateFiled'), value: new Date().toLocaleString('en-IN') },
      { label: t('expTAT'),    value: '5–7 Working Days' },
      { label: 'Status',       value: isOffline ? '⏳ Queued (will sync)' : '✅ Submitted' },
    ];
  };

  const details = buildDetails();

  const configs = {
    payment:   { icon: '✅', color: isOffline ? '#f59e0b' : 'var(--success)', title: t('paySuccess'),    subtitle: isOffline ? t('offlineQueued') : t('billProcSuccess'),  gradient: isOffline ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)' },
    complaint: { icon: '📋', color: 'var(--info)',    title: t('compRegTitle'), subtitle: isOffline ? t('offlineQueued') : t('compSubSuccess'), gradient: 'rgba(56,189,248,0.08)' },
    service:   { icon: '🎯', color: 'var(--elec)',    title: t('reqSubTitle'),  subtitle: isOffline ? t('offlineQueued') : t('reqRegSuccess'),  gradient: 'rgba(245,158,11,0.08)' },
  };
  const cfg = configs[type] || configs.payment;

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title={t('txnComplete')} showUser={true} />

      {/* ── Offline queued notice ────── */}
      {isOffline && (
        <div style={{
          background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: 'var(--r-md)', margin: '0.5rem 2.5rem 0',
          padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontSize: '0.88rem', color: '#fde68a', fontWeight: 600,
        }}>
          <span style={{ fontSize: '1.3rem' }}>📡</span>
          <span>{t('offlineQueued')}</span>
        </div>
      )}

      <div className="content-area no-scroll" style={{ padding: '1rem 2.5rem' }}>
        <div style={{
          flex: 1, minHeight: 0,
          display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '2.5rem', alignItems: 'center',
        }}>
          {/* LEFT — Success indicator + actions */}
          <div className="anim-scale" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem' }}>
            <div className="success-icon" style={{ borderColor: cfg.color, background: cfg.gradient, width: '7.5rem', height: '7.5rem' }}>
              <span style={{ fontSize: '3.5rem' }}>{cfg.icon}</span>
            </div>
            <div>
              <h2 className="success-title" style={{ color: cfg.color, marginBottom: '0.4rem', fontSize: '1.6rem' }}>
                {cfg.title}
              </h2>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '22rem', margin: '0 auto' }}>
                {cfg.subtitle}
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', maxWidth: '22rem' }}>
              <button
                id="btn-print"
                className="btn btn-outline no-print"
                style={{ fontSize: '1rem', padding: '0.9rem', minHeight: '52px' }}
                onClick={() => window.print()}>
                🖨️ {t('printReceipt')}
              </button>
              <button
                id="btn-home"
                className="btn btn-primary"
                style={{ fontSize: '1.05rem', padding: '1rem', minHeight: '56px' }}
                onClick={onHome}>
                🏠 {t('retDash')}
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {t('autoReturn')}
            </p>
          </div>

          {/* RIGHT — Receipt card */}
          <div className="anim-right">
            <div style={{
              background: cfg.gradient, border: `2px solid ${cfg.color}30`,
              borderRadius: 'var(--r-xl)', padding: '1.6rem 1.8rem',
            }}>
              <h3 style={{
                fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff',
              }}>
                🧾 {t('txnReceipt')}
              </h3>

              {details.map((d, i) => (
                <div key={i} className="receipt-row">
                  <span className="receipt-label">{d.label}</span>
                  <span className="receipt-value"
                    style={{ color: i === 0 ? cfg.color : '#fff', letterSpacing: i === 0 ? '0.05em' : 0 }}>
                    {d.value}
                  </span>
                </div>
              ))}

              <div style={{
                marginTop: '1rem', padding: '0.7rem',
                background: isOffline ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                borderRadius: 'var(--r-sm)',
                border: `1px solid ${isOffline ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.25)'}`,
                textAlign: 'center',
                color: isOffline ? '#fde68a' : 'var(--success)',
                fontSize: '0.82rem', fontWeight: 600,
              }}>
                {isOffline
                  ? '⏳ Request saved offline — will sync automatically when online.'
                  : `✅ ${t('compGenReceipt')}`}
              </div>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
              {t('thankYou')}
            </p>
          </div>
        </div>
      </div>

      <KioskFooter onHome={onHome} centerText={t('thankYou')} />
    </div>
  );
};

export default SuccessScreen;
