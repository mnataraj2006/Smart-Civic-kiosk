import React, { useState } from 'react';
import KioskHeader from '../components/KioskHeader';
import { useKiosk } from '../context/KioskContext';

const AdminDashboard = ({ onLogout }) => {
  const { loading } = useKiosk();
  const [activeTab, setActiveTab] = useState('complaints'); // complaints | services | transactions
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title="Admin Dashboard" subtitle="Government Officer Portal" showUser={true} />

      <div className="content-area no-scroll" style={{ padding: '2rem 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--white)' }}>
            Officer Portal
          </h2>
          <button
            className="btn btn-outline"
            style={{ fontSize: '1rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
            onClick={onLogout}
          >
            🛡️ Exit Admin Mode
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password-input" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-soft)' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="kiosk-input"
              style={{ paddingRight: '3.5rem' }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-ghost"
              style={{ position: 'absolute', right: '0.25rem', top: '0.25rem', bottom: '0.25rem', width: '3rem' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexShrink: 0 }}>
          {['complaints', 'services', 'transactions'].map(tab => (
            <button key={tab} className="btn"
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, textTransform: 'capitalize',
                background: activeTab === tab ? 'var(--blue-light)' : 'rgba(255,255,255,0.05)',
                border: activeTab === tab ? '2px solid var(--blue)' : '2px solid rgba(255,255,255,0.1)',
                color: activeTab === tab ? 'var(--white)' : 'var(--text-soft)',
              }}
            >
              {tab === 'complaints' ? '📋 Complaints' : tab === 'services' ? '🔧 Services' : '💳 Transactions'}
            </button>
          ))}
        </div>

        {/* Content Table */}
        <div className="info-card flex-1" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
             <div style={{ margin: 'auto', color: 'var(--text-muted)' }}><span className="spinner" style={{display:'inline-block'}}></span> Loading {activeTab}...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--white)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--card-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>ID / Reference</th>
                  <th style={{ padding: '1rem' }}>Department & Details</th>
                  <th style={{ padding: '1rem' }}>Citizen ID</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Mock data for now */}
                {activeTab === 'complaints' && [
                  { id: 'CMP-2819034', dept: 'Electricity', detail: 'Power outage', user: '9876543210', date: new Date().toLocaleDateString(), status: 'Pending' },
                  { id: 'CMP-3921845', dept: 'Water', detail: 'Leakage', user: '9123456780', date: new Date().toLocaleDateString(), status: 'In Progress' }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{row.id}</td>
                    <td style={{ padding: '1rem' }}>{row.dept} <br/><span style={{ fontSize:'0.85rem', color:'var(--text-soft)' }}>{row.detail}</span></td>
                    <td style={{ padding: '1rem' }}>{row.user}</td>
                    <td style={{ padding: '1rem' }}>{row.date}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${row.status === 'Pending' ? 'warning' : 'info'}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
                {activeTab === 'services' && [
                   { id: 'SRQ-9481923', dept: 'Gas', detail: 'New Connection', user: '9876543210', date: new Date().toLocaleDateString(), status: 'Pending' }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{row.id}</td>
                    <td style={{ padding: '1rem' }}>{row.dept} <br/><span style={{ fontSize:'0.85rem', color:'var(--text-soft)' }}>{row.detail}</span></td>
                    <td style={{ padding: '1rem' }}>{row.user}</td>
                    <td style={{ padding: '1rem' }}>{row.date}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-warning`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
                {activeTab === 'transactions' && [
                  { id: 'TXN-ABC123456', dept: 'Payment', detail: 'UPI (Water)', user: 'WB987654321', date: new Date().toLocaleDateString(), status: 'Success' }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{row.id}</td>
                    <td style={{ padding: '1rem' }}>{row.dept} <br/><span style={{ fontSize:'0.85rem', color:'var(--text-soft)' }}>{row.detail}</span></td>
                    <td style={{ padding: '1rem' }}>{row.user}</td>
                    <td style={{ padding: '1rem' }}>{row.date}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-success`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
