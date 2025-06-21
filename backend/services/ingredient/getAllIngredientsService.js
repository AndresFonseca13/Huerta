const pool = require('../../config/db');

const getAllIngredientsService = async() => {
    const query = 'SELECT * FROM ingredients ORDER BY name';

    try {
        const result = await pool.query(query);
        return result.rows;
    }catch (error){
        console.error('Error al obtener los ingredientes:', error);
        throw new Error('No se pudieron obtener los ingredientes');
    }
}

module.exports = getAllIngredientsService;