const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, role: user.role, code: user.code, name: user.name, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup a user
const signupUser = async (req, res) => {
  const { email, password, role, code, name } = req.body;

  try {
    const user = await User.signup(email, password, role, code, name);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, role: user.role, code: user.code, name, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCode = async (req, res) => {
  const { email, newCode } = req.body;

  // Validate inputs
  if (!email || !newCode) {
    return res.status(400).json({ error: 'Email and new code are required' });
  }

  try {
    // Find user and update the code in one operation
    const updatedUser = await User.findOneAndUpdate(
      { email }, // Find user by email
      { code: newCode }, // Update the code
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Code updated successfully' });
  } catch (err) {
    console.error('Error updating code:', err); // Log error for debugging
    res.status(500).json({ error: 'An error occurred while updating the code' });
  }
}

module.exports = { signupUser, loginUser, updateCode };