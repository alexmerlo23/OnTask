const express = require('express');
const { loginUser, signupUser, joinClass, leaveClass, setParentCode } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Public routes
router.post('/login',  loginUser);
router.post('/signup', signupUser);

// Protected routes
router.post('/join',              requireAuth, joinClass);      // student joins a class
router.delete('/leave/:code',     requireAuth, leaveClass);     // student leaves a class
router.patch('/parent-code',      requireAuth, setParentCode);  // student/parent sets parent code

module.exports = router;