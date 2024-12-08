const express = require('express')

// controller functions
const { loginUser, signupUser, updateCode } = require('../controllers/userController')

const router = express.Router()

// login route

router.post('/login', (req, res) => {
    console.log("Login attempt", req.body);
    loginUser(req, res); // Assuming loginUser is the controller function
  });
  

// signup route
router.post('/signup', signupUser)

router.patch('/', updateCode)

module.exports = router