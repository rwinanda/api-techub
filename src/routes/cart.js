import express from 'express';
import AuthMiddleware from '../middleware/auth.js';
import { addToCart, deleteCartItem, getCartByUserId } from '../controller/cart.controller.js';
import { ROLES } from '../utils/constants.js';

const cartRouter = express.Router();

cartRouter.get('/', AuthMiddleware.checkAuth, AuthMiddleware.checkRole(ROLES.CUSTOMER), getCartByUserId);
cartRouter.post('/', AuthMiddleware.checkAuth, AuthMiddleware.checkRole(ROLES.CUSTOMER), addToCart);
cartRouter.delete('/:id_cart_item', AuthMiddleware.checkAuth, AuthMiddleware.checkRole(ROLES.CUSTOMER), deleteCartItem)

export default cartRouter;