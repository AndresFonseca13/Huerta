-- Agregar columna is_priority a la tabla categories
-- Esta columna permite marcar categorías como prioritarias para que sus productos aparezcan primero en el menú

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT FALSE;

-- Crear índice para mejorar el rendimiento de las consultas que filtran por prioridad
CREATE INDEX IF NOT EXISTS idx_categories_is_priority ON categories(is_priority);

-- Comentario en la columna para documentación
COMMENT ON COLUMN categories.is_priority IS 'Indica si la categoría es prioritaria. Los productos de categorías prioritarias aparecerán primero en el menú.';

