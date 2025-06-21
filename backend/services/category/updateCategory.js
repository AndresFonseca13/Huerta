const pool = require('../../config/db');

const updateCategory = async(id, name, type) => {
    const checkQuery = 'SELECT * FROM categories WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
        throw new Error('Categoría no encontrada');
    }
    
    try{
        await pool.query('BEGIN');
        const updateCategoryQuery = 'UPDATE categories SET name = $1, type = $2 WHERE id = $3 RETURNING id, name, type';
        const result = await pool.query(updateCategoryQuery, [name, type, id]);
        await pool.query('COMMIT');
        return result.rows[0];
    }catch(error){
        await pool.query('ROLLBACK');
        throw error;
    }
    
}

module.exports = updateCategory;