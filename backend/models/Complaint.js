const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  phone:         { type: String, required: true, trim: true },
  address:       { type: String, required: true, trim: true },
  department:    { type: String, required: true, trim: true },
  service:       { type: String, trim: true, default: '' },
  complaintText: { type: String, required: true, trim: true },

  // Idempotency: offline sync sends this to prevent duplicate entries
  requestId: { type: String },

  // Legacy fields kept for backward-compatibility
  citizen_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' },
  consumer_number: { type: String },
  issue:           { type: String },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },

  createdAt:  { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }   // legacy alias
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
complaintSchema.index({ phone: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ requestId: 1 }, { unique: true, sparse: true }); // dedup

module.exports = mongoose.model('Complaint', complaintSchema);
