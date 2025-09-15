import express from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRoles from '../middleware/requireRoles.js';

const router = express.Router();

// Solo admin o ventas pueden crear usuarios (según requerimiento actual)
router.post(
  '/signup',
  authMiddleware,
  requireRoles(['admin']),
  authController.signup,
);
router.post('/login', authController.login);

export default router;
