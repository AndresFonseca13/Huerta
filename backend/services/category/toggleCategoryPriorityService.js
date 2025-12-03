import pool from '../../config/db.js';

/**
 * Cambia el estado de prioridad de una categoría
 * @param {string} id - ID de la categoría
 * @param {boolean} is_priority - Nuevo estado de prioridad
 * @returns {Promise<Object>} Categoría actualizada
 */
const toggleCategoryPriorityService = async (id, is_priority) => {
  const checkQuery = 'SELECT * FROM categories WHERE id = $1';
  const checkResult = await pool.query(checkQuery, [id]);
  if (checkResult.rows.length === 0) {
    throw new Error('Categoría no encontrada');
  }

  try {
    await pool.query('BEGIN');
    const updateQuery =
      'UPDATE categories SET is_priority = $1 WHERE id = $2 RETURNING id, name, type, is_active, is_priority';
    const result = await pool.query(updateQuery, [is_priority, id]);
    await pool.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
};

export default toggleCategoryPriorityService;

