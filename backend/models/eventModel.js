const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  start: {
    type: String, // or Date, if you prefer to store it as a Date object
    required: true,
  },
  end: {
    type: String, // or Date
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);