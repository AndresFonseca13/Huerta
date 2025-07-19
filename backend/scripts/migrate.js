const pool = require('../config/db');

const addIsActiveColumn = async () => {
  const client = await pool.connect();

  try {
    console.log('🔍 Verificando si la columna is_active existe...');

    // Verificar si la columna existe
    const checkQuery = `
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_name = 'products' 
			AND column_name = 'is_active'
		`;

    const checkResult = await client.query(checkQuery);

    if (checkResult.rows.length === 0) {
      console.log('📝 Añadiendo columna is_active...');

      // Añadir la columna
      await client.query(`
				ALTER TABLE products 
				ADD COLUMN is_active BOOLEAN DEFAULT true
			`);

      // Actualizar registros existentes
      await client.query(`
				UPDATE products 
				SET is_active = true 
				WHERE is_active IS NULL
			`);

      console.log('✅ Columna is_active añadida exitosamente');
    } else {
      console.log('ℹ️  La columna is_active ya existe');
    }

    // Verificar algunos registros
    const sampleQuery = `
			SELECT id, name, is_active 
			FROM products 
			LIMIT 5
		`;

    const sampleResult = await client.query(sampleQuery);
    console.log('📊 Muestra de registros:');
    sampleResult.rows.forEach((row) => {
      console.log(`  - ${row.name}: is_active = ${row.is_active}`);
    });
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Ejecutar la migración
addIsActiveColumn()
  .then(() => {
    console.log('🎉 Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });
