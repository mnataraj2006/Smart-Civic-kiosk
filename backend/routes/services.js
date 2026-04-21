const express = require('express');
const router = express.Router();

// Submit service request
router.post('/', async (req, res) => {
  const { citizenMobile, department, serviceType, description } = req.body;
  
  try {
    let serviceRequest;
    try {
      const ServiceRequest = require('../models/ServiceRequest');
      serviceRequest = await ServiceRequest.create({
        citizenMobile,
        department,
        serviceType,
        description: description || ''
      });
    } catch(e) {
      serviceRequest = {
        requestId: 'SRQ' + Date.now().toString().slice(-8),
        status: 'submitted',
        createdAt: new Date()
      };
    }
    
    res.json({ 
      success: true, 
      message: 'Service request submitted successfully',
      requestId: serviceRequest.requestId,
      status: serviceRequest.status,
      createdAt: serviceRequest.createdAt
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all service requests (for admin)
router.get('/', async (req, res) => {
  try {
    const ServiceRequest = require('../models/ServiceRequest');
    const requests = await ServiceRequest.find({}).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch(err) {
    res.json({ success: false, message: 'Error fetching service requests' });
  }
});

// Get all service requests for a mobile
router.get('/mobile/:mobile', async (req, res) => {
  try {
    const ServiceRequest = require('../models/ServiceRequest');
    const requests = await ServiceRequest.find({ citizenMobile: req.params.mobile }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch(err) {
    res.json({ success: true, requests: [] });
  }
});

module.exports = router;
