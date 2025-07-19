import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import normalizeTextFields from '../middleware/normalizeTextFields.js';

const router = express.Router();

router.post(
  '/',
  normalizeTextFields,
  authMiddleware,
  categoryController.createCategory
);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);
router.put(
  '/:id',
  normalizeTextFields,
  authMiddleware,
  categoryController.updateCategory
);
router.get('/', categoryController.getAllCategories);
router.get('/search', categoryController.searchCategory);
router.get('/:id', categoryController.getCategoryById);
router.patch(
  '/:id/active',
  authMiddleware,
  categoryController.setCategoryActive
);

export default router;
