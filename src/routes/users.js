const express = require('express');
const router = express.Router();
const userController = require('../controller/users');
const authMiddleware = require('../middleware/auth');

router.post('/signup', authMiddleware.signupValidation, userController.validatorSignup, userController.userSignup, );
router.post('/login', userController.userLogin);

module.exports = router;