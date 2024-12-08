const express = require('express')

// controller functions
const { loginUser, signupUser, updateCode } = require('../controllers/userController')

const router = express.Router()

// login route
router.post('/login', (req, res) => {
    console.log('Login request:', req.body);
    loginUser(req, res);
});

// signup route
router.post('/signup', signupUser)

router.patch('/', updateCode)

module.exports = router