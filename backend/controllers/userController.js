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
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ email, role: user.role, code: user.code, name: user.name, token });
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).json({ error: error.message });
  }
};

// Signup a user
const signupUser = async (req, res) => {
  const { email, password, role, code, name } = req.body;
  try {
    const user = await User.signup(email, password, role, code, name);
    const token = createToken(user._id);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ email, role: user.role, code: user.code, name, token });
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).json({ error: error.message });
  }
};

// Update user code
const updateCode = async (req, res) => {
  const { newCode } = req.body;
  const user = req.user;
  
  if (!newCode) {
    return res.status(400).json({ error: 'New code is required' });
  }
  
  if (newCode.length < 3) {
    return res.status(400).json({ error: 'Code must be at least 3 characters' });
  }
  
  try {
    // Simple update to the user code
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { code: newCode },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Send back minimal response
    res.status(200).json({
      email: updatedUser.email,
      code: updatedUser.code,
      role: updatedUser.role,
      name: updatedUser.name
    });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while updating the code' });
  }
};

module.exports = { signupUser, loginUser, updateCode };