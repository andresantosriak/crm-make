-- ============================================================
-- CRM Studio Belle — Fase 2: Migration Completa
-- ============================================================
-- Ordem:
--   1. Function generica (fn_update_timestamp)
--   2. Helper functions (requesting_user_id, get_user_role, is_admin)
--   3. Tabelas + RLS + indices + triggers updated_at
--   4. Auth Hook (custom_access_token_hook) + grants
--   5. Trigger handle_new_user
--   6. View products_display
--   7. RPCs (create_sale, soft_delete_product, soft_delete_client, cancel_sale)
--   8. Trigger de validacao e decremento de estoque
-- ============================================================


-- ============================================================
-- 1. FUNCTION GENERICA
-- ============================================================

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ============================================================
-- 2. HELPER FUNCTIONS PARA RLS
-- ============================================================

CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role'),
    'employee'
  );
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_role() = 'admin';
$$;


-- ============================================================
-- 3. TABELAS + RLS + INDICES + TRIGGERS
-- ============================================================


-- -------------------------------------------------------
-- 3.1 profiles
-- -------------------------------------------------------

CREATE TABLE profiles (
  id         uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name  text NOT NULL,
  role       text NOT NULL DEFAULT 'employee'
               CHECK (role IN ('admin', 'employee')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    requesting_user_id() = id OR is_admin()
  );

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX idx_profiles_role ON profiles(role);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();


-- -------------------------------------------------------
-- 3.2 products
-- -------------------------------------------------------

CREATE TABLE products (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  category   text NOT NULL
               CHECK (category IN ('Lábios', 'Rosto', 'Olhos')),
  price      numeric(10,2) NOT NULL CHECK (price >= 0),
  cost       numeric(10,2) NOT NULL CHECK (cost >= 0),
  stock      integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active     boolean NOT NULL DEFAULT true,
  created_by uuid DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON products
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "products_insert" ON products
  FOR INSERT WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "products_update" ON products
  FOR UPDATE
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_created_by ON products(created_by);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();


-- -------------------------------------------------------
-- 3.3 clients
-- -------------------------------------------------------

CREATE TABLE clients (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  phone      text,
  birthday   date,
  active     boolean NOT NULL DEFAULT true,
  created_by uuid DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "clients_update" ON clients
  FOR UPDATE
  USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_birthday ON clients(birthday);
CREATE INDEX idx_clients_active ON clients(active);
CREATE INDEX idx_clients_created_by ON clients(created_by);

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();


-- -------------------------------------------------------
-- 3.4 sales
-- -------------------------------------------------------

CREATE TABLE sales (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid REFERENCES clients(id),
  payment_method  text NOT NULL
                    CHECK (payment_method IN ('Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro')),
  total           numeric(10,2) NOT NULL CHECK (total > 0),
  items_count     integer NOT NULL CHECK (items_count > 0),
  created_by      uuid DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  refunded_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sales_select" ON sales
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "sales_insert" ON sales
  FOR INSERT WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_sales_created_by ON sales(created_by);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_sales_refunded_at ON sales(refunded_at);


-- -------------------------------------------------------
-- 3.5 sale_items
-- -------------------------------------------------------

CREATE TABLE sale_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id     uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id),
  quantity    integer NOT NULL CHECK (quantity > 0),
  unit_price  numeric(10,2) NOT NULL CHECK (unit_price > 0),
  subtotal    numeric(10,2) NOT NULL CHECK (subtotal > 0)
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sale_items_select" ON sale_items
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "sale_items_insert" ON sale_items
  FOR INSERT WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);


-- -------------------------------------------------------
-- 3.6 store_settings
-- -------------------------------------------------------

CREATE TABLE store_settings (
  id                   integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_markup       integer NOT NULL DEFAULT 180
                         CHECK (default_markup BETWEEN 0 AND 500),
  low_stock_threshold  integer NOT NULL DEFAULT 5
                         CHECK (low_stock_threshold >= 0),
  vip_threshold        numeric(10,2) NOT NULL DEFAULT 500.00,
  birthday_alert_days  integer NOT NULL DEFAULT 7
                         CHECK (birthday_alert_days >= 0),
  toggle_promos        boolean NOT NULL DEFAULT true,
  toggle_estoque       boolean NOT NULL DEFAULT true,
  toggle_aniversario   boolean NOT NULL DEFAULT true,
  toggle_resumo        boolean NOT NULL DEFAULT false,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_settings_select" ON store_settings
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "store_settings_update" ON store_settings
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER trg_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();


-- ============================================================
-- 4. AUTH HOOK — custom_access_token_hook
-- ============================================================

CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims    jsonb;
  user_role text;
BEGIN
  claims := event -> 'claims';

  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (claims ->> 'sub')::uuid;

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{app_metadata,role}', '"employee"');
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION custom_access_token_hook TO supabase_auth_admin;


-- ============================================================
-- 5. TRIGGER — handle_new_user
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
BEGIN
  _role := NEW.raw_user_meta_data ->> 'role';

  IF _role IS NULL OR _role NOT IN ('admin', 'employee') THEN
    _role := 'employee';
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    _role
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 6. VIEW — products_display
-- ============================================================

CREATE OR REPLACE VIEW products_display
WITH (security_invoker = true)
AS
SELECT
  id,
  name,
  category,
  price,
  stock,
  active,
  created_by,
  created_at,
  updated_at,
  CASE
    WHEN get_user_role() = 'admin' THEN cost
    ELSE NULL
  END AS cost
FROM products;


-- ============================================================
-- 7. TRIGGER — Validacao e decremento de estoque
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
  FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Produto nao encontrado: %', NEW.product_id;
  END IF;

  IF current_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Estoque insuficiente para o produto %. Disponivel: %, solicitado: %',
      NEW.product_id, current_stock, NEW.quantity;
  END IF;

  UPDATE products
  SET stock = stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sale_items_before_insert_stock
  BEFORE INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION fn_validate_and_decrement_stock();


-- ============================================================
-- 8. RPCs
-- ============================================================


-- -------------------------------------------------------
-- 8.1 create_sale
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION create_sale(
  p_client_id      uuid DEFAULT NULL,
  p_payment_method text DEFAULT 'Dinheiro',
  p_items          jsonb DEFAULT '[]'
)
RETURNS uuid
LANGUAGE plpgsql
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


-- -------------------------------------------------------
-- 8.2 soft_delete_product
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION soft_delete_product(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas admin pode excluir produtos';
  END IF;

  UPDATE products
  SET active = false, updated_at = now()
  WHERE id = p_product_id;
END;
$$;


-- -------------------------------------------------------
-- 8.3 soft_delete_client
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION soft_delete_client(p_client_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas admin pode excluir clientes';
  END IF;

  UPDATE clients
  SET active = false, updated_at = now()
  WHERE id = p_client_id;
END;
$$;


-- -------------------------------------------------------
-- 8.4 cancel_sale
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION cancel_sale(p_sale_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas admin pode estornar vendas';
  END IF;

  IF EXISTS (SELECT 1 FROM sales WHERE id = p_sale_id AND refunded_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Venda ja estornada';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM sales WHERE id = p_sale_id) THEN
    RAISE EXCEPTION 'Venda nao encontrada';
  END IF;

  UPDATE sales SET refunded_at = now() WHERE id = p_sale_id;

  UPDATE products p
  SET stock = p.stock + si.quantity,
      updated_at = now()
  FROM sale_items si
  WHERE si.sale_id = p_sale_id
    AND si.product_id = p.id;
END;
$$;
