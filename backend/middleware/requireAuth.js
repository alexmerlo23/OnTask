const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  console.log('Authorization header:', authorization);
  if (!authorization) {
    res.setHeader('Content-Type', 'application/json');
    console.log('No authorization header, returning 401');
    return res.status(401).json({ error: 'Authorization token required' });
  }
  const token = authorization.split(' ')[1];
  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    console.log('Verified user ID:', _id);
    req.user = await User.findOne({ _id }).select('_id email');
    if (!req.user) {
      res.setHeader('Content-Type', 'application/json');
      console.log('User not found for ID:', _id);
      return res.status(401).json({ error: 'User not found' });
    }
    console.log('User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = requireAuth;