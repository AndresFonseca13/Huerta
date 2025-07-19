import bcrypt from 'bcrypt';
import pool from '../../config/db.js';

const signupService = async (username, password) => {
  const checkUser = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  if (checkUser.rows.length > 0) {
    throw new Error('El nombre de usuario ya está en uso');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, hashedPassword]
  );
  return result.rows[0];
};

export default signupService;
