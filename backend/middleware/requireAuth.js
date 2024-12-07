const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const requireAuth = require('./middleware/requireAuth');

const app = express();

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());

// Middleware to verify authentication
const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);

    req.user = await User.findOne({ _id }).select('_id');
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

// Protected route
app.use('/api', requireAuth, (req, res) => {
  res.status(200).json({ message: 'Protected content accessed!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
