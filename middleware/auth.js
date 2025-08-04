// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authenticate middleware:
 * - Reads Authorization header “Bearer <token>”
 * - Verifies JWT
 * - Loads User from DB and attaches to req.user
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid Authorization format' });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Authorize middleware:
 * - Takes an array of allowed roles
 * - Ensures req.user.role is one of them
 */
function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Forbidden: aapka role (${req.user.role}) allow nahi` });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
