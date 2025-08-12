import pool from "../../config/db.js";

const updateProductStatusService = async (productId, isActive) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const updateQuery = `
      UPDATE products 
      SET is_active = $1 
      WHERE id = $2 
      RETURNING id, name, price, description, is_active
    `;
		const result = await client.query(updateQuery, [isActive, productId]);
		if (result.rows.length === 0) {
			throw new Error("Cóctel no encontrado.");
		}

		const completeQuery = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.is_active,
        ARRAY_AGG(DISTINCT i.name) as ingredients,
        ARRAY_AGG(DISTINCT jsonb_build_object('name', c.name, 'type', c.type)) as categories,
        ARRAY_AGG(DISTINCT img.url) as images
      FROM products p
      LEFT JOIN products_ingredients pi ON p.id = pi.product_id
      LEFT JOIN ingredients i ON pi.ingredient_id = i.id
      LEFT JOIN products_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN images img ON p.id = img.product_id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.price, p.description, p.is_active
    `;
		const completeResult = await client.query(completeQuery, [productId]);
		const product = completeResult.rows[0];
		if (product) {
			product.ingredients = product.ingredients.filter((x) => x !== null);
			product.categories = product.categories.filter((x) => x !== null);
			product.images = product.images.filter((x) => x !== null);
		}
		await client.query("COMMIT");
		return product;
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error en el servicio de actualización de estado:", error);
		throw error;
	} finally {
		client.release();
	}
};

export default updateProductStatusService;
