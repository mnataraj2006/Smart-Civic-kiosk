const mongoose = require('mongoose');

// ─── Driving License ──────────────────────────────────────────────────────────
const licenseSchema = new mongoose.Schema({
  licenseId:   { type: String, required: true, unique: true, index: true },
  ownerName:   { type: String, required: true },
  phone:       { type: String, required: true, index: true },
  dob:         { type: String },
  address:     { type: String },
  vehicleClass:{ type: String },
  status:      { type: String, enum: ['active', 'expired', 'suspended', 'pending'], default: 'pending' },
  expiryDate:  { type: String }
}, { timestamps: true });

// ─── Learner License Application ─────────────────────────────────────────────
const learnerLicenseSchema = new mongoose.Schema({
  applicantName:    { type: String, required: true },
  phone:            { type: String, required: true },
  dob:              { type: String, required: true },
  address:          { type: String, required: true },
  vehicleClass:     { type: String, required: true },
  testDate:         { type: String },
  applicationNumber:{ type: String },
  status:           { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// ─── Vehicle Registration ─────────────────────────────────────────────────────
const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true, index: true },
  ownerName:     { type: String, required: true },
  phone:         { type: String, index: true },
  vehicleType:   { type: String },
  engineNumber:  { type: String },
  chassisNumber: { type: String },
  address:       { type: String },
  status:        { type: String, enum: ['registered', 'suspended', 'pending', 'expired'], default: 'registered' }
}, { timestamps: true });

// ─── Duplicate RC Request ─────────────────────────────────────────────────────
const duplicateRCSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  ownerName:     { type: String, required: true },
  phone:         { type: String, required: true },
  reason:        { type: String, required: true },
  requestNumber: { type: String },
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// ─── Traffic Fine ─────────────────────────────────────────────────────────────
const trafficFineSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  ownerName:     { type: String },
  phone:         { type: String, required: true },
  fineAmount:    { type: Number, required: true },
  violation:     { type: String },
  transactionId: { type: String },
  status:        { type: String, enum: ['pending', 'paid'], default: 'pending' }
}, { timestamps: true });

// ─── Address Change ───────────────────────────────────────────────────────────
const addressChangeSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  ownerName:     { type: String, required: true },
  phone:         { type: String, required: true },
  oldAddress:    { type: String },
  newAddress:    { type: String, required: true },
  requestNumber: { type: String },
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// ─── License Renewal ──────────────────────────────────────────────────────────
const licenseRenewalSchema = new mongoose.Schema({
  applicantName:    { type: String, required: true },
  phone:            { type: String, required: true },
  licenseId:        { type: String, required: true },
  dob:              { type: String, required: true },
  vehicleClass:     { type: String, required: true },
  address:          { type: String, required: true },
  expiryDate:       { type: String },           // current expiry date
  renewalDate:      { type: String },           // preferred renewal date
  applicationNumber:{ type: String },
  status:           { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = {
  License:         mongoose.model('License', licenseSchema),
  LearnerLicense:  mongoose.model('LearnerLicense', learnerLicenseSchema),
  Vehicle:         mongoose.model('Vehicle', vehicleSchema),
  DuplicateRC:     mongoose.model('DuplicateRC', duplicateRCSchema),
  TrafficFine:     mongoose.model('TrafficFine', trafficFineSchema),
  AddressChange:   mongoose.model('AddressChange', addressChangeSchema),
  LicenseRenewal:  mongoose.model('LicenseRenewal', licenseRenewalSchema)
};
