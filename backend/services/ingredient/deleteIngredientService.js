const pool = require('../../config/db');

const deleteIngredient = async(id) => {
    const checkQuery = 'SELECT * FROM ingredients WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
        throw new Error('Ingrediente no encontrado');
    }

    try {
        await pool.query('BEGIN');
        const deleteProductsQuery = 'DELETE FROM products_ingredients WHERE ingredient_id = $1';
        await pool.query(deleteProductsQuery, [id]);

        const deleteIngredientQuery = 'DELETE FROM ingredients WHERE id = $1 RETURNING id, name';
        const result = await pool.query(deleteIngredientQuery, [id]);

        await pool.query('COMMIT');

        return result.rows[0];
    }catch(error){
        await pool.query('ROLLBACK');
        throw error;
    }
}

module.exports = deleteIngredient;