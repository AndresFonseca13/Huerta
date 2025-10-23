import express from 'express';
import promotionController from '../controllers/promotionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRoles from '../middleware/requireRoles.js';

const router = express.Router();

// Público: consultar promoción vigente para mostrar en landing
router.get('/eligible-now', promotionController.eligibleNow);

// Admin: CRUD
router.get(
  '/',
  authMiddleware,
  requireRoles(['admin', 'ventas', 'chef', 'barmanager']),
  promotionController.list,
);
router.post(
  '/',
  authMiddleware,
  requireRoles(['admin', 'ventas', 'chef', 'barmanager']),
  promotionController.create,
);
router.put(
  '/:id',
  authMiddleware,
  requireRoles(['admin', 'ventas', 'chef', 'barmanager']),
  promotionController.update,
);
router.delete(
  '/:id',
  authMiddleware,
  requireRoles(['admin', 'ventas', 'chef', 'barmanager']),
  promotionController.remove,
);

export default router;
