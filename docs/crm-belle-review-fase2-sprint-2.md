# Code Review: Fase 2 Sprint 2 — Auth

## Status: Aprovado

## Objetivo do Sprint
Auth real com Supabase: login com email/senha, roles (admin/employee), rotas protegidas, gestao de usuarios via Edge Function, logout, UI condicional por role.

## Tasks Validadas

| Task | Status | Observacao |
|------|--------|------------|
| AuthContext + useAuth | OK | getUser() para verificacao, cleanup no onAuthStateChange, fallback sem profile |
| ProtectedRoute + AdminRoute | OK | Redirects corretos, loading states, nenhuma rota vazou |
| LoginPage (auth real) | OK | Sem pre-fill, trim no email, erros pt-BR, loading state, biometria desabilitada |
| UsersPage + useUsers | OK | CRUD com invalidateQueries, tratamento de erros, UI com acentos |
| Edge Function create-user | OK | Caminho seguro verificado: JWT validado server-side, role admin enforced, whitelist, CORS |
| App.tsx (lazy loading + rotas) | OK | Todas as rotas sob ProtectedRoute, /usuarios sob AdminRoute, Suspense |
| Settings/ProfileCard/Dashboard condicionais | OK | Secoes por role, nome dinamico, fallbacks |

## Pontos Positivos

1. **Edge Function com caminho de seguranca exemplar** — A verificacao segue a ordem correta: (1) header Authorization presente, (2) `getUser()` valida JWT server-side (nao `getSession()`), (3) `app_metadata.role === 'admin'` no JWT verificado, (4) so entao cria adminClient com SERVICE_ROLE_KEY. A senha temporaria e gerada server-side (`crypto.randomUUID` + complexidade). Erro generico sem vazar detalhes. Defense in depth com trigger `handle_new_user` normalizando role invalido.
2. **Cleanup do onAuthStateChange** — O useEffect retorna `subscription.unsubscribe()`, evitando memory leak. O listener atualiza session, user E profile a cada mudanca de estado de auth. Quando newSession e null (logout), zera tudo corretamente.
3. **LoginPage com boa UX de seguranca** — Campos controlados (sem pre-fill), email trimado antes de enviar, senha preservada sem trim, erro generico "Email ou senha incorretos" (nao vaza se email existe), loading state impede double-submit, form semantico com `<form onSubmit>` (enter key funciona), autoComplete correto.
4. **Nenhuma rota vazou fora do ProtectedRoute** — App.tsx tem apenas `/login` fora do guard. Todas as demais 10 rotas estao dentro de ProtectedRoute, e `/usuarios` esta aninhado em AdminRoute. A hierarquia ProtectedRoute > AppShell > rotas garante que nenhum conteudo e acessivel sem sessao.
5. **Mappers snake_case para camelCase bem estruturados** — `src/lib/mappers.ts` centraliza a conversao de todos os 6 tipos de entidade. Trata nullables corretamente, usa Number() para numerics, e e o unico ponto de conversao (nao ha mapeamento espalhado).
6. **Settings com secoes condicionais corretas** — Employee ve Perfil + Notificacoes + Sair. Admin ve tudo (inclui Precificacao, Equipe, Loja). O botao "Sair da conta" esta FORA do bloco isAdmin, visivel para todos. Enforcement real e server-side (RLS nega UPDATE em store_settings para nao-admin).

## Compliance

### Auth Flow
- [x] `getUser()` usado para verificacao (nao `getSession()`) — AuthContext linha 49
- [x] `onAuthStateChange` com cleanup (subscription.unsubscribe) — AuthContext linha 75
- [x] `signIn` com erro generico "Email ou senha incorretos" — nao vaza existencia de email
- [x] `signOut` limpa session + user + profile — AuthContext linha 87-90
- [x] `fetchProfile` trata ausencia de profile graciosamente (profile fica null) — AuthContext linha 40
- [x] isLoading impede redirect prematuro durante carga inicial

### Rotas Protegidas
- [x] /login fora do ProtectedRoute (unica rota publica)
- [x] Todas as 10 rotas operacionais dentro de ProtectedRoute
- [x] /usuarios dentro de AdminRoute > ProtectedRoute (dupla protecao)
- [x] ProtectedRoute: loading → redirect /login se sem sessao → Outlet se com sessao
- [x] AdminRoute: loading → redirect / se nao admin → Outlet se admin
- [x] LoginPage redireciona para / se ja tem sessao (evita re-login)
- [x] Lazy loading com Suspense + PageSkeleton em todas as paginas

### Edge Function create-user
- [x] CORS preflight tratado (OPTIONS → 200 "ok")
- [x] Authorization header obrigatorio (401 se ausente)
- [x] JWT verificado server-side via `callerClient.auth.getUser()` (nao parse local)
- [x] Role admin verificado em `app_metadata.role` do JWT verificado (403 se nao admin)
- [x] callerClient usa ANON key + JWT do caller (correto — contexto do chamador)
- [x] adminClient usa SERVICE_ROLE_KEY somente apos verificacao admin (correto — privilegio minimo)
- [x] Campos obrigatorios validados (email, full_name, role) → 422
- [x] Email validado com regex → 422
- [x] Role validado contra whitelist ['admin', 'employee'] → 422
- [x] Senha temporaria gerada server-side (crypto.randomUUID + complexidade)
- [x] email_confirm: true (skip verificacao por email)
- [x] Erros genericos ao cliente ("Erro ao criar usuario", "Erro interno do servidor")
- [x] console.error apenas server-side (nao exposto ao client)
- [x] SERVICE_ROLE_KEY via Deno.env.get (nao hardcoded)

### TanStack Query
- [x] useUsers: queryKey ['users'], queryFn com select/order, mapeado com toProfile
- [x] useCreateUser: useMutation, invoca Edge Function, invalidateQueries(['users']) no onSuccess
- [x] useUpdateUserRole: useMutation, profiles.update().eq(), invalidateQueries(['users'])
- [x] Toast de erro em onError de ambas mutations
- [x] Toast de sucesso em onSuccess

### UI condicional por role
- [x] SettingsPage: Precificacao + Equipe + Loja condicionais com `{isAdmin && ...}`
- [x] SettingsPage: Notificacoes + Sair visiveis para todos
- [x] ProfileCard: role label dinamico ("Admin" / "Funcionario")
- [x] DashboardPage: nome dinamico via profile.fullName, fallback "Usuario"
- [x] UsersPage: self-demotion prevenida (handleToggleRole no-op se userId === user.id)
- [x] UsersPage: botao de role oculto para o proprio usuario (isSelf)

### Textos pt-BR
- [x] "Entrando...", "Entrar", "Entrar com biometria" ✓
- [x] "Carregando..." nos spinners ✓
- [x] "Funcionario" com acento correto ✓
- [x] "Email ou senha incorretos" ✓
- [x] "Usuario criado com sucesso", "Cargo atualizado" ✓
- [x] "Equipe", "membro/membros" ✓
- [x] "Gerenciar usuarios" com acento ✓
- [x] "Configuracoes", "Notificacoes", "Precificacao" com acentos ✓

## Seguranca

- [x] `grep -r "sb_secret|SUPABASE_SECRET|service_role|SECRET_KEY" src/` = 0 resultados
- [x] Client usa apenas VITE_* (publishable key)
- [x] Edge Function usa Deno.env.get para SERVICE_ROLE_KEY (server-only)
- [x] Criacao de usuario impossivel sem ser admin: JWT verificado → role admin obrigatorio → so entao SERVICE_ROLE_KEY e usada
- [x] Employee que tentar chamar Edge Function diretamente: 403 "Apenas administradores..."
- [x] Employee que burlar AdminRoute e chamar useUpdateUserRole: RLS nega (policy profiles_update exige is_admin())
- [x] Signup publico desabilitado (config remota verificada pelo team-lead)
- [x] Auth Hook ativo (JWT contem app_metadata.role verificado pelo team-lead)

## Qualidade de Codigo

### Code Smells
- [x] Sem duplicacao significativa
- [x] Componentes com responsabilidade unica
- [x] Mappers centralizados em lib/mappers.ts

### Nomes e Legibilidade
- [x] handleSubmit, handleLogout, handleCreateUser, handleToggleRole — consistentes
- [x] ProtectedRoute/AdminRoute auto-explicativos
- [x] callerClient vs adminClient — distincao clara na Edge Function

### Complexidade
- [x] Todos os arquivos abaixo de 170 linhas (UsersPage maior com 170)
- [x] Edge Function linear (sem aninhamento profundo): auth → validacao → criacao

### React Patterns
- [x] useEffect com cleanup no onAuthStateChange
- [x] useCallback em signIn, signOut, fetchProfile
- [x] key={u.id} na lista de usuarios
- [x] Form semantico (<form onSubmit>) no LoginPage e UsersPage
- [x] isPending (TanStack Query v5) usado corretamente (nao isLoading)
- [x] useMutation com onSuccess/onError — correto para TQ v5

### Acoplamento
- [x] AuthContext independente dos outros contexts (posicao correta em main.tsx)
- [x] Edge Function independente do frontend (REST API padrao)
- [x] Guards de rota nao dependem de logica de negocio

## Classificacao dos Achados do Test Map

### Achado 1 — Deep link sem state.from
ProtectedRoute redireciona para `/login` sem guardar a rota pretendida. Apos login, usuario sempre cai no Dashboard, nao na rota originalmente pedida.
- **Classificacao: SUGGESTION** — UX convenience, nao afeta funcionalidade nem seguranca. O comportamento atual (sempre Dashboard) e previsivel e consistente. Preservar deep link seria ideal mas nao e requisito do MVP.
- **Recomendacao:** Adicionar `state={{ from: location }}` no Navigate do ProtectedRoute e `const from = location.state?.from?.pathname || '/'` no LoginPage pos-signIn. Pode ser feito na Sprint 5 (pendencias).

### Achado 2 — isAdmin fallback client vs server
O client considera admin se `app_metadata.role === 'admin'` OU `profile.role === 'admin'`. O servidor usa APENAS o JWT. Se o Auth Hook nao propagou a role ao JWT (ex: logo apos promover alguem, antes do refresh), o client mostra UI de admin mas o servidor nega as acoes.
- **Classificacao: WARNING** — A janela de inconsistencia e estreita (entre promocao e proximo login do afetado), mas pode confundir: admin promovido ve UI de admin, clica em acoes, e recebe erros 403/RLS denied. Nao e vulnerabilidade de seguranca (server enforcement correto), mas e UX enganosa.
- **Recomendacao:** Forcar `supabase.auth.refreshSession()` apos useUpdateUserRole.onSuccess para o usuario ATUAL. Para o usuario AFETADO (outro tab/dispositivo), nao ha mecanismo imediato — documentar que o afetado precisa relogar. Alternativa mais conservadora: remover o fallback e usar apenas JWT (`app_metadata.role`), aceitando que pre-propagacao o usuario ve UI de employee ate relogar.

### Observacao 3 — Role so atualiza no JWT no proximo refresh
Ao mudar role de alguem via useUpdateUserRole, o JWT do usuario afetado mantem a role antiga ate o proximo login/refresh.
- **Classificacao: SUGGESTION** — Comportamento inerente a autenticacao JWT-based. Para um time de 2-5 pessoas, informar verbalmente que o afetado precisa relogar e suficiente. Um force-logout via Realtime ou polling seria ideal mas e complexo para o MVP.
- **Recomendacao:** Documentar no manual de uso. Considerar implementar em sprint futura se o time crescer.

## Resumo de Problemas

### Blockers
Nenhum.

### Warnings (deveria corrigir)
1. **isAdmin com fallback para profile.role** — O `AuthContext.tsx:93-94` usa `(user?.app_metadata?.role === 'admin') || (profile?.role === 'admin')`. O fallback para `profile.role` pode mostrar UI de admin quando o servidor (JWT-only) negara as acoes. A janela e estreita (pos-promocao, pre-refresh), mas a UX fica enganosa. Considerar remover o fallback ou forcar refresh de sessao apos troca de role.
   - Arquivo: `src/contexts/AuthContext.tsx:93-94`
   - Como corrigir: Opcao A — remover fallback: `const isAdmin = user?.app_metadata?.role === 'admin'`. Opcao B — manter fallback + forcar `refreshSession()` apos `useUpdateUserRole.onSuccess`.

### Suggestions (poderia melhorar)
1. **Deep link pos-login nao preservado** — ProtectedRoute nao guarda `location` no `state.from`. UX convenience, nao requisito do MVP.

2. **Role so atualiza no JWT no proximo refresh** — Comportamento JWT inerente. Documentar como esperado. Force-logout do afetado e melhoria futura.

3. **Senha temporaria nao comunicada ao admin** — A Edge Function gera `tempPassword` server-side mas o response retorna apenas `{user: {id, email, full_name, role}}`. O admin que criou o usuario nao recebe a senha temporaria para repassar ao novo usuario. O fluxo assume que o novo usuario usara "esqueci minha senha" para definir sua senha, o que requer que o email de reset esteja configurado no Supabase. Se o reset por email nao estiver configurado, o novo usuario nao consegue fazer login.
   - Arquivo: `supabase/functions/create-user/index.ts:98-107`
   - Recomendacao: Retornar a senha temporaria no response (seguro porque so admin ve), ou implementar envio de email de boas-vindas com link de reset, ou documentar que o admin deve configurar o email de reset no Supabase.

## Veredicto
Code Review Fase 2 Sprint 2 aprovado. Zero blockers. O warning do fallback isAdmin e uma inconsistencia de UX contornavel (nao e vulnerabilidade de seguranca). A seguranca do fluxo de criacao de usuario esta solida: o caminho completo foi verificado e nao ha como um nao-admin criar usuarios. A Sprint 2 entrega auth funcional, roles corretas, rotas protegidas e gestao de usuarios com boa qualidade de codigo.
