# Status: crm-belle (CRM Studio Bellê)

## Fase atual: Fase 3 (Multi-estabelecimento) Finalizada ✅ — validada no Supabase remoto
## Branch: main

### Fase 1 — MVP Frontend ✅
- 10 telas fiéis ao protótipo, mock data, BottomNav fixo
- 2 fixes visuais pós-entrega: CSS cascade layers (Tailwind v4) + position fixed no shell

### Fase 2 — Integração Supabase ✅ (5 sprints)
- Planejamento: PRD fase 2, Security Review, Data Architecture (1540 linhas), Backlog
- Sprint 1 — Infra: schema (6 tabelas + RLS + índices + triggers + Auth Hook + view + RPCs), seeds, client tipado, TanStack Query
- Sprint 2 — Auth: login real, roles no JWT, ProtectedRoute/AdminRoute, tela /usuarios, Edge Function create-user, admin André provisionado
- Sprint 3 — CRUD Products: leitura pela view (custo mascarado), soft delete admin via RPC
- Sprint 4 — CRUD Clients + Sales: venda E2E via RPC create_sale (totais/estoque server-side), estorno admin, histórico real
- Sprint 5 — Derivados + cleanup: settings persistidos, alertas derivados, busca accent-insensitive, formatCurrency com milhar, seeds relativos, DataContext/SettingsContext removidos
- Security hardening: 2 blockers HIGH + regressões corrigidos, re-auditado

### Fase 3 — Multi-estabelecimento + Admin geral ✅
- André (`andresantos.riak@gmail.com`) promovido para `super_admin` único (`establishment_id = NULL`)
- Nova tabela `establishments`; dados operacionais agora têm `establishment_id`
- Produtos, clientes, vendas, itens e configurações ficam isolados por estabelecimento
- Super admin vê todos os estabelecimentos e todos os dados; admin local/funcionário veem apenas o próprio estabelecimento
- Tela `/usuarios` permite ao super admin criar novas unidades e admins/funcionários vinculados a cada unidade
- Edge Function `create-user` atualizada para validar `super_admin` vs admin local e exigir estabelecimento
- `products_display` e RPCs `create_sale`, `cancel_sale`, soft deletes e settings ficaram tenant-aware

### Validação final
- Build limpo, 148 testes Vitest (22 arquivos)
- Security Audit v3: SEGURO PARA DEPLOY, 48/48 testes, 5 domínios OWASP
- QA final: 148 Vitest + 22 integ-auth de regressão E2E
- Validação Fase 3 real no Supabase: André login OK; JWT `super_admin`; 1 super admin no banco; 0 dados operacionais sem `establishment_id`; criação temporária de estabelecimento + admin local OK; admin local isolado do tenant principal; anon bloqueado em `products_display`; cleanup confirmado
- Migrations: schema + seeds relativos/VIP + security_hardening + multi-tenant + RPC follow-up

### Migrations
- 20260720220234_crm_belle_fase2_schema.sql
- 20260721000734_relative_seeds_and_vip_history.sql
- 20260721004406_security_hardening.sql
- 20260721150848_fase3_multitenant_super_admin.sql
- 20260721152025_fase3_multitenant_rpc_followup.sql

### Checklist PRÉ-PRODUÇÃO (ver docs/decisions.md + docs/crm-belle-security-audit.md)
- Trocar senha admin (123456 é dev), remover vars de seed
- Configurar domínio + ALLOWED_ORIGIN, habilitar MFA admin
- Audit trail (deleted_by/refunded_by), rate limiting Edge Function, recuperação de senha

### Próximo passo
- Commit/push para disparar Cloudflare Pages
- Validação visual pelo usuário no domínio Pages — login: andresantos.riak@gmail.com
