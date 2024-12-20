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
    type: String, // or Date, if you prefer to store it as a Date object
    required: true,
  },
  end: {
    type: String, // or Date
    required: true,
  },
  classroom: {
    type: String,
    required: true,
  },
}, { timestamps: true });


module.exports = mongoose.model('Event', eventSchema);