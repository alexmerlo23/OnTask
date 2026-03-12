const User  = require('../models/userModel');
const Class = require('../models/classModel');
const jwt   = require('jsonwebtoken');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// Helper: build the safe user payload sent to the client
const buildUserPayload = (user, token) => ({
  email:      user.email,
  role:       user.role,
  name:       user.name,
  classes:    user.classes,
  parentCode: user.parentCode || '',
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
    const classroom = await Class.findOne({ code });
    if (!classroom) {
      return res.status(404).json({ error: 'No class found with that code' });
    }

    const user = await User.findById(authUser._id);

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

// PATCH /api/user/parent-code  (students only)
// Body: { parentCode, currentCode }
// Allows a student/parent to set or update the account's parent verification code
const setParentCode = async (req, res) => {
  const { parentCode, currentCode } = req.body;
  const authUser       = req.user;

  if (authUser.role !== 'student') {
    return res.status(403).json({ error: 'Only student accounts can set a parent code' });
  }
  if (!parentCode || parentCode.trim().length < 4) {
    return res.status(400).json({ error: 'Parent code must be at least 4 characters' });
  }

  try {
    const user = await User.findById(authUser._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If a parent code is already set, require the current code to match
    if (user.parentCode && user.parentCode.length > 0) {
      if (!currentCode || currentCode !== user.parentCode) {
        return res.status(401).json({ error: 'Current parent code is incorrect' });
      }
    }

    user.parentCode = parentCode.trim();
    await user.save();
    const token = req.headers.authorization.split(' ')[1]; // reuse existing token
    res.status(200).json(buildUserPayload(user, token));
  } catch (err) {
    console.error('Error setting parent code:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { signupUser, loginUser, joinClass, leaveClass, setParentCode };