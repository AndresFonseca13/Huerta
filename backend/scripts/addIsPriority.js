import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const client = await pool.connect();
  try {
    const sqlPath = path.resolve(
      __dirname,
      './add_is_priority_to_promotions.sql',
    );
    const sql = await fs.readFile(sqlPath, 'utf8');
    console.log('Ejecutando migración: añadir promotions.is_priority...');
    await client.query(sql);
    console.log('✅ Migración aplicada correctamente.');
  } catch (err) {
    console.error('❌ Error aplicando la migración:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
