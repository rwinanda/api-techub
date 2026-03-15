import express from "express";
import AuthMiddleware from "../middleware/auth.js";
import { deleteProducts, editProducts } from "../controller/products.js";
import { addProduct, getProduct, getProductById } from "../controller/product.controller.js";

const productRouter = express.Router();

// Post Data Products
// productRouter.post('/', AuthMiddleware.checkAuth, addProductsWithPicture);
productRouter.get('/', getProduct);
productRouter.post('/', addProduct);
productRouter.get('/:productId', getProductById);

// Get data product by id
// productRouter.get('/:productId', getProductById);
// productRouter.get('/picture_product/:productId', getPictureById);

// Search product
// productRouter.get('/productSearch', searchProduct);

// Edit product by Id
productRouter.patch('/:productId', AuthMiddleware.checkAuth, editProducts);

// Delete product by id
productRouter.delete('/:productId', AuthMiddleware.checkAuth, deleteProducts);

export default productRouter