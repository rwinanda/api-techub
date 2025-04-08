const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categories');
const authMiddleware = require('../middleware/auth');

router.post('/category', authMiddleware.checkAuth, categoryController.addCategory);
router.get('/category', categoryController.getCategory);

// Get Category by id
router.get('/category/:categoryId', categoryController.getCategoryId);


module.exports = router;