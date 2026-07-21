# QA Report: Fase 2 Sprint 1 — Infra Supabase — CRM Studio Belle

## Status: APROVADO

**Data:** 2026-07-20
**Escopo:** Migration SQL (6 tabelas + RLS + indices + triggers + RPCs + view + Auth Hook), seed data, client Supabase frontend, tipos auto-gerados, TanStack Query provider

---

## Validacao Estatica

| Check | Resultado |
|-------|-----------|
| `tsc --noEmit` / `npm run build` | Sem erros (1902 modulos, build limpo) |
| `npm run dev` (porta 8080) | OK, HTTP 200 |
| `npx vitest run` | 117/117 testes passando (101 existentes + 16 novos) |

---

## 1. Schema — Tabelas e Colunas [AUTO:mgmt]

| Verificacao | Resultado |
|-------------|-----------|
| 6 tabelas em public (profiles, products, clients, sales, sale_items, store_settings) | OK |
| products: id, name, category, price, cost, stock, active, created_by, created_at, updated_at | OK |
| sales: id, client_id, payment_method, total, items_count, created_by, refunded_at, created_at | OK |
| sale_items: id, sale_id, product_id, quantity, unit_price, subtotal | OK |
| store_settings: singleton com CHECK (id = 1) | OK |
| RLS habilitado nas 6 tabelas (relrowsecurity = true) | OK |

## 2. CHECK Constraints [AUTO:mgmt]

| Constraint | Definicao | Status |
|-----------|-----------|--------|
| products_category_check | IN ('Labios', 'Rosto', 'Olhos') COM acentos | OK |
| sales_payment_method_check | IN ('Pix', 'Cartao de credito', 'Cartao de debito', 'Dinheiro') COM acentos | OK |
| profiles_role_check | IN ('admin', 'employee') | OK |
| products_price_check / products_cost_check | >= 0 | OK |
| products_stock_check | >= 0 | OK |
| sales_total_check | > 0 | OK |
| sales_items_count_check | > 0 | OK |
| sale_items_quantity/unit_price/subtotal | > 0 | OK |
| store_settings_default_markup_check | BETWEEN 0 AND 500 | OK |
| store_settings_id_check | id = 1 (singleton) | OK |

## 3. Indices [AUTO:mgmt]

| Tabela | Indices encontrados | Status |
|--------|-------------------|--------|
| products | idx_products_category, _active, _stock, _created_by | OK (4/4) |
| clients | idx_clients_name, _birthday, _active, _created_by | OK (4/4) |
| sales | idx_sales_client_id, _created_by, _created_at, _payment_method, _refunded_at | OK (5/5) |
| sale_items | idx_sale_items_sale_id, _product_id | OK (2/2) |
| profiles | idx_profiles_role | OK (1/1) |

## 4. Triggers e Functions [AUTO:mgmt]

| Item | Resultado |
|------|-----------|
| trg_profiles_updated_at, trg_products_updated_at, trg_clients_updated_at, trg_store_settings_updated_at | OK (4 triggers) |
| on_auth_user_created (auth.users) | OK |
| trg_sale_items_before_insert_stock | OK |
| Functions: requesting_user_id, get_user_role, is_admin, custom_access_token_hook, handle_new_user, fn_update_timestamp, fn_validate_and_decrement_stock, create_sale, soft_delete_product, soft_delete_client, cancel_sale | OK (11/11) |
| SECURITY DEFINER com SET search_path = public | OK em todas as functions que exigem (8/8) |
| create_sale e requesting_user_id sao SECURITY INVOKER | OK (correto — usam RLS do caller) |

## 5. GRANTs (Auth Hook) [AUTO:mgmt]

| Grant | Resultado |
|-------|-----------|
| supabase_auth_admin SELECT ON profiles | OK |
| supabase_auth_admin EXECUTE ON custom_access_token_hook | OK |

## 6. Seeds [AUTO:mgmt]

| Verificacao | Esperado | Encontrado | Status |
|-------------|----------|------------|--------|
| products count | 10 | 10 | OK |
| clients count | 5 | 5 | OK |
| sales count | 6 | 6 | OK |
| sale_items count | 13 | 13 | OK |
| store_settings count | 1 | 1 | OK |
| store_settings: markup 180, threshold 5, vip 500, resumo false | Sim | Sim | OK |
| Vendas hoje (2026-07-20): 4 vendas, total 420.60 | 4 / 420.60 | 4 / 420.60 | OK |
| Vendas ontem (2026-07-19): 2 vendas | 2 | 2 | OK |
| 1 venda com client_id NULL (Consumidor final) | Sim | Sim (total 29.90) | OK |
| Low stock (<= 5): Blush Pessego (2), Mascara Volume Extremo (3) | 2 itens | 2 itens | OK |
| Mariana Alves birthday 1992-07-23 | 1992-07-23 | 1992-07-23 | OK |
| Nomes com acento: Mascara, Po Compacto, Blush Pessego, Iluminador Rose | 4 | 4 | OK |
| Subtotals coerentes (subtotal = qty * unit_price) | 13/13 | 13/13 | OK |

## 7. RLS — Anon (sem autenticacao) [AUTO:integ-anon]

| Operacao | Resultado | Status |
|----------|-----------|--------|
| SELECT products (anon) | [] (0 linhas) | OK |
| SELECT clients (anon) | [] | OK |
| SELECT sales (anon) | [] | OK |
| SELECT sale_items (anon) | [] | OK |
| SELECT store_settings (anon) | [] | OK |
| SELECT profiles (anon) | [] | OK |
| INSERT products (anon) | Erro 42501 (RLS) | OK |
| RPC create_sale (anon) | Erro 42501 (RLS) | OK |
| SELECT products_display (anon) | [] | OK |

## 8. Client Supabase e Tipos [AUTO:vitest]

| Verificacao | Resultado |
|-------------|-----------|
| Env guard: throw se VITE_SUPABASE_URL ausente | OK (teste vitest) |
| Env guard: throw se VITE_SUPABASE_PUBLISHABLE_KEY ausente | OK (teste vitest) |
| createClient<Database> com generic tipado | OK (confirmado no codigo) |
| Types.ts: 6 tabelas + 1 view + 8 functions | OK (teste vitest) |
| products.category como string (CHECK DB level) | OK |
| sales.payment_method como string (CHECK DB level) | OK |
| products_display.cost como number/null (mascaramento) | OK |
| sales.client_id e refunded_at como nullable | OK |
| Application types: PaymentMethod com acentos | OK |
| Product.cost como number/null | OK |
| store_settings com 10 colunas tipadas | OK |

## 9. TanStack Query Provider [AUTO:vitest / inspecao]

| Verificacao | Resultado |
|-------------|-----------|
| QueryClientProvider como provider mais externo em main.tsx | OK |
| QueryCache.onError com toast (sonner) | OK |
| meta.silent check para queries silenciosas | OK |
| staleTime 60s, gcTime 10min, retry 1, refetchOnWindowFocus false | OK |
| Toaster com richColors e position top-right | OK |

## 10. Variaveis de Ambiente

| Verificacao | Resultado |
|-------------|-----------|
| .env.example documenta VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY | OK |
| .env.example documenta SUPABASE_SECRET_KEY SEM prefixo VITE_ | OK |
| .env e .env.local no .gitignore (git check-ignore confirmado) | OK |
| Zero secrets em src/ (grep confirmado) | OK |

## 11. Seguranca

| Verificacao | Resultado |
|-------------|-----------|
| Nenhuma referencia a sb_secret/SUPABASE_SECRET/service_role em src/ | OK |
| Client usa apenas publishable key (VITE_*) | OK |
| RLS habilitado em todas as 6 tabelas | OK |
| Functions SECURITY DEFINER com SET search_path = public | OK |

---

## Testes Vitest Criados (Fase 2)

| Arquivo | Testes | Passaram |
|---------|--------|----------|
| `src/integrations/supabase/__tests__/types.test.ts` | 13 | 13/13 |
| `src/integrations/supabase/__tests__/client.test.ts` | 3 | 3/3 |

---

## Itens Fora do Escopo (pendentes para QA Sprint 2+)

| Item | Motivo | Sprint |
|------|--------|--------|
| Testes integ-auth (employee/admin) | Dependem do Auth Hook ativado + usuarios criados | Sprint 2 |
| CHECKs rejeitam invalidos (INSERT com categoria 'Cabelo', price negativo, etc.) | Exige sessao autenticada | Sprint 2 |
| Trigger updated_at automatico | Exige sessao autenticada | Sprint 2 |
| create_sale (estoque atomico, validacoes) | Exige sessao autenticada | Sprint 2 |
| RPCs admin-only (soft_delete, cancel_sale) | Exige sessao admin | Sprint 2 |
| View products_display por role (cost null para employee) | Exige sessao employee vs admin | Sprint 2 |
| Employee/Admin permissoes granulares | Exige sessao autenticada | Sprint 2 |
| Auth Hook ativado no Dashboard | Ativacao manual | Release checklist |
| Signup publico desabilitado | Ativacao manual | Release checklist |

---

## Notas para o Time

1. **Warning do CR corrigido:** O client.ts ja tem `createClient<Database>` (Warning 1 do CR ja foi aplicado).
2. **Enum residual metodo_pagamento** no types.ts (Suggestion 1 do CR) — nao causa erro, e residuo do schema Supabase, registrado como pendencia de limpeza.
3. **Divergencia de acentos frontend/backend** levantada no test map (Nota 1) e uma pendencia critica de integracao para a sprint que conectar a UI ao Supabase. Os CHECKs do banco exigem acentos, mas partes do frontend Fase 1 usam strings sem acento.

---

## Veredicto

**QA Fase 2 Sprint 1 APROVADO.** A infraestrutura Supabase esta correta e completa:
- Schema com 6 tabelas, todos os CHECKs, indices e triggers conforme data architecture
- RLS habilitado e funcional (anon bloqueado em todas as tabelas e operacoes)
- Seeds com contagens e totais exatos (420.60 hoje, 13 sale_items coerentes, acentos corretos)
- Client tipado com env guard e generic Database
- TanStack Query configurado com error handling global
- Seguranca limpa (zero secrets em src/, SECURITY DEFINER com search_path)
- Build limpo, 117 testes passando, dev server funcional
