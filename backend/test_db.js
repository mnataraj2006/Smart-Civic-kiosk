const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully');
    const Citizen = require('./models/Citizen');
    const count = await Citizen.countDocuments();
    console.log('Citizen count:', count);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
