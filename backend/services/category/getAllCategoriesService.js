import pool from '../../config/db.js';

/**
 * Obtiene todas las categorías con el conteo de productos asociados.
 * @param {boolean} showAll - Si es true, muestra todas las categorías; si es false, solo las activas.
 */
const getAllCategoriesService = async (showAll = false) => {
  console.log('getAllCategoriesService - Iniciando con showAll:', showAll);

  const query = `
        SELECT 
            c.id, 
            c.name, 
            c.type, 
            c.is_active,
            COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products_categories pc ON c.id = pc.category_id
        LEFT JOIN products p ON pc.product_id = p.id AND p.is_active = true
        ${showAll ? '' : 'WHERE c.is_active = true'}
        GROUP BY c.id, c.name, c.type, c.is_active
        ORDER BY c.name;
    `;

  console.log('getAllCategoriesService - Query SQL:', query);

  try {
    console.log('getAllCategoriesService - Ejecutando consulta...');
    const result = await pool.query(query);
    console.log(
      'getAllCategoriesService - Resultado obtenido:',
      result.rows.length,
      'filas',
    );
    console.log(
      'getAllCategoriesService - Primera fila de ejemplo:',
      result.rows[0],
    );
    return result.rows;
  } catch (error) {
    console.error('getAllCategoriesService - Error en la consulta:', error);
    throw new Error('No se pudieron obtener las categorías');
  }
};

export default getAllCategoriesService;
