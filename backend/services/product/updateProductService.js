import pool from '../../config/db.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = 'cocktail-images';

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

function getBlobNameFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    // Soporta URLs tipo:
    // - /cocktail-images/<blob>
    // - /storage/v1/object/public/cocktail-images/<blob>
    const bucketIndex = parts.findIndex((p) => p === SUPABASE_BUCKET);
    if (bucketIndex === -1 || bucketIndex === parts.length - 1) return null;
    return parts.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
}

async function deleteImagesFromSupabase(imageUrls) {
  if (!supabase || !Array.isArray(imageUrls) || imageUrls.length === 0) return;

  const blobNames = imageUrls
    .map((url) => getBlobNameFromUrl(url))
    .filter(Boolean);

  if (blobNames.length === 0) return;

  try {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove(blobNames);

    if (error) {
      console.error(
        'Error al borrar imágenes en Supabase Storage:',
        error.message,
      );
    }
    } catch (err) {
    console.error(
      'Error inesperado al borrar imágenes en Supabase Storage:',
      err.message,
    );
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

      // Eliminar las imágenes antiguas de Supabase Storage
      if (imagesToDelete.length > 0) {
        await deleteImagesFromSupabase(imagesToDelete);
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
