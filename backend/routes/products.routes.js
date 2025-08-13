import express from 'express';
import productController from '../controllers/productController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import normalizeTextFields from '../middleware/normalizeTextFields.js';

const router = express.Router();

// Públicas
router.get('/', productController.getAllProducts);
router.get('/food', productController.getFoodProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);

// Protegidas
router.get('/admin/all', authMiddleware, productController.getAllProductsAdmin);
router.post(
  '/',
  authMiddleware,
  normalizeTextFields,
  productController.createProduct,
);
router.put(
  '/:id',
  authMiddleware,
  normalizeTextFields,
  productController.updateProduct,
);
router.patch(
  '/:id/status',
  authMiddleware,
  productController.updateProductStatus,
);
router.delete('/:id', authMiddleware, productController.deleteProduct);

export default router;
