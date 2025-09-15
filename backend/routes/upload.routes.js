import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { upload, handleMulterError } from '../middleware/uploadMiddleware.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRoles from '../middleware/requireRoles.js';

const router = express.Router();

router.post(
  '/upload',
  authMiddleware,
  requireRoles(['admin', 'ventas', 'chef', 'barmanager']),
  upload.array('images', 5), // Permitir hasta 5 imágenes
  handleMulterError,
  uploadImage,
);

export default router;
