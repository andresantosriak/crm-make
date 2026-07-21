# Test Map — Fase 2 / Sprint 5 (Derivados, Cleanup + Regressao Final) — CRM Studio Belle

> Sprint de fechamento: persistencia real de settings, remocao dos contexts mock (DataContext/SettingsContext), hooks-fachada, alertas derivados, formatCurrency com milhar, busca accent-insensitive, seeds relativos. Inclui **regressao final** e **auditoria de cobertura de testes**.
> Analise do **codigo atual**: `hooks/useStoreSettings.ts`, `useSettings.ts`, `useData.ts`, `useAlerts.ts`, `useSearch.ts`, `lib/utils.ts`, `lib/client-utils.ts`, `contexts/CartContext.tsx`, `pages/ClientsPage.tsx`, `components/dashboard/StatsCards.tsx`, `components/settings/ToggleGroup.tsx`.
> Base: `docs/crm-belle-backlog-fase2.md` (Sprint 5).

**Gerado em:** 2026-07-20

## Como testar
- **`[AUTO:vitest]`** — unitario com Supabase/React Query mockados.
- **`[AUTO:integ-auth]`** — integracao com sessao real admin/employee.
- **`[VISUAL]` / `[MANUAL]`** — browser com dev server.

> **Setup QA:** admin + employee reais de `docs/credentials.md`. Seeds S5 sao **relativos** (4 vendas "hoje" / 2 "ontem" via now()) — o problema de data fixa do F2S4 esta resolvido: os numeros de "hoje" batem em qualquer dia de execucao.

---

## 1. Persistencia de settings (store_settings)

Arquivos: `useStoreSettings`, `useSettings`, `MarkupControl`, `ToggleGroup`.

### Markup padrao
- [ ] **[AUTO:integ-auth]** `useStoreSettings` le a linha singleton (id=1) de `store_settings`; `defaultMarkup` inicial = 180
- [ ] **[AUTO:integ-auth]** Admin ajusta markup (+/-10) → `useUpdateSettings` faz UPDATE em store_settings id=1 → invalida `['store_settings']` → valor persiste
- [ ] **[MANUAL]** Ajustar markup para 200% → **reload da pagina** → continua 200% (persistido no banco, nao em memoria)
- [ ] **[AUTO:vitest]** `setMarkup` aplica clamp (0-500) e step de 10 antes de gravar: 184→180, 185→190, 600→500, -10→0
- [ ] **[MANUAL]** Markup alterado **propaga** para Novo Produto: com 200%, custo 20 → preco sugerido `round90(20*3)=59,90`; hint "markup padrão de 200%"

### Toggles de notificacao
- [ ] **[AUTO:integ-auth]** Toggles carregam de store_settings (promos/estoque/aniv true, resumo false por padrao)
- [ ] **[MANUAL]** Admin liga "Resumo diário" → reload → continua ligado (persistido)
- [ ] **[AUTO:vitest]** `toggleSetting` mapeia key→coluna (promos→toggle_promos, estoque→toggle_estoque, aniv→toggle_aniversario, resumo→toggle_resumo) e grava o valor invertido

---

## 2. Alertas derivados (useAlerts)

Arquivo: `useAlerts` (thresholds de store_settings).

- [ ] **[AUTO:integ-auth]** Alertas gerados dinamicamente: **2 de Estoque** (Máscara Volume Extremo 3 un., Blush Pêssego 2 un. — stock <= low_stock_threshold) + **1 de Aniversário** (Mariana, hoje) + **1 Sophia** = **4 alertas**
- [ ] **[AUTO:vitest]** Estoque: texto usa "unidade" (stock 1) vs "unidades" (>1); dot #D07C67
- [ ] **[AUTO:vitest]** Aniversário: `when` = "Hoje" (days 0), "Amanhã" (days 1), "Em N dias" (2-7); dot #8FA98A
- [ ] **[AUTO:vitest]** Cliente sem birthday nao gera alerta de aniversário
- [ ] **[AUTO:integ-auth]** Thresholds vem de store_settings (low_stock_threshold, birthday_alert_days) — nao hardcoded
- [ ] **[MANUAL]** Card Sophia (dot #C8A24C) e **texto fixo** (Paleta Nude Sunset 21 dias) — nao derivado. Ver Nota 4

---

## 3. Tags de cliente com thresholds do banco

Arquivos: `ClientsPage`, `client-utils.getClientTags/daysUntilBirthday`.

- [ ] **[AUTO:integ-auth]** **Patrícia Souza e VIP** (totalSpent = R$ 512,00 via 2 vendas historicas >= vip_threshold 500) → tag VIP verde. Resolve o achado do F2S4 (agora ha 1 VIP no seed)
- [ ] **[AUTO:integ-auth]** **Mariana Alves recebe ANIVERSÁRIO** (birthday = hoje → `daysUntilBirthday` = 0 <= birthday_alert_days 7) → tag dourada
- [ ] **[AUTO:vitest]** `daysUntilBirthday` normaliza para meia-noite (setHours 0) → aniversario no dia exato retorna **0** (nao 364); se ja passou este ano, usa proximo ano
- [ ] **[AUTO:vitest]** `getClientTags` recebe vipThreshold e birthdayAlertDays por parametro (de store_settings), nao mais constantes hardcoded — resolve Nota 3 do F2S4
- [ ] **[AUTO:vitest]** Empate VIP+ANIVERSÁRIO → ambas as tags (VIP primeiro)
- [ ] **[VISUAL]** ClientsPage passa `settings.vipThreshold`/`birthdayAlertDays` (fallback 500/7 se settings ainda carregando)

---

## 4. formatCurrency com separador de milhar + busca accent-insensitive

Arquivos: `lib/utils.ts`.

- [ ] **[AUTO:vitest]** `formatCurrency(6240)` = "R$ 6.240,00" (Intl pt-BR: ponto de milhar, virgula decimal). Atencao: Intl usa espaco **NBSP** (U+00A0) entre "R$" e o valor — testes de string exata devem normalizar o espaco. Ver Nota 1
- [ ] **[AUTO:vitest]** `formatCurrency(420.6)` = "R$ 420,60"; `formatCurrency(0)` = "R$ 0,00"; `formatCurrency(1234567.89)` = "R$ 1.234.567,89"
- [ ] **[VISUAL]** Valores grandes no app (Dashboard/Historico) exibem milhar com ponto
- [ ] **[AUTO:vitest]** `normalizeForSearch('Máscara')` = 'mascara' (NFD + remove diacriticos + lowercase)
- [ ] **[AUTO:vitest]** `useSearch`: query "mascara" (sem acento) encontra "Máscara Volume Extremo"; "labios" encontra produtos "Lábios"; case-insensitive
- [ ] **[AUTO:vitest]** `shortPayment('Cartão de crédito')` = 'Crédito' (com acento); 'Cartão de débito' → 'Débito'

---

## 5. Dashboard "Este mês" real

Arquivo: `StatsCards`.

- [ ] **[AUTO:integ-auth]** "Este mês" = soma de vendas do mes/ano corrente do banco (nao mais hardcoded R$ 6.240)
- [ ] **[VISUAL]** "Meta do mês 68%" + barra **ainda hardcoded** (nao derivado) — Ver Nota 5
- [ ] **[AUTO:vitest]** monthTotal filtra por getMonth()+getFullYear() corrente; formatCurrency aplicado

---

## 6. REGRESSAO — Remocao de DataContext/SettingsContext

> Os dois contexts foram **removidos**; `main.tsx` provê apenas AuthProvider + CartProvider. Cada tela que os consumia agora usa hooks-fachada (`useData`, `useSettings`). Validar que nada quebrou.

- [ ] **[AUTO:vitest]** Nenhum import de `@/contexts/DataContext` ou `@/contexts/SettingsContext` no codigo (grep = 0) — confirmado
- [ ] **[AUTO:vitest]** `CartContext` agora usa `useProducts()` direto (nao mais `useContext(DataContext)`) → cartItems resolvem produtos do banco
- [ ] **[AUTO:integ-auth]** **Dashboard** (via useData): vendas hoje R$/count, lowStock, nome dinamico — renderiza sem erro
- [ ] **[AUTO:integ-auth]** **Estoque** (useProducts): 10 produtos, margem/custo por role, delete admin
- [ ] **[AUTO:integ-auth]** **Clientes** (useClients + useStoreSettings): 5 clientes, tags, delete admin
- [ ] **[AUTO:integ-auth]** **Histórico** (useSales + useClients): vendas nao-estornadas, hoje/mês, estorno admin
- [ ] **[AUTO:integ-auth]** **Nova Venda** (useProducts + useCart + useCreateSale): catalogo, carrinho, checkout, venda real
- [ ] **[AUTO:integ-auth]** **Configurações** (useSettings): markup, toggles persistindo; seções admin condicionais
- [ ] **[AUTO:integ-auth]** **Avisos** (useAlerts): 4 alertas derivados
- [ ] **[AUTO:integ-auth]** **Novo Produto** (useSettings + useCreateProduct): markup propaga, cria produto
- [ ] **[MANUAL]** Smoke test navegando todas as 11 rotas apos login → nenhuma tela em branco/erro de context undefined
- [ ] **[AUTO:vitest]** `npm run build` compila sem erro (contexts removidos sem referencias orfas)
- [ ] **[VISUAL]** Único mock restante e `data/promos.ts` (Promoções ainda estatica); demais telas 100% Supabase

---

## 7. Permissoes (employee nao altera settings)

- [ ] **[AUTO:integ-auth]** Employee: seções Precificação/Equipe/Loja ocultas em Settings (isAdmin gate)
- [ ] **[AUTO:integ-auth]** **Employee VE os toggles de Notificações** (ToggleGroup nao e admin-gated), mas ao clicar → `useUpdateSettings` faz UPDATE em store_settings → **RLS nega** (policy store_settings_update = is_admin()) → onError toast "Erro ao salvar configurações", sem persistir. Ver Nota 2
- [ ] **[AUTO:integ-auth]** Employee que burlar e chamar `update store_settings` direto → RLS nega
- [ ] **[AUTO:integ-auth]** Admin altera qualquer setting → sucesso (JWT app_metadata.role admin)

---

## 8. AUDITORIA DE COBERTURA — testes 151 → 123

> A remocao de `DataContext.test.tsx` e `SettingsContext.test.tsx` derrubou ~28 testes. O comportamento derivado migrou dos contexts (testados) para hooks-fachada. Verificar se ha teste equivalente.

### O que existe hoje (18 arquivos de teste)
utils, client-utils, pricing, constants, mock-data, useSales, useSearch, useProducts, useClients, useMarkupCalculator, ClientsPage-tags, LoginPage, AdminRoute, ProtectedRoute, AuthContext, CartContext, supabase/types, supabase/client.

### Lacunas identificadas (comportamento vivo SEM teste dedicado)

| Comportamento | Antes (com teste) | Agora (hook) | Tem teste equivalente? |
|---------------|-------------------|--------------|------------------------|
| todaySales / todayTotal / todayCount | DataContext.test | `useData` | ❌ **NAO** — sem `useData.test` |
| lowStockProducts (filter active && stock<=threshold) | DataContext.test | `useData` / `useAlerts` | ⚠️ parcial — coberto so indiretamente |
| setMarkup clamp (0-500) + step 10 | SettingsContext.test | `useSettings` | ❌ **NAO** — sem `useSettings.test` |
| toggles default + toggleSetting (key→coluna) | SettingsContext.test | `useSettings` | ❌ **NAO** |
| store_settings query/update | — (novo) | `useStoreSettings` | ❌ **NAO** — sem `useStoreSettings.test` |
| alertas derivados (estoque+aniv+Sophia) | — (novo) | `useAlerts` | ❌ **NAO** — sem `useAlerts.test` |
| daysUntilBirthday (normalizacao meia-noite, dia exato=0) | — | `client-utils` | ✅ SIM (client-utils.test + ClientsPage-tags) |
| getClientTags com thresholds parametrizados | ClientsPage-tags | `client-utils` | ✅ SIM |
| formatCurrency Intl milhar | utils.test | `utils` | ✅ SIM (validar se assertion cobre milhar+NBSP) |
| normalizeForSearch / useSearch accent-insensitive | useSearch.test | `useSearch`/`utils` | ✅ SIM (validar caso com acento) |

- [ ] **[AUTO:vitest]** **Criar `useData.test`**: mockar useProducts/useClients/useSales → validar todaySales (filtro data), todayTotal (soma), todayCount, lowStockProducts (2 itens)
- [ ] **[AUTO:vitest]** **Criar `useSettings.test`**: mockar useStoreSettings/useUpdateSettings → validar setMarkup clamp/step e toggleSetting mapeando key→coluna
- [ ] **[AUTO:vitest]** **Criar `useStoreSettings.test`**: query single + update id=1 + invalidate
- [ ] **[AUTO:vitest]** **Criar `useAlerts.test`**: mock produtos low-stock + cliente aniversariante → 2 estoque + 1 aniv + 1 Sophia; pluralizacao unidade/unidades e when Hoje/Amanhã/Em N dias
- [ ] **[AUTO:vitest]** Confirmar que `utils.test` cobre `formatCurrency` com milhar (6240→"6.240,00") normalizando NBSP, e `useSearch.test` cobre query sem acento achando termo acentuado
- [ ] **[MANUAL]** Rodar suite completa → confirmar 123 verdes e que as lacunas acima sao o delta real (nao regressao de comportamento, so de cobertura)

---

## Resumo de cobertura

| Secao | vitest | integ-auth | VISUAL/MANUAL |
|-------|--------|-----------|---------------|
| Persistencia settings | 2 | 3 | 3 |
| Alertas derivados | 3 | 2 | 1 |
| Tags com thresholds banco | 4 | 2 | 1 |
| formatCurrency/busca | 5 | 0 | 1 |
| Dashboard mês | 1 | 1 | 1 |
| Regressao contexts | 3 | 8 | 2 |
| Permissoes settings | 0 | 4 | 0 |
| Auditoria cobertura | 5 | 0 | 1 |

**Prioridade QA:** (1) fechar as 4 lacunas de cobertura criticas (useData, useSettings, useStoreSettings, useAlerts) — sao o delta 151→123; (2) regressao integ-auth das 8 telas via fachadas; (3) persistencia de markup/toggles em reload; (4) permissao employee em settings (RLS nega toggle).

## Notas para Code Reviewer / PO
1. **formatCurrency usa NBSP (U+00A0):** `Intl.NumberFormat('pt-BR', BRL)` insere espaco nao-quebravel entre "R$" e o valor. Testes com igualdade estrita de string (ex.: `'R$ 6.240,00'` com espaco comum) vao **falhar**. Padronizar assertions com `.replace(/ /g,' ')` ou usar regex. Vale conferir se os testes de `utils.test` ja tratam isso.
2. **Employee ve toggles de Notificações mas nao consegue salvar:** o ToggleGroup nao e admin-gated, mas o UPDATE em store_settings e admin-only (RLS). Employee clica → toast de erro, sem persistir → UX confusa (parece que funciona mas nao salva). Decidir: ocultar toggles para employee, OU criar tabela user_settings por usuario, OU desabilitar o toggle com tooltip "somente admin".
3. **setMarkup/toggleSetting sem feedback otimista:** a UI so reflete o novo valor apos o refetch do invalidate — pode haver micro-lag visual entre clicar e ver a mudanca. Considerar optimistic update no React Query.
4. **Card Sophia e texto fixo em useAlerts:** o alerta "Paleta Nude Sunset parada ha 21 dias" e hardcoded, nao derivado de dados reais (nao ha logica de "produto parado"). Coerente com o escopo (Sophia mock), mas registrar que nao reage ao estado real do estoque.
5. **"Meta do mês 68%" ainda hardcoded** em StatsCards — "Este mês" ja e real, mas a meta e a barra de progresso sao fixas. Registrar como pendencia se a meta deveria ser configuravel (poderia vir de store_settings).
6. **Delta de cobertura 151→123 e de COBERTURA, nao de comportamento:** o codigo derivado continua vivo e funcional via fachadas, mas perdeu os testes que vinham junto dos contexts removidos. As 4 lacunas (useData/useSettings/useStoreSettings/useAlerts) devem ser preenchidas para a suite voltar a proteger a logica de derivados/settings antes do fechamento da fase.
