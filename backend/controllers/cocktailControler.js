const cocktailsService = require("../services/cocktail/index");

const getAllCocktails = async (req, res) => {
	const pagina = parseInt(req.query.pagina) || 1;
	const limite = parseInt(req.query.limite) || 10;
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

		res.status(200).json({
			pagina,
			limite,
			cantidad: result.cocktails.length,
			cocteles: result.cocktails,
			paginacion: result.pagination,
		});
	} catch (error) {
		console.error("Error al obtener los cócteles:", error);
		res.status(500).json({ mensaje: "Error al obtener los cócteles" });
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
	// const user = req.user.id;
	const user = "e4b661fe-04bc-4532-8b41-a2bf9717dc98";

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
	const { name, price, description, ingredients, images, categories } =
		req.body;
	const user = req.user.id;

	try {
		const updatedCocktail = await cocktailsService.updateCocktailService(
			id,
			name,
			price,
			description,
			ingredients,
			images,
			categories,
			user
		);
		res
			.status(200)
			.json({ mensaje: "Cóctel actualizado exitosamente", updatedCocktail });
	} catch (error) {
		console.error("Error al actualizar el cóctel:", error);
		res.status(500).json({ mensaje: "Error al actualizar el cóctel" });
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

module.exports = {
	getAllCocktails,
	getCocktailById,
	createCocktail,
	updateCocktail,
	deleteCocktail,
	searchProducts,
};
