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
    // Soporta:
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

const deleteProductService = async (id) => {
  try {
    const checkQuery = 'SELECT * FROM products WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
      throw new Error('El producto no existe');
    }

    const imagesQuery = 'SELECT url FROM images WHERE product_id = $1';
    const imagesResult = await pool.query(imagesQuery, [id]);
    const imageUrls = imagesResult.rows.map((row) => row.url);

    await pool.query('BEGIN');
    await pool.query('DELETE FROM products_ingredients WHERE product_id = $1', [
      id,
    ]);
    await pool.query('DELETE FROM images WHERE product_id = $1', [id]);
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    await pool.query('COMMIT');

    await deleteImagesFromSupabase(imageUrls);
    return { mensaje: 'Producto eliminado exitosamente' };
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('⛔ Error al eliminar el producto:', error);
    throw new Error(`Error al eliminar el producto: ${error.message}`);
  }
};

export default deleteProductService;
