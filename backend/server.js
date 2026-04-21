/**
 * server.js — Production-ready Smart Civic Kiosk API v3.0
 *
 * Security:  Helmet, CORS allowlist, rate-limiting, Mongo-sanitize, input limits
 * Perf:      Compression, morgan
 * Resilience: Hard-stop on MongoDB failure, graceful shutdown
 */

'use strict';
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const dotenv       = require('dotenv');
const morgan       = require('morgan');
const helmet       = require('helmet');
const compression  = require('compression');
const rateLimit    = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();

const app = express();

// ─── Security headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,      // disabled — frontend handles its own CSP
  crossOriginEmbedderPolicy: false,
}));

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Request Logging ──────────────────────────────────────────────────────────
const logLevel = process.env.LOG_LEVEL || 'dev';
app.use(morgan(logLevel));

// ─── CORS (strict allowlist) ──────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:3001')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / Postman (no origin header)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Offline-Sync'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// General API limit: 120 req / 1 min per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please slow down.' },
});

// Stricter limit for auth endpoints: 10 OTP requests / 5 min
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many OTP requests. Please wait a few minutes.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// ─── Body Parsing + NoSQL Injection Prevention ────────────────────────────────
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));
app.use(mongoSanitize());          // strips $, . from user input → prevents NoSQL injection

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth');
const billRoutes        = require('./routes/bills');
const citizenRoutes     = require('./routes/citizen');
const complaintRoutes   = require('./routes/complaints');
const serviceRoutes     = require('./routes/services');
const transactionRoutes = require('./routes/transactions');
const transportRoutes   = require('./routes/transport');
const healthRoutes      = require('./routes/health');
const paymentRoutes     = require('./routes/payments');

app.use('/api/auth',         authRoutes);
app.use('/api/citizens',     citizenRoutes);
// NOTE: /api/citizen alias REMOVED per task requirement — use /api/citizens only
app.use('/api/complaints',   complaintRoutes);
app.use('/api/bills',        billRoutes);
app.use('/api/services',     serviceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transport',    transportRoutes);
app.use('/api/health',       healthRoutes);
app.use('/api/payments',     paymentRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health-check', (_req, res) => {
  res.json({
    success:   true,
    message:   'Smart Civic Kiosk API is running',
    version:   '3.0.0',
    timestamp: new Date(),
    db:        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    modules:   ['auth','bills','citizens','complaints','payments','services',
                'transactions','transport','health'],
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   `Route not found: ${req.method} ${req.originalUrl}`,
    hint:    'Check /api/health-check for available modules',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ─── MongoDB — HARD STOP ON FAILURE ──────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_civic_kiosk';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS:          45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  if (process.env.NODE_ENV !== 'production') {
    require('./scripts/seed').run();
  }
  startServer();
})
.catch(err => {
  console.error('❌ FATAL: MongoDB connection failed:', err.message);
  console.error('   Server will NOT start without a database connection.');
  console.error('   Fix MONGODB_URI in .env and restart.');
  process.exit(1);   // Hard exit — no silent demo mode in production
});

function startServer() {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Smart Civic Kiosk API v3.0 running on port ${PORT}`);
    console.log(`   CORS allowed: ${allowedOrigins.join(', ')}`);
    console.log(`   Rate limit: 120 req/min general | 10 req/5min auth`);
    console.log(`   Node: ${process.version} | ENV: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received — closing server gracefully…`);
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('✅ MongoDB closed. Exiting.');
        process.exit(0);
      });
    });
    // Force exit after 10 s if graceful fails
    setTimeout(() => { console.error('⚠️  Forced exit after timeout'); process.exit(1); }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}
