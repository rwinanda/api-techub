import express from 'express';
import AuthMiddleware from '../middleware/auth.js';
import { userLogin, userLogout, userSignup, validatorSignup } from '../controller/users.js';

// const userController = require('../controller/users');
const userRouter = express.Router();

userRouter.post('/signup', AuthMiddleware.signupValidation, validatorSignup, userSignup);
userRouter.post('/login', userLogin);
userRouter.post('/logout', userLogout);

userRouter.get('/check-auth', AuthMiddleware.checkAuth);

export default userRouter;