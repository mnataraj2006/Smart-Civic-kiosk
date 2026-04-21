import React, { useState, useCallback } from 'react';
import { KioskProvider, useKiosk } from './context/KioskContext';
import SessionTimer from './components/SessionTimer';
import AudioGuide from './components/AudioGuide';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import ServiceScreen from './screens/ServiceScreen';
import BillPaymentScreen from './screens/BillPaymentScreen';
import ComplaintScreen from './screens/ComplaintScreen';
import SuccessScreen from './screens/SuccessScreen';
import ServiceRequestScreen from './screens/ServiceRequestScreen';
import HelpScreen from './screens/HelpScreen';
import AdminDashboard from './screens/AdminDashboard';
import TransportScreen from './screens/TransportScreen';
import HealthScreen from './screens/HealthScreen';
import OfflineBanner from './components/OfflineBanner';

const SCREEN = {
  WELCOME:         'welcome',
  AUTH:            'auth',
  DASHBOARD:       'dashboard',
  SERVICE:         'service',
  BILL_PAYMENT:    'bill_payment',
  COMPLAINT:       'complaint',
  SUCCESS:         'success',
  SERVICE_REQUEST: 'service_request',
  HELP:            'help',
  ADMIN:           'admin',
  TRANSPORT:       'transport',
  HEALTH:          'health',
};

const KioskApp = () => {
  const [screen, setScreen] = useState(SCREEN.WELCOME);
  const [currentDept, setCurrentDept] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [successType, setSuccessType] = useState(null);
  const [complaintInitData, setComplaintInitData] = useState({});
  const [serviceRequestData, setServiceRequestData] = useState({});
  const [sessionResetKey, setSessionResetKey] = useState(0);
  const { logout, sessionActive, loadingMessage } = useKiosk();

  // Hidden admin access: 5 fast taps on top-left corner
  const [, setAdminTaps] = useState(0);
  const handleAdminTap = useCallback(() => {
    setAdminTaps(prev => {
      if (prev + 1 >= 5) { setScreen(SCREEN.ADMIN); return 0; }
      return prev + 1;
    });
    setTimeout(() => setAdminTaps(0), 2000);
  }, []);

  const goHome = useCallback(() => {
    setScreen(SCREEN.WELCOME);
    logout();
  }, [logout]);

  const goDashboard = useCallback(() => {
    setScreen(SCREEN.DASHBOARD);
    setSessionResetKey(k => k + 1);
  }, []);

  const handleSessionTimeout = useCallback(() => {
    logout();
    setScreen(SCREEN.WELCOME);
  }, [logout]);

  const handleServiceSelect = useCallback((serviceId) => {
    if (serviceId === 'complaint') {
      setComplaintInitData({});
      setScreen(SCREEN.COMPLAINT);
    } else if (serviceId === 'transport') {
      setScreen(SCREEN.TRANSPORT);
    } else if (serviceId === 'health') {
      setScreen(SCREEN.HEALTH);
    } else {
      setCurrentDept(serviceId);
      setScreen(SCREEN.SERVICE);
    }
    setSessionResetKey(k => k + 1);
  }, []);

  const handleServiceOption = useCallback((option) => {
    if (option.action === 'bill') {
      setCurrentDept(option.dept);
      setScreen(SCREEN.BILL_PAYMENT);
    } else if (option.action === 'complaint') {
      setComplaintInitData({ department: option.dept, subCategory: option.subCat });
      setScreen(SCREEN.COMPLAINT);
    } else if (option.action === 'service') {
      setServiceRequestData({ department: option.dept, serviceType: option.serviceType });
      setScreen(SCREEN.SERVICE_REQUEST);
    } else if (option.action === 'download') {
      setSuccessType('service');
      setSuccessData({
        requestId: 'DL' + Date.now().toString().slice(-8),
        serviceType: 'Bill Download',
        department: option.dept,
        description: 'Your bill has been queued for printing.',
      });
      setScreen(SCREEN.SUCCESS);
    }
    setSessionResetKey(k => k + 1);
  }, []);

  const handlePaymentSuccess = useCallback((data) => {
    setSuccessType('payment');
    setSuccessData(data);
    setScreen(SCREEN.SUCCESS);
    setSessionResetKey(k => k + 1);
  }, []);

  const handleComplaintSuccess = useCallback((data) => {
    setSuccessType('complaint');
    setSuccessData(data);
    setScreen(SCREEN.SUCCESS);
    setSessionResetKey(k => k + 1);
  }, []);

  const handleServiceRequestSuccess = useCallback((data) => {
    setSuccessType('service');
    setSuccessData(data);
    setScreen(SCREEN.SUCCESS);
    setSessionResetKey(k => k + 1);
  }, []);

  const handleAuthVerified = useCallback(() => {
    setScreen(SCREEN.DASHBOARD);
    setSessionResetKey(k => k + 1);
  }, []);

  return (
    <div className="kiosk-app">
      {/* Hidden admin trigger area */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100px', zIndex: 9999 }} onClick={handleAdminTap} />

      {/* Loading overlay */}
      {loadingMessage && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="spinner" style={{ width: '4rem', height: '4rem', borderWidth: 4, marginBottom: '2rem' }}></div>
          <div style={{ fontSize: '1.8rem', color: 'var(--white)', fontWeight: 700, letterSpacing: '0.05em', animation: 'pulse 1.5s infinite' }}>{loadingMessage}</div>
        </div>
      )}

      {/* Offline Status Banner */}
      <OfflineBanner />

      {sessionActive && (
        <SessionTimer
          screen={screen}
          onTimeout={handleSessionTimeout}
        />
      )}

      <AudioGuide screen={screen} currentDept={currentDept} sessionResetKey={sessionResetKey} />

      {screen === SCREEN.WELCOME && (
        <WelcomeScreen onStart={() => setScreen(SCREEN.AUTH)} onHelp={() => setScreen(SCREEN.HELP)} />
      )}
      {screen === SCREEN.AUTH && (
        <AuthScreen onVerified={handleAuthVerified} onBack={() => setScreen(SCREEN.WELCOME)} />
      )}
      {screen === SCREEN.DASHBOARD && (
        <DashboardScreen onSelectService={handleServiceSelect} onHome={goHome} onLogout={goHome} />
      )}
      {screen === SCREEN.SERVICE && (
        <ServiceScreen
          department={currentDept}
          onSelectOption={handleServiceOption}
          onBack={() => setScreen(SCREEN.DASHBOARD)}
          onHome={goHome}
        />
      )}
      {screen === SCREEN.BILL_PAYMENT && (
        <BillPaymentScreen
          department={currentDept}
          onSuccess={handlePaymentSuccess}
          onBack={() => setScreen(SCREEN.SERVICE)}
          onHome={goHome}
        />
      )}
      {screen === SCREEN.COMPLAINT && (
        <ComplaintScreen
          initialDept={complaintInitData.department}
          initialSubCat={complaintInitData.subCategory}
          onSuccess={handleComplaintSuccess}
          onBack={() => setScreen(SCREEN.DASHBOARD)}
          onHome={goHome}
        />
      )}
      {screen === SCREEN.SERVICE_REQUEST && (
        <ServiceRequestScreen
          department={serviceRequestData.department}
          serviceType={serviceRequestData.serviceType}
          onSuccess={handleServiceRequestSuccess}
          onBack={() => setScreen(SCREEN.SERVICE)}
          onHome={goHome}
        />
      )}
      {screen === SCREEN.TRANSPORT && (
        <TransportScreen
          onBack={() => setScreen(SCREEN.DASHBOARD)}
          onHome={goHome}
          onSuccess={handleServiceRequestSuccess}
        />
      )}
      {screen === SCREEN.HEALTH && (
        <HealthScreen
          onBack={() => setScreen(SCREEN.DASHBOARD)}
          onHome={goHome}
        />
      )}
      {screen === SCREEN.SUCCESS && (
        <SuccessScreen type={successType} data={successData} onHome={goDashboard} />
      )}
      {screen === SCREEN.HELP && (
        <HelpScreen onBack={() => setScreen(SCREEN.WELCOME)} />
      )}
      {screen === SCREEN.ADMIN && (
        <AdminDashboard onLogout={goHome} />
      )}
    </div>
  );
};

const App = () => (
  <KioskProvider>
    <KioskApp />
  </KioskProvider>
);

export default App;
