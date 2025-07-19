import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { upload, handleMulterError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/upload',
  // authMiddleware,
  upload.array('images', 5), // Permitir hasta 5 imágenes
  handleMulterError,
  uploadImage,
);

export default router;
