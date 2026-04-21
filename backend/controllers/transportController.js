const {
  License,
  LearnerLicense,
  Vehicle,
  DuplicateRC,
  TrafficFine,
  AddressChange,
  LicenseRenewal
} = require('../models/Transport');

// Helper: generate ref numbers
const genRef = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

// ─── GET /api/transport/license-status/:licenseId ────────────────────────────
exports.getLicenseStatus = async (req, res, next) => {
  try {
    const { licenseId } = req.params;
    if (!licenseId) return res.status(400).json({ success: false, error: 'License ID is required.' });

    const license = await License.findOne({ licenseId });
    if (!license) {
      return res.status(404).json({ success: false, error: 'License not found.' });
    }
    res.json({ success: true, message: 'License status retrieved.', data: license });
  } catch (err) { next(err); }
};

// ─── POST /api/transport/learner-license ─────────────────────────────────────
exports.applyLearnerLicense = async (req, res, next) => {
  try {
    const { applicantName, phone, dob, address, vehicleClass, testDate } = req.body;
    if (!applicantName || !phone || !dob || !address || !vehicleClass) {
      return res.status(400).json({ success: false, error: 'All required fields must be filled.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const applicationNumber = genRef('LL');
    const application = await LearnerLicense.create({
      applicantName, phone, dob, address, vehicleClass, testDate, applicationNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'Learner license application submitted successfully.',
      data: application
    });
  } catch (err) { next(err); }
};

// ─── GET /api/transport/vehicle-status/:vehicleNumber ────────────────────────
exports.getVehicleStatus = async (req, res, next) => {
  try {
    const { vehicleNumber } = req.params;
    if (!vehicleNumber) return res.status(400).json({ success: false, error: 'Vehicle number is required.' });

    const vehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found in registry.' });
    }
    res.json({ success: true, message: 'Vehicle status retrieved.', data: vehicle });
  } catch (err) { next(err); }
};

// ─── POST /api/transport/duplicate-rc ────────────────────────────────────────
exports.requestDuplicateRC = async (req, res, next) => {
  try {
    const { vehicleNumber, ownerName, phone, reason } = req.body;
    if (!vehicleNumber || !ownerName || !phone || !reason) {
      return res.status(400).json({ success: false, error: 'All required fields must be filled.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const requestNumber = genRef('DRC');
    const request = await DuplicateRC.create({
      vehicleNumber, ownerName, phone, reason, requestNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'Duplicate RC request submitted successfully.',
      data: request
    });
  } catch (err) { next(err); }
};

// ─── POST /api/transport/pay-fine ────────────────────────────────────────────
exports.payTrafficFine = async (req, res, next) => {
  try {
    const { vehicleNumber, phone, fineAmount, violation, ownerName } = req.body;
    if (!vehicleNumber || !phone || !fineAmount) {
      return res.status(400).json({ success: false, error: 'vehicleNumber, phone, and fineAmount are required.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    if (Number(fineAmount) <= 0) {
      return res.status(400).json({ success: false, error: 'Fine amount must be a positive value.' });
    }
    const transactionId = genRef('TXN');
    const fine = await TrafficFine.create({
      vehicleNumber, ownerName, phone, fineAmount, violation, transactionId, status: 'paid'
    });
    res.status(201).json({
      success: true,
      message: `Traffic fine of ₹${fineAmount} paid successfully.`,
      data: fine
    });
  } catch (err) { next(err); }
};

// ─── PUT /api/transport/update-address ───────────────────────────────────────
exports.updateVehicleAddress = async (req, res, next) => {
  try {
    const { vehicleNumber, ownerName, phone, oldAddress, newAddress } = req.body;
    if (!vehicleNumber || !ownerName || !phone || !newAddress) {
      return res.status(400).json({ success: false, error: 'vehicleNumber, ownerName, phone, and newAddress are required.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const requestNumber = genRef('AC');
    const change = await AddressChange.create({
      vehicleNumber, ownerName, phone, oldAddress, newAddress, requestNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'Address change request submitted successfully.',
      data: change
    });
  } catch (err) { next(err); }
};

// ─── POST /api/transport/license-renewal ─────────────────────────────────────
exports.renewLicense = async (req, res, next) => {
  try {
    const { applicantName, phone, licenseId, dob, vehicleClass, address, expiryDate, renewalDate } = req.body;
    if (!applicantName || !phone || !licenseId || !dob || !vehicleClass || !address) {
      return res.status(400).json({
        success: false,
        error: 'applicantName, phone, licenseId, dob, vehicleClass, and address are required.'
      });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Phone must be 10 digits.' });
    }
    const applicationNumber = genRef('LR');
    const renewal = await LicenseRenewal.create({
      applicantName, phone, licenseId, dob, vehicleClass, address,
      expiryDate, renewalDate, applicationNumber, status: 'pending'
    });
    res.status(201).json({
      success: true,
      message: 'License renewal application submitted successfully.',
      data: renewal
    });
  } catch (err) { next(err); }
};
