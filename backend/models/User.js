const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  name: { type: String, default: 'Citizen' },
  email: { type: String, default: '' },
  consumerNumbers: {
    electricity: { type: String, default: '' },
    water: { type: String, default: '' },
    gas: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
