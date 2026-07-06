import express from "express";
import AuthMiddleware from "../middleware/auth.js";
import { addProduct, deleteProductByID, getProduct, getProductById, updateProduct } from "../controller/product.controller.js";
import { ROLES } from "../utils/constants.js";

const productRouter = express.Router();

// Post Data Products
productRouter.get('/', getProduct);
productRouter.post('/', AuthMiddleware.checkAuth, AuthMiddleware.checkRole(ROLES.ADMIN), addProduct);
productRouter.get('/:productId', getProductById);
productRouter.patch('/:productId', AuthMiddleware.checkAuth, AuthMiddleware.checkRole(ROLES.ADMIN), updateProduct);

// Delete product by id
productRouter.delete('/:productId', AuthMiddleware.checkAuth, AuthMiddleware.checkRole(ROLES.ADMIN), deleteProductByID);

export default productRouter