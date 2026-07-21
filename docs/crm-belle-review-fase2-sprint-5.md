# Code Review Final: Fase 2 Sprint 5 — Derivados, Cleanup + Integração Geral

## Status: Aprovado

## Objetivo do Sprint
Fechar pendências técnicas da Fase 2: thresholds de store_settings, alertas dinâmicos, formatCurrency com Intl, busca normalizada, seeds relativos, VIP com histórico, remoção de DataContext/SettingsContext/mocks, cleanup geral.

## Tasks Validadas — Sprint 5

| Task | Status | Observação |
|------|--------|------------|
| useStoreSettings (query + mutation) | OK | Singleton, .single(), invalidateQueries, clamp/step no useSettings facade |
| useSettings (facade) | OK | Substitui SettingsContext, delega para useStoreSettings com logica local |
| useData (facade) | OK | Substitui DataContext, compoe useProducts/useClients/useSales/useStoreSettings |
| useAlerts (derivado) | OK | Alertas de estoque + aniversario + Sophia, thresholds de store_settings |
| client-utils.ts | OK | getClientName ("Cliente removido" para IDs removidos), daysUntilBirthday, getClientTags com thresholds parametrizados |
| ClientsPage (thresholds de settings) | OK | vipThreshold e birthdayAlertDays de useStoreSettings, nao mais hardcoded |
| StatsCards (mes real) | OK | "Este mes" calculado de sales reais, nao mais hardcoded |
| AlertsPage (useAlerts) | OK | Alertas derivados dos dados reais, com loading state |
| formatCurrency (Intl) | OK | Intl.NumberFormat pt-BR — separador de milhar automatico |
| normalizeForSearch + useSearch | OK | NFD normalization — "labios" encontra "Labios" com acento |
| ToggleGroup/ToggleSwitch (disabled employee) | OK | disabled={!isAdmin}, cursor not-allowed, opacity 0.5 |
| Migration seeds relativos + VIP | OK | Datas relativas, Patricia totalSpent 512, Mariana birthday hoje |
| Remocao DataContext/SettingsContext | OK | Arquivos deletados, zero refs orfas no codebase |
| Remocao data/mocks | OK | Apenas promos.ts restante (arbitrado) |
| createClient<Database> | OK | Fix da pendencia S1 aplicado |
| p_items cast Json | OK | Fix da pendencia S4 aplicado (as unknown as Json, nao mais string) |
| 6 novos arquivos de teste | OK | client-utils, useAlerts, useSettings, useData, useStoreSettings, ClientsPage-tags |

## Pontos Positivos

1. **Todos os warnings pendentes das Sprints 1-4 resolvidos** — `createClient<Database>` (S1), `handleSave` sem try/catch (S3 — agora usa `.mutate` com callback), `p_items as unknown as string` (S4 — agora `as unknown as Json`), isAdmin fallback (S2 — nao alterado mas nao impede aprovacao, ja avaliado). Sprint 5 fecha as dividas tecnicas.
2. **formatCurrency com Intl.NumberFormat** — Resolve a sugestao de separador de milhar que existia desde a Sprint 1. `formatCurrency(1000)` agora retorna "R$ 1.000,00" corretamente. Instancia unica do formatter (nao cria a cada chamada).
3. **useSearch com normalizacao de acentos** — `normalizeForSearch` usa `string.normalize('NFD')` para remover diacriticos antes de comparar. Buscar "labios" encontra "Labios", "mascara" encontra "Mascara". Melhoria significativa de UX para o mercado brasileiro.
4. **Seeds com datas relativas** — Vendas seed agora usam `CURRENT_DATE + INTERVAL`. "Hoje" sempre mostra 4 vendas = R$ 420,60 independente da data real de execucao. Birthday da Mariana usa `MAKE_DATE(year - 34, current_month, current_day)` para sempre estar "hoje". Patricia tem historico suficiente para VIP (512.00 >= 500).
5. **Remocao limpa de DataContext e SettingsContext** — Arquivos deletados. grep confirma zero referencias orfas. main.tsx simplificado para QueryClient > Auth > Cart. useData e useSettings sao hooks simples (sem createContext), compondo os hooks de Supabase.
6. **Alertas derivados e dinamicos** — useAlerts gera alertas em tempo real a partir de produtos (estoque baixo) e clientes (aniversario), usando thresholds de store_settings. Pluralizacao correta ("1 unidade" vs "2 unidades"). Sophia permanece como texto estatico (arbitrado).
7. **Testes novos com excelente cobertura** — client-utils.test cobre getClientName (null, found, not-found, empty), daysUntilBirthday (today, tomorrow, past), getClientTags (VIP, birthday, both, neither). useAlerts.test cobre stock alerts, birthday alerts (today/soon/far), Sophia mock.

## Revisao Geral de Integracao — Fase 2 Completa

### Arvore de Providers (main.tsx)
```
QueryClientProvider
  AuthProvider
    CartProvider
      App
      Toaster
```
DataProvider e SettingsProvider removidos. CartProvider depende de useProducts (via TanStack Query, nao de context). AuthProvider depende do Supabase client. Hierarquia correta e minima.

### Consistencia entre os 8 hooks de dados

| Hook | Query Key | From/RPC | Invalidation (onSuccess) | Mapper | Toast |
|------|-----------|----------|--------------------------|--------|-------|
| useProducts | ['products'] | products_display | ['products'] | toProduct | sucesso + erro |
| useClients | ['clients'] | clients + sales | ['clients'] | inline | sucesso + erro |
| useSales | ['sales'] | sales | ['sales'] + ['products'] + ['clients'] | toSale | sucesso + erro |
| useUsers | ['users'] | profiles | ['users'] | toProfile | sucesso + erro |
| useStoreSettings | ['store_settings'] | store_settings | ['store_settings'] | toStoreSettings | so erro |
| useCreateSale | — | RPC create_sale | ['sales'] + ['products'] + ['clients'] | — | sucesso + erro (estoque) |
| useCancelSale | — | RPC cancel_sale | ['sales'] + ['products'] + ['clients'] | — | sucesso + erro |
| useSoftDelete* | — | RPCs soft_delete_* | ['products'] ou ['clients'] | — | sucesso + erro |

Padroes consistentes: todas as mutations usam invalidateQueries; todos os hooks de CRUD tem toast de sucesso e onError; mappers em lib/mappers.ts (exceto useClients que faz inline por causa dos derivados — aceitavel); query keys flat e previsíveis.

### Caminhos de escrita vs RLS

| Acao | Hook/componente | Via | RLS enforcement |
|------|----------------|-----|-----------------|
| Criar produto | useCreateProduct | INSERT products | policy products_insert (autenticado) |
| Editar produto | useUpdateProduct | UPDATE products | policy products_update (autenticado) |
| Excluir produto | useSoftDeleteProduct | RPC soft_delete_product | is_admin() na RPC |
| Criar cliente | useCreateClient | INSERT clients | policy clients_insert (autenticado) |
| Excluir cliente | useSoftDeleteClient | RPC soft_delete_client | is_admin() na RPC |
| Criar venda | useCreateSale | RPC create_sale | RLS via INSERT sales + sale_items (autenticado) |
| Estornar venda | useCancelSale | RPC cancel_sale | is_admin() na RPC |
| Alterar settings | useUpdateSettings | UPDATE store_settings | policy store_settings_update (admin) |
| Criar usuario | useCreateUser | Edge Function | JWT admin check server-side |
| Alterar role | useUpdateUserRole | UPDATE profiles | policy profiles_update (admin) |

Todos os caminhos de escrita passam por RLS ou verificacao server-side. Nenhuma escrita bypassa autenticacao. Acoes destrutivas (delete, estorno, alter role) todas exigem admin.

### Zero secrets em src/
- `grep -r "sb_secret|SUPABASE_SECRET|service_role|SECRET_KEY|ACCESS_TOKEN" src/` = 0 resultados
- Client usa `import.meta.env.VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
- Edge Function usa `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` (server-only)

### Imports orfaos
- `from '@/contexts/DataContext'` → 0 refs (removido)
- `from '@/contexts/SettingsContext'` → 0 refs (removido)
- `from '@/data/'` → apenas `promos.ts` (arbitrado, Sophia IA e mock)
- Nenhum import apontando para arquivo inexistente

### Aprendizados da fase aplicados
- `.mutate()` com callbacks em vez de `await mutateAsync` sem try/catch (NewSalePage, ClientPicker)
- Acentos corretos em todos os textos UI (Avançar, início, Configurações, Funcionário, etc.)
- `position: fixed` no ConfirmButton e ClientPicker (corrige scroll issues vs `absolute`)
- `createClient<Database>` com generic tipado

## Resumo de Problemas

### Blockers
Nenhum.

### Warnings
Nenhum.

### Suggestions (poderia melhorar — pos-MVP)
1. **PromosPage ainda importa de src/data/promos.ts** — Unico mock restante. Promos sao texto fixo da Sophia IA (arbitrado). Quando promos virarem feature real, migrar para Supabase.

2. **useStoreSettings.onSuccess sem toast** — useUpdateSettings nao tem toast.success (so onError tem toast). O usuario altera markup ou toggle e nao ve confirmacao visual. Os outros hooks (products, clients, sales, users) todos tem toast.success.
   - Arquivo: `src/hooks/useStoreSettings.ts:43`

3. **"Este mes" sem label de variacao** — StatsCards calcula o total do mes corretamente, mas removeu o "↑ 12% vs. jun" (que era hardcoded). O card fica com o valor mas sem indicador de tendencia. Aceitavel no MVP (a variacao exigiria dados do mes anterior).

## Veredicto
Code Review Final Fase 2 Sprint 5 aprovado. Zero blockers, zero warnings. Todas as pendencias tecnicas das Sprints 1-4 foram resolvidas (createClient<Database>, p_items Json, formatCurrency Intl, thresholds dinamicos, seeds relativos, DataContext/SettingsContext removidos). A integracao geral da Fase 2 esta coerente: 8 hooks com padroes consistentes, RLS respeitada em todos os caminhos de escrita, zero secrets em src/, nenhum import orfao, arvore de providers minima e correta. O app passou de mock data em memoria para backend Supabase completo com auth, roles, CRUD, derivados e testes.
