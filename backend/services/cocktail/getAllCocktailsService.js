import pool from "../../config/db.js";

const getAllCocktailsService = async ({
	categoria,
	tipo,
	orden,
	limite,
	offset,
}) => {
	// Construir la consulta base con interpolación directa
	const tipoFiltro = tipo
		? `AND p.id IN (
      SELECT pc3.product_id
      FROM products_categories pc3
      JOIN categories c3 ON pc3.category_id = c3.id
      WHERE c3.type = '${tipo}'
    )`
		: "";

	const query = `
    SELECT p.id, p.name, p.price, p.description, p.is_active,
           array_agg(DISTINCT i.name) AS ingredients,
           array_agg(DISTINCT c.name) AS categories,
           array_agg(DISTINCT img.url) AS images
    FROM products p
    LEFT JOIN products_ingredients pi ON p.id = pi.product_id
    LEFT JOIN ingredients i ON pi.ingredient_id = i.id
    LEFT JOIN products_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN images img ON p.id = img.product_id
    WHERE p.is_active = true
    ${
			categoria
				? `AND p.id IN (
      SELECT pc2.product_id
      FROM products_categories pc2
      JOIN categories c2 ON pc2.category_id = c2.id
      WHERE c2.name = '${categoria}'
    )`
				: ""
		}
    ${tipoFiltro}
    GROUP BY p.id, p.name, p.price, p.description, p.is_active
    ORDER BY p.name
    LIMIT ${limite} OFFSET ${offset}
  `;

	const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    WHERE p.is_active = true
    ${
			categoria
				? `AND p.id IN (
      SELECT pc2.product_id
      FROM products_categories pc2
      JOIN categories c2 ON pc2.category_id = c2.id
      WHERE c2.name = '${categoria}'
    )`
				: ""
		}
    ${tipoFiltro}
  `;

	// Ejecutar ambas consultas en paralelo
	const [result, countResult] = await Promise.all([
		pool.query(query),
		pool.query(countQuery),
	]);

	// Procesar los resultados para limpiar los arrays
	const processedCocktails = result.rows.map((cocktail) => {
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

export default getAllCocktailsService;
