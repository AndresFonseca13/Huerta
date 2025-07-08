const pool = require("../../config/db");

/**
 * Obtiene todas las categorías.
 * @param {boolean} showAll - Si es true, muestra todas las categorías; si es false, solo las activas.
 */
const getAllCategoriesService = async (showAll = false) => {
	const query = `
        SELECT id, name, type, is_active
        FROM categories
        ${showAll ? "" : "WHERE is_active = true"}
        ORDER BY name;
    `;

	try {
		const result = await pool.query(query);
		return result.rows;
	} catch (error) {
		console.error("Error al obtener las categorías:", error);
		throw new Error("No se pudieron obtener las categorías");
	}
};

module.exports = getAllCategoriesService;
