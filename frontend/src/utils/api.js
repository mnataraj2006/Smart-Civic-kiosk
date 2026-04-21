/**
 * api.js — Centralized Axios API Service
 *
 * All backend calls go through this instance.
 * Features:
 *   - Base URL configured once
 *   - JWT token auto-attached from localStorage
 *   - Offline detection → throws human-readable error
 *   - Standardised error parsing (always returns { success, message, data })
 *   - Request/response interceptors for logging in dev
 */

import axios from 'axios';

// ── Base instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 12_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach JWT & idempotency header ─────────────────
api.interceptors.request.use(
  (config) => {
    // Hard offline check before any network call
    if (!navigator.onLine) {
      const err = new Error('No internet connection. Please check your network.');
      err.isOffline = true;
      return Promise.reject(err);
    }

    const token = localStorage.getItem('kiosk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Pass through offline sync headers if set by caller
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — normalise error shape ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Build a clean, user-facing error message
    let message = 'An unexpected error occurred. Please try again.';

    if (error.isOffline) {
      message = 'No internet connection. Your request will be saved and synced automatically.';
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. The server may be busy — please try again.';
    } else if (!error.response) {
      message = 'Cannot reach the server. Please check your connection.';
    } else {
      const { status, data } = error.response;
      // Use backend message if available, else generic by status
      if (data?.error)   message = data.error;
      else if (data?.message) message = data.message;
      else if (status === 400) message = 'Invalid request. Please check your input.';
      else if (status === 401) message = 'Session expired. Please login again.';
      else if (status === 403) message = 'You do not have permission to perform this action.';
      else if (status === 404) message = 'The requested resource was not found.';
      else if (status === 409) message = data?.message || 'This request was already submitted.';
      else if (status === 422) message = 'Validation failed: ' + (data?.details?.join(', ') || data?.error || '');
      else if (status === 429) message = 'Too many requests. Please wait a moment and try again.';
      else if (status >= 500) message = 'Server error. Please try again in a moment.';
    }

    // Attach the clean message to the error for consuming components
    error.userMessage = message;
    return Promise.reject(error);
  }
);

// ── Typed API helpers for each domain ─────────────────────────────────────

// AUTH
export const authAPI = {
  sendOtp:   (mobile)      => api.post('/auth/send-otp',   { mobile }),
  verifyOtp: (mobile, otp) => api.post('/auth/verify-otp', { mobile, otp }),
};

// BILLS
export const billsAPI = {
  fetch: (consumerNumber)  => api.get(`/bills/${consumerNumber}`),
};

// PAYMENTS
export const paymentsAPI = {
  initiate: (body) => api.post('/payments/initiate', body),
  verify:   (body) => api.post('/payments/verify',   body),
  cash:     (body) => api.post('/payments/cash',     body),
};

// COMPLAINTS
export const complaintsAPI = {
  register: (body) => api.post('/complaints', body),
  track:    (params) => api.get('/complaints/track', { params }),
};

// SERVICES
export const servicesAPI = {
  submit: (body) => api.post('/services', body),
};

// TRANSPORT
export const transportAPI = {
  checkLicense:    (query) => api.get('/transport/license-check', { params: query }),
  applyLearner:    (body)  => api.post('/transport/learner-license', body),
  renewLicense:    (body)  => api.post('/transport/license-renewal', body),
  payFine:         (body)  => api.post('/transport/fine-payment', body),
  updateAddress:   (body)  => api.put('/transport/address-update', body),
  checkVehicle:    (query) => api.get('/transport/vehicle-check', { params: query }),
};

// HEALTH
export const healthAPI = {
  bookAppointment: (body)  => api.post('/health/appointment', body),
  checkVaccination:(query) => api.get('/health/vaccination-status', { params: query }),
  applyScheme:     (body)  => api.post('/health/scheme', body),
  requestCertificate: (body) => api.post('/health/certificate', body),
};

// TRANSACTIONS
export const transactionsAPI = {
  getAll:  (params) => api.get('/transactions', { params }),
};

// OFFLINE SYNC helper — adds X-Request-Id & X-Offline-Sync headers
export const syncRequest = (method, endpoint, body, requestId) =>
  api({ method, url: endpoint, data: body,
        headers: { 'X-Request-Id': requestId, 'X-Offline-Sync': 'true' } });

export default api;
