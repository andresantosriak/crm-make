# Test Map — Fase 2 / Sprint 4 (CRUD Clients + Sales) — CRM Studio Belle

> Integracao real de clientes e vendas com Supabase: derivados (totalSpent/lastPurchase/tags), cadastro no picker, venda atomica via RPC `create_sale` (totais server-side + decremento de estoque), estorno admin-only via `cancel_sale`, historico real.
> Analise do **codigo atual**: `hooks/useClients.ts`, `hooks/useSales.ts`, `contexts/CartContext.tsx`, `pages/ClientsPage.tsx`, `pages/NewSalePage.tsx`, `pages/HistoryPage.tsx`, `components/client/ClientPicker.tsx`, `components/client/ClientCard.tsx`, `components/sale/ConfirmButton.tsx`.
> Base: `docs/crm-belle-backlog-fase2.md` (Sprint 4). Fecha o CRUD — DataContext e fachada TanStack pura.

**Gerado em:** 2026-07-20

## Como testar os itens [AUTO]
- **`[AUTO:vitest]`** — unitario com Supabase/React Query mockados (hooks, tags, guards, calculos).
- **`[AUTO:integ-auth]`** — integracao com sessao real admin OU employee (RPCs, RLS, trigger de estoque, derivados).
- **`[VISUAL]` / `[MANUAL]`** — browser com dev server.

> **Setup QA — 2 pontos criticos:**
> 1. Admin + employee reais de `docs/credentials.md` (mascaramento/estorno/exclusao por role).
> 2. **Dependencia de DATA:** os seeds de vendas estao fixos em **2026-07-20/19**. O calculo de "Hoje"/"Este mes" usa `new Date()` real. Rodar o QA **em 2026-07-20** para os numeros baterem (R$ 420,60 / 4 vendas hoje); em qualquer outra data, "Hoje" = 0 ate registrar venda nova. Ver Nota 1.

---

## 1. Clientes — listagem e derivados (happy path)

Arquivos: `useClients`, `ClientsPage`, `ClientCard`.

- [ ] **[AUTO:integ-auth]** `useClients` retorna 5 clientes ativos (order by name), com `totalSpent` e `lastPurchase` **derivados** de sales nao-estornadas
- [ ] **[AUTO:integ-auth]** Derivados batem com os seeds (soma por client_id, refunded_at null):
  - Patrícia Souza → **R$ 189,70** (venda 1)
  - Renata Lima → R$ 210,30 (venda 5)
  - Mariana Alves → R$ 116,20 (venda 4)
  - Juliana Costa → R$ 74,80 (venda 2)
  - Camila Ferreira → R$ 39,90 (venda 3)
- [ ] **[AUTO:vitest]** `lastPurchase` = created_at mais recente entre as vendas do cliente
- [ ] **[VISUAL]** Header "Clientes" + "5 cadastrados"; ClientCard mostra "Últ. compra DD/MM · R$ total"
- [ ] **[AUTO:vitest]** Cliente sem vendas → totalSpent 0, lastPurchase null → ClientCard mostra "Últ. compra — · R$ 0,00"

### Estados de UI
- [ ] **[VISUAL]** `isPending` → spinner; lista vazia → sem empty-state explicito (ver Nota 5)

---

## 2. Tags VIP / ANIVERSÁRIO

Arquivo: `ClientsPage.getClientTags` (VIP_THRESHOLD 500, BIRTHDAY_ALERT_DAYS 7).

- [ ] **[AUTO:vitest]** `totalSpent >= 500` → tag VIP (verde #8FA98A); `< 500` → sem VIP
- [ ] **[AUTO:vitest]** birthday dentro de 7 dias (ano corrente ou proximo) → tag ANIVERSÁRIO (dourado #d9b869)
- [ ] **[AUTO:integ-auth]** **Com seeds atuais: NENHUM cliente e VIP** (maior total = Renata 210,30 < 500). Só **Mariana Alves** recebe ANIVERSÁRIO (birthday 23/07, 3 dias apos 2026-07-20). Ver Nota 2
- [ ] **[AUTO:vitest]** Cliente **sem birthday** (null) → nunca recebe ANIVERSÁRIO (guard `if (birthday)`)
- [ ] **[AUTO:vitest]** **Empate de tags** (totalSpent >= 500 E birthday <= 7 dias) → ambas exibidas, VIP antes de ANIVERSÁRIO (ordem de push). Requer cliente sintetico com >= 500 + aniversario proximo (nao ocorre nos seeds)
- [ ] **[AUTO:vitest]** Borda de virada de ano: aniversario ja passou este ano → usa proximo ano; ainda assim só marca se <= 7 dias

---

## 3. Cadastro de cliente no picker (sem duplicacao)

Arquivos: `ClientPicker`, `useCreateClient`.

- [ ] **[MANUAL]** Bottom sheet: backdrop blur 3px, clicar fora fecha; "Cadastrar novo cliente" faz toggle do form
- [ ] **[AUTO:integ-auth]** Salvar novo cliente → INSERT em `clients` → onSuccess **seleciona o cliente criado** (usa data do insert) → fecha picker → invalida `['clients']`
- [ ] **[AUTO:vitest]** Sem duplicacao: o cliente selecionado vem do retorno do insert (id real), nao de objeto local com id fabricado; ao reabrir picker ele aparece 1x na lista (via refetch)
- [ ] **[AUTO:vitest]** Nome vazio (trim) → no-op (nao chama mutation)
- [ ] **[VISUAL]** Botao "Salvando..." enquanto `createClient.isPending`
- [ ] **[AUTO:integ-auth]** Busca filtra clientes reais por nome case-insensitive
- [ ] **[MANUAL]** Selecionar cliente existente → seta no checkout e fecha

---

## 4. Venda completa via RPC create_sale (happy path E2E)

Arquivos: `NewSalePage.handleConfirmSale`, `useCreateSale`, `ConfirmButton`.

- [ ] **[AUTO:integ-auth]** E2E: adicionar 2 produtos → checkout → selecionar cliente → escolher Pix → confirmar → RPC `create_sale` insere sale + sale_items → toast "Venda registrada com sucesso"
- [ ] **[AUTO:integ-auth]** `create_sale` calcula total e items_count **server-side** (client envia só product_id/quantity/unit_price)
- [ ] **[AUTO:integ-auth]** Trigger decrementa estoque: produto com stock 24, vendido 2 → stock 22 (verificavel no catalogo/estoque apos invalidate)
- [ ] **[AUTO:integ-auth]** onSuccess invalida `['sales']`, `['products']`, `['clients']` (cadeia de derivados)
- [ ] **[VISUAL]** Overlay "Venda registrada" com total, cliente e pagamento corretos; `resetAfterSale` limpa carrinho
- [ ] **[MANUAL]** "Nova venda" no overlay → carrinho vazio, step produtos

### Venda para Consumidor final (SEM cliente)
- [ ] **[AUTO:vitest]** `ConfirmButton.canConfirm = !!payment && cartCount > 0 && !loading` — **NAO exige cliente**. UI **permite** venda sem cliente selecionado
- [ ] **[AUTO:integ-auth]** Confirmar sem cliente → `p_client_id = null` → venda avulsa; overlay/historico mostram "Consumidor final". Ver Nota 3 (confirmar se e desejado que a UI permita)

### Estados de UI (isConfirming)
- [ ] **[VISUAL]** Durante a confirmacao: label "Registrando venda...", botao disabled (`loading` → canConfirm false)
- [ ] **[AUTO:vitest]** `onSettled` seta `isConfirming` false (sucesso ou erro)

---

## 5. Edge cases da venda

- [ ] **[AUTO:integ-auth]** **Estoque insuficiente:** vender quantidade > stock → RPC EXCEPTION 'Estoque insuficiente' → toast "Estoque insuficiente para um dos produtos" → **carrinho mantido** (resetAfterSale só roda onSuccess), isConfirming volta a false
- [ ] **[AUTO:integ-auth]** Venda com **produto soft-deleted** (active=false) entre selecao e confirmacao: FK product_id ainda valida (produto existe, só inativo) → venda passa; validar se e aceitavel vender inativo
- [ ] **[MANUAL]** Falha de rede na RPC → onError toast generico, carrinho mantido, sem overlay
- [ ] **[AUTO:vitest]** handleConfirmSale com cartCount 0 ou sem payment → no-op (guard)

---

## 6. Historico real

Arquivo: `HistoryPage`, `useSales`.

- [ ] **[AUTO:integ-auth]** `useSales` lista vendas **nao-estornadas** (refunded_at null) ordenadas por created_at desc
- [ ] **[AUTO:integ-auth]** Cards Hoje/Mês calculados do banco: em 2026-07-20 → Hoje R$ 420,60 / 4 vendas; "Este mês" = soma de julho/2026 (todas as 6 = R$ 660,80). Ver Nota 1
- [ ] **[AUTO:vitest]** `formatSaleDate`: hoje → "Hoje", ontem → "Ontem", senao "DD/MM"; hora HH:MM
- [ ] **[AUTO:vitest]** `getClientName`: client_id null → "Consumidor final"; id nao encontrado (cliente removido) → "Cliente removido"
- [ ] **[AUTO:vitest]** Pluralizacao "1 item" (singular, venda 3 e 6) vs "3 itens" (venda 1); pagamento abreviado ('Cartão de crédito' → 'Credito')
- [ ] **[VISUAL]** Loading spinner; iniciais do cliente no avatar

---

## 7. Estorno (admin-only)

Arquivos: `HistoryPage` (botao RotateCcw), `useCancelSale`.

- [ ] **[AUTO:integ-auth]** Admin clica estornar → RPC `cancel_sale` → seta refunded_at + **restaura estoque** de cada item → invalida sales/products/clients → toast "Venda estornada" → venda **some da lista** (query filtra refunded_at null)
- [ ] **[AUTO:integ-auth]** Estoque restaurado: estornar venda com 2 un. de um produto → stock volta +2
- [ ] **[AUTO:integ-auth]** Estorno recalcula derivados do cliente (totalSpent cai) — visivel na tela Clientes apos invalidate
- [ ] **[VISUAL]** Botao estornar (RotateCcw, danger) visivel **só para admin**; disabled enquanto isPending

### Permissoes
- [ ] **[AUTO:vitest]** Employee: botao estornar (Historico) e botao excluir (Clientes) NAO renderizam (isAdmin false)
- [ ] **[AUTO:integ-auth]** Employee que burlar a UI e chamar `rpc('cancel_sale')` → EXCEPTION 'Apenas admin pode estornar vendas' → onError toast
- [ ] **[AUTO:integ-auth]** Employee chamando `rpc('soft_delete_client')` → EXCEPTION 'Apenas admin pode excluir clientes'
- [ ] **[AUTO:integ-auth]** Estornar venda ja estornada → EXCEPTION 'Venda ja estornada'

---

## 8. Soft delete de cliente (admin-only)

Arquivos: `ClientsPage` (botao), `useSoftDeleteClient`.

- [ ] **[AUTO:integ-auth]** Admin exclui cliente → RPC `soft_delete_client` → active=false → some da lista → permanece no banco
- [ ] **[VISUAL]** Botao lixeira só para admin; disabled enquanto isPending
- [ ] **[AUTO:integ-auth]** Vendas do cliente removido continuam no historico como "Cliente removido" (clientMap nao acha o id)

---

## 9. Integracao / invalidations em cadeia

- [ ] **[AUTO:integ-auth]** Registrar venda → estoque do produto cai no **catalogo de venda, tela Estoque e lowStock do Dashboard** (invalidate ['products'])
- [ ] **[AUTO:integ-auth]** Registrar venda com cliente → totalSpent/lastPurchase do cliente atualizam (invalidate ['clients'])
- [ ] **[MANUAL]** Registrar venda → **reload da pagina** → venda persiste no historico, estoque persiste (dados do banco)
- [ ] **[AUTO:vitest]** `DataContext` e fachada TanStack: products/clients/sales vem dos hooks; sem estado mock em memoria
- [ ] **[MANUAL]** Anon nao alcanca as telas (ProtectedRoute) e RLS bloqueia queries diretas (coberto em F2S1)

---

## Resumo de cobertura

| Secao | vitest | integ-auth | VISUAL/MANUAL |
|-------|--------|-----------|---------------|
| Clientes/derivados | 3 | 2 | 2 |
| Tags VIP/ANIVERSÁRIO | 5 | 1 | 0 |
| Cadastro no picker | 2 | 2 | 3 |
| Venda create_sale | 3 | 5 | 3 |
| Edge cases venda | 1 | 2 | 1 |
| Historico | 3 | 2 | 1 |
| Estorno | 2 | 5 | 1 |
| Soft delete cliente | 0 | 2 | 1 |
| Integracao/cadeia | 1 | 2 | 2 |

**Prioridade QA:** (1) E2E venda completa com decremento de estoque + invalidations em cadeia; (2) estoque insuficiente mantendo carrinho; (3) estorno admin restaura estoque + RPC negando employee; (4) derivados batendo com seeds; (5) `[AUTO:vitest]` de tags, getClientName e pluralizacao.

## Notas para Code Reviewer / PO
1. **Dependencia de data real vs seeds fixos (impacto em QA):** "Hoje"/"Este mês" no Historico e Dashboard usam `new Date()`. Os seeds de vendas estao datados 2026-07-20/19. Fora de 2026-07-20, "Hoje" = 0 e as 4 vendas do seed aparecem como "20/07". O numero R$ 420,60/4 vendas só aparece se o QA rodar em 2026-07-20 OU registrar vendas novas. Considerar seeds com data relativa (`now()`) ou documentar a dependencia no runbook de QA.
2. **Nenhum cliente e VIP com os seeds atuais:** VIP_THRESHOLD = 500, mas o maior totalSpent derivado e Renata 210,30. A tag VIP nunca aparece com o seed — diverge do prototipo da fase 1 (Patricia era VIP com 512,00 hardcoded). Para testar VIP, o QA precisa de um cliente com vendas somando >= 500. Confirmar se o seed deveria produzir ao menos 1 VIP.
3. **VIP_THRESHOLD e BIRTHDAY_ALERT_DAYS hardcoded na ClientsPage** (500 e 7), enquanto `store_settings.vip_threshold`/`birthday_alert_days` existem no banco com os mesmos valores. Duplicacao — se o admin mudar em store_settings, a UI nao acompanha. Considerar ler de store_settings.
4. **Venda para Consumidor final permitida:** o ConfirmButton nao exige cliente (so pagamento + itens). Isso habilita venda avulsa (client_id null) — coerente com o schema (client_id nullable) e o seed (venda 6). Confirmar que a UI permitir venda sem cliente e intencional (na fase 1 o botao exigia cliente).
5. **ClientsPage/StockPage/HistoryPage sem empty-state:** listas vazias renderizam area em branco. Mesma observacao do F2S3 — considerar mensagem de estado vazio e tratamento de isError nas 3 telas.
6. **useCreateSale cast `p_items as unknown as string`:** workaround de tipagem para passar o array jsonb a `supabase.rpc`. Funciona (Supabase serializa), mas o cast mascara o tipo real. Considerar tipar o RPC via gen types ou aceitar `Json`.
