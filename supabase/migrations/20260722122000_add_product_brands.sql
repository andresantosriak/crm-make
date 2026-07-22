-- ============================================================
-- CRM Studio Belle — Marcas de produtos
-- ============================================================
-- Cria cadastro de marcas por estabelecimento, vincula products
-- e preenche produtos atuais com uma marca padrão editável.
-- ============================================================

CREATE TABLE product_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES establishments(id),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
  active boolean NOT NULL DEFAULT true,
  created_by uuid DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, establishment_id)
);

ALTER TABLE product_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_brands_select" ON product_brands
  FOR SELECT USING (can_access_establishment(establishment_id));

CREATE POLICY "product_brands_insert" ON product_brands
  FOR INSERT WITH CHECK (can_access_establishment(establishment_id));

CREATE POLICY "product_brands_update" ON product_brands
  FOR UPDATE
  USING (can_access_establishment(establishment_id))
  WITH CHECK (can_access_establishment(establishment_id));

CREATE UNIQUE INDEX product_brands_establishment_name_uidx
  ON product_brands(establishment_id, lower(trim(name)))
  WHERE active = true;

CREATE INDEX idx_product_brands_establishment_id
  ON product_brands(establishment_id);

CREATE TRIGGER trg_product_brands_updated_at
  BEFORE UPDATE ON product_brands
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_product_brands_set_establishment
  BEFORE INSERT ON product_brands
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_current_establishment_id();

ALTER TABLE products
  ADD COLUMN brand_id uuid;

INSERT INTO product_brands (establishment_id, name)
SELECT DISTINCT p.establishment_id, 'Sem marca'
FROM products p
WHERE NOT EXISTS (
  SELECT 1
  FROM product_brands pb
  WHERE pb.establishment_id = p.establishment_id
    AND lower(trim(pb.name)) = lower('Sem marca')
);

UPDATE products p
SET brand_id = pb.id
FROM product_brands pb
WHERE pb.establishment_id = p.establishment_id
  AND lower(trim(pb.name)) = lower('Sem marca')
  AND p.brand_id IS NULL;

ALTER TABLE products
  ALTER COLUMN brand_id SET NOT NULL,
  ADD CONSTRAINT products_brand_tenant_fkey
    FOREIGN KEY (brand_id, establishment_id)
    REFERENCES product_brands(id, establishment_id);

CREATE INDEX idx_products_brand_id
  ON products(brand_id);

GRANT SELECT (id, name, category, price, stock, active, brand_id, establishment_id, created_by, created_at, updated_at)
  ON products TO authenticated;

CREATE OR REPLACE VIEW products_display AS
SELECT
  p.id,
  p.name,
  p.category,
  p.price,
  p.stock,
  p.active,
  p.establishment_id,
  p.created_by,
  p.created_at,
  p.updated_at,
  CASE
    WHEN get_user_role() IN ('super_admin', 'admin') THEN p.cost
    ELSE NULL
  END AS cost,
  p.brand_id,
  pb.name AS brand_name
FROM products p
JOIN product_brands pb
  ON pb.id = p.brand_id
 AND pb.establishment_id = p.establishment_id
WHERE can_access_establishment(p.establishment_id);

GRANT SELECT, INSERT, UPDATE ON product_brands TO authenticated;
GRANT SELECT ON products_display TO authenticated;
REVOKE ALL ON public.product_brands FROM anon;
REVOKE ALL ON public.products_display FROM anon;
