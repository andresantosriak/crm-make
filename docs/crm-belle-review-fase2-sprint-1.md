# Code Review: Fase 2 Sprint 1 — Infra Supabase

## Status: Aprovado com ressalvas

## Objetivo do Sprint
Conectar o projeto ao Supabase: migration com schema completo (6 tabelas, RLS, triggers, RPCs, view, Auth Hook), seed data, client frontend com env guard, tipos auto-gerados, TanStack Query provider, e adaptar os tipos e mock data da Fase 1 para compatibilidade.

## Tasks Validadas

| Task | Status | Observacao |
|------|--------|------------|
| Migration SQL (schema completo) | OK | 6 tabelas + RLS + indices + triggers + RPCs + view, confere 1:1 com data architecture |
| Seed scripts | OK | seed-admin.ts + seed-data.sql com totais corretos e trigger de estoque desabilitado |
| Client Supabase frontend | Ressalva | Funcional, env guard presente, mas sem generic Database — ver Warning 1 |
| Tipos auto-gerados (supabase gen types) | OK | 6 tabelas + 1 view + 8 functions cobertas |
| Tipos de aplicacao (camelCase) | OK | types/index.ts reescrito com todos os tipos do data architecture |
| TanStack Query provider | OK | QueryClient com error handling global (sonner), staleTime/gcTime adequados |
| Adaptacao Fase 1 (data + contexts + pages) | OK | Todos os data files, DataContext, CartContext e pages adaptados para novos tipos |

## Pontos Positivos

1. **Migration fiel ao data architecture** — Cada tabela, coluna, constraint, indice, trigger, RPC, view e GRANT na migration confere exatamente com o DDL documentado. Nenhuma divergencia encontrada.
2. **RLS abrangente e correto** — Todas as 6 tabelas tem RLS habilitado na mesma migration. Nenhuma policy SELECT aditiva (anti-pattern). Wrapper `requesting_user_id()` com `SELECT (SELECT auth.uid())` para cache no query plan. Todas as funcoes SECURITY DEFINER incluem `SET search_path = public`.
3. **Estoque atomico e seguro** — `fn_validate_and_decrement_stock` usa `FOR UPDATE` para lock de linha antes de validar e decrementar. Combinado com o trigger BEFORE INSERT em sale_items, garante integridade mesmo sob concorrencia.
4. **Seed data internamente consistente** — Totais das 6 vendas conferem com a soma dos itens (verificado aritmeticamente). Trigger de estoque desabilitado durante seed e reabilitado ao final. Stock dos produtos ja reflete estado pos-venda.
5. **Adaptacao da Fase 1 bem executada** — Tipos, data files, DataContext, CartContext e todas as pages foram adaptados para os novos tipos (string IDs, camelCase, campos novos). ClientsPage agora usa `client.id` como key (corrigindo o key={index} do MVP). HistoryPage tem helper `formatSaleDate` para converter createdAt ISO. DataContext tem `getClientName` para resolver clientId.
6. **Security limpo** — Zero referencias a secrets em src/. Client usa apenas VITE_* vars. seed-admin.ts usa process.env.SUPABASE_SECRET_KEY (script server-only fora de src/).

## Compliance — Migration vs Data Architecture

### Tabelas e colunas
- [x] profiles: PK FK auth.users, full_name, role CHECK (admin/employee), timestamps
- [x] products: uuid PK, category CHECK ('Labios'/'Rosto'/'Olhos' com acentos), price/cost numeric(10,2), stock >= 0, active, created_by DEFAULT auth.uid()
- [x] clients: uuid PK, name, phone nullable, birthday date nullable, active, created_by
- [x] sales: client_id nullable FK clients, payment_method CHECK com acentos, total > 0, items_count > 0, refunded_at nullable, sem updated_at (imutavel)
- [x] sale_items: sale_id FK CASCADE, product_id FK, quantity > 0, unit_price > 0, subtotal > 0
- [x] store_settings: singleton CHECK id=1, default_markup 0-500, low_stock_threshold, vip_threshold, birthday_alert_days, 4 toggles

### RLS
- [x] profiles: SELECT (proprio + admin), UPDATE (admin only), sem INSERT/DELETE
- [x] products: SELECT/INSERT/UPDATE (autenticado), sem DELETE (soft delete via RPC)
- [x] clients: SELECT/INSERT/UPDATE (autenticado), sem DELETE (soft delete via RPC)
- [x] sales: SELECT/INSERT (autenticado), sem UPDATE/DELETE (imutavel, estorno via RPC)
- [x] sale_items: SELECT/INSERT (autenticado), sem UPDATE/DELETE (imutavel, CASCADE com sale)
- [x] store_settings: SELECT (autenticado), UPDATE (admin only), sem INSERT/DELETE

### SECURITY DEFINER com SET search_path
- [x] get_user_role, is_admin, custom_access_token_hook, handle_new_user, fn_validate_and_decrement_stock, soft_delete_product, soft_delete_client, cancel_sale — todos com SET search_path = public

### Triggers
- [x] fn_update_timestamp em profiles, products, clients, store_settings (BEFORE UPDATE)
- [x] on_auth_user_created → handle_new_user (AFTER INSERT em auth.users)
- [x] trg_sale_items_before_insert_stock → fn_validate_and_decrement_stock (BEFORE INSERT em sale_items, com FOR UPDATE)

### View
- [x] products_display: security_invoker = true, cost condicional (admin ve, employee recebe NULL)

### RPCs
- [x] create_sale: sem SECURITY DEFINER (RLS do caller), calcula totais server-side, insere sale + sale_items atomicamente
- [x] soft_delete_product: SECURITY DEFINER, is_admin check, seta active = false
- [x] soft_delete_client: SECURITY DEFINER, is_admin check, seta active = false
- [x] cancel_sale: SECURITY DEFINER, is_admin check, verifica refunded/existencia, marca refunded_at, restaura estoque

### Indices
- [x] Todas as colunas usadas em policies, JOINs, WHEREs e ORDER BYs tem indice

### Auth Hook
- [x] custom_access_token_hook: injeta role no JWT (app_metadata.role), fallback 'employee'
- [x] GRANTs: USAGE ON SCHEMA, SELECT ON profiles, EXECUTE ON FUNCTION para supabase_auth_admin

## Compliance — Seed Data

### store_settings
- [x] Singleton (id=1), markup 180, threshold 5, vip 500, birthday_alert 7, toggles corretos

### Produtos (10 itens)
- [x] Nomes, categorias, precos, custos e estoques conferem com mock original (com acentos)
- [x] created_by vinculado ao admin via `SELECT id FROM profiles LIMIT 1`

### Clientes (5 itens)
- [x] Nomes com acentos (Patricia → Patricia com acento), phones e birthdays preenchidos
- [x] Mariana birthday 1992-07-23 (3 dias apos 2026-07-20) para tag ANIVERSARIO

### Vendas (6 itens)
- [x] Venda 1: Paleta 119.90 + Batom 39.90 + Gloss 29.90 = 189.70, items_count 3 — confere
- [x] Venda 2: Delineador 34.90 + Batom 39.90 = 74.80, items_count 2 — confere
- [x] Venda 3: Batom 39.90 = 39.90, items_count 1 — confere
- [x] Venda 4: Base 81.30 + Delineador 34.90 = 116.20, items_count 2 — confere (unit_price snapshot intencional)
- [x] Venda 5: Batom 39.90 + Gloss 29.90 + Base 79.90 + Iluminador 60.60 = 210.30, items_count 4 — confere
- [x] Venda 6: Gloss 29.90 = 29.90, items_count 1, client_id NULL — confere
- [x] Soma "Hoje" (vendas 1-4): 189.70 + 74.80 + 39.90 + 116.20 = 420.60 — confere com mock
- [x] Trigger desabilitado antes e reabilitado apos seed

## Compliance — Frontend

### Supabase client (src/integrations/supabase/client.ts)
- [x] Usa import.meta.env.VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY
- [x] Env guard: throw Error se vars faltando
- [x] Nenhuma secret key
- [ ] Falta generic `<Database>` no createClient — ver Warning 1

### Tipos auto-gerados (src/integrations/supabase/types.ts)
- [x] 6 tabelas com Row/Insert/Update + Relationships
- [x] 1 view (products_display) com cost: never no Insert/Update
- [x] 8 functions listadas
- [x] Tipo helpers (Tables, TablesInsert, TablesUpdate)
- [ ] Enum metodo_pagamento pre-existente (nao faz parte do schema CRM Belle) — ver Suggestion 1

### Tipos de aplicacao (src/types/index.ts)
- [x] Profile, Product, Client, Sale, SaleItem, StoreSettings, CartItem em camelCase
- [x] Product.cost: number | null (view retorna null para employee)
- [x] Client com totalSpent? e lastPurchase? (derivados opcionais)
- [x] PaymentMethod com acentos confere com CHECK da migration
- [x] Tipos antigos preservados (ClientTag, Alert, Promo, PromoAction)

### TanStack Query
- [x] QueryClient com QueryCache.onError exibindo toast (sonner)
- [x] meta.silent check para queries silenciosas
- [x] staleTime 60s, gcTime 10min, retry 1, refetchOnWindowFocus false
- [x] QueryClientProvider como provider mais externo
- [x] Toaster com richColors e position top-right

### .env.example
- [x] Separacao clara: VITE_* para frontend, SUPABASE_SECRET_KEY para backend
- [x] ADMIN_INITIAL_PASSWORD com instrucao de remover apos uso

## Seguranca

- [x] `grep -r "sb_secret|SUPABASE_SECRET|service_role" src/` = 0 resultados
- [x] Client usa apenas publishable key (VITE_*)
- [x] seed-admin.ts usa process.env (fora de src/, script server-only)
- [x] RLS em todas as tabelas
- [x] Auth Hook injeta role no JWT (nao manipulavel pelo client)
- [x] handle_new_user valida role contra whitelist (admin/employee)
- [x] RPCs admin-only verificam is_admin() antes de agir
- [x] View products_display esconde cost para employee
- [x] Estoque validado e decrementado atomicamente (trigger com FOR UPDATE)

## Integridade da Fase 1

- [x] App.tsx: inalterado (mesmas rotas)
- [x] main.tsx: adicoes nao-destrutivas (QueryClientProvider, Toaster)
- [x] Todas as 10 pages presentes e funcionais
- [x] Data files adaptados (string IDs, campos novos, acentos preservados)
- [x] DataContext adaptado (novos tipos em add*, getClientName, todaySales com filtro de data ISO + refundedAt)
- [x] CartContext adaptado (Record<string, number>, confirmSale com clientId/paymentMethod/itemsCount)
- [x] HistoryPage adaptado (getClientName, formatSaleDate, paymentMethod, itemsCount)
- [x] ClientsPage: key={client.id} (correcao do key={index} do MVP)
- [x] ClientCard: adaptado para lastPurchase/totalSpent (sem tags — Sprint 5)
- [x] Package.json: deps adicionadas (@supabase/supabase-js, @tanstack/react-query, sonner, testing libs)

## Resumo de Problemas

### Blockers
Nenhum.

### Warnings (deveria corrigir)
1. **`createClient` sem generic `<Database>`** — O client Supabase em `src/integrations/supabase/client.ts` cria o client como `createClient(url, key)` sem o tipo generico. O arquivo `types.ts` com os tipos auto-gerados existe mas nao esta conectado ao client. Toda query `.from('table').select()` futura retornara dados sem tipagem TypeScript, perdendo a type safety que o gen types deveria prover.
   - Arquivo: `src/integrations/supabase/client.ts:12`
   - Como corrigir: `import type { Database } from './types'` e `createClient<Database>(supabaseUrl, supabaseKey)`

### Suggestions (poderia melhorar)
1. **Enum `metodo_pagamento` nos tipos auto-gerados** — A secao `Enums` do types.ts contem um enum `metodo_pagamento` com valores ('dinheiro', 'cartao', 'pix', 'transferencia', 'boleto', 'outro') que nao faz parte do schema CRM Belle. E um residuo do projeto Supabase (possivelmente de outro schema ou de uma migration anterior). Nao causa erro, mas polui os tipos exportados.

2. **`cancel_sale` sem lock FOR UPDATE na verificacao** — A RPC verifica `refunded_at IS NOT NULL` e existencia da venda antes de marcar o estorno e restaurar estoque, mas sem `SELECT ... FOR UPDATE`. Duas chamadas concorrentes para o mesmo sale_id poderiam ambas passar a verificacao e restaurar estoque duplamente. Para o contexto do projeto (1-2 admins, operacao manual, frequencia baixa), o risco e negligivel.

3. **ClientCard sem tags VIP/ANIVERSARIO** — A migracao de tipos removeu o campo `tag` de Client. Tags serao computadas a partir de `totalSpent` e `birthday` na Sprint 5 (Derivados). Regressao visual esperada e documentada.

4. **ClientPicker cria Client duplicado** — Pre-existente do MVP. `addClient` insere no DataContext; `setClient` usa copia local. Funcionalmente correto, redundancia de referencia.

## Veredicto
Code Review Fase 2 Sprint 1 aprovado com 1 warning. A migration esta completa e correta, a seguranca esta solida, os seeds conferem, e a Fase 1 foi adaptada sem quebras. O unico warning e a falta do generic `<Database>` no createClient — correcao de 1 linha que deve ser feita antes de comecar a Sprint 2 (Auth), pois as queries de auth precisarao de tipagem.
