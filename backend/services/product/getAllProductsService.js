import pool from '../../config/db.js';

const getAllProductsService = async ({
  categoria,
  tipo,
  _orden,
  limite,
  offset,
}) => {
  // Cuando el tipo es 'destilado', necesitamos validar que también tenga la categoría 'cocktail'
  const tipoFiltro = tipo
    ? tipo === 'destilado'
      ? `AND p.id IN (
          SELECT pc3.product_id
          FROM products_categories pc3
          JOIN categories c3 ON pc3.category_id = c3.id
          WHERE c3.type = 'destilado'
        )
        AND p.id IN (
          SELECT pc_cocktail.product_id
          FROM products_categories pc_cocktail
          JOIN categories c_cocktail ON pc_cocktail.category_id = c_cocktail.id
          WHERE c_cocktail.name = 'cocktail' AND c_cocktail.type = 'clasificacion'
        )`
      : `AND p.id IN (
          SELECT pc3.product_id
          FROM products_categories pc3
          JOIN categories c3 ON pc3.category_id = c3.id
          WHERE c3.type = '${
  tipo === 'clasificacion' ? 'clasificacion comida' : tipo
}'
        )`
    : '';

  const inactiveCategoryFilter = `
    AND NOT EXISTS (
      SELECT 1
      FROM products_categories pci
      JOIN categories ci ON pci.category_id = ci.id
      WHERE pci.product_id = p.id AND ci.is_active = false
    )
  `;

  const query = `
    SELECT p.id, p.name, p.price, p.description, p.is_active, p.alcohol_percentage,
           array_agg(DISTINCT i.name) AS ingredients,
           array_agg(DISTINCT jsonb_build_object('name', c.name, 'type', c.type, 'is_priority', c.is_priority)) AS categories,
           array_agg(DISTINCT img.url) AS images,
           MIN(CASE WHEN c.type = 'destilado' THEN c.name END) AS destilado_name,
           MIN(CASE WHEN c.type = 'clasificacion comida' THEN c.name END) AS food_classification_name,
           COUNT(DISTINCT CASE WHEN c.is_priority = true THEN c.id END) AS priority_count
    FROM products p
    LEFT JOIN products_ingredients pi ON p.id = pi.product_id
    LEFT JOIN ingredients i ON pi.ingredient_id = i.id
    LEFT JOIN products_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN images img ON p.id = img.product_id
    WHERE p.is_active = true
    ${inactiveCategoryFilter}
    ${
  categoria
    ? `AND p.id IN (
      SELECT pc2.product_id
      FROM products_categories pc2
      JOIN categories c2 ON pc2.category_id = c2.id
      WHERE pc2.product_id = p.id AND c2.name = '${categoria}'
    )`
    : ''
}
    ${tipoFiltro}
    GROUP BY p.id, p.name, p.price, p.description, p.is_active
    ORDER BY priority_count DESC, p.name
    LIMIT ${limite} OFFSET ${offset}
  `;

  // Para el countQuery, usar la misma lógica del tipoFiltro
  const countTipoFiltro = tipo
    ? tipo === 'destilado'
      ? `AND p.id IN (
          SELECT pc3.product_id
          FROM products_categories pc3
          JOIN categories c3 ON pc3.category_id = c3.id
          WHERE c3.type = 'destilado'
        )
        AND p.id IN (
          SELECT pc_cocktail.product_id
          FROM products_categories pc_cocktail
          JOIN categories c_cocktail ON pc_cocktail.category_id = c_cocktail.id
          WHERE c_cocktail.name = 'cocktail' AND c_cocktail.type = 'clasificacion'
        )`
      : `AND p.id IN (
          SELECT pc3.product_id
          FROM products_categories pc3
          JOIN categories c3 ON pc3.category_id = c3.id
          WHERE c3.type = '${
  tipo === 'clasificacion' ? 'clasificacion comida' : tipo
}'
        )`
    : '';

  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    WHERE p.is_active = true
    ${inactiveCategoryFilter}
    ${
  categoria
    ? `AND p.id IN (
      SELECT pc2.product_id
      FROM products_categories pc2
      JOIN categories c2 ON pc2.category_id = c2.id
      WHERE c2.name = '${categoria}'
    )`
    : ''
}
    ${countTipoFiltro}
  `;

  const [result, countResult] = await Promise.all([
    pool.query(query),
    pool.query(countQuery),
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

export default getAllProductsService;
