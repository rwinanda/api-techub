const express = require('express');
const router = express.Router();
const productsController = require('../controller/products');
const authMiddleware = require('../middleware/auth');

// Get Data Products
router.get('/product', authMiddleware.checkAuth, productsController.getProducts);
// Post Data Products
router.post('/product', authMiddleware.checkAuth, productsController.addProducts);

// Get product by id
router.get('/product/:productId', productsController.getProductById);
router.get('/picture_product/:productId', productsController.getPictureById);


// Edit product by Id
// router.patch('/:productId');

// // Delete product by id
// router.delete('/:productId');

module.exports = router;