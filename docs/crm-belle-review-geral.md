# Code Review Geral: CRM Studio Belle — MVP

## Status: Aprovado com ressalvas

## Resumo de Sprints
| Sprint | Status | Observacao |
|--------|--------|------------|
| Sprint 1: Fundacao | OK | Revisado e aprovado anteriormente |
| Sprint 2: Login, Dashboard, Avisos, Config | OK | Fiel ao prototipo, componentes bem decompostos |
| Sprint 3: Fluxo de Vendas | Ressalva | 2 acentos faltando em textos UI (CartBar, SaleSuccessOverlay) |
| Sprint 4: Estoque, Novo Produto, Clientes, Promos | Ressalva | NewProductPage excede 200 linhas |

## Cobertura do MVP (vs PRD)
| Funcionalidade do PRD | Status |
|----------------------|--------|
| Login visual (sem auth) | OK |
| Dashboard (vendas hoje, quick actions, Sophia, estoque baixo) | OK |
| Nova Venda — catalogo (busca, filtro, lista/grade, carrinho) | OK |
| Nova Venda — checkout (itens, cliente, pagamento, total) | OK |
| Client Picker (bottom sheet, busca, cadastro) | OK |
| Overlay venda registrada | OK |
| Historico de vendas | OK |
| Estoque (lista, busca, margem, badges) | OK |
| Novo Produto (calculo live markup/margem, round90) | OK |
| Clientes (lista, tags VIP/Aniversario) | OK |
| Promocoes (3 cards Sophia, badges, precos) | OK |
| Avisos (4 notificacoes por tipo) | OK |
| Configuracoes (toggles, markup, perfil, loja) | OK |
| BottomNav (5 tabs, visibilidade condicional) | OK |

## Pontos Positivos do MVP

1. **Fluxo de venda robusto e integrado**: O snapshot de dados antes do confirmSale no NewSalePage garante que o overlay exibe informacoes corretas mesmo apos o cart ser limpo. A nova venda aparece no historico e atualiza os totais do dashboard — o fluxo ponta-a-ponta funciona sem gaps.
2. **Correcao de acentos bem aplicada nos arquivos core**: Os 18+ arquivos da fundacao (types, data, constants, utils, BottomNav, dashboard, settings) tiveram acentos corrigidos coerentemente — nenhuma regressao nos union types ou nas comparacoes de string.
3. **Decomposicao adequada dos componentes**: Cada tela e composta de componentes menores reutilizaveis (ProductListItem, ProductGridItem, CartBar, CheckoutItemList, PaymentGrid, ConfirmButton, ClientPicker, PromoCard, SophiaIntroCard, ClientCard, StockBadge). Nenhuma pagina tenta fazer tudo sozinha.
4. **Calculo de pricing consistente**: NewProductPage usa as mesmas funcoes de pricing (round90, floor90, ceil90, calcMarkup, calcMargin) e respeita o defaultMarkup do SettingsContext. O controle de markup em Config propaga corretamente para Novo Produto.
5. **ConfirmButton com 3 estados bem definidos**: A logica de label e disabled state cobre todos os cenarios (sem cliente, sem pagamento, pronto para confirmar) e o botao desabilitado usa cursor not-allowed + visual diferenciado.
6. **Package.json limpo**: @tanstack/react-query (nao usado) foi removido e clsx/tailwind-merge foram movidos para dependencies (correcao de 2 suggestions da Sprint 1).

## Regressao (correcoes de acentos)

Verificacao dos union types e comparacoes de string apos a correcao sistematica de acentos:

- [x] `Product.category`: `'Labios' | 'Rosto' | 'Olhos'` → `'Labios' | 'Rosto' | 'Olhos'` (confirma-se 'Labios' com acento) — OK em types, data/products, constants (CATEGORY_TILES), NewProductPage (PRODUCT_CATEGORIES), CategoryChips chamadas
- [x] `PaymentMethod`: `'Cartao de credito' | 'Cartao de debito'` → `'Cartao de credito' | 'Cartao de debito'` (confirma-se com acento) — OK em types, data/sales, constants (PAYMENT_METHODS), utils (shortPayment), PaymentGrid
- [x] `shortPayment()`: compara contra `'Cartao de credito'` e retorna `'Credito'` — OK com acentos
- [x] BottomNav label: 'Inicio' → 'Inicio' (confirma-se 'Inicio' com acento) — OK
- [x] Dashboard textos: "Sab", "Ola" → com acentos — OK
- [x] SalesTodayCard: "Ver historico →", "Ticket medio" → com acentos — OK
- [x] SophiaSuggestions: "esta parada ha", "aniversario" → com acentos — OK
- [x] SettingsPage: "Configuracoes", "Notificacoes", "Precificacao" → com acentos — OK
- [x] ToggleGroup labels: "Sugestoes de promocao", "Aniversarios", "diario" → com acentos — OK
- [x] MarkupControl: "Markup padrao" → com acento — OK
- [x] ShopInfo: "Pix, Cartao" → com acento — OK
- [x] StatsCards: "Este mes", "Meta do mes" → com acentos — OK
- [x] HistoryPage: "Historico", "Este mes" → com acentos — OK
- [x] ClientCard/ClientPicker: "Ult. compra" → com acento — OK
- [x] NewProductPage: "Labios" nos chips, "markup padrao de" → com acentos — OK
- [x] PromosPage: "Promocoes" → com acento — OK
- [x] Promos data: "Mascara", "Labios", "TICKET MEDIO", "aniversario" → com acentos — OK
- [ ] **CartBar.tsx linha 35**: "Avancar" → falta cedilla, deveria ser "Avancar" com cedilha
- [ ] **SaleSuccessOverlay.tsx linha 55**: "Voltar ao inicio" → falta acento, deveria ser "inicio" com acento

**Veredicto de regressao:** 2 arquivos novos da Sprint 3 nao receberam a correcao de acentos. Todos os arquivos corrigidos no ciclo anterior estao integros.

## Compliance (codigo novo segue os docs?)

### Design & UI
- [x] Login: logo, campos pre-preenchidos, fadeup, gradiente dourado — confere com prototipo
- [x] Dashboard: 6 secoes na ordem correta, vendas hoje calculado, dot glow da Sophia
- [x] Avisos: dots coloridos por tipo, labels uppercase, timestamps
- [x] Configuracoes: perfil, toggles, markup com exemplo live, botao sair
- [x] Nova Venda step 1: lista/grade, busca + filtro combinados, cart bar com pop
- [x] Nova Venda step 2: checkout com itens +/-, cliente, pagamento 2x2, total, confirm 3 estados
- [x] Client Picker: backdrop blur 3px, handle, form toggle, busca, max-height 78%
- [x] Overlay sucesso: blur 4px, check verde 88x88, fadeup + pop
- [x] Historico: cards resumo + lista com avatar/iniciais/pagamento abreviado
- [x] Estoque: busca, margem calculada, StockBadge com cores por threshold
- [x] Novo Produto: calculo live, round90, botoes arredondar, cards markup/margem, hint dinamico
- [x] Clientes: tags ANIVERSARIO/VIP, iniciais, "Ult. compra"
- [x] Promocoes: 3 cards, badges, preco riscado, economia verde, dot glow
- [x] Acessibilidade: todos os interativos sao <button>, sem <div onClick> problematico
- [ ] 2 textos pt-BR sem acento em arquivos novos (ver Warnings)

### Arquitetura
- [x] Estrutura de pastas segue architecture.md (pages/, components/feature/, hooks/, contexts/)
- [x] Dados acessados via hooks (useCart, useData, useSettings) — nenhum componente de feature importa de src/data/ diretamente (AlertsPage e PromosPage sao casos de dados estaticos ja identificados na Sprint 1)
- [x] Logica de pricing centralizada em lib/pricing.ts — nenhuma duplicacao
- [x] Valores monetarios formatados com formatCurrency() — nenhum inline
- [x] Gradientes dourados via inline style (conforme regra da arquitetura)
- [x] Code em ingles, UI em portugues
- [x] Path alias @/ usado em todos os imports
- [x] TypeScript strict sem any
- [ ] NewProductPage.tsx com 216 linhas excede o limite de 200 (ver Warnings)

### Integracao entre modulos
- [x] CartContext: carrinho preservado entre step 1 (produtos) e step 2 (checkout) via cart.step
- [x] DataContext: nova venda adicionada via confirmSale aparece em todaySales, todayTotal, todayCount
- [x] SettingsContext: defaultMarkup em Config propaga para preco sugerido em Novo Produto
- [x] BottomNav: tab mapping correto (vendas+historico → Vendas, estoque+produto → Estoque)
- [x] Novo produto cadastrado aparece no catalogo de vendas e na lista de estoque
- [x] Novo cliente cadastrado via ClientPicker aparece na lista de clientes

## Qualidade de Codigo

### Code Smells
- [x] Sem duplicacao significativa entre componentes
- [x] Sem God Component (NewSalePage gerencia 3 views mas delega rendering corretamente)
- [ ] NewProductPage com 216 linhas — poderia extrair os cards de Markup/Margem e Lucro para um componente PricingCards

### Nomes e Legibilidade
- [x] Nomes auto-explicativos: handleConfirmSale, handleRoundDown, handleSaveNew
- [x] Componentes descrevem o que renderizam: SaleSuccessOverlay, CheckoutItemList, CartBar
- [x] Consistencia: todos os handlers usam prefixo handle*

### Complexidade
- [x] Funcoes dentro dos limites (max ~20 linhas de logica)
- [x] Maximo 3 niveis de indentacao (ternario de view modes em NewSalePage)
- [ ] NewProductPage: 216 linhas (excede 200)

### Performance
- [x] Sem queries N+1
- [x] useMemo/useCallback usados nos contexts e hooks
- [x] Listas com keys adequadas nos componentes de venda (product.id, sale.id)

### React Patterns
- [x] Sem mutacao direta de estado
- [x] Sem useEffect com cleanup faltando (nenhum subscription)
- [x] confirmSale corretamente salva snapshot antes de limpar cart
- [ ] key={index} em listas dinamicas: ClientsPage e ClientPicker usam key={index} para clientes (Client nao tem campo id — venda avulsa pode adicionar clientes). Funcional no MVP mas fragilidade em re-renders.

### Acoplamento
- [x] Componentes de venda (CartBar, CheckoutItemList, PaymentGrid, ConfirmButton) acessam cart via hook useCart — sem prop drilling
- [x] Componentes de produto (ProductListItem, ProductGridItem) recebem dados via props — sem dependencia de context
- [x] Logica de pricing e utils sao funcoes puras sem dependencia de React

## Seguranca
- [x] Nenhuma credencial no codigo-fonte
- [x] .env em .gitignore, nao importado em nenhum arquivo
- [x] Sem chamadas de rede, sem Supabase
- [x] Sem XSS (todo input e controlado via React state, sem dangerouslySetInnerHTML)

## Resumo de Problemas

### Blockers
Nenhum.

### Warnings (deveria corrigir)
1. **CartBar.tsx "Avancar →"** — Falta cedilla, deveria ser "Avancar" com cedilha. Texto visivel ao usuario no botao do carrinho flutuante. Regressao parcial: os arquivos core foram corrigidos mas este arquivo novo da Sprint 3 ficou sem acento.
   - Arquivo: `src/components/sale/CartBar.tsx:35`
   - Como corrigir: trocar "Avancar" por "Avancar" com cedilha

2. **SaleSuccessOverlay.tsx "Voltar ao inicio"** — Falta acento no i, deveria ser "inicio" com acento. Texto visivel ao usuario no overlay de venda registrada.
   - Arquivo: `src/components/sale/SaleSuccessOverlay.tsx:55`
   - Como corrigir: trocar "inicio" por "inicio" com acento

3. **NewProductPage.tsx com 216 linhas** — Excede o limite de 200 linhas definido na arquitetura. O formulario com calculo live, botoes de arredondamento, cards de markup/margem e campo de estoque pode ser decomposto.
   - Arquivo: `src/pages/NewProductPage.tsx`
   - Como corrigir: extrair linhas 157-194 (cards markup/margem + lucro) para um componente `PricingCards` em `src/components/product/PricingCards.tsx`

### Suggestions (poderia melhorar)
1. **CartBar pluralizacao**: "1 itens" quando cartCount === 1 — deveria ser "1 item". O HistoryPage ja implementa pluralizacao correta com `items > 1 ? 'itens' : 'item'`.
   - Arquivo: `src/components/sale/CartBar.tsx:23`

2. **key={index} em listas dinamicas de clientes**: ClientsPage (linha 26) e ClientPicker (linha 133) usam `key={index}` para listas de clientes que podem crescer via addClient. O tipo Client nao tem campo `id`, entao index e a unica opcao disponivel. Funcional no MVP mas fragil se a lista for re-ordenada.
   - Arquivos: `src/pages/ClientsPage.tsx:26`, `src/components/client/ClientPicker.tsx:133`

3. **ClientPicker cria objeto Client duplicado**: handleSaveNew cria um `newClient` local e tambem chama `addClient()` que cria outro objeto no DataContext. Ambos tem os mesmos valores mas sao referencias diferentes. Funcional porque confirmSale usa `client.name`, mas poderia unificar.
   - Arquivo: `src/components/client/ClientPicker.tsx:33-43`

4. **AlertsPage e PromosPage importam direto de src/data/**: Ambos importam arrays estaticos (`alerts`, `promos`) diretamente, sem hook intermediario. A arquitetura diz "dados mock nunca importados diretamente" mas esses dados sao estaticos e imutaveis. Ja identificado na Sprint 1.

## Achados do Test Map (avaliacao)

1. **Ticket medio divergente (105,15 vs 52,58)** — Ja arbitrado: calculo dinamico e correto. O valor 52,58 do prototipo era inconsistente com os proprios dados mock.

2. **round90 em empate → floor** — Ja arbitrado: fiel ao prototipo.

3. **"Este mes R$ 6.240" e "Meta 68%" hardcoded** — Ja aceito no MVP: valores estaticos que nao reagem a novas vendas.

4. **Overlay "Voltar ao inicio" nao chama clearCart** — Nao e bug: confirmSale ja limpou o carrinho antes de mostrar o overlay. Comportamento correto.

## Veredicto
Code Review Geral aprovado com ressalvas. Zero blockers. Os 3 warnings sao correcoes simples: 2 acentos faltando em textos UI (2 edits de string) e 1 arquivo levemente acima do limite de linhas (extrair componente). As 4 suggestions sao pendencias tecnicas nao-bloqueantes.
