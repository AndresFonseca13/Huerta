const pool = require('../../config/db');

const getIngredientByIdService = async (id) => {
    const query = 'SELECT * FROM ingredients WHERE id = $1';

    try{
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            throw new Error('Ingrediente no encontrado');
        }
        return result.rows[0];
    }catch (error){
        console.error('Error al obtener el ingrediente:', error);
        throw new Error('No se pudo obtener el ingrediente');
    }
}

module.exports = getIngredientByIdService;