# Decisões — CRM Studio Bellê (crm-make)

### [2026-07-21] Senha do admin respeita política de mínimo 8
**Contexto:** Usuário pediu senha `123456` (6 chars), mas a política de auth configurada exige mínimo 8 — Supabase rejeita (weak_password) até via Admin API. O agente que provisionou o admin gerou senha aleatória em silêncio, causando falha de login não diagnosticada.
**Decisão:** Senha admin de desenvolvimento com 8 dígitos (respeita a política). Valor real só em `.env.local`. Sempre que o usuário pedir senha curta, avisar do conflito com a política em vez de gerar alternativa em silêncio.
**Escopo:** Provisionamento de usuários; onboarding de novos funcionários pela tela /usuarios.

### [2026-07-20] Sem rastreio /gp nesta fase
**Contexto:** Projeto não mapeado na plataforma GF; usuário dispensou o registro.
**Decisão:** Pipeline /team executado sem chamadas /gp.
**Escopo:** Sessão de implementação do MVP frontend.

### [2026-07-21] Fase 2 — Auth multi-usuário com roles (admin/funcionário)
**Contexto:** Usuário pediu multi-usuário; admin André cria os demais e vê tudo.
**Decisão:** Roles em `profiles.role` como fonte de verdade, injetados no JWT via Auth Hook `custom_access_token_hook`. `isAdmin` lê SOMENTE do JWT (server-side é o enforcement). Funcionário: dados do salão compartilhados (vende, vê todas as vendas, CRUD produtos/clientes), mas NÃO vê custo/margem, não exclui, não estorna, não edita settings, não gerencia usuários. Criação de usuários só pelo admin via Edge Function `create-user` (senha inicial definida pelo admin).
**Escopo:** Auth e RLS de todo o app.

### [2026-07-21] Venda avulsa (Consumidor final) permitida
**Contexto:** Protótipo exigia cliente; PRD fase 2 definiu `client_id` nullable.
**Decisão:** Venda sem cliente é permitida ("Consumidor final") — mudança consciente vs protótipo, alinhada aos seeds.
**Escopo:** Checkout e histórico.

### [2026-07-21] Proteção de custo em camadas + hardening de segurança
**Contexto:** Security Audit reprovou 2x com falhas reais de RLS (bypass via REST direto).
**Decisão:** Leitura de produtos SEMPRE pela view `products_display` (mascara `cost` para funcionário); `REVOKE SELECT(cost)` na tabela; `create_sale` como SECURITY DEFINER com policies de INSERT diretas removidas; trigger bloqueia desativação por não-admin; anon revogado em todas as views/tabelas. `unit_price` na RPC aceito do client (by-design, funcionário confiável) — registrado como LOW.
**Escopo:** Schema, RLS, RPCs.

### [2026-07-21] Pendências pré-produção (não bloqueantes)
**Contexto:** Security Audit final aprovou com checklist.
**Decisão:** Antes de deploy real: trocar senha admin (123456 é dev), remover vars de seed, configurar domínio + ALLOWED_ORIGIN, habilitar MFA admin, adicionar audit trail (deleted_by/refunded_by), rate limiting na Edge Function, fluxo de recuperação de senha. Meta do mês (68%) e card Sophia seguem hardcoded/mock (IA fora de escopo).
**Escopo:** Deploy e evolução futura.

### [2026-07-20] Frontend mock-first; Supabase é fase 2
**Contexto:** Handoff de design do Claude Design; usuário pediu frontend fiel ao protótipo.
**Decisão:** MVP 100% frontend com mock data em `src/data/*.ts`. As chaves Supabase no `.env` ficam reservadas para a fase 2 (não importar em código).
**Escopo:** Projeto inteiro até decisão de integrar backend.

### [2026-07-20] round90 com empate para baixo (fiel ao protótipo)
**Contexto:** AC do backlog esperava `round90(50.40) = 50.90`, mas o protótipo implementa `(v-d) <= (u-v) ? d : u` (empate → floor → 49.90).
**Decisão:** Fidelidade ao protótipo vence AC do backlog. `round90(50.40) = 49.90`.
**Escopo:** `src/lib/pricing.ts` e telas de precificação.

### [2026-07-20] Ticket médio calculado, não estático
**Contexto:** Protótipo mostra "Ticket médio R$ 52,58" fixo, inconsistente com os próprios dados mock (R$ 420,60 ÷ 4 = R$ 105,15).
**Decisão:** Exibir valor calculado (`todayTotal / todayCount`). Fidelidade funcional vence texto estático incoerente.
**Escopo:** Dashboard (`SalesTodayCard`).

### [2026-07-20] "Este mês" e "Meta do mês" hardcoded no MVP
**Contexto:** Protótipo usa valores fixos (R$ 6.240, 68%); não há dados mock de meses anteriores.
**Decisão:** Aceito hardcoded no MVP; recalcular quando houver backend.
**Escopo:** Dashboard e Histórico.

### [2026-07-20] Pendências técnicas registradas (não-bloqueantes)
**Contexto:** Reviews e QA aprovaram com ressalvas de baixa severidade.
**Decisão:** Registrar para fase 2, sem corrigir agora: formatCurrency sem separador de milhar; `key={index}` em listas de clientes (Client sem id); ClientPicker cria objeto Client duplicado; AlertsPage/PromosPage importam mock direto de `src/data/`; busca não é accent-insensitive (normalize('NFD') pós-MVP).
**Escopo:** Backlog da fase 2.
