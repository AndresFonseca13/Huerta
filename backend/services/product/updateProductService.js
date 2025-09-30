import pool from '../../config/db.js';
import { BlobServiceClient } from '@azure/storage-blob';

const AZURE_STORAGE_CONNECTION_STRING =
	process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = 'cocktail-images';

async function deleteImagesFromAzure(imageUrls) {
  if (!AZURE_STORAGE_CONNECTION_STRING || !AZURE_STORAGE_ACCOUNT_NAME) return;
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING,
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  for (const url of imageUrls) {
    try {
      const parts = url.split('/');
      const blobName = parts[parts.length - 1];
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
    } catch (err) {
      console.error('Error al borrar imagen en Azure:', url, err.message);
    }
  }
}

const updateProductService = async (productId, productData) => {
  const {
    name,
    price,
    description,
    ingredients,
    categories,
    images,
    alcohol_percentage,
  } = productData;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

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
      productId,
    ]);
    if (productResult.rows.length === 0) {
      throw new Error('Cóctel no encontrado.');
    }

    if (typeof ingredients !== 'undefined') {
      await client.query(
        'DELETE FROM products_ingredients WHERE product_id = $1',
        [productId],
      );
      if (Array.isArray(ingredients) && ingredients.length > 0) {
        const ingredientIds = [];
        for (const ingredientName of ingredients) {
          const res = await client.query(
            'INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id',
            [ingredientName],
          );
          ingredientIds.push(res.rows[0].id);
        }
        for (const ingredientId of ingredientIds) {
          await client.query(
            'INSERT INTO products_ingredients (product_id, ingredient_id) VALUES ($1, $2)',
            [productId, ingredientId],
          );
        }
      }
    }

    if (typeof categories !== 'undefined') {
      await client.query(
        'DELETE FROM products_categories WHERE product_id = $1',
        [productId],
      );
      if (Array.isArray(categories) && categories.length > 0) {
        const categoryIds = [];
        for (const category of categories) {
          const res = await client.query(
            'INSERT INTO categories (name, type) VALUES ($1, $2) ON CONFLICT (name, type) DO UPDATE SET name=EXCLUDED.name RETURNING id',
            [category.name, category.type],
          );
          categoryIds.push(res.rows[0].id);
        }
        for (const categoryId of categoryIds) {
          await client.query(
            'INSERT INTO products_categories (product_id, category_id) VALUES ($1, $2)',
            [productId, categoryId],
          );
        }
      }
    }

    // Actualizar imágenes si se envía el campo images (incluso si es un array vacío)
    if (typeof images !== 'undefined') {
      const oldImagesResult = await client.query(
        'SELECT url FROM images WHERE product_id = $1',
        [productId],
      );
      const oldImageUrls = oldImagesResult.rows.map((row) => row.url);

      // Determinar qué imágenes eliminar (las que estaban pero ya no están en el nuevo array)
      const imagesToDelete = oldImageUrls.filter(
        (url) => !images.includes(url),
      );

      // Eliminar todas las imágenes antiguas de la BD
      await client.query('DELETE FROM images WHERE product_id = $1', [
        productId,
      ]);

      // Insertar las nuevas imágenes
      if (Array.isArray(images) && images.length > 0) {
        for (const imageUrl of images) {
          await client.query(
            'INSERT INTO images (product_id, url) VALUES ($1, $2)',
            [productId, imageUrl],
          );
        }
      }

      // Eliminar las imágenes antiguas de Azure Storage
      if (imagesToDelete.length > 0) {
        await deleteImagesFromAzure(imagesToDelete);
      }
    }

    await client.query('COMMIT');

    const finalProduct = await client.query(
      `
        SELECT p.id, p.name, p.price, p.description, p.alcohol_percentage,
               (SELECT array_agg(i.name)
                  FROM ingredients i
                  JOIN products_ingredients pi ON i.id = pi.ingredient_id
                 WHERE pi.product_id = p.id) AS ingredients,
               (SELECT array_agg(jsonb_build_object('name', c.name, 'type', c.type))
                  FROM categories c
                  JOIN products_categories pc ON c.id = pc.category_id
                 WHERE pc.product_id = p.id) AS categories,
               (SELECT array_agg(img.url)
                  FROM images img
                 WHERE img.product_id = p.id) AS images
        FROM products p
        WHERE p.id = $1
        GROUP BY p.id;
      `,
      [productId],
    );

    return finalProduct.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en el servicio de actualización:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default updateProductService;
