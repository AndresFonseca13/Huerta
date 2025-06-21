const pool = require('../../config/db');
const { ConflictError } = require('../../errors/ConflictError');

const createCategoryService = async ( name, type) => {
    const checkQuery = 'SELECT * FROM categories WHERE name = $1 AND type = $2';
    const checkResult = await pool.query(checkQuery, [name, type]);
    if (checkResult.rows.length > 0) {
        throw new ConflictError('La categoría ya existe');
    }

    try {
        await pool.query('BEGIN');
        const insertCategoryQuery = 'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING id, name, type';
        const categoryResult = await pool.query(insertCategoryQuery, [name, type]);
        
        await pool.query('COMMIT');
        
        return categoryResult.rows[0];
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
}

module.exports = createCategoryService;