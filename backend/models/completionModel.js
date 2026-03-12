const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true },
  studentName:  { type: String, default: '' },
  eventId:      { type: String, required: true },
  classCode:    { type: String, required: true },
  completedAt:  { type: Date,   default: Date.now }
});

// One completion record per student per event
completionSchema.index({ studentEmail: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Completion', completionSchema);