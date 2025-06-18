const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categories');
const authMiddleware = require('../middleware/auth');

router.post('/category', authMiddleware.checkAuth, categoryController.addCategory);
router.get('/category', categoryController.getCategory);

// Get Category by id
router.get('/category/:categoryId', categoryController.getCategoryId);

router.delete('/category/:categoryId', categoryController.deleteCategory)
router.patch('/category/:categoryId', categoryController.updateCategoryById)

module.exports = router;