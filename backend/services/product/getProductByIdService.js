import pool from '../../config/db.js';

const getProductByIdService = async (id) => {
  const query = `
        SELECT 
            p.id AS product_id, 
            p.name AS product_name,
            p.description,
            p.price,
            p.alcohol_percentage,
            array_agg(DISTINCT i.name) AS ingredients,
            array_agg(DISTINCT img.url) AS images,
            array_agg(DISTINCT c.name) AS categories,
            MIN(CASE WHEN c.type = 'destilado' THEN c.name END) AS destilado_name,
            MIN(CASE WHEN c.type = 'clasificacion comida' THEN c.name END) AS food_classification_name
        FROM products p
        LEFT JOIN products_ingredients pi ON p.id = pi.product_id
        LEFT JOIN ingredients i ON pi.ingredient_id = i.id
        LEFT JOIN images img ON p.id = img.product_id
        LEFT JOIN products_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.id = $1
        GROUP BY p.id
    `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export default getProductByIdService;
