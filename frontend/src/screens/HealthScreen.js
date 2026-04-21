import React, { useState } from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { useKiosk } from '../context/KioskContext';

const API = 'http://localhost:5000/api/health';

const SERVICES = [
  { id: 'appointment',          icon: '🏥', label: 'Hospital Appointment',       desc: 'Book an appointment at a government hospital' },
  { id: 'vaccination',          icon: '💉', label: 'Vaccination Registration',    desc: 'Register for vaccination programs' },
  { id: 'scheme',               icon: '🛡️', label: 'Health Scheme Enrollment',   desc: 'Enroll in government health schemes' },
  { id: 'medical-certificate',  icon: '📜', label: 'Medical Certificate Request', desc: 'Request official medical certificates' },
  { id: 'sanitation-complaint', icon: '🗑️', label: 'Sanitation Complaint',       desc: 'Report sanitation & public hygiene issues' },
  { id: 'grievance',            icon: '📢', label: 'Public Health Grievance',    desc: 'Submit health-related grievances' },
];

/* ─── Generic form component ────────────────────────────────────────────────── */
function HealthForm({ endpoint, fields, submitLabel, onSuccess, onError, token, isOnline, enqueue }) {
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(f => [f.key, f.default || ''])));
  const [loading, setLoading] = useState(false);
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    const missing = fields.filter(f => f.required && !form[f.key]?.toString().trim());
    if (missing.length > 0) { onError(`Please fill: ${missing.map(f => f.label).join(', ')}`); return; }
    if (form.phone && !/^\d{10}$/.test(form.phone)) { onError('Phone number must be exactly 10 digits.'); return; }
    
    setLoading(true);

    if (!isOnline) {
      try {
        const customEndpoint = `/health/${endpoint}`;
        const requestId = await enqueue('health', form, customEndpoint, 'POST');
        const offlineId = 'OFH-' + Date.now().toString().slice(-8);
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) onSuccess(data);
      else onError(data.error || 'Submission failed. Please try again.');
    } catch { onError('Server unreachable. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="transport-form">
      {fields.map(f => (
        <div key={f.key} style={{ marginBottom: '0.7rem' }}>
          <label className="form-label">{f.icon} {f.label}{f.required ? ' *' : ''}</label>
          {f.type === 'textarea' ? (
            <textarea className="kiosk-textarea" rows={2} value={form[f.key]}
              onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder || ''}
              style={{ userSelect: 'text' }} />
          ) : (
            <input className="kiosk-input" type={f.type || 'text'} value={form[f.key]}
              onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder || ''}
              style={{ userSelect: 'text', letterSpacing: f.key === 'phone' ? '3px' : 0 }} />
          )}
        </div>
      ))}
      <button className="btn btn-primary transport-submit health-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? '⏳ Submitting...' : `${submitLabel} ✓`}
      </button>
    </div>
  );
}

/* ─── Success / result card ─────────────────────────────────────────────────── */
function SuccessCard({ data, onClose }) {
  return (
    <div className="transport-result-card health-result-card anim-fade">
      <div className="transport-result-icon">✅</div>
      <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>{data.message}</h3>
      {data.data && (
        <div className="transport-result-fields">
          {Object.entries(data.data)
            .filter(([k]) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(k))
            .map(([k, v]) => (
              <div key={k} className="transport-result-row">
                <span className="transport-result-key">
                  {k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </span>
                <span className="transport-result-val" style={{ color: k === 'status' ? 'var(--success)' : undefined }}>
                  {String(v)}
                </span>
              </div>
            ))}
        </div>
      )}
      <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={onClose}>
        ← Back to Health Services
      </button>
    </div>
  );
}

/* ─── Main screen ───────────────────────────────────────────────────────────── */
const HealthScreen = ({ onBack, onHome }) => {
  const { currentUser, speak, isOnline, enqueue } = useKiosk();
  const [selected, setSelected] = useState(null);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const token = localStorage.getItem('kiosk_token');
  const mobile = currentUser?.mobile || '';

  const handleSuccess = (data) => { setError(null); setResult(data); speak('Request submitted successfully.'); };
  const handleError   = (msg)  => { setError(msg); setResult(null); };
  const handleBack    = ()     => { setSelected(null); setResult(null); setError(null); };

  const formConfigs = {
    'appointment': {
      endpoint: 'appointment', submitLabel: 'Book Appointment',
      fields: [
        { key: 'patientName',     icon: '👤', label: 'Patient Name',      required: true, placeholder: 'Full name' },
        { key: 'phone',           icon: '📱', label: 'Phone Number',      required: true, placeholder: '10-digit mobile', default: mobile },
        { key: 'hospitalName',    icon: '🏥', label: 'Hospital Name',     required: true, placeholder: 'e.g. GGH Chennai' },
        { key: 'department',      icon: '🩺', label: 'Department',        required: false, placeholder: 'e.g. Cardiology' },
        { key: 'appointmentDate', icon: '📅', label: 'Appointment Date',  required: true, type: 'date' },
        { key: 'timeSlot',        icon: '⏰', label: 'Preferred Time',    required: false, placeholder: 'e.g. 09:30 AM' },
      ]
    },
    'vaccination': {
      endpoint: 'vaccination', submitLabel: 'Register for Vaccination',
      fields: [
        { key: 'patientName',     icon: '👤', label: 'Patient Name',      required: true, placeholder: 'Full name' },
        { key: 'phone',           icon: '📱', label: 'Phone Number',      required: true, placeholder: '10-digit mobile', default: mobile },
        { key: 'vaccineName',     icon: '💉', label: 'Vaccine Name',      required: true, placeholder: 'e.g. COVID-19, Flu' },
        { key: 'age',             icon: '🔢', label: 'Age',               required: false, type: 'number', placeholder: 'Patient age' },
        { key: 'dose',            icon: '🩹', label: 'Dose Number',       required: false, placeholder: 'e.g. 1st, 2nd, Booster' },
        { key: 'preferredDate',   icon: '📅', label: 'Preferred Date',    required: false, type: 'date' },
        { key: 'preferredCenter', icon: '🏥', label: 'Preferred Center',  required: false, placeholder: 'Vaccination center name' },
      ]
    },
    'scheme': {
      endpoint: 'scheme', submitLabel: 'Enroll in Scheme',
      fields: [
        { key: 'applicantName',  icon: '👤', label: 'Applicant Name',   required: true, placeholder: 'Full name' },
        { key: 'phone',          icon: '📱', label: 'Phone Number',     required: true, placeholder: '10-digit mobile', default: mobile },
        { key: 'schemeName',     icon: '🛡️', label: 'Scheme Name',      required: true, placeholder: 'e.g. Ayushman Bharat, CMCHIS' },
        { key: 'aadharNumber',   icon: '🪪', label: 'Aadhaar Number',   required: false, placeholder: '12-digit Aadhaar' },
        { key: 'income',         icon: '💰', label: 'Annual Income (₹)', required: false, type: 'number', placeholder: 'Family annual income' },
      ]
    },
    'medical-certificate': {
      endpoint: 'medical-certificate', submitLabel: 'Request Certificate',
      fields: [
        { key: 'patientName', icon: '👤', label: 'Patient Name',  required: true, placeholder: 'Full name' },
        { key: 'phone',       icon: '📱', label: 'Phone Number',  required: true, placeholder: '10-digit mobile', default: mobile },
        { key: 'purpose',     icon: '📝', label: 'Purpose',       required: true, type: 'textarea', placeholder: 'e.g. Employment, Driving License, School...' },
        { key: 'doctor',      icon: '👨‍⚕️', label: 'Doctor Name', required: false, placeholder: 'Preferred doctor name' },
        { key: 'hospital',    icon: '🏥', label: 'Hospital',      required: false, placeholder: 'Hospital / clinic name' },
      ]
    },
    'sanitation-complaint': {
      endpoint: 'sanitation-complaint', submitLabel: 'File Complaint',
      fields: [
        { key: 'patientName',      icon: '👤', label: 'Your Name',          required: true, placeholder: 'Full name' },
        { key: 'phone',            icon: '📱', label: 'Phone Number',        required: true, placeholder: '10-digit mobile', default: mobile },
        { key: 'location',         icon: '📍', label: 'Location',            required: false, placeholder: 'Street / area / landmark' },
        { key: 'complaintDetails', icon: '📝', label: 'Complaint Details',   required: true, type: 'textarea', placeholder: 'Describe the sanitation issue...' },
      ]
    },
    'grievance': {
      endpoint: 'grievance', submitLabel: 'Submit Grievance',
      fields: [
        { key: 'patientName',      icon: '👤', label: 'Your Name',          required: true, placeholder: 'Full name' },
        { key: 'phone',            icon: '📱', label: 'Phone Number',        required: true, placeholder: '10-digit mobile', default: mobile },
        { key: 'hospitalName',     icon: '🏥', label: 'Hospital / Facility', required: false, placeholder: 'Related facility name' },
        { key: 'complaintDetails', icon: '📝', label: 'Grievance Details',   required: true, type: 'textarea', placeholder: 'Describe your health grievance in detail...' },
      ]
    },
  };

  const selectedSvc = SERVICES.find(s => s.id === selected);
  const cfg = formConfigs[selected];

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title="🏥 Public Health Department" subtitle="Health Services · Government of Tamil Nadu" showUser={true} />

      <div className="content-area no-scroll" style={{ padding: '1rem 2.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
          🏠 Home › 🏥 Public Health
          {selectedSvc && <> › {selectedSvc.icon} {selectedSvc.label}</>}
        </div>

        {!selected ? (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              Select a Health Service
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Touch a tile to access the service
            </p>
            <div className="transport-grid health-grid anim-up">
              {SERVICES.map((svc, i) => (
                <button
                  key={svc.id}
                  id={`health-${svc.id}`}
                  className="transport-tile health-tile"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => { speak(svc.label); setSelected(svc.id); setError(null); setResult(null); }}
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
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', minHeight: 0 }}>
            {/* Left: form */}
            <div style={{ overflowY: 'auto' }} className="hide-scrollbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem',
                padding: '0.75rem 1.25rem', background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--r-md)',
                border: '1px solid rgba(16,185,129,0.3)' }}>
                <span style={{ fontSize: '2rem' }}>{selectedSvc?.icon}</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedSvc?.label}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedSvc?.desc}</p>
                </div>
              </div>
              {error && <div className="alert alert-error anim-fade">❌ {error}</div>}
              {cfg && (
                <HealthForm
                  endpoint={cfg.endpoint} fields={cfg.fields} submitLabel={cfg.submitLabel}
                  onSuccess={handleSuccess} onError={handleError} token={token} isOnline={isOnline} enqueue={enqueue}
                />
              )}
            </div>

            {/* Right: result or info */}
            <div style={{ overflowY: 'auto' }} className="hide-scrollbar">
              {result ? (
                <SuccessCard data={result} onClose={handleBack} />
              ) : (
                <div className="info-card health-info-card" style={{ height: '100%' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#10b981' }}>
                    ℹ️ Important Information
                  </h4>
                  {[
                    { icon: '📄', text: 'Keep Aadhaar card and medical documents ready' },
                    { icon: '📱', text: 'SMS confirmation will be sent to your mobile' },
                    { icon: '🕐', text: 'Applications are processed within 3-5 working days' },
                    { icon: '🆓', text: 'Most services are free for BPL/SC/ST citizens' },
                    { icon: '☎️', text: 'Health Helpline: 104 (Toll Free, 24×7)' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.text}</span>
                    </div>
                  ))}
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

export default HealthScreen;
