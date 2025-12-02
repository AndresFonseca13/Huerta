import pool from '../../config/db.js';
import { ConflictError } from '../../errors/conflictError.js';

const createCategoryService = async (name, type, is_active = true) => {
  const checkQuery = 'SELECT * FROM categories WHERE name = $1 AND type = $2';
  const checkResult = await pool.query(checkQuery, [name, type]);
  if (checkResult.rows.length > 0) {
    throw new ConflictError('La categoría ya existe');
  }

  try {
    await pool.query('BEGIN');
    const insertCategoryQuery =
      'INSERT INTO categories (name, type, is_active) VALUES ($1, $2, $3) RETURNING id, name, type, is_active';
    const categoryResult = await pool.query(insertCategoryQuery, [
      name,
      type,
      is_active,
    ]);

    await pool.query('COMMIT');

    return categoryResult.rows[0];
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
};

export default createCategoryService;
