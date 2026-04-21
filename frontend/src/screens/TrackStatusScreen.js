import React, { useState, useEffect } from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import NumericKeypad from '../components/NumericKeypad';
import { useKiosk } from '../context/KioskContext';

const TrackStatusScreen = ({ onBack, onHome }) => {
  const { trackStatus, currentUser, speak, loading, t } = useKiosk();
  const [searchType, setSearchType] = useState('id'); // id | mobile
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showKeypad, setShowKeypad] = useState(true);

  useEffect(() => {
    if (currentUser?.mobile) {
      setSearchValue(currentUser.mobile);
      setSearchType('mobile');
    }
  }, [currentUser]);

  const handleSearch = async () => {
    if (!searchValue) { setError(t('enterSearchVal')); return; }
    setError(null);
    const res = await trackStatus({ type: searchType, value: searchValue });
    if (res.success && res.results?.length > 0) {
      setResults(res.results);
      speak(t('foundRecordsSpeak'));
    } else {
      setResults([]);
      setError(t('noRecordsFound'));
    }
  };

  const statusConfig = {
    pending: { color: 'var(--warning)', label: t('pending'), bg: 'rgba(255,187,51,0.1)' },
    'in-progress': { color: 'var(--info)', label: t('inProgress'), bg: 'rgba(51,181,229,0.1)' },
    resolved: { color: 'var(--success)', label: t('resolved'), bg: 'rgba(0,200,81,0.1)' },
    submitted: { color: 'var(--primary-light)', label: t('submitted'), bg: 'rgba(37,99,176,0.1)' },
    'under-review': { color: 'var(--info)', label: t('underReview'), bg: 'rgba(51,181,229,0.1)' },
    completed: { color: 'var(--success)', label: t('completed'), bg: 'rgba(0,200,81,0.1)' },
    closed: { color: 'var(--text-muted)', label: t('closed'), bg: 'rgba(255,255,255,0.05)' },
  };

  const deptIcons = { electricity: '⚡', water: '💧', gas: '🔥', municipal: '🏙️' };

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title={`📍 ${t('trackSearchLabel')}`} showUser={true} />

      <div className="content-area no-scroll" style={{ padding: '1.25rem 2.5rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem', flexShrink: 0 }}>
          🏠 {t('home')} › 🔍 {t('trackSearchLabel')}
        </div>

        <div style={{ marginBottom: '0.75rem', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>{t('trackSearchLabel')}</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{t('trackSearchDesc')}</p>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left - Search */}
          <div>
            {/* Search Type Toggle */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'rgba(26,58,107,0.3)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {[
                { type: 'id', label: `🆔 ${t('compIdLabel')}` },
                { type: 'mobile', label: `📱 ${t('mobNumLabel')}` },
              ].map(opt => (
                <button
                  key={opt.type}
                  id={`search-type-${opt.type}`}
                  className="btn"
                  style={{
                    flex: 1, padding: '16px', borderRadius: 0,
                    background: searchType === opt.type ? 'var(--primary-light)' : 'transparent',
                    color: '#fff', fontSize: '1rem', fontWeight: searchType === opt.type ? 700 : 400,
                    transition: 'all 0.3s'
                  }}
                  onClick={() => { setSearchType(opt.type); setSearchValue(''); setResults(null); setError(null); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">
                {searchType === 'id' ? `🆔 ${t('enterComplId')}` : `📱 ${t('enterMobNum')}`}
              </label>
              <input
                className="kiosk-input"
                value={searchValue}
                readOnly
                placeholder={searchType === 'id' ? 'CMP / SRQ Number' : t('enter10digit')}
                style={{ marginBottom: 16, letterSpacing: '3px', fontSize: '1.5rem' }}
              />

              {showKeypad ? (
                <>
                  <button className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', marginBottom: 12 }}
                    onClick={() => setShowKeypad(false)}>
                    📝 {t('typeInstead')}
                  </button>
                  <NumericKeypad
                    value={searchValue}
                    onChange={setSearchValue}
                    maxLength={searchType === 'id' ? 12 : 10}
                  />
                </>
              ) : (
                <input type="text" className="form-control"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value.toUpperCase())}
                  placeholder={searchType === 'id' ? t('compIdLabel') : t('mobNumLabel')}
                  style={{ fontSize: '1.3rem', textAlign: 'center', marginBottom: 12 }}
                />
              )}
            </div>

            {/* Quick Fill for logged-in user */}
            {currentUser?.mobile && (
              <button className="btn btn-outline" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: 16 }}
                onClick={() => { setSearchType('mobile'); setSearchValue(currentUser.mobile); }}>
                📱 {t('useMyMobile')}: {currentUser.mobile}
              </button>
            )}

            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>❌ {error}</div>}

            <button
              id="btn-track-search"
              className="btn btn-primary"
              style={{ width: '100%', padding: '20px', fontSize: '1.3rem' }}
              onClick={handleSearch}
              disabled={loading || !searchValue}
            >
              {loading ? '⏳ ...' : `🔍 ${t('searchStatusBtn')}`}
            </button>
          </div>

          {/* Right - Results or Info */}
          <div>
            {results === null && (
              <div className="info-card">
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, color: 'var(--track)' }}>
                  📍 {t('howToTrack')}
                </h4>
                {[
                  { icon: '🆔', text: t('trackStep1') },
                  { icon: '📱', text: t('trackStep2') },
                  { icon: '📊', text: t('trackStep3') },
                  { icon: '📅', text: t('trackStep4') },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            )}

            {results && results.length === 0 && (
              <div className="info-card" style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>{t('noRecords')}</h4>
                <p style={{ color: 'var(--text-secondary)' }}>{t('noComplaintsFound')}</p>
              </div>
            )}

            {results && results.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, color: '#fff' }}>
                  📋 {t('found')} {results.length} {t('records')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: 580, overflowY: 'auto' }}
                  className="hide-scrollbar">
                  {results.map((result, i) => {
                    const status = statusConfig[result.status] || statusConfig.pending;
                    const dept = result.department || result.dept;
                    return (
                      <div key={i} className="info-card" style={{ borderColor: `${status.color}40`, background: `linear-gradient(135deg, ${status.bg}, rgba(15,32,64,0.95))` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                              {deptIcons[dept] || '📋'} {result.complaintId || result.requestId}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: 4 }}>
                              {t(dept)} • {result.recordType === 'complaint' ? `📋 ${t('complaint')}` : `🔧 ${t('srqLabel')}`}
                            </div>
                          </div>
                          <span style={{ background: status.bg, color: status.color, padding: '6px 14px', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, border: `1px solid ${status.color}40`, whiteSpace: 'nowrap' }}>
                            {status.label}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                          {result.description || result.serviceType}
                        </p>

                        {/* Timeline */}
                        {result.timeline && result.timeline.length > 0 && (
                          <div className="status-timeline" style={{ paddingLeft: 36 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                              {t('statusTimeline')}
                            </div>
                            {result.timeline.map((tl, j) => (
                              <div key={j} className="timeline-item" style={{ paddingLeft: 16 }}>
                                <div className={`timeline-dot ${j === result.timeline.length - 1 ? 'active' : ''}`} style={{ left: -28, top: 16 }} />
                                <div className="timeline-time">{new Date(tl.timestamp).toLocaleString('en-IN')}</div>
                                <div className="timeline-message">{tl.message}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>
                          Submitted: {new Date(result.createdAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <KioskFooter onBack={onBack} onHome={onHome} />
    </div>
  );
};

export default TrackStatusScreen;
