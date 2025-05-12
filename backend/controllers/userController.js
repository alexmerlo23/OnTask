const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// Login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email, role: user.role, code: user.code, name: user.name, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Signup a user
const signupUser = async (req, res) => {
  const { email, password, role, code, name } = req.body;

  try {
    const user = await User.signup(email, password, role, code, name);
    const token = createToken(user._id);
    res.status(200).json({ email, role: user.role, code: user.code, name, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update user code
const updateCode = async (req, res) => {
  const { newCode } = req.body;
  const user = req.user; // From requireAuth middleware

  // Validate input
  if (!newCode) {
    return res.status(400).json({ error: 'New code is required' });
  }

  // Optional: Validate newCode format (e.g., length or pattern)
  if (newCode.length < 3) {
    return res.status(400).json({ error: 'Code must be at least 3 characters' });
  }

  try {
    // Update the user's code
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id }, // Use authenticated user's _id
      { code: newCode },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Code updated successfully', code: updatedUser.code });
  } catch (err) {
    console.error('Error updating code:', err);
    res.status(500).json({ error: 'An error occurred while updating the code' });
  }
};

module.exports = { signupUser, loginUser, updateCode };