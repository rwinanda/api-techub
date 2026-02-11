import express from 'express';
import AuthMiddleware from '../middleware/auth.js';
import { createProductSku, getProductSku } from '../controller/product-sku.js';
const productSkuRouter = express.Router();

productSkuRouter.get('/', AuthMiddleware.checkAuth, getProductSku);
productSkuRouter.post('/', AuthMiddleware.checkAuth, createProductSku);

export default productSkuRouter;