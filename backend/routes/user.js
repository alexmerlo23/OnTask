const express = require('express');
const { loginUser, signupUser, updateCode } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth'); // Add middleware

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Signup route
router.post('/signup', signupUser);

// Update code (protected route)
router.patch('/', requireAuth, updateCode);

module.exports = router;