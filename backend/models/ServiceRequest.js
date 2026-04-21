const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  citizenMobile: { type: String, required: true },
  department: { type: String, required: true },
  serviceType: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['submitted', 'under-review', 'in-progress', 'completed', 'rejected'],
    default: 'submitted'
  },
  timeline: [{
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

serviceRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    this.requestId = 'SRQ' + Date.now().toString().slice(-8);
  }
  this.timeline.push({
    status: 'submitted',
    message: 'Service request submitted successfully',
    timestamp: new Date()
  });
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
