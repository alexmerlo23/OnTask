const express = require('express');
const { loginUser, signupUser, joinClass, leaveClass } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Public routes
router.post('/login',  loginUser);
router.post('/signup', signupUser);

// Protected routes
router.post('/join',         requireAuth, joinClass);   // student joins a class by code
router.delete('/leave/:code', requireAuth, leaveClass); // student leaves a class by code

module.exports = router;