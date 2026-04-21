const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/verifyToken');
const authMiddleware = require('../middleware/authMiddleware');

// ─── GET /api/transactions  (admin only, with pagination) ─────────────────────
router.get('/', authMiddleware(['admin']), async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments()
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
});

// ─── GET /api/transactions/mobile/:mobile  (citizen — own transactions) ───────
router.get('/mobile/:mobile', verifyToken, async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50,  parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ citizenMobile: req.params.mobile }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments({ citizenMobile: req.params.mobile })
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
});

// ─── GET /api/transactions/:transactionId ─────────────────────────────────────
router.get('/:transactionId', verifyToken, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ transactionId: req.params.transactionId });
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found.' });
    }
    res.json({ success: true, transaction });
  } catch (err) { next(err); }
});

module.exports = router;
