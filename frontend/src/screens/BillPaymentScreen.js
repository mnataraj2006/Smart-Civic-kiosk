import React, { useState, useCallback } from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import NumericKeypad from '../components/NumericKeypad';
import { useKiosk } from '../context/KioskContext';

const BillPaymentScreen = ({ department, onSuccess, onBack, onHome }) => {
  const { fetchBill, payBill, currentUser, t, speak, loading } = useKiosk();
  const STEPS = [t('stepConsumerId'), t('stepViewBill'), t('stepPayment'), t('stepDone')];
  const [step, setStep]         = useState(0);
  const [consumerNo, setConsumerNo] = useState('');
  const [bill, setBill]         = useState(null);
  const [payMethod, setPayMethod] = useState('upi');
  const [message, setMessage]   = useState(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [cashPending, setCashPending]   = useState(false);

  const deptColor = { electricity: 'var(--elec)', gas: 'var(--gas)', water: 'var(--water)', municipal: 'var(--muni)' }[department] || 'var(--blue-light)';
  const defaultConsumers = { electricity: 'EB123456789', gas: 'GB456789123', water: 'WB987654321', municipal: 'PT123456' };

  const handleFetchBill = useCallback(async () => {
    if (!consumerNo) { setMessage({ type: 'error', text: t('enterConsumerNumErr') }); return; }
    const res = await fetchBill(consumerNo, department);
    if (res.success) { setBill(res.bill); setStep(1); speak(t('billFetchedSpeak')); }
    else setMessage({ type: 'error', text: res.message || t('billNotFound') });
  }, [consumerNo, department, fetchBill, speak, t]);

  const handlePayment = useCallback(async () => {
    if (payMethod === 'upi') {
      setShowUpiModal(true);
      return;
    }
    // Cash — mark as pending_cash immediately
    if (payMethod === 'cash') {
      setCashPending(true);
      speak(t('cashPendingSpeak'));
      // After 2 s simulate operator confirmation and complete
      setTimeout(async () => {
        const res = await payBill(bill._id || bill.consumerNumber, 'cash', currentUser?.mobile);
        setCashPending(false);
        if (res.success) {
          speak(t('paymentSuccessSpeak'));
          onSuccess({ ...res, bill, department, paymentMethod: 'cash' });
        } else {
          setMessage({ type: 'error', text: res.message || t('paymentFailed') });
        }
      }, 2000);
      return;
    }
    const res = await payBill(bill._id || bill.consumerNumber, payMethod, currentUser?.mobile);
    if (res.success) { speak(t('paymentSuccessSpeak')); onSuccess({ ...res, bill, department, paymentMethod: payMethod }); }
    else setMessage({ type: 'error', text: res.message || t('paymentFailed') });
  }, [bill, payMethod, currentUser, department, onSuccess, payBill, speak, t]);

  const handleUpiConfirm = useCallback(async () => {
    setShowUpiModal(false);
    const res = await payBill(bill._id || bill.consumerNumber, 'upi', currentUser?.mobile);
    if (res.success) { speak(t('paymentSuccessSpeak')); onSuccess({ ...res, bill, department, paymentMethod: 'upi' }); }
    else setMessage({ type: 'error', text: res.message || t('paymentFailed') });
  }, [bill, currentUser, department, onSuccess, payBill, speak, t]);

  /* ── UPI QR Modal ─────────────────────────────── */
  const UpiModal = () => (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)', zIndex: 20000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg,#0f2847,#1a3a6e)',
        border: '2px solid rgba(37,99,176,0.5)', borderRadius: '1.5rem',
        padding: '2.5rem', maxWidth: '420px', width: '90%', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          📲 {t('upiModalTitle')}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {t('upiModalDesc')}
        </p>

        {/* Fake QR code SVG */}
        <div style={{
          background: '#fff', borderRadius: '1rem', padding: '1.25rem',
          display: 'inline-block', marginBottom: '1.25rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="160" height="160" fill="white"/>
            {/* QR corner squares */}
            <rect x="10" y="10" width="50" height="50" rx="4" fill="#0f2847"/>
            <rect x="18" y="18" width="34" height="34" rx="2" fill="white"/>
            <rect x="24" y="24" width="22" height="22" rx="1" fill="#0f2847"/>
            <rect x="100" y="10" width="50" height="50" rx="4" fill="#0f2847"/>
            <rect x="108" y="18" width="34" height="34" rx="2" fill="white"/>
            <rect x="114" y="24" width="22" height="22" rx="1" fill="#0f2847"/>
            <rect x="10" y="100" width="50" height="50" rx="4" fill="#0f2847"/>
            <rect x="18" y="108" width="34" height="34" rx="2" fill="white"/>
            <rect x="24" y="114" width="22" height="22" rx="1" fill="#0f2847"/>
            {/* Data modules */}
            {[70,78,86,94].map(x => [70,78,86,94].map(y => (
              <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" fill="#0f2847" />
            )))}
            {[68,76,84,92,100,108,116,124,132].map((x,i) => (
              <rect key={x} x={x} y={i%2===0?70:78} width="5" height="5" fill="#1a3a6e" opacity="0.8"/>
            ))}
          </svg>
        </div>

        <div style={{
          background: 'rgba(37,99,176,0.15)', borderRadius: '0.75rem',
          padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(37,99,176,0.3)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Amount to Pay</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: deptColor }}>
            ₹{bill?.amount?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            UPI ID: smartcivic@upi
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          📱 {t('upiScanInstructions')}
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowUpiModal(false)}>
            ← {t('back')}
          </button>
          <button className="btn btn-primary" style={{ flex: 2, fontSize: '1.05rem', fontWeight: 800 }}
            onClick={handleUpiConfirm} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: 2 }} /> : null}
            ✅ {t('upiPaidConfirm')}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Cash Pending overlay ─────────────────────── */
  const CashOverlay = () => (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)', zIndex: 20000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg,#0f2847,#1a3a6e)',
        border: '2px solid rgba(245,158,11,0.4)', borderRadius: '1.5rem',
        padding: '2.5rem', maxWidth: '420px', width: '90%', textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏧</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.75rem' }}>
          {t('cashPendingTitle')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {t('cashPendingDesc')}
        </p>
        <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderWidth: 3, margin: '1.5rem auto 0' }} />
      </div>
    </div>
  );

  /* ── Payment method options ───────────────────── */
  const PAY_METHODS = [
    { id: 'upi',  icon: '📲', label: t('upiPay'),  desc: t('upiPayDesc') },
    { id: 'cash', icon: '🏧', label: t('cashPay'), desc: t('cashPayDesc') },
  ];

  return (
    <div className="screen" style={{ position: 'relative' }}>
      {showUpiModal && <UpiModal />}
      {cashPending && <CashOverlay />}

      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title={`${t(department)} ${t('billPaymentTitle')}`} showUser={true} />

      <div className="content-area no-scroll" style={{ padding: '1.25rem 2.5rem' }}>
        {/* Step indicator */}
        <div className="step-indicator" style={{ marginBottom: '1rem', flexShrink: 0 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 0: Consumer Number */}
        {step === 0 && (
          <div className="anim-up" style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '0.5rem', color: deptColor }}>
                {t('enterConsumerNum')}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                {t('consumerNumSub')}
              </p>
              <input className="kiosk-input" value={consumerNo} readOnly placeholder={t('consumerNumber')}
                style={{ marginBottom: '0.75rem', letterSpacing: consumerNo ? '0.15em' : '0', fontSize: '1.4rem' }} />
              <NumericKeypad value={consumerNo} onChange={setConsumerNo} maxLength={12} />
              {message && <div className="alert alert-error anim-fade" style={{ marginTop: '0.75rem' }}>❌ {message.text}</div>}
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', fontSize: '1.1rem', padding: '0.9rem' }}
                onClick={handleFetchBill} disabled={loading || !consumerNo}>
                {loading ? <span className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: 3 }} /> : null}
                {t('fetchBillBtn')} →
              </button>
            </div>
            <div>
              <div className="info-card" style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>📋 {t('quickFill')}</h4>
                {currentUser?.consumerNumbers && Object.entries(currentUser.consumerNumbers)
                  .filter(([, v]) => v)
                  .map(([key, val]) => (
                    <button key={key} onClick={() => setConsumerNo(val)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', background: 'rgba(37,99,176,0.15)', border: '1px solid rgba(37,99,176,0.35)',
                      borderRadius: 'var(--r-sm)', padding: '0.6rem 1rem', marginBottom: '0.5rem',
                      cursor: 'pointer', color: 'var(--white)', fontSize: '0.9rem', textAlign: 'left',
                    }}>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{t(key)}</span>
                      <span style={{ color: 'var(--text-soft)', fontFamily: 'monospace' }}>{val}</span>
                      <span style={{ color: 'var(--blue-light)' }}>{t('use')} →</span>
                    </button>
                  ))
                }
                <button onClick={() => setConsumerNo(defaultConsumers[department] || 'EB123456789')} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', background: 'rgba(37,99,176,0.15)', border: '1px solid rgba(37,99,176,0.35)',
                  borderRadius: 'var(--r-sm)', padding: '0.6rem 1rem',
                  cursor: 'pointer', color: 'var(--white)', fontSize: '0.9rem',
                }}>
                  <span style={{ textTransform: 'capitalize' }}>{t(department)}</span>
                  <span style={{ color: 'var(--text-soft)', fontFamily: 'monospace' }}>{defaultConsumers[department]}</span>
                  <span style={{ color: 'var(--blue-light)' }}>{t('demo')} →</span>
                </button>
              </div>
              <div className="info-card">
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>💡 {t('whereToFind')}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{t('whereToFindDesc')}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Bill Details + Payment Selection */}
        {step === 1 && bill && (
          <div className="anim-up" style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', color: deptColor }}>📄 {t('billDetails')}</h2>
              <div className="info-card" style={{ marginBottom: '1rem' }}>
                {[
                  { label: t('consumerNumber'), value: bill.consumerNumber },
                  { label: t('billMonth'),      value: bill.month || 'Current' },
                  { label: t('unitsConsumed'),  value: bill.units ? `${bill.units} ${t('unitsLabel')}` : 'N/A' },
                  { label: t('dueDate'),        value: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : 'N/A' },
                ].map((row, i) => (
                  <div key={i} className="receipt-row">
                    <span className="receipt-label">{row.label}</span>
                    <span className="receipt-value">{row.value}</span>
                  </div>
                ))}
                <div className="receipt-row" style={{ borderTop: '2px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('totalAmount')}</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: deptColor }}>
                    ₹{bill.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="alert alert-warning">
                ⚠️ {t('dueBy')} {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : 'this month'}. {t('avoidPenalties')}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {t('selectPayMethod')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {t('payMethodSubtitle')}
              </p>
              {PAY_METHODS.map(m => (
                <button key={m.id}
                  className={`payment-card ${payMethod === m.id ? 'selected' : ''}`}
                  style={{ marginBottom: '0.75rem', display: 'flex' }}
                  onClick={() => setPayMethod(m.id)}>
                  <span className="payment-icon">{m.icon}</span>
                  <div>
                    <div className="payment-label">{m.label}</div>
                    <div className="payment-desc">{m.desc}</div>
                  </div>
                  {payMethod === m.id && <span style={{ marginLeft: 'auto', color: 'var(--success)', fontSize: '1.4rem' }}>✓</span>}
                </button>
              ))}

              {/* Cash special note */}
              {payMethod === 'cash' && (
                <div className="alert alert-warning" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  🏧 {t('cashHandNote')}
                </div>
              )}

              {message && <div className="alert alert-error anim-fade" style={{ marginTop: '0.5rem' }}>❌ {message.text}</div>}
            </div>
          </div>
        )}
      </div>

      <KioskFooter
        onHome={onHome}
        onBack={() => step === 0 ? onBack() : setStep(s => s - 1)}
        onCancel={onHome}
        onConfirm={step === 0 ? handleFetchBill : handlePayment}
        confirmLabel={step === 0
          ? t('fetchBillBtn') + ' →'
          : `${payMethod === 'upi' ? '📲' : '🏧'} ${t('confirmPay')} ₹${bill?.amount?.toLocaleString('en-IN') || ''} ✓`}
        confirmDisabled={loading || (step === 0 ? !consumerNo : false)}
      />
    </div>
  );
};

export default BillPaymentScreen;
