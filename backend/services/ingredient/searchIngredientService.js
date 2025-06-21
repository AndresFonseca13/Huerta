const pool = require("../../config/db");

const searchIngredientService = async (searchTerm) => {
	try {
		const query = `
        SELECT
        id,
        name
        FROM ingredients
        WHERE LOWER(name) LIKE LOWER($1)
        ORDER BY name ASC;
        `;
		const result = await pool.query(query, [`%${searchTerm}%`]);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar ingredientes:", error);
		throw error;
	}
};

module.exports = searchIngredientService;
