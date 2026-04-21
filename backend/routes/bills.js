const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/verifyToken');

// ─── GET /api/bills/:consumerNumber ──────────────────────────────────────────
router.get('/:consumerNumber', async (req, res, next) => {
  try {
    const { consumerNumber } = req.params;
    if (!consumerNumber || !consumerNumber.trim()) {
      return res.status(400).json({ success: false, error: 'Consumer number is required.' });
    }
    const bill = await Bill.findOne({ consumerNumber: consumerNumber.trim(), status: 'pending' });
    if (!bill) {
      return res.status(404).json({ success: false, error: 'No pending bill found for this consumer number.' });
    }
    res.json({ success: true, bill });
  } catch (err) { next(err); }
});

// ─── POST /api/bills/pay ──────────────────────────────────────────────────────
// Atomic: marks bill as paid + creates transaction in one MongoDB session
router.post('/pay', verifyToken, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { consumerNumber, amount, paymentMethod, citizenMobile } = req.body;

    // Validation
    if (!consumerNumber || !amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: 'consumerNumber and amount are required.' });
    }
    if (Number(amount) <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: 'Amount must be a positive number.' });
    }

    // Find pending bill
    const bill = await Bill.findOne({ consumerNumber, status: 'pending' }).session(session);
    if (!bill) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: 'No pending bill found for this consumer number.' });
    }

    // Generate IDs
    const transactionId = 'TXN' + Date.now();
    const receiptNumber = 'RCP' + Date.now().toString().slice(-10);

    // Mark bill as paid
    bill.status = 'paid';
    await bill.save({ session });

    // Create transaction record
    const txn = await Transaction.create([{
      transactionId,
      citizenMobile: citizenMobile || req.user?.phone || 'unknown',
      type: 'bill_payment',
      amount: Number(amount),
      consumerNumber,
      paymentMethod: paymentMethod || 'upi',
      status: 'success',
      receiptNumber,
      description: `Bill payment for ${consumerNumber} — ${bill.type}`
    }], { session });

    await session.commitTransaction();
    session.endSession();

    console.log(`💳 [Payment] TXN ${transactionId} — ₹${amount} for ${consumerNumber}`);

    res.json({
      success: true,
      message: 'Payment successful',
      transactionId,
      receiptNumber,
      amount: Number(amount),
      consumerNumber,
      billType: bill.type,
      timestamp: new Date()
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
});

module.exports = router;
