const pool = require('../../config/db');

const deleteCocktailService = async (id) => {
    try{
        const checkQuery = 'SELECT * FROM products WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [id]);
        
        if (checkResult.rows.length === 0) {
            throw new Error('El cóctel no existe');
        }

        await pool.query('BEGIN');

        // Eliminar relaciones con ingredientes
        await pool.query('DELETE FROM products_ingredients WHERE product_id = $1', [id]);

        // Eliminar imágenes asociadas
        await pool.query('DELETE FROM images WHERE product_id = $1', [id]);

        // Eliminar el cóctel
        await pool.query('DELETE FROM products WHERE id = $1', [id]);

        await pool.query('COMMIT');
        
        return { mensaje: 'Cóctel eliminado exitosamente' };
    }catch (error) {
        await pool.query('ROLLBACK');
        console.error('⛔ Error al eliminar el cóctel:', error);
        throw new Error(`Error al eliminar el cóctel: ${error.message}`);
}
}

module.exports = deleteCocktailService;