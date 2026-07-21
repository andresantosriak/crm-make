# Test Map — Sprint 1 (Fundacao) — CRM Studio Belle

> Roteiro de testes para a fundacao: design system, mock data, funcoes utilitarias/pricing, contexts (Cart/Data/Settings), hooks, AppShell + BottomNav e roteamento.
> Base: PRD v1, Backlog Sprint 1 (tasks 1.1-1.7), codigo em `src/`.
> Classificacao por item: **[AUTO]** (Vitest/RTL) · **[VISUAL]** (inspecao no browser) · **[MANUAL]** (interacao manual).
> Stack sem backend/Supabase — nao ha secao RLS. Estado em memoria (nao persiste em reload).

**Gerado em:** 2026-07-20

---

## 1. Design System (Task 1.2)

Arquivos: `src/index.css` (@theme Tailwind v4), `src/styles/animations.css`.

### Fluxo principal (happy path)
- [ ] **[VISUAL]** Fundo do `body` renderiza `#16120E` (app-bg) — nao branco/preto puro
- [ ] **[VISUAL]** Titulos de tela usam Cormorant Garamond (serif, `font-display`); body usa Jost (`font-body`)
- [ ] **[VISUAL]** Google Fonts carregadas no `index.html` (Cormorant Garamond 400/500/600 + Jost 300/400/500/600) — sem fallback serif/sans generico visivel
- [ ] **[VISUAL]** Classes de cor Tailwind resolvem os tokens: `bg-app-bg` #16120E, `bg-card` #221C15, `text-gold` #C8A24C, `text-primary` #F1EBDF, `text-secondary` #A79B88, `text-muted` #7c7264, `text-success` #8FA98A, `text-danger` #D07C67

### Animacoes
- [ ] **[VISUAL]** `animate-fadeup` executa opacity 0→1 + translateY(8px)→0 em ~0.35s ao montar tela
- [ ] **[VISUAL]** `animate-glow` pulsa (opacity 0.55→1→0.55) em loop 2.4s — usado no dot da Sophia
- [ ] **[VISUAL]** `animate-pop` faz scale(0.85)→1 + fade em ~0.25s
- [ ] **[MANUAL]** Com `prefers-reduced-motion: reduce` ativo no SO/DevTools, as animacoes sao desativadas (sem movimento)

### Border-radius tokens
- [ ] **[VISUAL]** Tokens disponiveis e aplicados: `rounded-card` 14px, `rounded-card-lg` 18px, `rounded-input` 12px, `rounded-chip` 20px, `rounded-tile` 11px

### Responsividade
- [ ] **[VISUAL]** Layout mobile 375px sem scroll horizontal
- [ ] **[VISUAL]** Layout funciona a partir de 320px (viewport target 392x812)

---

## 2. Mock Data (Task 1.3)

Arquivos: `src/types/index.ts`, `src/data/{products,clients,sales,alerts,promos}.ts`.

### Produtos (10 itens) — fidelidade ao PRD
- [ ] **[AUTO]** `products.length === 10`
- [ ] **[AUTO]** Cada produto tem `id, name, category, price, cost, stock` (tipagem estrita, sem `any`)
- [ ] **[AUTO]** `products[0]` = Batom Matte Vermelho Rubi, Labios, price 39.90, cost 14, stock 24
- [ ] **[AUTO]** Paleta Nude Sunset (id 5): Olhos, price 119.90, cost 45, stock 7
- [ ] **[AUTO]** Blush Pessego (id 7): Rosto, price 44.90, cost 15, stock 2 (estoque critico)
- [ ] **[AUTO]** Categorias presentes limitadas a: Labios, Rosto, Olhos (nenhuma fora dessas 3)
- [ ] **[AUTO]** Exatamente 2 produtos com `stock <= 5`: Mascara Volume Extremo (3) e Blush Pessego (2)

### Clientes (5 itens)
- [ ] **[AUTO]** `clients.length === 5`
- [ ] **[AUTO]** Mariana Alves: last '12/07', total 340.50, tag.label 'ANIVERSARIO' (color #d9b869)
- [ ] **[AUTO]** Patricia Souza: total 512.00, tag.label 'VIP' (color #8FA98A)
- [ ] **[AUTO]** Juliana, Camila e Renata com `tag === null`

### Vendas (6 itens)
- [ ] **[AUTO]** `sales.length === 6`
- [ ] **[AUTO]** 4 vendas com `date === 'Hoje'` (ids 1-4), 2 com `date === 'Ontem'` (ids 5-6)
- [ ] **[AUTO]** Soma dos totais de hoje = **420.60** (189.70 + 74.80 + 39.90 + 116.20)
- [ ] **[AUTO]** Venda id 6 tem `client === 'Consumidor final'` (nao existe na lista de clientes)

### Avisos (4 itens)
- [ ] **[AUTO]** `alerts.length === 4`
- [ ] **[AUTO]** 2 avisos kind 'Estoque' (dot #D07C67), 1 'Sophia · IA' (dot #C8A24C), 1 'Cliente' (dot #8FA98A)

### Promocoes (3 itens)
- [ ] **[AUTO]** `promos.length === 3`
- [ ] **[AUTO]** Promo 1 (Combo Olhar Marcante): price 179.90, originalPrice 204.70, savings 24.80, badge 'GIRAR ESTOQUE'
- [ ] **[AUTO]** Promo 3 (Cupom aniversario): badge 'FIDELIZAR', 1 unica action (Enviar por WhatsApp)

### Build
- [ ] **[AUTO]** `npm run build` compila sem erros de tipo (tsconfig strict)

---

## 3. Lib utilitaria — utils.ts (Task 1.4)

### formatCurrency
- [ ] **[AUTO]** `formatCurrency(420.60) === 'R$ 420,60'`
- [ ] **[AUTO]** `formatCurrency(0) === 'R$ 0,00'`
- [ ] **[AUTO]** `formatCurrency(39.9) === 'R$ 39,90'` (forca 2 casas)
- [ ] **[AUTO]** Edge: `formatCurrency(1000) === 'R$ 1000,00'` — **sem separador de milhar** (comportamento atual; validar se e o desejado)

### getInitials
- [ ] **[AUTO]** `getInitials('Mariana Alves') === 'MA'`
- [ ] **[AUTO]** `getInitials('Consumidor final') === 'CF'`
- [ ] **[AUTO]** Edge: nome com 3+ palavras retorna so as 2 primeiras iniciais (`'Ana Paula Souza'` → `'AP'`)
- [ ] **[AUTO]** Edge: espacos multiplos ignorados via `filter(Boolean)` (`'Ana  Paula'` → `'AP'`)
- [ ] **[AUTO]** Edge: nome unico retorna 1 letra (`'Bruna'` → `'B'`)

### shortPayment
- [ ] **[AUTO]** `shortPayment('Cartao de credito') === 'Credito'`
- [ ] **[AUTO]** `shortPayment('Cartao de debito') === 'Debito'`
- [ ] **[AUTO]** `shortPayment('Pix') === 'Pix'` e `shortPayment('Dinheiro') === 'Dinheiro'` (passa direto)

---

## 4. Lib pricing — pricing.ts (Task 1.4)

### Arredondamento .90 (happy path)
- [ ] **[AUTO]** `floor90(50.40) === 49.90`
- [ ] **[AUTO]** `ceil90(50.40) === 50.90`
- [ ] **[AUTO]** `round90(50.10) === 49.90` (mais perto do floor)
- [ ] **[AUTO]** `round90(50.70) === 50.90` (mais perto do ceil)
- [ ] **[AUTO]** `round90(56.00) === 55.90` (exemplo markup 180% sobre custo R$20)

### Edge cases de arredondamento
- [ ] **[AUTO]** **Empate** `round90(50.40)` → **49.90** (a condicao e `(v-d) <= (u-v)`, empate vai para floor). **ATENCAO: divergencia com AC do backlog (linha 92) que espera 50.90 — reportar ao Code Reviewer/PO.**
- [ ] **[AUTO]** Valor ja terminando em .90: `floor90(49.90) === 49.90` e `ceil90(49.90) === 49.90` (estavel, sem drift por causa do 1e-9)
- [ ] **[AUTO]** `round90(0) === -0.10`? Validar comportamento para custo/preco zero (documentar resultado — provavel uso apenas com valores > 0)

### Markup e Margem
- [ ] **[AUTO]** `calcMarkup(14, 39.90) ≈ 185` (%) — (39.90-14)/14*100
- [ ] **[AUTO]** `calcMargin(14, 39.90) ≈ 64.9` (%) — (39.90-14)/39.90*100
- [ ] **[AUTO]** Guarda: `calcMarkup(0, 39.90) === 0` (cost <= 0)
- [ ] **[AUTO]** Guarda: `calcMargin(14, 0) === 0` (price <= 0)

---

## 5. Constantes — constants.ts (Task 1.4)

- [ ] **[AUTO]** `LOW_STOCK_THRESHOLD === 5`, `DEFAULT_MARKUP === 180`, `MARKUP_MIN 0 / MARKUP_MAX 500 / MARKUP_STEP 10`
- [ ] **[AUTO]** `PAYMENT_METHODS` = ['Pix', 'Cartao de credito', 'Cartao de debito', 'Dinheiro']
- [ ] **[AUTO]** `getCategoryTile('Labios')` retorna gradient `#d98a8a → #b25f6a`
- [ ] **[AUTO]** `getCategoryTile('Olhos')` e `getCategoryTile('Rosto')` retornam seus gradientes proprios
- [ ] **[AUTO]** `getCategoryTile('Inexistente')` retorna o fallback (`#c8a24c → #b78d3d`)
- [ ] **[AUTO]** `HIDDEN_NAV_ROUTES` contem exatamente `['/login', '/produto']`
- [ ] **[AUTO]** `NAV_ROUTES` mapeia home→'/', vendas→'/vendas', estoque→'/estoque', clientes→'/clientes', config→'/config'

---

## 6. CartContext (Task 1.5)

Arquivo: `src/contexts/CartContext.tsx`. Depende de DataContext (products, addSale).

### Fluxo principal
- [ ] **[AUTO]** Estado inicial: `items {}`, `step 'produtos'`, `client null`, `payment null`, `cartTotal 0`, `cartCount 0`, `cartItems []`
- [ ] **[AUTO]** `addItem(1)` duas vezes → `items {1: 2}`, `cartCount === 2`, `cartTotal === 39.90 * 2 = 79.80` (produto id 1)
- [ ] **[AUTO]** `cartItems` resolve `{ product, quantity }` cruzando com products do DataContext
- [ ] **[AUTO]** `addItem(1)` + `addItem(3)` → `cartCount 2`, `cartTotal 39.90 + 49.90 = 89.80`

### Edge cases
- [ ] **[AUTO]** `removeItem(1)` levando quantidade a 0 → chave 1 **removida** do objeto items (nao fica `{1: 0}`)
- [ ] **[AUTO]** `removeItem` de produto inexistente no carrinho nao quebra (no-op)
- [ ] **[AUTO]** `clearCart()` zera items, volta step para 'produtos', client e payment para null
- [ ] **[AUTO]** `confirmSale()` sem client OU sem payment OU cartCount 0 → **no-op** (nenhuma venda adicionada)
- [ ] **[AUTO]** `confirmSale()` com client + payment + itens → chama `addSale` com `date 'Hoje'`, `time 'agora'`, total/items corretos; depois reseta items/step/client/payment
- [ ] **[AUTO]** Nova venda de `confirmSale` entra no **inicio** do array `sales` (addSale faz unshift) → aparece primeiro no historico

---

## 7. DataContext (Task 1.5)

Arquivo: `src/contexts/DataContext.tsx`.

### Fluxo principal
- [ ] **[AUTO]** Inicializa com copias do mock: products 10, clients 5, sales 6
- [ ] **[AUTO]** `todaySales` filtra `date === 'Hoje'` → 4 itens
- [ ] **[AUTO]** `todayTotal === 420.60`, `todayCount === 4`
- [ ] **[AUTO]** `lowStockProducts` → 2 itens (stock <= 5): Mascara Volume Extremo, Blush Pessego

### Mutacoes
- [ ] **[AUTO]** `addProduct({...})` acrescenta no fim com `id` gerado (Date.now) → products.length 11
- [ ] **[AUTO]** `addClient({...})` insere no **inicio** com `tag: null` → clients.length 6, novo cliente em `clients[0]`
- [ ] **[AUTO]** `addSale({...})` insere no inicio com id gerado → sales.length 7; se `date 'Hoje'`, `todayTotal` recalcula
- [ ] **[AUTO]** Getters derivados (`todayTotal`, `lowStockProducts`) reagem apos mutacao (memo com dependencia correta)

---

## 8. SettingsContext (Task 1.5)

Arquivo: `src/contexts/SettingsContext.tsx`.

### Fluxo principal
- [ ] **[AUTO]** `defaultMarkup` inicial === 180
- [ ] **[AUTO]** Toggles iniciais: promos true, estoque true, aniv true, resumo **false**
- [ ] **[AUTO]** `toggleSetting('resumo')` → resumo true; chamar de novo → false (flip)
- [ ] **[AUTO]** `toggleSetting('promos')` nao afeta os outros toggles

### setMarkup — clamp + step
- [ ] **[AUTO]** `setMarkup(200)` → 200
- [ ] **[AUTO]** `setMarkup(600)` → clamp para 500 (MARKUP_MAX)
- [ ] **[AUTO]** `setMarkup(-10)` → clamp para 0 (MARKUP_MIN)
- [ ] **[AUTO]** `setMarkup(184)` → 180 (arredonda ao step de 10)
- [ ] **[AUTO]** `setMarkup(185)` → 190 (Math.round(18.5)=19 → 190; ties-up — documentar)

---

## 9. Hooks derivados (Task 1.5)

### useSearch
- [ ] **[AUTO]** Filtra por accessor case-insensitive: query 'batom' encontra 'Batom Matte Vermelho Rubi'
- [ ] **[AUTO]** query 'MASCARA' (uppercase) encontra 'Mascara Volume Extremo'
- [ ] **[AUTO]** query vazia retorna todos os itens
- [ ] **[AUTO]** query sem match retorna array vazio
- [ ] **[AUTO]** `setQuery` atualiza `filtered` reativamente

### useMarkupCalculator
- [ ] **[AUTO]** `useMarkupCalculator(20, 55.90)` → markup ≈ 179.5, margin ≈ 64.2, profit 35.90
- [ ] **[AUTO]** cost 0 → markup 0 (guarda); price 0 → margin 0 (guarda)
- [ ] **[AUTO]** `profit === price - cost` sempre (ex.: cost 45, price 119.90 → profit 74.90)

---

## 10. AppShell + BottomNav (Task 1.6)

Arquivos: `src/components/layout/AppShell.tsx`, `BottomNav.tsx`.

### Fluxo principal
- [ ] **[AUTO]** AppShell renderiza `<Outlet />` + BottomNav condicional
- [ ] **[AUTO]** BottomNav renderiza 5 tabs na ordem: Inicio, Vendas, Estoque, Clientes, Ajustes
- [ ] **[AUTO/MANUAL]** BottomNav **oculto** em `/login` e `/produto` (HIDDEN_NAV_ROUTES)
- [ ] **[MANUAL]** Clicar em cada tab navega para a rota correspondente (`navigate(tab.path)`)

### Tab ativo — mapeamento
- [ ] **[AUTO]** Rota `/` → tab ativo 'home' (Inicio) cor #C8A24C
- [ ] **[AUTO]** Rota `/vendas` e `/historico` → ambas ativam tab 'Vendas' (match compartilhado)
- [ ] **[AUTO]** Rota `/estoque` e `/produto` → ambas ativam tab 'Estoque'
- [ ] **[AUTO]** Rota `/config` → tab 'Ajustes' ativo
- [ ] **[VISUAL]** Rotas sem match (`/avisos`, `/promos`) → nenhum tab dourado (activeTab '')
- [ ] **[VISUAL]** Tab inativo com cor #7c7264

### Estados de UI / estilo
- [ ] **[VISUAL]** BottomNav: height 74px, z-index 35, `backdrop-filter blur(16px)`, fundo rgba(18,14,10,.92), borda superior sutil
- [ ] **[VISUAL]** Icones lucide-react corretos por tab (Home, ShoppingBag, Package, Users, Settings), size 22
- [ ] **[VISUAL]** Conteudo com padding-bottom suficiente (~110px) para nao ficar sob a nav

### Responsividade
- [ ] **[VISUAL]** BottomNav ocupa largura total, 5 tabs distribuidos com `flex-1` em 375px e 768px

---

## 11. Componentes shared (Task 1.6)

Verificacao de renderizacao/props (roteiro para QA — placeholders de Sprint 1).

- [ ] **[VISUAL]** `ProductTile` renderiza tile com gradient por categoria + inicial do nome em Cormorant bold
- [ ] **[VISUAL]** `ProductTile` de categoria desconhecida usa gradient fallback dourado
- [ ] **[VISUAL]** `CategoryChips` renderiza chips scrollaveis horizontal; ativo com fundo/texto/borda dourados, inativo fundo #221C15 / texto #A79B88
- [ ] **[VISUAL]** `SearchInput` exibe icone de lupa a esquerda + placeholder
- [ ] **[VISUAL]** `GoldButton` com gradiente dourado (135deg #d6b25c → #b78d3d), texto escuro
- [ ] **[VISUAL]** `BackButton` redondo com chevron esquerda
- [ ] **[VISUAL]** `StockBadge` cor dinamica: stock <= 5 vermelho (#D07C67), stock > 5 verde (#8FA98A)
- [ ] **[VISUAL]** `ToggleSwitch` ON gradiente dourado + knob a direita; OFF cinza + knob a esquerda
- [ ] **[VISUAL]** `ClientAvatar` circulo com iniciais + borda dourada
- [ ] **[VISUAL]** `SectionLabel` uppercase, letter-spacing, cor secundaria
- [ ] **[VISUAL]** `ViewToggle` (segmented) alterna lista/grade visualmente

---

## 12. Roteamento e Providers (Task 1.7)

Arquivos: `src/App.tsx`, `src/main.tsx`, `src/pages/*`.

### Fluxo principal
- [ ] **[AUTO]** 10 rotas registradas: `/login`, `/`, `/vendas`, `/historico`, `/estoque`, `/produto`, `/clientes`, `/avisos`, `/promos`, `/config`
- [ ] **[AUTO]** `/login` fora do AppShell (rota irma, sem BottomNav)
- [ ] **[AUTO]** `/produto` dentro do AppShell mas com BottomNav oculto (HIDDEN_NAV_ROUTES)
- [ ] **[AUTO]** Providers encadeados em main.tsx na ordem **SettingsProvider > DataProvider > CartProvider** (Cart depende de Data)
- [ ] **[MANUAL]** `npm run dev` inicia sem erros; navegacao entre tabs funciona no browser
- [ ] **[VISUAL]** Cada pagina placeholder exibe seu titulo dentro do AppShell

### Edge cases
- [ ] **[MANUAL]** Reload da pagina reinicia o estado (mock em memoria, sem persistencia) — comportamento esperado
- [ ] **[VISUAL]** Acesso direto por URL a cada rota renderiza a pagina correta com nav no estado certo (visivel/oculto)

---

## Resumo de cobertura

| Area | AUTO | VISUAL | MANUAL |
|------|------|--------|--------|
| Design system | 0 | 8 | 1 |
| Mock data | 20 | 0 | 0 |
| utils.ts | 11 | 0 | 0 |
| pricing.ts | 12 | 0 | 0 |
| constants.ts | 7 | 0 | 0 |
| CartContext | 12 | 0 | 0 |
| DataContext | 8 | 0 | 0 |
| SettingsContext | 9 | 0 | 0 |
| Hooks | 8 | 0 | 0 |
| AppShell/BottomNav | 8 | 5 | 2 |
| Shared components | 0 | 11 | 0 |
| Routing/Providers | 5 | 2 | 3 |

**Prioridade para o QA agent:** cobrir primeiro os itens [AUTO] de pricing, utils, contexts e mock data (logica pura, alto valor, facil de automatizar com Vitest). Itens [VISUAL] de design system e shared components ficam para validacao no browser. Itens [MANUAL] cobrem navegacao real e persistencia.

## Notas para Code Reviewer / PO
1. **Divergencia round90 (empate):** `round90(50.40)` retorna **49.90** na implementacao (condicao `<=` manda empate para floor), mas o AC do backlog (linha 92) espera **50.90**. Decidir qual e o correto e alinhar codigo ou AC.
2. **formatCurrency sem separador de milhar:** valores >= 1000 saem como `R$ 1000,00`. Confirmar se e aceitavel para o MVP (nenhum valor mock atinge 1000, mas markup/precos futuros podem).
3. **Cliente "Consumidor final"** existe em vendas mas nao na lista de clientes — esperado (venda avulsa); getInitials retorna 'CF'.
