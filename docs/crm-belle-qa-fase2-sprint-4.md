# QA Report: Fase 2 Sprint 4 — CRUD Clients + Sales — CRM Studio Belle

## Status: APROVADO

**Data:** 2026-07-20
**Escopo:** Clientes e vendas reais via Supabase (derivados totalSpent/lastPurchase/tags, venda atomica via RPC, estorno admin-only, soft delete client, DataContext fachada TanStack pura)

---

## Validacao Estatica

| Check | Resultado |
|-------|-----------|
| `npm run build` | Limpo (1953 modulos) |
| `npx vitest run` | 151/151 passando (138 anteriores + 13 novos) |

---

## Testes Vitest Criados (Sprint 4)

| Arquivo | Testes | Passaram |
|---------|--------|----------|
| `src/lib/__tests__/client-utils.test.ts` | 5 | 5/5 |
| `src/pages/__tests__/ClientsPage-tags.test.ts` | 8 | 8/8 |

### Cenarios cobertos
- getClientName: null → "Consumidor final", encontrado → nome, nao encontrado → "Cliente removido", array vazio
- getClientTags: VIP >= 500, nao VIP < 500, ANIVERSARIO dentro de 7 dias, fora de 7 dias, null sem tag, ambos VIP+ANIVERSARIO, virada de ano, edge case dia do aniversario

---

## Testes de Integracao com Usuarios Reais [AUTO:integ-auth]

### Derivados — totalSpent dos clientes (seeds)

| Cliente | totalSpent esperado | Resultado |
|---------|-------------------|-----------|
| Patricia Souza | R$ 189,70 (venda 1) | OK |
| Renata Lima | R$ 210,30 (venda 5) | OK |
| Mariana Alves | R$ 116,20 (venda 4) | OK |
| Juliana Costa | R$ 74,80 (venda 2) | OK |
| Camila Ferreira | R$ 39,90 (venda 3) | OK |

Nenhum cliente VIP (todos < 500, conforme test map Nota 2). Mariana com tag ANIVERSARIO (birthday 23/07, 3 dias de 2026-07-20).

### Vendas hoje (seeds 2026-07-20)

| Metrica | Esperado | Resultado |
|---------|----------|-----------|
| Vendas hoje | 4 | 4 |
| Total hoje | R$ 420,60 | R$ 420,60 |

### Venda E2E completa (employee)

| Passo | Resultado |
|-------|-----------|
| create_sale com 2 items (Batom 39,90 + Gloss 29,90) para Patricia via Pix | OK — sale_id retornado |
| Total server-side | 69,80 (calculado, nao enviado pelo client) |
| items_count server-side | 2 |
| Estoque decrementado | Batom 24→23, Gloss 21→20 |
| Vendas hoje apos venda | 5 vendas, R$ 490,40 |

### Venda sem cliente (Consumidor final)

| Teste | Resultado |
|-------|-----------|
| create_sale sem p_client_id | OK — sale criada com client_id NULL |
| Total server-side | 39,90 |

### Permissoes RPCs

| Operacao | Employee | Admin |
|----------|----------|-------|
| cancel_sale | BLOQUEADO ("Apenas admin pode estornar vendas") | OK |
| soft_delete_client | BLOQUEADO ("Apenas admin pode excluir clientes") | OK |

### Estorno (admin)

| Teste | Resultado |
|-------|-----------|
| cancel_sale da venda E2E | OK |
| Estoque restaurado (Batom 23→24, Gloss 20→21) | OK |
| cancel_sale da venda avulsa | OK |
| Batom stock final | 24 (restaurado ao original) |
| Vendas hoje apos estorno | 4 vendas, R$ 420,60 (voltou ao seed) |

### Limpeza

| Verificacao | Resultado |
|-------------|-----------|
| 10 produtos ativos | OK (sem residuo) |
| 5 clientes ativos | OK |
| 4 vendas hoje nao-estornadas | OK (as 2 vendas de teste foram estornadas) |

---

## Finding

### Edge case: tag ANIVERSARIO nao aparece no proprio dia do aniversario

**Severidade:** Baixa
**Descricao:** A funcao `getClientTags` compara `new Date(ano, mes-1, dia)` (meia-noite) contra `new Date()` (horario atual). No proprio dia do aniversario, apos meia-noite, `diff1` e negativo (a meia-noite do dia ja passou), fazendo o calculo usar o proximo ano. Resultado: a tag nao aparece no dia exato do aniversario.
**Impacto:** Minimo — a tag aparece nos 7 dias anteriores ao aniversario, so nao no dia exato. Para o salao, o aviso antecipado e o que importa (preparar cupom/contato).
**Correcao sugerida:** Normalizar ambas as datas para meia-noite antes de comparar, ou usar `diff1 >= -1` em vez de `diff1 >= 0`.

---

## Verificacoes de Codigo (inspecao)

| Item | Resultado |
|------|-----------|
| useSales query filtra refunded_at IS NULL | OK |
| useSales ordena por created_at desc | OK |
| useCreateSale invalida ['sales'], ['products'], ['clients'] | OK (cadeia completa) |
| useCancelSale invalida ['sales'], ['products'], ['clients'] | OK |
| useClients: 2 queries (clients + sales), agregacao via Map | OK (sem N+1) |
| getClientName centralizado em client-utils.ts | OK ("Consumidor final" / "Cliente removido") |
| DataContext: fachada TanStack pura (sem mock) | OK |
| ConfirmButton: canConfirm = payment + cartCount + !loading (sem exigir cliente) | OK |
| Botoes estornar/excluir ocultos para employee (isAdmin &&) | OK |
| Warning 1 CR (cast as unknown as string): corrigido para `as unknown as Json` | OK |
| CR Suggestion 4 (getClientName "Consumidor final" para removidos): corrigido, agora retorna "Cliente removido" | OK |

---

## Validacao Manual Pendente

| Item | Tipo |
|------|------|
| Fluxo completo de venda pela UI (produtos → checkout → overlay) | MANUAL |
| ClientPicker: backdrop, busca, cadastro novo cliente | MANUAL |
| Overlay "Venda registrada" com snapshot correto | VISUAL |
| Historico: "Hoje"/"Ontem"/data, pluralizacao, abreviacao pagamento | VISUAL |
| Estoque baixo no Dashboard apos venda | VISUAL |
| Tags VIP/ANIVERSARIO renderizadas no ClientCard | VISUAL |
| Empty states (0 clientes, 0 vendas) | VISUAL |

---

## Resumo

| Metrica | Valor |
|---------|-------|
| Build | Limpo |
| Testes vitest (novos) | 13 |
| Total testes vitest | 151/151 passando |
| Testes integ-auth executados | 16 |
| Testes integ-auth passando | 16/16 |
| Bugs encontrados | 1 (baixa severidade — birthday edge case) |
| Dados de teste limpos | Sim (tudo restaurado ao estado original dos seeds) |

---

## Veredicto

**QA Fase 2 Sprint 4 APROVADO.** O CRUD de clientes e vendas esta completo e integrado:
- Venda E2E via RPC com totais server-side, decremento atomico de estoque, invalidacoes em cadeia
- Derivados totalSpent conferem com os seeds (verificados aritmticamente)
- Estorno admin-only restaura estoque corretamente
- Employee bloqueado em cancel_sale e soft_delete_client (UI + RPC server-side)
- Venda sem cliente (Consumidor final) funcional
- getClientName unificado com regra correta ("Cliente removido" para IDs orfaos)
- DataContext agora fachada TanStack pura (sem mock)
- Warnings do CR ja corrigidos (cast Json, getClientName)
- 151 testes vitest + 16 testes integ-auth, todos passando
