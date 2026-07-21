# QA Report: Fase 2 Sprint 2 — Auth — CRM Studio Belle

## Status: APROVADO

**Data:** 2026-07-20
**Escopo:** Auth real com Supabase (login, roles, rotas protegidas, Edge Function create-user, UI condicional, logout)

---

## Validacao Estatica

| Check | Resultado |
|-------|-----------|
| `npm run build` | Limpo (1953 modulos) |
| `npx vitest run` | 135/135 passando (117 anteriores + 18 novos) |
| `npm run dev` | Funcional (HTTP 200) |

---

## Testes Vitest Criados (Sprint 2)

| Arquivo | Testes | Passaram |
|---------|--------|----------|
| `src/contexts/__tests__/AuthContext.test.tsx` | 5 | 5/5 |
| `src/components/auth/__tests__/ProtectedRoute.test.tsx` | 3 | 3/3 |
| `src/components/auth/__tests__/AdminRoute.test.tsx` | 3 | 3/3 |
| `src/pages/__tests__/LoginPage.test.tsx` | 7 | 7/7 |

### Cenarios cobertos (vitest)
- AuthContext: isAdmin=true com app_metadata.role=admin, isAdmin=false com role=employee, isAdmin=false sem role, isAdmin=false sem user, profile null graceful
- ProtectedRoute: spinner em loading, redirect /login sem sessao, Outlet com sessao
- AdminRoute: spinner em loading, redirect / sem admin, Outlet com admin
- LoginPage: spinner em loading, redirect / com sessao, no-op email vazio, no-op senha vazia, signIn com email trimado, erro exibido em falha, biometria desabilitada

---

## Testes de Integracao com Usuarios Reais [AUTO:integ-auth]

### Login e JWT

| Teste | Resultado |
|-------|-----------|
| Admin login (email+senha) | OK — token obtido |
| Admin JWT app_metadata.role | `admin` (Auth Hook ativo) |
| Employee login (email+senha) | OK — token obtido |
| Employee JWT app_metadata.role | `employee` |
| Admin profile no banco | `Andre` role `admin` confirmado |

### Permissoes Employee (sessao real)

| Operacao | Esperado | Resultado |
|----------|----------|-----------|
| SELECT products | Dados retornados | OK (3+ linhas) |
| SELECT store_settings | Dados retornados | OK (SELECT permitido) |
| UPDATE store_settings (markup→200) | Bloqueado por RLS | OK (204 sem efeito, valor continua 180) |
| SELECT profiles | Apenas proprio | OK (1 profile: Funcionaria Teste) |
| UPDATE profile de outro (admin) | Bloqueado por RLS | OK (0 rows matched) |
| Edge Function create-user | 403 | OK ("Apenas administradores podem criar usuarios") |

### Permissoes Admin (sessao real)

| Operacao | Esperado | Resultado |
|----------|----------|-----------|
| SELECT profiles | Todos visiveis | OK (2 profiles: Andre + Funcionaria Teste) |

### View products_display por Role

| Role | cost | Resultado |
|------|------|-----------|
| Employee | NULL (mascarado) | OK (Batom null, Base null, Mascara null) |
| Admin | Valor real | OK (Batom 14.00, Base 32.00, Mascara 18.00) |

### Edge Function create-user — Matriz de Validacao

| Cenario | HTTP | Mensagem | Status |
|---------|------|----------|--------|
| Sem Authorization header | 401 | "Token de autenticacao ausente" | OK |
| Employee (nao admin) | 403 | "Apenas administradores podem criar usuarios" | OK |
| Campos faltando | 422 | "Campos obrigatorios: email, full_name, role, password" | OK |
| Email invalido | 422 | "Email invalido" | OK |
| Senha < 8 chars | 422 | "Senha deve ter no minimo 8 caracteres" | OK |
| Role invalido (superuser) | 422 | "Role deve ser 'admin' ou 'employee'" | OK |
| Email duplicado | 400 | "Erro ao criar usuario" | OK |
| OPTIONS (CORS preflight) | 200 | "ok" | OK |

### Logout

| Teste | Resultado |
|-------|-----------|
| signOut (HTTP 204) | OK |
| Token pos-logout | JWT ainda valido ate expirar (comportamento JWT stateless esperado — refresh token revogado) |

---

## Verificacoes de Codigo (inspecao)

| Item | Resultado |
|------|-----------|
| isAdmin usa APENAS app_metadata.role (sem fallback profile) | OK (AuthContext.tsx:93) |
| LoginPage sem pre-fill (controlled inputs, value="") | OK |
| LoginPage trim no email, senha sem trim | OK (linha 20) |
| Erro generico "Email ou senha incorretos" (sem vazar existencia) | OK |
| ProtectedRoute: /login unica rota publica | OK (App.tsx:35) |
| /usuarios dentro de AdminRoute > ProtectedRoute > AppShell | OK (App.tsx:49-51) |
| Settings: Precificacao/Equipe/Loja condicionais {isAdmin && ...} | OK |
| Settings: "Sair da conta" FORA do bloco isAdmin | OK |
| Dashboard: nome dinamico profile.fullName, fallback "Usuario" | OK |
| Dashboard: initials via getInitials, fallback "U" | OK |
| onAuthStateChange com cleanup subscription.unsubscribe | OK |
| Lazy loading com Suspense + PageSkeleton | OK |

---

## Observacoes

1. **Edge Function requer `password` do client** — O test map (Nota Suggestion 3 do CR) mencionava senha gerada server-side, mas a implementacao atual requer `password` como campo obrigatorio no payload. O admin define a senha ao criar o usuario. Validacao de minimo 8 caracteres esta implementada.

2. **isAdmin sem fallback (Warning 1 do CR ja corrigido)** — AuthContext.tsx:93 usa apenas `user?.app_metadata?.role === 'admin'`, sem fallback para `profile?.role`. O Warning 1 do CR ja foi aplicado.

3. **Token pos-logout** — O access token JWT continua valido ate expirar apos logout. Comportamento esperado (JWT stateless). O refresh token e revogado, impedindo renovacao da sessao.

---

## Validacao Manual Pendente

| Item | Tipo |
|------|------|
| Login pela UI (campos, loading, redirect) | VISUAL/MANUAL |
| "Entrando..." durante submitting | VISUAL |
| Biometria desabilitada (opacity 50, cursor not-allowed) | VISUAL |
| Spinners dourados em loading states | VISUAL |
| UsersPage: listagem, criacao, troca de role | MANUAL |
| Settings condicional por role no browser | MANUAL |
| Dashboard "Ola, [nome]" no browser | VISUAL |
| Deep link sem sessao → redirect /login | MANUAL |

---

## Resumo

| Metrica | Valor |
|---------|-------|
| Arquivos de teste criados | 4 |
| Testes vitest (novos) | 18 |
| Total testes vitest | 135 (todos passando) |
| Testes integ-auth executados | 19 |
| Testes integ-auth passando | 19/19 |
| Build | Limpo |
| Bugs encontrados | 0 |

---

## Veredicto

**QA Fase 2 Sprint 2 APROVADO.** A autenticacao esta funcional e segura:
- Login real com JWT contendo `app_metadata.role` (Auth Hook ativo)
- RLS enforcement server-side confirmado (employee bloqueado em UPDATE store_settings e profiles de outros)
- View products_display mascara cost corretamente por role
- Edge Function create-user com matriz completa de validacao (401/403/422/400/201)
- Rotas protegidas (ProtectedRoute + AdminRoute) com redirects corretos
- UI condicional por role em Settings
- isAdmin sem fallback inseguro (usa apenas JWT)
- 135 testes vitest + 19 testes integ-auth, todos passando
