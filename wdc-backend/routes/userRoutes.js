const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const { validateUser } = require('../middlewares/validate');

const router = express.Router();

router.post('/register', validateUser, registerUser);
router.post('/login', validateUser, loginUser);

module.exports = router;