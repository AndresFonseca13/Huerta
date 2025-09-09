import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRoles from '../middleware/requireRoles.js';
import normalizeTextFields from '../middleware/normalizeTextFields.js';

const router = express.Router();

// Crear categorías - Admin, ventas, chef y barmanager pueden crear
router.post(
  '/',
  normalizeTextFields,
  authMiddleware,
  requireRoles(['admin', 'ventas', 'chef', 'barmanager']),
  categoryController.createCategory,
);

// Eliminar categorías - Admin, ventas, chef y barmanager pueden eliminar
router.delete(
  '/:id',
  authMiddleware,
  requireRoles(['admin', 'ventas', 'chef', 'barmanager']),
  categoryController.deleteCategory,
);

// Actualizar categorías - Admin, ventas, chef y barmanager pueden editar
router.put(
  '/:id',
  normalizeTextFields,
  authMiddleware,
  requireRoles(['admin', 'ventas', 'chef', 'barmanager']),
  categoryController.updateCategory,
);

// Públicas - Todos pueden ver categorías
router.get('/', categoryController.getAllCategories);
router.get('/search', categoryController.searchCategory);
router.get('/:id', categoryController.getCategoryById);

// Cambiar estado de categorías - Admin, ventas, chef y barmanager pueden cambiar
router.patch(
  '/:id/active',
  authMiddleware,
  requireRoles(['admin', 'ventas', 'chef', 'barmanager']),
  categoryController.setCategoryActive,
);

export default router;
