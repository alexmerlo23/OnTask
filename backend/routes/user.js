const express = require('express');
const { loginUser, signupUser, updateCode } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Signup route
router.post('/signup', signupUser);

// Update code route (protected route)
// Simplified - let the controller handle the Content-Type
router.patch('/', requireAuth, updateCode);

module.exports = router;