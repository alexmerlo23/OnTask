const express = require('express');
const {
  createClassroom,
  getClassroomByEmail,
  getClassroomByCode,
  deleteClassroom
} = require('../controllers/classController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

// POST   /api/classes          — create a new classroom
router.post('/', createClassroom);

// GET    /api/classes/by-email  — get all classrooms for a teacher email
router.get('/by-email', getClassroomByEmail);

// GET    /api/classes/by-code/:code
router.get('/by-code/:code', getClassroomByCode);

// DELETE /api/classes/:code     — delete a classroom by code
router.delete('/:code', deleteClassroom);

module.exports = router;