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
  console.log('Processing updateCode for user:', user.email, 'with newCode:', newCode);
  
  if (!newCode) {
    console.log('No newCode provided, returning 400');
    return res.status(400).json({ error: 'New code is required' });
  }
  if (newCode.length < 3) {
    console.log('Invalid newCode length, returning 400');
    return res.status(400).json({ error: 'Code must be at least 3 characters' });
  }
  try {
    // Extract the complete user data to ensure we have all fields
    const fullUser = await User.findById(user._id);
    if (!fullUser) {
      console.log('User not found for ID:', user._id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update the code
    fullUser.code = newCode;
    await fullUser.save();
    
    console.log('Code updated successfully for user:', user.email);
    console.log('Updated code:', fullUser.code);
    
    // Make sure to set content-type header BEFORE sending response
    res.setHeader('Content-Type', 'application/json');
    
    // Return complete user data in the response
    return res.status(200).json({ 
      message: 'Code updated successfully',
      email: fullUser.email,
      role: fullUser.role,
      code: fullUser.code,
      name: fullUser.name,
      token: req.headers.authorization.split(' ')[1] // Return the token from the request
    });
  } catch (err) {
    console.error('Database error in updateCode:', err.message, err.stack);
    res.status(500).json({ error: 'An error occurred while updating the code' });
  }
};

module.exports = { signupUser, loginUser, updateCode };