import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Supabase puede usar una connection string directa o variables individuales
// Si existe DATABASE_URL (connection string de Supabase), usarla
// Si no, usar las variables individuales
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Para Supabase PostgreSQL
      },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false, // Para Supabase PostgreSQL
      },
      // Configuración adicional para Supabase
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
    };

const pool = new Pool(poolConfig);

// Evitar conectar durante los tests en CI para no requerir DB
if (process.env.NODE_ENV !== 'test') {
  pool
    .connect()
    .then(() => {
      console.log('Conexión exitosa a la base de datos Supabase');
      if (process.env.DATABASE_URL) {
        // Extraer información de la connection string para el log
        const url = new URL(process.env.DATABASE_URL);
        console.log(
          `Conectado a Supabase: ${url.hostname}:${url.port || 5432}/${url.pathname.slice(1)}`,
        );
      } else {
        console.log(
          `Conectado a: ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
        );
      }
    })
    .catch((err) => {
      console.error('Error al conectar a la base de datos', err);
      console.log('Verifica las siguientes variables de entorno:');
      if (process.env.DATABASE_URL) {
        console.log('DATABASE_URL: Configurado');
      } else {
        console.log(`DATABASE_URL: No configurado`);
        console.log(`DB_HOST: ${process.env.DB_HOST || 'No configurado'}`);
        console.log(`DB_PORT: ${process.env.DB_PORT || 'No configurado'}`);
        console.log(`DB_USER: ${process.env.DB_USER || 'No configurado'}`);
        console.log(`DB_NAME: ${process.env.DB_NAME || 'No configurado'}`);
        console.log(
          `DB_PASSWORD: ${
            process.env.DB_PASSWORD ? 'Configurado' : 'No configurado'
          }`,
        );
      }
    });
}

export default pool;
