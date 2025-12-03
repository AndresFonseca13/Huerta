import pool from '../../config/db.js';

const getFoodProductsService = async ({ categoria, limite, offset, orden }) => {
  const safeOrder = ['name', 'price'].includes(orden) ? orden : 'name';
  const baseFilterComida = `EXISTS (
      SELECT 1 FROM products_categories pcx
      JOIN categories cx ON pcx.category_id = cx.id
      WHERE pcx.product_id = p.id AND cx.type = 'clasificacion comida'
    )`;

  const categoriaExtra = categoria
    ? `AND EXISTS (
        SELECT 1 FROM products_categories pc2
        JOIN categories c2 ON pc2.category_id = c2.id
        WHERE pc2.product_id = p.id AND c2.type = 'clasificacion comida' AND c2.name = $1
      )`
    : '';

  const values = categoria ? [categoria] : [];

  const query = `
    SELECT p.id, p.name, p.price, p.description, p.is_active, p.alcohol_percentage,
           array_agg(DISTINCT i.name) AS ingredients,
           array_agg(DISTINCT jsonb_build_object('name', c.name, 'type', c.type, 'is_priority', c.is_priority)) AS categories,
           array_agg(DISTINCT img.url) AS images,
           MIN(CASE WHEN c.type = 'clasificacion comida' THEN c.name END) AS food_classification_name,
           COUNT(DISTINCT CASE WHEN c.is_priority = true THEN c.id END) AS priority_count
    FROM products p
    LEFT JOIN products_ingredients pi ON p.id = pi.product_id
    LEFT JOIN ingredients i ON pi.ingredient_id = i.id
    LEFT JOIN products_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN images img ON p.id = img.product_id
    WHERE p.is_active = true
      AND ${baseFilterComida}
      ${categoriaExtra}
    GROUP BY p.id, p.name, p.price, p.description, p.is_active, p.alcohol_percentage
    ORDER BY priority_count DESC, p."${safeOrder}"
    LIMIT ${limite} OFFSET ${offset}
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT p.id) AS total
    FROM products p
    WHERE p.is_active = true
      AND ${baseFilterComida}
      ${
  categoria
    ? `AND EXISTS (
        SELECT 1 FROM products_categories pc2
        JOIN categories c2 ON pc2.category_id = c2.id
        WHERE pc2.product_id = p.id AND c2.name = $1
      )`
    : ''
}
  `;

  const [result, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query(countQuery, values),
  ]);

  const processed = result.rows.map((row) => ({
    ...row,
    ingredients: (row.ingredients || []).filter((x) => x !== null),
    categories: (row.categories || []).filter((x) => x !== null),
    images: (row.images || []).filter((x) => x !== null),
  }));

  const totalRecords = parseInt(countResult.rows[0]?.total || 0);
  const totalPages = Math.ceil(totalRecords / limite);

  return {
    cocktails: processed,
    pagination: {
      totalRecords,
      totalPages,
      currentPage: Math.floor(offset / limite) + 1,
      limit: limite,
      offset,
    },
  };
};

export default getFoodProductsService;
