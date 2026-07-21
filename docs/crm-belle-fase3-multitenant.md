# CRM Studio Bellê — Fase 3 Multi-Estabelecimento

## Objetivo

Transformar o CRM em uma operação multi-estabelecimento:

- André é o único `super_admin` global.
- André vê todos os estabelecimentos e todos os dados.
- André cria novas unidades e cria admins/funcionários para cada unidade.
- Cada estabelecimento tem produtos, estoque, clientes, vendas, itens e configurações próprios.
- Admin local e funcionário não enxergam dados de outros estabelecimentos.

## Modelo de Roles

| Role | Escopo | Permissões |
| --- | --- | --- |
| `super_admin` | Global | Vê tudo, cria estabelecimentos, cria admins locais e funcionários, acessa qualquer estabelecimento |
| `admin` | Um estabelecimento | Gerencia equipe local, produtos, clientes, vendas, settings e ações admin do próprio estabelecimento |
| `employee` | Um estabelecimento | Opera vendas, produtos e clientes do próprio estabelecimento conforme regras já existentes |

Regra estrutural: `super_admin` deve ter `establishment_id = NULL`; `admin` e `employee` devem ter `establishment_id` preenchido.

## Dados Isolados Por Estabelecimento

Tabelas com `establishment_id` obrigatório:

- `products`
- `clients`
- `sales`
- `sale_items`
- `store_settings`

A tabela `profiles` usa `establishment_id` para usuários locais e `NULL` apenas para o super admin.

## Backend

Migrations aplicadas:

- `20260721150848_fase3_multitenant_super_admin.sql`
- `20260721152025_fase3_multitenant_rpc_followup.sql`

Principais mudanças:

- Nova tabela `establishments`.
- Helpers RLS: `is_super_admin`, `current_establishment_id`, `can_access_establishment`, `is_establishment_admin_for`.
- RLS tenant-aware em todas as tabelas operacionais.
- `products_display` filtra por tenant e mantém mascaramento de custo por role.
- `create_establishment` permite criação de unidade apenas pelo super admin.
- `create_sale` exige tenant autorizado e preenche `sale_items.establishment_id`.
- `cancel_sale` restaura estoque apenas dentro do estabelecimento da venda.
- Edge Function `create-user` valida caller e estabelecimento antes de criar usuário.

## Frontend

Principais arquivos:

- `src/contexts/AuthContext.tsx`: expõe `isSuperAdmin`, `selectedEstablishmentId` e `setSelectedEstablishmentId`.
- `src/components/layout/EstablishmentSwitcher.tsx`: seletor global visível apenas para super admin.
- `src/pages/UsersPage.tsx`: criação de estabelecimentos e usuários por unidade.
- `src/hooks/useEstablishments.ts`: lista e cria estabelecimentos.
- `src/hooks/useProducts.ts`, `useClients.ts`, `useSales.ts`, `useStoreSettings.ts`, `useUsers.ts`: filtros por tenant.

## Validação Executada

- `npx supabase db push`: migrations Fase 3 aplicadas.
- `npx supabase functions deploy create-user`: Edge Function publicada.
- `npm run build`: sem erros.
- `npx vitest run`: 148 testes passando.
- Teste real com sessões Supabase:
  - André login OK com JWT `app_metadata.role = super_admin`.
  - Banco tem exatamente 1 `super_admin`.
  - `products`, `clients`, `sales`, `sale_items` e `store_settings`: 0 registros sem `establishment_id`.
  - André criou estabelecimento temporário via RPC.
  - André criou admin local para esse estabelecimento via Edge Function.
  - Admin local viu 0 produtos antes de cadastrar, criou produto próprio e continuou isolado do tenant principal.
  - Admin local foi bloqueado ao tentar inserir produto em outro estabelecimento.
  - André viu produtos globais de 2 tenants durante o teste.
  - Anon foi bloqueado em `products_display`.
  - Cleanup final confirmado: 1 estabelecimento ativo, 10 produtos ativos, 2 perfis, 1 super admin.
