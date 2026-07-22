-- ============================================================
-- CRM Studio Belle — Combos na venda
-- ============================================================
-- Adiciona snapshot de combos em sale_items e reforca a RPC
-- create_sale para validar desconto e isolamento por tenant.
-- ============================================================

ALTER TABLE sale_items
  ADD COLUMN original_unit_price numeric(10,2),
  ADD COLUMN discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN combo_group_id text,
  ADD COLUMN combo_name text,
  ADD COLUMN combo_discount_type text,
  ADD COLUMN combo_discount_value numeric(10,2);

UPDATE sale_items
SET original_unit_price = unit_price
WHERE original_unit_price IS NULL;

ALTER TABLE sale_items
  ALTER COLUMN original_unit_price SET NOT NULL,
  ADD CONSTRAINT sale_items_original_unit_price_check CHECK (original_unit_price > 0),
  ADD CONSTRAINT sale_items_discount_amount_check CHECK (discount_amount >= 0),
  ADD CONSTRAINT sale_items_effective_price_check CHECK (unit_price <= original_unit_price),
  ADD CONSTRAINT sale_items_combo_discount_type_check
    CHECK (combo_discount_type IS NULL OR combo_discount_type IN ('percent', 'fixed')),
  ADD CONSTRAINT sale_items_combo_name_check
    CHECK (combo_name IS NULL OR length(trim(combo_name)) BETWEEN 1 AND 80),
  ADD CONSTRAINT sale_items_combo_group_check CHECK (
    (
      combo_group_id IS NULL
      AND combo_name IS NULL
      AND combo_discount_type IS NULL
      AND combo_discount_value IS NULL
    )
    OR (
      combo_group_id IS NOT NULL
      AND combo_name IS NOT NULL
      AND combo_discount_type IS NOT NULL
      AND combo_discount_value IS NOT NULL
      AND combo_discount_value > 0
    )
  ),
  ADD CONSTRAINT sale_items_discount_requires_combo_check
    CHECK (discount_amount = 0 OR combo_group_id IS NOT NULL);

CREATE INDEX idx_sale_items_combo_group_id
  ON sale_items(combo_group_id)
  WHERE combo_group_id IS NOT NULL;

DROP FUNCTION IF EXISTS create_sale(uuid, text, jsonb, uuid);

CREATE OR REPLACE FUNCTION create_sale(
  p_client_id uuid DEFAULT NULL,
  p_payment_method text DEFAULT 'Dinheiro',
  p_items jsonb DEFAULT '[]',
  p_establishment_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale_id uuid;
  v_total numeric(10,2) := 0;
  v_items_count integer := 0;
  v_item jsonb;
  v_qty integer;
  v_product_id uuid;
  v_effective_price numeric(10,2);
  v_original_price numeric(10,2);
  v_discount_amount numeric(10,2);
  v_product_establishment_id uuid;
  v_establishment_id uuid;
  v_combo_group_id text;
  v_combo_name text;
  v_combo_discount_type text;
  v_combo_discount_value numeric(10,2);
  v_combo_product_count integer;
  v_combo_mismatch_count integer;
  v_has_combo boolean;
BEGIN
  IF requesting_user_id() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'A venda deve conter pelo menos um item';
  END IF;

  IF is_super_admin() THEN
    v_establishment_id := p_establishment_id;
  ELSE
    v_establishment_id := current_establishment_id();
  END IF;

  IF v_establishment_id IS NULL AND p_client_id IS NOT NULL THEN
    SELECT establishment_id INTO v_establishment_id
    FROM clients
    WHERE id = p_client_id;
  END IF;

  IF v_establishment_id IS NULL THEN
    SELECT p.establishment_id INTO v_establishment_id
    FROM products p
    WHERE p.id = ((p_items -> 0) ->> 'product_id')::uuid;
  END IF;

  IF v_establishment_id IS NULL OR NOT can_access_establishment(v_establishment_id) THEN
    RAISE EXCEPTION 'Estabelecimento nao autorizado para esta venda';
  END IF;

  IF p_client_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM clients
    WHERE id = p_client_id
      AND establishment_id = v_establishment_id
      AND active = true
  ) THEN
    RAISE EXCEPTION 'Cliente nao pertence ao estabelecimento selecionado';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_qty := (v_item ->> 'quantity')::integer;
    v_effective_price := (v_item ->> 'unit_price')::numeric(10,2);
    v_combo_group_id := nullif(trim(coalesce(v_item ->> 'combo_group_id', '')), '');
    v_combo_name := nullif(trim(coalesce(v_item ->> 'combo_name', '')), '');
    v_combo_discount_type := nullif(trim(coalesce(v_item ->> 'combo_discount_type', '')), '');
    v_combo_discount_value := nullif(v_item ->> 'combo_discount_value', '')::numeric(10,2);
    v_has_combo := v_combo_group_id IS NOT NULL
      OR v_combo_name IS NOT NULL
      OR v_combo_discount_type IS NOT NULL
      OR v_combo_discount_value IS NOT NULL;

    IF v_qty <= 0 OR v_effective_price <= 0 THEN
      RAISE EXCEPTION 'Quantidade e preco devem ser positivos';
    END IF;

    SELECT establishment_id, price
    INTO v_product_establishment_id, v_original_price
    FROM products
    WHERE id = v_product_id
      AND active = true;

    IF v_product_establishment_id IS NULL THEN
      RAISE EXCEPTION 'Produto nao encontrado: %', v_item ->> 'product_id';
    END IF;

    IF v_product_establishment_id <> v_establishment_id THEN
      RAISE EXCEPTION 'Todos os itens devem pertencer ao mesmo estabelecimento';
    END IF;

    IF v_effective_price > v_original_price THEN
      RAISE EXCEPTION 'Preco efetivo nao pode ser maior que o preco do produto';
    END IF;

    v_discount_amount := round((v_original_price - v_effective_price) * v_qty, 2);

    IF v_has_combo THEN
      IF v_combo_group_id IS NULL
        OR v_combo_name IS NULL
        OR v_combo_discount_type IS NULL
        OR v_combo_discount_value IS NULL
        OR v_combo_discount_value <= 0
      THEN
        RAISE EXCEPTION 'Combo deve ter identificador, nome, tipo e valor de desconto';
      END IF;

      IF length(v_combo_name) > 80 THEN
        RAISE EXCEPTION 'Nome do combo deve ter no maximo 80 caracteres';
      END IF;

      IF v_combo_discount_type NOT IN ('percent', 'fixed') THEN
        RAISE EXCEPTION 'Tipo de desconto de combo invalido';
      END IF;

      SELECT count(DISTINCT item ->> 'product_id')
      INTO v_combo_product_count
      FROM jsonb_array_elements(p_items) AS item
      WHERE nullif(trim(coalesce(item ->> 'combo_group_id', '')), '') = v_combo_group_id;

      IF v_combo_product_count < 2 THEN
        RAISE EXCEPTION 'Combo deve conter pelo menos dois produtos';
      END IF;

      SELECT count(*)
      INTO v_combo_mismatch_count
      FROM jsonb_array_elements(p_items) AS item
      WHERE nullif(trim(coalesce(item ->> 'combo_group_id', '')), '') = v_combo_group_id
        AND (
          nullif(trim(coalesce(item ->> 'combo_name', '')), '') IS DISTINCT FROM v_combo_name
          OR nullif(trim(coalesce(item ->> 'combo_discount_type', '')), '') IS DISTINCT FROM v_combo_discount_type
          OR nullif(item ->> 'combo_discount_value', '')::numeric(10,2) IS DISTINCT FROM v_combo_discount_value
        );

      IF v_combo_mismatch_count > 0 THEN
        RAISE EXCEPTION 'Itens do mesmo combo devem repetir nome, tipo e valor do desconto';
      END IF;
    ELSIF v_discount_amount > 0 THEN
      RAISE EXCEPTION 'Desconto exige metadados de combo';
    END IF;

    v_total := v_total + (v_qty * v_effective_price);
    v_items_count := v_items_count + v_qty;
  END LOOP;

  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, establishment_id)
  VALUES (p_client_id, p_payment_method, round(v_total, 2), v_items_count, auth.uid(), v_establishment_id)
  RETURNING id INTO v_sale_id;

  INSERT INTO sale_items (
    establishment_id,
    sale_id,
    product_id,
    quantity,
    unit_price,
    original_unit_price,
    discount_amount,
    subtotal,
    combo_group_id,
    combo_name,
    combo_discount_type,
    combo_discount_value
  )
  SELECT
    v_establishment_id,
    v_sale_id,
    (item ->> 'product_id')::uuid,
    parsed.quantity,
    parsed.unit_price,
    p.price,
    round((p.price - parsed.unit_price) * parsed.quantity, 2),
    round(parsed.quantity * parsed.unit_price, 2),
    parsed.combo_group_id,
    parsed.combo_name,
    parsed.combo_discount_type,
    parsed.combo_discount_value
  FROM jsonb_array_elements(p_items) AS item
  JOIN products p
    ON p.id = (item ->> 'product_id')::uuid
   AND p.establishment_id = v_establishment_id
  CROSS JOIN LATERAL (
    SELECT
      (item ->> 'quantity')::integer AS quantity,
      (item ->> 'unit_price')::numeric(10,2) AS unit_price,
      nullif(trim(coalesce(item ->> 'combo_group_id', '')), '') AS combo_group_id,
      nullif(trim(coalesce(item ->> 'combo_name', '')), '') AS combo_name,
      nullif(trim(coalesce(item ->> 'combo_discount_type', '')), '') AS combo_discount_type,
      nullif(item ->> 'combo_discount_value', '')::numeric(10,2) AS combo_discount_value
  ) AS parsed;

  RETURN v_sale_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_sale(uuid, text, jsonb, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_sale(uuid, text, jsonb, uuid) TO authenticated;
