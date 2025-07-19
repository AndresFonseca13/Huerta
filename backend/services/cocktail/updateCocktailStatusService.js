import pool from '../../config/db.js';

const updateCocktailStatusService = async (cocktailId, isActive) => {
  console.log('[DEBUG] updateCocktailStatusService - Parámetros:', {
    cocktailId,
    isActive,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Actualizar el estado is_active del cóctel
    const updateQuery = `
			UPDATE products 
			SET is_active = $1 
			WHERE id = $2 
			RETURNING id, name, price, description, is_active
		`;

    console.log(
      '[DEBUG] updateCocktailStatusService - Ejecutando query:',
      updateQuery,
    );
    console.log('[DEBUG] updateCocktailStatusService - Valores:', [
      isActive,
      cocktailId,
    ]);

    const result = await client.query(updateQuery, [isActive, cocktailId]);

    console.log(
      '[DEBUG] updateCocktailStatusService - Resultado de actualización:',
      result.rows[0],
    );

    if (result.rows.length === 0) {
      throw new Error('Cóctel no encontrado.');
    }

    // Obtener el cóctel completo con sus relaciones
    const completeCocktailQuery = `
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

    const completeResult = await client.query(completeCocktailQuery, [
      cocktailId,
    ]);

    // Procesar los resultados para limpiar los arrays
    const cocktail = completeResult.rows[0];
    if (cocktail) {
      cocktail.ingredients = cocktail.ingredients.filter(
        (ingredient) => ingredient !== null,
      );
      cocktail.categories = cocktail.categories.filter(
        (category) => category !== null,
      );
      cocktail.images = cocktail.images.filter((image) => image !== null);
    }

    await client.query('COMMIT');
    return cocktail;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en el servicio de actualización de estado:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default updateCocktailStatusService;
