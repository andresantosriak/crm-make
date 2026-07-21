# Code Review: Sprint 1 — Fundacao

## Status: Aprovado

## Objetivo do Sprint
Projeto Vite criado e configurado, design system implementado no Tailwind, tipos definidos, mock data populado, layout base com AppShell + BottomNav funcional, componentes shared reutilizaveis prontos, rotas e placeholders.

## Criterio de Saida
- [x] `npm run dev` inicia sem erros
- [x] Navegacao entre tabs funciona
- [x] Design system (cores, fontes, animacoes) aplicado corretamente
- [x] Todas as paginas existem como placeholder dentro do AppShell

## Tasks Validadas
| Task | Status | Observacao |
|------|--------|------------|
| 1.1: Criar projeto Vite e instalar dependencias | OK | Scaffold correto, path alias @/, shadcn/ui inicializado, Google Fonts carregadas |
| 1.2: Configurar design system no Tailwind e animacoes CSS | OK | Tokens, cores, border-radius, animacoes e prefers-reduced-motion corretos |
| 1.3: Definir tipos TypeScript e criar mock data | OK | Todos os tipos e dados conforme PRD |
| 1.4: Criar lib utilitaria e constantes | OK | utils, pricing e constants corretos |
| 1.5: Criar contexts (Cart, Data, Settings) e hooks | OK | Implementacao completa e correta |
| 1.6: Criar AppShell, BottomNav e componentes shared | OK | Layout, nav e 13 componentes shared corretos |
| 1.7: Configurar rotas e paginas placeholder | OK | 10 rotas, providers encadeados, placeholders presentes |

## Criterios de Aceite das Stories
- [x] CA: `npm run dev` inicia sem erros
- [x] CA: `npm run build` compila sem erros TypeScript
- [x] CA: Path alias `@/` funcional
- [x] CA: Tailwind CSS funcional com tokens customizados
- [x] CA: shadcn/ui inicializado (components.json presente)
- [x] CA: Google Fonts carregadas no index.html
- [x] CA: Cores, fontes, animacoes e border-radius corretos
- [x] CA: prefers-reduced-motion desativa animacoes
- [x] CA: 10 produtos, 5 clientes, 6 vendas, 4 avisos, 3 promocoes tipados e corretos
- [x] CA: formatCurrency, getInitials, shortPayment funcionais
- [x] CA: floor90, ceil90, round90, calcMarkup, calcMargin corretos
- [x] CA: Constantes exportadas (CATEGORY_TILES, LOW_STOCK_THRESHOLD, etc.)
- [x] CA: CartContext com addItem, removeItem, clearCart, confirmSale, cartTotal, cartCount, cartItems
- [x] CA: DataContext com products, clients, sales + add* + getters derivados
- [x] CA: SettingsContext com defaultMarkup (0-500, step 10), toggles
- [x] CA: useSearch filtra case-insensitive
- [x] CA: useMarkupCalculator retorna markup, margin, profit
- [x] CA: AppShell renderiza Outlet + BottomNav condicional
- [x] CA: BottomNav oculto em /login e /produto
- [x] CA: Tab ativo detectado pela rota (cor #C8A24C)
- [x] CA: Providers encadeados Settings > Data > Cart
- [x] CA: LoginPage fora do AppShell
- [x] CA: 10 rotas mapeadas conforme Architecture.md

## Pontos Positivos

1. **Excelente separacao de responsabilidades**: Cada context tem escopo bem definido (Cart = fluxo de venda, Data = dados mutaveis, Settings = configuracoes). Hooks wrapper sao enxutos e diretos.
2. **Design system fiel ao prototipo**: Os tokens de cor, tipografia, border-radius e animacoes no @theme do Tailwind v4 reproduzem com precisao os valores do prototipo HTML. A configuracao de prefers-reduced-motion e um diferencial de acessibilidade.
3. **Codigo limpo e idiomatico**: Todos os arquivos estao abaixo de 132 linhas (bem dentro do limite de 200). Zero console.log, zero TODOs, zero `any` no TypeScript. Nomes auto-explicativos em todo o codebase.
4. **Mock data isolado e correto**: Arrays em `src/data/` com copias no state (spread no useState), sem mutacao dos dados originais. Valores exatamente conforme PRD.
5. **Logica de pricing precisa**: As funcoes floor90/ceil90/round90 usam epsilon (1e-9) para evitar erros de ponto flutuante, exatamente como o prototipo. Guards para divisao por zero em calcMarkup/calcMargin.
6. **BottomNav pixel-perfect**: Height 74px, z-index 35, backdrop-filter blur(16px), fundo rgba(18,14,10,.92) — todos os valores conferem com o prototipo HTML.

## Compliance (codigo segue os docs?)

### Design & UI
- [x] Tokens de cor no @theme conferem com PRD e prototipo
- [x] Fontes Google carregadas corretamente (Cormorant Garamond + Jost)
- [x] Animacoes fadeup, glow, pop conferem com @keyframes do prototipo
- [x] prefers-reduced-motion tratado corretamente
- [x] Border-radius tokens (card, card-lg, input, chip, tile) corretos
- [x] Mobile-first (min-h-dvh, viewport-fit cover, theme-color)
- [x] Tiles de produto com gradientes corretos por categoria
- [x] Acessibilidade basica: botoes usam <button>, sem <div onClick>
- [ ] Textos pt-BR sem acentos — ver Warning 1 abaixo

### Arquitetura
- [x] Estrutura de pastas segue architecture.md exatamente
- [x] Path alias @/ configurado em vite.config.ts e tsconfig.app.json
- [x] cn() implementado corretamente com clsx + tailwind-merge
- [x] Codigo em ingles (variaveis, funcoes, componentes)
- [x] TypeScript strict com noUnusedLocals, noUnusedParameters, noUncheckedIndexedAccess
- [x] Sem `any` em nenhum arquivo
- [x] Sem `as Type` injustificado (apenas `as const` e cast necessario no BottomNav)
- [x] Nenhum arquivo acima de 200 linhas (maior: CartContext.tsx com 131 linhas)
- [x] React Router v6 com AppShell e Outlet conforme ADR-005
- [x] NewSalePage sem sub-rotas conforme ADR-004
- [x] State via React Context conforme ADR-001
- [x] Mock data em arquivos TS separados conforme ADR-002
- [x] Animacoes CSS-only conforme ADR-003

### Banco de Dados
Nao se aplica — projeto sem backend nesta fase.

## Qualidade de Codigo

### Code Smells
- [x] Sem duplicacao significativa
- [x] Sem God Class/Component
- [x] Sem Feature Envy
- [x] Sem Dead Code
- [x] Codigo segue DRY (tiles em constants, formatting em utils)

### Nomes e Legibilidade
- [x] Nomes auto-explicativos em todo o codebase
- [x] Funcoes descrevem o que fazem (formatCurrency, getCategoryTile, calcMarkup)
- [x] Componentes descrevem o que renderizam (ProductTile, StockBadge, BottomNav)
- [x] Nomes consistentes (padrao get/calc/format respeitado)
- [x] Sem abreviacoes desnecessarias

### Complexidade
- [x] Funcoes dentro dos limites (max ~20 linhas de logica)
- [x] Maximo 2 niveis de indentacao
- [x] Parametros por funcao dentro do limite (max 3)
- [x] Responsabilidade unica por componente

### Performance
- [x] Sem queries N+1 (mock data local)
- [x] useMemo para valores derivados nos contexts (todaySales, todayTotal, lowStockProducts, cartItems, cartTotal, cartCount)
- [x] useCallback para actions dos contexts
- [x] Sem imports pesados desnecessarios

### React Patterns
- [x] Nenhuma mutacao direta de estado
- [x] Sem useEffect problematico (nenhum useEffect no escopo da Sprint 1)
- [x] Keys corretas (product.id, tab.key, cat)
- [x] Sem prop drilling excessivo

### Acoplamento
- [x] Componentes shared nao dependem de contexts (recebem via props)
- [x] Logica de pricing em lib pura (sem dependencia de React)
- [x] Contexts consumidos via hooks wrapper (useCart, useData, useSettings)

## Seguranca
- [x] Nenhuma credencial no codigo-fonte (grep confirmou)
- [x] .env em .gitignore (patterns .env e .env.*)
- [x] .env.example tem apenas placeholders comentados
- [x] Nenhuma importacao de variaveis de ambiente no codigo
- [x] Supabase nao usado nesta fase (sem imports)

## Regressao
Regressao nao aplicavel — Sprint 1 e a primeira sprint, nao ha codigo anterior.

Nota: Sprint 2 ja esta implementada nos mesmos arquivos. A revisao do codigo Sprint 2 sera feita no review da Sprint 2. Verificacao rapida mostra que o codigo Sprint 2 (Dashboard, Login, Avisos, Settings) respeita a infraestrutura Sprint 1 — usa hooks (useData, useSettings), formatCurrency, ProductTile, etc.

## Resumo de Problemas

### Blockers
Nenhum.

### Warnings
1. **Textos pt-BR sem acentos em todo o codebase** — O prototipo (fonte de verdade do design) usa acentos corretos: "Inicio" no prototipo e "Inicio" no codigo (deveria ser "Inicio" vs "Inicio" — confirma-se: prototipo usa "Início", codigo usa "Inicio"). Tambem afeta: categorias ("Labios" vs "Labios" do prototipo — confirma-se "Lábios"), metodos de pagamento ("Cartao de credito" vs "Cartão de crédito"), e textos UI em geral. O impacto e sistematico: `src/types/index.ts` (tipo PaymentMethod e category), `src/data/*.ts`, `src/lib/constants.ts` (CATEGORY_TILES, PAYMENT_METHODS), `src/lib/utils.ts` (shortPayment), `src/components/layout/BottomNav.tsx` (label "Inicio"). A mudanca e mecanica (search-replace) mas atinge ~15 arquivos.
   - Arquivo(s): src/types/index.ts, src/data/*.ts, src/lib/constants.ts, src/lib/utils.ts, src/components/layout/BottomNav.tsx
   - Como corrigir: Atualizar o tipo `category` para `'Labios' | 'Rosto' | 'Olhos'` → `'Lábios' | 'Rosto' | 'Olhos'`, `PaymentMethod` para incluir acentos, e propagar para todos os data files, constants e shortPayment.

### Suggestions
1. **AC do backlog diverge da implementacao (round90 empate)** — Linha 92 do backlog espera `round90(50.40) === 50.90`, mas a implementacao (fiel ao prototipo) retorna `49.90` porque empate vai para floor (`(v-d) <= (u-v) ? d : u`). A implementacao esta CORRETA. Sugestao: corrigir o AC do backlog para `49.90`. Decisao ja arbitrada pelo orquestrador — nao e blocker.

2. **formatCurrency sem separador de milhar** — `formatCurrency(1000)` retorna `"R$ 1000,00"` em vez de `"R$ 1.000,00"`. Nenhum valor mock atinge 1000 nesta sprint, mas valores futuros (soma de vendas, precos com markup alto) podem. Sugestao: usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` ou adicionar separador manualmente.
   - Arquivo: src/lib/utils.ts:8-9

3. **"Consumidor final" em vendas sem estar na lista de clientes** — Comportamento esperado (venda avulsa). getInitials('Consumidor final') retorna 'CF' corretamente. Nao e problema — apenas documentar no PRD que vendas avulsas usam nome ad-hoc.

4. **@tanstack/react-query instalado mas nao usado** — Dependencia no package.json (dependencies) sem nenhuma importacao no codigo. Peso morto no bundle. Sugestao: remover ate a fase com backend.
   - Arquivo: package.json:14

5. **clsx e tailwind-merge em devDependencies** — Ambas sao importadas em codigo de runtime (`src/lib/utils.ts`). Em Vite isso funciona (bundle inclui tudo), mas convencionalmente deveriam estar em dependencies. Pode causar problemas em pipelines que rodam `npm install --production`.
   - Arquivo: package.json:27-28

6. **useSearch: accessor como dependencia do useMemo pode invalidar cache** — Se o chamador nao envolver `accessor` em useCallback, a referencia muda a cada render e o useMemo recomputa sempre. Considerar receber `accessor` como ref ou usar `useRef` internamente.
   - Arquivo: src/hooks/useSearch.ts:6-12

7. **Lacuna na arquitetura: alerts e promos sem hook/context** — A regra do architecture.md diz "Dados mock NUNCA sao importados diretamente nos componentes — sempre via hooks". Mas DataContext so cobre dados mutaveis (products, clients, sales). Alerts e promos sao estaticos e nao tem hook. O AlertsPage (Sprint 2) importa direto de `@/data/alerts`. Sugestao: criar useAlerts e usePromos como hooks simples que retornam os arrays, ou explicitar na regra que dados estaticos podem ser importados direto.

## Veredicto
Code Review Sprint 1 aprovado. Nenhum blocker encontrado. O warning de acentos (Warning 1) deve ser corrigido antes de avançar, pois afeta fidelidade ao prototipo em ~15 arquivos. As 7 suggestions sao pendencias tecnicas que podem ser tratadas em sprints futuras.
