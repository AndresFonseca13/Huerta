import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const client = await pool.connect();
  try {
    const sqlPath = path.resolve(__dirname, './create_promotions.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    console.log('Ejecutando migración: crear tablas de promociones...');
    await client.query(sql);
    console.log('✅ Migración de promociones aplicada correctamente.');
  } catch (err) {
    console.error(
      '❌ Error aplicando la migración de promociones:',
      err.message,
    );
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
