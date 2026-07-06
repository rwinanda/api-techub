import express from 'express';
import AuthMiddleware from '../middleware/auth.js';
import { userLogin, userLogout, userRegist, validatorSignup } from '../controller/user.controller.js';

const userRouter = express.Router();

userRouter.post('/signup', AuthMiddleware.signupValidation, validatorSignup, userRegist);
userRouter.post('/login', userLogin);
userRouter.post('/logout', AuthMiddleware.checkAuth, userLogout);

// userRouter.get('/check-auth', AuthMiddleware.checkAuth);

export default userRouter;