# Code Review: Fase 2 Sprint 4 — CRUD Clients + Sales

## Status: Aprovado com ressalvas

## Objetivo do Sprint
Clientes e vendas persistidos no Supabase. Derivados (totalSpent/lastPurchase/tags) calculados sem N+1. Venda atomica via RPC create_sale (totais server-side + decremento de estoque). Estorno admin-only. DataContext como fachada TanStack pura.

## Tasks Validadas

| Task | Status | Observacao |
|------|--------|------------|
| useClients (query + derivados + soft delete) | OK | 2 queries + agregacao client-side, sem N+1 |
| useCreateClient (mutation) | OK | INSERT com .select().single(), retorno usado no picker |
| useSales (query + cancel + create) | Ressalva | RPC funcional, mas cast `as unknown as string` no p_items — ver Warning 1 |
| ClientsPage (tags computadas) | OK | getClientTags calcula VIP/ANIVERSARIO a partir de totalSpent/birthday |
| ClientCard (tags prop) | OK | Aceita tags[], renderiza multiplas badges |
| ClientPicker (sem duplicacao) | OK | Usa data do INSERT para construir client selecionado |
| NewSalePage (venda via RPC) | OK | create_sale com items, isConfirming, resetAfterSale, snapshot pra overlay |
| HistoryPage (estorno admin) | OK | cancel_sale com invalidations, botao visivel so para admin |
| ConfirmButton (loading + sem exigir cliente) | OK | canConfirm = payment + cartCount + !loading |
| CartContext (isConfirming + resetAfterSale) | OK | Sem confirmSale interno — logica movida para NewSalePage |
| DataContext (fachada pura) | OK | Todos os dados de useProducts/useClients/useSales, sem mock |

## Pontos Positivos

1. **Derivacao de totalSpent sem N+1** — useClients faz 2 queries (clientes ativos + vendas nao-estornadas) e agrega totalSpent/lastPurchase client-side via Map. Nenhum loop com query por cliente. Adequado para o volume do salao (< 500 clientes, < 5000 vendas conforme data architecture).
2. **Totais NUNCA calculados no client** — A RPC create_sale calcula total e items_count server-side a partir dos itens. O client envia apenas product_id, quantity e unit_price. cartTotal e usado somente para o snapshot do overlay (display), nao para persistencia.
3. **Estoque insuficiente preserva o carrinho** — Se a RPC rejeita por estoque insuficiente, onError dispara toast especifico ("Estoque insuficiente para um dos produtos"), isConfirming volta a false via onSettled, e resetAfterSale NAO e chamado. O usuario mantem o carrinho e pode ajustar quantidades.
4. **Invalidacoes em cadeia completas** — Tanto useCreateSale quanto useCancelSale invalidam `['sales']`, `['products']` e `['clients']` no onSuccess. Isso garante que: estoque reflete no catalogo e no dashboard, totalSpent do cliente recalcula, vendas de hoje atualizam. Nenhuma invalidacao faltando.
5. **ClientPicker sem duplicacao (fix do review geral)** — handleSaveNew agora usa `.mutate(input, { onSuccess: (data) => setClient(created) })` onde `created` e construido a partir do `data` retornado pelo INSERT (id real do banco). Nao cria objeto local com id fabricado. Ao reabrir o picker, o cliente aparece 1x via refetch.
6. **DataContext agora e fachada TanStack pura** — Consome useProducts, useClients, useSales. Nenhum useState de mock, nenhuma funcao addProduct/addClient/addSale. Expoe apenas derivados (lowStockProducts, todaySales, todayTotal, getClientName). Transicao de mock para Supabase completa.
7. **"Este mes" agora calculado do banco** — HistoryPage calcula o total do mes filtrando vendas por getMonth()/getFullYear() sobre createdAt real. Nao mais hardcoded "R$ 6.240".
8. **Acentos das correcoes do review geral aplicados** — CartBar "Avancar" corrigido para "Avançar", SaleSuccessOverlay "inicio" corrigido para "início".

## Compliance

### RPCs e Invalidations
- [x] useCreateSale chama RPC `create_sale` com p_client_id, p_payment_method, p_items
- [x] useCreateSale.onSuccess invalida ['sales'], ['products'], ['clients'] (cadeia completa)
- [x] useCancelSale chama RPC `cancel_sale` com p_sale_id
- [x] useCancelSale.onSuccess invalida ['sales'], ['products'], ['clients']
- [x] useSoftDeleteClient chama RPC `soft_delete_client`
- [x] Todos os RPCs admin-only (cancel_sale, soft_delete_client) tem is_admin() server-side

### Totais server-side
- [x] handleConfirmSale envia items com product_id, quantity, unit_price — nao envia total
- [x] RPC create_sale calcula v_total e v_items_count server-side no loop
- [x] cartTotal usado apenas para snapshot do overlay (display pos-venda)

### Derivacao eficiente (sem N+1)
- [x] useClients: 1 query clients + 1 query sales = 2 queries total
- [x] Agregacao via Map client-side (loop nos salesRows, acumula total + max created_at por client_id)
- [x] Resultado: totalSpent e lastPurchase por cliente sem subquery por registro

### Estados de UI
- [x] CartContext.isConfirming: true durante a RPC, false via onSettled (sucesso ou erro)
- [x] ConfirmButton: loading → "Registrando venda...", disabled
- [x] onError de estoque insuficiente: toast especifico, carrinho mantido
- [x] onSuccess: resetAfterSale (limpa items/step/client/payment/isConfirming) + overlay
- [x] Spinners em ClientsPage, HistoryPage durante isPending
- [x] Soft delete: botao disabled durante isPending, visivel so para admin

### Mappers e acentos
- [x] useSales: toSale mapper (snake para camelCase)
- [x] useClients: inline mapping (row para Client) com totalSpent/lastPurchase derivados
- [x] Categorias, pagamentos, textos UI com acentos corretos em toda a sprint
- [x] ClientCard aceita tags como prop (nao mais hardcoded no tipo Client)

### Permissoes
- [x] Botao estornar no HistoryPage: `{isAdmin && ...}` — dupla protecao (UI + RPC)
- [x] Botao excluir no ClientsPage: `{isAdmin && ...}` — dupla protecao (UI + RPC)
- [x] Venda sem cliente (Consumidor final): canConfirm nao exige client (intencional, arbitrado)

## Classificacao dos Achados do Test Map

### Achado 4.a — 3 telas sem empty-state (ClientsPage, StockPage, HistoryPage)
Listas vazias renderizam area em branco. Sem mensagem "Nenhum registro" nem tratamento de isError dedicado.
- **Classificacao: SUGGESTION** — Mesma observacao da S3 (StockPage). O app inicia com seeds, empty state e improvavel. Toast global do QueryCache cobre erros de rede. Mas a robustez da UX melhoraria com mensagens de estado vazio e erro.
- **Recomendacao:** Sprint 5 (cleanup) pode adicionar um componente EmptyState reutilizavel para as 3 telas.

### Achado 4.b — Cast `p_items as unknown as string` no useCreateSale
```typescript
p_items: input.p_items as unknown as string,
```
O valor real e `Array<{ product_id: string; quantity: number; unit_price: number }>`. O cast diz `string`. Funciona em runtime porque o Supabase client serializa o valor para JSON independente do tipo declarado, mas o cast e semanticamente incorreto no TypeScript.

**Analise do tipo correto:**
- O auto-generated types define `create_sale.Args.p_items?: Json`
- `Json` = `string | number | boolean | null | { [key: string]: Json | undefined } | Json[]`
- O array de items E assignavel a `Json[]` (que e um subtipo de `Json`)
- Se o `createClient<Database>` (warning da S1, ainda pendente) fosse aplicado, `supabase.rpc('create_sale', {...})` teria tipagem correta e o cast seria desnecessario
- Sem o generic, o RPC nao e tipado e o cast e um workaround

- **Classificacao: WARNING** — O cast `as unknown as string` e uma mentira no type system: declara string quando o valor e um array. Funciona por acidente de runtime (serializa antes de enviar), mas mascara o tipo real e pode confundir leitores do codigo. O cast correto seria `as unknown as Json` (importando Json do types). A solucao definitiva e aplicar `createClient<Database>` (pendencia da S1).
- **Recomendacao:** Trocar para `p_items: input.p_items as unknown as Json` (import Json de types) como fix imediato. Aplicar `createClient<Database>` como fix definitivo.
- Arquivo: `src/hooks/useSales.ts:34`

## Qualidade de Codigo

### Code Smells
- [x] Sem duplicacao significativa
- [x] Derivacao de tags isolada em funcao pura (getClientTags)
- [x] handleConfirmSale usa `.mutate()` com callbacks (nao mutateAsync) — fix do padrao do S3

### Nomes e Legibilidade
- [x] handleConfirmSale, resetAfterSale, isConfirming — nomes claros
- [x] spentMap, clientMap — Maps com nomes descritivos
- [x] getClientTags — funcao pura com logica de birthday year-wrap clara

### Complexidade
- [x] Todos os arquivos abaixo de 200 linhas (NewSalePage 197, maior)
- [x] useClients 118 linhas (4 hooks)
- [x] useSales 77 linhas (3 hooks)
- [x] ClientsPage 79 linhas, HistoryPage 131 linhas

### React Patterns
- [x] isPending (TQ v5) em todas as queries
- [x] `.mutate()` com onSuccess/onSettled em handleConfirmSale (nao mutateAsync — evita unhandled rejection)
- [x] key={client.id} e key={sale.id} em todas as listas
- [x] invalidateQueries com query keys corretas

### Performance
- [x] useClients: 2 queries (nao N+1)
- [x] HistoryPage: "Este mes" computado inline do array de sales (O(n), n < 100)
- [x] clientMap e spentMap construidos com useMemo (DataContext) ou inline (HistoryPage)

## Seguranca

- [x] RPCs admin-only (cancel_sale, soft_delete_client) verificam is_admin() server-side
- [x] Botoes de estorno e exclusao ocultos para employee na UI
- [x] unit_price enviado pelo client (snapshot de preco) — design decision aceita no data architecture
- [x] Nenhuma credencial no codigo

## Resumo de Problemas

### Blockers
Nenhum.

### Warnings (deveria corrigir)
1. **Cast `p_items as unknown as string`** — `useSales.ts:34` declara o valor como string quando e um array. Funciona em runtime mas e mentira no type system. Fix imediato: `as unknown as Json`. Fix definitivo: aplicar `createClient<Database>` (pendencia S1).
   - Arquivo: `src/hooks/useSales.ts:34`

### Suggestions (poderia melhorar)
1. **3 telas sem empty-state** — ClientsPage, StockPage, HistoryPage mostram area em branco com 0 registros. Componente EmptyState reutilizavel na Sprint 5.

2. **VIP_THRESHOLD e BIRTHDAY_ALERT_DAYS hardcoded** — ClientsPage usa 500 e 7 em vez de ler de store_settings. Arbitrado para Sprint 5.

3. **Seeds com datas fixas** — "Hoje" so funciona em 2026-07-20. Arbitrado para Sprint 5.

4. **DataContext.getClientName: "Consumidor final" para clientes removidos** — Para clientId nao-null nao encontrado no clientMap, DataContext retorna "Consumidor final" (deveria ser "Cliente removido"). HistoryPage tem seu proprio getClientName que retorna "Cliente removido" corretamente. Inconsistencia menor.

## Veredicto
Code Review Fase 2 Sprint 4 aprovado com 1 warning. O CRUD de clientes e vendas esta completo e integrado: totais calculados server-side, derivados sem N+1, estorno com restauracao de estoque, invalidacoes em cadeia cobrindo todo o grafo de dados. O warning do cast e uma correcao de tipagem (nao afeta runtime). A sprint fecha a transicao de mock para Supabase — DataContext e agora fachada TanStack pura.
