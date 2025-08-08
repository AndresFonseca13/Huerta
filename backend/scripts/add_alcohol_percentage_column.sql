-- Agrega columna opcional de porcentaje de alcohol a la tabla products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS alcohol_percentage NUMERIC(5,2) CHECK (alcohol_percentage >= 0 AND alcohol_percentage <= 100);

-- No default. Los registros existentes quedarán en NULL.

