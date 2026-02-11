import express from 'express';
import AuthMiddleware from '../middleware/auth.js';
import { addCategory, deleteCategory, getCategory, getCategoryId, updateCategoryById } from '../controller/categories.js';
const categoryRouter = express.Router();


// router.post('/', AuthMiddleware.checkAuth, addCategory);
categoryRouter.post('/', addCategory);
categoryRouter.get('/', getCategory);

// Get Category by id
categoryRouter.get('/:categoryId', getCategoryId);

categoryRouter.delete('/:categoryId', deleteCategory);
categoryRouter.patch('/:categoryId', updateCategoryById);

export default categoryRouter;