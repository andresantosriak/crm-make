# Test Map Geral — Sprints 2, 3, 4 + Fluxos E2E — CRM Studio Belle

> Roteiro de testes para o MVP completo (65 arquivos, build limpo). Cobre as telas de entrada/informacao (S2), fluxo de vendas (S3), gestao (S4) e fluxos ponta-a-ponta.
> Complementa `docs/crm-belle-test-map-sprint-1.md` (fundacao: tokens, mock data, libs, contexts, nav).
> Classificacao: **[AUTO]** (Vitest/RTL) · **[VISUAL]** (browser) · **[MANUAL]** (interacao manual).
> Sem backend/Supabase — sem secao RLS. Estado em memoria (nao persiste em reload).

**Gerado em:** 2026-07-20 · **Base:** PRD v1, Backlog S2-S4, codigo em `src/pages` + `src/components`.

---

# SPRINT 2 — Telas de Entrada e Informacao

## 2.1 Login (`/login`)

Arquivo: `src/pages/LoginPage.tsx`.

### Fluxo principal
- [ ] **[VISUAL]** Logo circular "PG" dourado (Cormorant 32px) com borda gradiente + titulo "Studio Bell PG" + subtitulo "Make" uppercase tracking 2px
- [ ] **[VISUAL]** Campo e-mail pre-preenchido `contato@studiobellpg.com` (defaultValue, uncontrolled)
- [ ] **[VISUAL]** Campo senha pre-preenchido `123456` com `type="password"` (mascara de pontos)
- [ ] **[MANUAL]** Botao "Entrar" (gradiente dourado) navega para Dashboard `/`
- [ ] **[MANUAL]** Link "Entrar com biometria" tambem navega para `/`
- [ ] **[VISUAL]** Animacao fadeup ao montar a tela
- [ ] **[AUTO]** BottomNav NAO renderiza em `/login` (rota fora do AppShell)

### Edge cases
- [ ] **[MANUAL]** Nenhuma validacao: entra mesmo com campos apagados (login e visual, sem auth)

### Responsividade
- [ ] **[VISUAL]** Centralizado vertical em 375px e 768px, padding lateral 34px, sem scroll horizontal

---

## 2.2 Dashboard (`/`)

Arquivos: `DashboardPage.tsx` + `dashboard/{SalesTodayCard,StatsCards,QuickActions,SophiaSuggestions,LowStockSection}.tsx`.

### Fluxo principal — dados calculados
- [ ] **[AUTO]** Card "Vendas de hoje" exibe `todayTotal` = **R$ 420,60** (soma das 4 vendas `date==='Hoje'`)
- [ ] **[AUTO]** Linha "4 vendas" (todayCount dinamico)
- [ ] **[AUTO]** Ticket medio = `todayTotal/todayCount` = 420,60/4 = **R$ 105,15** (calculado). **ATENCAO: PRD/prototipo mostra R$ 52,58 fixo — divergencia, reportar ao PO.**
- [ ] **[VISUAL]** "Este mes R$ 6.240" + "↑ 12% vs. jun" (verde, hardcoded)
- [ ] **[VISUAL]** "Meta do mes 68%" + barra de progresso com width 68% (gradiente dourado)
- [ ] **[AUTO]** Estoque baixo lista exatamente 2 produtos (stock <= 5): Mascara Volume Extremo (3), Blush Pessego (2)

### Navegacao
- [ ] **[MANUAL]** Card "Vendas de hoje" inteiro clicavel → `/historico`
- [ ] **[MANUAL]** Botao sino (badge vermelho) → `/avisos`
- [ ] **[MANUAL]** Quick Actions (grid 2x2): Nova venda → `/vendas`, Novo produto → `/produto`, Promocoes → `/promos`, Clientes → `/clientes`
- [ ] **[MANUAL]** Sophia card 1 "Criar combo" → `/promos`; card 2 "Enviar cupom" → `/clientes`
- [ ] **[MANUAL]** "Ver tudo" do estoque baixo → `/estoque`

### Estados de UI
- [ ] **[VISUAL]** Dot da Sophia pulsa (animate-glow)
- [ ] **[VISUAL]** Avatar "B" com borda dourada; badge vermelho no sino
- [ ] **[AUTO]** Tab "Inicio" ativo (cor #C8A24C) na rota `/`

### Edge case
- [ ] **[AUTO]** Se todayCount fosse 0, ticket medio = R$ 0,00 (guarda evita divisao por zero) — validar via mock alternativo

### Responsividade
- [ ] **[VISUAL]** Grid quick actions 2 colunas em 375px; cards duplos lado a lado sem overflow

---

## 2.3 Avisos (`/avisos`)

Arquivo: `AlertsPage.tsx` + `data/alerts.ts`.

### Fluxo principal
- [ ] **[AUTO]** Renderiza exatamente 4 avisos
- [ ] **[VISUAL]** Dot + label por tipo: Estoque #D07C67 (2x), "Sophia · IA" #C8A24C (1x), Cliente #8FA98A (1x)
- [ ] **[VISUAL]** Cada aviso: label uppercase (cor do dot) + texto + timestamp ("ha 20 min", "ha 2 h", "hoje")
- [ ] **[MANUAL]** Botao voltar → `/` (Dashboard)
- [ ] **[VISUAL]** BottomNav visivel (nenhum tab dourado — `/avisos` sem match)

### Responsividade
- [ ] **[VISUAL]** Lista legivel em 375px, texto com line-height 1.5

---

## 2.4 Configuracoes (`/config`)

Arquivos: `SettingsPage.tsx` + `settings/{ProfileCard,ToggleGroup,MarkupControl,ShopInfo}.tsx`.

### Perfil e loja
- [ ] **[VISUAL]** Card perfil: avatar "PG" borda dourada + "Studio Bell PG · Make" + "Bruna · Plano Pro" + chevron
- [ ] **[VISUAL]** Secao Loja: "Formas de pagamento → Pix, Cartao", "Categorias de produto → 4", "Backup de dados → Sincronizado" (verde)

### Toggles (4)
- [ ] **[AUTO/MANUAL]** Estado inicial: Sugestoes promocao ON, Alertas estoque ON, Aniversarios ON, Resumo diario **OFF**
- [ ] **[MANUAL]** Clicar cada toggle inverte o estado (flip visual: gradiente dourado ON, cinza OFF)
- [ ] **[MANUAL]** Estado persiste durante a sessao (context), reseta em reload

### Markup padrao (MarkupControl)
- [ ] **[VISUAL]** Valor central inicial "180%" (Cormorant 24px dourado)
- [ ] **[MANUAL]** Botao "+" incrementa 10 → 190%; "−" decrementa 10 → 170%
- [ ] **[AUTO]** Clamp: nao passa de 500% (MARKUP_MAX) nem abaixo de 0% (MARKUP_MIN)
- [ ] **[AUTO]** Exemplo live: "Custo R$ 20,00 → venda R$ 55,90" com markup 180% (`round90(20*2.8)=55.90`)
- [ ] **[AUTO]** Ao mudar markup para 200%: exemplo recalcula `round90(20*3)=60` → "R$ 60,90"? Validar: round90(60)=59.90 (empate→floor) → exibe "R$ 59,90"
- [ ] **[MANUAL]** Sair da conta (borda vermelha) → `/login`
- [ ] **[AUTO]** Tab "Ajustes" ativo na rota `/config`

### Integracao S2→S4
- [ ] **[MANUAL]** Alterar markup em Config para 200% → abrir Novo Produto → preco sugerido usa o novo markup (context compartilhado)

---

# SPRINT 3 — Fluxo de Vendas

## 3.1 Nova Venda — Passo 1 Produtos (`/vendas`)

Arquivo: `NewSalePage.tsx` (step 'produtos') + `product/{ProductListItem,ProductGridItem,CategoryChips}` + `sale/CartBar`.

### Fluxo principal
- [ ] **[AUTO]** Busca filtra produtos por nome case-insensitive ('batom' → Batom Matte Vermelho Rubi)
- [ ] **[AUTO]** Chips categoria: Todos, Labios, Rosto, Olhos — selecionar "Olhos" mostra so 3 produtos (Mascara, Paleta, Delineador)
- [ ] **[AUTO]** Busca + categoria combinam (categoryFiltered depois useSearch)
- [ ] **[MANUAL]** Toggle lista/grade alterna visualizacao
- [ ] **[MANUAL]** Modo lista: produto fora do carrinho mostra botao "+"; ao adicionar, vira controles "−/qtd/+"
- [ ] **[MANUAL]** Modo grade: clicar card adiciona; badge de quantidade aparece (animate-pop) e borda vira dourada
- [ ] **[MANUAL]** Botao relogio (header) → `/historico`

### Cart bar flutuante
- [ ] **[MANUAL]** CartBar aparece quando cartCount > 0 (animate-pop)
- [ ] **[AUTO]** CartBar mostra "N itens · R$ total" corretos (ex.: 2 itens de Batom 39,90 = R$ 79,80)
- [ ] **[MANUAL]** "Avancar" leva ao checkout (cart.setStep('checkout'))

### Edge cases
- [ ] **[MANUAL]** Decrementar item ate 0 remove do carrinho e some da lista de controles
- [ ] **[AUTO]** Busca sem match → nenhuma linha renderizada (lista vazia)
- [ ] **[MANUAL]** CartBar some quando carrinho volta a 0

### Responsividade
- [ ] **[VISUAL]** Grade 2 colunas em 375px; chips scrollaveis horizontal sem quebrar

---

## 3.2 Nova Venda — Passo 2 Checkout (`/vendas` step checkout)

Arquivo: `NewSalePage.tsx` (step 'checkout') + `sale/{CheckoutItemList,PaymentGrid,ConfirmButton}` + `client/ClientPicker`.

### Fluxo principal
- [ ] **[MANUAL]** Itens do carrinho listados com "Nx R$ = R$ subtotal" + controles +/-
- [ ] **[MANUAL]** Botao cliente abre ClientPicker (bottom sheet)
- [ ] **[MANUAL]** PaymentGrid 2x2: Pix, Cartao de credito, Cartao de debito, Dinheiro — mutuamente exclusivos
- [ ] **[AUTO]** Total calculado = soma(price*qty)
- [ ] **[MANUAL]** BackButton volta ao step produtos mantendo o carrinho

### ConfirmButton — 3 estados
- [ ] **[AUTO]** Sem cliente → label "Selecione o cliente", disabled (fundo #221C15, texto #7c7264)
- [ ] **[AUTO]** Com cliente, sem pagamento → "Selecione o pagamento", disabled
- [ ] **[AUTO]** Cliente + pagamento + itens → "Confirmar venda · R$ XX,XX", habilitado (gradiente dourado)
- [ ] **[AUTO]** `canConfirm` exige client && payment && cartCount > 0

### Estados de UI
- [ ] **[VISUAL]** Card cliente com borda dourada quando selecionado (rgba(200,162,76,.3))
- [ ] **[VISUAL]** Opcao de pagamento selecionada: fundo/texto/borda dourados

---

## 3.3 Client Picker (bottom sheet)

Arquivo: `client/ClientPicker.tsx`.

### Fluxo principal
- [ ] **[MANUAL]** Abre com backdrop blur 3px; clicar no backdrop fecha
- [ ] **[AUTO]** Busca filtra clientes por nome case-insensitive (5 clientes mock)
- [ ] **[MANUAL]** Clicar num cliente seleciona e fecha o picker (checkout atualiza)
- [ ] **[MANUAL]** "Cadastrar novo cliente" faz toggle do form (mostra/esconde)

### Cadastro novo cliente
- [ ] **[MANUAL]** Form: inputs Nome completo + Telefone (inputmode tel)
- [ ] **[AUTO]** "Salvar e selecionar" com nome vazio → no-op (`if(!name) return`)
- [ ] **[AUTO]** Salvar com nome valido → addClient insere no **inicio** da lista (last 'hoje', total 0, tag null), seleciona e fecha
- [ ] **[VISUAL]** max-height 78% da tela; lista scrollavel

### Edge case
- [ ] **[MANUAL]** Novo cliente aparece no topo da lista se reabrir o picker

---

## 3.4 Overlay Venda Registrada

Arquivo: `sale/SaleSuccessOverlay.tsx` + logica em `NewSalePage.handleConfirmSale`.

### Fluxo principal
- [ ] **[VISUAL]** Overlay fullscreen blur 4px; check verde em circulo (animate-pop) + fadeup
- [ ] **[AUTO]** Exibe total, "Cliente · nome" e "Pagamento · forma" capturados ANTES do confirmSale (info snapshot)
- [ ] **[AUTO]** confirmSale limpa carrinho (items {}, step produtos, client/payment null) e adiciona venda ao array
- [ ] **[MANUAL]** "Nova venda" → limpa saleSuccess + clearCart → volta ao step produtos vazio
- [ ] **[MANUAL]** "Voltar ao inicio" → `/` (carrinho ja limpo pelo confirmSale)

### Edge case
- [ ] **[AUTO]** Nova venda entra no inicio de `sales` com `date 'Hoje'`, `time 'agora'` → todayTotal e todayCount aumentam

---

## 3.5 Historico (`/historico`)

Arquivo: `HistoryPage.tsx`.

### Fluxo principal
- [ ] **[AUTO]** Card Hoje = R$ 420,60 + "4 vendas" (dinamico); card Este mes R$ 6.240 "↑ 12%" (fixo)
- [ ] **[AUTO]** Lista todas as vendas (6 mock, mais recentes no topo)
- [ ] **[AUTO]** Pagamento abreviado: "Cartao de credito"→"Credito", "Cartao de debito"→"Debito"
- [ ] **[AUTO]** Pluralizacao: "1 item" vs "3 itens" (sale.items > 1)
- [ ] **[AUTO]** Iniciais do cliente no avatar (getInitials): "Patricia Souza"→"PS", "Consumidor final"→"CF"
- [ ] **[MANUAL]** BackButton → `/vendas`
- [ ] **[AUTO]** Tab "Vendas" ativo na rota `/historico` (match compartilhado com /vendas)

---

# SPRINT 4 — Gestao

## 4.1 Estoque (`/estoque`)

Arquivo: `StockPage.tsx` + `shared/StockBadge`.

### Fluxo principal
- [ ] **[AUTO]** Lista todos os 10 produtos; header "10 produtos ativos" (products.length)
- [ ] **[AUTO]** Busca filtra por nome em tempo real (case-insensitive)
- [ ] **[AUTO]** Margem = `Math.round(calcMargin(cost, price))`: Batom (14/39,90) → 65%; Base Segunda Pele (32/79,90) → 60%; Paleta (45/119,90) → 62%
- [ ] **[AUTO]** StockBadge stock <= 5 vermelho (#D07C67, bg rgba(208,124,103,.16)); stock > 5 verde (#8FA98A)
- [ ] **[AUTO]** Badge exibe "{stock} un."
- [ ] **[MANUAL]** Botao "+" → `/produto`
- [ ] **[AUTO]** Tab "Estoque" ativo

### Edge cases
- [ ] **[AUTO]** stock exatamente 5 → vermelho (limite inclusivo `<=`)
- [ ] **[AUTO]** Busca sem match → lista vazia

---

## 4.2 Novo Produto (`/produto`)

Arquivo: `NewProductPage.tsx`.

### Fluxo principal — calculo live
- [ ] **[AUTO]** Digitar custo com priceAuto=true → preco sugerido = `round90(cost*(1+markup/100))`. Custo 20, markup 180% → **R$ 55,90**
- [ ] **[AUTO]** Editar preco manualmente → priceAuto=false; hint muda de "Sugerido pelo markup padrao de 180%" para "Preco ajustado manualmente"
- [ ] **[AUTO]** Markup exibido = `Math.round(markup)`: custo 20 / preco 55,90 → 180% (dourado, sobre o custo)
- [ ] **[AUTO]** Margem = `Math.round(margin)`: custo 20 / preco 55,90 → 64% (verde, sobre a venda)
- [ ] **[AUTO]** Lucro por unidade = profit = preco - custo = R$ 35,90
- [ ] **[AUTO]** Markup/Margem/Lucro exibem "—" quando custo OU preco = 0 (`hasCalc`)

### Botoes de arredondamento
- [ ] **[AUTO]** "↓ Arredondar" → `floor90(price - 0.01)`: preco 55,90 → 54,90 (nao fica no-op)
- [ ] **[AUTO]** "↑ Arredondar" → `ceil90(price + 0.01)`: preco 55,90 → 56,90
- [ ] **[AUTO]** "↓ Arredondar" com preco <= 0,90 → no-op (guarda)

### Categoria e validacao
- [ ] **[MANUAL]** Chips Labios/Rosto/Olhos mutuamente exclusivos (default 'Rosto')
- [ ] **[AUTO]** Salvar com nome vazio OU preco <= 0 → no-op
- [ ] **[MANUAL]** Inputs custo/preco inputmode decimal; aceitam virgula ('55,90' → 55.90 via replace)
- [ ] **[MANUAL]** Salvar valido → addProduct + navega `/estoque`
- [ ] **[AUTO]** BottomNav oculto em `/produto`; BackButton → `/estoque`

### Edge cases
- [ ] **[AUTO]** Custo "abc" (invalido) → parseFloat NaN → 0 → sem sugestao, valores "—"
- [ ] **[MANUAL]** Estoque vazio → parseInt NaN → salva com stock 0

---

## 4.3 Clientes (`/clientes`)

Arquivo: `ClientsPage.tsx` + `client/ClientCard`.

### Fluxo principal
- [ ] **[AUTO]** Lista os 5 clientes mock
- [ ] **[VISUAL]** Tag ANIVERSARIO em Mariana Alves (dourado #d9b869); tag VIP em Patricia Souza (verde #8FA98A)
- [ ] **[AUTO]** Juliana, Camila, Renata sem badge (tag null)
- [ ] **[AUTO]** Avatar com iniciais (getInitials); info "Ult. compra DD/MM · R$ total"
- [ ] **[AUTO]** Total formatado: Mariana R$ 340,50; Patricia R$ 512,00
- [ ] **[AUTO]** Tab "Clientes" ativo

### Responsividade
- [ ] **[VISUAL]** Cards legiveis em 375px; chevron a direita alinhado

---

## 4.4 Promocoes (`/promos`)

Arquivo: `PromosPage.tsx` + `promo/{PromoCard,SophiaIntroCard}`.

### Fluxo principal
- [ ] **[AUTO]** 3 cards de promocao
- [ ] **[VISUAL]** Badges distintos: "GIRAR ESTOQUE" dourado, "TICKET MEDIO" verde, "FIDELIZAR" vermelho
- [ ] **[VISUAL]** Promo 1: R$ 179,90 + ~~R$ 204,70~~ (line-through) + "economia R$ 24,80" (verde)
- [ ] **[VISUAL]** Card Sophia intro com dot pulsante (glow) + texto
- [ ] **[MANUAL]** Promo 1 e 2: botoes Publicar + Editar; Promo 3: botao unico "Enviar por WhatsApp" (full width)
- [ ] **[MANUAL]** Botoes sem acao real (mock); BackButton → `/`

---

# FLUXOS E2E

## E2E-1: Venda completa ponta-a-ponta
- [ ] **[MANUAL/AUTO]** Login → "Entrar" → Dashboard mostra R$ 420,60 / 4 vendas
- [ ] **[MANUAL]** Quick action "Nova venda" → adiciona 2 produtos (ex.: Batom 39,90 + Gloss 29,90) → CartBar "2 itens · R$ 69,80"
- [ ] **[MANUAL]** "Avancar" → checkout → abrir ClientPicker → selecionar Patricia Souza
- [ ] **[MANUAL]** Escolher pagamento Pix → ConfirmButton vira "Confirmar venda · R$ 69,80"
- [ ] **[MANUAL]** Confirmar → overlay "Venda registrada" com Cliente Patricia + Pagamento Pix + R$ 69,80
- [ ] **[MANUAL]** "Voltar ao inicio" → Dashboard agora mostra **R$ 490,40** (420,60 + 69,80) e **5 vendas**
- [ ] **[MANUAL]** Ir ao Historico → nova venda de Patricia (Pix, "agora") aparece no **topo** da lista

## E2E-2: Cadastro de produto reflete no estoque e catalogo
- [ ] **[MANUAL]** Estoque → "+" → Novo Produto → nome "Batom Teste", categoria Labios, custo 20 → preco auto R$ 55,90
- [ ] **[MANUAL]** Estoque em 8 → Salvar → volta a `/estoque` → "11 produtos ativos" + novo item com margem 64% e badge verde "8 un."
- [ ] **[MANUAL]** Nova venda → produto "Batom Teste" aparece no catalogo (filtro Labios e busca)

## E2E-3: Navegacao bottom nav + tab mapping
- [ ] **[AUTO]** `/` → tab Inicio; `/vendas` e `/historico` → tab Vendas; `/estoque` e `/produto` → tab Estoque; `/clientes` → Clientes; `/config` → Ajustes
- [ ] **[AUTO]** `/avisos` e `/promos` → BottomNav visivel, nenhum tab dourado
- [ ] **[AUTO]** `/login` e `/produto` → BottomNav oculto (HIDDEN_NAV_ROUTES)
- [ ] **[MANUAL]** Clicar cada tab navega para a rota base correspondente

## E2E-4: Markup config propaga para novo produto
- [ ] **[MANUAL]** Config → markup 180% → 200% (botao +) → exemplo "R$ 59,90"
- [ ] **[MANUAL]** Novo Produto → custo 20 → preco sugerido usa 200% = round90(60) = R$ 59,90; hint "markup padrao de 200%"

## E2E-5: Persistencia em memoria
- [ ] **[MANUAL]** Registrar venda / cadastrar produto / mudar toggle → reload da pagina → tudo volta ao mock inicial (sem persistencia — esperado)

---

## Resumo de cobertura

| Sprint / Fluxo | AUTO | VISUAL | MANUAL |
|----------------|------|--------|--------|
| S2 Login | 1 | 4 | 3 |
| S2 Dashboard | 6 | 5 | 6 |
| S2 Avisos | 1 | 4 | 1 |
| S2 Configuracoes | 5 | 3 | 6 |
| S3 Nova Venda P1 | 5 | 1 | 8 |
| S3 Checkout | 6 | 2 | 4 |
| S3 Client Picker | 3 | 1 | 6 |
| S3 Overlay | 3 | 1 | 2 |
| S3 Historico | 6 | 0 | 1 |
| S4 Estoque | 6 | 0 | 1 |
| S4 Novo Produto | 9 | 0 | 5 |
| S4 Clientes | 5 | 1 | 0 |
| S4 Promocoes | 1 | 4 | 2 |
| E2E (5 fluxos) | 3 | 0 | 15 |

**Prioridade QA:** automatizar primeiro os [AUTO] de calculo/logica (Dashboard totais, Estoque margens, Novo Produto markup/round90, ConfirmButton estados, Historico abreviacao/pluralizacao, tab mapping). Fluxos E2E rodam via Playwright ou validacao manual guiada.

## Notas para PO / Code Reviewer
1. **Ticket medio divergente:** o Dashboard calcula `todayTotal/todayCount` = **R$ 105,15**, mas o PRD (Tela 2) e o prototipo mostram **R$ 52,58** fixo. Decidir se o correto e o calculo dinamico (parece mais coerente) e atualizar PRD, ou fixar o valor.
2. **round90 em empate (ja levantado na S1):** `round90(60)` = 59,90 (empate vai para floor por causa da condicao `<=`). Afeta exemplo de markup 200% em Config e preco sugerido. Confirmar se e o comportamento desejado.
3. **"Este mes R$ 6.240" e "Meta 68%"** sao hardcoded em Dashboard e Historico — nao derivam do mock. Esperado no MVP, mas registrar que nao reagem a novas vendas.
4. **Overlay "Voltar ao inicio"** nao chama clearCart explicitamente, mas confirmSale ja limpou o carrinho antes — comportamento correto, so nao obvio na leitura.
