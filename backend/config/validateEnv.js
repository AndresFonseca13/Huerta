const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const MIN_JWT_SECRET_LENGTH = 32;

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.error(
      `[ERROR] Variables de entorno requeridas no configuradas: ${missing.join(', ')}`,
    );
    console.error('Consulta backend/.env.example para ver las variables necesarias.');
    process.exit(1);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET;

  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    if (isProduction) {
      console.error(
        `[ERROR] JWT_SECRET debe tener al menos ${MIN_JWT_SECRET_LENGTH} caracteres en producción.`,
      );
      console.error(
        'Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"',
      );
      process.exit(1);
    } else {
      console.warn(
        `[WARN] JWT_SECRET tiene menos de ${MIN_JWT_SECRET_LENGTH} caracteres. No usar en producción.`,
      );
    }
  }
}
