const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// In-memory OTP Store: Map<phone, { otp, expiresAt, attempts }>
const otpStore = new Map();

// Twilio client (lazy-loaded when credentials exist)
let twilioClient = null;
const getTwilioClient = () => {
  if (twilioClient) return twilioClient;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN &&
      TWILIO_ACCOUNT_SID.startsWith('AC')) {
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile, phone } = req.body;
    const phoneNumber = mobile || phone;

    // Validation
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number. Must be exactly 10 digits.'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiry and attempt tracking
    otpStore.set(phoneNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);

    // Send via Twilio if credentials present
    const client = getTwilioClient();
    if (client && process.env.TWILIO_PHONE) {
      await client.messages.create({
        body: `Your Smart Civic Kiosk OTP is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
        from: process.env.TWILIO_PHONE,
        to: `+91${phoneNumber}`
      });
      return res.json({
        success: true,
        message: 'OTP sent successfully via SMS.'
      });
    }

    // Demo mode — return OTP in response for development/testing
    res.json({
      success: true,
      message: 'OTP sent successfully (demo mode)',
      demoOtp: otp
    });

  } catch (err) {
    console.error('send-otp error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send OTP. Please try again.' });
  }
});

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, phone, otp } = req.body;
    const phoneNumber = mobile || phone;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, error: 'Phone and OTP are required.' });
    }

    const stored = otpStore.get(phoneNumber);

    if (!stored) {
      return res.status(400).json({ success: false, error: 'OTP not found. Please request a new OTP.' });
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ success: false, error: 'OTP expired. Please request a new OTP.' });
    }

    // Increment attempt counter
    stored.attempts += 1;

    // Check max attempts
    if (stored.attempts > 3) {
      otpStore.delete(phoneNumber);
      return res.status(429).json({ success: false, error: 'Too many attempts. Please request a new OTP.' });
    }

    // Validate OTP
    if (stored.otp !== otp.toString()) {
      const remaining = 3 - stored.attempts;
      return res.status(400).json({
        success: false,
        error: `Invalid OTP. ${remaining} attempt(s) remaining.`
      });
    }

    // OTP valid — clean up store
    otpStore.delete(phoneNumber);

    // Find or create citizen
    const Citizen = require('../models/Citizen');
    let citizen = await Citizen.findOne({ phone: phoneNumber });
    if (!citizen) {
      citizen = await Citizen.create({
        phone: phoneNumber,
        name: 'New Citizen',
        address: 'Address not set',
        departments: []
      });
    }

    // Map departments to consumerNumbers for frontend
    const consumerNumbers = {};
    if (citizen.departments && citizen.departments.length > 0) {
      citizen.departments.forEach(dept => {
        const key = dept.department.toLowerCase();
        consumerNumbers[key] = dept.consumer_number;
      });
    }

    // Generate JWT (1 hour)
    const token = jwt.sign(
      { id: citizen._id, phone: phoneNumber },
      process.env.JWT_SECRET || 'SmartCivicKiosk2024SecretKey',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      token,
      user: {
        id: citizen._id,
        mobile: citizen.phone,
        name: citizen.name,
        consumerNumbers
      }
    });

  } catch (err) {
    console.error('verify-otp error:', err.message);
    res.status(500).json({ success: false, error: 'Server error during verification.' });
  }
});

module.exports = router;
