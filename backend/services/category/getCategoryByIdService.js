const pool = require("../../config/db");

const getCategoryByIdService = async (id) => {
	try {
		const query = `
            SELECT c.id, c.name, c.type
            FROM categories c
            WHERE c.id = $1;
        `;

		const result = await pool.query(query, [id]);

		if (result.rows.length === 0) {
			return null;
		}

		return result.rows[0];
	} catch (error) {
		console.error("Error en getCategoryByIdService:", error);
		throw new Error("Error al obtener la categoría");
	}
};

module.exports = getCategoryByIdService;
