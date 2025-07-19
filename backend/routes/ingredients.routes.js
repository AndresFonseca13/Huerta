import express from 'express';
import ingredientController from '../controllers/ingredientController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import normalizeTextFields from '../middleware/normalizeTextFields.js';

const router = express.Router();

router.post(
  '/',
  normalizeTextFields,
  authMiddleware,
  ingredientController.createIngredient
);
router.delete('/:id', authMiddleware, ingredientController.deleteIngredient);
router.put(
  '/:id',
  normalizeTextFields,
  authMiddleware,
  ingredientController.updateIngredient
);
router.get('/', ingredientController.getAllIngredients);
router.get('/search', ingredientController.searchIngredient);
router.get('/:id', ingredientController.getIngredientById);

export default router;
