import express from "express"
import AuthMiddleware from "../middleware/auth.js";
import { ROLES } from "../utils/constants.js";
import { checkout, webhook } from "../controller/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post('/checkout', AuthMiddleware.checkAuth, AuthMiddleware.checkRole(ROLES.CUSTOMER), checkout);
paymentRouter.post('/webhook', webhook);

export default paymentRouter;

