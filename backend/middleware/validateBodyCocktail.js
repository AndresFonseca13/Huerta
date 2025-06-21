const validateBodyCocktail = (req, res, next) => {
	const { name, price, description, ingredients, images, categories } =
		req.body;

	if (
		!name ||
		typeof name !== "string" ||
		!description ||
		typeof description !== "string" ||
		price === undefined ||
		isNaN(parseFloat(price)) ||
		price <= 0 ||
		!Array.isArray(ingredients) ||
		ingredients.length === 0 ||
		!Array.isArray(images) ||
		images.length === 0 ||
		!Array.isArray(categories) ||
		categories.length === 0
	) {
		return res.status(400).json({
			mensaje: "Datos inválidos o faltantes en el cuerpo del cóctel.",
		});
	}

	next();
};

module.exports = validateBodyCocktail;
