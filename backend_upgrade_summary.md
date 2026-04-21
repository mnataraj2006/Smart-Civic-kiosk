# Smart Civic Kiosk — Backend Upgrade v2.1 + Transport Refactor

> [!IMPORTANT]
> Server confirmed running on **v2.1.0** at `http://localhost:5000`

---

## 🚗 Transport: RTO Appointment → License Renewal

| Layer | Change |
|---|---|
| [models/Transport.js](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/models/Transport.js) | Replaced `RTOAppointmentSchema` → `LicenseRenewalSchema` (fields: licenseId, dob, vehicleClass, address, expiryDate, renewalDate) |
| [controllers/transportController.js](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/controllers/transportController.js) | Replaced `bookRTOAppointment` → [renewLicense](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/controllers/transportController.js#134-159) |
| [routes/transport.js](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/routes/transport.js) | `/book-appointment` → `/license-renewal` (POST, JWT-protected) |
| `frontend/TransportScreen.js` | Tile label: "RTO Appointment Booking" → "License Renewal 🔄"; form fields updated |

---

## 🏗️ Backend Architecture Changes

### PART 1 — API Design ✅
- Removed duplicate `/api/complaint` route (kept `/api/complaints` only)
- Added `/api/citizens` plural canonical route (legacy `/api/citizen` preserved as alias)

### PART 2 — Centralized Error Handler ✅
- [middleware/errorHandler.js](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/middleware/errorHandler.js) upgraded to handle:
  - Mongoose `ValidationError` → 422
  - Mongoose duplicate key `11000` → 409
  - `JsonWebTokenError` / `TokenExpiredError` → 401
  - Development stack traces in response

### PART 3 — Authentication & Authorization ✅
- **New**: [middleware/authMiddleware.js](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/middleware/authMiddleware.js) — role-based factory middleware
  ```js
  authMiddleware(['admin'])   // admin only
  authMiddleware()            // any authenticated user
  ```
- Roles supported: `admin`, `operator`, `citizen`
- Routes protected:
  - `POST /api/complaints` → JWT required
  - `GET /api/complaints` → admin only
  - `PUT /api/complaints/:id` → admin only
  - `GET /api/transactions` → admin only
  - `POST /api/bills/pay` → JWT required

### PART 4 — CORS Configuration ✅
- Dynamic CORS from `process.env.CLIENT_URL`
- Comma-separated list: `CLIENT_URL=http://localhost:3000,http://localhost:3001`
- Requests with no origin (Postman, mobile apps) are allowed

### PART 5 — Seeding Logic ✅
- Seed removed from server startup
- **New**: [scripts/seed.js](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/scripts/seed.js) — standalone, handles its own DB connection
  ```bash
  node scripts/seed.js
  ```
- Auto-runs on server start **only in `NODE_ENV=development`**

### PART 6 — Clean Folder Structure ✅
```
backend/
├── controllers/    ← business logic
├── middleware/     ← errorHandler, verifyToken, authMiddleware
├── models/         ← Mongoose schemas with indexes
├── routes/         ← routing only
├── scripts/        ← seed.js (new)
└── services/       ← emailService, seedData
```

### PART 7 — Validation ✅
- Phone: 10-digit numeric regex in all transport controllers
- Fine amount: must be > 0
- Required fields validated before DB write
- Bill amount: `min: 0` schema validator

### PART 8 — Logging (Morgan) ✅
- Installed `morgan` package
- Request logging via `app.use(morgan(...))`
- Log format configurable via `LOG_LEVEL` env var

### PART 9 — Transaction Consistency ✅
- `POST /api/bills/pay` now uses **MongoDB session + atomic transaction**:
  1. Finds pending bill (in session)
  2. Marks bill as `paid` (in session)
  3. Creates transaction record (in session)
  4. Commits atomically — or rolls back on any error

### PART 10 — Environment Configuration ✅
- [.env](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/.env) — active development config (updated with CLIENT_URL, LOG_LEVEL)
- [.env.development](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/.env.development) — development template
- [.env.production](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/.env.production) — production template with placeholders

### PART 11 — Pagination & Filtering ✅
| Route | Pagination |
|---|---|
| `GET /api/complaints?page=1&limit=20` | ✅ + department/status filters |
| `GET /api/transactions?page=1&limit=20` | ✅ |
| `GET /api/transactions/mobile/:mobile?page=1` | ✅ |

### PART 12 — Database Indexes ✅
| Model | Indexes Added |
|---|---|
| [Complaint](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/controllers/complaintController.js#5-64) | phone, department, createdAt, status |
| `Bill` | (consumerNumber + status) compound, dueDate |
| `Transport.License` | licenseId, phone |
| `Transport.Vehicle` | vehicleNumber, phone |

### PART 13-16 — Core Features, Auth, Notifications, Cleanup ✅
- OTP Auth (Twilio) + JWT session: existing and working
- Email after complaint (Nodemailer): existing and working
- Duplicate `/api/complaint` route removed
- [complaintRoutes.js](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/routes/complaintRoutes.js) deleted (consolidated into [complaints.js](file:///c:/Users/DELL/Desktop/Smart%20Civic%20Utility%20Kiosk%20UI/backend/routes/complaints.js))

---

## 📡 API Reference

```
POST   /api/auth/send-otp
POST   /api/auth/verify-otp

GET    /api/bills/:consumerNumber
POST   /api/bills/pay                    [JWT]

GET    /api/complaints/track?id=&mobile=
POST   /api/complaints                   [JWT]
GET    /api/complaints?page=1&limit=20   [admin]
GET    /api/complaints/:phone            [JWT]
PUT    /api/complaints/:id               [admin]

GET    /api/transactions?page=1          [admin]
GET    /api/transactions/mobile/:mobile  [JWT]
GET    /api/transactions/:txnId          [JWT]

GET    /api/transport/license-status/:id
GET    /api/transport/vehicle-status/:num
POST   /api/transport/learner-license    [JWT]
POST   /api/transport/license-renewal    [JWT]  ← NEW
POST   /api/transport/duplicate-rc       [JWT]
POST   /api/transport/pay-fine           [JWT]
PUT    /api/transport/update-address     [JWT]

GET    /api/citizens/:phone
POST   /api/citizens

GET    /api/health-check
```
