-- ============================================
-- CONSULTAS SQL PARA OBTENER PRODUCTOS CON SUS CATEGORÍAS
-- ============================================

-- OPCIÓN 1: Productos con categorías como array JSON
-- Esta consulta devuelve una fila por producto con todas sus categorías en un array
SELECT 
    p.id,
    p.name AS nombre_producto,
    p.price AS precio,
    p.description AS descripcion,
    p.is_active AS activo,
    p.alcohol_percentage AS porcentaje_alcohol,
    array_agg(DISTINCT jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'type', c.type
    )) FILTER (WHERE c.id IS NOT NULL) AS categorias
FROM products p
LEFT JOIN products_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
GROUP BY p.id, p.name, p.price, p.description, p.is_active, p.alcohol_percentage
ORDER BY p.name;

-- ============================================

-- OPCIÓN 2: Productos con categorías como array de nombres
-- Más simple, solo devuelve los nombres de las categorías
SELECT 
    p.id,
    p.name AS nombre_producto,
    p.price AS precio,
    p.description AS descripcion,
    p.is_active AS activo,
    p.alcohol_percentage AS porcentaje_alcohol,
    array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) AS nombres_categorias,
    array_agg(DISTINCT c.type) FILTER (WHERE c.type IS NOT NULL) AS tipos_categorias
FROM products p
LEFT JOIN products_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
GROUP BY p.id, p.name, p.price, p.description, p.is_active, p.alcohol_percentage
ORDER BY p.name;

-- ============================================

-- OPCIÓN 3: Resultado desnormalizado (una fila por producto-categoría)
-- Útil si quieres ver cada categoría en una fila separada
SELECT 
    p.id AS producto_id,
    p.name AS nombre_producto,
    p.price AS precio,
    p.description AS descripcion,
    p.is_active AS activo,
    p.alcohol_percentage AS porcentaje_alcohol,
    c.id AS categoria_id,
    c.name AS nombre_categoria,
    c.type AS tipo_categoria
FROM products p
LEFT JOIN products_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
ORDER BY p.name, c.name;

-- ============================================

-- OPCIÓN 4: Solo productos activos con categorías
SELECT 
    p.id,
    p.name AS nombre_producto,
    p.price AS precio,
    p.description AS descripcion,
    p.alcohol_percentage AS porcentaje_alcohol,
    array_agg(DISTINCT jsonb_build_object(
        'name', c.name,
        'type', c.type
    )) FILTER (WHERE c.id IS NOT NULL) AS categorias
FROM products p
LEFT JOIN products_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.price, p.description, p.alcohol_percentage
ORDER BY p.name;

-- ============================================

-- OPCIÓN 5: Productos con categorías formateadas como texto separado por comas
SELECT 
    p.id,
    p.name AS nombre_producto,
    p.price AS precio,
    p.description AS descripcion,
    p.is_active AS activo,
    p.alcohol_percentage AS porcentaje_alcohol,
    STRING_AGG(DISTINCT c.name, ', ') AS categorias_nombres,
    STRING_AGG(DISTINCT c.type, ', ') AS categorias_tipos
FROM products p
LEFT JOIN products_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
GROUP BY p.id, p.name, p.price, p.description, p.is_active, p.alcohol_percentage
ORDER BY p.name;

-- ============================================

-- OPCIÓN 6: Productos con categorías agrupadas por tipo
SELECT 
    p.id,
    p.name AS nombre_producto,
    p.price AS precio,
    p.description AS descripcion,
    p.is_active AS activo,
    p.alcohol_percentage AS porcentaje_alcohol,
    array_agg(DISTINCT c.name) FILTER (WHERE c.type = 'destilado') AS categorias_destilado,
    array_agg(DISTINCT c.name) FILTER (WHERE c.type = 'clasificacion comida') AS categorias_comida,
    array_agg(DISTINCT c.name) FILTER (WHERE c.type = 'vino') AS categorias_vino,
    array_agg(DISTINCT c.name) FILTER (WHERE c.type = 'clasificacion bebida') AS categorias_bebida
FROM products p
LEFT JOIN products_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
GROUP BY p.id, p.name, p.price, p.description, p.is_active, p.alcohol_percentage
ORDER BY p.name;

