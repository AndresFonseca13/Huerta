import pool from "../config/db.js";

// Autoriza acceso a usuarios cuyo rol esté en allowedRoles
const requireRoles = (allowedRoles = []) => {
	return async (req, res, next) => {
		try {
			console.log("requireRoles - Middleware ejecutándose");
			console.log("requireRoles - Roles permitidos:", allowedRoles);

			const userId = req.user?.id;
			console.log("requireRoles - User ID:", userId);

			if (!userId)
				return res.status(401).json({ mensaje: "Usuario no autenticado" });

			const result = await pool.query(
				`SELECT r.name AS role_name
         FROM users u JOIN roles r ON r.id = u.role_id
         WHERE u.id = $1`,
				[userId]
			);
			console.log("requireRoles - Resultado de la consulta:", result.rows);

			if (!result.rows.length)
				return res.status(403).json({ mensaje: "Rol no asignado" });
			const roleName = result.rows[0].role_name;
			console.log("requireRoles - Rol del usuario:", roleName);

			if (!allowedRoles.includes(roleName)) {
				console.log("requireRoles - Acceso denegado. Rol no permitido");
				return res.status(403).json({ mensaje: "No autorizado" });
			}

			console.log("requireRoles - Acceso permitido para rol:", roleName);
			req.user.role = roleName;
			next();
		} catch (error) {
			console.error("Error en autorización de roles:", error);
			res.status(500).json({ mensaje: "Error de autorización" });
		}
	};
};

export default requireRoles;
