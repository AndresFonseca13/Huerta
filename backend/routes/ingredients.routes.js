const express = require("express");
const router = express.Router();
const ingredientController = require("../controllers/ingredientController");
const authMiddleware = require("../middleware/authMiddleware");
const normalizeTextFields = require("../middleware/normalizeTextFields");

router.post(
	"/",
	normalizeTextFields,
	authMiddleware,
	ingredientController.createIngredient
);
router.delete("/:id", authMiddleware, ingredientController.deleteIngredient);
router.put(
	"/:id",
	normalizeTextFields,
	authMiddleware,
	ingredientController.updateIngredient
);
router.get("/", ingredientController.getAllIngredients);
router.get("/search", ingredientController.searchIngredient);
router.get("/:id", ingredientController.getIngredientById);

module.exports = router;
