const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  departments: [
    {
      department: { type: String, required: true },
      consumer_number: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Citizen', citizenSchema);
