# Code Review: Fase 2 Sprint 3 — CRUD Products + Stock

## Status: Aprovado com ressalvas

## Objetivo do Sprint
Produtos lidos e persistidos no Supabase. View products_display para esconder custo de funcionario. Hooks useProducts com TanStack Query. Soft delete via RPC admin-only. Testes adaptados.

## Tasks Validadas

| Task | Status | Observacao |
|------|--------|------------|
| useProducts (query via view products_display) | OK | Leitura pela view, active=true, order by name, toProduct mapper |
| useCreateProduct (mutation na tabela) | Ressalva | INSERT funcional com invalidateQueries, mas handleSave sem try/catch — ver Warning 1 |
| useUpdateProduct (mutation na tabela) | OK | Implementado, sem UI nesta sprint (arbitrado) |
| useSoftDeleteProduct (RPC admin-only) | OK | Chama soft_delete_product, botao visivel so para admin |
| StockPage (custo/margem condicional) | OK | Margem exibida so quando cost != null, delete so para admin |
| NewProductPage (custo/pricing condicional) | OK | Campo custo + PricingCards + botoes arredondamento ocultos para employee |
| NewSalePage (produtos reais) | OK | Usa useProducts diretamente, loading state, catalogo real |
| DataContext (fachada parcial) | OK | Products do Supabase, clients/sales ainda mock, productsLoading exposto |
| Testes (useProducts + DataContext) | OK | 6 testes cobrindo fetch, mapping, cost null, RPC, DataContext hibrido |

## Pontos Positivos

1. **Mascaramento de custo correto em todas as camadas** — A view products_display retorna cost=NULL para employee; StockPage exibe margem apenas quando `cost != null`; NewProductPage esconde campo custo, PricingCards, botoes de arredondamento e hint de markup para employee (`{isAdmin && ...}`). A protecao e coerente do banco ate a UI.
2. **PricingCards extraido** — O componente PricingCards (47 linhas) foi extraido de NewProductPage, resolvendo o warning de 216 linhas do review geral. NewProductPage agora tem 195 linhas, dentro do limite.
3. **Transicao hibrida DataContext bem desenhada** — DataContext consome useProducts (Supabase real) para products e lowStockProducts, mantendo clients/sales como mock ate a Sprint 4. O `productsLoading` e exposto para que consumidores tratem loading state. Nenhuma breaking change na interface do context.
4. **Testes cobrindo cenarios criticos** — useProducts.test.ts valida fetch, mapping snake para camelCase, cost null (employee view). DataContext.test.tsx valida o modelo hibrido, todaySales/todayTotal, addClient/addSale, getClientName. useSoftDeleteProduct testa chamada RPC correta.
5. **Delete admin-only com dupla protecao** — Botao lixeira visivel apenas para admin (`{isAdmin && ...}`). RPC `soft_delete_product` verifica `is_admin()` server-side. Employee sem botao na UI, e mesmo que burle a UI, o servidor nega.

## Compliance

### Leitura via view
- [x] useProducts query `products_display` (nao a tabela diretamente)
- [x] Filtro `active = true` na query
- [x] Ordenacao por `name` (A→Z)
- [x] Mapper toProduct converte snake_case para camelCase
- [x] cost retorna Number ou null conforme role (view CASE)

### Mutations na tabela
- [x] useCreateProduct faz INSERT em `products` (tabela, nao view)
- [x] useUpdateProduct faz UPDATE em `products` com campos parciais
- [x] useUpdateProduct trata `cost != null` para nao zerar custo por engano
- [x] useSoftDeleteProduct chama RPC `soft_delete_product`
- [x] Todas as mutations fazem `invalidateQueries(['products'])` no onSuccess
- [x] Todas tem toast de sucesso e onError com toast de erro

### Query Keys
- [x] Query key consistente: `['products']` para leitura e invalidacao

### Acentos
- [x] Categorias 'Labios', 'Rosto', 'Olhos' com acentos nos chips e dados
- [x] Textos UI pt-BR corretos: "Produto cadastrado com sucesso", "Produto removido", "Salvando..."

### Permissoes (PRD Matriz)
- [x] Employee pode criar produtos (PRD: "Funcionario pode cadastrar produto novo")
- [x] Employee nao ve custo/margem no Estoque (view retorna cost=null)
- [x] Employee nao ve campo custo, PricingCards, hint e botoes arredondamento no Novo Produto
- [x] Employee nao ve botao de exclusao no Estoque
- [x] Admin ve todas as funcionalidades
- [x] Enforcement server-side: RPC soft_delete_product verifica is_admin(); view products_display mascara cost

## Classificacao dos Achados do Test Map

### Achado 1 — StockPage sem empty-state nem UI de erro
Com 0 produtos ativos, a tela mostra area em branco (sem "Nenhum produto cadastrado"). Se a query falhar, nao ha mensagem de erro dedicada — so o toast global do QueryCache.
- **Classificacao: SUGGESTION** — O app inicia com 10 produtos seedados, entao o estado vazio e improvavel em uso real. O toast global do QueryCache fornece feedback ao usuario em caso de erro de rede. Mas uma mensagem de empty-state e um bloco `isError` melhorariam a UX.
- **Recomendacao:** Adicionar um bloco pos-`isPending` com `filtered.length === 0 && <p>Nenhum produto cadastrado</p>` e um bloco `isError && <p>Erro ao carregar produtos</p>`.

### Achado 2 — handleSave sem try/catch (unhandled rejection)
`handleSave` usa `await createProduct.mutateAsync(...)` seguido de `navigate('/estoque')`. Em erro, mutateAsync rejeita, navigate e pulado (correto), e onError mostra toast (correto). Mas a rejeicao propaga como unhandled promise rejection no console.
- **Classificacao: WARNING** — O comportamento funcional esta correto (usuario fica na tela, ve toast de erro). Mas a rejeicao nao tratada polui o console e pode confundir debugging. Resolver e trivial.
- **Recomendacao:** Envolver em try/catch: `try { await createProduct.mutateAsync({...}); navigate('/estoque') } catch { }` (o onError do hook ja cuida do toast). Alternativa: trocar para `.mutate({...}, { onSuccess: () => navigate('/estoque') })`.
- Arquivo: `src/pages/NewProductPage.tsx:65-74`

### Achado 3 — useUpdateProduct sem UI de edicao
Hook implementado mas nenhum componente o chama (StockPage nao tem botao editar).
- **Classificacao: SUGGESTION** — Ja arbitrado pelo team-lead: UI de edicao NAO entra no MVP (fidelidade ao prototipo). Hook permanece como infra pronta para uso futuro. Atualizar o backlog para refletir que edicao via UI e feature pos-MVP.

### Achado 4 — Employee e custo no cadastro (analise a fundo)

**(a) Schema aceita cost NULL?**
Nao. A migration define `cost numeric(10,2) NOT NULL CHECK (cost >= 0)`. Cost e obrigatorio e nao pode ser NULL.

**(b) NewProductPage esconde campo custo para employee?**
Sim. O campo custo esta dentro de `{isAdmin && ...}` (linha 108-122). Junto com ele, PricingCards, hint de markup e botoes de arredondamento tambem ficam ocultos. Employee ve apenas: Nome, Categoria, Preco venda, Quantidade em estoque, Salvar.

**(c) Employee envia cost, ha vazamento na resposta?**
O handleSave envia `cost: isAdmin ? cost : 0`. Employee sempre envia cost=0 (placeholder). A mutation faz `.insert(input).select().single()`, que retorna a linha inteira incluindo cost. Porem:
- O valor retornado e 0 (o que o employee acabou de enviar), nao um custo real sigiloso
- O return value da mutation nao e exibido na UI (onSuccess so invalida queries e mostra toast)
- Leituras subsequentes passam pela view products_display, que mascara cost para employee
- Nenhum custo real de outro produto e exposto

**Classificacao: SUGGESTION** — A implementacao e internamente consistente com o PRD e o schema. Employee cria produto sem custo (placeholder 0); admin preenche o custo real depois (via useUpdateProduct quando a UI de edicao existir). Nao ha vazamento de dado confidencial. Duas melhorias opcionais: (1) usar `.select('id')` em vez de `.select('*')` no INSERT para minimizar dados na resposta; (2) documentar no manual de uso que o admin precisa complementar o custo apos cadastro feito por employee.

## Qualidade de Codigo

### Code Smells
- [x] Sem duplicacao — PricingCards reutilizavel
- [x] Logica de margem condicional isolada na StockPage (nao espalhada)
- [x] Hooks com responsabilidade unica (useProducts = leitura, useCreateProduct = criacao, etc.)

### Nomes e Legibilidade
- [x] Hooks nomeados conforme convencao TanStack Query (useCreate*, useSoftDelete*)
- [x] isAdmin usado consistentemente para controle de visibilidade

### Complexidade
- [x] NewProductPage 195 linhas (dentro do limite de 200, corrigido do review anterior)
- [x] StockPage 80 linhas
- [x] useProducts.ts 107 linhas

### React Patterns
- [x] isPending (TQ v5, nao isLoading)
- [x] invalidateQueries no onSuccess de todas as mutations
- [x] key={product.id} em todas as listas
- [x] Loading state no botao Salvar (disabled + "Salvando...")

### Acoplamento
- [x] Hooks de produto independentes (nao dependem de contexts)
- [x] StockPage e NewProductPage consomem hooks diretamente (nao via DataContext)
- [x] DataContext consome useProducts (composicao, nao duplicacao)

## Seguranca

- [x] Leitura pela view products_display (cost mascarado para employee)
- [x] Soft delete via RPC com is_admin() server-side
- [x] Botao delete oculto para employee na UI (dupla protecao)
- [x] Employee envia cost=0 (placeholder), nao ve custo real
- [x] INSERT na tabela products (nao na view) — correto, view e somente leitura
- [x] Nenhuma credencial no codigo

## Resumo de Problemas

### Blockers
Nenhum.

### Warnings (deveria corrigir)
1. **handleSave sem try/catch** — `NewProductPage.tsx:65-74` usa `await mutateAsync` sem try/catch. Em erro, a rejeicao propaga como unhandled promise rejection no console. O comportamento funcional esta correto (usuario fica na tela, toast de erro), mas o console fica poluido.
   - Arquivo: `src/pages/NewProductPage.tsx:65-74`
   - Como corrigir: `try { await createProduct.mutateAsync({...}); navigate('/estoque') } catch { }` ou trocar para `.mutate({...}, { onSuccess: () => navigate('/estoque') })`.

### Suggestions (poderia melhorar)
1. **StockPage sem empty-state nem UI de erro** — Adicionar mensagem para 0 produtos e para erro de query. Estado vazio improvavel com seed, mas melhora a robustez.

2. **useUpdateProduct sem UI** — Hook pronto, UI de edicao e pos-MVP (arbitrado). Atualizar backlog.

3. **Employee e custo no cadastro** — Implementacao consistente (cost=0 placeholder, campo oculto, view mascara leitura). Considerar `.select('id')` no INSERT para minimizar resposta, e documentar que admin complementa custo depois.

4. **useCreateProduct `.select('*')` retorna linha completa** — Minimizar para `.select('id')` evita retornar colunas desnecessarias na resposta da mutation.

## Veredicto
Code Review Fase 2 Sprint 3 aprovado com 1 warning. O mascaramento de custo por role esta correto em todas as camadas (schema, view, UI). O soft delete e admin-only com dupla protecao (UI + RPC). O warning do handleSave e uma correcao de 1 linha. A transicao hibrida do DataContext esta limpa. Testes cobrem os cenarios criticos.
