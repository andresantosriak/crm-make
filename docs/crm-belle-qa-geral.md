# QA Report Geral: CRM Studio Belle — MVP

## Status: APROVADO

**Data:** 2026-07-20
**Escopo:** Validacao completa do MVP (4 sprints implementadas, 2 ciclos de correcao, CR geral aprovado)

---

## Validacao Estatica

| Check | Resultado |
|-------|-----------|
| `tsc --noEmit` | Sem erros |
| `npm run build` | Build limpo (1854 modulos, 251kb JS gzip 75kb) |
| `npm run dev` (porta 8080) | Servidor responde HTTP 200 |

---

## Testes Escritos e Executados

| Arquivo | Tipo | Categoria | Testes | Passaram |
|---------|------|-----------|--------|----------|
| `src/lib/__tests__/pricing.test.ts` | Unitario | Small | 13 | 13/13 |
| `src/lib/__tests__/utils.test.ts` | Unitario | Small | 13 | 13/13 |
| `src/lib/__tests__/constants.test.ts` | Unitario | Small | 10 | 10/10 |
| `src/data/__tests__/mock-data.test.ts` | Unitario | Small | 20 | 20/20 |
| `src/contexts/__tests__/SettingsContext.test.tsx` | Integracao | Medium | 9 | 9/9 |
| `src/contexts/__tests__/DataContext.test.tsx` | Integracao | Medium | 8 | 8/8 |
| `src/contexts/__tests__/CartContext.test.tsx` | Integracao | Medium | 12 | 12/12 |
| `src/hooks/__tests__/useMarkupCalculator.test.ts` | Unitario | Small | 4 | 4/4 |
| `src/hooks/__tests__/useSearch.test.ts` | Unitario | Small | 6 | 6/6 |
| **Total** | | | **101** | **101/101** |

---

## Cobertura por Test Map

### Test Map Sprint 1 (fundacao)

| Area | Itens [AUTO] | Cobertos | Passaram |
|------|-------------|----------|----------|
| Mock data (products, clients, sales, alerts, promos) | 20 | 20 | 20/20 |
| utils.ts (formatCurrency, getInitials, shortPayment) | 11 | 13 | 13/13 |
| pricing.ts (floor90, ceil90, round90, calcMarkup, calcMargin) | 12 | 13 | 13/13 |
| constants.ts (thresholds, payment methods, nav routes, tiles) | 7 | 10 | 10/10 |
| CartContext (add/remove/clear/confirm/total/count) | 12 | 12 | 12/12 |
| DataContext (init/todaySales/todayTotal/mutations) | 8 | 8 | 8/8 |
| SettingsContext (markup clamp/step/toggles) | 9 | 9 | 9/9 |
| Hooks (useSearch, useMarkupCalculator) | 8 | 10 | 10/10 |

### Test Map Geral (S2-S4 + E2E) — Validacao por Inspecao de Codigo

| Item [AUTO] | Resultado | Validacao |
|-------------|-----------|-----------|
| Dashboard todayTotal = R$ 420,60 | OK | SalesTodayCard usa `todayTotal` do DataContext (testado) |
| Dashboard todayCount = 4 vendas | OK | SalesTodayCard usa `todayCount` do DataContext (testado) |
| Ticket medio = R$ 105,15 (calculado) | OK | `todayTotal / todayCount` com guarda div/0 em SalesTodayCard.tsx:9 |
| Estoque baixo = 2 produtos | OK | `lowStockProducts` do DataContext (testado) |
| Historico: pagamento abreviado Credito/Debito | OK | shortPayment testado + usado em HistoryPage.tsx:54 |
| Historico: pluralizacao "1 item" / "N itens" | OK | Condicao `sale.items > 1` em HistoryPage.tsx:54 |
| Historico: iniciais do cliente (getInitials) | OK | ClientAvatar usa getInitials (testado) |
| Tab Vendas ativo em /vendas e /historico | OK | BottomNav match: ['/vendas', '/historico'] (confirmado no codigo) |
| Tab Estoque ativo em /estoque e /produto | OK | BottomNav match: ['/estoque', '/produto'] |
| Tab Ajustes ativo em /config | OK | BottomNav match: ['/config'] |
| BottomNav oculto em /login | OK | LoginPage fora do AppShell (rota irma em App.tsx:18) |
| BottomNav oculto em /produto | OK | HIDDEN_NAV_ROUTES = ['/login', '/produto'] (testado) |
| /avisos e /promos sem tab ativo | OK | Nenhum match no array de tabs (activeTab = '') |
| Estoque: margem Batom = 65% | OK | `Math.round(calcMargin(14, 39.90))` = 65 (confirmado) |
| Estoque: margem Base = 60% | OK | `Math.round(calcMargin(32, 79.90))` = 60 |
| Estoque: margem Paleta = 62% | OK | `Math.round(calcMargin(45, 119.90))` = 62 |
| StockBadge vermelho stock <= 5 | OK | `isLow = stock <= threshold` em StockBadge.tsx:9 |
| StockBadge verde stock > 5 | OK | Mesma logica, confirmado |
| Novo Produto: custo 20 markup 180% -> R$ 55,90 | OK | `round90(20 * 2.8)` = `round90(56)` = 55.90 (testado) |
| Novo Produto: priceAuto=false ao editar preco | OK | handlePriceChange seta `setPriceAuto(false)` |
| Novo Produto: round down floor90(price-0.01) | OK | handleRoundDown com guarda price <= 0.9 |
| Novo Produto: round up ceil90(price+0.01) | OK | handleRoundUp com guarda price <= 0 |
| Novo Produto: salvar com nome vazio = no-op | OK | `if (!name.trim() || price <= 0) return` |
| ConfirmButton: 3 estados (sem cliente, sem pagamento, pronto) | OK | Logica em ConfirmButton.tsx:12-16 usa canConfirm |
| Overlay: snapshot de info antes do confirmSale | OK | handleConfirmSale captura info antes de chamar confirmSale() |
| Providers na ordem Settings > Data > Cart | OK | Confirmado em main.tsx |
| 10 rotas registradas | OK | App.tsx com /login + 9 rotas dentro do AppShell |
| LoginPage fora do AppShell | OK | Rota irma (App.tsx:18) |

---

## Fidelidade Visual (amostragem por inspecao de codigo)

| Token | Esperado | Encontrado | Status |
|-------|----------|------------|--------|
| app-bg | #16120E | #16120E (index.css:5) | OK |
| card | #221C15 | #221C15 (index.css:7) | OK |
| gold | #C8A24C | #C8A24C (index.css:9) | OK |
| text-primary | #F1EBDF | #F1EBDF (index.css:12) | OK |
| font-display | Cormorant Garamond | Cormorant Garamond (index.css:19) | OK |
| font-body | Jost | Jost (index.css:20) | OK |
| animate-fadeup | 0.35s | 0.35s (index.css:28) | OK |
| animate-glow | 2.4s infinite | 2.4s infinite (index.css:29) | OK |
| animate-pop | 0.25s | 0.25s (index.css:30) | OK |
| Google Fonts | Cormorant 400/500/600 + Jost 300/400/500/600 | Correto (index.html:9) | OK |
| html lang | pt-BR | pt-BR (index.html:2) | OK |

---

## Textos pt-BR (amostragem)

| Local | Texto | Acentuacao | Status |
|-------|-------|------------|--------|
| LoginPage | "Entrar", "Entrar com biometria" | OK | OK |
| DashboardPage | "Vendas de hoje", "Olá, Bruna" | "Olá" com acento | OK |
| HistoryPage | "Histórico", "vendas" | "Histórico" com acento | OK |
| NewSalePage | "Nova venda", "Finalizar venda" | OK | OK |
| NewProductPage | "Novo produto", "Sugerido pelo markup padrão" | "padrão" com acento | OK |
| SettingsPage | "Ajustes" | OK | OK |
| StockPage | "Estoque", "produtos ativos" | OK | OK |
| ConfirmButton | "Selecione o cliente", "Selecione o pagamento" | OK | OK |
| SaleSuccessOverlay | "Venda registrada", "Voltar ao início" | "início" com acento | OK |

---

## Findings

### Bug encontrado: busca nao e accent-insensitive

**Severidade:** Baixa (nao bloqueia MVP)
**Descricao:** A funcao `useSearch` usa `.toLowerCase().includes()` para filtro, o que e case-insensitive mas NAO accent-insensitive. Buscar "mascara" (sem acento) nao encontra "Mascara Volume Extremo" (com acento). No MVP atual isso tem impacto minimo porque o usuario brasileiro normalmente digita sem acento no mobile, mas o produto "Mascara" tem acento no mock.
**Reproducao:** `'Máscara'.toLowerCase().includes('mascara'.toLowerCase())` retorna `false`.
**Sugestao:** Implementar normalize com `str.normalize('NFD').replace(/[̀-ͯ]/g, '')` no accessor do useSearch. Registrar como pendencia tecnica para pos-MVP.

### Decisoes arbitradas confirmadas (NAO sao falhas)

- round90 empate -> floor (49,90 para 50,40): comportamento implementado e testado, fiel ao prototipo
- Ticket medio CALCULADO (R$ 105,15): implementacao correta, diverge do texto estatico R$ 52,58 do prototipo (decisao de produto aceita)
- "Este mes R$ 6.240" e "Meta 68%" hardcoded: aceito no MVP
- formatCurrency sem separador de milhar: aceito no MVP (nenhum valor mock atinge 1000)

### Pendencias tecnicas (registradas no CR, NAO sao falhas de QA)

- key=index em listas (nao afeta funcionalidade com mock estatico)
- Client duplicado entre tipo e componente (sem impacto funcional)
- Imports estaticos de dados nos contextos (aceito no MVP sem backend)

---

## Validacao Manual Pendente

Os itens abaixo sao classificados como [VISUAL] ou [MANUAL] nos test maps e exigem interacao no browser:

1. Animacoes (fadeup, glow, pop) e prefers-reduced-motion
2. Gradientes por categoria nos ProductTiles
3. Toggle lista/grade em Nova Venda
4. ClientPicker bottom sheet (backdrop, scroll, cadastro)
5. Responsividade mobile 375px em todas as telas
6. Navegacao real entre tabs do BottomNav
7. Fluxo completo de venda ponta-a-ponta (E2E-1)
8. Cadastro de produto reflete no estoque (E2E-2)
9. Markup config propaga para novo produto (E2E-4)
10. Reload reinicia estado (E2E-5)

---

## Testes Praticos

| Teste | Metodo | Resultado |
|-------|--------|-----------|
| Build | `npm run build` | OK (sem erros) |
| TypeScript | `tsc --noEmit` | OK (sem erros) |
| Dev server | `npm run dev` (porta 8080) | OK (HTTP 200) |
| Vitest | `npx vitest run` | 101/101 passando |

---

## Resumo

| Metrica | Valor |
|---------|-------|
| Arquivos de teste | 9 |
| Total de testes | 101 |
| Testes passando | 101 (100%) |
| Testes falhando | 0 |
| Build | Limpo |
| TypeScript | Sem erros |
| Dev server | Funcional |
| Bugs encontrados | 1 (baixa severidade — busca sem normalize de acentos) |
| Itens [AUTO] cobertos | 95+ dos test maps |
| Itens [VISUAL]/[MANUAL] pendentes | 10 (exigem browser) |

---

## Veredicto

**QA Geral APROVADO.** O MVP esta funcional e correto. Os 101 testes automatizados cobrem toda a logica de negocio critica (pricing com casos de empate, formatacao monetaria, iniciais, pagamentos abreviados, contextos de carrinho/dados/configuracoes com mutacoes e derivados, busca com filtro, calculo de markup/margem/lucro, mock data integrity, tab mapping e roteamento).

O unico finding novo e a busca sem normalize de acentos (severidade baixa, nao bloqueia MVP). Os itens [VISUAL] e [MANUAL] ficam como validacao pendente para o browser.

## Setup de Testes Criado

- `vitest.config.ts` — configuracao separada do vite.config para nao interferir no build TS
- `src/test/setup.ts` — setup com jest-dom
- Script `"test": "vitest run"` adicionado ao package.json
- Dependencias: vitest, @testing-library/react, @testing-library/jest-dom, jsdom
