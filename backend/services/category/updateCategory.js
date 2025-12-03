import pool from '../../config/db.js';

const updateCategory = async (id, name, type, is_active, is_priority) => {
  const checkQuery = 'SELECT * FROM categories WHERE id = $1';
  const checkResult = await pool.query(checkQuery, [id]);
  if (checkResult.rows.length === 0) {
    throw new Error('Categoría no encontrada');
  }

  const current = checkResult.rows[0];
  const newName = name !== null && name !== undefined ? name : current.name;
  const newType = type !== null && type !== undefined ? type : current.type;

  try {
    await pool.query('BEGIN');
    let updateCategoryQuery, result;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (newName !== current.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(newName);
    }
    if (newType !== current.type) {
      updates.push(`type = $${paramIndex++}`);
      values.push(newType);
    }
    if (typeof is_active === 'boolean') {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }
    if (typeof is_priority === 'boolean') {
      updates.push(`is_priority = $${paramIndex++}`);
      values.push(is_priority);
    }

    if (updates.length === 0) {
      // No hay cambios, devolver la categoría actual
      await pool.query('COMMIT');
      return current;
    }

    values.push(id);
    updateCategoryQuery = `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, type, is_active, is_priority`;
    result = await pool.query(updateCategoryQuery, values);
    await pool.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
};

export default updateCategory;
