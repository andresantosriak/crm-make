# PRD: CRM Studio Bellê — Fase 2 (Supabase + Auth)

**Status:** Planejamento
**Versão:** 1.0
**Data:** 2026-07-20
**Referência:** Addendum ao PRD fase 1 (`docs/crm-belle-prd.md`)

---

## TL;DR

A fase 2 substitui os dados mock por persistência real no Supabase, implementa autenticação multi-usuário com roles (admin e funcionário), e resolve as pendências técnicas da fase 1. O frontend mantém a mesma experiência visual e os mesmos contratos de hooks — a mudança é interna: `DataContext` cede lugar a TanStack Query + Supabase client.

---

## 1. Escopo da Fase 2 — O que muda vs. Fase 1

### O que entra

| Área | Fase 1 | Fase 2 |
|------|--------|--------|
| Autenticação | Visual (sem auth real) | Supabase Auth (email/senha), sessão real com JWT |
| Usuários | Single-user (Bruna) | Multi-usuário: admin (André) + funcionários |
| Dados | Mock data em `src/data/*.ts`, perdidos ao recarregar | Supabase Postgres, persistentes entre sessões |
| IDs | `number` (sequencial mock) | `UUID` (Supabase default) |
| Client (entidade) | Sem `id`, sem `phone` persistente, `total` hardcoded | `id: UUID`, `phone`, `birthday`, total derivado de vendas |
| State management | React Context (`DataContext`) | TanStack Query + Supabase client (cart permanece Context) |
| Segurança | Nenhuma (tudo local) | RLS por tabela, anon key no frontend, service_role nunca no client |
| Dados derivados | Hardcoded ("Este mês R$ 6.240", "Meta 68%") | Calculados a partir de vendas reais |
| Formato monetário | Sem separador de milhar | Com separador de milhar (pendência fase 1) |
| Busca | Case-insensitive sem acento | Accent-insensitive com `normalize('NFD')` (pendência fase 1) |
| Settings | Estado em memória | Tabela `store_settings` no Supabase |

### O que NÃO muda

- Design visual (dark/gold, Cormorant Garamond + Jost)
- Telas e rotas (mesmas 10 telas + overlays + bottom nav)
- Lógica de pricing (round90, markup, margem) — permanece em `lib/pricing.ts`
- Componentes de UI (`components/`) — contratos de props intactos
- Contratos dos hooks (`useData`, `useCart`, `useSettings`) — mesma interface pública, implementação interna muda

---

## 2. Modelo de Autenticação

### Decisão

**Multi-usuário com roles fixos** (abordagem A do PRD original — roles definidos no código, sem UI de configuração de roles dinâmicos).

Dois roles:
- **admin** — gestão completa do salão + gestão de usuários
- **funcionário** — operação do dia a dia (vender, cadastrar produtos e clientes)

### Admin inicial

- **Nome:** André
- **Email:** andresantos.riak@gmail.com
- **Senha:** provisionada via script de seed usando variável de ambiente (`ADMIN_INITIAL_PASSWORD`). A senha nunca deve ser escrita em documentos, código commitado ou seeds versionados.
- **Provisionamento:** Script de seed cria o usuário via `supabase.auth.admin.createUser()` (server-side, usando `service_role_key`) e insere o registro em `profiles` com `role = 'admin'`.

### Fluxo de criação de novos usuários (pelo admin)

1. Admin acessa tela de gerenciamento de usuários (nova rota `/usuarios`, acessível apenas para admin)
2. Preenche: nome completo, email, role (admin ou funcionário)
3. Sistema cria o usuário via Edge Function (server-side, usando `service_role_key`)
4. Supabase envia email de confirmação com link de primeiro acesso (magic link ou set password)
5. Novo usuário define sua senha no primeiro acesso
6. O registro em `profiles` é criado automaticamente via database trigger `on auth.users insert`

### Fluxo de login

1. Usuário acessa `/login` (tela existente, agora com auth real)
2. Digita email e senha (campos não vêm mais pré-preenchidos)
3. `supabase.auth.signInWithPassword()` valida credenciais
4. Sucesso: redireciona para Dashboard. Sessão persiste via refresh token.
5. Erro: mensagem de feedback ("Email ou senha incorretos")
6. Link "Entrar com biometria" fica desabilitado na fase 2 (future: WebAuthn)

### Sessão

- Supabase Auth gerencia a sessão (JWT + refresh token)
- `onAuthStateChange` monitora mudanças de sessão
- Refresh automático do token (Supabase SDK faz por padrão)
- Botão "Sair da conta" em Configurações executa `supabase.auth.signOut()`

### Proteção de rotas

- Rotas protegidas via componente wrapper (`ProtectedRoute`)
- Usuário não autenticado é redirecionado para `/login`
- Rota `/usuarios` protegida adicionalmente: apenas `role = 'admin'`

---

## 3. Matriz de Permissões por Entidade

**Recomendação para salão de pequeno porte:** dados da loja são compartilhados entre todos os funcionários. Num salão com equipe pequena, todos precisam ver o que foi vendido (para saber estoque atualizado), conhecer os clientes (para dar bom atendimento) e consultar produtos (para vender). Restringir dados operacionais por funcionário criaria fricção sem benefício real nesse contexto. O que fica restrito ao admin é a gestão do negócio: configurações, relatórios de margem/custo e controle de usuários.

| Entidade | Ação | admin | funcionário | Nota |
|----------|------|-------|-------------|------|
| **products** | Listar/Ver | Sim | Sim | Todos veem todos os produtos |
| **products** | Criar | Sim | Sim | Funcionário pode cadastrar produto novo |
| **products** | Editar | Sim | Sim | Funcionário pode atualizar estoque, nome, preço |
| **products** | Excluir | Sim | Não | Exclusão apenas pelo admin (soft delete recomendado) |
| **products** | Ver custo/margem | Sim | Não | Funcionário vê apenas preço de venda e estoque |
| **clients** | Listar/Ver | Sim | Sim | Todos veem todos os clientes da loja |
| **clients** | Criar | Sim | Sim | Funcionário pode cadastrar cliente no ato da venda |
| **clients** | Editar | Sim | Sim | Atualizar telefone, nome |
| **clients** | Excluir | Sim | Não | Apenas admin |
| **sales** | Listar/Ver | Sim | Sim | Funcionário vê TODAS as vendas (não só as próprias) |
| **sales** | Criar | Sim | Sim | Ambos podem registrar vendas |
| **sales** | Excluir/Estornar | Sim | Não | Apenas admin pode cancelar vendas |
| **sale_items** | Listar/Ver | Sim | Sim | Acompanha a permissão da sale pai |
| **store_settings** | Ver | Sim | Sim (parcial) | Funcionário vê markup padrão (necessário para cadastro de produto) |
| **store_settings** | Editar | Sim | Não | Apenas admin altera configurações da loja |
| **profiles** (usuários) | Listar/Ver | Sim | Não | Apenas admin vê lista de usuários |
| **profiles** | Criar/Editar/Excluir | Sim | Não | Gestão de equipe é exclusiva do admin |

### Visibilidade condicional no frontend

Com base na matriz acima, o frontend deve:

- **Esconder coluna custo/margem** na tela de Estoque para funcionários (exibir apenas nome, categoria, preço de venda, estoque)
- **Esconder tela /usuarios** da navegação para funcionários
- **Desabilitar botões de exclusão** (produto, cliente) para funcionários
- **Esconder seção "Loja"** em Configurações para funcionários (formas de pagamento, categorias, backup)
- **Manter Quick Actions iguais** — funcionário pode acessar Nova Venda, Novo Produto, Promoções e Clientes

---

## 4. Entidades e Relacionamentos

### Diagrama ER (resumo)

```
auth.users (Supabase Auth)
    │
    ▼ (1:1)
profiles
    │
    ├──▶ products    (created_by)
    ├──▶ clients     (created_by)
    └──▶ sales       (created_by)
              │
              ▼ (1:N)
         sale_items ──▶ products (product_id)

sales ──▶ clients (client_id)

store_settings (single row, store-level)
```

### Tabelas

#### `profiles`

Extensão da tabela `auth.users` do Supabase. Criada automaticamente via trigger ao cadastrar um novo usuário.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK, FK → auth.users.id | Mesmo ID do auth.users |
| full_name | text | NOT NULL | Nome completo |
| role | text | NOT NULL, CHECK ('admin', 'employee') | Role do usuário |
| created_at | timestamptz | DEFAULT now() | Data de criação |
| updated_at | timestamptz | DEFAULT now() | Última atualização |

#### `products`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| name | text | NOT NULL | Nome do produto |
| category | text | NOT NULL, CHECK ('Lábios', 'Rosto', 'Olhos') | Categoria |
| price | numeric(10,2) | NOT NULL, CHECK (>= 0) | Preço de venda |
| cost | numeric(10,2) | NOT NULL, CHECK (>= 0) | Custo de aquisição |
| stock | integer | NOT NULL, DEFAULT 0, CHECK (>= 0) | Quantidade em estoque |
| active | boolean | NOT NULL, DEFAULT true | Soft delete (false = excluído) |
| created_by | uuid | FK → profiles.id | Quem cadastrou |
| created_at | timestamptz | DEFAULT now() | Data de criação |
| updated_at | timestamptz | DEFAULT now() | Última atualização |

**Índices:** `category`, `active`, `stock` (para filtro de estoque baixo), `created_by`.

#### `clients`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| name | text | NOT NULL | Nome completo |
| phone | text | NULL | Telefone/WhatsApp |
| birthday | date | NULL | Data de aniversário (para tag ANIVERSÁRIO) |
| active | boolean | NOT NULL, DEFAULT true | Soft delete |
| created_by | uuid | FK → profiles.id | Quem cadastrou |
| created_at | timestamptz | DEFAULT now() | Data de criação |
| updated_at | timestamptz | DEFAULT now() | Última atualização |

**Índices:** `name` (para busca), `birthday` (para alertas de aniversário), `active`, `created_by`.

**Campos derivados (via query, NÃO armazenados):**
- `total_spent`: `SUM(sales.total) WHERE sales.client_id = clients.id`
- `last_purchase`: `MAX(sales.created_at) WHERE sales.client_id = clients.id`
- `is_vip`: `total_spent >= 500` (threshold configurável em `store_settings`)
- `has_birthday_soon`: `birthday` dentro dos próximos 7 dias

#### `sales`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| client_id | uuid | NOT NULL, FK → clients.id | Cliente da venda |
| payment_method | text | NOT NULL, CHECK ('Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro') | Forma de pagamento |
| total | numeric(10,2) | NOT NULL, CHECK (> 0) | Valor total da venda |
| items_count | integer | NOT NULL, CHECK (> 0) | Quantidade total de itens |
| created_by | uuid | FK → profiles.id | Quem registrou a venda |
| created_at | timestamptz | DEFAULT now() | Data/hora da venda |

**Nota sobre `total`:** embora possa ser derivado de `SUM(sale_items.subtotal)`, armazenamos como snapshot por dois motivos: (1) performance — evita JOIN em queries frequentes como "vendas de hoje"; (2) integridade — se um produto for editado depois, o valor da venda histórica não muda.

**Nota sobre `items_count`:** igualmente snapshot de `SUM(sale_items.quantity)` para exibição rápida no histórico.

**Índices:** `client_id`, `created_by`, `created_at` (para filtro por período), `payment_method`.

#### `sale_items`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| sale_id | uuid | NOT NULL, FK → sales.id ON DELETE CASCADE | Venda pai |
| product_id | uuid | NOT NULL, FK → products.id | Produto vendido |
| quantity | integer | NOT NULL, CHECK (> 0) | Quantidade vendida |
| unit_price | numeric(10,2) | NOT NULL, CHECK (> 0) | Preço unitário no momento da venda (snapshot) |
| subtotal | numeric(10,2) | NOT NULL, CHECK (> 0) | quantity * unit_price |

**Índices:** `sale_id`, `product_id`.

#### `store_settings`

Tabela de linha única com as configurações da loja.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| default_markup | integer | NOT NULL, DEFAULT 180, CHECK (0..500) | Markup padrão (%) |
| low_stock_threshold | integer | NOT NULL, DEFAULT 5, CHECK (>= 0) | Limiar de estoque baixo |
| vip_threshold | numeric(10,2) | NOT NULL, DEFAULT 500.00 | Total gasto para ser VIP |
| birthday_alert_days | integer | NOT NULL, DEFAULT 7 | Dias antes do aniversário para gerar alerta |
| toggle_promos | boolean | NOT NULL, DEFAULT true | Notificação de promoções |
| toggle_estoque | boolean | NOT NULL, DEFAULT true | Alerta de estoque baixo |
| toggle_aniversario | boolean | NOT NULL, DEFAULT true | Alerta de aniversário |
| toggle_resumo | boolean | NOT NULL, DEFAULT false | Resumo diário por email |
| updated_at | timestamptz | DEFAULT now() | Última atualização |

**Seed:** uma linha criada no seed inicial com os valores default.

---

## 5. Regras de Negócio para Persistência

### CRUD real (armazenado no banco)

| Entidade | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| products | Formulário Novo Produto | Listagem Estoque, catálogo Nova Venda | Editar produto (fase 2 habilita edição) | Soft delete (`active = false`) |
| clients | Client Picker (cadastro rápido) + tela futura | Listagem Clientes, Client Picker | Editar cliente (fase 2) | Soft delete |
| sales | Confirmar venda no checkout | Histórico de Vendas, Dashboard | Não editável | Estorno pelo admin (soft delete ou flag) |
| sale_items | Criados junto com a sale | Via sale (detalhes) | Não editável | CASCADE com sale |
| store_settings | Seed inicial | Tela Configurações | Admin edita markup, toggles, thresholds | Não deletável |
| profiles | Via Edge Function (admin cria) ou trigger (auto) | Tela Usuários (admin) | Admin edita role/nome | Desativação via Supabase Auth |

### Derivados e calculados (NÃO armazenados)

| Dado | Como é calculado | Onde aparece |
|------|------------------|-------------|
| Vendas de hoje (total e contagem) | `SUM(sales.total)` e `COUNT(*)` WHERE `created_at::date = CURRENT_DATE` | Dashboard card "Vendas de hoje" |
| Ticket médio | `todayTotal / todayCount` | Dashboard card "Vendas de hoje" |
| Vendas do mês | `SUM(sales.total)` WHERE `created_at` no mês corrente | Dashboard card "Este mês" |
| Meta do mês (%) | `vendas_do_mês / meta_mensal * 100` (meta futura em settings; fase 2 usa hardcoded) | Dashboard card "Meta do mês" |
| Total gasto por cliente | `SUM(sales.total)` WHERE `client_id = X` | Lista de clientes, tag VIP |
| Última compra do cliente | `MAX(sales.created_at)` WHERE `client_id = X` | Lista de clientes |
| Tag VIP | `total_spent >= store_settings.vip_threshold` | Badge na lista de clientes |
| Tag ANIVERSÁRIO | `clients.birthday` dentro de N dias (configurável) | Badge na lista de clientes |
| Markup e margem do produto | `(price - cost) / cost * 100` e `(price - cost) / price * 100` | Tela Estoque (somente admin) |
| Lucro por unidade | `price - cost` | Tela Novo Produto |
| Estoque baixo | `products.stock <= store_settings.low_stock_threshold` | Dashboard, Estoque |

### Desconto de estoque na venda

Ao confirmar uma venda, o estoque dos produtos vendidos deve ser decrementado automaticamente:
- Para cada `sale_item`, executar `UPDATE products SET stock = stock - sale_item.quantity WHERE id = sale_item.product_id`
- Validar que `stock >= quantity` antes de confirmar (evitar estoque negativo)
- Implementar via database function ou na Edge Function de criação de venda, dentro de uma transação

---

## 6. Alertas e Promoções — Decisão

### Alertas (tela Avisos)

**Decisão:** alertas são derivados dos dados reais, NÃO armazenados em tabela separada.

Fontes dos alertas:
1. **Estoque baixo:** produtos com `stock <= store_settings.low_stock_threshold` — gerados via query em tempo real
2. **Aniversário próximo:** clientes com `birthday` dentro de `store_settings.birthday_alert_days` dias — gerados via query
3. **Sophia IA:** sugestões mock (hardcoded) — permanecem como na fase 1 até a implementação de IA real

Implementação:
- Hook `useAlerts()` que combina as fontes acima numa lista unificada
- Cada alerta é montado client-side a partir dos dados já carregados pelo TanStack Query (sem query adicional dedicada)
- Ordenação: mais recentes primeiro (estoque muda → alerta aparece; aniversário entra na janela → alerta aparece)

### Promoções (tela Promoções)

**Decisão:** promoções permanecem como dados mock/hardcoded na fase 2.

Justificativa: promoções são "sugestões da Sophia IA". Sem IA real (fora do escopo), não há lógica para gerar promoções dinâmicas. Criar uma tabela de promoções sem o motor que as popula adicionaria complexidade sem valor.

Quando implementar: na fase em que a IA for integrada (fase futura), as promoções passarão a ter tabela própria com campos como `tipo`, `produtos`, `desconto`, `validade`, `status`.

---

## 7. Estratégia de Migração (ADR-002 Swap)

### Princípio

O ADR-002 previu exatamente este cenário: "basta substituir os imports nos Contexts por chamadas reais (TanStack Query) — os componentes não mudam." A estratégia é manter os contratos dos hooks (`useData`, `useSettings`) idênticos e mudar a implementação interna.

### Antes e depois

| Camada | Fase 1 | Fase 2 |
|--------|--------|--------|
| Dados iniciais | `src/data/*.ts` (arrays hardcoded) | Supabase queries via TanStack Query |
| State management | `DataContext` (useState) | `useQuery` / `useMutation` (TanStack Query) |
| Mutações | `setProducts(prev => [...prev, new])` | `useMutation` + `supabase.from('products').insert()` + `invalidateQueries` |
| Derivados (todaySales) | `useMemo` sobre array local | `useQuery` com filtro ou cálculo client-side sobre dados cacheados |
| Settings | `SettingsContext` (useState) | `useQuery('store_settings')` + `useMutation` para editar |
| Carrinho | `CartContext` (useState) | Permanece `CartContext` (carrinho é efêmero, não persiste) |
| Auth | Nenhum | Novo `AuthContext` + `useAuth` hook + `ProtectedRoute` |

### Passo a passo da migração

1. **Setup Supabase client** — `src/integrations/supabase/client.ts` com `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)`
2. **Gerar tipos** — `supabase gen types typescript` → `src/integrations/supabase/types.ts`
3. **Instalar TanStack Query** — `@tanstack/react-query` + `QueryClientProvider` no root
4. **Criar hooks de query** — `useProducts()`, `useClients()`, `useSales()`, `useStoreSettings()` usando `useQuery` + Supabase client
5. **Criar hooks de mutation** — `useCreateProduct()`, `useCreateClient()`, `useCreateSale()`, `useUpdateSettings()` usando `useMutation` + `invalidateQueries`
6. **Refatorar `useData`** — manter a mesma interface pública, mas implementar com os hooks de query/mutation internamente. Componentes que chamam `useData()` não mudam.
7. **Refatorar `useSettings`** — mesmo princípio: mesma interface, novo backend.
8. **Implementar auth** — `AuthContext`, `useAuth`, `ProtectedRoute`, refatorar `LoginPage`
9. **Remover `src/data/*.ts`** — dados mock não são mais necessários (substituídos pelo seed do banco)
10. **Remover `DataContext`** — substituído por TanStack Query (hooks wrappam as queries)
11. **Remover `SettingsContext`** — substituído por hook com useQuery

### Arquivos criados

```
src/
├── integrations/
│   └── supabase/
│       ├── client.ts              # createClient com env vars
│       └── types.ts               # Tipos gerados pelo CLI
├── contexts/
│   ├── AuthContext.tsx             # Novo: auth state + session
│   └── CartContext.tsx             # Mantido (carrinho efêmero)
├── hooks/
│   ├── useAuth.ts                 # Novo: wrapper para AuthContext
│   ├── useProducts.ts             # Novo: useQuery + useMutation para products
│   ├── useClients.ts              # Novo: useQuery + useMutation para clients
│   ├── useSales.ts                # Novo: useQuery + useMutation para sales
│   ├── useStoreSettings.ts        # Novo: useQuery + useMutation para settings
│   ├── useAlerts.ts               # Novo: derivado de products + clients
│   ├── useData.ts                 # Refatorado: compõe useProducts + useClients + useSales
│   ├── useSettings.ts             # Refatorado: wrappa useStoreSettings
│   ├── useCart.ts                  # Mantido
│   ├── useSearch.ts               # Mantido
│   └── useMarkupCalculator.ts     # Mantido
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx     # Novo: wrapper de rota protegida
└── pages/
    └── UsersPage.tsx              # Nova: gestão de usuários (admin only)
```

### Arquivos removidos

```
src/data/products.ts      # Substituído por seed + query
src/data/clients.ts       # Substituído por seed + query
src/data/sales.ts         # Substituído por seed + query
src/data/alerts.ts        # Substituído por hook derivado
src/data/promos.ts        # Mantido (promoções continuam mock)
src/contexts/DataContext.tsx       # Substituído por TanStack Query
src/contexts/SettingsContext.tsx   # Substituído por TanStack Query
```

### Hierarquia de providers (atualizada)

```tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              {/* ... demais rotas ... */}
              <Route path="/usuarios" element={<AdminRoute><UsersPage /></AdminRoute>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </AuthProvider>
</QueryClientProvider>
```

---

## 8. Pendências Técnicas da Fase 1 a Resolver

Todas as pendências listadas em `docs/decisions.md` seção "Pendências técnicas registradas":

| Pendência | Solução na fase 2 | Prioridade |
|-----------|-------------------|------------|
| `formatCurrency` sem separador de milhar | Usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` | Alta |
| `key={index}` em listas de clientes (Client sem id) | Client agora tem `id: UUID` — usar como key | Alta |
| ClientPicker cria objeto Client duplicado | Mutation `useCreateClient` insere no Supabase e invalida cache — sem duplicação | Alta |
| AlertsPage/PromosPage importam mock direto de `src/data/` | Alerts derivados via `useAlerts()`; Promos mantém import de `src/data/promos.ts` (mock por decisão) | Média |
| Busca não é accent-insensitive | Implementar `normalize('NFD').replace(/[̀-ͯ]/g, '')` no `useSearch` | Média |

---

## 9. Handling de Variáveis de Ambiente

### Variáveis necessárias

```env
# .env.local (NÃO commitado — já no .gitignore)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...   # anon key (pública, segura no frontend)

# Para seed/scripts server-side APENAS (nunca no frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Usado em scripts de seed e Edge Functions
ADMIN_INITIAL_PASSWORD=...              # Senha do admin inicial (usado apenas no seed)
```

### Regras de segurança

1. **Prefixo `VITE_`**: obrigatório para variáveis acessíveis no frontend (Vite exige esse prefixo para expor ao client bundle)
2. **`SUPABASE_SERVICE_ROLE_KEY`**: NUNCA importada no código frontend. Usada apenas em:
   - Scripts de seed (`scripts/seed.ts` ou similar)
   - Edge Functions (`supabase/functions/`)
3. **`ADMIN_INITIAL_PASSWORD`**: usada uma única vez no script de seed. Após o seed, pode ser removida do `.env.local`
4. **`.env.example`**: commitado com placeholders para documentar as variáveis necessárias (sem valores reais)
5. **Verificação no build**: `client.ts` deve fazer runtime check — se `VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY` estiverem ausentes, lançar erro claro em dev (nunca falhar silenciosamente)

### `.env.example`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
# Server-side only (scripts e Edge Functions):
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# ADMIN_INITIAL_PASSWORD=your-initial-admin-password
```

---

## 10. Tela Nova: Gerenciamento de Usuários

### Rota: `/usuarios` (admin only)

**Descrição:** Tela para o admin criar e gerenciar funcionários. Segue o mesmo design system (dark/gold).

**Elementos:**

1. **Header**: "Equipe" (Cormorant Garamond 28px) + contagem de usuários ativos
2. **Botão "Convidar"**: gradiente dourado, abre formulário inline ou modal
3. **Formulário de convite**: Nome completo, Email, Role (chip selector: Admin / Funcionário)
4. **Lista de usuários**: Avatar com iniciais + nome + email + badge de role + status (ativo/pendente)
5. **Ações por usuário**: Editar role, desativar conta (não deletar — Supabase Auth mantém o registro)

**Critérios de aceite:**
- [ ] Tela acessível apenas para usuários com `role = 'admin'`
- [ ] Funcionário que tenta acessar `/usuarios` é redirecionado para Dashboard
- [ ] Admin pode criar novo usuário com nome, email e role
- [ ] Após criação, usuário recebe email para definir senha
- [ ] Lista exibe todos os usuários com status e role
- [ ] Admin pode alterar role de outro usuário
- [ ] Admin pode desativar um usuário (não pode desativar a si mesmo)
- [ ] Admin desativado perde acesso imediatamente (sessão invalidada)

---

## 11. Alterações em Telas Existentes

### Login (`/login`)

- Campos email e senha vazios (sem pré-preenchimento)
- Autenticação real via `supabase.auth.signInWithPassword()`
- Estado de loading no botão "Entrar" enquanto autentica
- Mensagem de erro abaixo do botão em caso de falha
- Link "Entrar com biometria" desabilitado (opacity reduzida + tooltip "Em breve")

### Dashboard (`/`)

- Header: saudação usa nome do usuário logado (do `profiles.full_name`)
- Card "Vendas de hoje": total calculado via query (não mais mock)
- Card "Este mês": calculado via query (soma de vendas do mês corrente)
- Card "Meta do mês": permanece hardcoded na fase 2 (meta mensal será feature futura)
- Sophia sugere: sugestões derivadas de dados reais (estoque parado = produto sem venda há N dias; aniversário = query de birthday)
- Estoque baixo: derivado de query real

### Estoque (`/estoque`)

- Coluna custo/margem visível apenas para admin
- Dados vêm do Supabase (não mais mock)

### Novo Produto (`/produto`)

- Salvar persiste no banco (não mais push em array local)
- Validação de campos obrigatórios antes de salvar
- Toast de confirmação após salvar com sucesso (sonner)
- Estado de loading no botão salvar

### Clientes (`/clientes`)

- Tags (VIP, ANIVERSÁRIO) derivadas dos dados reais
- Total gasto e última compra calculados via query
- Campo de aniversário adicionado ao cadastro de cliente

### Configurações (`/config`)

- Toggles e markup persistem no banco (`store_settings`)
- Seção "Loja" visível apenas para admin
- Seção "Equipe" nova com link para `/usuarios` (admin only)
- Nome e avatar refletem o usuário logado

### Histórico (`/historico`)

- Vendas reais do banco (com paginação se necessário)
- Filtro por data (hoje, esta semana, este mês) — evolução futura, não obrigatório na fase 2

### Nova Venda — Checkout

- Estoque decrementado automaticamente ao confirmar
- Validação de estoque suficiente antes de confirmar (se estoque insuficiente: mensagem de erro indicando qual produto não tem estoque)
- Venda salva no banco com `created_by` do usuário logado

---

## 12. Edge Functions Necessárias

| Function | Propósito | Quem chama |
|----------|-----------|------------|
| `create-user` | Cria usuário via `supabase.auth.admin.createUser()` e envia email de confirmação | Tela `/usuarios` (admin) |

**Nota:** a criação de venda (insert em `sales` + `sale_items` + decremento de estoque) pode ser feita via RPC (database function) ou diretamente no client com transação Supabase. A decisão técnica fica para o System Architect/Data Architect.

---

## 13. Critérios de Aceite da Fase 2

### Autenticação

- [ ] Login com email/senha funciona com credenciais reais do Supabase Auth
- [ ] Sessão persiste entre reloads (refresh token)
- [ ] Logout desloga de fato (limpa sessão)
- [ ] Rotas protegidas redirecionam para login quando não autenticado
- [ ] Admin pode criar novos usuários
- [ ] Funcionário não acessa tela de gestão de usuários
- [ ] Primeiro acesso do usuário criado pelo admin funciona (email de confirmação/set password)

### Persistência

- [ ] Produtos criados persistem entre sessões (sobrevivem reload)
- [ ] Clientes criados persistem entre sessões
- [ ] Vendas registradas persistem entre sessões
- [ ] Configurações (markup, toggles) persistem entre sessões
- [ ] Dashboard exibe dados calculados a partir de vendas reais

### RLS (Row Level Security)

- [ ] Usuário não autenticado não consegue ler nem escrever em nenhuma tabela
- [ ] Funcionário não consegue ver custo/margem via API direta (RLS bloqueia coluna ou view)
- [ ] Funcionário não consegue deletar produtos ou clientes via API direta
- [ ] Funcionário não consegue alterar `store_settings` via API direta
- [ ] Admin tem acesso total a todas as tabelas
- [ ] Cada venda registra corretamente o `created_by` do usuário que a fez

### Migração

- [ ] Contratos dos hooks (`useData`, `useCart`, `useSettings`) mantidos — componentes de UI não quebram
- [ ] `npm run build` compila sem erros TypeScript
- [ ] Dev server inicia e todas as telas carregam
- [ ] Todas as telas funcionam com dados do Supabase (nenhum import residual de `src/data/` exceto `promos.ts`)

### Pendências resolvidas

- [ ] `formatCurrency` formata com separador de milhar
- [ ] Listas de clientes usam `id` como key (não index)
- [ ] Busca é accent-insensitive
- [ ] Alertas derivados de dados reais (estoque + aniversários)

---

## 14. Fora do Escopo da Fase 2

| Item | Motivo |
|------|--------|
| Sophia IA real (ML/LLM) | Fase futura — sugestões de estoque parado e aniversário são regras simples, não IA |
| WhatsApp integration | Botão "Enviar por WhatsApp" permanece visual |
| Push notifications | Avisos são derivados e exibidos in-app, sem push |
| Promoções dinâmicas (tabela de promos) | Sem motor de IA, promoções são mock |
| Meta mensal configurável | Card "Meta do mês" permanece hardcoded (68%) |
| Relatórios e gráficos avançados | Apenas cards de resumo (Dashboard) |
| Edição/exclusão visual de venda | Admin pode estornar via API, mas não há tela dedicada |
| PWA / Service Worker | Web app simples |
| Biometria (WebAuthn) | Link "Entrar com biometria" desabilitado |
| Multi-loja / Multi-tenant | Single-tenant (um salão) |
| Paginação no histórico de vendas | Volume inicial baixo; implementar quando necessário |
| Upload de foto de produto | Sem Supabase Storage nesta fase |
| Auditoria de ações (quem fez o quê) | `created_by` registra autoria, mas não há log de audit completo |
| Recuperação de senha | Fluxo de "esqueci minha senha" via Supabase Auth (pode ser adicionado se o Security Review exigir) |

---

## 15. Requisitos Não-Funcionais

- **Performance:** Queries devem retornar em < 500ms para volumes típicos (< 1000 produtos, < 5000 vendas). TanStack Query cacheia para navegação instantânea entre telas.
- **Segurança:** RLS em todas as tabelas. Anon key no frontend. Service role key apenas server-side. HTTPS obrigatório (Supabase fornece).
- **Resiliência:** Estados de loading (skeleton/spinner) em todas as telas que aguardam dados. Estados de erro com mensagem clara e ação de retry. Estados vazios ("Nenhum produto cadastrado — crie o primeiro!").
- **Responsividade:** Mantém mobile-first (320px+). Nova tela de usuários segue o mesmo padrão.
- **Acessibilidade:** Mantém contraste AA. Formulários com labels associados. Feedback de erro acessível (aria-live).

---

## 16. Suposições e Restrições

### Suposições

- O volume de dados é pequeno (salão de pequeno porte): < 100 produtos, < 500 clientes, < 50 vendas/dia
- Todos os usuários acessam o mesmo salão (single-tenant)
- Conexão com internet estável durante o uso (sem modo offline)
- O Supabase project já está criado e as chaves disponíveis

### Restrições

- Stack mantida: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + React Router + TanStack Query + Supabase
- Código em inglês, interface em português (pt-BR) com acentuação correta
- Supabase como único backend (sem API custom, sem BFF)
- Sem testes E2E nesta fase (testes unitários + visuais + manuais)

---

## Histórico de Versões

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-07-20 | Versão inicial — addendum fase 2 (auth + Supabase) |
