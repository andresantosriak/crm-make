-- CRM Studio Belle — Inferência de marcas do catálogo atual
--
-- O schema anterior não tinha campo de marca estruturado. Esta migration
-- converte marcas reconhecíveis no nome dos produtos atuais em product_brands.

WITH brand_patterns (brand_name, product_name_pattern, priority) AS (
  VALUES
    ('Ruby Rose', '%ruby rose%', 10),
    ('Vivai', '%vivai%', 20),
    ('Dapop', '%dapop%', 30),
    ('Febella', '%febella%', 40)
),
matched_brands AS (
  SELECT DISTINCT p.establishment_id, bp.brand_name
  FROM products p
  JOIN brand_patterns bp
    ON lower(p.name) LIKE bp.product_name_pattern
)
INSERT INTO product_brands (establishment_id, name)
SELECT mb.establishment_id, mb.brand_name
FROM matched_brands mb
WHERE NOT EXISTS (
  SELECT 1
  FROM product_brands pb
  WHERE pb.establishment_id = mb.establishment_id
    AND lower(trim(pb.name)) = lower(trim(mb.brand_name))
);

WITH brand_patterns (brand_name, product_name_pattern, priority) AS (
  VALUES
    ('Ruby Rose', '%ruby rose%', 10),
    ('Vivai', '%vivai%', 20),
    ('Dapop', '%dapop%', 30),
    ('Febella', '%febella%', 40)
),
ranked_matches AS (
  SELECT
    p.id AS product_id,
    p.establishment_id,
    bp.brand_name,
    row_number() OVER (
      PARTITION BY p.id
      ORDER BY bp.priority
    ) AS match_rank
  FROM products p
  JOIN brand_patterns bp
    ON lower(p.name) LIKE bp.product_name_pattern
)
UPDATE products p
SET brand_id = pb.id
FROM ranked_matches rm
JOIN product_brands pb
  ON pb.establishment_id = rm.establishment_id
  AND lower(trim(pb.name)) = lower(trim(rm.brand_name))
WHERE p.id = rm.product_id
  AND rm.match_rank = 1;
