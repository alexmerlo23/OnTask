const express = require('express')

// controller functions
const { loginUser, signupUser, updateCode } = require('../controllers/userController')

const router = express.Router()

// login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// update code
router.patch('/', updateCode)

module.exports = router