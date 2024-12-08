require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const classRoutes = require('./routes/classroom');

// express app
const app = express();

// Enable CORS
app.use(cors()); // Update for your frontend URL
// middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use('/api/user', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/classes', classRoutes);

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT || 3001, () => {
      console.log('connected to db & listening on port', process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
