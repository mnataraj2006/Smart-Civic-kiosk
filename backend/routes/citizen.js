const express = require('express');
const router = express.Router();
const Citizen = require('../models/Citizen');
const mongoose = require('mongoose');

// 1. Add Citizen
router.post('/', async (req, res) => {
  const { name, phone, address, departments } = req.body;
  
  try {
    const newCitizen = new Citizen({ name, phone, address, departments });
    await newCitizen.save();
    res.status(201).json(newCitizen);
  } catch (error) {
    res.status(400).json({ message: 'Error adding citizen', error: error.message });
  }
});

// 2. Get Citizen by Phone
router.get('/:phone', async (req, res) => {
  try {
    const citizen = await Citizen.findOne({ phone: req.params.phone });
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });
    res.json({ name: citizen.name, departments: citizen.departments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching citizen', error: error.message });
  }
});

module.exports = router;
