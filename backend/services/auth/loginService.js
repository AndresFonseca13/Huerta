import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';

const loginService = async (username, password) => {
  const userResult = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username],
  );
  if (userResult.rows.length === 0) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  const user = userResult.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Usuario o contraseña incorrectos');
  }
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
  return {
    token,
    username: user.username,
  };
};

export default loginService;
