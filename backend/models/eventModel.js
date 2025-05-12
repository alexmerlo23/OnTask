const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: false,
  },
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
  classroom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);