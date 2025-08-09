import express from "express";
import cocktailController from "../controllers/cocktailControler.js";
import validateBodyCocktail from "../middleware/validateBodyCocktail.js";
import validateCategories from "../middleware/validateCategories.js";
import validateIngredients from "../middleware/validateIngredients.js";
import authMiddleware from "../middleware/authMiddleware.js";
import normalizeTextFields from "../middleware/normalizeTextFields.js";

const router = express.Router();

// Rutas públicas
router.get("/", cocktailController.getAllCocktails);
router.get("/food", cocktailController.getFoodProducts); // debe ir antes de '/:id'
router.get("/search", cocktailController.searchProducts);

// Rutas con parámetros
router.get("/:id", cocktailController.getCocktailById);

// Rutas protegidas (requieren autenticación)
router.get(
	"/admin/all",
	authMiddleware,
	cocktailController.getAllCocktailsAdmin
);
router.post(
	"/",
	authMiddleware,
	normalizeTextFields,
	validateBodyCocktail,
	validateCategories,
	validateIngredients,
	cocktailController.createCocktail
);
router.put(
	"/:id",
	authMiddleware,
	normalizeTextFields,
	validateBodyCocktail,
	validateCategories,
	validateIngredients,
	cocktailController.updateCocktail
);
router.patch(
	"/:id/status",
	authMiddleware,
	cocktailController.updateCocktailStatus
);
router.delete("/:id", authMiddleware, cocktailController.deleteCocktail);

export default router;
