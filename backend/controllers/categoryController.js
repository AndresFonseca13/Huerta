const { ConflictError } = require("../errors/ConflictError");
const categoryService = require("../services/category/index");
const { v4: uuidv4 } = require("uuid");

const createCategory = async (req, res) => {
	const { name, type } = req.body;
	try {
		const category = await categoryService.createCategoryService(name, type);
		res
			.status(201)
			.json({ mensaje: "Categoría creada exitosamente", category });
	} catch (err) {
		if (err instanceof ConflictError) {
			return res.status(409).json({ mensaje: err.message });
		}
		console.error("Error al crear la categoría:", err);
		res
			.status(500)
			.json({ mensaje: "Error interno del servidor", error: err.message });
	}
};

const deleteCategory = async (req, res) => {
	const { id } = req.params;
	if (!id) {
		return res.status(400).json({ mensaje: "ID de categoría es requerido" });
	}
	if (isNaN(id)) {
		return res
			.status(400)
			.json({ mensaje: "ID de categoría debe ser un número" });
	}

	try {
		const deletedCategory = await categoryService.deleteCategoryService(id);
		if (!deletedCategory) {
			return res.status(404).json({ mensaje: "Categoría no encontrada" });
		}
		res.status(200).json({ mensaje: "Categoría eliminada exitosamente" });
	} catch (error) {
		if (error.message === "Categoría no encontrada") {
			return res.status(404).json({ mensaje: error.message });
		}
		console.error("Error al eliminar la categoría:", error);
		res.status(500).json({
			mensaje: "Error al eliminar la categoría",
			error: error.message,
		});
	}
};

const getAllCategories = async (req, res) => {
	try {
		const categories = await categoryService.getAllCategoriesService();
		res.status(200).json(categories);
	} catch (error) {
		console.error("Error al obtener las categorías:", error);
		res.status(500).json({
			mensaje: "Error al obtener las categorías",
			error: error.message,
		});
	}
};

const getCategoryById = async (req, res) => {
	const { id } = req.params;

	// Validación del formato UUID
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!id || !uuidRegex.test(id)) {
		return res.status(400).json({
			mensaje: "ID inválido",
			error: "El ID debe ser un UUID válido",
			idRecibido: id,
		});
	}

	try {
		const category = await categoryService.getCategoryByIdService(id);
		if (!category) {
			return res.status(404).json({
				mensaje: "Categoría no encontrada",
				id: id,
			});
		}
		res.status(200).json(category);
	} catch (error) {
		console.error("Error al obtener la categoría:", error);
		res.status(500).json({
			mensaje: "Error al obtener la categoría",
			error: "Error interno del servidor",
			id: id,
		});
	}
};

const updateCategory = async (req, res) => {
	const { id } = req.params;
	const { name, type } = req.body;
	// Validación del formato UUID
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!id || !uuidRegex.test(id)) {
		return res.status(400).json({
			mensaje: "ID inválido",
			error: "El ID debe ser un UUID válido",
			idRecibido: id,
		});
	}
	if (!name || !type) {
		return res.status(400).json({ mensaje: "Nombre y tipo son requeridos" });
	}
	try {
		const updatedCategory = await categoryService.updateCategory(
			id,
			name,
			type
		);
		res.status(200).json({
			mensaje: "Categoría actualizada exitosamente",
			category: updatedCategory,
		});
	} catch (error) {
		if (error.message === "Categoría no encontrada") {
			return res.status(404).json({ mensaje: error.message });
		}
		console.error("Error al actualizar la categoría:", error);
		res.status(500).json({
			mensaje: "Error al actualizar la categoría",
			error: error.message,
		});
	}
};

const searchCategory = async (req, res) => {
	const {searchTerm} = req.query;

	if (!searchTerm || searchTerm.trim().length === 0) {
		return res.status(400).json({
			message: "Término de búsqueda requerido",
			error: "Debe proporcionar un término de búsqueda",
		});
	}
	
	try{
		const categories = await categoryService.searchCategoryService(searchTerm.trim());
		res.status(200).json({
			message: "Categorías encontradas exitosamente",
			categories
		});
	}catch(error){
		console.error("Error al buscar la categoría:", error);
		res.status(500).json({
			message: "Error al buscar la categoría",
			error: error.message,
		});
	}
}


module.exports = {
	createCategory,
	deleteCategory,
	getAllCategories,
	getCategoryById,
	updateCategory,
	searchCategory
	};
