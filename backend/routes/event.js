const express = require('express');
const {
  createEvent,
  getEvents,
  getEvent,
  deleteEvent,
  updateEvent,
} = require('../controllers/eventController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Require auth for all event routes
router.use(requireAuth);

// GET all events
router.get('/', getEvents);

// GET a single event
router.get('/:id', getEvent);

// POST a new event
router.post('/', createEvent);

// DELETE an event
router.delete('/:id', deleteEvent);

// UPDATE an event
router.patch('/:id', updateEvent);

module.exports = router