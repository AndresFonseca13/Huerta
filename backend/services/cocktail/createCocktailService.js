import pool from '../../config/db.js';
import { ConflictError, ValidationError } from '../../errors/errors.js';

const createCocktailService = async (
  name,
  price,
  description,
  ingredients,
  images,
  categories,
  userid
) => {
  // Validación de campos obligatorios
  if (
    !name ||
    !price ||
    !description ||
    !ingredients ||
    !images ||
    !categories
  ) {
    throw new ValidationError('Todos los campos son obligatorios');
  }

  const checkQuery = 'SELECT * FROM products WHERE name = $1';
  const checkResult = await pool.query(checkQuery, [name]);
  if (checkResult.rows.length > 0) {
    throw new ConflictError('El cóctel ya existe');
  }
  try {
    await pool.query('BEGIN');
    const insertCocktailQuery =
      'INSERT INTO products (name, price, description, created_by) VALUES ($1, $2, $3, $4) RETURNING id, name, price, description';
    const cocktailResult = await pool.query(insertCocktailQuery, [
      name,
      price,
      description,
      userid
    ]);
    const cocktailId = cocktailResult.rows[0].id;

    const ingredientsIds = [];

    for (const ingredient of ingredients) {
      const ingredientQuery = `
                INSERT INTO ingredients (name) 
                VALUES ($1) 
                ON CONFLICT (name) DO NOTHING 
                RETURNING id
                `;
      const ingredientResult = await pool.query(ingredientQuery, [ingredient]);

      // Si el ingrediente ya existe, obtener su ID
      if (ingredientResult.rows.length > 0) {
        ingredientsIds.push(ingredientResult.rows[0].id);
      } else {
        const existingIngredientQuery =
          'SELECT id FROM ingredients WHERE name = $1';
        const existingIngredientResult = await pool.query(
          existingIngredientQuery,
          [ingredient]
        );
        ingredientsIds.push(existingIngredientResult.rows[0].id);
      }
    }

    // Relacionar el coctel con los ingredientes
    for (const ingredientId of ingredientsIds) {
      const relacionQuery =
        'INSERT INTO products_ingredients (product_id, ingredient_id) VALUES ($1, $2)';
      await pool.query(relacionQuery, [cocktailId, ingredientId]);
    }

    for (const { name: categoryName, type: categoryType } of categories) {
      const insertCategoryQuery = `
              INSERT INTO categories (name, type)
              VALUES ($1, $2)
              ON CONFLICT (name, type) DO NOTHING
              RETURNING id;
          `;
      const result = await pool.query(insertCategoryQuery, [
        categoryName,
        categoryType
      ]);

      let categoryId;
      if (result.rows.length > 0) {
        categoryId = result.rows[0].id;
      } else {
        const existingQuery =
          'SELECT id FROM categories WHERE name = $1 AND type = $2';
        const existingResult = await pool.query(existingQuery, [
          categoryName,
          categoryType
        ]);
        categoryId = existingResult.rows[0].id;
      }

      await pool.query(
        'INSERT INTO products_categories (product_id, category_id) VALUES ($1, $2)',
        [cocktailId, categoryId]
      );
    }

    for (const url of images) {
      const insertPhotoQuery = `
            INSERT INTO images (product_id, url)
            VALUES ($1, $2)
            `;
      await pool.query(insertPhotoQuery, [cocktailId, url]);
    }

    // Confirmamos la transaccion
    await pool.query('COMMIT');

    // Obtener el cóctel completo con ingredientes y categorías
    const completeCocktailQuery = `
			SELECT 
				p.id,
				p.name,
				p.price,
				p.description,
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
			GROUP BY p.id, p.name, p.price, p.description
		`;

    const completeResult = await pool.query(completeCocktailQuery, [
      cocktailId
    ]);

    // Procesar los resultados para limpiar los arrays
    const cocktail = completeResult.rows[0];
    if (cocktail) {
      // Filtrar valores null de ingredientes y categorías
      cocktail.ingredients = cocktail.ingredients.filter(
        (ingredient) => ingredient !== null
      );
      // No filtrar categorías por ahora para debug
      cocktail.categories = cocktail.categories || [];
      cocktail.images = cocktail.images.filter((image) => image !== null);
    }

    console.log('Cóctel completo devuelto:', cocktail);
    return cocktail;
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('⛔ Error en el servicio de creación:', error);
    // Re-lanzamos el error para que el controlador lo atrape
    throw error;
  }
};

export default createCocktailService;
