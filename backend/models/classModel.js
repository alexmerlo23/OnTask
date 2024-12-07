const mongoose = require('mongoose');


const Schema = mongoose.Schema;


const classSchema = new Schema({
  classroomName: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: false
  }
});


module.exports = mongoose.model('Class', classSchema);