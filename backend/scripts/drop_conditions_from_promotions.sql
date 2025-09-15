-- Elimina la columna 'conditions' de la tabla promotions si existe
ALTER TABLE promotions
DROP COLUMN IF EXISTS conditions;

