const express    = require('express');
const router     = express.Router();
const Complaint  = require('../models/Complaint');
const { registerComplaint } = require('../controllers/complaintController');
const verifyToken = require('../middleware/verifyToken');
const authMiddleware = require('../middleware/authMiddleware');

// ─── POST /api/complaints  (protected — must be authenticated) ────────────────
router.post('/', verifyToken, registerComplaint);

// ─── GET /api/complaints/track ────────────────────────────────────────────────
router.get('/track', async (req, res, next) => {
  const { id, mobile, phone } = req.query;
  const searchPhone = phone || mobile;
  try {
    let results = [];
    if (id) {
      const c = await Complaint.findById(id);
      if (c) results.push(c);
    } else if (searchPhone) {
      results = await Complaint.find({ phone: searchPhone }).sort({ createdAt: -1 }).limit(20);
    }

    const formatted = results.map(c => ({
      complaintId: c._id,
      department:  c.department,
      description: c.complaintText || c.issue,
      status:      (c.status || 'Pending').toLowerCase(),
      createdAt:   c.createdAt || c.created_at,
      recordType:  'complaint',
      timeline: [{ status: 'pending', message: 'Complaint registered', timestamp: c.createdAt }]
    }));

    res.json({ success: true, results: formatted });
  } catch (err) { next(err); }
});

// ─── GET /api/complaints  (admin — paginated) ─────────────────────────────────
router.get('/', authMiddleware(['admin']), async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    // Optional filters
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status)     filter.status     = req.query.status;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Complaint.countDocuments(filter)
    ]);

    res.json({
      success: true,
      complaints,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
});

// ─── GET /api/complaints/:phone  (citizen lookup by phone) ────────────────────
router.get('/:phone', verifyToken, async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) { next(err); }
});

// ─── PUT /api/complaints/:id  (admin — update status) ────────────────────────
router.put('/:id', authMiddleware(['admin']), async (req, res, next) => {
  const { status } = req.body;
  try {
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id, { status }, { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: 'Complaint not found.' });
    res.json({ success: true, complaint: updated });
  } catch (err) { next(err); }
});

module.exports = router;
