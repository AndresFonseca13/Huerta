import pool from "../../config/db.js";

// Devuelve categorías de tipo 'clasificacion' asociadas a productos que tienen la categoría 'comida'
const getFoodClassificationCategoriesService = async () => {
	const query = `
    SELECT DISTINCT c.id, c.name, c.type, c.is_active
    FROM categories c
    WHERE c.type = 'clasificacion comida' AND c.is_active = true
    ORDER BY c.name;
  `;

	const result = await pool.query(query);
	return result.rows;
};

export default getFoodClassificationCategoriesService;
