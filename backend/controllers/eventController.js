const Event = require('../models/eventModel');
const mongoose = require('mongoose');

// Get all events
const getEvents = async (req, res) => {
  const classCode = req.user.code;

  try {
    // search events based on class code
    const events = await Event.find({ classCode }).sort({ createdAt: -1 });
    console.log(events)
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error); // Log error if there's an issue
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
    // search event by event id
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'No such event' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error); // Log error if there's an issue
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Create new event
const createEvent = async (req, res) => {
  const { text, type, color, start, end, classroom } = req.body;

  // make sure all fields are filled
  let emptyFields = [];

  if (!text) emptyFields.push('text');
  if (!type) emptyFields.push('type');
  if (!color) emptyFields.push('color');
  if (!start) emptyFields.push('start');
  if (!end) emptyFields.push('end');
  if (!classroom) emptyFields.push('classroom');

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }

  try {
    // create the event
    const event = await Event.create({ text, type, color, start, end, classroom });
    console.log("Event saved:", event); // Log the saved event to check if color is saved
    res.status(200).json(event);
  } catch (error) {
    console.error("Error creating event:", error); // Log error if creation fails
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
    const event = await Event.findOneAndDelete({ _id: id }); // searches event by id and deletes it
    if (!event) {
      return res.status(400).json({ error: 'No such event' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error deleting event:", error); // Log error if deletion fails
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
    // searches the event by id and updates the changes
    const event = await Event.findOneAndUpdate({ _id: id }, {
      ...req.body,
    }, { new: true });
    if (!event) {
      return res.status(400).json({ error: 'No such event' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error updating event:", error); // Log error if update fails
    res.status(500).json({ error: 'Failed to update event' });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  deleteEvent,
  updateEvent,
};
