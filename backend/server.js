require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors') // You'll need to install this: npm install cors
const userRoutes = require('./routes/user')
const eventRoutes = require('./routes/event')
const classRoutes = require('./routes/classroom')

// express app
const app = express()

// Set up CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ontask-1.onrender.com', 'https://www.ontask-1.onrender.com'] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// middleware
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/user', userRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/classes', classRoutes)

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT || 3001, () => {
      console.log('connected to db & listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })