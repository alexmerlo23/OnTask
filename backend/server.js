require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const classRoutes = require('./routes/classroom');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ontask-1.onrender.com', 'https://www.ontask-1.onrender.com'] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log('Request:', req.path, req.method);
  next();
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/classes', classRoutes);

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.setHeader('Content-Type', 'application/json');
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Listen for requests
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log('Connected to MongoDB & listening on port', port);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if MongoDB fails to connect
  });