# Backlog — CRM Studio Belle

> App mobile-first de gestao de vendas, estoque, clientes e promocoes para o salao Studio Bell PG.
> Sprint 1 cria a fundacao: scaffold Vite, design system, tipos, mock data, layout base e navegacao.
> Sprint 2 implementa as telas de entrada e informacao (Login, Dashboard, Avisos, Configuracoes).
> Sprint 3 cobre o fluxo principal de vendas de ponta a ponta (catalogo, checkout, client picker, overlay, historico).
> Sprint 4 entrega as telas de gestao (Estoque, Novo Produto, Clientes, Promocoes).
> Todas as telas usam dados mock sem backend. Cada sprint entrega valor testavel no browser.

**Sprints (ordem de execucao):**
1. Sprint 1 — Fundacao (objetivo: projeto rodando com layout, design system, tipos, mock data e navegacao)
2. Sprint 2 — Telas de Entrada e Informacao (objetivo: Login, Dashboard, Avisos e Configuracoes funcionais)
3. Sprint 3 — Fluxo de Vendas (objetivo: catalogo, checkout, client picker, overlay de sucesso e historico)
4. Sprint 4 — Gestao de Estoque, Clientes e Promocoes (objetivo: Estoque, Novo Produto, Clientes e Promocoes)

**Gerado em:** 2026-07-20
**Baseado em:** PRD v1, Architecture v1, ADRs 001-005

**Notas:**
- Stack: Vite + React 18 + TypeScript strict + Tailwind CSS + shadcn/ui + React Router DOM v6
- Sem backend — mock data em arquivos TS tipados
- Estado via React Context (CartContext, DataContext, SettingsContext)
- Design premium dark/gold com fontes Cormorant Garamond + Jost
- Mobile-first (viewport target 392x812)

---

## Sprint 1 — Fundacao

**Objetivo da sprint:** Projeto Vite criado e configurado, design system implementado no Tailwind, tipos definidos, mock data populado, layout base com AppShell + BottomNav funcional, e componentes shared reutilizaveis prontos. O dev abre o browser e ve o layout com navegacao entre tabs funcionando.
**Pre-requisitos:** nenhum
**Definition of Done:** `npm run dev` inicia sem erros, navegacao entre tabs funciona, design system (cores, fontes, animacoes) aplicado corretamente, todas as paginas existem como placeholder dentro do AppShell.

### Task 1.1 — Criar projeto Vite e instalar dependencias
- **Tipo:** chore
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** package.json, vite.config.ts, tsconfig.json, tsconfig.app.json, index.html, src/main.tsx, src/App.tsx, .env.example, .gitignore, postcss.config.js
- **Resultado esperado:** Projeto Vite + React 18 + TypeScript rodando com Tailwind CSS, shadcn/ui inicializado, React Router DOM v6, lucide-react e path alias `@/` configurado
- **Criterios de aceite:**
  - [ ] `npm run dev` inicia sem erros
  - [ ] `npm run build` compila sem erros TypeScript
  - [ ] Path alias `@/` aponta para `./src/`
  - [ ] Tailwind CSS funcional (classes utilitarias aplicadas)
  - [ ] shadcn/ui inicializado (components.json presente)
  - [ ] Google Fonts (Cormorant Garamond + Jost) carregadas no index.html
  - [ ] React Router DOM v6 instalado

### Task 1.2 — Configurar design system no Tailwind e criar animacoes CSS
- **Tipo:** chore
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 1.1
- **Arquivos esperados:** tailwind.config.ts, src/styles/animations.css, src/index.css
- **Resultado esperado:** Tailwind configurado com cores customizadas (app-bg, card, gold, text-primary, etc.), font families (display, body), border-radius tokens, animacoes (fadeup, glow, pop) e suporte a prefers-reduced-motion
- **Criterios de aceite:**
  - [ ] Cores customizadas acessiveis via classes Tailwind (bg-app-bg, text-gold, bg-card, etc.)
  - [ ] `font-display` e `font-body` funcionais
  - [ ] `animate-fadeup`, `animate-glow`, `animate-pop` funcionais
  - [ ] `prefers-reduced-motion` desativa animacoes
  - [ ] Border-radius tokens (card, card-lg, input, chip, tile) disponiveis
  - [ ] Fundo padrao do body e #16120E

### Task 1.3 — Definir tipos TypeScript e criar mock data
- **Tipo:** chore
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 1.1
- **Arquivos esperados:** src/types/index.ts, src/data/products.ts, src/data/clients.ts, src/data/sales.ts, src/data/alerts.ts, src/data/promos.ts
- **Resultado esperado:** Interfaces (Product, Client, Sale, Alert, Promo, CartItem, PaymentMethod, ClientTag, PromoAction) definidas e arrays mock exportados com os dados exatos do PRD (10 produtos, 5 clientes, 6 vendas, 4 avisos, 3 promocoes)
- **Criterios de aceite:**
  - [ ] Todos os tipos do PRD definidos com tipagem estrita
  - [ ] 10 produtos com id, name, category, price, cost, stock — valores iguais ao PRD
  - [ ] 5 clientes com name, last, total, tag — valores iguais ao PRD
  - [ ] 6 vendas com id, client, payment, total, items, date, time — valores iguais ao PRD
  - [ ] 4 avisos com kind, dot, text, when — valores iguais ao PRD
  - [ ] 3 promocoes tipadas com title, subtitle, badge, price, originalPrice, savings, actions
  - [ ] Build compila sem erros de tipo

### Task 1.4 — Criar lib utilitaria e constantes
- **Tipo:** chore
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** Task 1.3
- **Arquivos esperados:** src/lib/utils.ts, src/lib/pricing.ts, src/lib/constants.ts
- **Resultado esperado:** Funcoes utilitarias (cn, formatCurrency, getInitials, shortPayment), funcoes de pricing (floor90, ceil90, round90, calcMarkup, calcMargin) e constantes (CATEGORY_TILES, LOW_STOCK_THRESHOLD, DEFAULT_MARKUP, PAYMENT_METHODS, NAV_ROUTES, HIDDEN_NAV_ROUTES) implementadas
- **Criterios de aceite:**
  - [ ] `formatCurrency(420.60)` retorna `"R$ 420,60"`
  - [ ] `getInitials("Mariana Alves")` retorna `"MA"`
  - [ ] `shortPayment("Cartao de credito")` retorna `"Credito"`
  - [ ] `round90(50.40)` retorna `50.90`
  - [ ] `floor90(50.40)` retorna `49.90`
  - [ ] `ceil90(50.40)` retorna `50.90`
  - [ ] Constantes de categoria, threshold e nav exportadas

### Task 1.5 — Criar contexts (Cart, Data, Settings) e hooks
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 1.3, Task 1.4
- **Arquivos esperados:** src/contexts/CartContext.tsx, src/contexts/DataContext.tsx, src/contexts/SettingsContext.tsx, src/hooks/useCart.ts, src/hooks/useData.ts, src/hooks/useSettings.ts, src/hooks/useSearch.ts, src/hooks/useMarkupCalculator.ts
- **Resultado esperado:** Tres contexts implementados conforme Architecture.md. CartContext gerencia carrinho (items, step, client, payment, confirmSale). DataContext gerencia dados mutaveis (products, clients, sales com add*). SettingsContext gerencia toggles e defaultMarkup. Hooks wrapper para cada context + useSearch generico + useMarkupCalculator
- **Criterios de aceite:**
  - [ ] CartContext: addItem, removeItem, clearCart, setStep, setClient, setPayment, confirmSale, cartTotal, cartCount, cartItems
  - [ ] DataContext: products, clients, sales inicializados com mock data; addProduct, addClient, addSale funcionais
  - [ ] DataContext: todaySales, todayTotal, todayCount, lowStockProducts como getters derivados
  - [ ] SettingsContext: defaultMarkup (180), setMarkup (range 0-500, step 10), toggles, toggleSetting
  - [ ] useSearch filtra array por nome (case-insensitive)
  - [ ] useMarkupCalculator retorna markup, margin, profit a partir de cost e price
  - [ ] Providers encadeados na ordem: Settings > Data > Cart

### Task 1.6 — Criar AppShell, BottomNav e componentes shared
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 1.2, Task 1.4
- **Arquivos esperados:** src/components/layout/AppShell.tsx, src/components/layout/BottomNav.tsx, src/components/layout/PageHeader.tsx, src/components/shared/SearchInput.tsx, src/components/shared/GoldButton.tsx, src/components/shared/BackButton.tsx, src/components/shared/StockBadge.tsx, src/components/shared/ToggleSwitch.tsx, src/components/shared/SectionLabel.tsx, src/components/shared/ViewToggle.tsx, src/components/product/ProductTile.tsx, src/components/product/CategoryChips.tsx, src/components/client/ClientAvatar.tsx
- **Resultado esperado:** AppShell com Outlet + BottomNav condicional (oculto em /login e /produto). BottomNav com 5 tabs (Inicio, Vendas, Estoque, Clientes, Ajustes), tab ativo em dourado. Todos os componentes shared e reutilizaveis criados conforme Architecture.md
- **Criterios de aceite:**
  - [ ] AppShell renderiza Outlet + BottomNav
  - [ ] BottomNav oculto em /login e /produto
  - [ ] Tab ativo detectado pela rota atual (cor #C8A24C)
  - [ ] Tab inativo com cor #7c7264
  - [ ] BottomNav: height 74px, z-index 35, backdrop blur 16px, fundo rgba(18,14,10,.92)
  - [ ] Conteudo com padding-bottom 110px quando nav visivel
  - [ ] ProductTile renderiza tile colorido por categoria com inicial
  - [ ] CategoryChips renderiza chips scrollaveis com estado ativo/inativo
  - [ ] SearchInput com icone de lupa
  - [ ] GoldButton com gradiente dourado
  - [ ] BackButton com chevron esquerda
  - [ ] StockBadge com cor dinamica (verde >5, vermelho <=5)
  - [ ] ToggleSwitch com gradiente dourado (ON) e cinza (OFF)
  - [ ] ClientAvatar com iniciais e borda dourada

### Task 1.7 — Configurar rotas e paginas placeholder
- **Tipo:** chore
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** Task 1.5, Task 1.6
- **Arquivos esperados:** src/App.tsx (atualizado), src/pages/LoginPage.tsx, src/pages/DashboardPage.tsx, src/pages/NewSalePage.tsx, src/pages/HistoryPage.tsx, src/pages/StockPage.tsx, src/pages/NewProductPage.tsx, src/pages/ClientsPage.tsx, src/pages/AlertsPage.tsx, src/pages/PromosPage.tsx, src/pages/SettingsPage.tsx
- **Resultado esperado:** Todas as 10 paginas registradas como rotas no React Router. Cada pagina exibe titulo placeholder. Providers encadeados no App.tsx. Navegacao entre tabs funcional
- **Criterios de aceite:**
  - [ ] Todas as 10 rotas mapeadas conforme Architecture.md
  - [ ] LoginPage fora do AppShell (sem BottomNav)
  - [ ] NewProductPage dentro do AppShell mas com BottomNav oculto
  - [ ] Navegacao entre tabs funciona via BottomNav
  - [ ] Providers (Settings > Data > Cart) envolvem o BrowserRouter
  - [ ] `npm run build` compila sem erros

---

## Sprint 2 — Telas de Entrada e Informacao

**Objetivo da sprint:** Login visual funcional, Dashboard completo com todas as secoes (vendas hoje, quick actions, Sophia sugere, estoque baixo), tela de Avisos e tela de Configuracoes. O usuario navega do login ao dashboard, ve resumo de vendas, acessa avisos e ajusta configuracoes.
**Pre-requisitos:** Sprint 1 concluida
**Definition of Done:** Login navega para Dashboard, Dashboard exibe dados calculados a partir do mock, Avisos listam 4 notificacoes, Configuracoes com toggles e markup funcionais.

### Task 2.1 — Implementar tela de Login
- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** Tela 1 (Login)
- **Arquivos esperados:** src/pages/LoginPage.tsx
- **Resultado esperado:** Tela de login visual com logo "PG", titulo "Studio Bell PG", subtitulo "Make", campos pre-preenchidos (email e senha), botao "Entrar" e link "Entrar com biometria". Ambos navegam para Dashboard. Animacao fadeup ao montar
- **Criterios de aceite:**
  - [ ] Campos pre-preenchidos visiveis ao carregar (email: contato@studiobellpg.com, senha: 123456)
  - [ ] Botao "Entrar" navega para Dashboard (/)
  - [ ] Link "Entrar com biometria" navega para Dashboard
  - [ ] Animacao fadeup ao montar o componente
  - [ ] Campo senha com mascara (type password)
  - [ ] Bottom nav NAO aparece nesta tela
  - [ ] Logo circular com iniciais "PG" em dourado, borda com gradiente
  - [ ] Botao "Entrar" com gradiente dourado

### Task 2.2 — Implementar tela de Dashboard
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** Tela 2 (Dashboard)
- **Arquivos esperados:** src/pages/DashboardPage.tsx, src/components/dashboard/SalesTodayCard.tsx, src/components/dashboard/StatsCards.tsx, src/components/dashboard/QuickActions.tsx, src/components/dashboard/SophiaSuggestions.tsx, src/components/dashboard/LowStockSection.tsx
- **Resultado esperado:** Dashboard completo com 6 secoes: header com saudacao e avatar, card "Vendas de hoje" (calculado do mock), cards "Este mes" e "Meta do mes", quick actions (grid 2x2), Sophia sugere (2 cards com dot pulsante), estoque baixo (produtos com stock <= 5). Todas as navegacoes funcionais
- **Criterios de aceite:**
  - [ ] Valor de vendas de hoje calculado dinamicamente (soma de vendas com date === 'Hoje')
  - [ ] Contagem de vendas de hoje correta
  - [ ] Quick actions navegam para telas corretas (Nova Venda, Novo Produto, Promocoes, Clientes)
  - [ ] Dot da Sophia pulsa com animacao glow
  - [ ] Estoque baixo mostra apenas produtos com stock <= 5
  - [ ] Botao de notificacoes (sino com badge) navega para Avisos
  - [ ] Card de vendas de hoje clicavel e navega para Historico
  - [ ] Bottom nav visivel com tab "Inicio" ativo (cor dourada)
  - [ ] Cards "Este mes" (R$ 6.240, +12%) e "Meta do mes" (68%, barra de progresso) exibidos
  - [ ] Botoes nas sugestoes Sophia navegam para Promocoes e Clientes

### Task 2.3 — Implementar tela de Avisos
- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** media
- **Dependencias:** nenhuma
- **Stories cobertas:** Tela 9 (Avisos)
- **Arquivos esperados:** src/pages/AlertsPage.tsx
- **Resultado esperado:** Lista de 4 avisos com dot colorido por tipo (Estoque: #D07C67, Sophia IA: #C8A24C, Cliente: #8FA98A), label do tipo, texto e timestamp
- **Criterios de aceite:**
  - [ ] 4 avisos mock exibidos
  - [ ] Cor do dot e do label correspondem ao tipo
  - [ ] Botao voltar navega para Dashboard
  - [ ] Bottom nav visivel
  - [ ] Header com titulo "Avisos" em Cormorant Garamond

### Task 2.4 — Implementar tela de Configuracoes
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** Tela 11 (Configuracoes)
- **Arquivos esperados:** src/pages/SettingsPage.tsx, src/components/settings/ProfileCard.tsx, src/components/settings/ToggleGroup.tsx, src/components/settings/MarkupControl.tsx, src/components/settings/ShopInfo.tsx
- **Resultado esperado:** Tela de configuracoes com card de perfil (avatar "PG", nome do salao, plano), 4 toggles de notificacao, controle de markup padrao com botoes +/- e exemplo live, info da loja e botao "Sair da conta"
- **Criterios de aceite:**
  - [ ] Toggles funcionam (flip visual + estado via SettingsContext)
  - [ ] Markup padrao ajustavel com botoes +/- (incremento de 10)
  - [ ] Exemplo de markup recalculado live com arredondamento .90 (ex: "Custo R$ 20,00 -> venda R$ XX,90")
  - [ ] Limites respeitados: min 0%, max 500%
  - [ ] Botao "Sair da conta" navega para /login
  - [ ] Bottom nav com tab "Ajustes" ativo
  - [ ] Card de perfil com avatar "PG", "Studio Bell PG · Make", "Bruna · Plano Pro"
  - [ ] Info da loja: formas de pagamento, categorias, backup

---

## Sprint 3 — Fluxo de Vendas

**Objetivo da sprint:** Fluxo completo de venda funcional — desde selecao de produtos (catalogo com busca, filtro, toggle lista/grade), passando pelo checkout (itens, cliente, pagamento), client picker (selecao e cadastro), overlay de sucesso (com registro da venda), ate o historico de vendas. Venda registrada aparece no historico e atualiza o dashboard.
**Pre-requisitos:** Sprint 2 concluida
**Definition of Done:** Usuario seleciona produtos, avanca ao checkout, escolhe cliente e pagamento, confirma venda, ve overlay de sucesso, e a venda aparece no historico e nos totais do dashboard.

### Task 3.1 — Implementar Nova Venda — Step 1 (Catalogo de Produtos)
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** Tela 3 (Nova Venda — Passo 1)
- **Arquivos esperados:** src/pages/NewSalePage.tsx, src/components/product/ProductListItem.tsx, src/components/product/ProductGridItem.tsx, src/components/sale/CartBar.tsx
- **Resultado esperado:** Catalogo de produtos com header (titulo, toggle lista/grade, botao historico), busca por nome, filtro por categoria (chips), lista e grade de produtos com controles de quantidade, e floating cart bar que aparece quando ha itens no carrinho
- **Criterios de aceite:**
  - [ ] Busca filtra produtos em tempo real (case-insensitive)
  - [ ] Filtro de categoria funciona combinado com busca
  - [ ] Toggle lista/grade alterna a visualizacao
  - [ ] Modo lista: tile, nome, categoria, preco, botao + ou controles -/qtd/+
  - [ ] Modo grade: grid 2 colunas, tile grande, badge de quantidade com animacao pop
  - [ ] Borda dourada no card do modo grade quando produto esta no carrinho
  - [ ] Adicionar produto incrementa quantidade no carrinho
  - [ ] Remover produto decrementa; chegar a 0 remove do carrinho
  - [ ] Cart bar aparece quando ha itens (animacao pop)
  - [ ] Cart bar mostra total e contagem corretos
  - [ ] Cart bar "Avancar" muda para step checkout
  - [ ] Botao historico (relogio) navega para /historico

### Task 3.2 — Implementar Nova Venda — Step 2 (Checkout)
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 3.1
- **Stories cobertas:** Tela 4 (Nova Venda — Passo 2)
- **Arquivos esperados:** src/components/sale/CheckoutItemList.tsx, src/components/sale/PaymentGrid.tsx, src/components/sale/ConfirmButton.tsx
- **Resultado esperado:** Tela de checkout com lista de itens (controles +/-), selecao de cliente (botao que abre client picker), grid de formas de pagamento (4 opcoes mutuamente exclusivas), card de total e botao de confirmar com 3 estados
- **Criterios de aceite:**
  - [ ] Itens do carrinho listados com quantidades e subtotais corretos
  - [ ] Controles +/- funcionam no checkout
  - [ ] Botao cliente abre o client picker
  - [ ] Cliente selecionado exibe nome e iniciais
  - [ ] Formas de pagamento sao mutuamente exclusivas (Pix, Credito, Debito, Dinheiro)
  - [ ] Botao confirmar desabilitado ate cliente E pagamento estarem selecionados
  - [ ] Label do botao confirmar muda dinamicamente (3 estados)
  - [ ] Total calculado corretamente
  - [ ] Botao voltar retorna ao step de produtos mantendo o carrinho

### Task 3.3 — Implementar Client Picker (Bottom Sheet)
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 3.2
- **Stories cobertas:** Overlay Client Picker
- **Arquivos esperados:** src/components/client/ClientPicker.tsx
- **Resultado esperado:** Bottom sheet com backdrop blur, handle, busca de clientes, formulario toggle de novo cliente (nome + telefone), e lista scrollavel de clientes existentes. Clicar em um cliente seleciona e fecha o picker
- **Criterios de aceite:**
  - [ ] Backdrop com blur 3px e fundo semi-transparente
  - [ ] Clicar no backdrop fecha o picker
  - [ ] Botao "Cadastrar novo cliente" expande formulario (toggle)
  - [ ] Form com inputs "Nome completo" e "Telefone (WhatsApp)" com inputmode tel
  - [ ] Salvar novo cliente: adiciona ao inicio da lista (DataContext), seleciona, fecha picker
  - [ ] Busca filtra clientes por nome
  - [ ] Selecionar cliente atualiza o checkout (CartContext)
  - [ ] Max-height 78% da tela

### Task 3.4 — Implementar Overlay de Venda Registrada
- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** Task 3.2
- **Stories cobertas:** Overlay Venda Registrada
- **Arquivos esperados:** src/components/sale/SaleSuccessOverlay.tsx
- **Resultado esperado:** Overlay fullscreen com backdrop blur mostrando check animado, valor total, nome do cliente, forma de pagamento, e botoes "Nova venda" e "Voltar ao inicio"
- **Criterios de aceite:**
  - [ ] Overlay cobre toda a tela com blur 4px
  - [ ] Animacoes fadeup + pop ao aparecer
  - [ ] Nome do cliente e forma de pagamento exibidos corretamente
  - [ ] Carrinho limpo apos confirmar (CartContext.clearCart)
  - [ ] Cliente e pagamento resetados
  - [ ] Nova venda adicionada ao array de sales (DataContext.addSale)
  - [ ] Botao "Nova venda" leva ao step de produtos com carrinho vazio
  - [ ] Botao "Voltar ao inicio" leva ao Dashboard

### Task 3.5 — Implementar tela de Historico de Vendas
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** Tela 5 (Historico de Vendas)
- **Arquivos esperados:** src/pages/HistoryPage.tsx
- **Resultado esperado:** Lista de vendas com cards resumo (total hoje, total mes) e lista de vendas com avatar do cliente, nome, itens, forma de pagamento abreviada, valor e data/hora
- **Criterios de aceite:**
  - [ ] Total de hoje calculado dinamicamente a partir do array de vendas
  - [ ] Contagem de vendas de hoje correta
  - [ ] Lista exibe todas as vendas (incluindo novas vendas registradas na sessao)
  - [ ] Forma de pagamento abreviada: "Cartao de credito" -> "Credito", "Cartao de debito" -> "Debito"
  - [ ] Iniciais do cliente extraidas corretamente (2 letras)
  - [ ] Botao voltar navega para Nova Venda (/vendas)
  - [ ] Bottom nav visivel com tab "Vendas" ativo

---

## Sprint 4 — Gestao de Estoque, Clientes e Promocoes

**Objetivo da sprint:** Telas de gestao completas — Estoque (lista com busca e badges), Novo Produto (formulario com calculo live de markup/margem/lucro e arredondamento .90), Clientes (lista com tags VIP/Aniversario), e Promocoes (cards Sophia com badges e acoes). MVP completo.
**Pre-requisitos:** Sprint 3 concluida
**Definition of Done:** Todas as 10 telas + overlays funcionais. Produto cadastrado aparece no estoque e no catalogo de vendas. Navegacao completa sem erros. Build limpo.

### Task 4.1 — Implementar tela de Estoque
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** Tela 6 (Estoque)
- **Arquivos esperados:** src/pages/StockPage.tsx
- **Resultado esperado:** Lista completa de produtos com header (titulo, contagem, botao +), busca por nome, e cada produto com tile, nome, preco, margem calculada e badge de estoque com cor dinamica
- **Criterios de aceite:**
  - [ ] Lista exibe todos os produtos (incluindo novos cadastrados na sessao)
  - [ ] Busca filtra em tempo real (case-insensitive)
  - [ ] Margem calculada corretamente: (preco - custo) / preco * 100, arredondada
  - [ ] Badge de estoque muda de cor conforme threshold (<=5 = vermelho, >5 = verde)
  - [ ] Contagem de produtos ativos no header
  - [ ] Botao "+" navega para /produto
  - [ ] Bottom nav com tab "Estoque" ativo

### Task 4.2 — Implementar tela de Novo Produto
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 4.1
- **Stories cobertas:** Tela 7 (Novo Produto)
- **Arquivos esperados:** src/pages/NewProductPage.tsx
- **Resultado esperado:** Formulario de cadastro com nome, categoria (chips), custo, preco de venda (auto-calculado via markup), botoes de arredondamento .90, cards de markup e margem live, lucro por unidade e quantidade em estoque. Salvar adiciona produto ao DataContext e navega para /estoque
- **Criterios de aceite:**
  - [ ] Ao digitar custo, preco de venda calculado automaticamente com markup padrao + arredondamento .90
  - [ ] Editar preco manualmente desativa calculo automatico (priceAuto = false)
  - [ ] Botao "arredondar para baixo" arredonda para o .90 inferior (floor90)
  - [ ] Botao "arredondar para cima" arredonda para o .90 superior (ceil90)
  - [ ] Markup calculado: (preco - custo) / custo * 100
  - [ ] Margem calculada: (preco - custo) / preco * 100
  - [ ] Lucro por unidade: preco - custo
  - [ ] Valores exibem "—" quando custo ou preco sao 0
  - [ ] Hint muda entre "Sugerido pelo markup padrao de X%" e "Preco ajustado manualmente"
  - [ ] Categoria selecionavel por chips (mutuamente exclusiva)
  - [ ] Bottom nav NAO aparece nesta tela
  - [ ] Botao voltar navega para /estoque
  - [ ] Salvar adiciona produto ao DataContext com id sequencial

### Task 4.3 — Implementar tela de Clientes
- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** Tela 8 (Clientes)
- **Arquivos esperados:** src/pages/ClientsPage.tsx, src/components/client/ClientCard.tsx
- **Resultado esperado:** Lista de clientes com header (titulo, contagem, botao +), cada cliente com avatar, nome, tag opcional (VIP ou ANIVERSARIO com cores distintas), info de ultima compra e valor total
- **Criterios de aceite:**
  - [ ] Lista exibe clientes (incluindo novos cadastrados na sessao)
  - [ ] Tags exibidas corretamente para Mariana (ANIVERSARIO) e Patricia (VIP)
  - [ ] Clientes sem tag nao exibem badge
  - [ ] Iniciais extraidas dos 2 primeiros nomes
  - [ ] Total formatado com R$ e virgula
  - [ ] Bottom nav com tab "Clientes" ativo
  - [ ] Header mostra contagem de clientes cadastrados

### Task 4.4 — Implementar tela de Promocoes
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** media
- **Dependencias:** nenhuma
- **Stories cobertas:** Tela 10 (Promocoes)
- **Arquivos esperados:** src/pages/PromosPage.tsx, src/components/promo/PromoCard.tsx, src/components/promo/SophiaIntroCard.tsx
- **Resultado esperado:** Tela com card intro da Sophia (dot pulsante), 3 cards de promocao com badges coloridas por tipo, precos (original riscado + promo), economia e botoes de acao (mock, sem funcionalidade real)
- **Criterios de aceite:**
  - [ ] 3 cards de promocao exibidos
  - [ ] Badges com cores distintas por tipo (GIRAR ESTOQUE: dourado, TICKET MEDIO: verde, FIDELIZAR: vermelho)
  - [ ] Preco original riscado com text-decoration line-through
  - [ ] Economia calculada e exibida em verde
  - [ ] Dot da Sophia pulsa com animacao glow
  - [ ] Botoes presentes mas sem acao real (mock)
  - [ ] Botao voltar navega para Dashboard
  - [ ] Card intro da Sophia com gradiente e borda dourada
