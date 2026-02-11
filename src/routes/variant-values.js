import express from 'express';
import AuthMiddleware from '../middleware/auth.js';

const variantValueRouter = express.Router();

variantValueRouter.get('/', AuthMiddleware.checkAuth);

export default variantValueRouter;