-- Script para añadir la columna is_active a la tabla products si no existe
DO $$
BEGIN
    -- Verificar si la columna is_active existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'is_active'
    ) THEN
        -- Añadir la columna is_active con valor por defecto true
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        
        -- Actualizar todos los registros existentes para que estén activos
        UPDATE products SET is_active = true WHERE is_active IS NULL;
        
        RAISE NOTICE 'Columna is_active añadida a la tabla products';
    ELSE
        RAISE NOTICE 'La columna is_active ya existe en la tabla products';
    END IF;
END $$; 