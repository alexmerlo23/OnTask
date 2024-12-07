const express = require('express');
const { createClassroom, getClassroomByEmail } = require('../controllers/classController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Apply authentication middleware for the class creation route
router.use(requireAuth);

// POST a new classroom
router.post('/', createClassroom);

// GET classroom by email
router.get('/by-email', getClassroomByEmail);

module.exports = router;
