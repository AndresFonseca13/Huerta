const pool = require("../../config/db");

const getAllCocktailsService = async ({
	categoria,
	tipo,
	orden,
	limite,
	offset,
}) => {
	const ordenValido = ["name", "price"].includes(orden) ? orden : "name";

	// Consulta principal para obtener los cocteles
	const query = `
    SELECT p.id, p.name, p.price, p.description,
           array_agg(DISTINCT i.name) AS ingredients,
           array_agg(DISTINCT c.name) AS categories,
           array_agg(DISTINCT img.url) AS images
    FROM products p
    LEFT JOIN products_ingredients pi ON p.id = pi.product_id
    LEFT JOIN ingredients i ON pi.ingredient_id = i.id
    LEFT JOIN products_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN images img ON p.id = img.product_id
    WHERE ($1::text IS NULL OR c.name = $1)
      AND ($2::text IS NULL OR c.type = $2)
    GROUP BY p.id
    ORDER BY p."${ordenValido}"
    LIMIT $3 OFFSET $4
  `;

	// Consulta para contar el total de registros
	const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    LEFT JOIN products_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    WHERE ($1::text IS NULL OR c.name = $1)
      AND ($2::text IS NULL OR c.type = $2)
  `;

	const values = [categoria, tipo, limite, offset];
	const countValues = [categoria, tipo];

	// Ejecutar ambas consultas en paralelo
	const [result, countResult] = await Promise.all([
		pool.query(query, values),
		pool.query(countQuery, countValues),
	]);

	// Procesar los resultados para limpiar los arrays
	const processedCocktails = result.rows.map((cocktail) => {
		// Filtrar valores null de ingredientes, categorías e imágenes
		cocktail.ingredients = cocktail.ingredients.filter(
			(ingredient) => ingredient !== null
		);
		cocktail.categories = cocktail.categories.filter(
			(category) => category !== null
		);
		cocktail.images = cocktail.images.filter((image) => image !== null);
		return cocktail;
	});

	const totalRecords = parseInt(countResult.rows[0].total);
	const totalPages = Math.ceil(totalRecords / limite);

	return {
		cocktails: processedCocktails,
		pagination: {
			totalRecords,
			totalPages,
			currentPage: Math.floor(offset / limite) + 1,
			limit: limite,
			offset: offset,
		},
	};
};

module.exports = getAllCocktailsService;
