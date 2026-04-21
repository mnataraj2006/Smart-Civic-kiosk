const mongoose = require('mongoose');

// ─── Hospital Appointment ─────────────────────────────────────────────────────
const appointmentSchema = new mongoose.Schema({
  patientName:     { type: String, required: true },
  phone:           { type: String, required: true },
  hospitalName:    { type: String, required: true },
  department:      { type: String },
  doctorName:      { type: String },
  appointmentDate: { type: String, required: true },
  timeSlot:        { type: String },
  appointmentNumber:{ type: String },
  serviceType:     { type: String, default: 'hospital_appointment' },
  status:          { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

// ─── Vaccination Registration ─────────────────────────────────────────────────
const vaccinationSchema = new mongoose.Schema({
  patientName:       { type: String, required: true },
  phone:             { type: String, required: true },
  age:               { type: Number },
  vaccineName:       { type: String, required: true },
  dose:              { type: String },
  preferredDate:     { type: String },
  preferredCenter:   { type: String },
  registrationNumber:{ type: String },
  serviceType:       { type: String, default: 'vaccination' },
  status:            { type: String, enum: ['pending', 'approved', 'completed'], default: 'pending' }
}, { timestamps: true });

// ─── Health Scheme Enrollment ─────────────────────────────────────────────────
const schemeSchema = new mongoose.Schema({
  applicantName:  { type: String, required: true },
  phone:          { type: String, required: true },
  schemeName:     { type: String, required: true },
  aadharNumber:   { type: String },
  income:         { type: Number },
  enrollmentNumber:{ type: String },
  serviceType:    { type: String, default: 'health_scheme' },
  status:         { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// ─── Medical Certificate ─────────────────────────────────────────────────────
const medCertSchema = new mongoose.Schema({
  patientName:     { type: String, required: true },
  phone:           { type: String, required: true },
  purpose:         { type: String, required: true },
  doctor:          { type: String },
  hospital:        { type: String },
  certificateNumber:{ type: String },
  serviceType:     { type: String, default: 'medical_certificate' },
  status:          { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// ─── Sanitation Complaint ─────────────────────────────────────────────────────
const sanitationSchema = new mongoose.Schema({
  patientName:      { type: String, required: true },
  phone:            { type: String, required: true },
  complaintDetails: { type: String, required: true },
  location:         { type: String },
  complaintNumber:  { type: String },
  serviceType:      { type: String, default: 'sanitation_complaint' },
  status:           { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending' }
}, { timestamps: true });

// ─── Public Health Grievance ──────────────────────────────────────────────────
const grievanceSchema = new mongoose.Schema({
  patientName:      { type: String, required: true },
  phone:            { type: String, required: true },
  complaintDetails: { type: String, required: true },
  hospitalName:     { type: String },
  grievanceNumber:  { type: String },
  serviceType:      { type: String, default: 'health_grievance' },
  status:           { type: String, enum: ['pending', 'in_progress', 'resolved'], default: 'pending' }
}, { timestamps: true });

module.exports = {
  HealthAppointment: mongoose.model('HealthAppointment', appointmentSchema),
  Vaccination:       mongoose.model('Vaccination', vaccinationSchema),
  HealthScheme:      mongoose.model('HealthScheme', schemeSchema),
  MedicalCertificate:mongoose.model('MedicalCertificate', medCertSchema),
  SanitationComplaint:mongoose.model('SanitationComplaint', sanitationSchema),
  HealthGrievance:   mongoose.model('HealthGrievance', grievanceSchema)
};
