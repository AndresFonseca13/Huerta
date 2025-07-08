const pool = require("../../config/db");

const updateCategory = async (id, name, type, is_active) => {
	const checkQuery = "SELECT * FROM categories WHERE id = $1";
	const checkResult = await pool.query(checkQuery, [id]);
	if (checkResult.rows.length === 0) {
		throw new Error("Categoría no encontrada");
	}

	const current = checkResult.rows[0];
	const newName = name !== null && name !== undefined ? name : current.name;
	const newType = type !== null && type !== undefined ? type : current.type;

	try {
		await pool.query("BEGIN");
		let updateCategoryQuery, result;
		if (typeof is_active === "boolean") {
			updateCategoryQuery =
				"UPDATE categories SET name = $1, type = $2, is_active = $3 WHERE id = $4 RETURNING id, name, type, is_active";
			result = await pool.query(updateCategoryQuery, [
				newName,
				newType,
				is_active,
				id,
			]);
		} else {
			updateCategoryQuery =
				"UPDATE categories SET name = $1, type = $2 WHERE id = $3 RETURNING id, name, type, is_active";
			result = await pool.query(updateCategoryQuery, [newName, newType, id]);
		}
		await pool.query("COMMIT");
		return result.rows[0];
	} catch (error) {
		await pool.query("ROLLBACK");
		throw error;
	}
};

module.exports = updateCategory;
