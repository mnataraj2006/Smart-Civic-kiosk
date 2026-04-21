const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getLicenseStatus,
  applyLearnerLicense,
  getVehicleStatus,
  requestDuplicateRC,
  payTrafficFine,
  updateVehicleAddress,
  renewLicense
} = require('../controllers/transportController');

// Public routes (read-only lookups)
router.get('/license-status/:licenseId', getLicenseStatus);
router.get('/vehicle-status/:vehicleNumber', getVehicleStatus);

// Protected routes (require JWT)
router.post('/learner-license',   verifyToken, applyLearnerLicense);
router.post('/duplicate-rc',      verifyToken, requestDuplicateRC);
router.post('/pay-fine',          verifyToken, payTrafficFine);
router.put('/update-address',     verifyToken, updateVehicleAddress);
router.post('/license-renewal',   verifyToken, renewLicense);

module.exports = router;
