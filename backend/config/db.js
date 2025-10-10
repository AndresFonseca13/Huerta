import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // Para Azure PostgreSQL
    require: true,
  },
  // Configuración adicional para Azure
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
});

// Evitar conectar durante los tests en CI para no requerir DB
if (process.env.NODE_ENV !== 'test') {
  pool
    .connect()
    .then(() => {
      console.log('Conexion exitosa a la base de datos');
      console.log(
        `Conectado a: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      );
    })
    .catch((err) => {
      console.error('Error al conectar a la base de datos', err);
      console.log('Verifica las siguientes variables de entorno:');
      console.log(`DB_HOST: ${process.env.DB_HOST || 'No configurado'}`);
      console.log(`DB_PORT: ${process.env.DB_PORT || 'No configurado'}`);
      console.log(`DB_USER: ${process.env.DB_USER || 'No configurado'}`);
      console.log(`DB_NAME: ${process.env.DB_NAME || 'No configurado'}`);
      console.log(
        `DB_PASSWORD: ${
          process.env.DB_PASSWORD ? 'Configurado' : 'No configurado'
        }`,
      );
    });
}

export default pool;
