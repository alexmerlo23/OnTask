const express = require('express');
const { loginUser, signupUser, updateCode } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Signup route
router.post('/signup', signupUser);

// Update code route (protected route)
// Added explicit content-type middleware
router.patch('/', requireAuth, (req, res, next) => {
  // Force content-type header for all responses on this route
  res.setHeader('Content-Type', 'application/json');
  next();
}, updateCode);

module.exports = router;