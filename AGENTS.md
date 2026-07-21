# AGENTS.md — CRM Studio Belle

> Apenas o que e especifico deste projeto.
> Padroes globais em ~/.Codex/AGENTS.md — nao repetir aqui.

## Stack

- Vite + React 18 + TypeScript strict
- Tailwind CSS + shadcn/ui
- React Router DOM v6
- TanStack Query para server state
- React Context apenas para auth e carrinho efêmero (AuthContext, CartContext)
- lucide-react para icones
- Google Fonts: Cormorant Garamond (display) + Jost (body)
- Supabase remoto com Auth, RLS, Edge Function `create-user`, migrations em `supabase/migrations/`
- Multi-estabelecimento: André é `super_admin`; cada estabelecimento isola produtos, clientes, vendas, itens e settings
- Mock remanescente apenas para promoções (`src/data/promos.ts`)

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
├── contexts/        # AuthContext, CartContext
├── hooks/           # useProducts, useClients, useSales, useStoreSettings, useEstablishments, useData, useSettings
├── data/            # Mock remanescente: promos
├── integrations/    # Supabase client e types gerados
├── lib/             # utils.ts, pricing.ts, constants.ts, mappers.ts, client-utils.ts
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

- Dados operacionais sempre via hooks/TanStack Query; não importar tabelas/mock diretamente nos componentes
- `products_display` é a fonte de leitura de produtos no frontend; custo é mascarado conforme role
- `establishment_id` é obrigatório para products, clients, sales, sale_items e store_settings
- Super admin pode usar o seletor de estabelecimento; admin local e funcionário ficam presos ao próprio estabelecimento
- Criação de usuários passa pela Edge Function `create-user`; service role nunca entra no frontend
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
