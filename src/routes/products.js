import express from "express";
import AuthMiddleware from "../middleware/auth.js";
import { deleteProducts } from "../controller/products.js";
import { addProduct, getProduct, getProductById, updateProduct } from "../controller/product.controller.js";

const productRouter = express.Router();

// Post Data Products
// productRouter.post('/', AuthMiddleware.checkAuth, addProductsWithPicture);
productRouter.get('/', getProduct);
productRouter.post('/', addProduct);
productRouter.get('/:productId', getProductById);
productRouter.patch('/:productId', updateProduct);

// Delete product by id
productRouter.delete('/:productId', AuthMiddleware.checkAuth, deleteProducts);

export default productRouter