import express from 'express';
import * as usersController from '../controllers/usersController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRoles from '../middleware/requireRoles.js';

const router = express.Router();

// Listar usuarios con su rol (solo admin/ventas)
router.get(
  '/',
  authMiddleware,
  requireRoles(['admin', 'ventas']),
  usersController.getAllUsers,
);

// Obtener usuario por id con su rol
router.get(
  '/:id',
  authMiddleware,
  requireRoles(['admin', 'ventas']),
  usersController.getUserById,
);

// Cambiar rol de usuario (solo admin)
router.patch(
  '/:id/role',
  authMiddleware,
  requireRoles(['admin', 'ventas']),
  usersController.updateUserRole,
);

// Actualizar estado activo/inactivo (solo admin)
router.patch(
  '/:id/status',
  authMiddleware,
  requireRoles(['admin', 'ventas']),
  usersController.updateUserStatus,
);

// Eliminar usuario (solo admin)
router.delete(
  '/:id',
  authMiddleware,
  requireRoles(['admin', 'ventas']),
  usersController.deleteUser,
);

export default router;
