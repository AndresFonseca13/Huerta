import 'dotenv/config';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../config/db.js';
import { validatePassword } from '../utils/validatePassword.js';

function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
  let password = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

const createAdminUser = async () => {
  const args = process.argv.slice(2);
  let username = args[0];
  let password = args[1];
  let generated = false;

  if (!username) {
    console.error('Uso: node scripts/createAdminUser.js <username> [password]');
    console.error('Si no se proporciona password, se generará una automáticamente.');
    process.exit(1);
  }

  if (!password) {
    password = generatePassword();
    generated = true;
  }

  const validationError = validatePassword(password);
  if (validationError) {
    console.error(`Error: ${validationError}`);
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    const checkResult = await client.query(
      'SELECT username FROM users WHERE username = $1',
      [username],
    );

    if (checkResult.rows.length > 0) {
      console.log(`El usuario "${username}" ya existe.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(
      'INSERT INTO users (username, password, created_at) VALUES ($1, $2, NOW())',
      [username, hashedPassword],
    );

    console.log(`Usuario "${username}" creado exitosamente.`);
    if (generated) {
      console.log(`Contraseña generada: ${password}`);
      console.log('IMPORTANTE: Guarda esta contraseña, no se mostrará de nuevo.');
    }
  } catch (error) {
    console.error('Error durante la creación del usuario:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

createAdminUser();
