/**
 * Seed Script — run manually:
 *   node scripts/seed.js
 *
 * Or it is auto-called on server start in development mode.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

async function run() {
  const needsConnect = mongoose.connection.readyState === 0;
  if (needsConnect) {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_civic_kiosk'
    );
    console.log('✅ Seed: Connected to MongoDB');
  }

  // ── Citizens ───────────────────────────────────────────────────────────────
  const Citizen = require('../models/Citizen');
  const citizens = [
    {
      name: 'Ravi Kumar',
      phone: '9876543210',
      address: '123, Anna Salai, Chennai',
      departments: [
        { department: 'Electricity', consumer_number: 'EB112233' },
        { department: 'Water',       consumer_number: 'WT445566' },
        { department: 'Gas',         consumer_number: 'GS778899' },
        { department: 'Municipal',   consumer_number: 'MN001122' }
      ]
    },
    {
      name: 'Anita Sharma',
      phone: '8123456789',
      address: '45, MG Road, Bangalore',
      departments: [
        { department: 'Electricity', consumer_number: 'EB998877' },
        { department: 'Water',       consumer_number: 'WT665544' },
        { department: 'Gas',         consumer_number: 'GS332211' },
        { department: 'Municipal',   consumer_number: 'MN990011' }
      ]
    },
    {
      name: 'Arjun Nataraj',
      phone: '8531868631',
      address: '7, Velachery Main Road, Chennai - 600042',
      departments: [
        { department: 'Electricity', consumer_number: 'EB853186' },
        { department: 'Water',       consumer_number: 'WT853186' },
        { department: 'Gas',         consumer_number: 'GS853186' },
        { department: 'Municipal',   consumer_number: 'MN853186' }
      ]
    }
  ];
  for (const c of citizens) {
    if (!(await Citizen.findOne({ phone: c.phone }))) await Citizen.create(c);
  }

  // ── Bills ──────────────────────────────────────────────────────────────────
  const Bill = require('../models/Bill');
  const bills = [
    {
      consumerNumber: 'EB112233', type: 'electricity', amount: 1450,
      dueDate: '2025-04-15', status: 'pending', month: 'March 2025',
      units: 165, consumerName: 'Ravi Kumar', address: '123, Anna Salai, Chennai'
    },
    {
      consumerNumber: 'WT445566', type: 'water', amount: 420,
      dueDate: '2025-04-10', status: 'pending', month: 'March 2025',
      units: 15, consumerName: 'Ravi Kumar', address: '123, Anna Salai, Chennai'
    },
    {
      consumerNumber: 'EB853186', type: 'electricity', amount: 1875,
      dueDate: '2025-04-20', status: 'pending', month: 'March 2025',
      units: 210, consumerName: 'Arjun Nataraj', address: '7, Velachery Main Road, Chennai - 600042'
    },
    {
      consumerNumber: 'WT853186', type: 'water', amount: 530,
      dueDate: '2025-04-18', status: 'pending', month: 'March 2025',
      units: 18, consumerName: 'Arjun Nataraj', address: '7, Velachery Main Road, Chennai - 600042'
    },
    {
      consumerNumber: 'GS853186', type: 'gas', amount: 960,
      dueDate: '2025-04-22', status: 'pending', month: 'March 2025',
      units: 32, consumerName: 'Arjun Nataraj', address: '7, Velachery Main Road, Chennai - 600042'
    },
    {
      consumerNumber: 'MN853186', type: 'municipal', amount: 350,
      dueDate: '2025-04-25', status: 'pending', month: 'March 2025',
      units: 1, consumerName: 'Arjun Nataraj', address: '7, Velachery Main Road, Chennai - 600042'
    }
  ];
  for (const b of bills) {
    if (!(await Bill.findOne({ consumerNumber: b.consumerNumber }))) await Bill.create(b);
  }

  // ── Transport (licenses + vehicles) ────────────────────────────────────────
  const { seedTransport } = require('../services/seedData');
  await seedTransport();

  console.log('✅ Database seeded successfully');

  if (needsConnect) {
    await mongoose.disconnect();
    console.log('✅ Seed: Disconnected from MongoDB');
  }
}

module.exports = { run };

// Allow direct execution: node scripts/seed.js
if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch(err => { console.error('❌ Seed error:', err.message); process.exit(1); });
}
