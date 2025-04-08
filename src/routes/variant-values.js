const express = require('express');
const router = express.Router();
const variantValueController = require('../controller/variant-values');
const authMiddleware = require('../middleware/auth');

router.post('/variant_values', variantValueController.createVariantValues);
router.get('/variant_values', authMiddleware.checkAuth);

module.exports = router;