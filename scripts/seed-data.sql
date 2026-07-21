-- ============================================================
-- CRM Studio Belle — Seed Data (executar APOS seed-admin.ts)
-- ============================================================

-- store_settings (singleton)
INSERT INTO store_settings (
  id, default_markup, low_stock_threshold, vip_threshold,
  birthday_alert_days, toggle_promos, toggle_estoque,
  toggle_aniversario, toggle_resumo
) VALUES (
  1, 180, 5, 500.00, 7, true, true, true, false
);

-- products (10 itens)
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM profiles LIMIT 1;

  INSERT INTO products (name, category, price, cost, stock, created_by) VALUES
    ('Batom Matte Vermelho Rubi',  'Lábios', 39.90, 14.00, 24, admin_id),
    ('Base Líquida Segunda Pele',  'Rosto',  79.90, 32.00, 12, admin_id),
    ('Máscara Volume Extremo',     'Olhos',  49.90, 18.00,  3, admin_id),
    ('Pó Compacto Matte HD',       'Rosto',  54.90, 22.00, 18, admin_id),
    ('Paleta Nude Sunset',         'Olhos', 119.90, 45.00,  7, admin_id),
    ('Delineador Preto Intenso',   'Olhos',  34.90, 11.00, 30, admin_id),
    ('Blush Pêssego',              'Rosto',  44.90, 15.00,  2, admin_id),
    ('Gloss Labial Cristal',       'Lábios', 29.90,  9.00, 21, admin_id),
    ('Corretivo Alta Cobertura',   'Rosto',  42.90, 16.00, 15, admin_id),
    ('Iluminador Ouro Rosé',       'Rosto',  59.90, 24.00,  9, admin_id);
END;
$$;

-- clients (5 clientes)
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM profiles LIMIT 1;

  INSERT INTO clients (name, phone, birthday, created_by) VALUES
    ('Mariana Alves',   '(42) 99123-4567', '1992-07-23', admin_id),
    ('Patrícia Souza',  '(42) 99234-5678', '1988-03-15', admin_id),
    ('Juliana Costa',   '(42) 99345-6789', '1995-11-02', admin_id),
    ('Camila Ferreira', '(42) 99456-7890', '1990-08-30', admin_id),
    ('Renata Lima',     '(42) 99567-8901', '1987-05-10', admin_id);
END;
$$;

-- sales e sale_items (6 vendas)
-- Desabilitar trigger de estoque durante seed (stock ja reflete estado pos-venda)
ALTER TABLE sale_items DISABLE TRIGGER trg_sale_items_before_insert_stock;

DO $$
DECLARE
  admin_id      uuid;
  mariana_id    uuid;
  patricia_id   uuid;
  juliana_id    uuid;
  camila_id     uuid;
  renata_id     uuid;
  batom_id      uuid;
  base_id       uuid;
  mascara_id    uuid;
  po_id         uuid;
  paleta_id     uuid;
  delineador_id uuid;
  blush_id      uuid;
  gloss_id      uuid;
  corretivo_id  uuid;
  iluminador_id uuid;
  sale1_id      uuid;
  sale2_id      uuid;
  sale3_id      uuid;
  sale4_id      uuid;
  sale5_id      uuid;
  sale6_id      uuid;
BEGIN
  SELECT id INTO admin_id FROM profiles LIMIT 1;

  SELECT id INTO mariana_id   FROM clients WHERE name = 'Mariana Alves';
  SELECT id INTO patricia_id  FROM clients WHERE name = 'Patrícia Souza';
  SELECT id INTO juliana_id   FROM clients WHERE name = 'Juliana Costa';
  SELECT id INTO camila_id    FROM clients WHERE name = 'Camila Ferreira';
  SELECT id INTO renata_id    FROM clients WHERE name = 'Renata Lima';

  SELECT id INTO batom_id      FROM products WHERE name = 'Batom Matte Vermelho Rubi';
  SELECT id INTO base_id       FROM products WHERE name = 'Base Líquida Segunda Pele';
  SELECT id INTO mascara_id    FROM products WHERE name = 'Máscara Volume Extremo';
  SELECT id INTO po_id         FROM products WHERE name = 'Pó Compacto Matte HD';
  SELECT id INTO paleta_id     FROM products WHERE name = 'Paleta Nude Sunset';
  SELECT id INTO delineador_id FROM products WHERE name = 'Delineador Preto Intenso';
  SELECT id INTO blush_id      FROM products WHERE name = 'Blush Pêssego';
  SELECT id INTO gloss_id      FROM products WHERE name = 'Gloss Labial Cristal';
  SELECT id INTO corretivo_id  FROM products WHERE name = 'Corretivo Alta Cobertura';
  SELECT id INTO iluminador_id FROM products WHERE name = 'Iluminador Ouro Rosé';

  -- Venda 1: Patricia Souza, Pix, R$ 189.70, 3 itens, Hoje 19:40
  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, created_at)
  VALUES (patricia_id, 'Pix', 189.70, 3, admin_id, '2026-07-20 19:40:00-03')
  RETURNING id INTO sale1_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (sale1_id, paleta_id, 1, 119.90, 119.90),
    (sale1_id, batom_id,  1,  39.90,  39.90),
    (sale1_id, gloss_id,  1,  29.90,  29.90);

  -- Venda 2: Juliana Costa, Cartao de credito, R$ 74.80, 2 itens, Hoje 18:12
  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, created_at)
  VALUES (juliana_id, 'Cartão de crédito', 74.80, 2, admin_id, '2026-07-20 18:12:00-03')
  RETURNING id INTO sale2_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (sale2_id, delineador_id, 1, 34.90, 34.90),
    (sale2_id, batom_id,      1, 39.90, 39.90);

  -- Venda 3: Camila Ferreira, Dinheiro, R$ 39.90, 1 item, Hoje 16:55
  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, created_at)
  VALUES (camila_id, 'Dinheiro', 39.90, 1, admin_id, '2026-07-20 16:55:00-03')
  RETURNING id INTO sale3_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (sale3_id, batom_id, 1, 39.90, 39.90);

  -- Venda 4: Mariana Alves, Cartao de debito, R$ 116.20, 2 itens, Hoje 15:03
  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, created_at)
  VALUES (mariana_id, 'Cartão de débito', 116.20, 2, admin_id, '2026-07-20 15:03:00-03')
  RETURNING id INTO sale4_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (sale4_id, base_id,       1, 81.30, 81.30),
    (sale4_id, delineador_id, 1, 34.90, 34.90);

  -- Venda 5: Renata Lima, Pix, R$ 210.30, 4 itens, Ontem 20:10
  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, created_at)
  VALUES (renata_id, 'Pix', 210.30, 4, admin_id, '2026-07-19 20:10:00-03')
  RETURNING id INTO sale5_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (sale5_id, batom_id,      1, 39.90,  39.90),
    (sale5_id, gloss_id,      1, 29.90,  29.90),
    (sale5_id, base_id,       1, 79.90,  79.90),
    (sale5_id, iluminador_id, 1, 60.60,  60.60);

  -- Venda 6: Consumidor final (sem cliente), Dinheiro, R$ 29.90, 1 item, Ontem 17:22
  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, created_at)
  VALUES (NULL, 'Dinheiro', 29.90, 1, admin_id, '2026-07-19 17:22:00-03')
  RETURNING id INTO sale6_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (sale6_id, gloss_id, 1, 29.90, 29.90);

END;
$$;

-- Reabilitar trigger de estoque
ALTER TABLE sale_items ENABLE TRIGGER trg_sale_items_before_insert_stock;
