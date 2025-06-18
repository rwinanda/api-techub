const express = require('express');
const router = express.Router();
const productsController = require('../controller/products');
const searchController = require('../controller/search');
const authMiddleware = require('../middleware/auth');

// Get Data Products
router.get('/product', productsController.getProducts);
// Post Data Products
router.post('/product', authMiddleware.checkAuth, productsController.addProductsWithPicture);

// Get data product by id
router.get('/product/:productId', productsController.getProductById);
router.get('/picture_product/:productId', productsController.getPictureById);

// Search product
router.get('/productSearch', searchController.searchProduct);

// Edit product by Id
router.patch('/product/:productId', authMiddleware.checkAuth, productsController.editProducts);

// // Delete product by id
router.delete('/product/:productId', authMiddleware.checkAuth, productsController.deleteProducts);

module.exports = router;