import express from 'express';
import AuthMiddleware from '../middleware/auth.js';
import { createProductVariants, getProductVariants } from '../controller/product-variants.js';

const productVariantRouter = express.Router();

productVariantRouter.post('/', AuthMiddleware.checkAuth, createProductVariants);
productVariantRouter.get('/', AuthMiddleware.checkAuth, getProductVariants);

export default productVariantRouter;