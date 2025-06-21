const pool = require('../../config/db');

const getAllCategoriesService = async () => {
    const query = `
        SELECT id, name, type
        FROM categories
        ORDER BY name;
    `;
    
    try {
        const result = await pool
            .query(query);
        return result.rows;
    }catch (error) {
        console.error('Error al obtener las categorías:', error);
        throw new Error('No se pudieron obtener las categorías');
    }
}

module.exports = getAllCategoriesService;