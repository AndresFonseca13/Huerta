const pool = require("../../config/db");

const searchCategoryService = async (searchTerm) => {
    try{
        const query = `
        SELECT
        id,
        name,
        type
        FROM categories
        WHERE LOWER(name) LIKE LOWER($1)
        ORDER BY name ASC;`;
        const result = await pool.query(query, [`%${searchTerm}%`]);
        return result.rows;
    }catch(error){
        console.error("Error al buscar la categoría:", error);
        throw error;
    }
}

module.exports = searchCategoryService;