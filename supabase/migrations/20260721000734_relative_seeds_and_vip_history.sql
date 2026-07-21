-- ============================================================
-- Seeds com data RELATIVA + historico VIP da Patricia
-- ============================================================

-- 1. Atualizar created_at das 6 vendas seed para datas relativas
-- Vendas 1-4: hoje em horarios distintos
-- Vendas 5-6: ontem
UPDATE sales SET created_at = (CURRENT_DATE + INTERVAL '19 hours 40 minutes')
WHERE created_at = '2026-07-20 19:40:00-03';

UPDATE sales SET created_at = (CURRENT_DATE + INTERVAL '18 hours 12 minutes')
WHERE created_at = '2026-07-20 18:12:00-03';

UPDATE sales SET created_at = (CURRENT_DATE + INTERVAL '16 hours 55 minutes')
WHERE created_at = '2026-07-20 16:55:00-03';

UPDATE sales SET created_at = (CURRENT_DATE + INTERVAL '15 hours 3 minutes')
WHERE created_at = '2026-07-20 15:03:00-03';

UPDATE sales SET created_at = (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '20 hours 10 minutes')
WHERE created_at = '2026-07-19 20:10:00-03';

UPDATE sales SET created_at = (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '17 hours 22 minutes')
WHERE created_at = '2026-07-19 17:22:00-03';

-- 2. Vendas historicas para Patricia atingir VIP (>= 500)
-- Patricia ja tem 189.70 da venda seed. Adicionamos ~322 em vendas antigas.
-- Trigger de estoque desabilitado pois stock dos seeds ja reflete estado final.
ALTER TABLE sale_items DISABLE TRIGGER trg_sale_items_before_insert_stock;

DO $$
DECLARE
  admin_id     uuid;
  patricia_id  uuid;
  batom_id     uuid;
  base_id      uuid;
  corretivo_id uuid;
  sale_a_id    uuid;
  sale_b_id    uuid;
BEGIN
  SELECT id INTO admin_id FROM profiles LIMIT 1;
  SELECT id INTO patricia_id FROM clients WHERE name = 'Patrícia Souza';
  SELECT id INTO batom_id FROM products WHERE name = 'Batom Matte Vermelho Rubi';
  SELECT id INTO base_id FROM products WHERE name = 'Base Líquida Segunda Pele';
  SELECT id INTO corretivo_id FROM products WHERE name = 'Corretivo Alta Cobertura';

  -- Venda A: 30 dias atras, R$ 162.70 (base + corretivo)
  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, created_at)
  VALUES (patricia_id, 'Cartão de crédito', 162.70, 2, admin_id, CURRENT_DATE - INTERVAL '30 days' + INTERVAL '14 hours')
  RETURNING id INTO sale_a_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (sale_a_id, base_id,      1, 79.90, 79.90),
    (sale_a_id, corretivo_id, 1, 82.80, 82.80);

  -- Venda B: 60 dias atras, R$ 159.60 (batom x4)
  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, created_at)
  VALUES (patricia_id, 'Pix', 159.60, 4, admin_id, CURRENT_DATE - INTERVAL '60 days' + INTERVAL '11 hours')
  RETURNING id INTO sale_b_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (sale_b_id, batom_id, 4, 39.90, 159.60);
END;
$$;

ALTER TABLE sale_items ENABLE TRIGGER trg_sale_items_before_insert_stock;

-- Patricia total: 189.70 + 162.70 + 159.60 = 512.00 >= 500 → VIP

-- 3. Atualizar birthday da Mariana para hoje (garante tag ANIVERSARIO funciona em qualquer data)
UPDATE clients
SET birthday = MAKE_DATE(
  EXTRACT(YEAR FROM CURRENT_DATE)::int - 34,
  EXTRACT(MONTH FROM CURRENT_DATE)::int,
  EXTRACT(DAY FROM CURRENT_DATE)::int
)
WHERE name = 'Mariana Alves';
