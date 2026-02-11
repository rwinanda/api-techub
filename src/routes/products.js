import express from "express";
import AuthMiddleware from "../middleware/auth.js";
import { deleteProducts, editProducts, getPictureById, getProductById, getProducts } from "../controller/products.js";
import { addProduct } from "../controller/product.controller.js";

const productRouter = express.Router();

// Get Data Products
productRouter.get('/', getProducts);
// Post Data Products
// productRouter.post('/', AuthMiddleware.checkAuth, addProductsWithPicture);
productRouter.post('/', addProduct);


// Get data product by id
productRouter.get('/:productId', getProductById);
productRouter.get('/picture_product/:productId', getPictureById);

// Search product
// productRouter.get('/productSearch', searchProduct);

// Edit product by Id
productRouter.patch('/:productId', AuthMiddleware.checkAuth, editProducts);

// Delete product by id
productRouter.delete('/:productId', AuthMiddleware.checkAuth, deleteProducts);

export default productRouter