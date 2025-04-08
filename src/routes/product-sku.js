const express = require('express');
const router = express.Router();
const productSkuController = require('../controller/product-sku');
const authMiddleware = require('../middleware/auth');

router.get('/product_sku', authMiddleware.checkAuth, productSkuController.getProductSku);
router.post('/product_sku', authMiddleware.checkAuth, productSkuController.createProductSku);

module.exports = router;