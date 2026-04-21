const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/verifyToken');

// ─────────────────────────────────────────────────────────────────────────────
// Razorpay integration
// Install:  npm install razorpay
// Add to .env: RAZORPAY_KEY_ID=rzp_test_xxx  RAZORPAY_KEY_SECRET=xxxxxxxx
// ─────────────────────────────────────────────────────────────────────────────
let razorpay = null;
try {
  const Razorpay = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized');
  } else {
    console.log('ℹ️  Razorpay keys not set — running in demo mode');
  }
} catch {
  console.log('ℹ️  Razorpay package not installed — running in demo mode');
}

// ── POST /api/payments/initiate ──────────────────────────────────────────────
// Create a Razorpay order for UPI payment
router.post('/initiate', verifyToken, async (req, res, next) => {
  try {
    const { consumerNumber, amount, citizenMobile } = req.body;

    if (!consumerNumber || !amount) {
      return res.status(400).json({ success: false, error: 'consumerNumber and amount are required.' });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be positive.' });
    }

    // Verify bill exists and is pending
    const bill = await Bill.findOne({ consumerNumber, status: 'pending' });
    if (!bill) {
      return res.status(404).json({ success: false, error: 'No pending bill found for this consumer number.' });
    }

    if (razorpay) {
      // Real Razorpay order
      const order = await razorpay.orders.create({
        amount:   Math.round(Number(amount) * 100), // paise
        currency: 'INR',
        receipt:  `rcpt_${consumerNumber}_${Date.now()}`,
        notes:    { consumerNumber, citizenMobile: citizenMobile || '' }
      });
      return res.json({
        success:    true,
        orderId:    order.id,
        amount:     order.amount,
        currency:   order.currency,
        keyId:      process.env.RAZORPAY_KEY_ID,
        consumerNumber,
        mode:       'razorpay'
      });
    }

    // Demo mode — return a fake order so frontend can display QR
    const demoOrderId = 'order_demo_' + Date.now();
    return res.json({
      success:      true,
      orderId:      demoOrderId,
      amount:       Math.round(Number(amount) * 100),
      currency:     'INR',
      upiId:        'smartcivic@upi',
      qrPayload:    `upi://pay?pa=smartcivic@upi&pn=SmartCivicKiosk&am=${amount}&cu=INR&tn=${consumerNumber}`,
      consumerNumber,
      mode:         'demo'
    });
  } catch (err) { next(err); }
});

// ── POST /api/payments/verify ─────────────────────────────────────────────────
// Verify Razorpay signature and atomically complete payment
router.post('/verify', verifyToken, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      consumerNumber, amount, citizenMobile
    } = req.body;

    // ── Signature verification (skip in demo mode) ──────────────────────────
    if (razorpay && process.env.RAZORPAY_KEY_SECRET && razorpay_order_id && razorpay_payment_id) {
      const body      = razorpay_order_id + '|' + razorpay_payment_id;
      const expected  = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                              .update(body).digest('hex');
      if (expected !== razorpay_signature) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ success: false, error: 'Payment verification failed. Invalid signature.' });
      }
    }

    // ── Atomic: mark bill paid + create transaction ─────────────────────────
    const bill = await Bill.findOne({ consumerNumber, status: 'pending' }).session(session);
    if (!bill) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ success: false, error: 'Bill not found or already paid.' });
    }

    const transactionId = razorpay_payment_id || ('TXN' + Date.now());
    const receiptNumber = 'RCP' + Date.now().toString().slice(-10);

    bill.status = 'paid';
    await bill.save({ session });

    const [txn] = await Transaction.create([{
      transactionId,
      citizenMobile:  citizenMobile || req.user?.phone || 'unknown',
      type:           'bill_payment',
      amount:         Number(amount),
      consumerNumber,
      paymentMethod:  'upi',
      status:         'success',
      receiptNumber,
      description:    `UPI payment for ${consumerNumber} — ${bill.type}`
    }], { session });

    await session.commitTransaction();
    session.endSession();

    console.log(`💳 [UPI Payment] TXN ${transactionId} — ₹${amount} for ${consumerNumber}`);

    res.json({
      success: true, message: 'Payment verified and completed',
      transactionId, receiptNumber,
      amount: Number(amount), consumerNumber, billType: bill.type,
      paymentMethod: 'upi', timestamp: new Date()
    });
  } catch (err) {
    await session.abortTransaction(); session.endSession();
    next(err);
  }
});

// ── POST /api/payments/cash ───────────────────────────────────────────────────
// Mark bill as paid via cash (called when operator confirms)
router.post('/cash', verifyToken, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { consumerNumber, amount, citizenMobile } = req.body;

    // Idempotency: check X-Request-Id header from offline sync
    const idempotencyKey = req.headers['x-request-id'];

    if (!consumerNumber || !amount) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, error: 'consumerNumber and amount are required.' });
    }

    // Check for duplicate by idempotency key
    if (idempotencyKey) {
      const existing = await Transaction.findOne({ transactionId: idempotencyKey });
      if (existing) {
        await session.abortTransaction(); session.endSession();
        return res.status(409).json({
          success:       true,
          duplicate:     true,
          message:       'Cash payment already recorded (duplicate ignored).',
          transactionId: existing.transactionId,
          receiptNumber: existing.receiptNumber,
        });
      }
    }

    const bill = await Bill.findOne({ consumerNumber, status: 'pending' }).session(session);
    if (!bill) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ success: false, error: 'No pending bill found for this consumer number.' });
    }

    const transactionId = idempotencyKey || ('CSH' + Date.now());
    const receiptNumber = 'RCP' + Date.now().toString().slice(-10);

    bill.status = 'paid';
    await bill.save({ session });

    await Transaction.create([{
      transactionId,
      citizenMobile:  citizenMobile || req.user?.phone || 'unknown',
      type:           'bill_payment',
      amount:         Number(amount),
      consumerNumber,
      paymentMethod:  'cash',
      status:         'success',
      receiptNumber,
      description:    `Cash payment for ${consumerNumber} — ${bill.type}`
    }], { session });

    await session.commitTransaction();
    session.endSession();

    console.log(`💵 [Cash Payment] TXN ${transactionId} — ₹${amount} for ${consumerNumber}`);

    res.json({
      success: true, message: 'Cash payment confirmed',
      transactionId, receiptNumber,
      amount: Number(amount), consumerNumber, billType: bill.type,
      paymentMethod: 'cash', timestamp: new Date()
    });
  } catch (err) {
    await session.abortTransaction(); session.endSession();
    next(err);
  }
});


module.exports = router;
