const jwt = require('jsonwebtoken');

/**
 * Role-Based Auth Middleware
 *
 * Usage:
 *   router.get('/admin-only', authMiddleware(['admin']), handler);
 *   router.post('/protected',  authMiddleware(),         handler);   // any authenticated user
 */
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SmartCivicKiosk2024SecretKey');
      req.user = decoded;

      // Role check (if specific roles required)
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role(s): ${roles.join(', ')}.`
        });
      }

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
      }
      return res.status(403).json({ success: false, error: 'Invalid token.' });
    }
  };
};

module.exports = authMiddleware;
