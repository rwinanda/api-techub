const express = require('express');
const router = express.Router();
const userController = require('../controller/users');
const authMiddleware = require('../middleware/auth');

// const categoryController = require('../controller/categories');

router.post('/signup', authMiddleware.signupValidation, userController.validatorSignup, userController.userSignup, );
router.post('/login', userController.userLogin);
router.post('/logout', userController.userLogout);
// router.get('/usersGetAll', userController.getUserLogin);

router.get('/check-auth', authMiddleware.checkAuth);

module.exports = router;