import pool from "../../config/db.js";
import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING =
	process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = "cocktail-images";

async function deleteImagesFromAzure(imageUrls) {
	if (!AZURE_STORAGE_CONNECTION_STRING || !AZURE_STORAGE_ACCOUNT_NAME) return;
	const blobServiceClient = BlobServiceClient.fromConnectionString(
		AZURE_STORAGE_CONNECTION_STRING
	);
	const containerClient = blobServiceClient.getContainerClient(containerName);
	for (const url of imageUrls) {
		try {
			const parts = url.split("/");
			const blobName = parts[parts.length - 1];
			const blockBlobClient = containerClient.getBlockBlobClient(blobName);
			await blockBlobClient.deleteIfExists();
		} catch (err) {
			console.error("Error al borrar imagen en Azure:", url, err.message);
		}
	}
}

const updateCocktailService = async (cocktailId, cocktailData) => {
	const {
		name,
		price,
		description,
		ingredients,
		categories,
		images,
		alcohol_percentage,
	} = cocktailData;

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// 1. Actualizar los datos básicos del producto
		const updateProductQuery = `
            UPDATE products
            SET name = $1, price = $2, description = $3, alcohol_percentage = $4
            WHERE id = $5
            RETURNING *;
        `;
		const productResult = await client.query(updateProductQuery, [
			name,
			price,
			description,
			alcohol_percentage ?? null,
			cocktailId,
		]);
		if (productResult.rows.length === 0) {
			throw new Error("Cóctel no encontrado.");
		}

		// --- Gestión de Ingredientes ---
		// 2. Borrar las relaciones antiguas de ingredientes
		await client.query(
			"DELETE FROM products_ingredients WHERE product_id = $1",
			[cocktailId]
		);

		// 3. Insertar los nuevos ingredientes y sus relaciones
		if (ingredients && ingredients.length > 0) {
			const ingredientIds = [];
			for (const ingredientName of ingredients) {
				// Insertar el ingrediente si no existe (ON CONFLICT) y obtener su ID
				let res = await client.query(
					"INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id",
					[ingredientName]
				);
				ingredientIds.push(res.rows[0].id);
			}

			// Crear las nuevas relaciones usando parámetros preparados
			for (const ingredientId of ingredientIds) {
				await client.query(
					"INSERT INTO products_ingredients (product_id, ingredient_id) VALUES ($1, $2)",
					[cocktailId, ingredientId]
				);
			}
		}

		// --- Gestión de Categorías ---
		// 4. Borrar las relaciones antiguas de categorías
		await client.query(
			"DELETE FROM products_categories WHERE product_id = $1",
			[cocktailId]
		);

		// 5. Insertar las nuevas categorías y sus relaciones
		if (categories && categories.length > 0) {
			const categoryIds = [];
			for (const category of categories) {
				let res = await client.query(
					"INSERT INTO categories (name, type) VALUES ($1, $2) ON CONFLICT (name, type) DO UPDATE SET name=EXCLUDED.name RETURNING id",
					[category.name, category.type]
				);
				categoryIds.push(res.rows[0].id);
			}

			// Crear las nuevas relaciones usando parámetros preparados
			for (const categoryId of categoryIds) {
				await client.query(
					"INSERT INTO products_categories (product_id, category_id) VALUES ($1, $2)",
					[cocktailId, categoryId]
				);
			}
		}

		// --- Gestión de Imágenes ---
		if (images && images.length > 0) {
			// Obtener imágenes antiguas antes de borrar
			const oldImagesResult = await client.query(
				"SELECT url FROM images WHERE product_id = $1",
				[cocktailId]
			);
			const oldImageUrls = oldImagesResult.rows.map((row) => row.url);

			// Determinar cuáles imágenes se eliminaron
			const imagesToDelete = oldImageUrls.filter(
				(url) => !images.includes(url)
			);

			// Borrar las imágenes antiguas solo si se van a reemplazar
			await client.query("DELETE FROM images WHERE product_id = $1", [
				cocktailId,
			]);

			// Insertar las nuevas imágenes
			for (const imageUrl of images) {
				await client.query(
					"INSERT INTO images (product_id, url) VALUES ($1, $2)",
					[cocktailId, imageUrl]
				);
			}

			// Borrar en Azure solo las imágenes eliminadas
			await deleteImagesFromAzure(imagesToDelete);
		}
		// Si no se proporcionan imágenes, mantener las existentes (no hacer nada)

		await client.query("COMMIT");

		// Devolver el cóctel actualizado con todas sus relaciones
		const finalCocktail = await client.query(
			`
            SELECT p.id, p.name, p.price, p.description, p.alcohol_percentage,
                   (SELECT array_agg(i.name) FROM ingredients i JOIN products_ingredients pi ON i.id = pi.ingredient_id WHERE pi.product_id = p.id) as ingredients,
                   (SELECT array_agg(c.name) FROM categories c JOIN products_categories pc ON c.id = pc.category_id WHERE pc.product_id = p.id) as categories,
                   (SELECT array_agg(img.url) FROM images img WHERE img.product_id = p.id) as images
            FROM products p
            WHERE p.id = $1
            GROUP BY p.id;
        `,
			[cocktailId]
		);

		return finalCocktail.rows[0];
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error en el servicio de actualización:", error);
		throw error;
	} finally {
		client.release();
	}
};

export default updateCocktailService;
