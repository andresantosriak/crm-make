-- ============================================================
-- Security Hardening — Fase 2 Audit Fixes
-- ============================================================

-- ============================================================
-- HIGH 1: Bloquear INSERT direto em sales/sale_items
-- Converter create_sale para SECURITY DEFINER e remover policies INSERT
-- ============================================================

DROP POLICY IF EXISTS "sales_insert" ON sales;
DROP POLICY IF EXISTS "sale_items_insert" ON sale_items;

CREATE POLICY "sales_deny_insert" ON sales
  FOR INSERT WITH CHECK (false);

CREATE POLICY "sale_items_deny_insert" ON sale_items
  FOR INSERT WITH CHECK (false);

CREATE OR REPLACE FUNCTION create_sale(
  p_client_id      uuid DEFAULT NULL,
  p_payment_method text DEFAULT 'Dinheiro',
  p_items          jsonb DEFAULT '[]'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale_id     uuid;
  v_total       numeric(10,2) := 0;
  v_items_count integer := 0;
  v_item        jsonb;
  v_qty         integer;
  v_price       numeric(10,2);
BEGIN
  IF requesting_user_id() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'A venda deve conter pelo menos um item';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty   := (v_item ->> 'quantity')::integer;
    v_price := (v_item ->> 'unit_price')::numeric(10,2);

    IF v_qty <= 0 OR v_price <= 0 THEN
      RAISE EXCEPTION 'Quantidade e preco devem ser positivos';
    END IF;

    v_total       := v_total + (v_qty * v_price);
    v_items_count := v_items_count + v_qty;
  END LOOP;

  INSERT INTO sales (client_id, payment_method, total, items_count, created_by)
  VALUES (p_client_id, p_payment_method, v_total, v_items_count, auth.uid())
  RETURNING id INTO v_sale_id;

  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
  SELECT
    v_sale_id,
    (item ->> 'product_id')::uuid,
    (item ->> 'quantity')::integer,
    (item ->> 'unit_price')::numeric(10,2),
    (item ->> 'quantity')::integer * (item ->> 'unit_price')::numeric(10,2)
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_sale_id;
END;
$$;


-- ============================================================
-- HIGH 2: Bloquear UPDATE active=false por non-admin
-- Triggers BEFORE UPDATE em products e clients
-- ============================================================

CREATE OR REPLACE FUNCTION fn_guard_soft_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.active = true AND NEW.active = false AND NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas admin pode desativar este registro';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_guard_soft_delete
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION fn_guard_soft_delete();

CREATE TRIGGER trg_clients_guard_soft_delete
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION fn_guard_soft_delete();


-- ============================================================
-- MEDIUM 4: Protecao de custo via column-level privileges
-- REVOKE table-level SELECT, GRANT apenas colunas sem cost.
-- View recriada sem security_invoker (roda como owner, le cost).
-- ============================================================

REVOKE SELECT ON products FROM authenticated;

GRANT SELECT (id, name, category, price, stock, active, created_by, created_at, updated_at)
  ON products TO authenticated;

CREATE OR REPLACE VIEW products_display AS
SELECT
  id, name, category, price, stock, active, created_by, created_at, updated_at,
  CASE
    WHEN get_user_role() = 'admin' THEN cost
    ELSE NULL
  END AS cost
FROM products;

GRANT SELECT ON products_display TO authenticated;

-- Revogar acesso anon a todas as tabelas/views (view sem security_invoker
-- pode herdar grants do owner; anon nao deve ler dados operacionais)
REVOKE ALL ON public.products_display FROM anon;
REVOKE ALL ON public.sales FROM anon;
REVOKE ALL ON public.sale_items FROM anon;
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.store_settings FROM anon;
