const {
  HealthAppointment,
  Vaccination,
  HealthScheme,
  MedicalCertificate,
  SanitationComplaint,
  HealthGrievance
} = require('../models/Health');

// Helper: generate ref numbers
const genRef = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

// ─── POST /api/health/appointment ────────────────────────────────────────────
exports.bookAppointment = async (req, res, next) => {
  try {
    const { patientName, phone, hospitalName, department, doctorName, appointmentDate, timeSlot } = req.body;
    if (!patientName || !phone || !hospitalName || !appointmentDate) {
      return res.status(400).json({ success: false, error: 'patientName, phone, hospitalName, and appointmentDate are required.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const appointmentNumber = genRef('APT');
    const appointment = await HealthAppointment.create({
      patientName, phone, hospitalName, department, doctorName,
      appointmentDate, timeSlot, appointmentNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'Hospital appointment booked successfully.',
      data: appointment
    });
  } catch (err) { next(err); }
};

// ─── POST /api/health/vaccination ────────────────────────────────────────────
exports.registerVaccination = async (req, res, next) => {
  try {
    const { patientName, phone, vaccineName, age, dose, preferredDate, preferredCenter } = req.body;
    if (!patientName || !phone || !vaccineName) {
      return res.status(400).json({ success: false, error: 'patientName, phone, and vaccineName are required.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const registrationNumber = genRef('VAC');
    const record = await Vaccination.create({
      patientName, phone, vaccineName, age, dose, preferredDate,
      preferredCenter, registrationNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'Vaccination registration successful.',
      data: record
    });
  } catch (err) { next(err); }
};

// ─── POST /api/health/scheme ──────────────────────────────────────────────────
exports.enrollScheme = async (req, res, next) => {
  try {
    const { applicantName, phone, schemeName, aadharNumber, income } = req.body;
    if (!applicantName || !phone || !schemeName) {
      return res.status(400).json({ success: false, error: 'applicantName, phone, and schemeName are required.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const enrollmentNumber = genRef('SCH');
    const enrollment = await HealthScheme.create({
      applicantName, phone, schemeName, aadharNumber, income, enrollmentNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'Health scheme enrollment submitted successfully.',
      data: enrollment
    });
  } catch (err) { next(err); }
};

// ─── POST /api/health/medical-certificate ────────────────────────────────────
exports.requestMedicalCertificate = async (req, res, next) => {
  try {
    const { patientName, phone, purpose, doctor, hospital } = req.body;
    if (!patientName || !phone || !purpose) {
      return res.status(400).json({ success: false, error: 'patientName, phone, and purpose are required.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const certificateNumber = genRef('MC');
    const cert = await MedicalCertificate.create({
      patientName, phone, purpose, doctor, hospital, certificateNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'Medical certificate request submitted successfully.',
      data: cert
    });
  } catch (err) { next(err); }
};

// ─── POST /api/health/sanitation-complaint ───────────────────────────────────
exports.fileSanitationComplaint = async (req, res, next) => {
  try {
    const { patientName, phone, complaintDetails, location } = req.body;
    if (!patientName || !phone || !complaintDetails) {
      return res.status(400).json({ success: false, error: 'patientName, phone, and complaintDetails are required.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const complaintNumber = genRef('SAN');
    const complaint = await SanitationComplaint.create({
      patientName, phone, complaintDetails, location, complaintNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'Sanitation complaint filed successfully.',
      data: complaint
    });
  } catch (err) { next(err); }
};

// ─── POST /api/health/grievance ───────────────────────────────────────────────
exports.fileGrievance = async (req, res, next) => {
  try {
    const { patientName, phone, complaintDetails, hospitalName } = req.body;
    if (!patientName || !phone || !complaintDetails) {
      return res.status(400).json({ success: false, error: 'patientName, phone, and complaintDetails are required.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const grievanceNumber = genRef('GRV');
    const grievance = await HealthGrievance.create({
      patientName, phone, complaintDetails, hospitalName, grievanceNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'Health grievance filed successfully.',
      data: grievance
    });
  } catch (err) { next(err); }
};
