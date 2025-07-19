import pool from '../../config/db.js';

const getAllCocktailsAdminService = async ({
  categoria,
  tipo,
  orden,
  limite,
  offset,
}) => {
  console.log('[DEBUG] getAllCocktailsAdminService - Parámetros recibidos:', {
    categoria,
    tipo,
    orden,
    limite,
    offset,
  });

  const ordenValido = ['name', 'price'].includes(orden) ? orden : 'name';

  // Consulta principal para obtener TODOS los cocteles (activos e inactivos)
  const query = `
    SELECT p.id, p.name, p.price, p.description, p.is_active,
           array_agg(DISTINCT i.name) AS ingredients,
           array_agg(DISTINCT c.name) AS categories,
           array_agg(DISTINCT img.url) AS images
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
        WHERE pc3.product_id = p.id AND c3.type = $2
      ))
    GROUP BY p.id, p.name, p.price, p.description, p.is_active
    ORDER BY p."${ordenValido}"
    LIMIT $3 OFFSET $4
  `;

  // Consulta para contar el total de registros
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
        WHERE pc3.product_id = p.id AND c3.type = $2
      ))
  `;

  const values = [categoria, tipo, limite, offset];
  const countValues = [categoria, tipo];

  console.log(
    '[DEBUG] getAllCocktailsAdminService - Valores de la consulta:',
    values,
  );
  console.log(
    '[DEBUG] getAllCocktailsAdminService - Valores del conteo:',
    countValues,
  );

  // Ejecutar ambas consultas en paralelo
  const [result, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query(countQuery, countValues),
  ]);

  console.log('[DEBUG] getAllCocktailsAdminService - Resultados obtenidos:', {
    cocktailsCount: result.rows.length,
    totalCount: countResult.rows[0].total,
    sampleCocktail: result.rows[0]
      ? {
        id: result.rows[0].id,
        name: result.rows[0].name,
        is_active: result.rows[0].is_active,
        categories: result.rows[0].categories,
      }
      : null,
  });

  // Procesar los resultados para limpiar los arrays
  const processedCocktails = result.rows.map((cocktail) => {
    // Filtrar valores null de ingredientes, categorías e imágenes
    cocktail.ingredients = cocktail.ingredients.filter(
      (ingredient) => ingredient !== null,
    );
    cocktail.categories = cocktail.categories.filter(
      (category) => category !== null,
    );
    cocktail.images = cocktail.images.filter((image) => image !== null);
    return cocktail;
  });

  const totalRecords = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(totalRecords / limite);

  return {
    cocktails: processedCocktails,
    pagination: {
      totalRecords,
      totalPages,
      currentPage: Math.floor(offset / limite) + 1,
      limit: limite,
      offset: offset,
    },
  };
};

export default getAllCocktailsAdminService;
