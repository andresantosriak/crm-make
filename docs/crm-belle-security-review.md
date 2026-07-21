# Security Review: CRM Studio Belle — Fase 2

**Status:** Planejamento (Security Review pre-Data Architect)
**Data:** 2026-07-20
**Escopo:** Auth multi-usuario, key handling, RLS por tabela, Edge Function create-user
**Referencia:** `docs/crm-belle-prd-fase2.md`, `docs/crm-belle-architecture.md`, `docs/decisions.md`

---

## 1. Classificacao de Dados

| Classificacao | Dados | Tratamento obrigatorio |
|---------------|-------|------------------------|
| Publico | Nome de produto, preco de venda, categoria, estoque, nome da loja | Nenhum tratamento especial |
| Interno | Nome/telefone/aniversario de cliente, email/nome do usuario, historico de vendas | Acesso autenticado, RLS por tabela |
| Confidencial | Custo de produto (margem de lucro), role do usuario, JWT/sessao | RLS + acesso condicional por role, nunca logar |
| Restrito | `SUPABASE_SECRET_KEY`, `SUPABASE_ACCESS_TOKEN`, `ADMIN_INITIAL_PASSWORD` | Apenas server-side (Edge Functions, scripts de seed), variaveis de ambiente, nunca no client, nunca em codigo commitado |

---

## 2. Threat Modeling (STRIDE)

Contexto de risco: salao de pequeno porte, single-tenant, equipe de 2-5 pessoas, sem dados regulados (PCI/HIPAA/LGPD-sensivel). Superficie de ataque reduzida.

| Ameaca | Cenario neste projeto | Mitigacao requerida |
|--------|-----------------------|---------------------|
| **Spoofing** | Funcionario se passar por admin para criar usuarios ou ver custos | Supabase Auth (JWT assinado), role no JWT via Auth Hook, RLS valida role server-side |
| **Tampering** | Manipular preco ou estoque via DevTools/API direta | RLS + CHECK constraints no banco, snapshot de preco na venda (`unit_price`), validacao de estoque server-side |
| **Repudiation** | "Nao fui eu que fiz essa venda" | `created_by` em sales/products/clients com FK para profiles, `created_at` com timezone |
| **Info Disclosure** | Funcionario ver custo/margem consultando a API diretamente (bypassando UI) | View `products_display` com coluna cost condicional; RLS em profiles limita acesso |
| **DoS** | Spam no login ou no endpoint create-user | Rate limiting nativo do Supabase Auth; rate limiting na Edge Function |
| **Elevation of Privilege** | Funcionario alterar proprio role para admin via UPDATE direto | RLS bloqueia UPDATE em profiles para nao-admin; role injetado no JWT por Auth Hook (nao manipulavel) |

---

## 3. Auth Flow — Requisitos de Implementacao

### 3.1 Modelo de roles

**Decisao: `profiles.role` como fonte de verdade + Auth Hook para injetar role no JWT.**

Justificativa:
- Alinhado com regra global (`CLAUDE.md`): "Roles/tenant em `app_metadata` via Auth Hooks"
- Role no JWT elimina subquery em policies RLS (performance)
- JWT assinado server-side (nao manipulavel pelo client)
- `profiles.role` permanece editavel pelo admin; mudanca reflete no proximo token refresh
- Dois roles fixos: `admin` e `employee` (sem RBAC dinamico — adequado para salao de pequeno porte)

### 3.2 Auth Hook — custom_access_token_hook

O Data Architect deve criar esta function na migration:

```sql
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
```

**Ativacao manual obrigatoria** (nao automatizavel via migration): apos deploy, ativar no Dashboard do Supabase em Authentication > Hooks > "Customize Access Token (JWT) Claims" > apontar para `custom_access_token_hook`. Documentar este passo no README ou no status file.

### 3.3 Helper functions para RLS

```sql
-- Wrapper para auth.uid() — cacheia no query plan (padrao cross-project validado)
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT (SELECT auth.uid());
$$;

-- Leitor de role do JWT — sem subquery em cada policy
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

-- Verificacao booleana direta
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_role() = 'admin';
$$;
```

Todas as functions com `SECURITY DEFINER` devem ter `SET search_path = public` (padrao cross-project validado — previne search_path injection).

### 3.4 Trigger de criacao automatica de profile

```sql
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

  -- Defense in depth: validar role contra whitelist
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
```

**Por que `raw_user_meta_data` e seguro neste contexto:** usuarios sao criados exclusivamente via `auth.admin.createUser()` na Edge Function (requer `service_role_key`). O signup publico deve estar desabilitado (ver secao 3.7). Mesmo assim, o trigger valida role contra whitelist como defense in depth.

### 3.5 Regras de auth no frontend (Vite SPA)

| Contexto | Metodo | Justificativa |
|----------|--------|---------------|
| AuthContext (estado de sessao) | `getSession()` + `onAuthStateChange` | Aceitavel em SPA: usado para estado de UI, nao para decisao de seguranca |
| Queries ao banco | JWT enviado automaticamente pelo Supabase client | PostgREST valida JWT server-side; RLS aplica automaticamente |
| Verificacao de role para UI | `session.user.app_metadata.role` | Show/hide de UI por conveniencia; enforcement real esta no RLS |
| Edge Function create-user | JWT no header `Authorization: Bearer <token>` | Edge Function valida server-side via `supabase.auth.getUser(token)` |

**Regra critica:** Nunca confiar em role vindo do client para decisoes de seguranca. O frontend pode exibir/esconder UI baseado no role (conveniencia), mas a enforcement esta sempre no RLS (server-side) e na Edge Function (server-side).

### 3.6 Sessao e logout

- Supabase Auth gerencia sessao automaticamente (JWT + refresh token)
- `onAuthStateChange` monitora mudancas de estado
- `signOut()` invalida o refresh token no servidor (nao apenas limpa local storage)
- Sessao expira conforme configuracao do projeto Supabase (default: 1h para JWT, 7d para refresh — ajustar no Dashboard se necessario)

### 3.7 Desabilitar signup publico

**Requisito obrigatorio**: Desabilitar auto-registro no Supabase Dashboard (Authentication > Providers > Email > "Enable Sign Up" = OFF). Usuarios sao criados exclusivamente pelo admin via Edge Function. Sem isso, qualquer pessoa poderia criar conta e acessar dados da loja.

Se o auto-registro estiver habilitado por necessidade tecnica (ex: fluxo de convite), habilitar **email confirmation** obrigatoriamente (Authentication > Providers > Email > "Confirm email" = ON).

### 3.8 Recuperacao de senha

O PRD lista recuperacao de senha como fora do escopo. **Recomendacao (Medium)**: nao bloqueia deploy, mas implementar na sequencia:
- Supabase Auth ja tem o fluxo de reset de senha embutido (`resetPasswordForEmail`)
- Basta adicionar um link "Esqueci minha senha" na tela de login
- Para funcionarios, o admin pode resetar via Dashboard do Supabase como workaround

---

## 4. Key Handling

### 4.1 Auditoria do .env atual

| Variavel | Prefixo VITE_? | Valor presente? | Risco |
|----------|----------------|-----------------|-------|
| `SUPABASE_PROJECT_ID` | Nao | Sim | Nenhum (informativo) |
| `SUPABASE_URL` | Nao | Sim | Nenhum (publico), mas precisa de VITE_ para o frontend |
| `SUPABASE_PUBLISHABLE_KEY` | Nao | Sim | Nenhum (anon key, segura para frontend), mas precisa de VITE_ |
| `SUPABASE_SECRET_KEY` | Nao | Sim | OK — sem VITE_, nao exposta ao frontend |
| `SUPABASE_ACCESS_TOKEN` | Nao | Sim | OK — CLI only, sem VITE_ |

**Resultado do scan de secrets no codigo-fonte:** zero ocorrencias de secrets em `src/`. Nenhum import de Supabase no codigo atual (fase 1 e 100% mock). Status: OK.

### 4.2 Reestruturacao para fase 2

O `.env` atual deve ser reestruturado. Criar `.env.local` (gitignored) com:

```env
# Frontend — Vite expoe VITE_* ao browser bundle (seguro: anon key + URL publica)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>

# Server-side ONLY — Edge Functions e seed script. NUNCA adicionar VITE_ prefix.
SUPABASE_SECRET_KEY=<service-role-key>

# Seed only — remover apos provisionar admin inicial
ADMIN_INITIAL_PASSWORD=<senha-forte-12-chars-min>

# CLI — nao usado pela app
SUPABASE_ACCESS_TOKEN=<personal-access-token>
```

**Regras de naming (Vite):**
- `VITE_*` = exposta no `import.meta.env` do browser bundle. Apenas URL e anon key aqui.
- Sem `VITE_` = invisivel para o frontend. Todas as secrets ficam sem prefixo.
- Qualquer variavel com nome contendo `SECRET`, `TOKEN`, `KEY` (exceto `PUBLISHABLE_KEY`) com prefixo `VITE_` e **Critical blocker**.

### 4.3 .env.example (atualizar)

```env
# Frontend (Vite exposes VITE_* to browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Server-side ONLY (Edge Functions, seed scripts) — NUNCA prefixar com VITE_
# SUPABASE_SECRET_KEY=your-service-role-key
# ADMIN_INITIAL_PASSWORD=your-strong-initial-password
```

### 4.4 .gitignore — fix necessario

O padrao `.env.*` no `.gitignore` bloqueia `.env.example` de ser commitado em novos clones. Adicionar excecao:

```gitignore
# Env / segredos
.env
.env.*
!.env.example
*.local
```

**Severidade:** Low (`.env.example` ja esta tracked, mas novos contribuidores poderiam perder o arquivo).

### 4.5 Verificacao no client.ts

O arquivo `src/integrations/supabase/client.ts` (a ser criado na fase 2) deve validar a presenca das variaveis em runtime:

```typescript
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    'VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY devem estar definidas no .env.local'
  );
}
```

---

## 5. RLS — Requisitos por Tabela

### 5.1 Principios gerais

1. **RLS habilitado em todas as tabelas** na mesma migration que cria a tabela (regra global)
2. **Wrapper `requesting_user_id()`** em vez de `auth.uid()` direto nas policies (padrao cross-project)
3. **`get_user_role()` e `is_admin()`** para checar role do JWT (sem subquery na tabela profiles)
4. **Um policy por operacao** (evitar policies SELECT aditivas no mesmo role — anti-pattern que cria vazamento via OR)
5. **Indices em toda coluna referenciada em policy** (regra global)

### 5.2 Matriz de permissoes (alinhada ao PRD secao 3)

| Tabela | Operacao | admin | employee | Policy |
|--------|----------|-------|----------|--------|
| **profiles** | SELECT | Todos os profiles | Apenas proprio | `requesting_user_id() = id OR is_admin()` |
| **profiles** | INSERT | Nao (trigger) | Nao (trigger) | Sem policy de INSERT direto (trigger `handle_new_user` com `SECURITY DEFINER`) |
| **profiles** | UPDATE | Qualquer profile | Nenhum | `is_admin()` |
| **profiles** | DELETE | Nenhum | Nenhum | Sem policy (desativacao via Supabase Auth, nao DELETE) |
| **products** | SELECT | Todos | Todos | `requesting_user_id() IS NOT NULL` |
| **products** | INSERT | Sim | Sim | `requesting_user_id() IS NOT NULL` |
| **products** | UPDATE | Sim | Sim | `requesting_user_id() IS NOT NULL` |
| **products** | DELETE | Nenhum | Nenhum | Sem policy (soft delete via UPDATE `active = false`) |
| **products** | UPDATE (soft delete: `active`) | Sim | Nao | Via constraint na policy de UPDATE ou policy separada |
| **clients** | SELECT | Todos | Todos | `requesting_user_id() IS NOT NULL` |
| **clients** | INSERT | Sim | Sim | `requesting_user_id() IS NOT NULL` |
| **clients** | UPDATE | Sim | Sim | `requesting_user_id() IS NOT NULL` |
| **clients** | DELETE | Nenhum | Nenhum | Sem policy (soft delete) |
| **clients** | UPDATE (soft delete: `active`) | Sim | Nao | Via constraint ou policy separada |
| **sales** | SELECT | Todos | Todos | `requesting_user_id() IS NOT NULL` |
| **sales** | INSERT | Sim | Sim | `requesting_user_id() IS NOT NULL` |
| **sales** | UPDATE | Nenhum | Nenhum | Vendas sao imutaveis |
| **sales** | DELETE | Nenhum | Nenhum | Sem policy (estorno via flag/soft delete — apenas admin, via RPC) |
| **sale_items** | SELECT | Todos | Todos | `requesting_user_id() IS NOT NULL` |
| **sale_items** | INSERT | Sim | Sim | `requesting_user_id() IS NOT NULL` |
| **sale_items** | UPDATE | Nenhum | Nenhum | Itens de venda imutaveis |
| **sale_items** | DELETE | Nenhum | Nenhum | CASCADE com sale |
| **store_settings** | SELECT | Sim | Sim (precisa do markup) | `requesting_user_id() IS NOT NULL` |
| **store_settings** | INSERT | Nenhum | Nenhum | Sem policy (seed only) |
| **store_settings** | UPDATE | Sim | Nao | `is_admin()` |
| **store_settings** | DELETE | Nenhum | Nenhum | Sem policy |

### 5.3 Policies detalhadas por tabela

#### profiles

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: admin ve todos; employee ve apenas o proprio
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    requesting_user_id() = id OR is_admin()
  );

-- UPDATE: apenas admin
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());
```

#### products

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer autenticado
CREATE POLICY "products_select" ON products
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

-- INSERT: qualquer autenticado
CREATE POLICY "products_insert" ON products
  FOR INSERT WITH CHECK (requesting_user_id() IS NOT NULL);

-- UPDATE: autenticado, mas soft delete (active = false) restrito a admin
-- Opcao recomendada: policy permite UPDATE para autenticado,
-- mas um trigger valida que apenas admin pode setar active = false
CREATE POLICY "products_update" ON products
  FOR UPDATE USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);
```

**Soft delete — restricao de `active` para admin:**

Usar RPC `SECURITY DEFINER` para soft delete em vez de policy UPDATE permissiva (padrao cross-project validado: "RPC SECURITY DEFINER > policy UPDATE permissiva"):

```sql
CREATE OR REPLACE FUNCTION soft_delete_product(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas admin pode excluir produtos';
  END IF;
  UPDATE products SET active = false, updated_at = now() WHERE id = product_id;
END;
$$;
```

O frontend chama `supabase.rpc('soft_delete_product', { product_id })` em vez de UPDATE direto.

Mesma abordagem para `clients` (soft delete) e `sales` (estorno).

#### clients

```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (requesting_user_id() IS NOT NULL);

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (requesting_user_id() IS NOT NULL)
  WITH CHECK (requesting_user_id() IS NOT NULL);
```

Soft delete via RPC analogamente ao products (apenas admin).

#### sales

```sql
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sales_select" ON sales
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "sales_insert" ON sales
  FOR INSERT WITH CHECK (requesting_user_id() IS NOT NULL);

-- Sem UPDATE policy (vendas imutaveis)
-- Sem DELETE policy (estorno via RPC admin-only)
```

Estorno via RPC:

```sql
CREATE OR REPLACE FUNCTION cancel_sale(sale_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas admin pode estornar vendas';
  END IF;
  -- Implementar logica de estorno (flag, restaurar estoque, etc.)
END;
$$;
```

#### sale_items

```sql
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sale_items_select" ON sale_items
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "sale_items_insert" ON sale_items
  FOR INSERT WITH CHECK (requesting_user_id() IS NOT NULL);

-- Sem UPDATE/DELETE (imutavel; DELETE em cascata com sale)
```

#### store_settings

```sql
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer autenticado (employee precisa do markup para cadastro de produto)
CREATE POLICY "store_settings_select" ON store_settings
  FOR SELECT USING (requesting_user_id() IS NOT NULL);

-- UPDATE: apenas admin
CREATE POLICY "store_settings_update" ON store_settings
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- Sem INSERT/DELETE (linha unica criada no seed)
```

### 5.4 Protecao da coluna `cost` em products

**Problema:** RLS filtra linhas, nao colunas. O employee nao deve ver `cost` (e derivados: margem, lucro por unidade), mas tem acesso SELECT a products.

**Solucao recomendada: View `products_display` com coluna cost condicional.**

```sql
CREATE OR REPLACE VIEW products_display
WITH (security_invoker = true)
AS
SELECT
  id, name, category, price, stock, active,
  created_by, created_at, updated_at,
  CASE
    WHEN get_user_role() = 'admin' THEN cost
    ELSE NULL
  END AS cost
FROM products;
```

**Como usar:**
- Frontend `useProducts()` faz `SELECT * FROM products_display` para leitura (nao da tabela `products` diretamente)
- Frontend faz `INSERT/UPDATE` na tabela `products` diretamente (RLS permite para autenticado)
- Com `security_invoker = true` (PostgreSQL 15+), a view respeita RLS da tabela base

**Nivel de protecao:** Um usuario tecnicamente sofisticado ainda poderia consultar a tabela `products` diretamente via Supabase client e ver `cost`. Para o perfil de risco deste projeto (salao de pequeno porte, equipe confiavel), a view como camada padrao de leitura e adequada. Se protecao mais forte for necessaria, revogar `SELECT` na tabela e expor apenas via RPC.

**Severidade:** Medium (protecao adequada ao contexto, mas nao absoluta).

---

## 6. Edge Function `create-user` — Requisitos de Seguranca

### 6.1 Validacao de caller

A Edge Function DEVE verificar que o caller e admin ANTES de qualquer acao:

```typescript
// Extrair JWT do header
const authHeader = req.headers.get('Authorization');
if (!authHeader) return new Response('Unauthorized', { status: 401 });

const token = authHeader.replace('Bearer ', '');

// Validar JWT server-side (getUser, nao getSession)
const { data: { user }, error } = await supabase.auth.getUser(token);
if (error || !user) return new Response('Unauthorized', { status: 401 });

// Verificar role — NUNCA confiar em role enviado pelo client
const role = user.app_metadata?.role;
if (role !== 'admin') return new Response('Forbidden', { status: 403 });
```

### 6.2 Validacao de input

Antes de criar o usuario, validar:

```typescript
// Schema de validacao (zod recomendado)
{
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  role: z.enum(['admin', 'employee']),
}
```

### 6.3 Secret key

- `SUPABASE_SERVICE_ROLE_KEY` acessada via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`
- Registrada via `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<value>`
- Nunca hardcoded no codigo da function
- Nunca retornada em nenhuma resposta (nem em erros)

### 6.4 Rate limiting

Implementar rate limiting basico na Edge Function:
- Maximo 5 criacoes de usuario por minuto por IP/caller
- Retornar `429 Too Many Requests` se exceder
- Alternativa: confiar no rate limiting nativo do Supabase (configuravel no Dashboard)

### 6.5 Erros

- Erros retornados ao client devem ser genericos: "Erro ao criar usuario"
- Detalhes logados no servidor (visivel em `supabase functions logs`)
- Nunca expor stack trace, service_role_key, ou detalhes internos

### 6.6 CORS

- Configurar CORS restrito ao dominio da aplicacao
- Nao usar `Access-Control-Allow-Origin: *` em producao

---

## 7. Indices Obrigatorios para Policies

Toda coluna referenciada em policy RLS DEVE ter indice (regra global). Lista minima:

| Tabela | Coluna | Tipo de indice | Justificativa |
|--------|--------|----------------|---------------|
| profiles | id | PK (ja existe) | Policy `profiles_select` |
| products | active | btree | Filtros de soft delete |
| products | created_by | btree | Auditoria + future policies |
| clients | active | btree | Filtros de soft delete |
| clients | created_by | btree | Auditoria |
| sales | created_by | btree | Auditoria |
| sales | client_id | btree | FK + queries frequentes |
| sales | created_at | btree | Filtros por periodo (Dashboard) |
| sale_items | sale_id | btree | FK + CASCADE |
| sale_items | product_id | btree | FK + join com products |

**Nota:** As policies atuais usam `requesting_user_id() IS NOT NULL` (verifica autenticacao), que nao referencia colunas da tabela — portanto nao exige indices adicionais alem dos ja listados para FK e queries. Se policies futuras filtrarem por `created_by`, o indice ja estara pronto.

---

## 8. Senha e Sessao

### 8.1 Password policy

Configurar no Supabase Dashboard (Authentication > Settings):
- Comprimento minimo: 8 caracteres (default do Supabase e 6 — aumentar)
- Recomendacao: 12+ caracteres para o admin inicial

### 8.2 Admin inicial

- Senha provisionada via `ADMIN_INITIAL_PASSWORD` no script de seed
- A senha deve ser forte (12+ chars, mistura de maiusculas/minusculas/numeros/especiais)
- Apos seed, a variavel `ADMIN_INITIAL_PASSWORD` pode ser removida do `.env.local`
- **Requisito pre-deploy:** o admin deve trocar a senha de seed antes de usar em producao. Documentar este passo no README.

### 8.3 Rate limiting no login

Supabase Auth tem rate limiting nativo configuravel no Dashboard (Authentication > Rate Limits). Verificar que esta habilitado antes de cobrar implementacao custom. Valores recomendados:
- Rate limit de emails por hora: 3-5 (evita spam de "esqueci senha")
- Rate limit de tentativas de login: padrao do Supabase (geralmente suficiente)

---

## 9. Sumario de Findings

| # | Finding | Severidade | Acao |
|---|---------|-----------|------|
| 1 | `.env` nao esta commitado no git (verificado) | OK | Nenhuma |
| 2 | Zero secrets em `src/` (grep confirmou) | OK | Nenhuma |
| 3 | Secret key sem prefixo `VITE_` no `.env` | OK | Manter assim na fase 2 |
| 4 | `.gitignore` padrao `.env.*` bloqueia `.env.example` | Low | Adicionar `!.env.example` |
| 5 | `.env` precisa de vars `VITE_*` para fase 2 | Medium | Reestruturar conforme secao 4.2 |
| 6 | Signup publico deve ser desabilitado | High | Desabilitar no Dashboard antes de deploy |
| 7 | Auth Hook precisa de ativacao manual no Dashboard | High | Documentar como passo pos-migration |
| 8 | Coluna `cost` acessivel a employee via API direta | Medium | View `products_display` como camada padrao |
| 9 | Password policy default e fraca (6 chars) | Medium | Aumentar para 8+ no Dashboard |
| 10 | Sem recuperacao de senha | Medium | Implementar `resetPasswordForEmail` pos-MVP |

---

## 10. Requisitos Consolidados para o Data Architect

Checklist que o Data Architect deve implementar na migration:

### Obrigatorio (bloqueante)

- [ ] RLS habilitado em todas as 6 tabelas na mesma migration que as cria
- [ ] Helper functions: `requesting_user_id()`, `get_user_role()`, `is_admin()`
- [ ] Auth Hook function: `custom_access_token_hook` com GRANTs para `supabase_auth_admin`
- [ ] Trigger `handle_new_user` com validacao de role contra whitelist
- [ ] Policies RLS conforme matriz da secao 5.2 (usar helpers, nao `auth.uid()` direto)
- [ ] RPCs `SECURITY DEFINER` para soft delete (products, clients) e estorno (sales) — apenas admin
- [ ] Todas RPCs com `SET search_path = public`
- [ ] View `products_display` com coluna `cost` condicional por role
- [ ] Indices em todas as colunas referenciadas em policies e FKs (secao 7)
- [ ] `created_by` em products, clients e sales com FK para profiles
- [ ] CHECK constraints: `role IN ('admin', 'employee')` em profiles
- [ ] Seed: store_settings com valores default (linha unica)
- [ ] Seed: admin inicial via `auth.admin.createUser()` com role 'admin' em `user_metadata`

### Documentar / acao manual

- [ ] Passo de ativacao do Auth Hook no Dashboard (pos-migration)
- [ ] Desabilitar signup publico no Dashboard
- [ ] Ajustar password policy no Dashboard (minimo 8 chars)
- [ ] Ajustar rate limits de auth no Dashboard (se necessario)

### Recomendado (nao bloqueante)

- [ ] `.gitignore`: adicionar `!.env.example`
- [ ] `.env.example`: atualizar com vars VITE_* e comentarios sobre server-side
- [ ] Fluxo de recuperacao de senha (pode ficar para pos-MVP)

---

## Historico de Versoes

| Versao | Data | Mudanca |
|--------|------|---------|
| 1.0 | 2026-07-20 | Security Review inicial — auth, keys, RLS, Edge Function |
