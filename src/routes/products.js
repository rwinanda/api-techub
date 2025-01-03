const express = require('express');
const router = express.Router();

// Get Data Products
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET request to /products'
    });
});

// Post Data Products
router.post('/', (req, res, next) => {
    const product = {
        name: req.body.name,
        price: req.body.price
    };
    res.status(201).json({
        message: 'Handling POST request to /products',
        createdProduct: product
    });
});

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
router.patch('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Updated Product'
    });
});

// Delete product by id
router.delete('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Deleted Product'
    });
});

module.exports = router;