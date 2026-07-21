# QA Report: Fase 2 Sprint 3 — CRUD Products + Stock — CRM Studio Belle

## Status: APROVADO

**Data:** 2026-07-20
**Escopo:** Produtos reais via Supabase (leitura products_display, criacao, update, soft delete admin-only, mascaramento de custo por role, DataContext hibrido)

---

## Validacao Estatica

| Check | Resultado |
|-------|-----------|
| `npm run build` | Limpo (1952 modulos) |
| `npx vitest run` | 135/135 passando |
| `npm run dev` | Funcional |

---

## Testes Vitest Existentes (Sprint 3)

Os testes criados pelo stack agent na Sprint 3 estao todos passando:

| Arquivo | Testes | Passaram |
|---------|--------|----------|
| `src/hooks/__tests__/useProducts.test.ts` | 6 | 6/6 (fetch, mapping, cost null, create, soft delete RPC) |

Os testes ja cobrem os cenarios criticos de vitest do test map: fetch via view, snake_case para camelCase, cost null para employee, insert na tabela, soft_delete RPC. Sem necessidade de testes adicionais de vitest nesta sprint.

---

## Testes de Integracao com Usuarios Reais [AUTO:integ-auth]

### ADMIN — Criar produto com custo real

| Teste | Resultado |
|-------|-----------|
| INSERT produto "QA Test Admin Product" (cost=20, price=55.90, stock=8) | OK — criado com id |
| View products_display como ADMIN: cost=20.00 | OK |
| View products_display como EMPLOYEE: cost=NULL | OK (mascaramento correto) |
| Margem calculada: Math.round((55.90-20)/55.90*100) = 64% | OK |

### EMPLOYEE — Criar produto sem custo

| Teste | Resultado |
|-------|-----------|
| INSERT produto "QA Test Employee Product" (cost=0, price=39.90, stock=5) | OK — criado com cost=0 |
| UPDATE stock do proprio produto (5→10) | OK (HTTP 204, policy permite) |
| RPC soft_delete_product | BLOQUEADO ("Apenas admin pode excluir produtos") |

### ADMIN — Soft delete e cleanup

| Teste | Resultado |
|-------|-----------|
| soft_delete_product do produto admin | OK (active=false no banco) |
| soft_delete_product do produto employee | OK (active=false no banco) |
| Produtos deletados permanecem no banco com active=false | OK (soft delete, nao DELETE fisico) |
| Lista de ativos volta a 10 (query filtra active=true) | OK |

### Persistencia e Derivados

| Teste | Resultado |
|-------|-----------|
| Low stock products (active && stock<=5) | OK: 2 itens (Mascara 3, Blush 2) |
| Produtos criados sobrevivem a novo fetch (persistencia real) | OK |

---

## Verificacoes de Codigo (inspecao)

| Item | Resultado |
|------|-----------|
| useProducts query products_display (nao tabela direta) | OK |
| Filtro active=true na query | OK |
| Ordenacao por name (A→Z) | OK |
| StockPage: margem exibida so quando cost != null | OK (linha 49) |
| StockPage: botao lixeira so para isAdmin | OK (linha 64) |
| StockPage: isPending → spinner | OK (linha 40-46) |
| NewProductPage: campo custo oculto para employee (isAdmin &&) | OK (linha 109) |
| NewProductPage: PricingCards e botoes arredondamento ocultos para employee | OK (linha 139-165) |
| NewProductPage: cost = isAdmin ? cost : 0 no handleSave | OK (linha 71) |
| NewProductPage: handleSave usa .mutate com onSuccess (Warning 1 CR corrigido) | OK (linhas 67-75) |
| NewProductPage: salvar com nome vazio ou price <= 0 → no-op | OK (linha 66) |
| NewProductPage: "Salvando..." durante isPending | OK (linha 191) |
| DataContext: products via useProducts (real), clients/sales mock | OK |
| DataContext: lowStockProducts filtra active && stock<=5 | OK (linha 82) |
| DataContext: productsLoading exposto | OK |
| invalidateQueries(['products']) em create, update, softDelete | OK |

---

## Observacoes

1. **Warning 1 do CR ja corrigido:** handleSave agora usa `.mutate()` com callback `onSuccess` em vez de `await mutateAsync` sem try/catch. Nao ha mais unhandled promise rejection.

2. **useUpdateProduct sem UI:** Hook implementado mas sem botao de edicao no StockPage (arbitrado como pos-MVP). Testavel apenas via integracao direta (confirmado: employee UPDATE stock funciona via REST).

3. **Employee e custo no cadastro:** Employee envia cost=0 (placeholder). Campo de custo, PricingCards e botoes de arredondamento ficam ocultos. View mascara cost na leitura. Implementacao consistente.

---

## Validacao Manual Pendente

| Item | Tipo |
|------|------|
| Spinner loading no StockPage | VISUAL |
| StockPage sem empty-state (0 produtos) | VISUAL |
| Busca filtra em tempo real no browser | MANUAL |
| Produto criado aparece na lista apos salvar | MANUAL |
| Produto deletado some da lista | MANUAL |
| NewProductPage: preco sugerido ao digitar custo (admin) | MANUAL |
| NewProductPage: employee so ve Nome/Categoria/Preco/Estoque | VISUAL |
| Produto criado no catalogo de Nova Venda | MANUAL |

---

## Resumo

| Metrica | Valor |
|---------|-------|
| Build | Limpo |
| Testes vitest | 135/135 passando |
| Testes integ-auth executados | 12 |
| Testes integ-auth passando | 12/12 |
| Bugs encontrados | 0 |

---

## Veredicto

**QA Fase 2 Sprint 3 APROVADO.** O CRUD de produtos esta completo e correto:
- Mascaramento de custo por role funciona em todas as camadas (view, StockPage, NewProductPage)
- Soft delete admin-only com dupla protecao (UI + RPC server-side)
- Employee pode criar e editar produtos mas nao deletar
- Persistencia real no Supabase confirmada
- DataContext hibrido (products real, clients/sales mock) funcional
- Warning do CR (handleSave) ja corrigido
- 135 testes vitest + 12 testes integ-auth, todos passando
