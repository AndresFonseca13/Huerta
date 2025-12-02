import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

console.log("🔍 Verificando configuración de Supabase...\n");

// Verificar variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

let allGood = true;

console.log("📋 Variables de entorno:");
console.log("─".repeat(50));

if (!SUPABASE_URL) {
	console.log("❌ SUPABASE_URL: No configurado");
	allGood = false;
} else {
	console.log("✅ SUPABASE_URL: Configurado");
	console.log(`   ${SUPABASE_URL}`);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
	console.log("❌ SUPABASE_SERVICE_ROLE_KEY: No configurado");
	allGood = false;
} else {
	console.log("✅ SUPABASE_SERVICE_ROLE_KEY: Configurado");
	console.log(`   ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
}

if (!DATABASE_URL) {
	console.log("❌ DATABASE_URL: No configurado");
	allGood = false;
} else {
	console.log("✅ DATABASE_URL: Configurado");
	const url = new URL(DATABASE_URL);
	console.log(`   Host: ${url.hostname}`);
	console.log(`   Database: ${url.pathname.slice(1)}`);
}

console.log("\n" + "─".repeat(50));

if (!allGood) {
	console.log("\n❌ Faltan variables de entorno. Revisa tu archivo .env");
	console.log("📖 Consulta ENV_SETUP.md para más información");
	process.exit(1);
}

// Probar conexión a Supabase Storage
console.log("\n🧪 Probando conexión a Supabase Storage...");

try {
	const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

	// Verificar que el bucket existe
	const { data: buckets, error: bucketsError } =
		await supabase.storage.listBuckets();

	if (bucketsError) {
		console.log("❌ Error al listar buckets:", bucketsError.message);
		process.exit(1);
	}

	const bucketExists = buckets?.some(
		(bucket) => bucket.name === "cocktail-images"
	);

	if (!bucketExists) {
		console.log("⚠️  El bucket 'cocktail-images' no existe");
		console.log("   Ve a Supabase Dashboard → Storage → New bucket");
		console.log(
			"   Crea un bucket llamado 'cocktail-images' y márcalo como público"
		);
	} else {
		console.log("✅ Bucket 'cocktail-images' encontrado");

		// Verificar permisos del bucket
		const { data: _files, error: filesError } = await supabase.storage
			.from("cocktail-images")
			.list("", { limit: 1 });

		if (filesError) {
			console.log("⚠️  Error al acceder al bucket:", filesError.message);
			console.log(
				"   Verifica que el bucket sea público o que tengas los permisos correctos"
			);
		} else {
			console.log("✅ Acceso al bucket verificado");
		}
	}
} catch (error) {
	console.log("❌ Error al conectar con Supabase:", error.message);
	process.exit(1);
}

// Probar conexión a la base de datos
console.log("\n🧪 Probando conexión a la base de datos...");

try {
	const pg = await import("pg");
	const { Pool } = pg.default;

	const pool = new Pool({
		connectionString: DATABASE_URL,
		ssl: {
			rejectUnauthorized: false,
		},
	});

	const client = await pool.connect();
	const result = await client.query("SELECT NOW()");
	console.log("✅ Conexión a la base de datos exitosa");
	console.log(`   Hora del servidor: ${result.rows[0].now}`);
	client.release();
	await pool.end();
} catch (error) {
	console.log("❌ Error al conectar a la base de datos:", error.message);
	console.log("   Verifica que DATABASE_URL tenga la contraseña correcta");
	process.exit(1);
}

console.log("\n" + "─".repeat(50));
console.log("✅ ¡Todas las verificaciones pasaron!");
console.log("🚀 Puedes iniciar el servidor con: npm run dev");
console.log("─".repeat(50));
