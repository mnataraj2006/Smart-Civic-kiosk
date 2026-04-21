import React from 'react';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { useKiosk } from '../context/KioskContext';

const deptConfig = {
  electricity: {
    title: 'electricityServices', icon: '⚡', color: 'var(--elec)', dept: 'tangedco',
    options: [
      { id: 'pay-bill',        icon: '💰', label: 'payElecBill',    desc: 'payElecBillDesc',  action: 'bill',      dept: 'electricity' },
      { id: 'download-bill',   icon: '📄', label: 'downloadBill',           desc: 'downloadBillDesc',action: 'download',  dept: 'electricity' },
      { id: 'new-connection',  icon: '🔌', label: 'newConnReq',  desc: 'newConnReqDesc', action: 'service', dept: 'electricity', serviceType: 'New Connection' },
      { id: 'meter-complaint', icon: '📊', label: 'meterComp',         desc: 'meterCompDesc',              action: 'complaint', dept: 'electricity', subCat: 'Meter Complaint' },
    ]
  },
  gas: {
    title: 'gasServices', icon: '🔥', color: 'var(--gas)', dept: 'gasAuthority',
    options: [
      { id: 'lpg-payment',      icon: '💰', label: 'lpgPay',       desc: 'lpgPayDesc',          action: 'bill',      dept: 'gas' },
      { id: 'gas-refill',       icon: '🧴', label: 'gasRefillBook',     desc: 'gasRefillBookDesc',             action: 'service',   dept: 'gas', serviceType: 'Gas Refill Booking' },
      { id: 'new-gas-conn',     icon: '🔗', label: 'newGasConn',     desc: 'newGasConnDesc',      action: 'service',   dept: 'gas', serviceType: 'New Gas Connection' },
      { id: 'gas-complaint',    icon: '⚠️', label: 'gasLeakageSafety',         desc: 'gasCompDesc',       action: 'complaint', dept: 'gas', subCat: 'Gas Leakage/Safety' },
    ]
  },
  water: {
    title: 'waterDept', icon: '💧', color: 'var(--water)', dept: 'cmwssb',
    options: [
      { id: 'pay-water-bill',    icon: '💰', label: 'payWaterBill',        desc: 'payWaterBillDesc',            action: 'bill',      dept: 'water' },
      { id: 'new-water-conn',    icon: '🚰', label: 'newWaterConn',  desc: 'newWaterConnDesc',        action: 'service',   dept: 'water', serviceType: 'New Water Connection' },
      { id: 'leakage-complaint', icon: '💦', label: 'waterLeakage',desc: 'waterLeakageDesc',  action: 'complaint', dept: 'water', subCat: 'Water Leakage' },
      { id: 'pressure-complaint',icon: '📉', label: 'lowPressure', desc: 'lowPressureDesc',        action: 'complaint', dept: 'water', subCat: 'Low Water Pressure' },
    ]
  },
  municipal: {
    title: 'municipalServices', icon: '🏙️', color: 'var(--muni)', dept: 'municipalServices',
    options: [
      { id: 'garbage-complaint',    icon: '🗑️', label: 'garbageSanitation',        desc: 'garbageCompDesc',         action: 'complaint', dept: 'municipal', subCat: 'Garbage/Sanitation' },
      { id: 'streetlight-complaint',icon: '💡', label: 'streetlight',    desc: 'streetlightCompDesc',         action: 'complaint', dept: 'municipal', subCat: 'Streetlight' },
      { id: 'property-tax',         icon: '🏠', label: 'propTaxPay',     desc: 'propTaxPayDesc',       action: 'bill',      dept: 'municipal' },
      { id: 'public-grievance',     icon: '📢', label: 'publicGrievance',        desc: 'publicGrievanceDesc',  action: 'complaint', dept: 'municipal', subCat: 'Public Grievance' },
    ]
  }
};

const ServiceScreen = ({ department, onSelectOption, onBack, onHome }) => {
  const { speak, t } = useKiosk();
  const config = deptConfig[department];
  if (!config) return null;

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <div className="bg-gradient" /><div className="bg-grid" />
      <KioskHeader title={`${config.icon} ${t(config.title)}`} subtitle={t(config.dept)} showUser={true} />

      <div className="content-area no-scroll" style={{ padding: '1.25rem 2.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem',
          color: 'var(--text-muted)', fontSize: '0.9rem', flexShrink: 0 }}>
          <span>🏠 {t('home')}</span><span>›</span>
          <span style={{ color: config.color, fontWeight: 600 }}>{config.icon} {t(config.title)}</span>
        </div>
        <div style={{ marginBottom: '0.75rem', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: config.color, marginBottom: '0.2rem' }}>
            {t('selectService')}
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            {t(config.dept)} · {t('touchOption')}
          </p>
        </div>

        {/* 2×2 Option grid filling remaining space */}
        <div className="sub-option-grid anim-up" style={{ flex: 1, minHeight: 0 }}>
          {config.options.map((opt) => (
            <button
              key={opt.id}
              id={`svc-${opt.id}`}
              className="sub-option-tile"
              onClick={() => { speak(t(opt.label)); onSelectOption(opt); }}
              style={{ '--hover-color': config.color }}
            >
              <span className="sub-option-icon">{opt.icon}</span>
              <div className="sub-option-text">
                <h3>{t(opt.label)}</h3>
                <p>{t(opt.desc)}</p>
              </div>
              <span className="sub-option-arrow">›</span>
            </button>
          ))}
        </div>
      </div>

      <KioskFooter onBack={onBack} onHome={onHome} onCancel={onHome} />
    </div>
  );
};

export default ServiceScreen;
