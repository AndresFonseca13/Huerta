const bcrypt = require("bcrypt");
const pool = require("../config/db");

const createAdminUser = async () => {
	const client = await pool.connect();

	try {
		console.log("🔍 Verificando si el usuario admin ya existe...");

		// Verificar si el usuario admin ya existe
		const checkQuery = `
			SELECT username 
			FROM users 
			WHERE username = 'admin'
		`;

		const checkResult = await client.query(checkQuery);

		if (checkResult.rows.length > 0) {
			console.log("ℹ️  El usuario admin ya existe");
		} else {
			console.log("📝 Creando usuario admin...");

			// Crear hash de la contraseña
			const hashedPassword = await bcrypt.hash("admin123", 10);

			// Insertar usuario admin
			const insertQuery = `
				INSERT INTO users (username, password, created_at)
				VALUES ($1, $2, NOW())
			`;

			await client.query(insertQuery, ["admin", hashedPassword]);

			console.log("✅ Usuario admin creado exitosamente");
		}

		// Mostrar información del usuario
		const userQuery = `
			SELECT id, username, created_at 
			FROM users 
			WHERE username = 'admin'
		`;

		const userResult = await client.query(userQuery);
		console.log("📊 Información del usuario admin:");
		console.log(`  - ID: ${userResult.rows[0].id}`);
		console.log(`  - Username: ${userResult.rows[0].username}`);
		console.log(`  - Creado: ${userResult.rows[0].created_at}`);
		console.log("🔑 Credenciales de prueba:");
		console.log("  - Usuario: admin");
		console.log("  - Contraseña: admin123");
	} catch (error) {
		console.error("❌ Error durante la creación del usuario:", error);
		throw error;
	} finally {
		client.release();
		await pool.end();
	}
};

// Ejecutar la creación del usuario
createAdminUser()
	.then(() => {
		console.log("🎉 Script completado");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Error en el script:", error);
		process.exit(1);
	});
