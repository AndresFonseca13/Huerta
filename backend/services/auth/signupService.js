import bcrypt from 'bcrypt';
import pool from '../../config/db.js';

const signupService = async (username, password, roleName = 'ventas') => {
  const checkUser = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username],
  );
  if (checkUser.rows.length > 0) {
    throw new Error('El nombre de usuario ya está en uso');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', [
    roleName,
  ]);
  if (!roleRes.rows.length) throw new Error('Rol inválido');
  const roleId = roleRes.rows[0].id;

  const result = await pool.query(
    'INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING id, username',
    [username, hashedPassword, roleId],
  );
  return result.rows[0];
};

export default signupService;
