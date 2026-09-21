import express from 'express'
import AuthMiddleware from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';
import { getOrderDetail, getOrderHistory } from '../controller/order.controller.js';

const orderRouter = express.Router();

orderRouter.get('/history', AuthMiddleware.checkAuth, AuthMiddleware.checkRole(ROLES.CUSTOMER), getOrderHistory);
orderRouter.get('/:id_order', AuthMiddleware.checkAuth, AuthMiddleware.checkRole(ROLES.CUSTOMER), getOrderDetail);

export default orderRouter;