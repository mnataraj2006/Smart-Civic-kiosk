const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  consumerNumber: { type: String, required: true },
  type: {
    type: String,
    enum: ['electricity', 'water', 'gas', 'municipal'],
    required: true
  },
  amount: { type: Number, required: true, min: [0, 'Amount must be non-negative'] },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  month:        { type: String },
  units:        { type: Number },
  consumerName: { type: String },
  address:      { type: String },
  createdAt:    { type: Date, default: Date.now }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
billSchema.index({ consumerNumber: 1, status: 1 });
billSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Bill', billSchema);
