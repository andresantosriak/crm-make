# Backlog — CRM Studio Belle: Fase 2 (Supabase + Auth)

> A fase 2 substitui os dados mock por persistencia real no Supabase e implementa autenticacao
> multi-usuario com roles (admin e funcionario). O DataContext cede lugar a TanStack Query +
> Supabase client, mantendo os contratos publicos dos hooks intactos (ADR-002 Swap). A migration
> SQL esta pronta no Data Architecture e sera aplicada na Sprint 1. Cada sprint entrega algo
> testavel de ponta a ponta — a primeira garante infra funcional, a segunda auth real, a terceira
> e quarta implementam os CRUDs com dados persistentes, e a quinta resolve derivados e pendencias.

**Sprints (ordem de execucao):**
1. Sprint 1 — Infra Supabase (objetivo: projeto linkado, banco criado, client configurado, TanStack Query pronto)
2. Sprint 2 — Auth (objetivo: login real, rotas protegidas, roles no JWT, tela de usuarios)
3. Sprint 3 — CRUD Products + Stock (objetivo: produtos persistidos no Supabase com view de custo condicional)
4. Sprint 4 — CRUD Clients + Sales (objetivo: clientes e vendas persistidos, fluxo de venda atomico via RPC)
5. Sprint 5 — Derivados, Pendencias e Cleanup (objetivo: dashboard com dados reais, alertas derivados, pendencias da fase 1 resolvidas)

**Gerado em:** 2026-07-20
**Baseado em:** PRD fase 2 v1, Security Review v1, Data Architecture v1, Architecture v1, decisions.md

**Notas:**
- Stack: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + Supabase
- 101 testes existentes (Vitest) — adaptar, nao descartar
- DataContext e o ponto de swap (ADR-002)
- Migration SQL completa disponivel em `docs/crm-belle-data-architecture.md` secao DDL
- Admin inicial provisionado via script com env vars (senha nunca em codigo commitado)
- Sem rastreio /gp nesta fase (decisao registrada em `docs/decisions.md`)
- Acoes que exigem configuracao manual do usuario no Dashboard do Supabase estao marcadas com **[MANUAL-USER]**

---

## Sprint 1 — Infra Supabase

**Objetivo da sprint:** Projeto linkado ao Supabase, banco criado com todas as tabelas/RLS/triggers/RPCs, seeds aplicados, client Supabase configurado no frontend com TanStack Query provider pronto. O app compila e roda (ainda com mock data nos hooks, mas infra pronta para swap).
**Pre-requisitos:** nenhum
**Definition of Done:** `npm run build` sem erros; `npx supabase db push` aplicado; seed de admin + dados executado; dev server inicia sem erros; TanStack Query provider funcional.

### Task 1.1 — Linkar projeto Supabase e configurar .env

- **Tipo:** chore
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** Modificar: `.env.example`, `.gitignore`; Criar: `.env.local` (nao commitado)
- **Resultado esperado:** Projeto Supabase linkado via CLI; `.env.local` com `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `ADMIN_INITIAL_PASSWORD`; `.env.example` atualizado com placeholders; `.gitignore` com excecao `!.env.example`
- **Acoes manuais do desenvolvedor:** **[MANUAL-USER]**
  - [ ] Ter um projeto Supabase criado (ou usar existente com project ref `zaagonljdeefmylnpgrj`)
  - [ ] Fornecer as variaveis: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key), `SUPABASE_SECRET_KEY` (service_role_key), `ADMIN_INITIAL_PASSWORD` (senha forte 12+ chars)
  - [ ] Popular `.env.local` com os valores reais
- **Criterios de aceite:**
  - [ ] `.env.local` criado com as 4 variaveis (valores reais do usuario)
  - [ ] `.env.example` atualizado com placeholders e comentarios de seguranca
  - [ ] `.gitignore` contem `!.env.example` para garantir tracking do example
  - [ ] Nenhuma secret com prefixo `VITE_` (exceto URL e anon key)

### Task 1.2 — Criar migration SQL e aplicar no banco

- **Tipo:** chore
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 1.1
- **Arquivos esperados:** Criar: `supabase/migrations/<timestamp>_fase2_initial.sql`
- **Resultado esperado:** Migration com DDL completo (copiado de `docs/crm-belle-data-architecture.md` secao DDL): helper functions, 6 tabelas com RLS + indices + triggers, Auth Hook, trigger handle_new_user, view products_display, RPCs (create_sale, soft_delete_product, soft_delete_client, cancel_sale), trigger de estoque. Aplicada via `npx supabase db push`.
- **Criterios de aceite:**
  - [ ] `npx supabase db push` executa sem erros
  - [ ] 6 tabelas criadas: profiles, products, clients, sales, sale_items, store_settings
  - [ ] RLS habilitado em todas as 6 tabelas
  - [ ] View `products_display` criada
  - [ ] 4 RPCs disponiveis: create_sale, soft_delete_product, soft_delete_client, cancel_sale
  - [ ] Auth Hook function `custom_access_token_hook` criada com GRANTs

### Task 1.3 — Executar seeds (store_settings, admin, dados demo)

- **Tipo:** chore
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 1.2
- **Arquivos esperados:** Criar: `scripts/seed-admin.ts`, `scripts/seed-data.sql`
- **Resultado esperado:** Script `seed-admin.ts` cria o admin inicial via `supabase.auth.admin.createUser()` usando env vars. SQL seed insere store_settings (singleton), 10 products, 5 clients, 6 sales com sale_items (trigger de estoque desabilitado durante seed). Dados coerentes com `docs/crm-belle-data-architecture.md` secao Seed.
- **Criterios de aceite:**
  - [ ] Script `seed-admin.ts` cria admin com email `andresantos.riak@gmail.com` e role admin
  - [ ] Trigger `handle_new_user` cria profile automaticamente apos seed do admin
  - [ ] store_settings com valores default (markup 180, low_stock 5, vip 500, etc.)
  - [ ] 10 produtos, 5 clientes, 6 vendas com sale_items inseridos
  - [ ] Nenhuma senha ou secret hardcoded no codigo commitado

### Task 1.4 — Instalar deps e configurar Supabase client + TanStack Query

- **Tipo:** chore
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 1.1
- **Arquivos esperados:** Modificar: `package.json`, `src/App.tsx` (ou root); Criar: `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`
- **Resultado esperado:** Instalar `@supabase/supabase-js`, `@tanstack/react-query`, `sonner`. Criar client Supabase com validacao de env vars em runtime. Gerar tipos via `npx supabase gen types typescript`. Adicionar `QueryClientProvider` e `Toaster` no root do app. Tipos TS do banco gerados e disponiveis.
- **Criterios de aceite:**
  - [ ] `@supabase/supabase-js`, `@tanstack/react-query` e `sonner` no `package.json`
  - [ ] `src/integrations/supabase/client.ts` com `createClient` e validacao de env vars
  - [ ] `src/integrations/supabase/types.ts` gerado com `npx supabase gen types typescript`
  - [ ] `QueryClientProvider` no root do app (acima do `BrowserRouter`)
  - [ ] `Toaster` do sonner renderizado no root
  - [ ] `npm run build` compila sem erros

### Task 1.5 — Criar tipos de aplicacao (camelCase) e helpers de mapeamento

- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** Task 1.4
- **Arquivos esperados:** Modificar: `src/types/index.ts`; Criar: `src/lib/mappers.ts`
- **Resultado esperado:** Atualizar `src/types/index.ts` com as interfaces de aplicacao da fase 2 (Product com `id: string`, `active`, `createdBy`; Client com `id: string`, `phone`, `birthday`, `totalSpent`, `lastPurchase`; Sale com UUID e `refundedAt`; StoreSettings; Profile). Criar `src/lib/mappers.ts` com funcoes de conversao `snake_case` → `camelCase` para cada entidade (conforme tabela de mapeamento do Data Architecture).
- **Criterios de aceite:**
  - [ ] Product.id e `string` (UUID), nao mais `number`
  - [ ] Client tem `id: string`, `phone`, `birthday`, `totalSpent?`, `lastPurchase?`
  - [ ] Sale tem `id: string`, `clientId`, `paymentMethod`, `refundedAt`, `createdBy`
  - [ ] StoreSettings e Profile definidos
  - [ ] Mappers `toProduct()`, `toClient()`, `toSale()`, etc. implementados
  - [ ] `npm run build` compila sem erros

---

## Sprint 2 — Auth

**Objetivo da sprint:** Login real com Supabase Auth funcional, rotas protegidas, role no JWT via Auth Hook, tela de gerenciamento de usuarios acessivel apenas para admin, Edge Function create-user deployada.
**Pre-requisitos:** Sprint 1 concluida
**Definition of Done:** Login funcional com credenciais reais; rotas protegidas redirecionam para /login; admin acessa /usuarios; funcionario nao acessa /usuarios; Edge Function create-user deployada e funcional; `npm run build` sem erros.

### Task 2.1 — Ativar Auth Hook e desabilitar signup publico

- **Tipo:** chore
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Resultado esperado:** Auth Hook ativado no Dashboard; signup publico desabilitado; password policy ajustada.
- **Acoes manuais do desenvolvedor:** **[MANUAL-USER]**
  - [ ] Dashboard > Authentication > Hooks > Customize Access Token (JWT) Claims > selecionar schema `public`, function `custom_access_token_hook`
  - [ ] Dashboard > Authentication > Providers > Email > desabilitar "Enable Sign Up" (OFF)
  - [ ] Dashboard > Authentication > Settings > ajustar password policy (minimo 8 caracteres)
- **Criterios de aceite:**
  - [ ] Auth Hook ativo e injetando role no JWT (`app_metadata.role`)
  - [ ] Signup publico desabilitado (tentativa de signup retorna erro)
  - [ ] Password policy com minimo 8 chars

### Task 2.2 — Implementar AuthContext e hook useAuth

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 1.4
- **Stories cobertas:** PRD secao 2 (Modelo de Autenticacao)
- **Arquivos esperados:** Criar: `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`
- **Resultado esperado:** AuthContext que gerencia sessao via `supabase.auth.getSession()` + `onAuthStateChange`. Hook `useAuth()` expoe: `user`, `session`, `profile` (com role), `isAdmin`, `isLoading`, `signIn(email, password)`, `signOut()`. Provider adicionado no root (acima do CartProvider, abaixo do QueryClientProvider).
- **Criterios de aceite:**
  - [ ] `useAuth()` retorna user, session, profile com role
  - [ ] `isAdmin` derivado de `session.user.app_metadata.role === 'admin'`
  - [ ] `signIn` chama `supabase.auth.signInWithPassword()`
  - [ ] `signOut` chama `supabase.auth.signOut()` (invalida refresh token server-side)
  - [ ] `onAuthStateChange` monitora mudancas de sessao
  - [ ] Loading state durante verificacao inicial de sessao

### Task 2.3 — Implementar ProtectedRoute e AdminRoute

- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** Task 2.2
- **Stories cobertas:** PRD secao 2 (Protecao de rotas)
- **Arquivos esperados:** Criar: `src/components/auth/ProtectedRoute.tsx`, `src/components/auth/AdminRoute.tsx`; Modificar: `src/App.tsx`
- **Resultado esperado:** `ProtectedRoute` redireciona para `/login` se nao autenticado (mostra loading durante verificacao). `AdminRoute` redireciona para `/` se autenticado mas nao admin. Routing atualizado: todas as rotas (exceto /login) wrappadas em `ProtectedRoute`; rota `/usuarios` wrappada em `AdminRoute`.
- **Criterios de aceite:**
  - [ ] Usuario nao autenticado e redirecionado para `/login` em qualquer rota
  - [ ] Admin acessa todas as rotas incluindo `/usuarios`
  - [ ] Funcionario acessa todas as rotas exceto `/usuarios` (redirecionado para `/`)
  - [ ] Loading spinner durante verificacao de sessao (nao flash de login)
  - [ ] Rota `/usuarios` adicionada ao routing

### Task 2.4 — Refatorar LoginPage com auth real

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 2.2, Task 2.3
- **Stories cobertas:** PRD secao 2 (Fluxo de login)
- **Arquivos esperados:** Modificar: `src/pages/LoginPage.tsx`
- **Resultado esperado:** Campos email e senha vazios (sem pre-preenchimento). Submit chama `signIn(email, password)`. Loading state no botao "Entrar". Mensagem de erro abaixo do botao em caso de falha. Link "Entrar com biometria" desabilitado (opacity reduzida + tooltip "Em breve"). Redirect para Dashboard apos login bem-sucedido. Se ja autenticado, redireciona direto para Dashboard.
- **Criterios de aceite:**
  - [ ] Campos email e senha vazios por padrao
  - [ ] Login real via Supabase Auth funcional
  - [ ] Loading state no botao durante autenticacao
  - [ ] Mensagem de erro visivel em caso de falha ("Email ou senha incorretos")
  - [ ] Redirect para `/` apos login bem-sucedido
  - [ ] Link biometria desabilitado visualmente
  - [ ] Se ja autenticado, `/login` redireciona para `/`

### Task 2.5 — Criar Edge Function create-user e tela /usuarios

- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 2.3
- **Stories cobertas:** PRD secao 10 (Tela de Usuarios), PRD secao 12 (Edge Functions)
- **Arquivos esperados:** Criar: `supabase/functions/create-user/index.ts`, `src/pages/UsersPage.tsx`, `src/hooks/useUsers.ts`
- **Resultado esperado:** Edge Function `create-user` que: valida JWT do caller e confirma role admin; valida input (email, full_name, role) com Zod; cria usuario via `supabase.auth.admin.createUser()` com `email_confirm: true`; retorna 401/403/422/429 conforme necessario; nunca expoe secrets nos erros. Tela `/usuarios` acessivel apenas para admin, com: header "Equipe", botao "Convidar" que abre formulario, lista de usuarios com avatar/nome/email/role/status, acoes de editar role e desativar. Hook `useUsers()` com query e mutations.
- **Acoes manuais do desenvolvedor:** **[MANUAL-USER]**
  - [ ] Registrar secret na Edge Function: `npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<value>`
  - [ ] Deploy da Edge Function: `npx supabase functions deploy create-user`
- **Criterios de aceite:**
  - [ ] Edge Function valida JWT e verifica role admin antes de criar
  - [ ] Input validado com Zod (email, full_name, role enum)
  - [ ] Erros retornados genericos ao client ("Erro ao criar usuario")
  - [ ] Tela /usuarios exibe lista de usuarios com role e status
  - [ ] Admin pode convidar novo usuario (nome, email, role)
  - [ ] Admin pode alterar role de outro usuario
  - [ ] Admin pode desativar usuario (nao pode desativar a si mesmo)
  - [ ] Funcionario redirecionado ao tentar acessar /usuarios

### Task 2.6 — Adicionar logout e ajustar SettingsPage e Dashboard com usuario logado

- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** Task 2.2
- **Stories cobertas:** PRD secao 11 (Alteracoes em telas existentes)
- **Arquivos esperados:** Modificar: `src/pages/SettingsPage.tsx`, `src/pages/DashboardPage.tsx`, `src/components/settings/ProfileCard.tsx`
- **Resultado esperado:** Botao "Sair da conta" em Configuracoes executa `signOut()`. ProfileCard exibe nome do usuario logado (de `profiles.full_name`). Dashboard header usa nome do usuario logado na saudacao. Secao "Equipe" em Settings com link para `/usuarios` (visivel apenas para admin). Secao "Loja" em Settings visivel apenas para admin.
- **Criterios de aceite:**
  - [ ] Logout funcional (limpa sessao, redireciona para /login)
  - [ ] Nome do usuario logado exibido em Settings e Dashboard
  - [ ] Secao "Equipe" com link para /usuarios visivel apenas para admin
  - [ ] Secao "Loja" em Settings visivel apenas para admin
  - [ ] Funcionario ve Settings sem secoes "Equipe" e "Loja"

---

## Sprint 3 — CRUD Products + Stock

**Objetivo da sprint:** Produtos lidos e persistidos no Supabase. View `products_display` usada para esconder custo de funcionario. Hooks `useProducts` com TanStack Query substituem o DataContext para produtos. Testes adaptados.
**Pre-requisitos:** Sprint 2 concluida
**Definition of Done:** Produtos persistem entre sessoes; custo/margem invisiveis para funcionario; `npm run build` sem erros; testes de produtos adaptados e passando.

### Task 3.1 — Criar hook useProducts com TanStack Query

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** PRD secao 7 (Estrategia de Migracao)
- **Arquivos esperados:** Criar: `src/hooks/useProducts.ts`
- **Resultado esperado:** Hook `useProducts()` com: `useQuery` para listar produtos via `products_display` (filtrando `active = true`); `useCreateProduct` mutation (INSERT em products + invalidateQueries); `useUpdateProduct` mutation (UPDATE em products + invalidateQueries); `useSoftDeleteProduct` mutation (RPC `soft_delete_product` + invalidateQueries). Query key: `['products']`. Mapeia snake_case para camelCase via mappers.
- **Criterios de aceite:**
  - [ ] `useProducts()` retorna lista de produtos do Supabase (via `products_display`)
  - [ ] `cost` retorna `null` para funcionario (view condicional)
  - [ ] Mutation de criar produto persiste no banco e invalida cache
  - [ ] Mutation de atualizar produto persiste e invalida
  - [ ] Soft delete via RPC funcional (apenas admin)
  - [ ] Loading e error states disponiveis

### Task 3.2 — Refatorar telas StockPage e NewProductPage para usar useProducts

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 3.1
- **Stories cobertas:** PRD secao 11 (Estoque, Novo Produto)
- **Arquivos esperados:** Modificar: `src/pages/StockPage.tsx`, `src/pages/NewProductPage.tsx`
- **Resultado esperado:** StockPage usa `useProducts()` em vez de `useData().products`. Coluna custo/margem condicionalmente visivel (escondida quando `cost === null`, ou seja, funcionario). NewProductPage usa mutation `useCreateProduct` para salvar no banco. Toast de confirmacao via sonner apos salvar. Loading state no botao salvar. Validacao de campos obrigatorios.
- **Criterios de aceite:**
  - [ ] StockPage lista produtos do Supabase
  - [ ] Coluna custo/margem invisivel para funcionario
  - [ ] Botao de excluir produto visivel apenas para admin (chama soft delete)
  - [ ] NewProductPage salva produto no banco (persiste apos reload)
  - [ ] Toast de confirmacao apos salvar com sucesso
  - [ ] Loading state no botao salvar

### Task 3.3 — Refatorar NewSalePage (catalogo de produtos) para usar useProducts

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 3.1
- **Stories cobertas:** PRD secao 7 (Migracao)
- **Arquivos esperados:** Modificar: `src/pages/NewSalePage.tsx`, `src/contexts/CartContext.tsx`
- **Resultado esperado:** Step 1 da NewSalePage (catalogo) usa `useProducts()` para listar produtos disponiveis. CartContext atualizado para trabalhar com `Product.id` como `string` (UUID) em vez de `number`. Items do carrinho referenciam UUIDs. Loading state enquanto produtos carregam.
- **Criterios de aceite:**
  - [ ] Catalogo de produtos no step 1 vem do Supabase
  - [ ] CartContext funciona com `id: string` (UUID)
  - [ ] Carrinho adiciona/remove produtos corretamente
  - [ ] Loading state enquanto lista carrega
  - [ ] Busca por nome funciona sobre dados do Supabase

### Task 3.4 — Adaptar testes de produtos e contextos

- **Tipo:** test
- **Estimativa:** M
- **Prioridade:** media
- **Dependencias:** Task 3.1, Task 3.2, Task 3.3
- **Arquivos esperados:** Modificar: `src/contexts/__tests__/DataContext.test.tsx`, `src/contexts/__tests__/CartContext.test.tsx`, `src/data/__tests__/mock-data.test.ts`; Criar ou modificar: `src/hooks/__tests__/useProducts.test.ts`
- **Resultado esperado:** Testes existentes do DataContext adaptados para nova realidade (TanStack Query). Testes do CartContext atualizados para `id: string`. Mock data tests atualizados ou removidos conforme dados mock substituidos. Novos testes para `useProducts` com mock do Supabase client.
- **Criterios de aceite:**
  - [ ] Testes existentes que tocam produtos adaptados e passando
  - [ ] CartContext.test atualizado para UUIDs
  - [ ] `npm run test` passa sem falhas nesta area
  - [ ] Cobertura de mutations (create, update, soft delete)

---

## Sprint 4 — CRUD Clients + Sales

**Objetivo da sprint:** Clientes e vendas persistidos no Supabase. Fluxo de venda completo usando RPC `create_sale` (atomico com decremento de estoque). Estorno de venda via RPC admin-only. Historico real.
**Pre-requisitos:** Sprint 3 concluida
**Definition of Done:** Clientes e vendas persistem entre sessoes; fluxo de venda atomico funcional; historico real; estorno admin-only funcional; `npm run build` sem erros; testes adaptados e passando.

### Task 4.1 — Criar hook useClients com TanStack Query

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** PRD secao 7 (Migracao)
- **Arquivos esperados:** Criar: `src/hooks/useClients.ts`
- **Resultado esperado:** Hook `useClients()` com: `useQuery` para listar clientes ativos com `total_spent` e `last_purchase` derivados (via LEFT JOIN com sales ou computado client-side); `useCreateClient` mutation; `useUpdateClient` mutation; `useSoftDeleteClient` mutation (RPC admin-only). Query key: `['clients']`. Mapeia snake_case para camelCase.
- **Criterios de aceite:**
  - [ ] Lista clientes ativos do Supabase
  - [ ] `totalSpent` e `lastPurchase` calculados por cliente
  - [ ] Mutation de criar cliente persiste no banco
  - [ ] Soft delete via RPC funcional (apenas admin)
  - [ ] Loading e error states disponiveis

### Task 4.2 — Criar hook useSales com TanStack Query

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** PRD secao 7 (Migracao)
- **Arquivos esperados:** Criar: `src/hooks/useSales.ts`
- **Resultado esperado:** Hook `useSales()` com: `useQuery` para listar vendas nao estornadas ordenadas por `created_at DESC`; `useCreateSale` mutation via RPC `create_sale` (recebe `p_client_id`, `p_payment_method`, `p_items` como JSONB; invalida queries de `['sales']` e `['products']` — estoque decrementado pelo trigger); `useCancelSale` mutation via RPC `cancel_sale` (admin-only, invalida `['sales']` e `['products']`). Query key: `['sales']`.
- **Criterios de aceite:**
  - [ ] Lista vendas nao estornadas do Supabase
  - [ ] Mutation `create_sale` usa RPC atomica
  - [ ] Apos criar venda, cache de sales E products invalidados (estoque)
  - [ ] Estorno via RPC `cancel_sale` funcional (admin-only)
  - [ ] Apos estorno, estoque restaurado e cache invalidado

### Task 4.3 — Refatorar ClientsPage e ClientPicker para usar useClients

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 4.1
- **Stories cobertas:** PRD secao 11 (Clientes)
- **Arquivos esperados:** Modificar: `src/pages/ClientsPage.tsx`, `src/components/client/ClientPicker.tsx`, `src/components/client/ClientCard.tsx`
- **Resultado esperado:** ClientsPage lista clientes do Supabase com tags VIP e ANIVERSARIO derivadas. ClientPicker cria cliente via mutation `useCreateClient` (sem duplicacao — resolve pendencia fase 1). ClientCard exibe `totalSpent` e `lastPurchase` do cliente. Campo de aniversario e telefone no cadastro de cliente. Botao de excluir visivel apenas para admin.
- **Criterios de aceite:**
  - [ ] Lista clientes do Supabase (nao mais mock)
  - [ ] Tag VIP derivada: `totalSpent >= store_settings.vipThreshold`
  - [ ] Tag ANIVERSARIO derivada: birthday dentro de N dias (store_settings.birthdayAlertDays)
  - [ ] ClientPicker cria cliente no banco sem duplicacao
  - [ ] Campo de aniversario (`birthday`) e telefone (`phone`) no cadastro
  - [ ] `key={client.id}` nas listas (resolve pendencia fase 1 — `key={index}`)

### Task 4.4 — Refatorar fluxo de venda (checkout) para usar useSales

- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 4.2, Task 4.1, Task 3.3
- **Stories cobertas:** PRD secao 5 (Desconto de estoque), PRD secao 11 (Checkout)
- **Arquivos esperados:** Modificar: `src/contexts/CartContext.tsx`, `src/pages/NewSalePage.tsx`, `src/components/sale/ConfirmButton.tsx`
- **Resultado esperado:** `confirmSale()` no CartContext chama mutation `useCreateSale` com `p_client_id` (UUID ou null para "Consumidor final"), `p_payment_method` e `p_items` (array de `{ product_id, quantity, unit_price }`). Validacao de estoque suficiente antes de confirmar (se insuficiente: toast de erro indicando qual produto). Loading state no ConfirmButton durante chamada ao RPC. Toast de sucesso via sonner. Estoque decrementado automaticamente pelo trigger no banco. `created_by` setado automaticamente pelo `DEFAULT auth.uid()`.
- **Criterios de aceite:**
  - [ ] Venda criada via RPC `create_sale` (atomica)
  - [ ] Estoque decrementado automaticamente (trigger)
  - [ ] Erro claro se estoque insuficiente (toast com nome do produto)
  - [ ] Loading state no botao de confirmar
  - [ ] Toast de sucesso apos venda registrada
  - [ ] Venda persiste apos reload

### Task 4.5 — Refatorar HistoryPage para usar useSales + adaptar testes

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 4.2
- **Stories cobertas:** PRD secao 11 (Historico)
- **Arquivos esperados:** Modificar: `src/pages/HistoryPage.tsx`; Modificar: testes existentes de contextos/hooks afetados
- **Resultado esperado:** HistoryPage lista vendas reais do Supabase (nao mais mock). Exibe nome do cliente (via join ou lookup) ou "Consumidor final" quando `client_id` e null. Vendas estornadas (`refunded_at IS NOT NULL`) filtradas da listagem (ou marcadas visualmente). Testes dos contextos DataContext e CartContext atualizados para nova interface. Testes de mock-data ajustados ou removidos.
- **Criterios de aceite:**
  - [ ] Historico mostra vendas reais do banco
  - [ ] "Consumidor final" exibido para vendas sem cliente
  - [ ] Vendas estornadas nao aparecem na listagem padrao
  - [ ] Testes atualizados e passando (`npm run test`)

---

## Sprint 5 — Derivados, Pendencias e Cleanup

**Objetivo da sprint:** Dashboard com dados reais derivados. Alertas derivados de estoque/aniversarios. Pendencias tecnicas da fase 1 resolvidas. Cleanup de imports mock. useData e useSettings refatorados como fachada dos novos hooks. DataContext e SettingsContext removidos.
**Pre-requisitos:** Sprint 4 concluida
**Definition of Done:** Dashboard exibe dados calculados de vendas reais; alertas derivados funcionais; `formatCurrency` com separador de milhar; busca accent-insensitive; DataContext/SettingsContext removidos; nenhum import de `src/data/` exceto `promos.ts`; `npm run build` sem erros; testes passando.

### Task 5.1 — Criar hook useStoreSettings e refatorar useSettings como fachada

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** PRD secao 7 (Migracao — useSettings)
- **Arquivos esperados:** Criar: `src/hooks/useStoreSettings.ts`; Modificar: `src/hooks/useSettings.ts`, `src/pages/SettingsPage.tsx`; Remover: `src/contexts/SettingsContext.tsx`
- **Resultado esperado:** Hook `useStoreSettings()` com `useQuery` para ler store_settings (singleton) e `useUpdateSettings` mutation (admin-only, UPDATE + invalidateQueries). Hook `useSettings()` refatorado como fachada: mesma interface publica (`defaultMarkup`, `setMarkup`, `toggles`, `toggleSetting`), implementacao interna usa `useStoreSettings()`. SettingsContext removido. SettingsPage usa `useSettings()` normalmente (componentes nao mudam). SettingsProvider removido da hierarquia de providers.
- **Criterios de aceite:**
  - [ ] Settings persistem entre sessoes (sobrevivem reload)
  - [ ] Admin pode alterar markup e toggles (persistido no banco)
  - [ ] Funcionario ve settings mas nao pode alterar (RLS bloqueia UPDATE)
  - [ ] Interface publica de `useSettings()` identica a fase 1
  - [ ] SettingsContext.tsx removido
  - [ ] SettingsProvider removido do root

### Task 5.2 — Refatorar useData como fachada e remover DataContext

- **Tipo:** refactor
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 3.1, Task 4.1, Task 4.2, Task 5.1
- **Stories cobertas:** PRD secao 7 (Migracao — ADR-002 Swap)
- **Arquivos esperados:** Modificar: `src/hooks/useData.ts`; Remover: `src/contexts/DataContext.tsx`; Modificar: `src/App.tsx` (remover DataProvider)
- **Resultado esperado:** `useData()` refatorado como fachada que compoe `useProducts()`, `useClients()`, `useSales()`. Mesma interface publica: `products`, `clients`, `sales`, `addProduct`, `addClient`, `addSale`, `todaySales`, `todayTotal`, `todayCount`, `lowStockProducts`. Derivados (`todaySales`, `todayTotal`, etc.) calculados a partir dos dados reais do Supabase. DataContext.tsx removido. DataProvider removido da hierarquia.
- **Criterios de aceite:**
  - [ ] Interface publica de `useData()` identica a fase 1
  - [ ] `todaySales` filtrado por `created_at` do dia corrente (nao mais string "Hoje")
  - [ ] `todayTotal` e `todayCount` calculados de vendas reais
  - [ ] `lowStockProducts` filtrado por `store_settings.low_stock_threshold`
  - [ ] DataContext.tsx removido
  - [ ] Componentes que usam `useData()` continuam funcionando sem alteracao

### Task 5.3 — Refatorar Dashboard com dados reais

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 5.2
- **Stories cobertas:** PRD secao 11 (Dashboard)
- **Arquivos esperados:** Modificar: `src/pages/DashboardPage.tsx`, `src/components/dashboard/SalesTodayCard.tsx`, `src/components/dashboard/StatsCards.tsx`, `src/components/dashboard/SophiaSuggestions.tsx`, `src/components/dashboard/LowStockSection.tsx`
- **Resultado esperado:** Card "Vendas de hoje": total e contagem calculados via `useData().todayTotal/todayCount`. Ticket medio: `todayTotal / todayCount`. Card "Este mes": soma de vendas do mes corrente (nova query ou derivado). Card "Meta do mes": permanece hardcoded 68% (feature futura). Sophia sugere: sugestoes derivadas de dados reais (estoque parado, aniversario proximo). Estoque baixo: derivado de query real. Loading states em todos os cards.
- **Criterios de aceite:**
  - [ ] "Vendas de hoje" mostra total calculado de vendas reais
  - [ ] Ticket medio calculado (todayTotal / todayCount)
  - [ ] "Este mes" mostra soma real de vendas do mes corrente
  - [ ] "Meta do mes" permanece hardcoded 68%
  - [ ] Estoque baixo derivado de threshold real (store_settings)
  - [ ] Loading states enquanto dados carregam

### Task 5.4 — Criar hook useAlerts e refatorar AlertsPage

- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 5.2, Task 5.1
- **Stories cobertas:** PRD secao 6 (Alertas)
- **Arquivos esperados:** Criar: `src/hooks/useAlerts.ts`; Modificar: `src/pages/AlertsPage.tsx`; Remover importacao de `src/data/alerts.ts`
- **Resultado esperado:** Hook `useAlerts()` que combina fontes de alertas derivados: (1) estoque baixo — produtos com `stock <= store_settings.lowStockThreshold`; (2) aniversario proximo — clientes com `birthday` dentro de `store_settings.birthdayAlertDays` dias; (3) sugestoes Sophia — permanecem mock/hardcoded. AlertsPage usa `useAlerts()` em vez de importar `src/data/alerts.ts` diretamente (resolve pendencia fase 1).
- **Criterios de aceite:**
  - [ ] Alertas de estoque baixo derivados de dados reais
  - [ ] Alertas de aniversario derivados de dados reais
  - [ ] Sugestoes Sophia permanecem mock (esperado)
  - [ ] Nenhum import de `src/data/alerts.ts` na AlertsPage
  - [ ] Alertas ordenados (mais relevantes primeiro)

### Task 5.5 — Resolver pendencias tecnicas da fase 1

- **Tipo:** fix
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 5.2
- **Stories cobertas:** PRD secao 8 (Pendencias Tecnicas)
- **Arquivos esperados:** Modificar: `src/lib/utils.ts` (formatCurrency), `src/hooks/useSearch.ts` (accent-insensitive)
- **Resultado esperado:** `formatCurrency` usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` com separador de milhar. `useSearch` aplica `normalize('NFD').replace(/[̀-ͯ]/g, '')` para busca accent-insensitive. Listas de clientes usam `client.id` como key (ja resolvido na Task 4.3 com UUID). ClientPicker sem duplicacao (ja resolvido na Task 4.3 com mutation).
- **Criterios de aceite:**
  - [ ] `formatCurrency(6240)` retorna "R$ 6.240,00" (com separador de milhar)
  - [ ] Busca por "labios" encontra produtos com categoria "Labios"
  - [ ] Busca por "patricia" encontra "Patricia Souza"
  - [ ] Testes de `formatCurrency` em `utils.test.ts` atualizados

### Task 5.6 — Cleanup de imports mock e remocao de arquivos obsoletos

- **Tipo:** chore
- **Estimativa:** P
- **Prioridade:** media
- **Dependencias:** Task 5.1, Task 5.2, Task 5.4
- **Stories cobertas:** PRD secao 7 (Arquivos removidos)
- **Arquivos esperados:** Remover: `src/data/products.ts`, `src/data/clients.ts`, `src/data/sales.ts`, `src/data/alerts.ts`; Manter: `src/data/promos.ts` (promocoes continuam mock por decisao do PRD)
- **Resultado esperado:** Nenhum import residual de arquivos mock removidos em nenhum arquivo do projeto. `src/data/promos.ts` mantido. `PromosPage` continua importando `promos.ts` (esperado — mock por decisao). Build limpo, sem erros.
- **Criterios de aceite:**
  - [ ] `src/data/products.ts`, `clients.ts`, `sales.ts`, `alerts.ts` removidos
  - [ ] `src/data/promos.ts` mantido (promocoes mock por decisao)
  - [ ] Zero imports de arquivos mock removidos (`grep -r "from '@/data/" --include="*.ts" --include="*.tsx"` retorna apenas `promos.ts`)
  - [ ] `npm run build` compila sem erros
  - [ ] `npm run test` passa (testes adaptados nas sprints anteriores)

### Task 5.7 — Adaptar testes restantes e validacao final

- **Tipo:** test
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 5.5, Task 5.6
- **Arquivos esperados:** Modificar: `src/lib/__tests__/utils.test.ts`, `src/hooks/__tests__/useSearch.test.ts`, `src/contexts/__tests__/SettingsContext.test.tsx`; Remover ou adaptar: `src/data/__tests__/mock-data.test.ts`
- **Resultado esperado:** Testes de `formatCurrency` atualizados para novo formato com milhar. Testes de `useSearch` atualizados para accent-insensitive. Testes de SettingsContext removidos (contexto foi removido) ou migrados para testar `useStoreSettings` com mock. Testes de mock-data removidos ou adaptados (apenas `promos.ts` permanece como mock). Todos os testes passando.
- **Criterios de aceite:**
  - [ ] `npm run test` passa com zero falhas
  - [ ] Testes de `formatCurrency` cobrem separador de milhar
  - [ ] Testes de `useSearch` cobrem busca accent-insensitive
  - [ ] Testes de SettingsContext migrados para useStoreSettings ou removidos
  - [ ] Nenhum teste referencia DataContext ou SettingsContext removidos
