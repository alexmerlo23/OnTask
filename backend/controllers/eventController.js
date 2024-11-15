const Event = require('../models/eventModel');
const mongoose = require('mongoose');


// Get all events
const getEvents = async (req, res) => {
  const user_id = req.user._id;


  const events = await Event.find({ user_id }).sort({ createdAt: -1 });


  res.status(200).json(events);
};


// Get a single event
const getEvent = async (req, res) => {
  const { id } = req.params;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such event' });
  }


  const event = await Event.findById(id);


  if (!event) {
    return res.status(404).json({ error: 'No such event' });
  }


  res.status(200).json(event);
};


// Create new event
const createEvent = async (req, res) => {
  console.log("Request received:", req.body); // Check what is received
  const { text, type, color, start, end } = req.body; // Ensure these fields are correctly destructured
  let emptyFields = [];


  if (!text) emptyFields.push('text');
  if (!type) emptyFields.push('type');
  if (!color) emptyFields.push('color');
  if (!start) emptyFields.push('start');
  if (!end) emptyFields.push('end');
 
  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }


  try {
    const user_id = req.user._id; // Assuming you have a middleware that sets req.user
    const event = await Event.create({ text, type, color, start, end, user_id });
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


 


// Delete an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such event' });
  }


  const event = await Event.findOneAndDelete({ _id: id });


  if (!event) {
    return res.status(400).json({ error: 'No such event' });
  }


  res.status(200).json(event);
};


// Update an event
const updateEvent = async (req, res) => {
  const { id } = req.params;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such event' });
  }


  const event = await Event.findOneAndUpdate({ _id: id }, {
    ...req.body,
  }, { new: true });


  if (!event) {
    return res.status(400).json({ error: 'No such event' });
  }


  res.status(200).json(event);
};


module.exports = {
  getEvents,
  getEvent,
  createEvent,
  deleteEvent,
  updateEvent,
}