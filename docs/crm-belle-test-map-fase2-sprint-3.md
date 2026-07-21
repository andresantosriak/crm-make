# Test Map — Fase 2 / Sprint 3 (CRUD Products + Stock) — CRM Studio Belle

> Integracao real de produtos com Supabase: leitura via view `products_display`, criacao/edicao na tabela, soft delete via RPC admin-only, mascaramento de custo por role.
> Analise do **codigo atual**: `hooks/useProducts.ts`, `pages/StockPage.tsx`, `pages/NewProductPage.tsx`, `contexts/DataContext.tsx` (fachada parcial — products do Supabase; clients/sales ainda mock ate S4).
> Base: `docs/crm-belle-backlog-fase2.md` (Sprint 3).

**Gerado em:** 2026-07-20

## Como testar os itens [AUTO]
- **`[AUTO:vitest]`** — unitario com Supabase/React Query mockados (hooks, calculos condicionais, guards de UI).
- **`[AUTO:integ-auth]`** — integracao com sessao real admin OU employee contra o remoto (RLS, view masking, RPC).
- **`[VISUAL]` / `[MANUAL]`** — inspecao/interacao no browser com dev server.

> **Setup QA:** usar admin + employee reais de `docs/credentials.md` (employee criado na S2). O mascaramento de custo e o botao de exclusao so sao validaveis com os dois roles.

---

## 1. Listagem de produtos (happy path)

Arquivos: `useProducts` (query), `StockPage`.

- [ ] **[AUTO:integ-auth]** `useProducts` retorna os **10 produtos** do seed, lidos de `products_display` com `active = true`, ordenados por nome (A→Z: Base Líquida, Batom Matte..., Blush Pêssego, Corretivo, Delineador, Gloss, Iluminador, Máscara, Paleta, Pó Compacto)
- [ ] **[AUTO:integ-auth]** Query filtra `active = true` — produtos soft-deleted (active=false) NAO aparecem
- [ ] **[VISUAL]** Header "Estoque" + "10 produtos ativos" (`products.length`, contagem total nao afetada pela busca)
- [ ] **[AUTO:vitest]** Cada item exibe tile por categoria, nome (truncate), preco formatado e StockBadge
- [ ] **[AUTO:vitest]** Busca (`useSearch`) filtra por nome case-insensitive ('blush' → Blush Pêssego); header mantem 10
- [ ] **[AUTO:integ-auth]** `toProduct` mapeia snake→camel e `cost` = Number ou null; `category` tipada 'Lábios'|'Rosto'|'Olhos' (com acento)

### Estados de UI
- [ ] **[VISUAL]** `isPending` → spinner dourado centralizado (py-10)
- [ ] **[VISUAL]** Lista vazia (0 produtos ativos) → **sem empty-state explicito** (area em branco). Ver Nota 1
- [ ] **[MANUAL]** Erro de rede (query rejeita) → React Query entra em `error`; nao ha UI de erro dedicada na StockPage. Ver Nota 1

### Responsividade
- [ ] **[VISUAL]** Cards legiveis em 375px; nome com truncate/ellipsis quando longo

---

## 2. Margem e custo condicionais por role

Arquivos: `StockPage` (calculo de margin), view `products_display`.

- [ ] **[AUTO:integ-auth]** **Admin**: `products_display.cost` retorna valor real → margem exibida. Ex.: Batom (14/39,90) → "margem 65%"; Base (32/79,90) → 60%; Blush (15/44,90) → 67%
- [ ] **[AUTO:integ-auth]** **Employee**: `cost` retorna NULL (view CASE por role) → `margin` = null → StockPage exibe **so o preco**, sem " · margem X%"
- [ ] **[AUTO:vitest]** `product.cost != null ? Math.round(calcMargin(cost, price)) : null` — margem oculta quando cost null
- [ ] **[VISUAL]** Employee ve preco sem margem; admin ve "R$ X,XX · margem Y%"

---

## 3. Criacao de produto (happy path)

Arquivos: `NewProductPage`, `useCreateProduct`.

- [ ] **[AUTO:integ-auth]** Salvar produto valido → INSERT na tabela `products` (com cost) → onSuccess invalida `['products']` → toast "Produto cadastrado com sucesso" → navega `/estoque`
- [ ] **[AUTO:integ-auth]** Produto criado aparece na lista do Estoque (refetch pos-invalidate) e no catalogo de Nova Venda
- [ ] **[VISUAL]** Botao mostra "Salvando..." enquanto `createProduct.isPending` (disabled)
- [ ] **[AUTO:integ-auth]** `created_by` preenchido com o usuario logado (default auth.uid() na tabela)

### Calculo live (mantido da fase 1, agora com persistencia)
- [ ] **[AUTO:vitest]** Digitar custo 20 com priceAuto → preco sugerido `round90(20*(1+180/100))` = **R$ 55,90**
- [ ] **[AUTO:vitest]** PricingCards: markup `Math.round` 180%, margem 64%, lucro R$ 35,90; exibe "—" quando cost/price = 0
- [ ] **[AUTO:vitest]** "↓ Arredondar" `floor90(price-0.01)`: 55,90 → 54,90; "↑ Arredondar" `ceil90(price+0.01)`: 55,90 → 56,90
- [ ] **[AUTO:vitest]** Editar preco manual → priceAuto false → hint "Preço ajustado manualmente"

### Edge cases / validacao
- [ ] **[AUTO:vitest]** Salvar com nome vazio OU price <= 0 → no-op (nao chama mutation)
- [ ] **[AUTO:integ-auth]** INSERT com category fora de {Lábios,Rosto,Olhos} → CHECK viola → onError toast (mas a UI so permite as 3 categorias via chips)
- [ ] **[AUTO:integ-auth]** INSERT com price/cost negativo → CHECK viola → onError toast
- [ ] **[AUTO:vitest]** Custo/preco aceitam virgula ('55,90' → 55.90); stock invalido → parseInt NaN → 0
- [ ] **[MANUAL]** `handleSave` nao tem try/catch: se `mutateAsync` rejeitar, navigate e pulado (fica na tela) e onError dispara toast — validar que nao ha unhandled rejection visivel. Ver Nota 2

---

## 4. Edicao de produto

Arquivos: `useUpdateProduct` (implementado).

- [ ] **[AUTO:integ-auth]** `useUpdateProduct` faz UPDATE em `products` apenas com campos definidos; `cost` so e setado se `!= null` (nao zera custo por engano)
- [ ] **[AUTO:integ-auth]** onSuccess invalida `['products']` + toast "Produto atualizado"
- [ ] **[AUTO:integ-auth]** Employee pode UPDATE product (policy products_update = qualquer autenticado) — ex.: ajustar stock
- [ ] **[MANUAL]** **Sem UI de edicao na StockPage nesta sprint:** o hook existe mas nenhum componente o chama (nao ha botao "editar"). Edicao so testavel via hook/integracao direta. Ver Nota 3

---

## 5. Soft delete (admin-only)

Arquivos: `StockPage` (botao), `useSoftDeleteProduct` (RPC).

- [ ] **[AUTO:integ-auth]** Admin clica lixeira → RPC `soft_delete_product` → product.active vira false → onSuccess invalida `['products']` → toast "Produto removido" → some da lista (query filtra active=true)
- [ ] **[AUTO:integ-auth]** Produto deletado **permanece no banco** com `active = false` (soft delete, nao DELETE fisico) — verificar via query direta
- [ ] **[VISUAL]** Botao lixeira (Trash2, cor danger) visivel **apenas para admin** (`{isAdmin && ...}`)
- [ ] **[VISUAL]** Botao disabled (opacity 40) enquanto `softDelete.isPending`

### Permissoes
- [ ] **[AUTO:vitest]** Employee: botao lixeira NAO renderiza (isAdmin false)
- [ ] **[AUTO:integ-auth]** Employee que burlar a UI e chamar `rpc('soft_delete_product')` → EXCEPTION 'Apenas admin pode excluir produtos' (RPC valida is_admin()) → onError toast
- [ ] **[AUTO:integ-auth]** Admin real consegue executar (JWT app_metadata.role = 'admin')

---

## 6. Integracao / persistencia

- [ ] **[AUTO:integ-auth]** Apos create/update/delete, `invalidateQueries(['products'])` dispara refetch → lista reflete estado do banco
- [ ] **[MANUAL]** Criar produto → **reload da pagina** → produto persiste (veio do banco, nao mais mock em memoria)
- [ ] **[AUTO:vitest]** `DataContext` consome `useProducts` para `products` (real) e `lowStockProducts` (filter active && stock<=5); clients/sales ainda mock
- [ ] **[AUTO:integ-auth]** `lowStockProducts` do dashboard = 2 produtos (Máscara Volume Extremo 3, Blush Pêssego 2) vindos do banco
- [ ] **[MANUAL]** Anon (sem sessao) nao alcanca StockPage (ProtectedRoute) — e mesmo se chamasse a query, RLS retorna 0 linhas (coberto no test map F2S1)

### Catalogo de Nova Venda (produtos reais, venda ainda mock)
- [ ] **[AUTO:integ-auth]** NewSalePage lista os produtos reais do banco (via DataContext/useProducts); filtro por categoria e busca funcionam sobre dados reais
- [ ] **[MANUAL]** Produto com **stock 0** aparece no catalogo (nao ha filtro de estoque na listagem de venda) — validar comportamento esperado; venda em si ainda e mock (CartContext intacto ate S4)

---

## Resumo de cobertura

| Secao | vitest | integ-auth | VISUAL/MANUAL |
|-------|--------|-----------|---------------|
| Listagem | 3 | 2 | 5 |
| Margem/custo por role | 1 | 2 | 1 |
| Criacao | 5 | 3 | 2 |
| Edicao | 0 | 3 | 1 |
| Soft delete | 1 | 4 | 2 |
| Integracao/persistencia | 2 | 3 | 3 |

**Prioridade QA:** (1) `[AUTO:integ-auth]` do mascaramento de custo admin vs employee (critico — dado confidencial); (2) soft delete admin-only + RPC negando employee; (3) create → invalidate → aparece na lista + persiste em reload; (4) `[AUTO:vitest]` dos calculos de pricing e guards de UI (botao delete, margem condicional).

## Notas para Code Reviewer / PO
1. **StockPage sem empty-state nem UI de erro:** com 0 produtos ativos a tela fica em branco; se a query falhar (rede/RLS), nao ha mensagem de erro dedicada (so o toast global do QueryCache, se configurado). Considerar adicionar empty-state ("Nenhum produto cadastrado") e tratamento de `isError`.
2. **`handleSave` sem try/catch:** `await createProduct.mutateAsync(...)` seguido de `navigate('/estoque')`. Em erro, o mutateAsync rejeita → navigate e pulado (bom, fica na tela) e o `onError` do hook mostra toast, mas a rejeicao propaga no handler async (potencial unhandled rejection no console). Envolver em try/catch ou usar `.mutate` com callback tornaria o fluxo mais limpo.
3. **`useUpdateProduct` implementado mas sem UI:** o backlog cita "editar" no happy path, porem a StockPage nao tem botao de edicao — o hook so e exercitavel por teste de integracao. Confirmar se a UI de edicao entra nesta sprint ou fica para depois; test map cobre o hook, nao um fluxo de UI inexistente.
4. **Custo em create vs update:** `useCreateProduct` sempre envia `cost` (employee tambem cadastra custo — a tabela products aceita, policy INSERT liberada). O mascaramento so vale na leitura (view). Confirmar se e desejado que employee informe custo no cadastro mesmo sem poder ve-lo depois na listagem.
