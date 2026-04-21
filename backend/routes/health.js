const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  bookAppointment,
  registerVaccination,
  enrollScheme,
  requestMedicalCertificate,
  fileSanitationComplaint,
  fileGrievance
} = require('../controllers/healthController');

// All health service routes are protected (require JWT)
router.post('/appointment',           verifyToken, bookAppointment);
router.post('/vaccination',           verifyToken, registerVaccination);
router.post('/scheme',                verifyToken, enrollScheme);
router.post('/medical-certificate',   verifyToken, requestMedicalCertificate);
router.post('/sanitation-complaint',  verifyToken, fileSanitationComplaint);
router.post('/grievance',             verifyToken, fileGrievance);

module.exports = router;
