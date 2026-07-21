# Test Map — Fase 2 / Sprint 1 (Infra Supabase) — CRM Studio Belle

> Sprint de infraestrutura backend — **sem mudanca de UI**. Cobre migration (6 tabelas + RLS + indices + triggers + Auth Hook + view + RPCs), seeds, client Supabase, TanStack Query provider e tipos TS.
> Foco: schema aplicado corretamente, seeds populados, permissoes/RLS por role, e integracao backend (client conecta, envs, tipos casam com schema).
> Base: `docs/crm-belle-data-architecture.md` (DDL), `docs/crm-belle-security-review.md`, `docs/crm-belle-backlog-fase2.md`, migration `supabase/migrations/20260720220234_crm_belle_fase2_schema.sql`.

**Gerado em:** 2026-07-20

## Como testar os itens [AUTO]

Tres caminhos, indicados por item:
- **`[AUTO:mgmt]`** — query SQL de verificacao de schema via Supabase Management API ou SQL Editor (`information_schema`, `pg_policies`, `pg_indexes`, `pg_trigger`). Ideal para CI com service key.
- **`[AUTO:integ-anon]`** — teste de integracao com a **anon key** (sem sessao) validando bloqueio de acesso.
- **`[AUTO:integ-auth]`** — teste de integracao autenticado (sessao employee OU admin) validando comportamento por role. Requer 2 usuarios de teste (1 admin, 1 employee) em `docs/credentials.md`.
- **`[AUTO:vitest]`** — teste unitario com client mockado (ex.: guarda de env no `client.ts`).

---

## 1. Schema — Tabelas e colunas

### Happy path
- [ ] **[AUTO:mgmt]** Existem exatamente 6 tabelas em `public`: profiles, products, clients, sales, sale_items, store_settings (`SELECT tablename FROM pg_tables WHERE schemaname='public'`)
- [ ] **[AUTO:mgmt]** `products` tem colunas: id, name, category, price, cost, stock, active, created_by, created_at, updated_at
- [ ] **[AUTO:mgmt]** `sales` tem client_id (nullable), payment_method, total, items_count, created_by, refunded_at, created_at
- [ ] **[AUTO:mgmt]** `sale_items` tem sale_id (FK CASCADE), product_id, quantity, unit_price, subtotal
- [ ] **[AUTO:mgmt]** `store_settings` e singleton: PK id com `CHECK (id = 1)`
- [ ] **[AUTO:mgmt]** RLS habilitado nas 6 tabelas (`SELECT relname, relrowsecurity FROM pg_class WHERE relname IN (...)` → todos true)

### CHECK constraints
- [ ] **[AUTO:mgmt]** `products.category` CHECK IN ('Lábios', 'Rosto', 'Olhos') — **com acento**
- [ ] **[AUTO:mgmt]** `sales.payment_method` CHECK IN ('Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro') — **com acento**
- [ ] **[AUTO:mgmt]** `profiles.role` CHECK IN ('admin', 'employee'), default 'employee'
- [ ] **[AUTO:mgmt]** price/cost >= 0, stock >= 0, total > 0, items_count > 0, quantity/unit_price/subtotal > 0
- [ ] **[AUTO:mgmt]** `store_settings.default_markup` CHECK BETWEEN 0 AND 500

### Edge cases (constraints rejeitam invalidos)
- [ ] **[AUTO:integ-auth]** INSERT product com category 'Cabelo' (fora do CHECK) → erro 23514
- [ ] **[AUTO:integ-auth]** INSERT product com price negativo → erro
- [ ] **[AUTO:integ-auth]** INSERT sale com total 0 → erro (CHECK total > 0)
- [ ] **[AUTO:integ-auth]** INSERT segundo store_settings (id=2) → erro (CHECK id=1)

---

## 2. Indices

- [ ] **[AUTO:mgmt]** Indices de products existem: idx_products_category, idx_products_active, idx_products_stock, idx_products_created_by (`SELECT indexname FROM pg_indexes WHERE tablename='products'`)
- [ ] **[AUTO:mgmt]** Indices de clients: idx_clients_name, idx_clients_birthday, idx_clients_active, idx_clients_created_by
- [ ] **[AUTO:mgmt]** Indices de sales: idx_sales_client_id, idx_sales_created_by, idx_sales_created_at, idx_sales_payment_method, idx_sales_refunded_at
- [ ] **[AUTO:mgmt]** Indices de sale_items: idx_sale_items_sale_id, idx_sale_items_product_id
- [ ] **[AUTO:mgmt]** idx_profiles_role em profiles
- [ ] **[AUTO:mgmt]** Toda coluna usada em policy (id em profiles, role via JWT) tem cobertura de indice

---

## 3. Triggers e Functions

- [ ] **[AUTO:mgmt]** Function `fn_update_timestamp` existe; triggers trg_*_updated_at em profiles, products, clients, store_settings (`SELECT tgname FROM pg_trigger`)
- [ ] **[AUTO:mgmt]** Trigger `on_auth_user_created` AFTER INSERT em auth.users → `handle_new_user`
- [ ] **[AUTO:mgmt]** Trigger `trg_sale_items_before_insert_stock` BEFORE INSERT em sale_items
- [ ] **[AUTO:mgmt]** Functions helper existem: requesting_user_id, get_user_role, is_admin, custom_access_token_hook
- [ ] **[AUTO:mgmt]** RPCs existem: create_sale, soft_delete_product, soft_delete_client, cancel_sale
- [ ] **[AUTO:mgmt]** Functions SECURITY DEFINER tem `SET search_path = public` (anti search_path injection): get_user_role, is_admin, custom_access_token_hook, handle_new_user, fn_validate_and_decrement_stock, soft_delete_product, soft_delete_client, cancel_sale

### updated_at automatico
- [ ] **[AUTO:integ-auth]** UPDATE em product → `updated_at` muda para now() (trigger fn_update_timestamp)

### Trigger de estoque (decremento atomico)
- [ ] **[AUTO:integ-auth]** Via `create_sale` com item quantity 2 de produto com stock 24 → stock vira 22
- [ ] **[AUTO:integ-auth]** `create_sale` com quantity > stock disponivel → EXCEPTION 'Estoque insuficiente', venda NAO criada (rollback)
- [ ] **[AUTO:integ-auth]** `create_sale` com product_id inexistente → EXCEPTION 'Produto nao encontrado'
- [ ] **[MANUAL]** Race condition: 2 vendas simultaneas do mesmo produto respeitam FOR UPDATE lock (nao vende alem do estoque)

### handle_new_user (defense in depth)
- [ ] **[AUTO:integ-auth]** Criar user via Auth admin com metadata role 'admin' → profile criado com role 'admin'
- [ ] **[AUTO:integ-auth]** Criar user com role invalido ('superuser') → profile com role 'employee' (fallback whitelist)
- [ ] **[AUTO:integ-auth]** Criar user sem role no metadata → profile com role 'employee'

---

## 4. RPCs (comportamento)

### create_sale
- [ ] **[AUTO:integ-auth]** create_sale calcula `total` e `items_count` server-side a partir dos itens (nao confia no client)
- [ ] **[AUTO:integ-auth]** create_sale insere sale + N sale_items atomicamente; retorna uuid da sale
- [ ] **[AUTO:integ-auth]** create_sale com p_items vazio → EXCEPTION 'A venda deve conter pelo menos um item'
- [ ] **[AUTO:integ-auth]** create_sale com quantity ou unit_price <= 0 → EXCEPTION 'Quantidade e preco devem ser positivos'
- [ ] **[AUTO:integ-auth]** create_sale com client_id NULL → venda avulsa criada (Consumidor final)

### soft delete / cancel (admin only — ver secao Permissoes)
- [ ] **[AUTO:integ-auth]** soft_delete_product (admin) → product.active vira false, linha permanece
- [ ] **[AUTO:integ-auth]** cancel_sale (admin) → refunded_at setado + estoque restaurado (stock += quantity de cada item)
- [ ] **[AUTO:integ-auth]** cancel_sale de venda ja estornada → EXCEPTION 'Venda ja estornada'
- [ ] **[AUTO:integ-auth]** cancel_sale de venda inexistente → EXCEPTION 'Venda nao encontrada'

---

## 5. Seeds (numeros concretos)

- [ ] **[AUTO:mgmt]** `SELECT count(*) FROM products` = **10**
- [ ] **[AUTO:mgmt]** `SELECT count(*) FROM clients` = **5**
- [ ] **[AUTO:mgmt]** `SELECT count(*) FROM sales` = **6**
- [ ] **[AUTO:mgmt]** `SELECT count(*) FROM sale_items` = **13** (venda 1:3 + 2:2 + 3:1 + 4:2 + 5:4 + 6:1)
- [ ] **[AUTO:mgmt]** `SELECT count(*) FROM store_settings` = **1** (id=1, default_markup 180, low_stock_threshold 5, vip_threshold 500, toggle_resumo false)
- [ ] **[AUTO:mgmt]** 4 sales com `created_at::date = '2026-07-20'` (Hoje), soma total = **420.60**; 2 sales em '2026-07-19' (Ontem)
- [ ] **[AUTO:mgmt]** 1 sale com `client_id IS NULL` (venda 6, Consumidor final)
- [ ] **[AUTO:mgmt]** Produtos com stock <= 5: exatamente 2 (Máscara Volume Extremo 3, Blush Pêssego 2)
- [ ] **[AUTO:mgmt]** Mariana Alves com birthday 1992-07-23 (dentro de birthday_alert_days a partir de 2026-07-20 → dispara tag ANIVERSARIO)
- [ ] **[AUTO:mgmt]** Nomes dos produtos com acento correto no banco: 'Máscara Volume Extremo', 'Pó Compacto Matte HD', 'Blush Pêssego', 'Iluminador Ouro Rosé'
- [ ] **[AUTO:mgmt]** Subtotais de sale_items coerentes: `subtotal = quantity * unit_price` em todas as 13 linhas
- [ ] **[MANUAL]** Admin inicial criado via seed script (NAO via SQL com senha hardcoded); `ADMIN_INITIAL_PASSWORD` removido do .env pos-seed

---

## 6. NOVA SEÇÃO — Permissoes / RLS

> Enforcement 100% server-side. Testar com 3 contextos: **anon** (sem sessao), **employee**, **admin**.

### 6.1 Anon (sem autenticacao) — bloqueio total
- [ ] **[AUTO:integ-anon]** SELECT em products com anon key → **0 linhas** (policy exige `requesting_user_id() IS NOT NULL`)
- [ ] **[AUTO:integ-anon]** SELECT em clients, sales, sale_items, store_settings com anon → 0 linhas
- [ ] **[AUTO:integ-anon]** SELECT em profiles com anon → 0 linhas
- [ ] **[AUTO:integ-anon]** INSERT em products com anon → erro RLS (violates row-level security)
- [ ] **[AUTO:integ-anon]** RPC create_sale com anon → falha (auth.uid() NULL, RLS bloqueia insert)
- [ ] **[AUTO:integ-anon]** SELECT em products_display com anon → 0 linhas (view herda RLS via security_invoker)

### 6.2 Employee — acesso operacional, sem privilegios admin
- [ ] **[AUTO:integ-auth]** Employee SELECT products/clients/sales/sale_items/store_settings → ve todas as linhas (dados compartilhados)
- [ ] **[AUTO:integ-auth]** Employee INSERT product/client → permitido
- [ ] **[AUTO:integ-auth]** Employee UPDATE product (ex.: stock) → permitido
- [ ] **[AUTO:integ-auth]** Employee INSERT direto em sales → permitido (mas fluxo real usa create_sale)
- [ ] **[AUTO:integ-auth]** Employee UPDATE em sales → **negado** (sem UPDATE policy, imutavel)
- [ ] **[AUTO:integ-auth]** Employee UPDATE em store_settings → **negado** (policy exige is_admin())
- [ ] **[AUTO:integ-auth]** Employee UPDATE em outro profile → **negado** (policy exige is_admin())
- [ ] **[AUTO:integ-auth]** Employee SELECT em profiles → ve **apenas o proprio** (policy `requesting_user_id() = id OR is_admin()`)
- [ ] **[AUTO:integ-auth]** Employee chama soft_delete_product → EXCEPTION 'Apenas admin pode excluir produtos'
- [ ] **[AUTO:integ-auth]** Employee chama soft_delete_client → EXCEPTION 'Apenas admin pode excluir clientes'
- [ ] **[AUTO:integ-auth]** Employee chama cancel_sale → EXCEPTION 'Apenas admin pode estornar vendas'

### 6.3 Admin — acesso total
- [ ] **[AUTO:integ-auth]** Admin SELECT em profiles → ve **todos** os profiles
- [ ] **[AUTO:integ-auth]** Admin UPDATE store_settings (ex.: default_markup 180→200) → permitido
- [ ] **[AUTO:integ-auth]** Admin UPDATE outro profile → permitido
- [ ] **[AUTO:integ-auth]** Admin executa soft_delete_product / soft_delete_client / cancel_sale → sucesso

### 6.4 view products_display — protecao do custo (confidencial)
- [ ] **[AUTO:integ-auth]** Admin SELECT products_display → coluna `cost` retorna valor real (ex.: Batom cost 14.00)
- [ ] **[AUTO:integ-auth]** Employee SELECT products_display → coluna `cost` retorna **NULL** para todas as linhas (CASE get_user_role())
- [ ] **[AUTO:integ-auth]** products_display expoe as demais colunas normalmente (id, name, category, price, stock, active) para ambos os roles
- [ ] **[MANUAL]** Verificar que a UI da fase 3 lera products_display (nao products direto) para respeitar o mascaramento — pendencia de integracao futura, registrar

### 6.5 Auth Hook e signup (ativacao manual)
- [ ] **[MANUAL]** Auth Hook `custom_access_token_hook` ATIVADO no Dashboard (Authentication > Hooks > Customize Access Token) — sem isso, `app_metadata.role` fica vazio e is_admin() sempre false
- [ ] **[AUTO:integ-auth]** Apos login de admin, JWT decodificado contem `app_metadata.role = 'admin'`
- [ ] **[MANUAL]** Signup publico DESABILITADO (Authentication > Providers > Email > Enable Sign Up = OFF) — usuarios so via Edge Function/admin
- [ ] **[AUTO:mgmt]** Grants presentes: supabase_auth_admin tem USAGE em schema public, SELECT em profiles, EXECUTE em custom_access_token_hook

---

## 7. NOVA SEÇÃO — Integracao Backend (client + envs + tipos)

### 7.1 Client Supabase
- [ ] **[AUTO:vitest]** `client.ts` lanca erro se `VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY` ausentes (guarda explicito)
- [ ] **[AUTO:vitest]** Com envs mockadas, `supabase` e instancia valida de createClient
- [ ] **[AUTO:integ-anon]** Client conecta ao projeto remoto e responde (ex.: `supabase.from('products').select('count')` retorna sem erro de rede, respeitando RLS)

### 7.2 Variaveis de ambiente
- [ ] **[AUTO:mgmt]** `.env.example` documenta VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (frontend) e SUPABASE_SECRET_KEY sem prefixo VITE_ (backend)
- [ ] **[VISUAL]** Nenhuma chave secreta (`SUPABASE_SECRET_KEY`, service role) com prefixo `VITE_` — nao vaza para o bundle
- [ ] **[MANUAL]** `.env.local` (real, git-ignored) preenchido; `.env*` no `.gitignore`
- [ ] **[AUTO:mgmt]** `git check-ignore .env .env.local` retorna os arquivos (nao commitados)

### 7.3 Tipos TS casam com schema
- [ ] **[AUTO:vitest]** `src/integrations/supabase/types.ts` (gen types) tem Tables: profiles, products, clients, sales, sale_items, store_settings
- [ ] **[AUTO:vitest]** Tipo de `products.category` e `'Lábios' | 'Rosto' | 'Olhos'` (com acento, casa com CHECK)
- [ ] **[AUTO:vitest]** `PaymentMethod` = 'Pix' | 'Cartão de crédito' | 'Cartão de débito' | 'Dinheiro' (com acento)
- [ ] **[AUTO:vitest]** `DbProductDisplay.cost` e `number | null` (reflete mascaramento da view); `DbProduct.cost` e `number`
- [ ] **[AUTO:vitest]** `DbSale.client_id` e `refunded_at` sao `string | null`; `created_by` `string | null`
- [ ] **[AUTO:vitest]** `npm run build` compila sem erro de tipo com os novos tipos

### 7.4 TanStack Query provider
- [ ] **[AUTO:vitest]** `main.tsx` envolve App com QueryClientProvider; QueryCache configurado (onError para toast)
- [ ] **[MANUAL]** `npm run dev` inicia sem erro; app carrega (ainda com dados mock — integracao de leitura vem na proxima sprint da fase 2)

---

## Resumo de cobertura

| Secao | AUTO | VISUAL/MANUAL |
|-------|------|---------------|
| Schema/constraints | 14 | 0 |
| Indices | 6 | 0 |
| Triggers/functions | 13 | 1 |
| RPCs | 9 | 0 |
| Seeds | 11 | 1 |
| Permissoes/RLS | 24 | 4 |
| Integracao backend | 12 | 4 |

**Prioridade QA:** rodar primeiro os `[AUTO:integ-anon]` (bloqueio de anon — critico de seguranca) e `[AUTO:integ-auth]` de RLS por role (matriz employee vs admin + mascaramento de cost). Depois seeds via `[AUTO:mgmt]` e guardas de env via `[AUTO:vitest]`. Setup necessario: 2 usuarios de teste (admin + employee) em `docs/credentials.md` e o Auth Hook ativado.

## Notas para Data Architect / Code Reviewer
1. **DIVERGENCIA CRITICA DE INTEGRACAO — acentos:** O schema usa categorias **com acento** ('Lábios') e pagamentos **com acento** ('Cartão de crédito', 'Cartão de débito'), e os tipos gen refletem isso. Mas o **frontend da Fase 1** usa **sem acento**: `constants.ts` PAYMENT_METHODS = ['Cartao de credito', 'Cartao de debito'], `CATEGORY_TILES` com chave 'Labios', mock `products.ts`/`sales.ts` sem acento, e `shortPayment()` compara 'Cartao de credito'. Quando a UI integrar (proxima sprint), INSERT/SELECT vao **violar o CHECK** e o mapeamento de tiles/abreviacao vai falhar. Precisa alinhar: ou normalizar o frontend para acento, ou criar camada de mapeamento. **Bloqueante para a integracao.**
2. **products_display vs products na UI:** a protecao de `cost` so funciona se a UI ler a **view** products_display, nao a tabela products (onde employee ve cost via SELECT policy liberado). Registrar como requisito da sprint de integracao.
3. **Dependencias de ativacao manual:** Auth Hook e desabilitar signup NAO sao verificaveis por migration — exigem passos no Dashboard. Sem o Auth Hook, `is_admin()` sempre retorna false e nenhum admin consegue usar RPCs admin-only. Item de release checklist.
4. **total_spent por cliente diverge do mock fase 1:** derivado das 6 vendas reais (Patricia = 189.70, nao 512.00). Esperado, mas a UI da fase 1 exibe valores hardcoded — a tela de Clientes precisara passar a calcular. Registrar para a sprint de integracao.
