const { BlobServiceClient } = require("@azure/storage-blob");
const sharp = require("sharp");

const AZURE_STORAGE_CONNECTION_STRING =
	process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = "cocktail-images";

function slugify(str) {
	return str
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // quitar acentos
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();
}

// Log para depuración (solo en desarrollo)
if (process.env.NODE_ENV !== "production") {
	console.log("Configuración de Azure Storage:");
	console.log(
		"AZURE_STORAGE_ACCOUNT_NAME:",
		AZURE_STORAGE_ACCOUNT_NAME ? "Configurado" : "No configurado"
	);
	console.log(
		"AZURE_STORAGE_CONNECTION_STRING:",
		AZURE_STORAGE_CONNECTION_STRING ? "Configurado" : "No configurado"
	);
}

exports.uploadImage = async (req, res) => {
	// Verificar si se recibieron archivos
	if (!req.files || req.files.length === 0) {
		return res.status(400).json({
			error: true,
			mensaje: "No se han proporcionado imágenes",
		});
	}

	const cocktailNameRaw = req.body.cocktailName || "imagen-coctel";
	const cocktailSlug = slugify(cocktailNameRaw);

	// Verificar la configuración de Azure con mensajes más específicos
	if (!AZURE_STORAGE_CONNECTION_STRING) {
		return res.status(500).json({
			error: true,
			mensaje:
				"Error de configuración: Falta AZURE_STORAGE_CONNECTION_STRING en las variables de entorno",
		});
	}

	if (!AZURE_STORAGE_ACCOUNT_NAME) {
		return res.status(500).json({
			error: true,
			mensaje:
				"Error de configuración: Falta AZURE_STORAGE_ACCOUNT_NAME en las variables de entorno",
		});
	}

	try {
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			AZURE_STORAGE_CONNECTION_STRING
		);
		const containerClient = blobServiceClient.getContainerClient(containerName);

		// Verificar si el contenedor existe, si no, crearlo con acceso público
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			await containerClient.create({
				access: "blob", // Esto hace que los blobs sean accesibles públicamente
			});
		}

		// Array para almacenar las URLs de las imágenes subidas
		const uploadedUrls = [];

		// Procesar cada archivo
		for (const [idx, file] of req.files.entries()) {
			// Generar un nombre único para el archivo (nombre-coctel-1.webp, etc)
			const blobName = `${cocktailSlug}-${idx + 1}.webp`;

			// Procesar imagen con sharp: redimensionar SOLO el ancho a 600px, sin recortar
			const optimizedBuffer = await sharp(file.buffer)
				.resize({ width: 600, withoutEnlargement: true })
				.webp({ quality: 80 })
				.toBuffer();

			const blockBlobClient = containerClient.getBlockBlobClient(blobName);

			// Subir el archivo optimizado
			await blockBlobClient.uploadData(optimizedBuffer, {
				blobHTTPHeaders: {
					blobContentType: "image/webp",
				},
			});

			// Generar URL pública
			const publicUrl = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}`;
			uploadedUrls.push(publicUrl);
		}

		const response = {
			error: false,
			mensaje: "Imágenes subidas exitosamente",
			urls: uploadedUrls,
		};

		console.log("Respuesta del backend:", response);
		res.status(200).json(response);
	} catch (error) {
		console.error("Error al subir la imagen:", error);

		// Manejar errores específicos
		if (error.code === "ENOENT") {
			return res.status(500).json({
				error: true,
				mensaje: "Error de conexión con Azure Storage",
			});
		}

		// Log detallado del error en desarrollo
		if (process.env.NODE_ENV !== "production") {
			console.error("Detalles del error:", {
				message: error.message,
				code: error.code,
				stack: error.stack,
			});
		}

		res.status(500).json({
			error: true,
			mensaje: "Error al subir la imagen",
			detalle: error.message,
		});
	}
};
