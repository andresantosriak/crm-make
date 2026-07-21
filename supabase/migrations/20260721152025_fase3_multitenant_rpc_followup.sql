-- ============================================================
-- CRM Studio Belle — Fase 3 follow-up
-- ============================================================
-- Corrige RPCs apos a primeira migration multi-tenant:
-- - sale_items.establishment_id deve ser preenchido por create_sale.
-- - trigger de estoque deve validar produto dentro do mesmo tenant.
-- - super_admin cria estabelecimentos via RPC com settings iniciais.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validate_and_decrement_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock integer;
BEGIN
  SELECT stock INTO current_stock
  FROM products
  WHERE id = NEW.product_id
    AND establishment_id = NEW.establishment_id
    AND active = true
  FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Produto nao encontrado neste estabelecimento: %', NEW.product_id;
  END IF;

  IF current_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Estoque insuficiente para o produto %. Disponivel: %, solicitado: %',
      NEW.product_id, current_stock, NEW.quantity;
  END IF;

  UPDATE products
  SET stock = stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id
    AND establishment_id = NEW.establishment_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_establishment(
  p_name text,
  p_slug text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_establishment_id uuid;
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Apenas o admin geral pode criar estabelecimentos';
  END IF;

  INSERT INTO establishments (name, slug, created_by)
  VALUES (p_name, p_slug, requesting_user_id())
  RETURNING id INTO v_establishment_id;

  INSERT INTO store_settings (establishment_id)
  VALUES (v_establishment_id);

  RETURN v_establishment_id;
END;
$$;

DROP FUNCTION IF EXISTS create_sale(uuid, text, jsonb);

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
  v_price numeric(10,2);
  v_product_establishment_id uuid;
  v_establishment_id uuid;
BEGIN
  IF requesting_user_id() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
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
    v_qty := (v_item ->> 'quantity')::integer;
    v_price := (v_item ->> 'unit_price')::numeric(10,2);

    IF v_qty <= 0 OR v_price <= 0 THEN
      RAISE EXCEPTION 'Quantidade e preco devem ser positivos';
    END IF;

    SELECT establishment_id INTO v_product_establishment_id
    FROM products
    WHERE id = (v_item ->> 'product_id')::uuid
      AND active = true;

    IF v_product_establishment_id IS NULL THEN
      RAISE EXCEPTION 'Produto nao encontrado: %', v_item ->> 'product_id';
    END IF;

    IF v_product_establishment_id <> v_establishment_id THEN
      RAISE EXCEPTION 'Todos os itens devem pertencer ao mesmo estabelecimento';
    END IF;

    v_total := v_total + (v_qty * v_price);
    v_items_count := v_items_count + v_qty;
  END LOOP;

  INSERT INTO sales (client_id, payment_method, total, items_count, created_by, establishment_id)
  VALUES (p_client_id, p_payment_method, v_total, v_items_count, auth.uid(), v_establishment_id)
  RETURNING id INTO v_sale_id;

  INSERT INTO sale_items (establishment_id, sale_id, product_id, quantity, unit_price, subtotal)
  SELECT
    v_establishment_id,
    v_sale_id,
    (item ->> 'product_id')::uuid,
    (item ->> 'quantity')::integer,
    (item ->> 'unit_price')::numeric(10,2),
    (item ->> 'quantity')::integer * (item ->> 'unit_price')::numeric(10,2)
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_sale_id;
END;
$$;

CREATE OR REPLACE FUNCTION cancel_sale(p_sale_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_establishment_id uuid;
  v_refunded_at timestamptz;
BEGIN
  SELECT establishment_id, refunded_at
  INTO v_establishment_id, v_refunded_at
  FROM sales
  WHERE id = p_sale_id
  FOR UPDATE;

  IF v_establishment_id IS NULL THEN
    RAISE EXCEPTION 'Venda nao encontrada';
  END IF;

  IF NOT is_establishment_admin_for(v_establishment_id) THEN
    RAISE EXCEPTION 'Apenas admin pode estornar vendas';
  END IF;

  IF v_refunded_at IS NOT NULL THEN
    RAISE EXCEPTION 'Venda ja estornada';
  END IF;

  UPDATE sales
  SET refunded_at = now()
  WHERE id = p_sale_id;

  UPDATE products p
  SET stock = p.stock + si.quantity,
      updated_at = now()
  FROM sale_items si
  WHERE si.sale_id = p_sale_id
    AND si.establishment_id = v_establishment_id
    AND si.product_id = p.id
    AND p.establishment_id = v_establishment_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_establishment(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_establishment(text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION create_sale(uuid, text, jsonb, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_sale(uuid, text, jsonb, uuid) TO authenticated;
