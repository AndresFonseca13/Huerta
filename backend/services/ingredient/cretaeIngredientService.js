const pool = require('../../config/db');
const { ConflictError } = require('../../errors/ConflictError');

const createIngredientService = async (name) => {
    const checkQuery = 'SELECT * FROM ingredients WHERE name = $1';
    const checkResult = await pool.query(checkQuery, [name]);
    if (checkResult.rows.length > 0) {
        throw new ConflictError('El ingrediente ya existe');
    }

    try {
        await pool.query('BEGIN');
        const insertIngredientQuery = 'INSERT INTO ingredients (name) VALUES ($1) RETURNING id, name';
        const ingredientResult = await pool.query(insertIngredientQuery, [name]);

        await pool.query('COMMIT');

        return ingredientResult.rows[0];
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
};

module.exports = createIngredientService;