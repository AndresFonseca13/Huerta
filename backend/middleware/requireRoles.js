import pool from '../config/db.js';

// Autoriza acceso a usuarios cuyo rol esté en allowedRoles
const requireRoles = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ mensaje: 'Usuario no autenticado' });

      const result = await pool.query(
        `SELECT r.name AS role_name
         FROM users u JOIN roles r ON r.id = u.role_id
         WHERE u.id = $1`,
        [userId],
      );
      if (!result.rows.length)
        return res.status(403).json({ mensaje: 'Rol no asignado' });
      const roleName = result.rows[0].role_name;

      if (!allowedRoles.includes(roleName)) {
        return res.status(403).json({ mensaje: 'No autorizado' });
      }
      req.user.role = roleName;
      next();
    } catch (error) {
      console.error('Error en autorización de roles:', error);
      res.status(500).json({ mensaje: 'Error de autorización' });
    }
  };
};

export default requireRoles;
