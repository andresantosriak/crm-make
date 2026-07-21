# Status: crm-belle (CRM Studio Bellê)

## Fase atual: Fase 2 (Supabase) Finalizada ✅ — segura para deploy (com checklist pré-produção)
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

### Validação final
- Build limpo, 148 testes Vitest (22 arquivos)
- Security Audit v3: SEGURO PARA DEPLOY, 48/48 testes, 5 domínios OWASP
- QA final: 148 Vitest + 22 integ-auth de regressão E2E
- Migrations: schema + seeds relativos/VIP + security_hardening

### Migrations
- 20260720220234_crm_belle_fase2_schema.sql
- 20260721000734_relative_seeds_and_vip_history.sql
- 20260721004406_security_hardening.sql

### Checklist PRÉ-PRODUÇÃO (ver docs/decisions.md + docs/crm-belle-security-audit.md)
- Trocar senha admin (123456 é dev), remover vars de seed
- Configurar domínio + ALLOWED_ORIGIN, habilitar MFA admin
- Audit trail (deleted_by/refunded_by), rate limiting Edge Function, recuperação de senha

### Próximo passo
- Validação visual pelo usuário (npm run dev, porta 8080) — login: andresantos.riak@gmail.com
- Deploy quando o checklist pré-produção for cumprido
