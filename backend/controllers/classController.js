const Class = require('../models/classModel');
const User  = require('../models/userModel');

// POST /api/classes  — create a classroom (teachers only)
const createClassroom = async (req, res) => {
  const { classroomName, code } = req.body;
  const email = req.user.email; // always taken from auth token, not body

  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can create a class' });
  }

  let emptyFields = [];
  if (!classroomName) emptyFields.push('classroomName');
  if (!code)          emptyFields.push('code');

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }

  try {
    const classroom = await Class.create({ classroomName, code, email });

    // Also push a reference onto the teacher's own user document
    await User.findByIdAndUpdate(req.user._id, {
      $push: { classes: { classroomName, code } }
    });

    res.status(200).json(classroom);
  } catch (error) {
    console.error('Error creating class:', error);
    // Duplicate key = code already taken
    if (error.code === 11000) {
      return res.status(400).json({ error: 'That class code is already in use. Please choose another.' });
    }
    res.status(400).json({ error: error.message });
  }
};

// GET /api/classes/by-email?email=...  — returns ALL classes for a teacher
const getClassroomByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const classrooms = await Class.find({ email });
    // Return an array (may be empty — that's fine)
    res.status(200).json(classrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/classes/by-code/:code
const getClassroomByCode = async (req, res) => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    const classroom = await Class.findOne({ code });

    if (!classroom) {
      return res.status(404).json({ error: 'No classroom found for this code' });
    }

    res.status(200).json(classroom);
  } catch (error) {
    console.error('Error fetching classroom by code:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/classes/:code  — delete a classroom (teachers only, must own it)
const deleteClassroom = async (req, res) => {
  const { code } = req.params;
  const email    = req.user.email;

  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can delete a class' });
  }

  try {
    const classroom = await Class.findOneAndDelete({ code, email });

    if (!classroom) {
      return res.status(404).json({ error: 'Class not found or you do not own it' });
    }

    // Remove from the teacher's classes array too
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { classes: { code } }
    });

    res.status(200).json({ message: 'Class deleted', code });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createClassroom, getClassroomByEmail, getClassroomByCode, deleteClassroom };