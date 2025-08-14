import pool from '../../config/db.js';

const getAllProductsAdminService = async ({
  categoria,
  tipo,
  orden,
  limite,
  offset,
}) => {
  const ordenValido = ['name', 'price'].includes(orden) ? orden : 'name';

  const query = `
    SELECT p.id, p.name, p.price, p.description, p.is_active, p.alcohol_percentage,
           array_agg(DISTINCT i.name) AS ingredients,
           array_agg(DISTINCT c.name) AS categories,
           array_agg(DISTINCT img.url) AS images,
           MIN(CASE WHEN c.type = 'destilado' THEN c.name END) AS destilado_name,
           MIN(CASE WHEN c.type = 'clasificacion comida' THEN c.name END) AS food_classification_name
    FROM products p
    LEFT JOIN products_ingredients pi ON p.id = pi.product_id
    LEFT JOIN ingredients i ON pi.ingredient_id = i.id
    LEFT JOIN products_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN images img ON p.id = img.product_id
    WHERE ($1::text IS NULL OR EXISTS (
        SELECT 1 FROM products_categories pc2
        JOIN categories c2 ON pc2.category_id = c2.id
        WHERE pc2.product_id = p.id AND c2.name = $1
    ))
      AND ($2::text IS NULL OR EXISTS (
        SELECT 1 FROM products_categories pc3
        JOIN categories c3 ON pc3.category_id = c3.id
        WHERE pc3.product_id = p.id AND c3.type = CASE WHEN $2 = 'clasificacion' THEN 'clasificacion comida' ELSE $2 END
      ))
    GROUP BY p.id, p.name, p.price, p.description, p.is_active
    ORDER BY p."${ordenValido}"
    LIMIT $3 OFFSET $4
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    WHERE ($1::text IS NULL OR EXISTS (
        SELECT 1 FROM products_categories pc2
        JOIN categories c2 ON pc2.category_id = c2.id
        WHERE pc2.product_id = p.id AND c2.name = $1
    ))
      AND ($2::text IS NULL OR EXISTS (
        SELECT 1 FROM products_categories pc3
        JOIN categories c3 ON pc3.category_id = c3.id
        WHERE pc3.product_id = p.id AND c3.type = CASE WHEN $2 = 'clasificacion' THEN 'clasificacion comida' ELSE $2 END
      ))
  `;

  const values = [categoria, tipo, limite, offset];
  const countValues = [categoria, tipo];

  const [result, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query(countQuery, countValues),
  ]);

  const processed = result.rows.map((row) => ({
    ...row,
    ingredients: (row.ingredients || []).filter((x) => x !== null),
    categories: (row.categories || []).filter((x) => x !== null),
    images: (row.images || []).filter((x) => x !== null),
  }));

  const totalRecords = parseInt(countResult.rows[0].total);
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

export default getAllProductsAdminService;
