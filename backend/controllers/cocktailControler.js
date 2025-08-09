import cocktailsService from "../services/cocktail/index.js";

const getAllCocktails = async (req, res) => {
	const pagina = parseInt(req.query.page || req.query.pagina) || 1;
	const limite = parseInt(req.query.limit || req.query.limite) || 10;
	const offset = (pagina - 1) * limite;

	const categoria = req.query.categoria || null;
	const tipo = req.query.tipo || null;
	const orden = req.query.orden || "name";

	try {
		const result = await cocktailsService.getAllCocktailsService({
			categoria,
			tipo,
			orden,
			limite,
			offset,
		});

		const response = {
			pagina,
			limite,
			cantidad: result.cocktails.length,
			cocteles: result.cocktails,
			paginacion: result.pagination,
		};

		res.status(200).json(response);
	} catch (error) {
		console.error("Error al obtener los cócteles:", error);
		res.status(500).json({ mensaje: "Error al obtener los cócteles" });
	}
};

const getAllCocktailsAdmin = async (req, res) => {
	const pagina = parseInt(req.query.page || req.query.pagina) || 1;
	const limite = parseInt(req.query.limit || req.query.limite) || 10;
	const offset = (pagina - 1) * limite;

	const categoria = req.query.categoria || null;
	const tipo = req.query.tipo || null;
	const orden = req.query.orden || "name";

	try {
		const result = await cocktailsService.getAllCocktailsAdminService({
			categoria,
			tipo,
			orden,
			limite,
			offset,
		});

		const response = {
			pagina,
			limite,
			cantidad: result.cocktails.length,
			cocteles: result.cocktails,
			paginacion: result.pagination,
		};

		res.status(200).json(response);
	} catch (error) {
		console.error("Error al obtener los cócteles para admin:", error);
		res.status(500).json({ mensaje: "Error al obtener los cócteles" });
	}
};

// Nuevo: Solo productos que tienen la categoría 'comida'
const getFoodProducts = async (req, res) => {
	const pagina = parseInt(req.query.page || req.query.pagina) || 1;
	const limite = parseInt(req.query.limit || req.query.limite) || 10;
	const offset = (pagina - 1) * limite;

	const categoria = req.query.categoria || null; // categoría adicional específica
	const orden = req.query.orden || "name";

	try {
		const result = await cocktailsService.getFoodProductsService({
			categoria,
			limite,
			offset,
			orden,
		});

		const response = {
			pagina,
			limite,
			cantidad: result.cocktails.length,
			cocteles: result.cocktails,
			paginacion: result.pagination,
		};

		res.status(200).json(response);
	} catch (error) {
		console.error("Error al obtener la comida:", error);
		res.status(500).json({ mensaje: "Error al obtener la comida" });
	}
};

const getCocktailById = async (req, res) => {
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
		const cocktail = await cocktailsService.getCocktailByIdService(id);
		if (!cocktail) {
			return res.status(404).json({ mensaje: "Cóctel no encontrado" });
		}
		res.status(200).json(cocktail);
	} catch (error) {
		console.error("Error al obtener el cóctel:", error);
		res.status(500).json({ mensaje: "Error al obtener el cóctel", error });
	}
};

const createCocktail = async (req, res) => {
	const { name, price, description, ingredients, images, categories } =
		req.body;
	const user = req.user.id;

	try {
		const cocktail = await cocktailsService.createCocktailService(
			name,
			price,
			description,
			ingredients,
			images,
			categories,
			user
		);
		res.status(201).json({ mensaje: "Cóctel creado exitosamente", cocktail });
	} catch (error) {
		if (error.name === "ValidationError") {
			return res.status(400).json({ mensaje: error.message });
		}
		if (error.name === "ConflictError") {
			return res.status(409).json({ mensaje: error.message });
		}
		console.error("Error al crear el cóctel:", error);
		res.status(500).json({ mensaje: "Error interno al crear el cóctel" });
	}
};

const updateCocktail = async (req, res) => {
	const { id } = req.params;
	const cocktailData = req.body; // Un solo objeto con todos los datos

	try {
		const updatedCocktail = await cocktailsService.updateCocktailService(
			id,
			cocktailData
		);
		res.status(200).json({
			mensaje: "Cóctel actualizado exitosamente",
			cocktail: updatedCocktail,
		});
	} catch (error) {
		if (error.message === "Cóctel no encontrado.") {
			return res.status(404).json({ mensaje: error.message });
		}
		console.error("Error al actualizar el cóctel:", error);
		res.status(500).json({ mensaje: "Error interno al actualizar el cóctel" });
	}
};

const updateCocktailStatus = async (req, res) => {
	const { id } = req.params;
	const { isActive } = req.body;

	try {
		const updatedCocktail = await cocktailsService.updateCocktailStatusService(
			id,
			isActive
		);
		res.status(200).json({
			mensaje: "Estado del cóctel actualizado exitosamente",
			cocktail: updatedCocktail,
		});
	} catch (error) {
		if (error.message === "Cóctel no encontrado.") {
			return res.status(404).json({ mensaje: error.message });
		}
		console.error("Error al actualizar el estado del cóctel:", error);
		res
			.status(500)
			.json({ mensaje: "Error interno al actualizar el estado del cóctel" });
	}
};

const deleteCocktail = async (req, res) => {
	const { id } = req.params;

	try {
		const deletedCocktail = await cocktailsService.deleteCocktailService(id);
		if (!deletedCocktail) {
			return res.status(404).json({ mensaje: "Cóctel no encontrado" });
		}
		res.status(200).json({ mensaje: "Cóctel eliminado exitosamente" });
	} catch (error) {
		console.error("Error al eliminar el cóctel:", error);
		res.status(500).json({ mensaje: "Error al eliminar el cóctel", error });
	}
};

const searchProducts = async (req, res) => {
	const { searchTerm } = req.query;

	if (!searchTerm || searchTerm.trim().length === 0) {
		return res.status(400).json({
			mensaje: "Término de búsqueda requerido",
			error: "Debe proporcionar un término de búsqueda",
		});
	}

	try {
		const products = await cocktailsService.searchProductsService(
			searchTerm.trim()
		);
		res.status(200).json({
			mensaje: "Búsqueda realizada exitosamente",
			productos: products,
			total: products.length,
		});
	} catch (error) {
		console.error("Error al buscar productos:", error);
		res.status(500).json({
			mensaje: "Error al buscar productos",
			error: "Error interno del servidor",
		});
	}
};

export default {
	getAllCocktails,
	getAllCocktailsAdmin,
	getCocktailById,
	createCocktail,
	updateCocktail,
	updateCocktailStatus,
	deleteCocktail,
	searchProducts,
	getFoodProducts,
};
