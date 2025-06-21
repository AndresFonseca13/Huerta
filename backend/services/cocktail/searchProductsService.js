const pool = require("../../config/db");

const searchProductsService = async (searchTerm) => {
	try {
		const query = `
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.is_active,
                p.created_at,
                p.updated_at,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', c.id,
                            'name', c.name,
                            'type', c.type
                        )
                    ) FILTER (WHERE c.id IS NOT NULL),
                    '[]'
                ) as categories,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', i.id,
                            'url', i.url
                        )
                    ) FILTER (WHERE i.id IS NOT NULL),
                    '[]'
                ) as images
            FROM products p
            LEFT JOIN products_categories pc ON p.id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.id
            LEFT JOIN images i ON p.id = i.product_id
            WHERE LOWER(p.name) LIKE LOWER($1)
            GROUP BY p.id, p.name, p.description, p.price, p.is_active, p.created_at, p.updated_at
            ORDER BY p.name ASC;
        `;

		const result = await pool.query(query, [`%${searchTerm}%`]);

		// Limpiar los resultados para manejar productos sin categorías o imágenes
		const products = result.rows.map((product) => ({
			...product,
			categories: product.categories[0] === null ? [] : product.categories,
			images: product.images[0] === null ? [] : product.images,
		}));

		return products;
	} catch (error) {
		console.error("Error en searchProductsService:", error);
		throw new Error("Error al buscar productos");
	}
};

module.exports = searchProductsService;
