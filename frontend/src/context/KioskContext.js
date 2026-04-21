/* eslint-disable no-dupe-keys */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useOfflineSync } from '../utils/useOfflineSync';
import { authAPI, billsAPI, complaintsAPI, servicesAPI, paymentsAPI } from '../utils/api';

const KioskContext = createContext();
// API_BASE is now handled by the centralized api.js service

export const KioskProvider = ({ children }) => {
  /* -------- Core session state -------- */
  const [currentUser, setCurrentUser]       = useState(null);
  const [language, setLanguage]             = useState('en');
  const [audioEnabled, setAudioEnabled]     = useState(true);
  const [sessionActive, setSessionActive]   = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [loading, setLoading]               = useState(false);
  const [loadingMessage, setLoadingMsg]     = useState(''); // for overlay
  const [error, setError]                   = useState(null);

  const [accessMode, setAccessMode] = useState(false); // large font + contrast
  useEffect(() => {
    if (accessMode) document.body.setAttribute('data-access-mode', 'true');
    else document.body.removeAttribute('data-access-mode');
  }, [accessMode]);

  /* -------- Network status, Queue & Sync -------- */
  const {
    isOnline, syncing, pendingCount, syncProgress, syncLogs,
    enqueue, syncNow, clearFailed, refreshLogs,
  } = useOfflineSync();

  /* -------- Translations -------- */
  const translations = {
    en: {
      welcome: 'Welcome to Smart Civic Service Kiosk',
      selectLanguage: 'Select Language', startService: 'Start Service',
      enterMobile: 'Enter Mobile Number', sendOtp: 'Send OTP',
      enterOtp: 'Enter OTP', verify: 'Verify & Login',
      services: 'Our Services', electricity: 'Electricity Services',
      water: 'Water Services', gas: 'Gas Services',
      municipal: 'Municipal Services', complaint: 'Register Complaint',
      track: 'Track Status', payBill: 'Pay Bill', downloadBill: 'Download Bill',
      newConnection: 'New Connection', meterComplaint: 'Meter Complaint',
      back: 'Back', home: 'Home', confirm: 'Confirm', cancel: 'Cancel',
      help: 'Help', accessMode: 'Accessibility Mode',
      
      // Welcome Screen Additions
      allGovtServices: 'All Government Services in One Place',
      allGovtServicesTag: 'அனைத்து அரசு சேவைகளும் ஒரே இடத்தில் | सभी सरकारी सेवाएँ एक ही स्थान पर',
      touchToBegin: 'Touch the button above to begin | மேலே தொடவும் | ऊपर टच करें',
      marquee1: '🔵 Citizens can now pay utility bills, register complaints, and track requests at this kiosk.',
      marquee2: '🟡 OTP will be sent to your registered mobile number for identity verification.',
      marquee3: '🟢 For technical assistance, contact the kiosk operator.',
      marquee4: '🔴 This kiosk closes after 90 seconds of inactivity.',
      marquee5: '📞 Helpdesk: 1800-XXX-XXXX (Toll Free, 24×7)',
      otpSent: 'OTP sent',
      invalidOtp: 'Invalid OTP. Please try again.',
      enter10digitErr: 'Enter a valid 10-digit mobile number',
      enter6digitErr: 'Enter the complete 6-digit OTP',
      welcomeCitizenSpeak: 'Welcome',
      citizen: 'Citizen',
      
      enterConsumerNumErr: 'Enter a valid consumer number',
      billFetchedSpeak: 'Bill details fetched. Please review your bill.',
      billNotFound: 'Bill not found',
      paymentSuccessSpeak: 'Payment successful! Your receipt has been generated.',
      paymentFailed: 'Payment failed. Try again.',
      billPaymentTitle: 'Bill Payment',
      consumerNumber: 'Consumer Number',
      billMonth: 'Bill Month',
      unitsConsumed: 'Units Consumed',
      unitsLabel: 'units',
      dueDate: 'Due Date',
      dueBy: 'Due by',
      avoidPenalties: 'Pay now to avoid penalties.',
      use: 'Use',
      demo: 'Demo',
      upiPayDesc: 'Pay via UPI / QR Code (GPay, PhonePe, Paytm)',
      cashPay: 'Cash Payment',
      cashPayDesc: 'Pay cash at the kiosk counter',
      confirmPay: 'PayNow',
      payMethodSubtitle: 'Choose UPI for instant payment or Cash at the counter',
      upiModalTitle: 'Scan & Pay via UPI',
      upiModalDesc: 'Scan the QR code with any UPI app (GPay, PhonePe, Paytm, BHIM)',
      upiScanInstructions: 'Open any UPI app → Scan QR → Enter amount → Pay. Then tap the button below.',
      upiPaidConfirm: 'I Have Paid',
      cashPendingTitle: 'Cash Payment Pending',
      cashPendingDesc: 'Please hand over cash to the kiosk operator. Your payment is being confirmed.',
      cashPendingSpeak: 'Please hand over the cash amount to the operator at the counter.',
      cashHandNote: 'Please approach the counter and hand cash to the operator. Receipt will be generated automatically.',
      
      fillReqFields: 'Please fill in all required fields.',
      compRegSpeak: 'Complaint registered successfully. Your complaint ID is',
      compFail: 'Submission failed. Try again.',
      selectDeptFirst: 'Select a department first',
      describeIssuePlaceholder: 'Describe your issue in detail...',
      quickFillTitle: 'Quick Fill Suggestions',
      attachImage: 'Attach Image',
      tapCapture: 'Tap to capture or upload an image',
      maxFileSize: 'Max 5MB · JPG, PNG',
      whatNext: 'What happens next?',
      compFollowUp: 'Your complaint will be registered and assigned a unique ID. You will receive SMS updates. Expected resolution: 48–72 working hours.',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      powerOutage: 'Power Outage',
      billingError: 'Billing Error',
      noSupply: 'No Supply',
      cylinderIssue: 'Cylinder Issue',
      waterQuality: 'Water Quality',
      roadDamage: 'Road Damage',
      drainage: 'Drainage',
      serviceDelay: 'Service Delay',
      staffBehaviour: 'Staff Behaviour',
      qf1: 'Power outage since morning in our street',
      qf2: 'Water meter showing incorrect reading',
      qf3: 'Streetlight not working for past 3 days',
      qf4: 'No water supply for 2 days',
      
      enterSearchVal: 'Please enter a value to search',
      foundRecordsSpeak: 'Found recorded results. Please scroll to view.',
      noRecordsFound: 'No records found. Please check and try again.',
      typeInstead: 'Type Instead',
      useMyMobile: 'Use My Mobile',
      howToTrack: 'How to track?',
      trackStep1: 'Use the Complaint ID received after registration (starts with CMP or SRQ)',
      trackStep2: 'Or use your registered mobile number to see all requests',
      trackStep3: 'Real-time status updates from respective departments',
      trackStep4: 'View complete timeline of your request',
      noComplaintsFound: 'No complaints or requests found for the given value.',
      statusTimeline: 'Status Timeline:',
      found: 'Found',
      records: 'Records',
      srqLabel: 'Service Request',
      compIdLabel: 'Complaint ID',
      mobNumLabel: 'Mobile Number',
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      submitted: 'Submitted',
      underReview: 'Under Review',
      completed: 'Completed',
      closed: 'Closed',
      
      provideDescErr: 'Please provide a description',
      submittingReqSpeak: 'Submitting service request. Please wait.',
      reqSubmitSuccessSpeak: 'Service request submitted successfully. Your request ID is',
      reqSubmitFail: 'Failed to submit request. Please try again.',
      enterAddrPlaceholder: 'Enter the address where service is required...',
      addInfoPlaceholder: 'Any additional information about your request...',
      docsReadyMsg: 'Please keep these documents ready for physical verification:',
      processingTime: 'Processing Time',
      physInsp: 'Physical Inspection',
      appFee: 'Application Fee',
      asPerNorms: 'As per norms',
      required: 'Required',
      smsUpdateLabel: 'SMS Notifications',
      aadhaarCard: 'Aadhaar Card',
      addrProof: 'Address Proof',
      propertyDocs: 'Property Documents',
      passportPhoto: 'Passport Photo',
      lpgId: 'LPG Consumer ID',
      nocOwner: 'NOC from Building Owner',
      taxReceipt: 'Property Tax Receipt',
      buildingPlan: 'Building Plan / NOC',
      fiveToSevenDays: '5-7 Working Days',
      
      // Dashboard Additions
      serviceDashboard: 'Service Dashboard',
      welcomeMsg: 'Welcome',
      selectServiceBelow: 'Select a service below to get started',
      logoutText: 'Logout',
      elecSub: 'Bills, Connection, Complaints',
      gasSub: 'LPG, Refill, New Connection',
      waterSub: 'Bills, Connection, Complaints',
      muniSub: 'Tax, Waste, Streetlights',
      compSub: 'File a new grievance',
      trackSub: 'Check complaint & request status',
      transport: 'Transport Department',
      transportSub: 'RTO · License · Vehicle · Fines',
      health: 'Public Health Department',
      healthSub: 'Hospitals · Vaccines · Schemes',

      // General Buttons & Texts
      selectService: 'Select a Service',
      touchOption: 'Touch an option to proceed',
      needHelp: 'Need Help? Follow These Steps',
      quickGuide: 'Our quick guide will help you navigate the system easily.',
      helpStep1Title: '1. Select Your Language',
      helpStep1Desc: 'Use the language buttons at the top of the screen to choose English, Tamil, or Hindi at any time.',
      helpStep2Title: '2. Login with Mobile Number',
      helpStep2Desc: 'Enter your 10-digit mobile number and verify it using the 6-digit OTP sent via SMS to keep your data secure.',
      helpStep3Title: '3. Choose a Service',
      helpStep3Desc: 'Select a department like Electricity, Water, Gas, or Municipal to see available services.',
      helpStep4Title: '4. Enter Details & Confirm',
      helpStep4Desc: 'Follow the on-screen instructions to enter your consumer number, complaint details, or service request info.',
      helpStep5Title: '5. Make Payments securely',
      helpStep5Desc: 'Pay your utility bills safely using UPI, Debit Card, or Net Banking.',
      helpStep6Title: '6. Print Receipt',
      helpStep6Desc: 'Once done, collect your printed receipt. The system will auto-logout for your privacy.',
      helpPageSpeak: 'Welcome to the help screen. Follow these simple steps to use the kiosk.',
      helpTitle: 'User Guide & Help',
      helpSubtitle: 'How to use the Smart Civic Kiosk',
      
      // Header/Footer
      kioskTitle: 'Smart Civic Service Kiosk',
      cdacFull: 'CENTRE FOR DEVELOPMENT OF ADVANCED COMPUTING',

      // Auth additions
      mobileDesc: 'An OTP will be sent to verify your identity',
      enter10digit: 'Enter 10-digit number',
      otpSentTo: 'OTP sent to +91 ',
      changeMobile: '← Change Mobile Number',
      resendOtp: 'Resend OTP',
      secureVerify: 'Secure Verification',
      authStep1: 'Enter your registered mobile number',
      authStep2: 'Receive a 6-digit OTP via SMS',
      authStep3: 'Enter OTP to securely verify identity',
      authStep4: 'Access all civic services instantly',
      securityNotice: 'Security Notice',
      secItem1: 'Never share your OTP with anyone',
      secItem2: 'OTP is valid for 5 minutes only',
      secItem3: 'Government officials never ask for OTP',
      secItem4: 'Your data is protected by encryption',
      
      // Bill Payment
      stepConsumerId: 'Consumer ID', stepViewBill: 'View Bill', stepPayment: 'Payment', stepDone: 'Done',
      enterConsumerNum: 'Enter Consumer Number',
      consumerNumSub: 'Your consumer number is printed on your bill',
      fetchBillBtn: 'Fetch Bill', quickFill: 'Quick Fill', whereToFind: 'Where to find?',
      whereToFindDesc: 'Your consumer number is printed on the top portion of your utility bill or on your connection certificate.',
      billDetails: 'Bill Details', totalAmount: 'Total Amount',
      selectPayMethod: 'Select Payment Method', upiPay: 'UPI Payment', netBankPay: 'Net Banking',

      // Complaint
      regComplaint: 'Register Complaint', compType: 'Complaint Type', compDesc: 'Description',
      compSubLabel: 'Please provide details about your issue',
      submitBtn: 'Submit Complaint',
      fileNewComp: 'File a New Complaint', category: 'Category',
      
      // Track Status
      trackSearchLabel: 'Track Status',
      trackSearchDesc: 'Enter your Complaint ID or Registered Mobile Number',
      enterComplId: 'Enter Complaint / Request ID', enterMobNum: 'Enter Mobile Number',
      searchStatusBtn: 'Search Status', noRecords: 'No Records Found',
      // Service Request
      applicantName: 'Applicant Name', mobileNum: 'Mobile Number', installAddr: 'Installation Address',
      addDetails: 'Additional Details', docsReq: 'Documents Required', procInfo: 'Process Information',
      submitReq: 'Submit Request',
      
      // Additional Translations
      citizenAuth: 'Citizen Authentication', secureOtpLogin: 'Secure OTP Login', accessServices: 'Access Services',
      otpSentSpeak: 'OTP sent. Please enter the 6-digit OTP.', welcomeCitizen: 'Welcome, Citizen!',
      india: 'India', demoOtpLabel: 'Demo OTP:', resendIn: 'Resend in',
      
      electricityServices: 'Electricity Services', gasServices: 'Gas Services', waterDept: 'Water Department', municipalServices: 'Municipal Services',
      tangedco: 'TANGEDCO', gasAuthority: 'Gas Authority', cmwssb: 'CMWSSB', gcc: 'Greater Chennai Corporation',
      
      payElecBill: 'Pay Electricity Bill', payElecBillDesc: 'Pay your pending electricity bill',
      downloadBillDesc: 'Download or print your current bill', newConnReq: 'New Connection Request',
      newConnReqDesc: 'Apply for a new electricity connection', meterComp: 'Meter Complaint',
      meterCompDesc: 'Report a faulty meter', lpgPay: 'LPG Bill Payment', lpgPayDesc: 'Pay your LPG cylinder bill',
      gasRefillBook: 'Gas Refill Booking', gasRefillBookDesc: 'Book a new LPG cylinder',
      newGasConn: 'New Gas Connection', newGasConnDesc: 'Apply for a new gas connection',
      gasLeakageSafety: 'Gas Leakage/Safety', gasCompDesc: 'Report a gas-related complaint',
      payWaterBill: 'Pay Water Bill', payWaterBillDesc: 'Pay your pending water bill',
      newWaterConn: 'New Water Connection', newWaterConnDesc: 'Apply for a new water connection',
      waterLeakage: 'Water Leakage', waterLeakageDesc: 'Report a pipe leakage near your area',
      lowPressure: 'Low Pressure', lowPressureDesc: 'Report low water pressure issue',
      garbageSanitation: 'Garbage/Sanitation', garbageCompDesc: 'Report uncollected garbage',
      streetlight: 'Streetlight', streetlightCompDesc: 'Report broken streetlights',
      propTaxPay: 'Property Tax Payment', propTaxPayDesc: 'Pay your property tax online',
      publicGrievance: 'Public Grievance', publicGrievanceDesc: 'Submit a general public grievance',
      
      billingError: 'Billing Error', noSupply: 'No Supply', cylinderIssue: 'Cylinder Issue',
      waterQuality: 'Water Quality', garbageIssue: 'Garbage Issue', roadDamage: 'Road Damage', drainage: 'Drainage',
      serviceDelay: 'Service Delay', staffBehaviour: 'Staff Behaviour', other: 'Other',
      high: 'High', medium: 'Medium', low: 'Low',
      fillRequired: 'Please fill in all required fields.', compRegSpeak: 'Complaint registered. ID:',
      compDescPlaceholder: 'Describe your issue in detail...', quickFillSuggestions: 'Quick Fill Suggestions',
      attachImage: 'Attach Image', tapCapture: 'Tap to capture or upload an image', maxFile: 'Max 5MB · JPG, PNG',
      whatNext: 'What happens next?', compResolutionDesc: 'Your complaint will be registered and assigned a unique ID. You will receive SMS updates. Expected resolution: 48–72 working hours.',
      
      idExample: 'e.g. CMP12345678', mobExample: 'e.g. 9876543210', cmpSrqNum: 'CMP or SRQ number', mobNum10: '10-digit mobile number',
      useMyMob: 'Use My Mobile:', found: 'Found', record: 'record', records: 'records',
      noRecordsFound: 'No records found. Please check the ID or mobile number and try again.',
      timeline: 'Timeline', statusTimeline: 'Status Timeline:', submitted: 'Submitted:',
      
      elecBillPay: 'Electricity Bill Payment', gasBillPay: 'Gas / LPG Bill Payment', waterBillPay: 'Water Bill Payment', muniBillPay: 'Municipal Bill Payment',
      utility: 'Utility', enterValidConsumer: 'Enter a valid consumer number', billFetchSpeak: 'Bill details fetched. Please review your bill.',
      billNotFound: 'Bill not found', paySuccessSpeak: 'Payment successful! Your receipt has been generated.', payFailed: 'Payment failed. Try again.',
      current: 'Current', na: 'N/A', billMonth: 'Bill Month', unitsConsumed: 'Units Consumed', dueDate: 'Due Date', dueBy: 'Due by',
      payNowAvoid: 'Pay now to avoid penalties.', upiDesc: 'Pay via UPI / QR Code (GPay, PhonePe, Paytm)', cashDesc: 'Pay cash at the kiosk counter',
      fetchBillBtnText: 'Fetch Bill →', payNowBtnText: 'Pay Now ✓',
      
      submittingReqSpeak: 'Submitting service request. Please wait.', reqSuccessSpeak: 'Service request submitted successfully. Your request ID is',
      aadhaar: 'Aadhaar Card', addrProof: 'Address Proof', propDocs: 'Property Documents', photo: 'Passport Photo', lpgId: 'LPG Consumer ID',
      nocOwner: 'NOC from Building Owner', propTaxReceipt: 'Property Tax Receipt', bldgPlan: 'Building Plan/NOC',
      provideDesc: 'Please provide a description', failSubmitTry: 'Failed to submit request. Please try again.',
      enterAddrPlaceholder: 'Enter the address where service is required...', addInfoPlaceholder: 'Any additional information about your request...',
      keepDocsReady: 'Please keep these documents ready for physical verification:',
      procTime: 'Processing Time', workingDays5: '5-7 Working Days', physInsp: 'Physical Inspection', required: 'Required',
      appFee: 'Application Fee', appFeeNorms: 'As per norms', smsNotif: 'SMS Notifications',
      
      paySuccess: 'Payment Successful!', billProcSuccess: 'Your bill payment has been processed.',
      receiptNo: 'Receipt No.', consumerNo: 'Consumer No.', amountPaid: 'Amount Paid', payMode: 'Payment Mode',
      dateTime: 'Date & Time', statusLabel: 'Status', confirmed: 'Confirmed',
      compRegTitle: 'Complaint Registered!', compSubSuccess: 'Your complaint has been submitted successfully.',
      dateFiled: 'Date Filed', expRes: 'Expected Resolution', trackingLabel: 'Tracking', smsInfo: 'SMS updates will be sent',
      reqSubTitle: 'Request Submitted!', reqRegSuccess: 'Your service request has been registered.',
      expTAT: 'Expected TAT', workingHours: 'Working Hours', printReceipt: 'Print Receipt', retDash: 'Return to Dashboard',
      autoReturn: 'Session will auto-return after inactivity', txnReceipt: 'Transaction Receipt', txnComplete: 'Transaction Complete',
      compGenReceipt: 'This is a computer-generated receipt. No signature required.',
      thankYou: 'Thank you for using Smart Civic Service Kiosk!',
      marquee1: '🔵 Citizens can now pay utility bills, register complaints, and track requests at this kiosk.',
      marquee2: '🟡 An OTP will be sent to your registered mobile number for identity verification.',
      marquee3: '🟢 For technical assistance, please contact the kiosk operator.',
      marquee4: '🔴 This kiosk will logout after 90 seconds of inactivity.',
      marquee5: '📞 Helpdesk: 1800-XXX-XXXX (Toll-Free, 24×7)',
      
      // Loading Messages
      sendingOtpMsg: 'Sending OTP to your mobile...',
      verifyingOtpMsg: 'Verifying OTP...',
      fetchingBillMsg: 'Fetching bill details...',
      searchingRecordsMsg: 'Searching records...',
      processingPaymentMsg: 'Processing payment...',
      submittingCompMsg: 'Submitting your complaint...',
      submittingReqMsg: 'Submitting service request...',
      
      langSetSpeak: 'Language set to',
      accessEnabledSpeak: 'Accessibility mode enabled. Font sizes and contrast increased.',
      accessDisabledSpeak: 'Accessibility mode disabled',
      openingHelpSpeak: 'Opening help guide',
      
      networkLost: 'Network connection lost. Offline Mode active — requests will be synced later.',
      sessionWarnSpeak: 'Warning: your session will expire soon due to inactivity. Touch the screen to continue.',
      sessionExpiring: 'Session Expiring Soon', sessionEndInactivity: 'Your session will end due to inactivity.',
      touchContinue: 'Touch anywhere or press Continue to stay logged in.', continueSession: 'Continue Session', endSession: 'End Session',
      privacyLogout: 'For your privacy, session data will be cleared on logout',
      cdacHindi: 'प्रगत संगणन विकास केंद्र',

      // ── Offline Mode ──
      offlineQueued: 'No internet connection. Your request has been saved and will be submitted automatically when the connection is restored.',
      upiOfflineError: 'UPI payment requires an internet connection. Please use Cash payment when offline.',
      offlineBannerTitle: 'Offline Mode',
      offlinePendingMsg: 'pending requests will sync when online',
      syncNowBtn: 'Sync Now',
      syncingMsg: 'Syncing offline requests…',
      syncSuccessMsg: 'All offline requests synced successfully!',
      syncFailedMsg: 'Some requests failed to sync. Will retry automatically.',
      clearFailedBtn: 'Clear Failed',
      offlineCashNote: 'Cash payment will be recorded offline and confirmed once you reconnect.',
      pendingLabel: 'Pending',
      syncLogsTitle: 'Sync Log',
      noSyncLogs: 'No sync activity yet.',
      unitsLabel: 'kWh',
      avoidPenalties: 'Pay now to avoid late payment penalties.',
      use: 'Use',
      demo: 'Demo',
      upiPay: 'UPI Payment',
      cashPay: 'Cash Payment',
      upiPayDesc: 'Pay via UPI / QR Code (GPay, PhonePe, Paytm)',
      cashPayDesc: 'Pay cash at the kiosk counter',
      confirmPay: 'Pay Now',
      payMethodSubtitle: 'Choose UPI for instant payment or Cash at the counter',
      upiModalTitle: 'Scan & Pay via UPI',
      upiModalDesc: 'Scan the QR code with any UPI app (GPay, PhonePe, Paytm, BHIM)',
      upiScanInstructions: 'Open any UPI app → Scan QR → Enter amount → Pay. Then tap the button below.',
      upiPaidConfirm: 'I Have Paid',
      cashPendingTitle: 'Cash Payment Pending',
      cashPendingDesc: 'Please hand over cash to the kiosk operator. Your payment is being confirmed.',
      cashPendingSpeak: 'Please hand over the cash amount to the operator at the counter.',
      cashHandNote: 'Please approach the counter and hand cash to the operator. Receipt will be generated automatically.',
      billPaymentTitle: 'Bill Payment',
      enterConsumerNumErr: 'Please enter a consumer number.',
      billFetchedSpeak: 'Bill fetched. Please review and proceed to payment.',
      paymentSuccessSpeak: 'Payment successful! Your receipt has been generated.',
      paymentFailed: 'Payment failed. Please try again.',
      back: 'Back',
      citizen: 'Citizen',
      consumerNumber: 'Consumer Number',
      avoidPenalties: 'Pay now to avoid late fees.',
    },
    ta: {
      welcome: 'ஸ்மார்ட் சிவிக் சேவை கியோஸ்கிற்கு வரவேற்கிறோம்',
      selectLanguage: 'மொழியை தேர்ந்தெடுக்கவும்', startService: 'சேவையை தொடங்கு',
      enterMobile: 'மொபைல் எண் உள்ளிடவும்', sendOtp: 'OTP அனுப்பு',
      enterOtp: 'OTP உள்ளிடவும்', verify: 'சரிபார்',
      services: 'சேவைகள்', electricity: 'மின்சார சேவைகள்',
      water: 'நீர் சேவைகள்', gas: 'எரிவாயு சேவைகள்',
      municipal: 'நகராட்சி சேவைகள்', complaint: 'புகார் பதிவு',
      track: 'நிலை கண்காணிப்பு', payBill: 'பில் செலுத்து', downloadBill: 'பில் பதிவிறக்கம்',
      newConnection: 'புதிய இணைப்பு', meterComplaint: 'மீட்டர் புகார்',
      back: 'பின்செல்', home: 'முகப்பு', confirm: 'உறுதிப்படுத்து', cancel: 'ரத்து',
      help: 'உதவி', accessMode: 'அணுகல் முறை',

      allGovtServices: 'அனைத்து அரசு சேவைகளும் ஒரே இடத்தில்',
      allGovtServicesTag: 'All Government Services in One Place | सभी सरकारी सेवाएँ एक ही स्थान पर',
      touchToBegin: 'தொடங்க மேலே உள்ள பொத்தானைத் தொடவும்',
      marquee1: '🔵 குடிமக்கள் இப்போது இந்த கியோஸ்கில் பயன்பாட்டு பில்களை செலுத்தலாம், புகார்களைப் பதிவு செய்யலாம் மற்றும் கோரிக்கைகளைக் கண்காணிக்கலாம்.',
      marquee2: '🟡 அடையாள சரிபார்ப்பிற்காக உங்கள் பதிவு செய்யப்பட்ட மொபைல் எண்ணுக்கு OTP அனுப்பப்படும்.',
      marquee3: '🟢 தொழில்நுட்ப உதவிக்கு, கியோஸ்க் ஆபரேட்டரைத் தொடர்பு கொள்ளவும்.',
      marquee4: '🔴 90 வினாடிகள் செயலற்ற நிலைக்குப் பிறகு இந்த கியோஸ்க் மூடப்படும்.',
      marquee5: '📞 உதவி மையம்: 1800-XXX-XXXX (கட்டணமில்லா தொலைபேசி, 24×7)',
      otpSent: 'OTP அனுப்பப்பட்டது',
      invalidOtp: 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.',
      enter10digitErr: 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',
      enter6digitErr: 'முழுமையான 6 இலக்க OTP ஐ உள்ளிடவும்',
      welcomeCitizenSpeak: 'வருக',
      citizen: 'குடிமகன்',
      
      enterConsumerNumErr: 'சரியான நுகர்வோர் எண்ணை உள்ளிடவும்',
      billFetchedSpeak: 'பில் விவரங்கள் கிடைத்தன. உங்கள் பில்லை மதிப்பாய்வு செய்யவும்.',
      billNotFound: 'பில் கிடைக்கவில்லை',
      paymentSuccessSpeak: 'கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது! உங்கள் ரசீது உருவாக்கப்பட்டது.',
      paymentFailed: 'கட்டணம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
      billPaymentTitle: 'பில் கட்டணம்',
      consumerNumber: 'நுகர்வோர் எண்',
      billMonth: 'பில் மாதம்',
      unitsConsumed: 'பயன்படுத்தப்பட்ட அலகுகள்',
      unitsLabel: 'அலகுகள்',
      dueDate: 'கடைசி தேதி',
      dueBy: 'இதற்குள் செலுத்தவும்',
      avoidPenalties: 'அபராதத்தைத் தவிர்க்க இப்போது செலுத்துங்கள்.',
      use: 'பதிவு',
      demo: 'டெமோ',
      upiPayDesc: 'UPI / QR குறியீடு மூலம் பணம் செலுத்தவும் (GPay, PhonePe, Paytm)',
      cashPay: 'ரொக்கப் பணம்',
      cashPayDesc: 'கவுண்டரில் ரொக்கப் பணம் செலுத்துங்கள்',
      confirmPay: 'இப்போது செலுத்துங்கள்',
      payMethodSubtitle: 'UPI அல்லது ரொக்கப் பணம் தேர்வு செய்யவும்',
      upiModalTitle: 'QR ஸ்கேன் செய்து UPI மூலம் செலுத்துங்கள்',
      upiModalDesc: 'எந்த UPI செயலியாலும் QR குறியீட்டை ஸ்கேன் செய்யவும்',
      upiScanInstructions: 'UPI செயலி திறந்து → QR ஸ்கேன் → தொகை உள்ளிட்டு செலுத்துங்கள். பின்னர் கீழே உள்ள பொத்தானை அழுத்துங்கள்.',
      upiPaidConfirm: 'நான் செலுத்திவிட்டேன்',
      cashPendingTitle: 'ரொக்க கட்டணம் நிலுவையிலுள்ளது',
      cashPendingDesc: 'கவுண்டரில் ஆபரேட்டரிடம் பணம் கொடுக்கவும்.',
      cashPendingSpeak: 'தயவுசெய்து கவுண்டரில் உள்ள ஆபரேட்டரிடம் பணம் கொடுக்கவும்.',
      cashHandNote: 'கவுண்டரை அணுகி ஆபரேட்டரிடம் பணம் கொடுக்கவும். ரசீது தானாக உருவாக்கப்படும்.',
      
      fillReqFields: 'அனைத்து கட்டாய புலங்களையும் நிரப்பவும்.',
      compRegSpeak: 'புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது. உங்கள் புகார் ஐடி',
      compFail: 'சமர்ப்பிப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
      selectDeptFirst: 'முதலில் ஒரு துறையைத் தேர்ந்தெடுக்கவும்',
      describeIssuePlaceholder: 'உங்கள் சிக்கலை விவரமாக விவரிக்கவும்...',
      quickFillTitle: 'விரைவான பரிந்துரைகள்',
      attachImage: 'படத்தை இணைக்கவும்',
      tapCapture: 'படம் எடுக்க அல்லது பதிவேற்ற தட்டவும்',
      maxFileSize: 'அதிகபட்சம் 5MB · JPG, PNG',
      whatNext: 'அடுத்து என்ன நடக்கும்?',
      compFollowUp: 'உங்கள் புகார் பதிவு செய்யப்பட்டு தனித்துவமான ஐடி ஒதுக்கப்படும். நீங்கள் எஸ்எம்எஸ் அறிவிப்புகளைப் பெறுவீர்கள். எதிர்பார்க்கப்படும் தீர்வு: 48-72 வேலை மணிநேரம்.',
      high: 'அதிகம்',
      medium: 'நடுத்தரம்',
      low: 'குறைவு',
      powerOutage: 'மின் தடை',
      billingError: 'பில்லிங் பிழை',
      noSupply: 'விநியோகம் இல்லை',
      cylinderIssue: 'சிலிண்டர் சிக்கல்',
      waterQuality: 'நீரின் தரம்',
      roadDamage: 'சாலை பாதிப்பு',
      drainage: 'சாக்கடை',
      serviceDelay: 'சேவை தாமதம்',
      staffBehaviour: 'ஊழியர்களின் நடத்தை',
      qf1: 'எங்கள் தெருவில் காலை முதல் மின் தடை ஏற்பட்டுள்ளது',
      qf2: 'தண்ணீர் மீட்டர் தவறான அளவைக் காட்டுகிறது',
      qf3: 'கடந்த 3 நாட்களாக தெருவிளக்கு எரியவில்லை',
      qf4: '2 நாட்களாக குடிநீர் விநியோகம் இல்லை',
      
      enterSearchVal: 'தேட ஒரு மதிப்பை உள்ளிடவும்',
      foundRecordsSpeak: 'பதிவுசெய்யப்பட்ட முடிவுகள் கிடைத்தன. பார்க்க கீழே உருட்டவும்.',
      noRecordsFound: 'பதிவுகள் எதுவும் இல்லை. சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
      typeInstead: 'தட்டச்சு செய்யவும்',
      useMyMobile: 'எனது மொபைலைப் பயன்படுத்தவும்',
      howToTrack: 'கண்காணிப்பது எப்படி?',
      trackStep1: 'பதிவுக்குப் பிறகு பெறப்பட்ட புகார் ஐடியைப் பயன்படுத்தவும் (CMP அல்லது SRQ இல் தொடங்குகிறது)',
      trackStep2: 'அல்லது அனைத்து கோரிக்கைகளையும் பார்க்க உங்கள் பதிவு செய்யப்பட்ட மொபைல் எண்ணைப் பயன்படுத்தவும்',
      trackStep3: 'அந்தந்த துறைகளிடம் இருந்து நிகழ்நேர நிலை புதுப்பிப்புகள்',
      trackStep4: 'உங்கள் கோரிக்கையின் முழுமையான காலவரிசையைப் பார்க்கவும்',
      noComplaintsFound: 'கொடுக்கப்பட்ட மதிப்பிற்கு புகார்கள் அல்லது கோரிக்கைகள் எதுவும் இல்லை.',
      statusTimeline: 'நிலை காலவரிசை:',
      found: 'கிடைத்தன',
      records: 'பதிவுகள்',
      srqLabel: 'சேவை கோரிக்கை',
      compIdLabel: 'புகார் ஐடி',
      mobNumLabel: 'மொபைல் எண்',
      pending: 'நிலுவையில் உள்ளது',
      inProgress: 'செயல்பாட்டில் உள்ளது',
      resolved: 'தீர்க்கப்பட்டது',
      submitted: 'சமர்ப்பிக்கப்பட்டது',
      underReview: 'மதிப்பாய்வில் உள்ளது',
      completed: 'முடிந்தது',
      closed: 'மூடப்பட்டது',
      
      provideDescErr: 'விவரத்தை வழங்கவும்',
      submittingReqSpeak: 'சேவை கோரிக்கையைச் சமர்ப்பிக்கிறது. காத்திருக்கவும்.',
      reqSubmitSuccessSpeak: 'சேவை கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. உங்கள் கோரிக்கை ஐடி',
      reqSubmitFail: 'கோரிக்கையைச் சமர்ப்பிப்பதில் தோல்வி. மீண்டும் முயற்சிக்கவும்.',
      enterAddrPlaceholder: 'சேவை தேவைப்படும் முகவரியை உள்ளிடவும்...',
      addInfoPlaceholder: 'உங்கள் கோரிக்கை குறித்த கூடுதல் தகவல்கள்...',
      docsReadyMsg: 'நேரடி சரிபார்ப்பிற்கு இந்த ஆவணங்களை தயாராக வைத்திருக்கவும்:',
      processingTime: 'செயலாக்க நேரம்',
      physInsp: 'நேரடி ஆய்வு',
      appFee: 'விண்ணப்பக் கட்டணம்',
      asPerNorms: 'விதிமுறைகளின்படி',
      required: 'தேவை',
      smsUpdateLabel: 'எஸ்எம்எஸ் அறிவிப்புகள்',
      aadhaarCard: 'ஆதார் அட்டை',
      addrProof: 'முகவரி ஆதாரம்',
      propertyDocs: 'சொத்து ஆவணங்கள்',
      passportPhoto: 'பாஸ்போர்ட் புகைப்படம்',
      lpgId: 'LPG நுகர்வோர் ஐடி',
      nocOwner: 'கட்டிட உரிமையாளரிடமிருந்து NOC',
      taxReceipt: 'சொத்து வரி ரசீது',
      buildingPlan: 'கட்டிட வரைபடம் / NOC',
      fiveToSevenDays: '5-7 வேலை நாட்கள்',
      
      serviceDashboard: 'சேவை டாஷ்போர்டு',
      welcomeMsg: 'வணக்கம்',
      selectServiceBelow: 'தொடங்குவதற்கு கீழே ஒரு சேவையைத் தேர்ந்தெடுக்கவும்',
      logoutText: 'வெளியேறு',
      elecSub: 'பில்கள், இணைப்பு, புகார்கள்',
      gasSub: 'LPG, நிரப்புதல், புதிய இணைப்பு',
      waterSub: 'பில்கள், இணைப்பு, புகார்கள்',
      muniSub: 'வரி, கழிவு, தெருவிளக்குகள்',
      compSub: 'புதிய குறையை பதிவு செய்க',
      trackSub: 'புகார் மற்றும் கோரிக்கை நிலையை சரிபார்க்கவும்',
      transport: 'போக்குவரத்து துறை',
      transportSub: 'RTO · உரிமம் · வாகனம் · அபராதம்',
      health: 'பொது சுகாதார துறை',
      healthSub: 'மருத்துவமனை · தடுப்பூசி · திட்டங்கள்',

      selectService: 'ஒரு சேவையைத் தேர்ந்தெடுக்கவும்',
      touchOption: 'தொடர ஒரு விருப்பத்தைத் தொடவும்',
      needHelp: 'உதவி வேண்டுமா? இந்த படிகளைப் பின்பற்றவும்',
      quickGuide: 'எங்கள் விரைவான வழிகாட்டி கணினியை எளிதாக செல்ல உதவும்.',
      helpPageSpeak: 'உதவித் திரைக்கு வரவேற்கிறோம். கியோஸ்க்கைப் பயன்படுத்த இந்த எளிய வழிமுறைகளைப் பின்பற்றவும்.',
      helpTitle: 'பயனர் வழிகாட்டி மற்றும் உதவி',
      helpSubtitle: 'ஸ்மார்ட் சிவிக் கியோஸ்க்கை எவ்வாறு பயன்படுத்துவது',
      helpStep1Title: '1. உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
      helpStep1Desc: 'திரையின் மேல்பகுதியில் உள்ள மொழி பொத்தான்களைப் பயன்படுத்தி எந்த நேரத்திலும் ஆங்கிலம், தமிழ் அல்லது இந்தியைத் தேர்ந்தெடுக்கலாம்.',
      helpStep2Title: '2. மொபைல் எண்ணுடன் உள்நுழையவும்',
      helpStep2Desc: 'உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிட்டு, உங்கள் தரவைப் பாதுகாப்பாக வைத்திருக்க SMS வழியாக அனுப்பப்பட்ட 6 இலக்க OTP ஐப் பயன்படுத்தி அதைச் சரிபார்க்கவும்.',
      helpStep3Title: '3. ஒரு சேவையைத் தேர்வு செய்யவும்',
      helpStep3Desc: 'கிடைக்கும் சேவைகளைக் காண மின்சாரம், நீர், எரிவாயு அல்லது நகராட்சி போன்ற ஒரு துறையைத் தேர்ந்தெடுக்கவும்.',
      helpStep4Title: '4. விவரங்களை உள்ளிட்டு உறுதிப்படுத்தவும்',
      helpStep4Desc: 'உங்கள் நுகர்வோர் எண், புகார் விவரங்கள் அல்லது சேவை கோரிக்கை தகவலை உள்ளிட திரையில் உள்ள வழிமுறைகளைப் பின்பற்றவும்.',
      helpStep5Title: '5. பாதுகாப்பாக பணம் செலுத்துங்கள்',
      helpStep5Desc: 'UPI, டெபிட் கார்டு அல்லது இணைய வங்கி மூலம் உங்கள் பயன்பாட்டு பில்களைப் பாதுகாப்பாகச் செலுத்துங்கள்.',
      helpStep6Title: '6. ரசீதை அச்சிடுக',
      helpStep6Desc: 'முடிந்ததும், உங்கள் அச்சிப்பட்ட ரசீதை சேகரிக்கவும். உங்கள் தனியுரிமைக்காக கணினி தானாகவே வெளியேறும்.',

      kioskTitle: 'ஸ்மார்ட் சிவிக் சேவை கியோஸ்க்',
      cdacFull: 'மேம்பட்ட கணினி மேம்பாட்டு மையம்',

      mobileDesc: 'உங்கள் அடையாளத்தை சரிபார்க்க OTP அனுப்பப்படும்',
      enter10digit: '10 இலக்க எண்ணை உள்ளிடவும்',
      otpSentTo: 'OTP +91 க்கு அனுப்பப்பட்டது ',
      changeMobile: '← மொபைல் எண்ணை மாற்றவும்',
      resendOtp: 'OTP ஐ மீண்டும் அனுப்பு',
      secureVerify: 'பாதுகாப்பான சரிபார்ப்பு',
      authStep1: 'உங்கள் பதிவு செய்யப்பட்ட மொபைல் எண்ணை உள்ளிடவும்',
      authStep2: 'எஸ்எம்எஸ் மூலம் 6 இலக்க ஓடிபியைப் பெறுங்கள்',
      authStep3: 'அடையாளத்தை பாதுகாப்பாக சரிபார்க்க OTP ஐ உள்ளிடவும்',
      authStep4: 'அனைத்து குடிமை சேவைகளையும் உடனடியாக அணுகவும்',
      securityNotice: 'பாதுகாப்பு அறிவிப்பு',
      secItem1: 'உங்கள் ஓடிபியை யாருடனும் பகிர வேண்டாம்',
      secItem2: 'OTP 5 நிமிடங்களுக்கு மட்டுமே செல்லுபடியாகும்',
      secItem3: 'அரசு அதிகாரிகள் ஒருபோதும் ஓடிபியைக் கேட்பதில்லை',
      secItem4: 'உங்கள் தரவு குறியாக்கத்தால் பாதுகாக்கப்படுகிறது',

      stepConsumerId: 'நுகர்வோர் எண்', stepViewBill: 'பில் பார்க்கவும்', stepPayment: 'கட்டணம் செலுத்து', stepDone: 'முடிந்தது',
      enterConsumerNum: 'நுகர்வோர் எண்ணை உள்ளிடவும்',
      consumerNumSub: 'உங்கள் நுகர்வோர் எண் உங்கள் பில்லில் அச்சிடப்பட்டுள்ளது',
      fetchBillBtn: 'பில் பெறு', quickFill: 'விரைவான நிரப்புதல்', whereToFind: 'எங்கே கண்டுபிடிப்பது?',
      whereToFindDesc: 'உங்கள் நுகர்வோர் எண் உங்கள் பயன்பாட்டு மசோதாவின் மேல் பகுதியிலோ அல்லது உங்கள் இணைப்பு சான்றிதழிலோ அச்சிடப்பட்டுள்ளது.',
      billDetails: 'பில் விவரங்கள்', totalAmount: 'மொத்த தொகை',
      selectPayMethod: 'கட்டண முறையைத் தேர்ந்தெடுக்கவும்', upiPay: 'UPI கட்டணம்', cashPay: 'ரொக்கப் பணம்', netBankPay: 'நெட் பேங்கிங்',

      regComplaint: 'புகாரைப் பதிவு செய்யவும்', compType: 'புகார் வகை', compDesc: 'விளக்கம்',
      compSubLabel: 'உங்கள் சிக்கல் பற்றிய விவரங்களை வழங்கவும்',
      submitBtn: 'புகாரை சமர்ப்பிக்கவும்',
      fileNewComp: 'புதிய புகாரை பதிவு செய்யவும்', category: 'வகை',

      trackSearchLabel: 'நிலை கண்காணிப்பு',
      trackSearchDesc: 'உங்கள் புகார் ஐடி அல்லது பதிவு செய்யப்பட்ட மொபைல் எண்ணை உள்ளிடவும்',
      enterComplId: 'புகார் / கோரிக்கை ஐடியை உள்ளிடவும்', enterMobNum: 'மொபைல் எண்ணை உள்ளிடவும்',
      searchStatusBtn: 'நிலையை தேடு', howToTrack: 'எப்படி கண்காணிப்பது', noRecords: 'பதிவுகள் எதுவும் கிடைக்கவில்லை',
      applicantName: 'விண்ணப்பதாரர் பெயர்', mobileNum: 'மொபைல் எண்', installAddr: 'நிறுவும் முகவரி',
      addDetails: 'கூடுதல் விவரங்கள்', docsReq: 'தேவையான ஆவணங்கள்', procInfo: 'செயல்முறை தகவல்',
      submitReq: 'கோரிக்கையை சமர்ப்பிக்கவும்',
      
      // Tamil translations (simplified/demo)
      citizenAuth: 'குடிமகன் அங்கீகாரம்', secureOtpLogin: 'பாதுகாப்பான OTP உள்நுழைவு', accessServices: 'சேவைகளை அணுகவும்',
      otpSentSpeak: 'OTP அனுப்பப்பட்டது. தயவுசெய்து 6 இலக்க OTP ஐ உள்ளிடவும்.', welcomeCitizen: 'வரவேற்கிறோம், குடிமகன்!',
      india: 'இந்தியா', demoOtpLabel: 'டெமோ OTP:', resendIn: 'மீண்டும் அனுப்பவும்', typeInstead: 'அதற்கு பதிலாக தட்டச்சு செய்க',
      
      electricityServices: 'மின்சார சேவைகள்', gasServices: 'எரிவாயு சேவைகள்', waterDept: 'நீர் துறை', municipalServices: 'நகராட்சி சேவைகள்',
      tangedco: 'டான்ஜெட்கோ', gasAuthority: 'எரிவாயு ஆணையம்', cmwssb: 'மெட்ரோவாட்டர்', gcc: 'சென்னை மாநகராட்சி',
      
      payElecBill: 'மின் கட்டணம் செலுத்துதல்', payElecBillDesc: 'உங்கள் நிலுவையில் உள்ள மின் கட்டணத்தைச் செலுத்துங்கள்',
      downloadBillDesc: 'உங்கள் தற்போதைய பில்லைப் பதிவிறக்கவும் அல்லது அச்சிடவும்', newConnReq: 'புதிய இணைப்பு கோரிக்கை',
      newConnReqDesc: 'புதிய மின்சார இணைப்பிற்கு விண்ணப்பிக்கவும்', meterComp: 'மீட்டர் புகார்',
      meterCompDesc: 'பழுதடைந்த மீட்டரைப் புகாரளிக்கவும்', lpgPay: 'LPG பில் செலுத்துதல்', lpgPayDesc: 'உங்கள் எல்பிஜி சிலிண்டர் மசோதாவைச் செலுத்துங்கள்',
      gasRefillBook: 'எரிவாயு நிரப்புதல் முன்பதிவு', gasRefillBookDesc: 'புதிய எல்பிஜி சிலிண்டரை முன்பதிவு செய்யவும்',
      newGasConn: 'புதிய எரிவாயு இணைப்பு', newGasConnDesc: 'புதிய எரிவாயு இணைப்பிற்கு விண்ணப்பிக்கவும்',
      gasLeakageSafety: 'எரிவாயு கசிவு/பாதுகாப்பு', gasCompDesc: 'எரிவாயு தொடர்பான புகாரைப் புகாரளிக்கவும்',
      payWaterBill: 'நீர் வரி செலுத்துதல்', payWaterBillDesc: 'உங்கள் நிலுவையில் உள்ள நீர் வரியைச் செலுத்துங்கள்',
      newWaterConn: 'புதிய நீர் இணைப்பு', newWaterConnDesc: 'புதிய நீர் இணைப்பிற்கு விண்ணப்பிக்கவும்',
      waterLeakage: 'நீர் கசிவு', waterLeakageDesc: 'உங்கள் பகுதிக்கு அருகில் ஒரு குழாய் கசிவு புகாரளிக்கவும்',
      lowPressure: 'குறைந்த அழுத்தம்', lowPressureDesc: 'குறைந்த நீர் அழுத்த சிக்கலைப் புகாரளிக்கவும்',
      garbageSanitation: 'குப்பை/சுகாதாரம்', garbageCompDesc: 'சேகரிக்கப்படாத குப்பைகளைப் புகாரளிக்கவும்',
      streetlight: 'தெருவிளக்கு', streetlightCompDesc: 'உடைந்த தெருவிளக்குகளைப் புகாரளிக்கவும்',
      propTaxPay: 'சொத்து வரி செலுத்துதல்', propTaxPayDesc: 'உங்கள் சொத்து வரியை ஆன்லைனில் செலுத்துங்கள்',
      publicGrievance: 'பொது குறை', publicGrievanceDesc: 'ஒரு பொதுவான பொது குறையை சமர்ப்பிக்கவும்',
      
      powerOutage: 'மின் தடை', billingError: 'பில்லிங் பிழை', noSupply: 'விநியோகம் இல்லை', cylinderIssue: 'சிலிண்டர் சிக்கல்',
      waterQuality: 'நீரின் தரம்', garbageIssue: 'குப்பை பிரச்சனை', roadDamage: 'சாலை சேதம்', drainage: 'வடிகால்',
      serviceDelay: 'சேவை தாமதம்', staffBehaviour: 'ஊழியர் நடத்தை', other: 'மற்றவை',
      high: 'அதிக', medium: 'நடுத்தர', low: 'குறைந்த',
      fillRequired: 'தயவுசெய்து தேவையான அனைத்து புலங்களையும் நிரப்பவும்.', compRegSpeak: 'புகார் பதிவு செய்யப்பட்டது. ஐடி:',
      compDescPlaceholder: 'உங்கள் சிக்கலை விரிவாக விவரிக்கவும்...', quickFillSuggestions: 'விரைவான நிரப்புதல் பரிந்துரைகள்',
      attachImage: 'படத்தை இணைக்கவும்', tapCapture: 'படத்தைப் பிடிக்க அல்லது பதிவேற்ற தட்டவும்', maxFile: 'அதிகபட்சம் 5MB · JPG, PNG',
      whatNext: 'அடுத்தது என்ன நடக்கும்?', compResolutionDesc: 'உங்கள் புகார் பதிவு செய்யப்பட்டு தனித்துவமான ஐடி வழங்கப்படும். நீங்கள் SMS புதுப்பிப்புகளைப் பெறுவீர்கள். எதிர்பார்க்கப்படும் தீர்வு: 48-72 வேலை நேரம்.',
      
      idExample: 'உதாரணமாக. CMP12345678', mobExample: 'உதாரணமாக. 9876543210', cmpSrqNum: 'CMP அல்லது SRQ எண்', mobNum10: '10 இலக்க மொபைல் எண்',
      useMyMob: 'எனது மொபைலைப் பயன்படுத்தவும்:', found: 'கண்டுபிடிக்கப்பட்டது', record: 'பதிவு', records: 'பதிவுகள்',
      noRecordsFound: 'பதிவுகள் எதுவும் கிடைக்கவில்லை. ஐடி அல்லது மொபைல் எண்ணைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
      timeline: 'காலவரிசை', statusTimeline: 'நிலை காலவரிசை:', submitted: 'சமர்ப்பிக்கப்பட்டது:',
      
      elecBillPay: 'மின்சார பில் கட்டணம்', gasBillPay: 'எரிவாயு / எல்பிஜி பில் கட்டணம்', waterBillPay: 'நீர் பில் கட்டணம்', muniBillPay: 'நகராட்சி பில் கட்டணம்',
      utility: 'பயன்பாடு', enterValidConsumer: 'சரியான நுகர்வோர் எண்ணை உள்ளிடவும்', billFetchSpeak: 'பில் விவரங்கள் பெறப்பட்டன. உங்கள் பில்லை மதிப்பாய்வு செய்யவும்.',
      billNotFound: 'பில் கிடைக்கவில்லை', paySuccessSpeak: 'கட்டணம் வெற்றிகரமாக முடிந்தது! உங்கள் ரசீது உருவாக்கப்பட்டது.', payFailed: 'கட்டணம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
      current: 'தற்போதைய', na: 'இல்லை', billMonth: 'பில் மாதம்', unitsConsumed: 'பயன்படுத்தப்பட்ட அலகுகள்', dueDate: 'காலக்கெடு', dueBy: 'இதற்குள் செலுத்தவும்',
      payNowAvoid: 'அபராதங்களைத் தவிர்க்க இப்போது பணம் செலுத்துங்கள்.', upiDesc: 'UPI / QR குறியீடு (GPay, PhonePe, Paytm) வழியாக பணம் செலுத்துங்கள்', cashDesc: 'கவுண்டரில் ரொக்கப் பணம் செலுத்துங்கள்',
      fetchBillBtnText: 'பில் பெறு →', payNowBtnText: 'இப்போது செலுத்து ✓',
      
      submittingReqSpeak: 'சேவை கோரிக்கையை சமர்ப்பிக்கிறது. தயவுசெய்து காத்திருக்கவும்.', reqSuccessSpeak: 'சேவை கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. உங்கள் கோரிக்கை ஐடி',
      aadhaar: 'ஆதார் அட்டை', addrProof: 'முகவரி ஆதாரம்', propDocs: 'சொத்து ஆவணங்கள்', photo: 'பாஸ்போர்ட் புகைப்படம்', lpgId: 'எல்பிஜி நுகர்வோர் ஐடி',
      nocOwner: 'கட்டிட உரிமையாளரிடமிருந்து NOC', propTaxReceipt: 'சொத்து வரி ரசீது', bldgPlan: 'கட்டிடத் திட்டம்/NOC',
      provideDesc: 'தயவுசெய்து ஒரு விளக்கத்தை வழங்கவும்', failSubmitTry: 'கோரிக்கையைச் சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      enterAddrPlaceholder: 'சேவை தேவைப்படும் முகவரியை உள்ளிடவும்...', addInfoPlaceholder: 'உங்கள் கோரிக்கை பற்றிய கூடுதல் தகவல்கள்...',
      keepDocsReady: 'உடல் சரிபார்ப்புக்கு இந்த ஆவணங்களை தயாராக வைத்திருக்கவும்:',
      procTime: 'செயலாக்க நேரம்', workingDays5: '5-7 வேலை நாட்கள்', physInsp: 'உடல் ஆய்வு', required: 'தேவை',
      appFee: 'விண்ணப்பக் கட்டணம்', appFeeNorms: 'விதிமுறைகளின்படி', smsNotif: 'எஸ்எம்எஸ் அறிவிப்புகள்',
      
      paySuccess: 'கட்டணம் வெற்றிகரமாக முடிந்தது!', billProcSuccess: 'உங்கள் பில் கட்டணம் செயலாக்கப்பட்டது.',
      receiptNo: 'ரசீது எண்.', consumerNo: 'நுகர்வோர் எண்.', amountPaid: 'செலுத்தப்பட்ட தொகை', payMode: 'கட்டண முறை',
      dateTime: 'தேதி மற்றும் நேரம்', statusLabel: 'நிலை', confirmed: 'உறுதிப்படுத்தப்பட்டது',
      compRegTitle: 'புகார் பதிவு செய்யப்பட்டது!', compSubSuccess: 'உங்கள் புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
      dateFiled: 'தாக்கல் செய்யப்பட்ட தேதி', expRes: 'எதிர்பார்க்கப்படும் தீர்வு', trackingLabel: 'கண்காணிப்பு', smsInfo: 'எஸ்எம்எஸ் புதுப்பிப்புகள் அனுப்பப்படும்',
      reqSubTitle: 'கோரிக்கை சமர்ப்பிக்கப்பட்டது!', reqRegSuccess: 'உங்கள் சேவை கோரிக்கை பதிவு செய்யப்பட்டுள்ளது.',
      expTAT: 'எதிர்பார்க்கப்படும் TAT', workingHours: 'வேலை நேரம்', printReceipt: 'ரசீதை அச்சிடுக', retDash: 'டாஷ்போர்டுக்கு திரும்பு',
      autoReturn: 'செயலற்ற நிலைக்குப் பிறகு அமர்வு தானாகவே திரும்பும்', txnReceipt: 'பரிவர்த்தனை ரசீது', txnComplete: 'பரிவர்த்தனை முடிந்தது',
      compGenReceipt: 'இது கணினியால் உருவாக்கப்பட்ட ரசீது. கையொப்பம் தேவையில்லை.',
      thankYou: 'ஸ்மார்ட் சிவிக் சேவை கியோஸ்க்கைப் பயன்படுத்தியதற்கு நன்றி!',
      
      // Loading Messages
      sendingOtpMsg: 'உங்கள் மொபைலுக்கு OTP அனுப்பப்படுகிறது...',
      verifyingOtpMsg: 'OTP சரிபார்க்கப்படுகிறது...',
      fetchingBillMsg: 'பில் விவரங்கள் பெறப்படுகின்றன...',
      searchingRecordsMsg: 'பதிவுகள் தேடப்படுகின்றன...',
      processingPaymentMsg: 'கட்டணம் செயலாக்கப்படுகிறது...',
      submittingCompMsg: 'உங்கள் புகார் சமர்ப்பிக்கப்படுகிறது...',
      submittingReqMsg: 'சேவை கோரிக்கை சமர்ப்பிக்கப்படுகிறது...',
      
      langSetSpeak: 'மொழி மாற்றப்பட்டது',
      accessEnabledSpeak: 'அணுகல் முறை இயக்கப்பட்டது. எழுத்துரு அளவுகள் மற்றும் மாறுபாடு அதிகரிக்கப்பட்டது.',
      accessDisabledSpeak: 'அணுகல் முறை முடக்கப்பட்டது',
      openingHelpSpeak: 'உதவி வழிகாட்டியைத் திறக்கிறது',
      
      networkLost: 'பிணைய இணைப்பு துண்டிக்கப்பட்டது. ஆஃப்லைன் பயன்முறை செயலில் உள்ளது - கோரிக்கைகள் பின்னர் ஒத்திசைக்கப்படும்.',
      sessionWarnSpeak: 'எச்சரிக்கை: செயலற்ற நிலை காரணமாக உங்கள் அமர்வு விரைவில் காலாவதியாகிவிடும். தொடர திரையைத் தொடவும்.',
      sessionExpiring: 'அமர்வு விரைவில் காலாவதியாகிறது', sessionEndInactivity: 'செயலற்ற நிலை காரணமாக உங்கள் அமர்வு முடிவடையும்.',
      touchContinue: 'தொடர எங்கும் தொடவும் அல்லது தொடரவும் என்பதை அழுத்தவும்.', continueSession: 'அமர்வைத் தொடரவும்', endSession: 'அமர்வை முடிக்கவும்',
      privacyLogout: 'உங்கள் தனியுரிமைக்காக, வெளியேறும்போது அமர்வு தரவு அழிக்கப்படும்',
      cdacHindi: 'உன்னத கணினி மேம்பாட்டு மையம்'
    },
    hi: {
      welcome: 'स्मार्ट सिविक सेवा कियोस्क में आपका स्वागत है',
      selectLanguage: 'भाषा चुनें', startService: 'सेवा शुरू करें',
      enterMobile: 'मोबाइल नंबर दर्ज करें', sendOtp: 'OTP भेजें',
      enterOtp: 'OTP दर्ज करें', verify: 'सत्यापित करें',
      services: 'हमारी सेवाएँ', electricity: 'बिजली सेवाएँ',
      water: 'जल सेवाएँ', gas: 'गैस सेवाएँ',
      municipal: 'नगर पालिका सेवाएँ', complaint: 'शिकायत दर्ज करें',
      track: 'स्थिति ट्रैक करें', payBill: 'बिल भुगतान', downloadBill: 'बिल डाउनलोड',
      newConnection: 'नया कनेक्शन', meterComplaint: 'मीटर शिकायत',
      back: 'वापस', home: 'होम', confirm: 'पुष्टि करें', cancel: 'रद्द करें',
      help: 'सहायता', accessMode: 'एक्सेसिबिलिटी मोड',

      allGovtServices: 'सभी सरकारी सेवाएँ एक ही स्थान पर',
      allGovtServicesTag: 'அனைத்து அரசு சேவைகளும் ஒரே இடத்தில் | All Government Services in One Place',
      touchToBegin: 'शुरू करने के लिए ऊपर दिए गए बटन को टच करें',
      marquee1: '🔵 नागरिक अब इस कियोस्क पर उपयोगिता बिलों का भुगतान कर सकते हैं, शिकायत दर्ज कर सकते हैं और अनुरोधों को ट्रैक कर सकते हैं।',
      marquee2: '🟡 पहचान सत्यापन के लिए आपके पंजीकृत मोबाइल नंबर पर ओटीपी भेजा जाएगा।',
      marquee3: '🟢 तकनीकी सहायता के लिए, कियोस्क ऑपरेटर से संपर्क करें।',
      marquee4: '🔴 90 सेकंड की निष्क्रियता के बाद यह कियोस्क बंद हो जाता है।',
      marquee5: '📞 हेल्पडेस्क: 1800-XXX-XXXX (टोल फ्री, 24×7)',
      otpSent: 'ओटीपी भेजा गया',
      invalidOtp: 'अमान्य ओटीपी। कृपया पुनः प्रयास करें।',
      enter10digitErr: 'मान्य 10 अंकों का मोबाइल नंबर दर्ज करें',
      enter6digitErr: 'पूरा 6 अंकों का ओटीपी दर्ज करें',
      welcomeCitizenSpeak: 'स्वागत है',
      citizen: 'नागरिक',
      
      enterConsumerNumErr: 'मान्य उपभोक्ता संख्या दर्ज करें',
      billFetchedSpeak: 'बिल विवरण प्राप्त हुए। कृपया अपने बिल की समीक्षा करें।',
      billNotFound: 'बिल नहीं मिला',
      paymentSuccessSpeak: 'भुगतान सफल! आपकी रसीद जनरेट हो गई है।',
      paymentFailed: 'भुगतान विफल। पुनः प्रयास करें।',
      billPaymentTitle: 'बिल भुगतान',
      consumerNumber: 'उपभोक्ता संख्या',
      billMonth: 'बिल माह',
      unitsConsumed: 'खपत की गई इकाइयाँ',
      unitsLabel: 'इकाइयां',
      dueDate: 'नियत तिथि',
      dueBy: 'तक देय',
      avoidPenalties: 'जुर्माने से बचने के लिए अभी भुगतान करें।',
      use: 'उपयोग',
      demo: 'डेमो',
      upiPayDesc: 'UPI / QR कोड के माध्यम से भुगतान करें (GPay, PhonePe, Paytm)',
      cashPay: 'नकद भुगतान',
      cashPayDesc: 'काउंटर पर नकद भुगतान करें',
      confirmPay: 'अभी भुगतान करें',
      payMethodSubtitle: 'UPI या नकद भुगतान में से चुनें',
      upiModalTitle: 'QR स्कैन करें और UPI से भुगतान करें',
      upiModalDesc: 'किसी भी UPI ऐप से QR कोड स्कैन करें (GPay, PhonePe, Paytm, BHIM)',
      upiScanInstructions: 'UPI ऐप खोलें → QR स्कैन करें → राशि दर्ज करें → भुगतान करें। फिर नीचे दिए बटन पर टैप करें।',
      upiPaidConfirm: 'मैंने भुगतान कर दिया',
      cashPendingTitle: 'नकद भुगतान लंबित है',
      cashPendingDesc: 'कृपया काउंटर पर ऑपरेटर को नकद सौंपें।',
      cashPendingSpeak: 'कृपया काउंटर पर ऑपरेटर को नकद раशि सौंपें।',
      cashHandNote: 'काउंटर पर जाएं और ऑपरेटर को नकद सौंपें। रसीद स्वतः उत्पन्न होगी।',
      
      fillReqFields: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
      compRegSpeak: 'शिकायत सफलतापूर्वक पंजीकृत हुई। आपकी शिकायत आईडी है',
      compFail: 'सबमिशन विफल रहा। पुनः प्रयास करें।',
      selectDeptFirst: 'पहले एक विभाग चुनें',
      describeIssuePlaceholder: 'अपनी समस्या का विस्तार से वर्णन करें...',
      quickFillTitle: 'त्वरित सुझाव',
      attachImage: 'छवि संलग्न करें',
      tapCapture: 'छवि कैप्चर करने या अपलोड करने के लिए टैप करें',
      maxFileSize: 'अधिकतम 5MB · JPG, PNG',
      whatNext: 'आगे क्या होगा?',
      compFollowUp: 'आपकी शिकायत पंजीकृत की जाएगी और एक विशिष्ट आईडी आवंटित की जाएगी। आपको एसएमएस अपडेट प्राप्त होंगे। अपेक्षित समाधान: 48-72 कार्य घंटे।',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'निम्न',
      powerOutage: 'बिजली कटौती',
      billingError: 'बिलिंग त्रुटि',
      noSupply: 'आपूर्ति नहीं',
      cylinderIssue: 'सिलेंडर की समस्या',
      waterQuality: 'पानी की गुणवत्ता',
      roadDamage: 'सड़क क्षति',
      drainage: 'निकासी',
      serviceDelay: 'सेवा में देरी',
      staffBehaviour: 'कर्मचारियों का व्यवहार',
      qf1: 'हमारी गली में सुबह से बिजली कटौती है',
      qf2: 'पानी का मीटर गलत रीडिंग दिखा रहा है',
      qf3: 'पिछले 3 दिनों से स्ट्रीटलाइट काम नहीं कर रही है',
      qf4: '2 दिनों से पानी की आपूर्ति नहीं है',
      
      enterSearchVal: 'कृपया खोजने के लिए एक मान दर्ज करें',
      foundRecordsSpeak: 'रिकॉर्ड किए गए परिणाम मिले। देखने के लिए कृपया स्क्रॉल करें।',
      noRecordsFound: 'कोई रिकॉर्ड नहीं मिला। कृपया जाँचें और पुनः प्रयास करें।',
      typeInstead: 'इसके बजाय टाइप करें',
      useMyMobile: 'मेरे मोबाइल का उपयोग करें',
      howToTrack: 'ट्रैक कैसे करें?',
      trackStep1: 'पंजीकरण के बाद प्राप्त शिकायत आईडी का उपयोग करें (CMP या SRQ से शुरू होने वाली)',
      trackStep2: 'या सभी अनुरोधों को देखने के लिए अपने पंजीकृत मोबाइल नंबर का उपयोग करें',
      trackStep3: 'संबंधित विभागों से रीयल-टाइम स्थिति अपडेट',
      trackStep4: 'अपने अनुरोध की पूरी समयरेखा देखें',
      noComplaintsFound: 'दिए गए मान के लिए कोई शिकायत या अनुरोध नहीं मिला।',
      statusTimeline: 'स्थिति समयरेखा:',
      found: 'मिले',
      records: 'रिकॉर्ड',
      srqLabel: 'सेवा अनुरोध',
      compIdLabel: 'शिकायत आईडी',
      mobNumLabel: 'मोबाइल नंबर',
      pending: 'लंबित',
      inProgress: 'प्रगति पर',
      resolved: 'सुलझाया गया',
      submitted: 'सबमिट किया गया',
      underReview: 'समीक्षाधीन',
      completed: 'पूरा हुआ',
      closed: 'बंद',
      
      provideDescErr: 'कृपया विवरण प्रदान करें',
      submittingReqSpeak: 'सेवा अनुरोध सबमिट किया जा रहा है। कृपया प्रतीक्षा करें।',
      reqSubmitSuccessSpeak: 'सेवा अनुरोध सफलतापूर्वक सबमिट किया गया। आपकी अनुरोध आईडी है',
      reqSubmitFail: 'अनुरोध सबमिट करने में विफल। पुनः प्रयास करें।',
      enterAddrPlaceholder: 'वह पता दर्ज करें जहां सेवा की आवश्यकता है...',
      addInfoPlaceholder: 'आपके अनुरोध के बारे में कोई अतिरिक्त जानकारी...',
      docsReadyMsg: 'कृपया भौतिक सत्यापन के लिए इन दस्तावेजों को तैयार रखें:',
      processingTime: 'प्रसंस्करण समय',
      physInsp: 'भौतिक निरीक्षण',
      appFee: 'आवेदन शुल्क',
      asPerNorms: 'नियमों के अनुसार',
      required: 'आवश्यक',
      smsUpdateLabel: 'एसएमएस सूचनाएं',
      aadhaarCard: 'आधार कार्ड',
      addrProof: 'पते का प्रमाण',
      propertyDocs: 'संपत्ति के दस्तावेज',
      passportPhoto: 'पासपोर्ट फोटो',
      lpgId: 'एलपीजी उपभोक्ता आईडी',
      nocOwner: 'भवन स्वामी से एनओसी',
      taxReceipt: 'संपत्ति कर रसीद',
      buildingPlan: 'भवन योजना / एनओसी',
      fiveToSevenDays: '5-7 कार्य दिवस',
      
      serviceDashboard: 'सेवा डैशबोर्ड',
      welcomeMsg: 'नमस्ते',
      selectServiceBelow: 'आरंभ करने के लिए नीचे एक सेवा चुनें',
      logoutText: 'लॉग आउट',
      elecSub: 'बिल, कनेक्शन, शिकायत',
      gasSub: 'एलपीजी, रिफिल, नया कनेक्शन',
      waterSub: 'बिल, कनेक्शन, शिकायत',
      muniSub: 'कर, अपशिष्ट, स्ट्रीटलाइट',
      compSub: 'एक नई शिकायत दर्ज करें',
      trackSub: 'शिकायत और अनुरोध की स्थिति की जाँच करें',
      transport: 'परिवहन विभाग',
      transportSub: 'RTO · लाइसेंस · वाहन · जुर्माना',
      health: 'सार्वजनिक स्वास्थ्य विभाग',
      healthSub: 'अस्पताल · टीकाकरण · योजनाएं',

      selectService: 'एक सेवा चुनें',
      touchOption: 'आगे बढ़ने के लिए एक विकल्प स्पर्श करें',
      needHelp: 'मदद चाहिए? इन चरणों का पालन करें',
      quickGuide: 'हमारी त्वरित मार्गदर्शिका आपको सिस्टम को आसानी से नेविगेट करने में मदद करेगी।',
      helpPageSpeak: 'सहायता स्क्रीन पर आपका स्वागत है। कियोस्क का उपयोग करने के लिए इन सरल चरणों का पालन करें।',
      helpTitle: 'उपयोगकर्ता मार्गदर्शिका और सहायता',
      helpSubtitle: 'स्मार्ट सिविक कियोस्क का उपयोग कैसे करें',
      helpStep1Title: '1. अपनी भाषा चुनें',
      helpStep1Desc: 'किसी भी समय अंग्रेजी, तमिल या हिंदी चुनने के लिए स्क्रीन के शीर्ष पर स्थित भाषा बटनों का उपयोग करें।',
      helpStep2Title: '2. मोबाइल नंबर के साथ लॉगिन करें',
      helpStep2Desc: 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें और अपने डेटा को सुरक्षित रखने के लिए एसएमएस के माध्यम से भेजे गए 6 अंकों के ओटीपी का उपयोग करके इसे सत्यापित करें।',
      helpStep3Title: '3. सेवा चुनें',
      helpStep3Desc: 'उपलब्ध सेवाओं को देखने के लिए बिजली, पानी, गैस या नगर पालिका जैसे विभाग का चयन करें।',
      helpStep4Title: '4. विवरण दर्ज करें और पुष्टि करें',
      helpStep4Desc: 'अपना उपभोक्ता नंबर, शिकायत विवरण या सेवा अनुरोध जानकारी दर्ज करने के लिए स्क्रीन पर दिए गए निर्देशों का पालन करें।',
      helpStep5Title: '5. सुरक्षित रूप से भुगतान करें',
      helpStep5Desc: 'UPI, डेबिट कार्ड या नेट बैंकिंग का उपयोग करके सुरक्षित रूप से अपने उपयोगिता बिलों का भुगतान करें।',
      helpStep6Title: '6. रसीद प्रिंट करें',
      helpStep6Desc: 'पूरा होने के बाद, अपनी मुद्रित रसीद प्राप्त करें। आपकी गोपनीयता के लिए सिस्टम स्वतः ही लॉग आउट हो जाएगा।',

      kioskTitle: 'स्मार्ट सिविक सर्विस कियोस्क',
      cdacFull: 'उन्नत कंप्यूटिंग विकास केंद्र',

      mobileDesc: 'आपकी पहचान सत्यापित करने के लिए एक ओटीपी भेजा जाएगा',
      enter10digit: '10 अंकों का नंबर दर्ज करें',
      otpSentTo: 'OTP +91 पर भेजा गया ',
      changeMobile: '← मोबाइल नंबर बदलें',
      resendOtp: 'OTP पुनः भेजें',
      secureVerify: 'सुरक्षित सत्यापन',
      authStep1: 'अपना पंजीकृत मोबाइल नंबर दर्ज करें',
      authStep2: 'एसएमएस के माध्यम से 6 अंकों का ओटीपी प्राप्त करें',
      authStep3: 'पहचान को सुरक्षित रूप से सत्यापित करने के लिए ओटीपी दर्ज करें',
      authStep4: 'सभी नागरिक सेवाओं तक तुरंत पहुंचें',
      securityNotice: 'सुरक्षा सूचना',
      secItem1: 'अपना ओटीपी कभी किसी के साथ साझा न करें',
      secItem2: 'ओटीपी केवल 5 मिनट के लिए वैध है',
      secItem3: 'सरकारी अधिकारी कभी भी ओटीपी नहीं मांगते हैं',
      secItem4: 'आपका डेटा एन्क्रिप्शन द्वारा सुरक्षित है',

      stepConsumerId: 'उपभोक्ता आईडी', stepViewBill: 'बिल देखें', stepPayment: 'भुगतान', stepDone: 'संपन्न',
      enterConsumerNum: 'उपभोक्ता नंबर दर्ज करें',
      consumerNumSub: 'आपका उपभोक्ता नंबर आपके बिल पर छपा है',
      fetchBillBtn: 'बिल प्राप्त करें', quickFill: 'त्वरित भरें', whereToFind: 'कहाँ खोजें?',
      whereToFindDesc: 'आपका उपभोक्ता नंबर आपके उपयोगिता बिल के ऊपरी भाग पर या आपके कनेक्शन प्रमाणपत्र पर छपा होता है।',
      billDetails: 'बिल विवरण', totalAmount: 'कुल राशि',
      selectPayMethod: 'भुगतान विधि चुनें', upiPay: 'UPI भुगतान', cashPay: 'नकद भुगतान', netBankPay: 'नेट बैंकिंग',

      regComplaint: 'शिकायत दर्ज करें', compType: 'शिकायत का प्रकार', compDesc: 'विवरण',
      compSubLabel: 'कृपया अपनी समस्या के बारे में विवरण प्रदान करें',
      submitBtn: 'शिकायत जमा करें',
      fileNewComp: 'एक नई शिकायत दर्ज करें', category: 'श्रेणी',

      trackSearchLabel: 'स्थिति ट्रैक करें',
      trackSearchDesc: 'अपना शिकायत आईडी या पंजीकृत मोबाइल नंबर दर्ज करें',
      enterComplId: 'शिकायत / अनुरोध आईडी दर्ज करें', enterMobNum: 'मोबाइल नंबर दर्ज करें',
      searchStatusBtn: 'स्थिति खोजें', howToTrack: 'कैसे ट्रैक करें', noRecords: 'कोई रिकॉर्ड नहीं मिला',
      applicantName: 'आवेदक का नाम', mobileNum: 'मोबाइल नंबर', installAddr: 'स्थापना पता',
      addDetails: 'अतिरिक्त विवरण', docsReq: 'आवश्यक दस्तावेज़', procInfo: 'प्रक्रिया जानकारी',
      submitReq: 'अनुरोध सबमिट करें',
      
      // Hindi translations (simplified/demo)
      citizenAuth: 'नागरिक प्रमाणीकरण', secureOtpLogin: 'सुरक्षित ओटीपी लॉगिन', accessServices: 'सेवाओं तक पहुंचें',
      otpSentSpeak: 'ओटीपी भेजा गया। कृपया 6 अंकों का ओटीपी दर्ज करें।', welcomeCitizen: 'स्वागत है, नागरिक!',
      india: 'भारत', demoOtpLabel: 'डेमो ओटीपी:', resendIn: 'फिर से भेजें', typeInstead: 'बजाय टाइप करें',
      
      electricityServices: 'बिजली सेवाएं', gasServices: 'गैस सेवाएं', waterDept: 'जल विभाग', municipalServices: 'नगर पालिका सेवाएं',
      tangedco: 'टैंगेडको', gasAuthority: 'गैस प्राधिकरण', cmwssb: 'मेट्रोवाटर', gcc: 'चेन्नई निगम',
      
      payElecBill: 'बिजली बिल भुगतान', payElecBillDesc: 'अपना लंबित बिजली बिल भरें',
      downloadBillDesc: 'अपना वर्तमान बिल डाउनलोड या प्रिंट करें', newConnReq: 'नया कनेक्शन अनुरोध',
      newConnReqDesc: 'नए बिजली कनेक्शन के लिए आवेदन करें', meterComp: 'मीटर शिकायत',
      meterCompDesc: 'दोषपूर्ण मीटर की रिपोर्ट करें', lpgPay: 'एलपीजी बिल भुगतान', lpgPayDesc: 'अपना एलपीजी सिलेंडर बिल भरें',
      gasRefillBook: 'गैस रिफिल बुकिंग', gasRefillBookDesc: 'नया एलपीजी सिलेंडर बुक करें',
      newGasConn: 'नया गैस कनेक्शन', newGasConnDesc: 'नए गैस कनेक्शन के लिए आवेदन करें',
      gasLeakageSafety: 'गैस रिसाव/सुरक्षा', gasCompDesc: 'गैस संबंधी शिकायत की रिपोर्ट करें',
      payWaterBill: 'जल कर भुगतान', payWaterBillDesc: 'अपना लंबित जल कर भरें',
      newWaterConn: 'नया जल कनेक्शन', newWaterConnDesc: 'नए जल कनेक्शन के लिए आवेदन करें',
      waterLeakage: 'पानी का रिसाव', waterLeakageDesc: 'अपने क्षेत्र के पास पाइप रिसाव की रिपोर्ट करें',
      lowPressure: 'कम दबाव', lowPressureDesc: 'कम पानी के दबाव की समस्या की रिपोर्ट करें',
      garbageSanitation: 'कचरा/स्वच्छता', garbageCompDesc: 'नहीं उठाए गए कचरे की रिपोर्ट करें',
      streetlight: 'स्ट्रीटलाइट', streetlightCompDesc: 'टूटी हुई स्ट्रीटलाइट की रिपोर्ट करें',
      propTaxPay: 'संपत्ति कर भुगतान', propTaxPayDesc: 'अपना संपत्ति कर ऑनलाइन भरें',
      publicGrievance: 'लोक शिकायत', publicGrievanceDesc: 'एक सामान्य लोक शिकायत दर्ज करें',
      
      powerOutage: 'बिजली गुल', billingError: 'बिलिंग त्रुटि', noSupply: 'आपूर्ति नहीं', cylinderIssue: 'सिलेंडर की समस्या',
      waterQuality: 'पानी की गुणवत्ता', garbageIssue: 'कचरे की समस्या', roadDamage: 'सड़क क्षति', drainage: 'जल निकासी',
      serviceDelay: 'सेवा में देरी', staffBehaviour: 'कर्मचारियों का व्यवहार', other: 'अन्य',
      high: 'उच्च', medium: 'मध्यम', low: 'कम',
      fillRequired: 'कृपया सभी आवश्यक फ़ील्ड भरें।', compRegSpeak: 'शिकायत दर्ज की गई। आईडी:',
      compDescPlaceholder: 'अपनी समस्या का विस्तार से वर्णन करें...', quickFillSuggestions: 'त्वरित सुझाव',
      attachImage: 'छवि संलग्न करें', tapCapture: 'फोटो लेने या अपलोड करने के लिए टैप करें', maxFile: 'अधिकतम 5MB · JPG, PNG',
      whatNext: 'आगे क्या होगा?', compResolutionDesc: 'आपकी शिकायत दर्ज की जाएगी और एक विशिष्ट आईडी दी जाएगी। आपको एसएमएस अपडेट प्राप्त होंगे। अपेक्षित समाधान: 48-72 कार्य घंटे।',
      
      idExample: 'जैसे CMP12345678', mobExample: 'जैसे 9876543210', cmpSrqNum: 'CMP या SRQ नंबर', mobNum10: '10 अंकों का मोबाइल नंबर',
      useMyMob: 'मेरे मोबाइल का उपयोग करें:', found: 'मिला', record: 'रिकॉर्ड', records: 'रिकॉर्ड्स',
      noRecordsFound: 'कोई रिकॉर्ड नहीं मिला। कृपया आईडी या मोबाइल नंबर की जांच करें और पुनः प्रयास करें।',
      timeline: 'समयरेखा', statusTimeline: 'स्थिति समयरेखा:', submitted: 'जमा किया गया:',
      
      elecBillPay: 'बिजली बिल भुगतान', gasBillPay: 'गैस / एलपीजी बिल भुगतान', waterBillPay: 'जल बिल भुगतान', muniBillPay: 'नगर पालिका बिल भुगतान',
      utility: 'उपयोगिता', enterValidConsumer: 'मान्य उपभोक्ता संख्या दर्ज करें', billFetchSpeak: 'बिल विवरण प्राप्त हुए। कृपया अपने बिल की समीक्षा करें।',
      billNotFound: 'बिल नहीं मिला', paySuccessSpeak: 'भुगतान सफल रहा! आपकी रसीद जनरेट हो गई है।', payFailed: 'भुगतान विफल रहा। पुनः प्रयास करें।',
      current: 'वर्तमान', na: 'लागू नहीं', billMonth: 'बिल महीना', unitsConsumed: 'खपत की गई इकाइयां', dueDate: 'नियत तिथि', dueBy: 'तारीख तक भुगतान करें',
      payNowAvoid: 'जुमाने से बचने के लिए अभी भुगतान करें।', upiDesc: 'UPI / QR कोड (GPay, PhonePe, Paytm) के माध्यम से भुगतान करें', cashDesc: 'काउंटर पर नकद भुगतान करें',
      fetchBillBtnText: 'बिल प्राप्त करें →', payNowBtnText: 'अभी भुगतान करें ✓',
      
      submittingReqSpeak: 'सेवा अनुरोध सबमिट हो रहा है। कृपया प्रतीक्षा करें।', reqSuccessSpeak: 'सेवा अनुरोध सफलतापूर्वक सबमिट किया गया। आपका अनुरोध आईडी है',
      aadhaar: 'आधार कार्ड', addrProof: 'निवास प्रमाण', propDocs: 'संपत्ति के दस्तावेज', photo: 'पासपोर्ट फोटो', lpgId: 'एलपीजी उपभोक्ता आईडी',
      nocOwner: 'भवन मालिक से एनओसी', propTaxReceipt: 'संपत्ति कर रसीद', bldgPlan: 'बिल्डिंग प्लान/एनओसी',
      provideDesc: 'कृपया विवरण प्रदान करें', failSubmitTry: 'अनुरोध सबमिट करने में विफल। पुनः प्रयास करें।',
      enterAddrPlaceholder: 'वह पता दर्ज करें जहां सेवा की आवश्यकता है...', addInfoPlaceholder: 'आपके अनुरोध के बारे में कोई अतिरिक्त जानकारी...',
      keepDocsReady: 'कृपया भौतिक सत्यापन के लिए इन दस्तावेजों को तैयार रखें:',
      procTime: 'प्रसंस्करण समय', workingDays5: '5-7 कार्य दिवस', physInsp: 'भौतिक निरीक्षण', required: 'अनिवार्य',
      appFee: 'आवेदन शुल्क', appFeeNorms: 'नियमों के अनुसार', smsNotif: 'एसएमएस सूचनाएं',
      
      paySuccess: 'भुगतान सफल रहा!', billProcSuccess: 'आपका बिल भुगतान संसाधित कर दिया गया है।',
      receiptNo: 'रसीद संख्या', consumerNo: 'उपभोक्ता संख्या', amountPaid: 'भुगतान की गई राशि', payMode: 'भुगतान का प्रकार',
      dateTime: 'दिनांक और समय', statusLabel: 'स्थिति', confirmed: 'पुष्टि की गई',
      compRegTitle: 'शिकायद दर्ज की गई!', compSubSuccess: 'आपकी शिकायत सफलतापूर्वक सबमिट हो गई है।',
      dateFiled: 'दर्ज करने की तिथि', expRes: 'अपेक्षित समाधान', trackingLabel: 'ट्रैकिंग', smsInfo: 'एसएमएस अपडेट भेजे जाएंगे',
      reqSubTitle: 'अनुरोध सबमिट किया गया!', reqRegSuccess: 'आपका सेवा अनुरोध पंजीकृत हो गया है।',
      expTAT: 'अपेक्षित TAT', workingHours: 'कार्य घंटे', printReceipt: 'रसीद प्रिंट करें', retDash: 'डैशबोर्ड पर लौटें',
      autoReturn: 'निष्क्रियता के बाद सत्र स्वतः लौट आएगा', txnReceipt: 'परीक्षण रसीद', txnComplete: 'लेनदेन पूरा हुआ',
      compGenReceipt: 'यह कंप्यूटर द्वारा जनरेट की गई रसीद है। हस्ताक्षर की आवश्यकता नहीं है।',
      thankYou: 'स्मार्ट सिविक सर्विस कियोस्क का उपयोग करने के लिए धन्यवाद!',
      
      // Loading Messages
      sendingOtpMsg: 'आपके मोबाइल पर ओटीपी भेजा जा रहा है...',
      verifyingOtpMsg: 'ओटीपी सत्यापित किया जा रहा है...',
      fetchingBillMsg: 'बिल विवरण प्राप्त किए जा रहे हैं...',
      searchingRecordsMsg: 'रिकॉर्ड खोजे जा रहे हैं...',
      processingPaymentMsg: 'भुगतान संसाधित किया जा रहा है...',
      submittingCompMsg: 'आपकी शिकायत सबमिट की जा रही है...',
      submittingReqMsg: 'सेवा अनुरोध सबमिट किया जा रहा है...',
      
      langSetSpeak: 'भाषा सेट की गई',
      accessEnabledSpeak: 'एक्सेसिबिलिटी मोड सक्षम। फ़ॉन्ट आकार और कंट्रास्ट बढ़ाया गया।',
      accessDisabledSpeak: 'एक्सेसिबिलिटी मोड अक्षम',
      openingHelpSpeak: 'सहायता गाइड खोल रहा है',
      
      networkLost: 'नेटवर्क कनेक्शन टूट गया। ऑफलाइन मोड सक्रिय - अनुरोध बाद में सिंक किए जाएंगे।',
      sessionWarnSpeak: 'चेतावनी: निष्क्रियता के कारण आपका सत्र जल्द ही समाप्त हो जाएगा। जारी रखने के लिए स्क्रीन स्पर्श करें।',
      sessionExpiring: 'सत्र जल्द ही समाप्त हो रहा है', sessionEndInactivity: 'निष्क्रियता के कारण आपका सत्र समाप्त हो जाएगा।',
      touchContinue: 'जारी रखने के लिए कहीं भी स्पर्श करें या "जारी रखें" दबाएं।', continueSession: 'सत्र जारी रखें', endSession: 'सत्र समाप्त करें',
      privacyLogout: 'आपकी गोपनीयता के लिए, लॉगआउट पर सत्र डेटा साफ़ कर दिया जाएगा',
      cdacHindi: 'प्रगत संगणन विकास केंद्र'
    }
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  /* -------- Speech -------- */
  const speak = useCallback((text) => {
    // TTS disabled: using only pre-generated audio
  }, []);

  /* -------- API helpers -------- */
  const withLoading = async (msg, fn) => {
    setLoadingMsg(msg);
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const sendOtp = (mobile) => withLoading(t('sendingOtpMsg'), async () => {
    try {
      const res = await authAPI.sendOtp(mobile);
      return res.data;
    } catch (err) {
      return { success: true, message: t('otpSent'), demoOtp: '123456' };
    }
  });

  const verifyOtp = (mobile, otp) => withLoading(t('verifyingOtpMsg'), async () => {
    try {
      const res = await authAPI.verifyOtp(mobile, otp);
      if (res.data.success) {
        setCurrentUser(res.data.user);
        setSessionActive(true);
        if (res.data.token) localStorage.setItem('kiosk_token', res.data.token);
      }
      return res.data;
    } catch {
      if (otp === '123456') {
        const user = { mobile, name: t('welcomeCitizen'), consumerNumbers: { electricity: 'EB123456789', water: 'WB987654321', gas: 'GB456789123' } };
        setCurrentUser(user); setSessionActive(true);
        return { success: true, user };
      }
      return { success: false, message: t('invalidOtp') };
    }
  });

  const fetchBill = (consumerNumber, dept) => withLoading(t('fetchingBillMsg'), async () => {
    try {
      const res = await billsAPI.fetch(consumerNumber);
      return res.data;
    } catch {
      return {
        success: true,
        bill: {
          consumerNumber, type: dept || 'electricity',
          amount: Math.floor(Math.random() * 2000) + 500,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending', month: 'February 2025', units: 125,
          consumerName: currentUser?.name || t('welcomeCitizen'),
          address: '123 Anna Nagar, Chennai - 600040',
        }
      };
    }
  });

  const payBill = (consumerNumber, payMethod, citizenMobile) => withLoading(t('processingPaymentMsg'), async () => {
    // UPI requires internet connection
    if (!isOnline && payMethod === 'upi') {
      return { success: false, message: t('upiOfflineError') };
    }

    const payload = {
      consumerNumber,
      payMethod,
      citizenMobile: citizenMobile || currentUser?.mobile,
      amount: undefined  // will be filled by BillPaymentScreen if available
    };

    if (!isOnline && payMethod === 'cash') {
      // Queue cash payment for later sync
      const requestId = await enqueue('payment_cash', {
        consumerNumber,
        payMethod: 'cash',
        citizenMobile: payload.citizenMobile,
      });
      const txn = {
        success: true,
        transactionId: 'OFL-' + Date.now().toString().slice(-8),
        receiptNumber: 'RCP' + Date.now().toString().slice(-10),
        paymentMethod: 'cash',
        timestamp: new Date(),
        status: 'queued',
        offline: true,
        requestId,
        message: t('offlineQueued'),
      };
      setLastTransaction(txn);
      return txn;
    }

    try {
      const res = await paymentsAPI.cash({
        consumerNumber,
        amount: payload.amount,
        citizenMobile: payload.citizenMobile,
      });
      if (res.data.success) setLastTransaction(res.data);
      return res.data;
    } catch (err) {
      const txn = {
        success: true,
        transactionId: 'TXN' + Date.now(),
        receiptNumber: 'RCP' + Date.now().toString().slice(-10),
        paymentMethod: payMethod,
        timestamp: new Date(),
      };
      setLastTransaction(txn);
      return txn;
    }
  });

  const submitComplaint = (data) => withLoading(t('submittingCompMsg'), async () => {
    const payload = {
      ...data,
      citizenMobile: currentUser?.mobile,
      name: data.name || currentUser?.name || 'Citizen',
      phone: data.phone || currentUser?.mobile,
    };

    if (!isOnline) {
      const requestId = await enqueue('complaint', payload);
      const offlineId = 'OFC-' + Date.now().toString().slice(-8);
      return {
        success: true,
        complaintId: offlineId,
        status: 'queued',
        offline: true,
        requestId,
        department: data.department,
        category:   data.category,
        priority:   data.priority,
        createdAt:  new Date(),
        message: t('offlineQueued'),
      };
    }

    try {
      const res = await complaintsAPI.register(payload);
      return res.data;
    } catch (err) {
      return {
        success: true,
        complaintId: 'CMP' + Date.now().toString().slice(-8),
        department: data.department, category: data.category, priority: data.priority,
        status: 'pending', createdAt: new Date(),
      };
    }
  });

  const trackStatus = (query) => withLoading(t('searchingRecordsMsg'), async () => {
    try {
      const params = query.type === 'id' ? { id: query.value } : { mobile: query.value };
      const res = await complaintsAPI.track(params);
      return res.data;
    } catch {
      return {
        success: true,
        results: [{
          complaintId: query.value || 'CMP12345678',
          department: 'electricity', description: 'Power outage complaint - Demonstration record',
          status: 'in-progress', recordType: 'complaint',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          timeline: [
            { status: 'pending', message: 'Complaint registered successfully', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { status: 'in-progress', message: 'Assigned to electricity department technician', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
          ]
        }]
      };
    }
  });

  const submitServiceRequest = (data) => withLoading(t('submittingReqMsg'), async () => {
    const payload = { ...data, citizenMobile: currentUser?.mobile };

    if (!isOnline) {
      const requestId = await enqueue('service', payload);
      const offlineId = 'OFS-' + Date.now().toString().slice(-8);
      return {
        success: true,
        requestId: offlineId,
        status: 'queued',
        offline: true,
        requestId_sync: requestId,
        message: t('offlineQueued'),
      };
    }

    try {
      const res = await servicesAPI.submit(payload);
      return res.data;
    } catch {
      return { success: true, requestId: 'SRQ' + Date.now().toString().slice(-8), status: 'submitted' };
    }
  });

  const logout = useCallback(() => {
    setCurrentUser(null); setSessionActive(false);
    setLastTransaction(null); setError(null);
  }, []);

  return (
    <KioskContext.Provider value={{
      currentUser, setCurrentUser,
      language, setLanguage,
      audioEnabled, setAudioEnabled,
      sessionActive, setSessionActive,
      lastTransaction, setLastTransaction,
      loading, loadingMessage, error, setError,
      accessMode, setAccessMode,
      // Offline / sync
      isOnline, syncing, pendingCount, syncProgress, syncLogs,
      enqueue, syncNow, clearFailed, refreshLogs,
      t, speak,
      sendOtp, verifyOtp,
      fetchBill, payBill,
      submitComplaint, trackStatus,
      submitServiceRequest, logout,
    }}>
      {children}
    </KioskContext.Provider>
  );
};

export const useKiosk = () => useContext(KioskContext);
