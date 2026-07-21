-- ============================================================
-- CRM Studio Belle — Fase 3: Multi-estabelecimento + super admin
-- ============================================================
-- Objetivo:
-- - Andre (andresantos.riak@gmail.com) vira o unico super_admin global.
-- - Cada estabelecimento tem produtos, clientes, vendas e configuracoes isoladas.
-- - Admin local gerencia apenas o proprio estabelecimento.
-- - Funcionarios operam apenas o proprio estabelecimento.
-- - RLS, views e RPCs bloqueiam bypass via REST direto.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Estabelecimentos
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS establishments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  active     boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_establishments_updated_at ON establishments;
CREATE TRIGGER trg_establishments_updated_at
  BEFORE UPDATE ON establishments
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ------------------------------------------------------------
-- 2. Roles e colunas tenant-aware
-- ------------------------------------------------------------

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'employee'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS establishment_id uuid;
ALTER TABLE products ADD COLUMN IF NOT EXISTS establishment_id uuid;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS establishment_id uuid;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS establishment_id uuid;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS establishment_id uuid;

ALTER TABLE store_settings DROP CONSTRAINT IF EXISTS store_settings_id_check;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS establishment_id uuid;

CREATE SEQUENCE IF NOT EXISTS store_settings_id_seq;
SELECT setval(
  'store_settings_id_seq',
  COALESCE((SELECT max(id) FROM store_settings), 0) + 1,
  false
);
ALTER TABLE store_settings ALTER COLUMN id SET DEFAULT nextval('store_settings_id_seq');
ALTER SEQUENCE store_settings_id_seq OWNED BY store_settings.id;

DO $$
DECLARE
  v_establishment_id uuid;
  v_andre_id uuid;
BEGIN
  SELECT id INTO v_andre_id
  FROM auth.users
  WHERE lower(email) = 'andresantos.riak@gmail.com'
  LIMIT 1;

  INSERT INTO establishments (name, slug, created_by)
  VALUES ('Studio Bell PG', 'studio-bell-pg', v_andre_id)
  ON CONFLICT (slug)
  DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_establishment_id;

  IF v_andre_id IS NOT NULL THEN
    UPDATE profiles
    SET role = 'super_admin',
        establishment_id = NULL,
        updated_at = now()
    WHERE id = v_andre_id;
  END IF;

  UPDATE profiles
  SET establishment_id = v_establishment_id,
      updated_at = now()
  WHERE establishment_id IS NULL
    AND role <> 'super_admin';

  UPDATE products
  SET establishment_id = v_establishment_id
  WHERE establishment_id IS NULL;

  UPDATE clients
  SET establishment_id = v_establishment_id
  WHERE establishment_id IS NULL;

  UPDATE sales
  SET establishment_id = v_establishment_id
  WHERE establishment_id IS NULL;

  UPDATE sale_items si
  SET establishment_id = s.establishment_id
  FROM sales s
  WHERE si.sale_id = s.id
    AND si.establishment_id IS NULL;

  UPDATE store_settings
  SET establishment_id = v_establishment_id
  WHERE establishment_id IS NULL;
END $$;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id);

ALTER TABLE products
  ADD CONSTRAINT products_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id);

ALTER TABLE clients
  ADD CONSTRAINT clients_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id);

ALTER TABLE sales
  ADD CONSTRAINT sales_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id);

ALTER TABLE store_settings
  ADD CONSTRAINT store_settings_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id);

ALTER TABLE sale_items
  ADD CONSTRAINT sale_items_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id);

ALTER TABLE products ALTER COLUMN establishment_id SET NOT NULL;
ALTER TABLE clients ALTER COLUMN establishment_id SET NOT NULL;
ALTER TABLE sales ALTER COLUMN establishment_id SET NOT NULL;
ALTER TABLE sale_items ALTER COLUMN establishment_id SET NOT NULL;
ALTER TABLE store_settings ALTER COLUMN establishment_id SET NOT NULL;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_establishment_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_establishment_check
  CHECK (
    (role = 'super_admin' AND establishment_id IS NULL)
    OR (role IN ('admin', 'employee') AND establishment_id IS NOT NULL)
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_single_super_admin
  ON profiles ((role))
  WHERE role = 'super_admin';

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_settings_establishment_id
  ON store_settings(establishment_id);

ALTER TABLE products
  ADD CONSTRAINT products_id_establishment_id_key UNIQUE (id, establishment_id);

ALTER TABLE clients
  ADD CONSTRAINT clients_id_establishment_id_key UNIQUE (id, establishment_id);

ALTER TABLE sales
  ADD CONSTRAINT sales_id_establishment_id_key UNIQUE (id, establishment_id);

ALTER TABLE sales
  ADD CONSTRAINT sales_client_tenant_fkey
  FOREIGN KEY (client_id, establishment_id) REFERENCES clients(id, establishment_id);

ALTER TABLE sale_items
  ADD CONSTRAINT sale_items_sale_tenant_fkey
  FOREIGN KEY (sale_id, establishment_id) REFERENCES sales(id, establishment_id) ON DELETE CASCADE;

ALTER TABLE sale_items
  ADD CONSTRAINT sale_items_product_tenant_fkey
  FOREIGN KEY (product_id, establishment_id) REFERENCES products(id, establishment_id);

CREATE INDEX IF NOT EXISTS idx_establishments_active ON establishments(active);
CREATE INDEX IF NOT EXISTS idx_profiles_establishment_id ON profiles(establishment_id);
CREATE INDEX IF NOT EXISTS idx_products_establishment_id ON products(establishment_id);
CREATE INDEX IF NOT EXISTS idx_clients_establishment_id ON clients(establishment_id);
CREATE INDEX IF NOT EXISTS idx_sales_establishment_id ON sales(establishment_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_establishment_id ON sale_items(establishment_id);

-- ------------------------------------------------------------
-- 3. Helpers RLS
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE id = (SELECT auth.uid())),
    'employee'
  );
$$;

CREATE OR REPLACE FUNCTION current_establishment_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT establishment_id
  FROM profiles
  WHERE id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_role() = 'super_admin';
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_role() IN ('super_admin', 'admin');
$$;

CREATE OR REPLACE FUNCTION can_access_establishment(p_establishment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT auth.uid()) IS NOT NULL
    AND (
      is_super_admin()
      OR p_establishment_id = current_establishment_id()
    );
$$;

CREATE OR REPLACE FUNCTION is_establishment_admin_for(p_establishment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    is_super_admin()
    OR (
      get_user_role() = 'admin'
      AND p_establishment_id = current_establishment_id()
    );
$$;

-- ------------------------------------------------------------
-- 4. Trigger para popular tenant em inserts comuns
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_set_current_establishment_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_establishment_id uuid;
BEGIN
  IF NEW.establishment_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_establishment_id := current_establishment_id();

  IF v_establishment_id IS NULL THEN
    RAISE EXCEPTION 'Selecione um estabelecimento antes de criar este registro';
  END IF;

  NEW.establishment_id := v_establishment_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_set_establishment ON products;
CREATE TRIGGER trg_products_set_establishment
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_current_establishment_id();

DROP TRIGGER IF EXISTS trg_clients_set_establishment ON clients;
CREATE TRIGGER trg_clients_set_establishment
  BEFORE INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_current_establishment_id();

-- ------------------------------------------------------------
-- 5. RLS policies tenant-aware
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "establishments_select" ON establishments;
DROP POLICY IF EXISTS "establishments_insert" ON establishments;
DROP POLICY IF EXISTS "establishments_update" ON establishments;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "sales_select" ON sales;
DROP POLICY IF EXISTS "sales_insert" ON sales;
DROP POLICY IF EXISTS "sales_deny_insert" ON sales;
DROP POLICY IF EXISTS "sale_items_select" ON sale_items;
DROP POLICY IF EXISTS "sale_items_insert" ON sale_items;
DROP POLICY IF EXISTS "sale_items_deny_insert" ON sale_items;
DROP POLICY IF EXISTS "store_settings_select" ON store_settings;
DROP POLICY IF EXISTS "store_settings_insert" ON store_settings;
DROP POLICY IF EXISTS "store_settings_update" ON store_settings;

CREATE POLICY "establishments_select" ON establishments
  FOR SELECT USING (
    is_super_admin()
    OR id = current_establishment_id()
  );

CREATE POLICY "establishments_insert" ON establishments
  FOR INSERT WITH CHECK (is_super_admin());

CREATE POLICY "establishments_update" ON establishments
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    requesting_user_id() = id
    OR is_super_admin()
    OR (
      get_user_role() = 'admin'
      AND establishment_id = current_establishment_id()
    )
  );

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE
  USING (
    is_super_admin()
    OR (
      get_user_role() = 'admin'
      AND establishment_id = current_establishment_id()
      AND role <> 'super_admin'
    )
  )
  WITH CHECK (
    is_super_admin()
    OR (
      get_user_role() = 'admin'
      AND establishment_id = current_establishment_id()
      AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "products_select" ON products
  FOR SELECT USING (can_access_establishment(establishment_id));

CREATE POLICY "products_insert" ON products
  FOR INSERT WITH CHECK (can_access_establishment(establishment_id));

CREATE POLICY "products_update" ON products
  FOR UPDATE
  USING (can_access_establishment(establishment_id))
  WITH CHECK (can_access_establishment(establishment_id));

CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (can_access_establishment(establishment_id));

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (can_access_establishment(establishment_id));

CREATE POLICY "clients_update" ON clients
  FOR UPDATE
  USING (can_access_establishment(establishment_id))
  WITH CHECK (can_access_establishment(establishment_id));

CREATE POLICY "sales_select" ON sales
  FOR SELECT USING (can_access_establishment(establishment_id));

CREATE POLICY "sales_deny_insert" ON sales
  FOR INSERT WITH CHECK (false);

CREATE POLICY "sale_items_select" ON sale_items
  FOR SELECT USING (can_access_establishment(establishment_id));

CREATE POLICY "sale_items_deny_insert" ON sale_items
  FOR INSERT WITH CHECK (false);

CREATE POLICY "store_settings_select" ON store_settings
  FOR SELECT USING (can_access_establishment(establishment_id));

CREATE POLICY "store_settings_insert" ON store_settings
  FOR INSERT WITH CHECK (is_super_admin());

CREATE POLICY "store_settings_update" ON store_settings
  FOR UPDATE
  USING (is_establishment_admin_for(establishment_id))
  WITH CHECK (is_establishment_admin_for(establishment_id));

-- ------------------------------------------------------------
-- 6. Auth Hook e novo usuario
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  user_role text;
  user_establishment_id uuid;
BEGIN
  claims := event -> 'claims';

  SELECT role, establishment_id
  INTO user_role, user_establishment_id
  FROM public.profiles
  WHERE id = (claims ->> 'sub')::uuid;

  claims := jsonb_set(
    claims,
    '{app_metadata,role}',
    to_jsonb(COALESCE(user_role, 'employee'))
  );

  claims := jsonb_set(
    claims,
    '{app_metadata,establishment_id}',
    COALESCE(to_jsonb(user_establishment_id), 'null'::jsonb)
  );

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
  _establishment_id uuid;
BEGIN
  _role := NEW.raw_user_meta_data ->> 'role';

  IF _role IS NULL OR _role NOT IN ('admin', 'employee') THEN
    _role := 'employee';
  END IF;

  _establishment_id := NULLIF(NEW.raw_user_meta_data ->> 'establishment_id', '')::uuid;

  IF _establishment_id IS NULL THEN
    SELECT id INTO _establishment_id
    FROM establishments
    WHERE active = true
    ORDER BY created_at
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, full_name, role, establishment_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    _role,
    _establishment_id
  );
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- 7. View products_display com filtro tenant explícito
-- ------------------------------------------------------------

REVOKE SELECT ON products FROM authenticated;

GRANT SELECT (id, name, category, price, stock, active, establishment_id, created_by, created_at, updated_at)
  ON products TO authenticated;

DROP VIEW IF EXISTS products_display;

CREATE OR REPLACE VIEW products_display AS
SELECT
  id,
  name,
  category,
  price,
  stock,
  active,
  establishment_id,
  created_by,
  created_at,
  updated_at,
  CASE
    WHEN get_user_role() IN ('super_admin', 'admin') THEN cost
    ELSE NULL
  END AS cost
FROM products
WHERE can_access_establishment(establishment_id);

GRANT SELECT ON products_display TO authenticated;
REVOKE ALL ON public.products_display FROM anon;

-- ------------------------------------------------------------
-- 8. Trigger de estoque e RPCs tenant-aware
-- ------------------------------------------------------------

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

CREATE OR REPLACE FUNCTION soft_delete_product(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_establishment_id uuid;
BEGIN
  SELECT establishment_id INTO v_establishment_id
  FROM products
  WHERE id = p_product_id;

  IF v_establishment_id IS NULL OR NOT is_establishment_admin_for(v_establishment_id) THEN
    RAISE EXCEPTION 'Apenas admin pode excluir produtos';
  END IF;

  UPDATE products
  SET active = false, updated_at = now()
  WHERE id = p_product_id
    AND establishment_id = v_establishment_id;
END;
$$;

CREATE OR REPLACE FUNCTION soft_delete_client(p_client_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_establishment_id uuid;
BEGIN
  SELECT establishment_id INTO v_establishment_id
  FROM clients
  WHERE id = p_client_id;

  IF v_establishment_id IS NULL OR NOT is_establishment_admin_for(v_establishment_id) THEN
    RAISE EXCEPTION 'Apenas admin pode excluir clientes';
  END IF;

  UPDATE clients
  SET active = false, updated_at = now()
  WHERE id = p_client_id
    AND establishment_id = v_establishment_id;
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

-- ------------------------------------------------------------
-- 9. Grants e bloqueio anon
-- ------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE ON establishments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT INSERT, UPDATE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON clients TO authenticated;
GRANT SELECT ON sales TO authenticated;
GRANT SELECT ON sale_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON store_settings TO authenticated;

REVOKE EXECUTE ON FUNCTION create_establishment(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_establishment(text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION create_sale(uuid, text, jsonb, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_sale(uuid, text, jsonb, uuid) TO authenticated;

REVOKE ALL ON public.establishments FROM anon;
REVOKE ALL ON public.products_display FROM anon;
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.sales FROM anon;
REVOKE ALL ON public.sale_items FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.store_settings FROM anon;
