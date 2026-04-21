/**
 * Seed script: populates sample Transport & Health records for demo/Postman testing.
 * Run directly: node services/seedData.js
 * Or called automatically on server start when DB connects.
 */
const { License, Vehicle } = require('../models/Transport');

async function seedTransport() {
  // Sample licenses
  const licenses = [
    {
      licenseId: 'TN-2022-1234567',
      ownerName: 'Ravi Kumar',
      phone: '9876543210',
      dob: '1990-05-15',
      address: '123, Anna Salai, Chennai',
      vehicleClass: 'LMV',
      status: 'active',
      expiryDate: '2030-05-14'
    },
    {
      licenseId: 'KA-2019-9876543',
      ownerName: 'Anita Sharma',
      phone: '8123456789',
      dob: '1988-11-20',
      address: '45, MG Road, Bangalore',
      vehicleClass: 'LMV, MCWG',
      status: 'active',
      expiryDate: '2029-11-19'
    },
    {
      licenseId: 'TN-2025-8531868',
      ownerName: 'Arjun Nataraj',
      phone: '8531868631',
      dob: '1999-07-23',
      address: '7, Velachery Main Road, Chennai - 600042',
      vehicleClass: 'LMV',
      status: 'active',
      expiryDate: '2035-07-22'
    }
  ];

  for (const lic of licenses) {
    const existing = await License.findOne({ licenseId: lic.licenseId });
    if (!existing) {
      await License.create(lic);
    }
  }

  // Sample vehicles
  const vehicles = [
    {
      vehicleNumber: 'TN09AB1234',
      ownerName: 'Ravi Kumar',
      phone: '9876543210',
      vehicleType: 'Car',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS654321',
      address: '123, Anna Salai, Chennai',
      status: 'registered'
    },
    {
      vehicleNumber: 'KA05CD5678',
      ownerName: 'Anita Sharma',
      phone: '8123456789',
      vehicleType: 'Bike',
      engineNumber: 'ENG789012',
      chassisNumber: 'CHS210987',
      address: '45, MG Road, Bangalore',
      status: 'registered'
    },
    {
      vehicleNumber: 'TN22XY8631',
      ownerName: 'Arjun Nataraj',
      phone: '8531868631',
      vehicleType: 'Car',
      engineNumber: 'ENG853186',
      chassisNumber: 'CHS863186',
      address: '7, Velachery Main Road, Chennai - 600042',
      status: 'registered'
    }
  ];

  for (const v of vehicles) {
    const existing = await Vehicle.findOne({ vehicleNumber: v.vehicleNumber });
    if (!existing) {
      await Vehicle.create(v);
    }
  }

  console.log('✅ Transport demo data seeded (licenses + vehicles)');
}

module.exports = { seedTransport };
