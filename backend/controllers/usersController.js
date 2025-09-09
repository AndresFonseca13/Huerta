import pool from '../config/db.js';

export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.username, u.is_active,
             r.id AS role_id, r.name AS role_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      ORDER BY u.username ASC
    `;
    const { rows } = await pool.query(query);
    res.status(200).json({ users: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ mensaje: 'ID inválido' });
  }
  try {
    const query = `
      SELECT u.id, u.username, u.is_active,
             r.id AS role_id, r.name AS role_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [id]);
    if (!rows.length)
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ mensaje: 'Error al obtener el usuario' });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // nombre del rol
  const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ mensaje: 'ID inválido' });
  }
  if (!role || typeof role !== 'string') {
    return res.status(400).json({ mensaje: 'Rol inválido' });
  }
  try {
    const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', [
      role,
    ]);
    if (!roleRes.rows.length)
      return res.status(400).json({ mensaje: 'Rol no encontrado' });
    const roleId = roleRes.rows[0].id;

    const upd = await pool.query(
      'UPDATE users SET role_id = $1 WHERE id = $2 RETURNING id',
      [roleId, id],
    );
    if (!upd.rows.length)
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    return res.status(200).json({ mensaje: 'Rol actualizado' });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ mensaje: 'Error al actualizar rol' });
  }
};

export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ mensaje: 'ID inválido' });
  }
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ mensaje: 'isActive debe ser boolean' });
  }
  try {
    const upd = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id',
      [isActive, id],
    );
    if (!upd.rows.length)
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    return res.status(200).json({ mensaje: 'Estado actualizado' });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ mensaje: 'Error al actualizar estado' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ mensaje: 'ID inválido' });
  }
  try {
    const del = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id],
    );
    if (!del.rows.length)
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    return res.status(200).json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
};
