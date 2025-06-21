const pool = require('../../config/db');

const updateIngredientService = async (id, name)=> {

    const checkQuery = 'SELECT * FROM ingredients WHERE name = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
        throw new Error('Ingrediente no encontrado');
    }

    try{
        await pool.query('BEGIN');
        const updateIngredientQuery = 'UPDATE ingredients SET name = $1 WHERE id = $2 RETURNING id, name';
        const result = await pool.query(updateIngredientQuery, [name, id]);
        await pool.query('COMMIT');
        return result.rows[0];
    }catch (error){
        await pool.query('ROLLBACK');
        throw error;
    }
}

module.exports = updateIngredientService;