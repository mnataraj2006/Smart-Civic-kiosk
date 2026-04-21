const Complaint = require('../models/Complaint');
const Citizen   = require('../models/Citizen');
const { sendComplaintEmail } = require('../services/emailService');

const registerComplaint = async (req, res) => {
  try {
    let {
      name, phone, address, department, service,
      complaintText, mobile, category, description, issue,
      requestId   // ← idempotency key sent by offline sync
    } = req.body;

    // Aliases for frontend compatibility
    phone         = phone || mobile;
    service       = service || category || 'General';
    complaintText = complaintText || description || issue;

    // ── Idempotency: if this requestId was already processed, return 409 ──────
    if (requestId) {
      const existing = await Complaint.findOne({ requestId });
      if (existing) {
        console.log(`⚠️ [ComplaintController] Duplicate requestId ${requestId} — skipping`);
        return res.status(409).json({
          success:     true,
          duplicate:   true,
          message:     'Complaint already registered (duplicate request ignored).',
          complaintId: existing._id
        });
      }
    }

    // Enrichment: If name/address missing, fetch from Citizen profile
    if (phone && (!name || !address)) {
      const citizen = await Citizen.findOne({ phone: phone.trim() });
      if (citizen) {
        name    = name    || citizen.name;
        address = address || citizen.address;
      }
    }

    // ── Relaxed validation for offline sync (name/address may be minimal) ────
    const isOfflineSync = req.headers['x-offline-sync'] === 'true';

    const errors = [];
    if (!name?.trim())         errors.push('name is required');
    if (!phone?.trim() || !/^\d{10}$/.test(phone.trim()))
                                errors.push('phone must be numeric and 10 digits');
    if (!address?.trim() && !isOfflineSync)
                                errors.push('address is required');
    if (!department?.trim())   errors.push('department is required');
    if (!complaintText?.trim()) errors.push('complaintText is required');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
    }

    // Save to DB
    const complaint = new Complaint({
      name:          name.trim(),
      phone:         phone.trim(),
      address:       (address || 'Offline submission').trim(),
      department:    department.trim(),
      service:       (service || 'General').trim(),
      complaintText: complaintText.trim(),
      issue:         complaintText.trim(), // legacy sync
      requestId:     requestId || undefined,
      status:        'Pending'
    });

    await complaint.save();
    console.log(`✅ [ComplaintController] Saved ID: ${complaint._id}${requestId ? ` (requestId: ${requestId})` : ''}`);

    // Trigger Email (Fire and forget)
    sendComplaintEmail(complaint).catch(err => console.error('❌ [Email Error]:', err.message));

    return res.status(201).json({
      success:     true,
      message:     'Complaint registered successfully',
      complaintId: complaint._id
    });

  } catch (err) {
    // Mongoose duplicate key on requestId — treat same as 409
    if (err.code === 11000 && err.keyPattern?.requestId) {
      return res.status(409).json({
        success: true, duplicate: true,
        message: 'Complaint already registered (duplicate key).'
      });
    }
    console.error('❌ [Critical Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { registerComplaint };
