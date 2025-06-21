const pool = require('../../config/db');

const getCocktailByIdService = async ( id ) => {
    const query = `
        SELECT 
            p.id AS product_id, 
            p.name AS product_name,
            p.description,
            p.price, 
            array_agg(DISTINCT i.name) AS ingredients,
            array_agg(DISTINCT img.url) AS images,
            array_agg(DISTINCT c.name) AS categories
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
}

module.exports = getCocktailByIdService;