const User = require('../models/userModel');
const Class = require('../models/classModel');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// Helper: build the safe user payload sent to the client
const buildUserPayload = (user, token) => ({
  email:   user.email,
  role:    user.role,
  name:    user.name,
  classes: user.classes,
  token
});

// Login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user  = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json(buildUserPayload(user, token));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Signup a user
const signupUser = async (req, res) => {
  const { email, password, role, name } = req.body;
  try {
    const user  = await User.signup(email, password, role, name);
    const token = createToken(user._id);
    res.status(200).json(buildUserPayload(user, token));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// POST /api/user/join  (students only)
// Body: { code }  — look up the class and add it to the student's classes array
const joinClass = async (req, res) => {
  const { code } = req.body;
  const authUser = req.user;

  if (authUser.role !== 'student') {
    return res.status(403).json({ error: 'Only students can join a class' });
  }
  if (!code) {
    return res.status(400).json({ error: 'Class code is required' });
  }

  try {
    // Verify the class exists
    const classroom = await Class.findOne({ code });
    if (!classroom) {
      return res.status(404).json({ error: 'No class found with that code' });
    }

    // Reload user from DB so we have the full document
    const user = await User.findById(authUser._id);

    // Check not already enrolled
    const alreadyJoined = user.classes.some((c) => c.code === code);
    if (alreadyJoined) {
      return res.status(400).json({ error: 'You have already joined this class' });
    }

    user.classes.push({
      classroomName: classroom.classroomName,
      code:          classroom.code,
      teacherEmail:  classroom.email
    });

    await user.save();

    res.status(200).json({ classes: user.classes });
  } catch (err) {
    console.error('Error joining class:', err);
    res.status(500).json({ error: 'Server error while joining class' });
  }
};

// DELETE /api/user/leave/:code  (students only)
// Remove a class from the student's enrolled list
const leaveClass = async (req, res) => {
  const { code } = req.params;
  const authUser = req.user;

  if (authUser.role !== 'student') {
    return res.status(403).json({ error: 'Only students can leave a class' });
  }

  try {
    const user = await User.findById(authUser._id);

    const beforeCount = user.classes.length;
    user.classes = user.classes.filter((c) => c.code !== code);

    if (user.classes.length === beforeCount) {
      return res.status(404).json({ error: 'You are not enrolled in a class with that code' });
    }

    await user.save();
    res.status(200).json({ classes: user.classes });
  } catch (err) {
    console.error('Error leaving class:', err);
    res.status(500).json({ error: 'Server error while leaving class' });
  }
};

module.exports = { signupUser, loginUser, joinClass, leaveClass };