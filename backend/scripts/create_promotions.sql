-- Creación de tablas para promociones
-- Requiere extensión de UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal de promociones
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE, -- puede ser NULL si es indefinida
  start_time TIME, -- hora de inicio diaria (opcional)
  end_time TIME,   -- hora de fin diaria (opcional)
  days_of_week INT[], -- 0..6 (0=Domingo) usando EXTRACT(DOW)
  conditions JSONB, -- reglas adicionales (ej: {"type":"two_for_one"})
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disparador simple para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_promotions_updated_at ON promotions;
CREATE TRIGGER trg_promotions_updated_at
BEFORE UPDATE ON promotions
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Alcance/targets de la promoción
CREATE TABLE IF NOT EXISTS promotion_applicability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_type TEXT, -- ej: 'destilado' o 'clasificacion comida'
  CONSTRAINT chk_target_present CHECK (
    category_id IS NOT NULL OR product_id IS NOT NULL OR category_type IS NOT NULL
  )
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_validity ON promotions(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_promotions_times ON promotions(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_promo_app_promotion ON promotion_applicability(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promo_app_category ON promotion_applicability(category_id);
CREATE INDEX IF NOT EXISTS idx_promo_app_product ON promotion_applicability(product_id);

