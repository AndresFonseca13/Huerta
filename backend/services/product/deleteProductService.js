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

    await deleteImagesFromAzure(imageUrls);
    return { mensaje: 'Producto eliminado exitosamente' };
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('⛔ Error al eliminar el producto:', error);
    throw new Error(`Error al eliminar el producto: ${error.message}`);
  }
};

export default deleteProductService;
