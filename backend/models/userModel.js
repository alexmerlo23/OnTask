const mongoose = require('mongoose');
const bcrypt    = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

// Sub-document schema for a class reference stored on the user
// Teachers: { classroomName, code }  (teacherEmail left blank)
// Students: { classroomName, code, teacherEmail }
const classRefSchema = new Schema({
  classroomName: { type: String, required: true },
  code:          { type: String, required: true },
  teacherEmail:  { type: String, default: '' }
}, { _id: false });

const userSchema = new Schema({
  email: {
    type:     String,
    required: true,
    unique:   true
  },
  password: {
    type:     String,
    required: true
  },
  role: {
    type:    String,
    required: false,
    enum:    ['student', 'teacher'],
    default: 'student'
  },
  // Teachers store classes they created; students store classes they joined.
  classes: {
    type:    [classRefSchema],
    default: []
  },
  name: {
    type:     String,
    required: true
  },
  // Students only — set by the student/parent; used to verify assignment completion
  parentCode: {
    type:    String,
    default: ''
  }
});

// static signup method
userSchema.statics.signup = async function(email, password, role = 'student', name) {
  if (!email || !password) throw Error('All fields must be filled');
  if (!validator.isEmail(email)) throw Error('Email not valid');

  const exists = await this.findOne({ email });
  if (exists) throw Error('Email already in use');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ email, password: hash, role, name, classes: [] });
  return user;
};

// static login method
userSchema.statics.login = async function(email, password) {
  if (!email || !password) throw Error('All fields must be filled');

  const user = await this.findOne({ email });
  if (!user) throw Error('Incorrect email');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw Error('Incorrect password');

  return user;
};

module.exports = mongoose.model('User', userSchema);