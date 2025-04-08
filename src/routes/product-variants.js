const express = require('express');
const router = express.Router();
const productVariantsController = require('../controller/product-variants');
const authMiddleware = require('../middleware/auth');

router.post('/product_variants', authMiddleware.checkAuth, productVariantsController.createProductVariants);
router.get('/product_variants', authMiddleware.checkAuth, productVariantsController.getProductVariants);

module.exports = router;