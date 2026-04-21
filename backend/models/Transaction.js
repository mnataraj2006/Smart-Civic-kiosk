const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true },
  citizenMobile: { type: String, required: true },
  type: { 
    type: String,
    enum: ['bill_payment', 'service_request', 'complaint'],
    required: true
  },
  department: { type: String },
  amount: { type: Number, default: 0 },
  consumerNumber: { type: String },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cash', 'none'], default: 'none' },
  status: { 
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  receiptNumber: { type: String },
  referenceId: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now().toString();
  }
  if (!this.receiptNumber) {
    this.receiptNumber = 'RCP' + Date.now().toString().slice(-10);
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
