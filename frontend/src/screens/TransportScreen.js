import React, { useState } from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { useKiosk } from '../context/KioskContext';

const API = 'http://localhost:5000/api/transport';

const SERVICES = [
  { id: 'license-status',    icon: '🪪', label: 'Driving License Status',        desc: 'Check your DL status by License ID' },
  { id: 'learner-license',   icon: '📋', label: 'Learner License Application',   desc: 'Apply online for a learner license' },
  { id: 'vehicle-status',    icon: '🚗', label: 'Vehicle Registration Status',   desc: 'Check vehicle RC status by number' },
  { id: 'duplicate-rc',      icon: '📄', label: 'Duplicate RC Request',          desc: 'Request a duplicate registration certificate' },
  { id: 'pay-fine',          icon: '💸', label: 'Traffic Fine Payment',          desc: 'Pay pending traffic fines online' },
  { id: 'update-address',    icon: '🏠', label: 'Address Change in Vehicle',     desc: 'Update address on vehicle registration' },
  { id: 'license-renewal',   icon: '🔄', label: 'License Renewal',               desc: 'Renew your driving license before it expires' },
];

/* ─── individual service forms ─────────────────────────────────────────────── */

function LicenseStatusForm({ onResult, onError, isOnline }) {
  const [licenseId, setLicenseId] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!licenseId.trim()) { onError('Please enter a License ID.'); return; }
    if (!isOnline) { onError('This feature requires an active internet connection.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/license-status/${licenseId.trim()}`);
      const data = await res.json();
      if (data.success) onResult(data.data);
      else onError(data.error || 'License not found.');
    } catch { onError('Server error. Please try again.'); }
    setLoading(false);
  };
  return (
    <div className="transport-form">
      <label className="form-label">🪪 License ID</label>
      <input className="kiosk-input" value={licenseId}
        onChange={e => setLicenseId(e.target.value.toUpperCase())}
        placeholder="e.g. TN-2022-1234567" style={{ userSelect: 'text' }} />
      <button className="btn btn-primary transport-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? '⏳ Fetching...' : '🔍 Check Status'}
      </button>
    </div>
  );
}

function VehicleStatusForm({ onResult, onError, isOnline }) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!vehicleNumber.trim()) { onError('Please enter a vehicle number.'); return; }
    if (!isOnline) { onError('This feature requires an active internet connection.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/vehicle-status/${vehicleNumber.trim()}`);
      const data = await res.json();
      if (data.success) onResult(data.data);
      else onError(data.error || 'Vehicle not found.');
    } catch { onError('Server error. Please try again.'); }
    setLoading(false);
  };
  return (
    <div className="transport-form">
      <label className="form-label">🚗 Vehicle Number</label>
      <input className="kiosk-input" value={vehicleNumber}
        onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
        placeholder="e.g. TN09AB1234" style={{ userSelect: 'text' }} />
      <button className="btn btn-primary transport-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? '⏳ Fetching...' : '🔍 Check Status'}
      </button>
    </div>
  );
}

function PostForm({ endpoint, fields, submitLabel, method = 'POST', onSuccess, onError, currentUser, token, isOnline, enqueue }) {
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(f => [f.key, f.default || ''])));
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    // Required validation
    const missing = fields.filter(f => f.required && !form[f.key]?.trim());
    if (missing.length > 0) { onError(`Please fill: ${missing.map(f => f.label).join(', ')}`); return; }
    // Phone validation
    const phoneField = fields.find(f => f.key === 'phone');
    if (phoneField && !/^\d{10}$/.test(form.phone)) { onError('Phone number must be exactly 10 digits.'); return; }
    
    setLoading(true);

    if (!isOnline && method !== 'GET') {
      try {
        const customEndpoint = `/transport/${endpoint}`;
        const requestId = await enqueue('transport', form, customEndpoint, method);
        const offlineId = 'OFT-' + Date.now().toString().slice(-8);
        onSuccess({
          success: true,
          message: 'No internet connection. Your request has been saved and will be submitted automatically when the connection is restored.',
          data: {
            requestId: offlineId,
            status: 'queued',
            offline: true,
            syncId: requestId
          }
        });
      } catch (err) {
        onError('Failed to queue request. Please try again.');
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) onSuccess(data);
      else onError(data.error || 'Submission failed.');
    } catch { onError('Server error. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="transport-form">
      {fields.map(f => (
        <div key={f.key} style={{ marginBottom: '0.75rem' }}>
          <label className="form-label">{f.icon} {f.label}{f.required ? ' *' : ''}</label>
          {f.type === 'textarea' ? (
            <textarea className="kiosk-textarea" rows={2} value={form[f.key]}
              onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder || ''}
              style={{ userSelect: 'text' }} />
          ) : f.prefill && currentUser ? (
            <div className="kiosk-input" style={{ textAlign: 'left', letterSpacing: 0, fontSize: '1rem', padding: '0.6rem 1rem' }}>
              {currentUser[f.prefill] || form[f.key] || 'N/A'}
            </div>
          ) : (
            <input className="kiosk-input" type={f.type || 'text'} value={form[f.key]}
              onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder || ''}
              style={{ userSelect: 'text', letterSpacing: f.key === 'phone' ? '3px' : 0 }} />
          )}
        </div>
      ))}
      <button className="btn btn-primary transport-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? '⏳ Submitting...' : `${submitLabel} ✓`}
      </button>
    </div>
  );
}

/* ─── result / success card ─────────────────────────────────────────────────── */
function ResultCard({ data, onClose }) {
  if (!data) return null;
  const isSuccess = data.success !== undefined;
  return (
    <div className="transport-result-card anim-fade">
      {isSuccess ? (
        <>
          <div className="transport-result-icon">✅</div>
          <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>{data.message}</h3>
          {data.data && (
            <div className="transport-result-fields">
              {Object.entries(data.data)
                .filter(([k]) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(k))
                .map(([k, v]) => (
                  <div key={k} className="transport-result-row">
                    <span className="transport-result-key">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    <span className="transport-result-val">{String(v)}</span>
                  </div>
                ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="transport-result-icon">📋</div>
          <div className="transport-result-fields">
            {Object.entries(data)
              .filter(([k]) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(k))
              .map(([k, v]) => (
                <div key={k} className="transport-result-row">
                  <span className="transport-result-key">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  <span className="transport-result-val" style={{ color: k === 'status' ? 'var(--success)' : undefined }}>
                    {String(v)}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}
      <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={onClose}>
        ← Back to Services
      </button>
    </div>
  );
}

/* ─── main screen ───────────────────────────────────────────────────────────── */
const TransportScreen = ({ onBack, onHome, onSuccess }) => {
  const { currentUser, speak, isOnline, enqueue } = useKiosk();
  const [selected, setSelected] = useState(null);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const token = localStorage.getItem('kiosk_token');

  const mobile = currentUser?.mobile || '';

  const handleSuccess = (data) => {
    setError(null);
    setResult(data);
    speak('Your request has been submitted successfully.');
  };
  const handleError = (msg) => { setError(msg); setResult(null); };
  const handleSelect = (svc) => { setSelected(svc); setResult(null); setError(null); };
  const handleBack   = () => { setSelected(null); setResult(null); setError(null); };

  // Field definitions per service
  const formConfigs = {
    'learner-license': {
      endpoint: 'learner-license', submitLabel: 'Submit Application', method: 'POST',
      fields: [
        { key: 'applicantName', icon: '👤', label: 'Full Name', required: true, placeholder: 'As per Aadhaar' },
        { key: 'phone', icon: '📱', label: 'Phone Number', required: true, placeholder: '10-digit mobile' },
        { key: 'dob', icon: '🎂', label: 'Date of Birth', required: true, type: 'date' },
        { key: 'vehicleClass', icon: '🚗', label: 'Vehicle Class', required: true, placeholder: 'e.g. LMV, MCWG' },
        { key: 'address', icon: '🏠', label: 'Address', required: true, type: 'textarea' },
        { key: 'testDate', icon: '📅', label: 'Preferred Test Date', type: 'date' },
      ]
    },
    'duplicate-rc': {
      endpoint: 'duplicate-rc', submitLabel: 'Request Duplicate RC', method: 'POST',
      fields: [
        { key: 'vehicleNumber', icon: '🚗', label: 'Vehicle Number', required: true, placeholder: 'e.g. TN09AB1234' },
        { key: 'ownerName', icon: '👤', label: 'Owner Name', required: true, placeholder: 'As per RC' },
        { key: 'phone', icon: '📱', label: 'Phone Number', required: true, placeholder: '10-digit mobile', default: mobile },
        { key: 'reason', icon: '📝', label: 'Reason for Duplicate RC', required: true, type: 'textarea', placeholder: 'Lost / Damaged / Stolen...' },
      ]
    },
    'pay-fine': {
      endpoint: 'pay-fine', submitLabel: 'Pay Fine', method: 'POST',
      fields: [
        { key: 'vehicleNumber', icon: '🚗', label: 'Vehicle Number', required: true, placeholder: 'e.g. TN09AB1234' },
        { key: 'ownerName', icon: '👤', label: 'Owner Name', required: true, placeholder: 'Vehicle owner name' },
        { key: 'phone', icon: '📱', label: 'Phone Number', required: true, placeholder: '10-digit mobile', default: mobile },
        { key: 'fineAmount', icon: '💰', label: 'Fine Amount (₹)', required: true, type: 'number', placeholder: 'e.g. 500' },
        { key: 'violation', icon: '⚠️', label: 'Violation Type', required: false, placeholder: 'e.g. Signal jumping, Speeding' },
      ]
    },
    'update-address': {
      endpoint: 'update-address', submitLabel: 'Submit Address Change', method: 'PUT',
      fields: [
        { key: 'vehicleNumber', icon: '🚗', label: 'Vehicle Number', required: true, placeholder: 'e.g. TN09AB1234' },
        { key: 'ownerName', icon: '👤', label: 'Owner Name', required: true, placeholder: 'As per RC' },
        { key: 'phone', icon: '📱', label: 'Phone Number', required: true, placeholder: '10-digit mobile', default: mobile },
        { key: 'oldAddress', icon: '📌', label: 'Old Address', required: false, type: 'textarea' },
        { key: 'newAddress', icon: '🏠', label: 'New Address', required: true, type: 'textarea', placeholder: 'Full new address with PIN code' },
      ]
    },
    'license-renewal': {
      endpoint: 'license-renewal', submitLabel: 'Submit Renewal Application', method: 'POST',
      fields: [
        { key: 'applicantName', icon: '👤', label: 'Full Name',            required: true,  placeholder: 'As per Aadhaar' },
        { key: 'phone',         icon: '📱', label: 'Phone Number',         required: true,  placeholder: '10-digit mobile', default: mobile },
        { key: 'licenseId',     icon: '🤪', label: 'License ID',           required: true,  placeholder: 'e.g. TN-2022-1234567' },
        { key: 'dob',           icon: '🎂', label: 'Date of Birth',        required: true,  type: 'date' },
        { key: 'vehicleClass',  icon: '🚗', label: 'Vehicle Class',        required: true,  placeholder: 'e.g. LMV, MCWG' },
        { key: 'address',       icon: '🏠', label: 'Address',              required: true,  type: 'textarea', placeholder: 'Full address with PIN code' },
        { key: 'expiryDate',    icon: '📅', label: 'Current Expiry Date',  required: false, type: 'date' },
        { key: 'renewalDate',   icon: '📅', label: 'Preferred Renewal Date',required: false, type: 'date' },
      ]
    },
  };

  const renderForm = () => {
    if (selected === 'license-status') return <LicenseStatusForm onResult={r => setResult(r)} onError={handleError} isOnline={isOnline} />;
    if (selected === 'vehicle-status') return <VehicleStatusForm onResult={r => setResult(r)} onError={handleError} isOnline={isOnline} />;
    const cfg = formConfigs[selected];
    if (!cfg) return null;
    return (
      <PostForm
        endpoint={cfg.endpoint} fields={cfg.fields} submitLabel={cfg.submitLabel}
        method={cfg.method || 'POST'} onSuccess={handleSuccess} onError={handleError}
        currentUser={currentUser} token={token} isOnline={isOnline} enqueue={enqueue}
      />
    );
  };

  const selectedSvc = SERVICES.find(s => s.id === selected);

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title="🚗 Transport Department" subtitle="RTO Services · Tamil Nadu" showUser={true} />

      <div className="content-area no-scroll" style={{ padding: '1rem 2.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
          🏠 Home › 🚗 Transport
          {selectedSvc && <> › {selectedSvc.icon} {selectedSvc.label}</>}
        </div>

        {!selected ? (
          /* Service grid */
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              Select a Transport Service
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Touch a tile to proceed with the service
            </p>
            <div className="transport-grid anim-up">
              {SERVICES.map((svc, i) => (
                <button
                  key={svc.id}
                  id={`transport-${svc.id}`}
                  className="transport-tile"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => { speak(svc.label); handleSelect(svc.id); }}
                >
                  <span className="transport-tile-icon">{svc.icon}</span>
                  <div className="transport-tile-body">
                    <h3>{svc.label}</h3>
                    <p>{svc.desc}</p>
                  </div>
                  <span className="transport-tile-arrow">›</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Form + result view */
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', minHeight: 0 }}>
            {/* Left: form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }} className="hide-scrollbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem',
                padding: '0.75rem 1.25rem', background: 'rgba(37,99,176,0.15)', borderRadius: 'var(--r-md)',
                border: '1px solid rgba(37,99,176,0.3)' }}>
                <span style={{ fontSize: '2rem' }}>{selectedSvc?.icon}</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedSvc?.label}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedSvc?.desc}</p>
                </div>
              </div>
              {error && <div className="alert alert-error anim-fade">❌ {error}</div>}
              {renderForm()}
            </div>

            {/* Right: result or info */}
            <div style={{ overflowY: 'auto' }} className="hide-scrollbar">
              {result ? (
                <ResultCard data={result} onClose={handleBack} />
              ) : (
                <div className="info-card" style={{ height: '100%' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-light)' }}>
                    ℹ️ Service Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { icon: '🕐', text: 'Processing Time: 5-7 working days' },
                      { icon: '📄', text: 'Keep Aadhaar & original documents handy' },
                      { icon: '📱', text: 'SMS updates will be sent to your mobile' },
                      { icon: '🏢', text: 'Visit RTO if physical verification is required' },
                      { icon: '💡', text: 'All services are available 9 AM – 5 PM on weekdays' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <KioskFooter
        onBack={selected ? handleBack : onBack}
        onHome={onHome}
        onCancel={onHome}
      />
    </div>
  );
};

export default TransportScreen;
