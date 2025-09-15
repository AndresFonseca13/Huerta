-- Añade columna de prioridad opcional a promociones
ALTER TABLE promotions
ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT FALSE;

-- Índice para ordenar por prioridad primero
CREATE INDEX IF NOT EXISTS idx_promotions_priority ON promotions(is_priority DESC, created_at DESC);

