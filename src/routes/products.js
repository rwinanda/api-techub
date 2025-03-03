const express = require('express');
const router = express.Router();
const productsController = require('../controller/products');
const authMiddleware = require('../middleware/auth');

// Get Data Products
router.get('/product', authMiddleware.checkAuth, productsController.getProducts);

// Post Data Products
router.post('/product', authMiddleware.checkAuth, productsController.addProducts);

// Get Data by Id
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    if (id === 'special') {
        res.status(200).json({
            message: `You discovered ID with ${id}`,
            id: id
        });
    } else {
        res.status(200).json({
            message: 'You passed an ID'
        });
    }
});

// Edit product by Id
router.patch('/:productId');

// Delete product by id
router.delete('/:productId');

module.exports = router;