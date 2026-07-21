# Test Map — Fase 2 / Sprint 2 (Auth) — CRM Studio Belle

> Autenticacao real com Supabase Auth: login, roles (admin/employee), rotas protegidas, gestao de usuarios via Edge Function, logout, UI condicional por role.
> Analise baseada no **codigo atual** em `src/` (AuthContext, ProtectedRoute, AdminRoute, LoginPage, UsersPage, SettingsPage, App.tsx, hooks/useUsers) e `supabase/functions/create-user/index.ts`.
> Base: `docs/crm-belle-backlog-fase2.md` (Sprint 2), config remota (signup off, senha min 8, Auth Hook ativo).

**Gerado em:** 2026-07-20

## Como testar os itens [AUTO]
- **`[AUTO:vitest]`** — unitario com Supabase/router mockados (AuthContext, guards, LoginPage, hooks). Ainda NAO existem testes de auth em `src/` — QA cria.
- **`[AUTO:integ-auth]`** — integracao com sessao real (admin OU employee) contra o projeto remoto.
- **`[AUTO:mgmt]`** — verificacao de config/estado via Management API ou SQL (ex.: Edge Function ACTIVE, signup off).

> **Setup obrigatorio para o QA:** alem do admin real ja existente, o QA precisara **criar um usuario funcionario de teste real** — via a propria Edge Function `create-user` autenticado como admin — e registrar ambos (admin + employee) em `docs/credentials.md` (git-ignored). Sem o employee real, os testes de role (secao 6) nao podem ser validados de ponta a ponta.

---

## 1. Login (happy path)

Arquivo: `LoginPage.tsx` + `AuthContext.signIn`.

- [ ] **[AUTO:integ-auth]** Login admin com email+senha corretos → `signInWithPassword` sucesso → sessao criada → redirect para `/` (Navigate quando `session` presente)
- [ ] **[VISUAL]** Campos **sem pre-preenchimento** (email e senha vazios; placeholders "seu@email.com" / "Sua senha")
- [ ] **[VISUAL]** Botao mostra "Entrando..." enquanto `submitting`; volta a "Entrar" so em caso de erro
- [ ] **[VISUAL]** Link "Entrar com biometria" desabilitado (opacity 50, cursor not-allowed, title "Em breve")
- [ ] **[AUTO:vitest]** Submit com email OU senha vazios (trim) → no-op (nao chama signIn)
- [ ] **[AUTO:vitest]** `signIn` faz trim no email antes de enviar; senha enviada sem trim
- [ ] **[VISUAL]** Senha com `type="password"` (mascara), autoComplete current-password

---

## 2. Logout (happy path)

Arquivo: `SettingsPage.handleLogout` + `AuthContext.signOut`.

- [ ] **[AUTO:integ-auth]** "Sair da conta" → `supabase.auth.signOut()` → limpa session/user/profile → navigate `/login`
- [ ] **[AUTO:integ-auth]** Apos logout, acessar rota protegida (ex.: `/`) → redirect `/login` (sessao removida)
- [ ] **[VISUAL]** Botao "Sair da conta" visivel para admin E employee (fora do bloco `isAdmin`)

---

## 3. Rotas protegidas e roles

Arquivos: `App.tsx`, `ProtectedRoute.tsx`, `AdminRoute.tsx`.

### Happy path
- [ ] **[AUTO:vitest]** ProtectedRoute com `isLoading=true` → spinner "Carregando..." (nao redireciona ainda)
- [ ] **[AUTO:vitest]** ProtectedRoute sem session (apos load) → `<Navigate to="/login" replace />`
- [ ] **[AUTO:vitest]** ProtectedRoute com session → renderiza `<Outlet />` (conteudo)
- [ ] **[AUTO:vitest]** AdminRoute com `isAdmin=false` → `<Navigate to="/" replace />`
- [ ] **[AUTO:vitest]** AdminRoute com `isAdmin=true` → renderiza `<Outlet />`
- [ ] **[AUTO:integ-auth]** Admin acessa `/usuarios` → UsersPage renderiza (aninhada em AdminRoute > ProtectedRoute > AppShell)

### Edge cases
- [ ] **[AUTO:integ-auth]** Employee tenta `/usuarios` → AdminRoute redireciona para `/`
- [ ] **[MANUAL]** Anon (sem sessao) tenta deep link `/estoque` → ProtectedRoute redireciona `/login`
- [ ] **[MANUAL]** **Deep link pos-login NAO e preservado:** ProtectedRoute usa `Navigate to="/login"` sem `state.from`; apos login o usuario cai em `/` (LoginPage redireciona para `/`), nao na rota originalmente pedida. Documentar comportamento atual — ver Nota 1
- [ ] **[AUTO:vitest]** LoginPage com `session` presente → `<Navigate to="/" replace />` (evita re-login)
- [ ] **[AUTO:vitest]** LoginPage com `isLoading=true` → spinner (nao mostra form)

### Estados de UI (loading)
- [ ] **[VISUAL]** Spinner dourado (border-gold, animate-spin) em ProtectedRoute, AdminRoute e LoginPage durante `isLoading`
- [ ] **[VISUAL]** PageSkeleton (spinner) durante lazy loading das rotas (Suspense fallback)

---

## 4. AuthContext (sessao, profile, role)

Arquivo: `AuthContext.tsx`.

### Happy path
- [ ] **[AUTO:vitest]** Ao montar: `getSession` → se sessao, `getUser` (verifica) → `fetchProfile` → `isLoading=false`
- [ ] **[AUTO:vitest]** Sem sessao inicial → `isLoading=false` direto (nao busca user/profile)
- [ ] **[AUTO:integ-auth]** `fetchProfile` popula profile a partir de `profiles` (mapeado por `toProfile`: full_name→fullName, role)
- [ ] **[AUTO:vitest]** `isAdmin` = `user.app_metadata.role === 'admin'` OU `profile.role === 'admin'` (fallback)

### Edge cases
- [ ] **[AUTO:integ-auth]** `onAuthStateChange` com refresh token → atualiza session/user, re-busca profile
- [ ] **[AUTO:integ-auth]** `onAuthStateChange` com signOut (newSession null) → zera user e profile
- [ ] **[AUTO:integ-auth]** **Usuario sem profile** (registro em profiles ausente): `fetchProfile` falha silenciosamente (profile fica null); `isAdmin` cai para app_metadata.role. Validar que app nao quebra (usa 'Usuário' no dashboard)
- [ ] **[MANUAL]** **Sessao expirada:** token expira → `onAuthStateChange`/proximo request falha → usuario redirecionado a `/login` na proxima navegacao protegida
- [ ] **[AUTO:integ-auth]** Divergencia JWT vs profile: se Auth Hook nao injetou role mas profile.role='admin', client mostra admin (fallback) mas RLS server nega — ver Nota 2

---

## 5. Gestao de usuarios — /usuarios (admin-only)

Arquivos: `UsersPage.tsx`, `hooks/useUsers.ts`.

### Happy path — listagem
- [ ] **[AUTO:integ-auth]** `useUsers` lista profiles ordenados por created_at asc (admin ve todos via policy profiles_select)
- [ ] **[VISUAL]** Header "Equipe" + contagem "N membro(s)" (singular/plural)
- [ ] **[VISUAL]** Cada membro: avatar iniciais + nome + "Administrador"/"Funcionário"; proprio usuario marcado " (você)"
- [ ] **[VISUAL]** Loading: spinner enquanto `isPending`

### Happy path — criacao
- [ ] **[MANUAL]** "Convidar" abre form (toggle); campos Nome, E-mail, seletor de role (Funcionário/Admin, default Funcionário)
- [ ] **[AUTO:integ-auth]** Submit valido → `useCreateUser` invoca Edge Function `create-user` → usuario criado no Auth + profile via trigger → toast "Usuário criado com sucesso" → invalida `['users']` (lista atualiza)
- [ ] **[VISUAL]** Botao submit "Criando..." enquanto `createUser.isPending`
- [ ] **[AUTO:vitest]** Submit com nome OU email vazios (trim) → no-op

### Happy path — troca de role
- [ ] **[AUTO:integ-auth]** `useUpdateUserRole` (admin) faz `profiles.update({role}).eq('id',userId)` → toast "Cargo atualizado" → invalida lista
- [ ] **[AUTO:vitest]** `handleToggleRole` no proprio usuario (userId === user.id) → no-op (nao rebaixa a si mesmo)
- [ ] **[VISUAL]** Botao de role oculto para o proprio usuario (isSelf); alterna Admin↔Func. para os demais

### Edge cases
- [ ] **[AUTO:integ-auth]** Employee que burlar AdminRoute e chamar `useUpdateUserRole` → RLS nega (policy profiles_update exige is_admin()) → toast de erro
- [ ] **[AUTO:integ-auth]** Troca de role NAO atualiza o JWT do afetado imediatamente (Auth Hook so injeta no proximo refresh/login) — ver Nota 3

---

## 6. Permissoes / RLS por role (UI condicional)

Arquivo: `SettingsPage.tsx` (secoes condicionais).

- [ ] **[AUTO:vitest]** Employee: Settings mostra apenas Perfil + Notificações + "Sair da conta"
- [ ] **[AUTO:vitest]** Employee: seções **Precificação (markup), Equipe e Loja ficam ocultas** (`{isAdmin && ...}`)
- [ ] **[AUTO:vitest]** Admin: Settings mostra todas as seções (Perfil, Notificações, Precificação, Equipe, Loja, Sair)
- [ ] **[MANUAL]** Employee nao ve link/atalho para `/usuarios` (secao Equipe oculta) e, se digitar a URL, AdminRoute redireciona `/`
- [ ] **[AUTO:integ-auth]** Enforcement real e server-side: employee com markup escondido ainda seria bloqueado por RLS ao tentar UPDATE store_settings

---

## 7. Edge Function create-user (integracao backend)

Arquivo: `supabase/functions/create-user/index.ts`.

### Deploy/estado
- [ ] **[AUTO:mgmt]** Edge Function `create-user` esta **ACTIVE** no projeto remoto (Management API / `supabase functions list`)
- [ ] **[AUTO:mgmt]** Secrets disponiveis para a function: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

### Happy path
- [ ] **[AUTO:integ-auth]** Admin autenticado invoca create-user com {email, full_name, role} validos → 201 + `{user:{id,email,full_name,role}}` → usuario existe no Auth (email_confirm true) e profile criado com role correto (trigger handle_new_user)
- [ ] **[AUTO:integ-auth]** Senha temporaria gerada server-side (nao vem do client)

### Edge cases — autorizacao
- [ ] **[AUTO:integ-auth]** Sem header Authorization → **401** "Token de autenticação ausente"
- [ ] **[AUTO:integ-auth]** Token invalido/expirado → **401** "Não autenticado"
- [ ] **[AUTO:integ-auth]** Caller **employee** (app_metadata.role !== 'admin') → **403** "Apenas administradores podem criar usuários" (rejeita caller nao-admin)

### Edge cases — validacao (422)
- [ ] **[AUTO:integ-auth]** Falta email, full_name ou role → 422 "Campos obrigatórios..."
- [ ] **[AUTO:integ-auth]** Email fora do formato (regex) → 422 "Email inválido"
- [ ] **[AUTO:integ-auth]** Role fora de {'admin','employee'} (ex.: 'superuser') → 422 "Role deve ser 'admin' ou 'employee'" (whitelist)

### Edge cases — outros
- [ ] **[AUTO:integ-auth]** Email ja existente no Auth → 400 "Erro ao criar usuário" (createError)
- [ ] **[AUTO:integ-auth]** OPTIONS (preflight CORS) → 200 "ok" com corsHeaders
- [ ] **[MANUAL]** Defense in depth: mesmo se um role invalido passasse, o trigger `handle_new_user` normaliza para 'employee' (dupla validacao)

---

## 8. Dashboard — nome dinamico

Arquivo: `DashboardPage.tsx`.

- [ ] **[AUTO:vitest]** Saudacao usa `profile.fullName.split(' ')[0]` (primeiro nome); avatar usa `getInitials(fullName)`
- [ ] **[AUTO:vitest]** Sem profile → fallback "Usuário" e inicial "U" (nao quebra)
- [ ] **[VISUAL]** Admin "André" → "Olá, André" + avatar "A" (ou iniciais); nome nao mais hardcoded "Bruna"

---

## 9. Config remota (verificacao)

- [ ] **[AUTO:mgmt]** Signup publico DESABILITADO (Auth settings) — usuarios so via Edge Function
- [ ] **[AUTO:mgmt]** Senha minima = 8 caracteres
- [ ] **[AUTO:integ-auth]** Auth Hook ATIVO: JWT do admin apos login contem `app_metadata.role = 'admin'` (decodificar token)
- [ ] **[AUTO:integ-auth]** Admin real existe com role 'admin' em profiles

---

## Resumo de cobertura

| Secao | vitest | integ-auth | mgmt | VISUAL/MANUAL |
|-------|--------|-----------|------|---------------|
| Login | 2 | 1 | 0 | 4 |
| Logout | 0 | 2 | 0 | 1 |
| Rotas/roles | 6 | 2 | 0 | 4 |
| AuthContext | 3 | 4 | 0 | 1 |
| /usuarios | 2 | 4 | 0 | 5 |
| Permissoes UI | 3 | 1 | 0 | 1 |
| Edge Function | 0 | 10 | 2 | 1 |
| Dashboard nome | 2 | 0 | 0 | 1 |
| Config remota | 0 | 2 | 2 | 0 |

**Prioridade QA:** (1) criar o employee de teste via Edge Function e registrar credenciais; (2) `[AUTO:integ-auth]` da Edge Function (matriz 401/403/422/201 — critico de seguranca); (3) guards de rota `[AUTO:vitest]` (ProtectedRoute/AdminRoute); (4) UI condicional de Settings por role; (5) fluxo login→logout real.

## Notas para Code Reviewer / PO
1. **Deep link pos-login nao preservado:** `ProtectedRoute` redireciona para `/login` sem guardar a rota pretendida (`state.from`), e `LoginPage`/pos-login sempre manda para `/`. Um usuario que abre `/estoque` sem sessao loga e cai no Dashboard, nao no estoque. Se preservar deep link for requisito, adicionar `state={{ from: location }}` + `Navigate to={from}` apos login. Comportamento atual documentado como esperado por ora.
2. **isAdmin com fallback para profile.role diverge do enforcement server-side:** o client considera admin se `app_metadata.role==='admin'` **OU** `profile.role==='admin'`. O servidor (RLS/RPC/Edge Function) usa **apenas** o JWT (`app_metadata.role`). Se o Auth Hook nao tiver propagado a role ao JWT (ex.: logo apos promover alguem, antes do refresh), o client mostra UI de admin mas o servidor nega as acoes — inconsistencia de UX. Como o Auth Hook esta ativo e a role vem do login, o caso e restrito a janela pos-promocao. Considerar remover o fallback ou forcar refresh de sessao apos troca de role.
3. **Troca de role nao reflete no JWT imediatamente:** `useUpdateUserRole` altera `profiles.role`, mas o JWT do usuario afetado so recebe a nova role no proximo refresh/login (Auth Hook roda na emissao do token). O usuario promovido/rebaixado precisa relogar para o enforcement server-side mudar. Registrar como comportamento esperado ou implementar force-logout do afetado.
4. **Mensagem de erro de login generica (bom para seguranca):** qualquer falha de `signInWithPassword` retorna "Email ou senha incorretos" — nao vaza se o email existe. Manter.
