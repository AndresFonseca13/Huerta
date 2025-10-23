import pool from '../../config/db.js';
import { ConflictError, ValidationError } from '../../errors/errors.js';

const createProductService = async (
  name,
  price,
  description,
  ingredients,
  images,
  categories,
  userid,
  alcoholPercentage = null,
) => {
  if (
    !name ||
		!price ||
		!description ||
		!categories ||
		!Array.isArray(categories) ||
		categories.length === 0
  ) {
    throw new ValidationError(
      'Nombre, precio, descripción y categorías son obligatorios',
    );
  }

  const checkQuery = 'SELECT * FROM products WHERE name = $1';
  const checkResult = await pool.query(checkQuery, [name]);
  if (checkResult.rows.length > 0) {
    throw new ConflictError('El producto ya existe');
  }
  try {
    await pool.query('BEGIN');
    const insertProductQuery =
			'INSERT INTO products (name, price, description, created_by, alcohol_percentage) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, price, description, alcohol_percentage';
    const productResult = await pool.query(insertProductQuery, [
      name,
      price,
      description,
      userid,
      alcoholPercentage,
    ]);
    const productId = productResult.rows[0].id;

    const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
    const ingredientsIds = [];
    for (const ingredient of safeIngredients) {
      const ingredientQuery = `
                INSERT INTO ingredients (name) 
                VALUES ($1) 
                ON CONFLICT (name) DO NOTHING 
                RETURNING id
                `;
      const ingredientResult = await pool.query(ingredientQuery, [ingredient]);
      if (ingredientResult.rows.length > 0) {
        ingredientsIds.push(ingredientResult.rows[0].id);
      } else {
        const existingIngredientQuery =
					'SELECT id FROM ingredients WHERE name = $1';
        const existingIngredientResult = await pool.query(
          existingIngredientQuery,
          [ingredient],
        );
        ingredientsIds.push(existingIngredientResult.rows[0].id);
      }
    }

    for (const ingredientId of ingredientsIds) {
      const relacionQuery =
				'INSERT INTO products_ingredients (product_id, ingredient_id) VALUES ($1, $2)';
      await pool.query(relacionQuery, [productId, ingredientId]);
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
        categoryType,
      ]);

      let categoryId;
      if (result.rows.length > 0) {
        categoryId = result.rows[0].id;
      } else {
        const existingQuery =
					'SELECT id FROM categories WHERE name = $1 AND type = $2';
        const existingResult = await pool.query(existingQuery, [
          categoryName,
          categoryType,
        ]);
        categoryId = existingResult.rows[0].id;
      }

      await pool.query(
        'INSERT INTO products_categories (product_id, category_id) VALUES ($1, $2)',
        [productId, categoryId],
      );
    }

    const safeImages = Array.isArray(images) ? images : [];
    for (const url of safeImages) {
      const insertPhotoQuery = `
            INSERT INTO images (product_id, url)
            VALUES ($1, $2)
            `;
      await pool.query(insertPhotoQuery, [productId, url]);
    }

    await pool.query('COMMIT');

    const completeProductQuery = `
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
    const completeResult = await pool.query(completeProductQuery, [productId]);
    const product = completeResult.rows[0];
    if (product) {
      product.ingredients = (product.ingredients || []).filter(
        (x) => x !== null,
      );
      product.categories = product.categories || [];
      product.images = (product.images || []).filter((x) => x !== null);
    }
    return product;
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('⛔ Error en el servicio de creación:', error);
    throw error;
  }
};

export default createProductService;
