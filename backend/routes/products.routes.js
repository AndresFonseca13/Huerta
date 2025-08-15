import express from "express";
import productController from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRoles from "../middleware/requireRoles.js";
import normalizeTextFields from "../middleware/normalizeTextFields.js";

const router = express.Router();

// Públicas
router.get("/", productController.getAllProducts);
router.get("/food", productController.getFoodProducts);
router.get("/search", productController.searchProducts);
router.get("/:id", productController.getProductById);

// Protegidas - Admin, ventas, chef y barmanager pueden ver productos para gestionarlos
router.get(
	"/admin/all",
	authMiddleware,
	requireRoles(["admin", "ventas", "chef", "barmanager"]),
	productController.getAllProductsAdmin
);

// Crear productos - Admin, ventas, chef y barmanager pueden crear
router.post(
	"/",
	authMiddleware,
	requireRoles(["admin", "ventas", "chef", "barmanager"]),
	normalizeTextFields,
	productController.createProduct
);

// Actualizar productos - Admin, ventas, chef y barmanager pueden editar
router.put(
	"/:id",
	authMiddleware,
	requireRoles(["admin", "ventas", "chef", "barmanager"]),
	normalizeTextFields,
	productController.updateProduct
);

// Cambiar estado de productos - Solo admin y ventas
router.patch(
	"/:id/status",
	authMiddleware,
	requireRoles(["admin", "ventas"]),
	productController.updateProductStatus
);

// Eliminar productos - Admin, ventas, chef y barmanager pueden eliminar
router.delete(
	"/:id",
	authMiddleware,
	requireRoles(["admin", "ventas", "chef", "barmanager"]),
	productController.deleteProduct
);

export default router;
