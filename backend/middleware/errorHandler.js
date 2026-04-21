/**
 * Centralized Error Handler
 * Must be registered AFTER all routes:  app.use(errorHandler)
 */
const errorHandler = (err, req, res, next) => {
  // Log the full stack in debug detail
  console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error('   Message:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('   Stack:', err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(422).json({ success: false, error: 'Validation Error', details });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, error: `Duplicate value for ${field}.` });
  }

  // JWT errors (if thrown manually as Error objects)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
  }

  // Generic fallback
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
