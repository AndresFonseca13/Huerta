const pool = require('../../config/db');

const updateCocktailService = async (id, name, price, description, ingredients, images, categories, user) => {
  
  try {
    // 1. Verificar si existe el cóctel
    const checkQuery = 'SELECT * FROM products WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      throw new Error('El cóctel no existe');
    }

    await pool.query('BEGIN');

    // 2. Actualizar datos básicos del cóctel
    const updateQuery = `
        UPDATE products
        SET name = $1, price = $2, description = $3, updated_by = $4
        WHERE id = $5
        RETURNING id, name, price, description
        `;
    const updateResult = await pool.query(updateQuery, [name, price, description, user, id]);

    // 3. Eliminar relaciones antiguas de ingredientes
    await pool.query('DELETE FROM products_ingredients WHERE product_id = $1', [id]);

    // 4. Insertar o vincular nuevos ingredientes
    const ingredientsIds = [];
    for (const ingrediente of ingredients) {
      const insertOrGet = `
        INSERT INTO ingredients (name)
        VALUES ($1)
        ON CONFLICT (name) DO NOTHING
        RETURNING id
      `;
      const insertResult = await pool.query(insertOrGet, [ingrediente]);

      let ingredienteId;
      if (insertResult.rows.length > 0) {
        ingredienteId = insertResult.rows[0].id;
      } else {
        const existing = await pool.query('SELECT id FROM ingredients WHERE name = $1', [ingrediente]);
        ingredienteId = existing.rows[0].id;
      }

      await pool.query('INSERT INTO products_ingredients (product_id, ingredient_id) VALUES ($1, $2)', [id, ingredienteId]);
    }

    // 5. Eliminar imágenes anteriores
    await pool.query('DELETE FROM images WHERE product_id = $1', [id]);

    // 6. Insertar nuevas imágenes
    for (const url of images) {
      await pool.query('INSERT INTO images (product_id, url) VALUES ($1, $2)', [id, url]);
    }

    await pool.query('DELETE FROM images WHERE product_id = $1', [id]);

    for (const url of images) {
      await pool.query('INSERT INTO images (product_id, url) VALUES ($1, $2)', [id, url]);
    }

    await pool.query('DELETE FROM products_categories WHERE product_id = $1', [id]);

    for (const { name: categoryName, type: categoryType } of categories) {
      const insertCategoryQuery = `
        INSERT INTO categories (name, type)
        VALUES ($1, $2)
        ON CONFLICT (name, type) DO NOTHING
        RETURNING id;
      `;
      const result = await pool.query(insertCategoryQuery, [categoryName, categoryType]);

      let categoryId;
      if (result.rows.length > 0) {
        categoryId = result.rows[0].id;
      } else {
        const existingQuery = 'SELECT id FROM categories WHERE name = $1 AND type = $2';
        const existingResult = await pool.query(existingQuery, [categoryName, categoryType]);
        categoryId = existingResult.rows[0].id;
      }

      await pool.query('INSERT INTO products_categories (product_id, category_id) VALUES ($1, $2)', [id, categoryId]);
    }

    await pool.query('COMMIT');

    return {
      ...updateResult.rows[0],
      ingredients,
      images,
      categories
    };
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
};
module.exports = updateCocktailService;