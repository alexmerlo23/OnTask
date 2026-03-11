const Event = require('../models/eventModel');
const mongoose = require('mongoose');

// Get all events
const getEvents = async (req, res) => {
  const userEmail   = req.user.email;
  const userRole    = req.user.role;
  const userClasses = req.user.classes || [];

  try {
    let events;

    if (userRole === 'student') {
      // Pull all class codes the student is enrolled in and fetch events for all of them
      const classCodes = userClasses.map((c) => c.code).filter(Boolean);

      if (classCodes.length === 0) {
        return res.status(200).json([]); // not enrolled in anything yet
      }

      events = await Event.find({ classroom: { $in: classCodes } }).sort({ createdAt: -1 });
    } else {
      // Teachers see all events they created
      events = await Event.find({ email: userEmail }).sort({ createdAt: -1 });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get a single event
const getEvent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such event' });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'No such event' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Create new event
const createEvent = async (req, res) => {
  const { text, type, color, start, end, classroom } = req.body;

  if (!req.user || !req.user.email) {
    return res.status(401).json({ error: 'User authentication failed' });
  }
  const email = req.user.email;

  let emptyFields = [];
  if (!text)      emptyFields.push('text');
  if (!type)      emptyFields.push('type');
  if (!color)     emptyFields.push('color');
  if (!start)     emptyFields.push('start');
  if (!end)       emptyFields.push('end');
  if (!classroom) emptyFields.push('classroom');

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }

  try {
    const event = await Event.create({ text, type, color, start, end, classroom, email });
    res.status(200).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such event' });
  }

  try {
    const event = await Event.findOneAndDelete({ _id: id });
    if (!event) {
      return res.status(400).json({ error: 'No such event' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such event' });
  }

  try {
    const event = await Event.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
    if (!event) {
      return res.status(400).json({ error: 'No such event' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

module.exports = { getEvents, getEvent, createEvent, deleteEvent, updateEvent };