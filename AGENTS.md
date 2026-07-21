# AGENTS.md — CRM Studio Belle

> Apenas o que e especifico deste projeto.
> Padroes globais em ~/.Codex/AGENTS.md — nao repetir aqui.

## Stack

- Vite + React 18 + TypeScript strict
- Tailwind CSS + shadcn/ui
- React Router DOM v6
- React Context (CartContext, DataContext, SettingsContext) — sem Zustand, sem Redux
- lucide-react para icones
- Google Fonts: Cormorant Garamond (display) + Jost (body)
- **Sem backend** — mock data em `src/data/` (arrays TS tipados)
- **Sem Supabase** — nenhuma chamada de rede

## Comandos

```bash
npm run dev      # Dev server (Vite)
npm run build    # Build producao
npm run lint     # ESLint
npm run preview  # Preview do build
```

## Estrutura de Pastas

```
src/
├── pages/           # Uma pagina por rota (React Router v6)
├── components/
│   ├── ui/          # shadcn/ui (atoms)
│   ├── layout/      # BottomNav, PageHeader, AppShell
│   ├── product/     # ProductTile, CategoryChips, ProductListItem, ProductGridItem
│   ├── client/      # ClientAvatar, ClientCard, ClientPicker
│   ├── sale/        # CartBar, ConfirmButton, SaleSuccessOverlay, CheckoutItemList, PaymentGrid
│   ├── dashboard/   # SalesTodayCard, StatsCards, QuickActions, SophiaSuggestions, LowStockSection
│   ├── promo/       # PromoCard, SophiaIntroCard
│   ├── settings/    # ProfileCard, ToggleGroup, MarkupControl, ShopInfo
│   └── shared/      # SearchInput, GoldButton, BackButton, StockBadge, ToggleSwitch, SectionLabel, ViewToggle
├── contexts/        # CartContext, DataContext, SettingsContext
├── hooks/           # useCart, useData, useSettings, useSearch, useMarkupCalculator
├── data/            # Mock data (products, clients, sales, alerts, promos)
├── lib/             # utils.ts, pricing.ts, constants.ts
├── types/           # Product, Client, Sale, Alert, Promo, CartItem, PaymentMethod
└── styles/          # animations.css (fadeup, glow, pop)
```

## Design System — Tokens

### Cores (Tailwind config)

| Token | Valor | Uso |
|-------|-------|-----|
| `app-bg` | #16120E | Fundo principal |
| `card` | #221C15 | Cards, inputs |
| `card-hover` | #2A2219 | Hover de cards |
| `gold` | #C8A24C | Acento principal |
| `gold-light` | #d9b869 | Textos dourados claros |
| `gold-dark` | #b78d3d | Gradientes |
| `text-primary` | #F1EBDF | Texto principal |
| `text-secondary` | #A79B88 | Texto secundario |
| `text-muted` | #7c7264 | Texto desabilitado |
| `success` | #8FA98A | Positivo (margem, VIP, estoque ok) |
| `danger` | #D07C67 | Alerta (estoque baixo, sair) |

### Tipografia

- **Titulos de tela e valores grandes**: `font-display` (Cormorant Garamond)
- **Body, labels, botoes**: `font-body` (Jost)

### Tiles de produto por categoria

| Categoria | Gradiente |
|-----------|-----------|
| Labios | #d98a8a -> #b25f6a |
| Olhos | #b9a0d0 -> #8a72a8 |
| Rosto | #e0c39a -> #c79a63 |
| Fallback | #c8a24c -> #b78d3d |

### Animacoes

- `animate-fadeup` — entrada de telas (0.35s)
- `animate-glow` — dot pulsante da Sophia IA (2.4s infinite)
- `animate-pop` — badge de quantidade, cart bar, check (0.25s)

## Regras Tecnicas do Projeto

- Mock data sempre acessado via hooks (useData, useCart, useSettings) — nunca importar `src/data/` diretamente nos componentes
- Logica de pricing (floor90, ceil90, round90) centralizada em `lib/pricing.ts`
- Valores monetarios formatados com `formatCurrency()` de `lib/utils.ts`
- Gradientes dourados aplicados via inline style (Tailwind nao suporta gradientes arbitrarios em utility classes)
- BottomNav controlado pela rota via AppShell — oculto em `/login` e `/produto`
- NewSalePage gerencia steps (produtos/checkout) via estado local — sem sub-rotas
- `prefers-reduced-motion`: desativar animacoes quando ativo
- Estoque baixo = `stock <= 5`
- Markup padrao = 180% (configuravel em Settings, range 0-500%, step 10)

## Documentacao do Projeto

- `docs/crm-belle-prd.md` — produto, personas, MVP, telas, mock data
- `docs/crm-belle-architecture.md` — estrutura, decisoes tecnicas
- `docs/adr/` — ADRs (001-005)
