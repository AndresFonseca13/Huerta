import pool from '../../config/db.js';

const deleteCategoryService = async (id, logical = true) => {
  // Verificar si la categoría existe
  const checkQuery = 'SELECT * FROM categories WHERE id = $1';
  const checkResult = await pool.query(checkQuery, [id]);
  if (checkResult.rows.length === 0) {
    throw new Error('Categoría no encontrada');
  }

  try {
    await pool.query('BEGIN');

    // Eliminar las relaciones de la categoría con los productos
    const deleteProductsQuery =
      'DELETE FROM products_categories WHERE category_id = $1';
    await pool.query(deleteProductsQuery, [id]);

    let result;
    if (logical) {
      // Borrado lógico
      const logicalDeleteQuery =
        'UPDATE categories SET is_active = false WHERE id = $1 RETURNING id, name, type, is_active';
      result = await pool.query(logicalDeleteQuery, [id]);
    } else {
      // Borrado físico
      const deleteCategoryQuery =
        'DELETE FROM categories WHERE id = $1 RETURNING id, name, type, is_active';
      result = await pool.query(deleteCategoryQuery, [id]);
    }

    await pool.query('COMMIT');

    if (result.rows.length === 0) {
      throw new Error('Categoría no encontrada');
    }

    return result.rows[0];
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
};

export default deleteCategoryService;
