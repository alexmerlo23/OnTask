const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const requireAuth = async (req, res, next) => {
  // Get authorization header
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  // Extract token (format: "Bearer <token>")
  const token = authorization.split(' ')[1];

  try {
    // Verify token
    const { _id } = jwt.verify(token, process.env.SECRET);

    // Attach user to request
    req.user = await User.findOne({ _id }).select('_id email');
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = requireAuth;