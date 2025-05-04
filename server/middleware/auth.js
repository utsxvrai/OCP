const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'ocp_secret_key');
    
    // Add user from payload
    req.user = verified;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Officer role check
const isOfficer = (req, res, next) => {
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Officer role required' });
  }
  next();
};

// Admin role check
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required' });
  }
  next();
};

module.exports = { auth, isOfficer, isAdmin }; 