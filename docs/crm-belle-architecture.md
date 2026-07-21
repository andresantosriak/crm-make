# Arquitetura: CRM Studio Belle

## Stack

- **Framework:** Vite + React 18 + TypeScript (strict)
- **Estilizacao:** Tailwind CSS + shadcn/ui (Radix primitives + CVA variants)
- **Routing:** React Router DOM v6
- **State:** React Context (cart, data, settings)
- **Backend:** Nenhum — mock data em arquivos TS
- **Icons:** lucide-react
- **Fontes:** Google Fonts — Cormorant Garamond + Jost

---

## Estrutura de Pastas

```
src/
├── pages/                        # Rotas (React Router v6)
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── NewSalePage.tsx           # Step 1 (produtos) e Step 2 (checkout) internos
│   ├── HistoryPage.tsx
│   ├── StockPage.tsx
│   ├── NewProductPage.tsx
│   ├── ClientsPage.tsx
│   ├── AlertsPage.tsx
│   ├── PromosPage.tsx
│   └── SettingsPage.tsx
├── components/
│   ├── ui/                       # shadcn/ui (atoms) — Button, Input, Badge, etc.
│   ├── layout/                   # Componentes de layout
│   │   ├── BottomNav.tsx         # Barra de navegacao inferior (5 tabs)
│   │   ├── PageHeader.tsx        # Header com titulo e acoes
│   │   └── AppShell.tsx          # Wrapper que renderiza BottomNav condicionalmente
│   ├── product/                  # Componentes de produto
│   │   ├── ProductTile.tsx       # Tile colorido com inicial (46x46 ou full-width)
│   │   ├── ProductListItem.tsx   # Linha de produto (modo lista)
│   │   ├── ProductGridItem.tsx   # Card de produto (modo grade)
│   │   └── CategoryChips.tsx     # Chips horizontais scrollaveis
│   ├── client/                   # Componentes de cliente
│   │   ├── ClientAvatar.tsx      # Circulo com iniciais e borda dourada
│   │   ├── ClientCard.tsx        # Card de cliente na lista
│   │   └── ClientPicker.tsx      # Bottom sheet de selecao/cadastro
│   ├── sale/                     # Componentes de venda
│   │   ├── CartBar.tsx           # Floating bar do carrinho
│   │   ├── ConfirmButton.tsx     # Botao de confirmar venda (3 estados)
│   │   ├── SaleSuccessOverlay.tsx # Overlay fullscreen "Venda registrada"
│   │   ├── CheckoutItemList.tsx  # Lista de itens no checkout
│   │   └── PaymentGrid.tsx       # Grid 2x2 de formas de pagamento
│   ├── dashboard/                # Componentes do dashboard
│   │   ├── SalesTodayCard.tsx    # Card "Vendas de hoje" com gradiente
│   │   ├── StatsCards.tsx        # Cards "Este mes" e "Meta do mes"
│   │   ├── QuickActions.tsx      # Grid 2x2 de acoes rapidas
│   │   ├── SophiaSuggestions.tsx # Secao "Sophia sugere" com dot pulsante
│   │   └── LowStockSection.tsx   # Secao "Estoque baixo"
│   ├── promo/                    # Componentes de promocoes
│   │   ├── PromoCard.tsx         # Card de promocao individual
│   │   └── SophiaIntroCard.tsx   # Card introdutorio da Sophia
│   ├── settings/                 # Componentes de configuracoes
│   │   ├── ProfileCard.tsx       # Card de perfil do salao
│   │   ├── ToggleGroup.tsx       # Grupo de toggles de notificacao
│   │   ├── MarkupControl.tsx     # Controle -/+ de markup padrao
│   │   └── ShopInfo.tsx          # Info da loja (pagamento, categorias, backup)
│   └── shared/                   # Componentes reutilizaveis cross-feature
│       ├── SearchInput.tsx       # Input com icone de lupa
│       ├── GoldButton.tsx        # Botao com gradiente dourado
│       ├── BackButton.tsx        # Botao redondo com chevron esquerda
│       ├── StockBadge.tsx        # Pill com cor dinamica (verde/vermelho)
│       ├── ToggleSwitch.tsx      # Switch ON/OFF com gradiente dourado
│       ├── SectionLabel.tsx      # Label uppercase (ITENS, CLIENTE, etc.)
│       └── ViewToggle.tsx        # Segmented control lista/grade
├── contexts/
│   ├── CartContext.tsx           # Carrinho: itens, cliente, pagamento, step
│   ├── DataContext.tsx           # Dados mutaveis: products, clients, sales
│   └── SettingsContext.tsx       # Toggles de notificacao, defaultMarkup
├── hooks/
│   ├── useCart.ts                # Atalho para CartContext
│   ├── useData.ts               # Atalho para DataContext
│   ├── useSettings.ts           # Atalho para SettingsContext
│   ├── useSearch.ts             # Filtro de busca por nome (generico)
│   └── useMarkupCalculator.ts   # Calculo live de markup, margem, lucro, round90
├── data/
│   ├── products.ts              # Array inicial de 10 produtos
│   ├── clients.ts               # Array inicial de 5 clientes
│   ├── sales.ts                 # Array inicial de 6 vendas
│   ├── alerts.ts                # Array de 4 avisos
│   └── promos.ts                # Array de 3 promocoes
├── lib/
│   ├── utils.ts                 # cn(), formatCurrency, getInitials, shortPayment
│   ├── pricing.ts               # floor90, ceil90, round90, calcMarkup, calcMargin
│   └── constants.ts             # Tokens de cor por categoria, thresholds, defaults
├── types/
│   └── index.ts                 # Product, Client, Sale, Alert, Promo, CartItem, PaymentMethod
└── styles/
    └── animations.css           # @keyframes fadeup, glow, pop
```

---

## Padrao de Rotas

| URL | Pagina | Bottom Nav | Tab ativo |
|-----|--------|-----------|-----------|
| `/login` | LoginPage | Oculto | — |
| `/` | DashboardPage | Visivel | Inicio |
| `/vendas` | NewSalePage | Visivel | Vendas |
| `/historico` | HistoryPage | Visivel | Vendas |
| `/estoque` | StockPage | Visivel | Estoque |
| `/produto` | NewProductPage | Oculto | — |
| `/clientes` | ClientsPage | Visivel | Clientes |
| `/avisos` | AlertsPage | Visivel | — |
| `/promos` | PromosPage | Visivel | — |
| `/config` | SettingsPage | Visivel | Ajustes |

### Routing Setup

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<AppShell />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/vendas" element={<NewSalePage />} />
      <Route path="/historico" element={<HistoryPage />} />
      <Route path="/estoque" element={<StockPage />} />
      <Route path="/produto" element={<NewProductPage />} />
      <Route path="/clientes" element={<ClientsPage />} />
      <Route path="/avisos" element={<AlertsPage />} />
      <Route path="/promos" element={<PromosPage />} />
      <Route path="/config" element={<SettingsPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

O `AppShell` usa `<Outlet />` e renderiza o `BottomNav` condicionalmente (oculto em `/login` e `/produto`). O `BottomNav` fica posicionado com `fixed` ou `absolute` no bottom, e o conteudo tem `padding-bottom: 110px` para nao ficar coberto.

---

## State Management

### Principio

React Context para estado compartilhado. `useState` local para estado de UI (busca, filtro, view mode). Sem Redux, sem Zustand — o app e simples o suficiente para Context.

### CartContext

Gerencia o fluxo de venda (step 1 e step 2):

```typescript
interface CartState {
  items: Record<number, number>;   // productId -> quantity
  step: 'produtos' | 'checkout';
  client: Client | null;
  payment: PaymentMethod | null;
}

interface CartActions {
  addItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  setStep: (step: 'produtos' | 'checkout') => void;
  setClient: (client: Client | null) => void;
  setPayment: (payment: PaymentMethod | null) => void;
  confirmSale: () => void;   // cria Sale, limpa cart, navega para overlay
  cartTotal: number;         // computed
  cartCount: number;         // computed
  cartItems: CartItem[];     // computed (product + qty)
}
```

### DataContext

Dados mutaveis da sessao — arrays que crescem quando o usuario cadastra:

```typescript
interface DataState {
  products: Product[];
  clients: Client[];
  sales: Sale[];
}

interface DataActions {
  addProduct: (product: Omit<Product, 'id'>) => void;
  addClient: (client: Omit<Client, 'tag'>) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
}
```

Inicializado com os arrays de `src/data/`.

### SettingsContext

Configuracoes persistidas durante a sessao:

```typescript
interface SettingsState {
  defaultMarkup: number;
  toggles: {
    promos: boolean;
    estoque: boolean;
    aniv: boolean;
    resumo: boolean;
  };
}

interface SettingsActions {
  setMarkup: (value: number) => void;
  toggleSetting: (key: keyof SettingsState['toggles']) => void;
}
```

### Hierarquia de Providers

```tsx
<SettingsProvider>
  <DataProvider>
    <CartProvider>
      <BrowserRouter>
        <Routes>...</Routes>
      </BrowserRouter>
    </CartProvider>
  </DataProvider>
</SettingsProvider>
```

### Estado local por pagina

| Pagina | Estado local |
|--------|-------------|
| NewSalePage | `viewMode` (lista/grade), `searchQuery`, `category`, `clientPickerOpen`, `newClientForm`, `showSaleSuccess` |
| StockPage | `searchQuery` |
| NewProductPage | `name`, `category`, `cost`, `price`, `stock`, `priceAuto` |
| SettingsPage | Nenhum — tudo vem do SettingsContext |

---

## Decomposicao de Componentes

### Reutilizaveis (shared)

Componentes usados em 2+ paginas, configurados via props:

| Componente | Props principais | Onde e usado |
|-----------|-----------------|-------------|
| `ProductTile` | `name`, `category`, `size` | NewSale, Stock, Checkout, Dashboard |
| `CategoryChips` | `categories`, `active`, `onSelect` | NewSale, NewProduct |
| `SearchInput` | `value`, `onChange`, `placeholder` | NewSale, Stock, ClientPicker |
| `ClientAvatar` | `name`, `size` | Checkout, History, Clients, ClientPicker |
| `GoldButton` | `children`, `onClick`, `disabled`, `fullWidth` | Todas as paginas |
| `BackButton` | `onClick` | History, NewProduct, Alerts, Promos |
| `StockBadge` | `stock`, `threshold` | Stock, Dashboard |
| `ToggleSwitch` | `checked`, `onChange` | Settings |
| `SectionLabel` | `children` | Checkout, Settings |
| `ViewToggle` | `mode`, `onToggle` | NewSale |
| `BottomNav` | inferido da rota atual | AppShell |

### Page-specific

Componentes usados em uma unica pagina. Vivem na pasta da feature correspondente:

| Pasta | Componentes |
|-------|------------|
| `dashboard/` | SalesTodayCard, StatsCards, QuickActions, SophiaSuggestions, LowStockSection |
| `sale/` | CartBar, ConfirmButton, SaleSuccessOverlay, CheckoutItemList, PaymentGrid |
| `client/` | ClientCard, ClientPicker |
| `promo/` | PromoCard, SophiaIntroCard |
| `settings/` | ProfileCard, ToggleGroup, MarkupControl, ShopInfo |

---

## Design System como Codigo

### Tailwind Config — Cores customizadas

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'app-bg': '#16120E',
        'device-bg': '#050403',
        'card': '#221C15',
        'card-hover': '#2A2219',
        'gold': {
          DEFAULT: '#C8A24C',
          light: '#d9b869',
          dark: '#b78d3d',
        },
        'text-primary': '#F1EBDF',
        'text-secondary': '#A79B88',
        'text-muted': '#7c7264',
        'success': '#8FA98A',
        'danger': '#D07C67',
        'border-subtle': 'rgba(233,220,198,0.08)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['Jost', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
        'card-lg': '18px',
        'input': '12px',
        'chip': '20px',
        'tile': '11px',
      },
      animation: {
        'fadeup': 'fadeup 0.35s ease',
        'glow': 'glow 2.4s ease infinite',
        'pop': 'pop 0.25s ease',
      },
      keyframes: {
        fadeup: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        glow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        pop: {
          from: { transform: 'scale(0.85)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
};
```

### Tokens em constantes TS

```typescript
// src/lib/constants.ts

export const CATEGORY_TILES: Record<string, { bg: string; text: string }> = {
  'Labios': { bg: 'linear-gradient(135deg, #d98a8a, #b25f6a)', text: '#16120E' },
  'Olhos':  { bg: 'linear-gradient(135deg, #b9a0d0, #8a72a8)', text: '#16120E' },
  'Rosto':  { bg: 'linear-gradient(135deg, #e0c39a, #c79a63)', text: '#16120E' },
};

export const CATEGORY_TILE_FALLBACK = {
  bg: 'linear-gradient(135deg, #c8a24c, #b78d3d)',
  text: '#16120E',
};

export const LOW_STOCK_THRESHOLD = 5;
export const DEFAULT_MARKUP = 180;
export const MARKUP_MIN = 0;
export const MARKUP_MAX = 500;
export const MARKUP_STEP = 10;

export const PAYMENT_METHODS = ['Pix', 'Cartao de credito', 'Cartao de debito', 'Dinheiro'] as const;

export const NAV_ROUTES = {
  home: '/',
  vendas: '/vendas',
  estoque: '/estoque',
  clientes: '/clientes',
  config: '/config',
} as const;

export const HIDDEN_NAV_ROUTES = ['/login', '/produto'];
```

### Fontes

Incluir no `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
```

---

## Mock Data — Tipos e Arquivos

### Tipos

```typescript
// src/types/index.ts

export interface Product {
  id: number;
  name: string;
  category: 'Labios' | 'Rosto' | 'Olhos';
  price: number;
  cost: number;
  stock: number;
}

export interface Client {
  name: string;
  last: string;
  total: number;
  tag: ClientTag | null;
}

export interface ClientTag {
  label: string;
  bg: string;
  color: string;
}

export type PaymentMethod = 'Pix' | 'Cartao de credito' | 'Cartao de debito' | 'Dinheiro';

export interface Sale {
  id: number;
  client: string;
  payment: PaymentMethod;
  total: number;
  items: number;
  date: string;
  time: string;
}

export interface Alert {
  kind: string;
  dot: string;
  text: string;
  when: string;
}

export interface Promo {
  title: string;
  subtitle: string;
  badge: { label: string; bg: string; color: string };
  price?: number;
  originalPrice?: number;
  savings?: number;
  actions: PromoAction[];
}

export type PromoAction = 'publish' | 'edit' | 'whatsapp';

export interface CartItem {
  product: Product;
  quantity: number;
}
```

### Arquivos de dados

Cada arquivo em `src/data/` exporta o array tipado correspondente com os dados exatos do PRD. Os arrays sao copiados para o estado dos contexts na inicializacao, permitindo mutacao sem afetar os dados originais.

---

## Custom Hooks

### useCart

Wrapper para `CartContext`. Retorna `items`, `addItem`, `removeItem`, `clearCart`, `cartTotal`, `cartCount`, `cartItems`, `step`, `setStep`, `client`, `setClient`, `payment`, `setPayment`, `confirmSale`.

### useData

Wrapper para `DataContext`. Retorna `products`, `clients`, `sales`, `addProduct`, `addClient`, `addSale`. Inclui getters derivados: `todaySales`, `todayTotal`, `todayCount`, `lowStockProducts`.

### useSettings

Wrapper para `SettingsContext`. Retorna `defaultMarkup`, `setMarkup`, `toggles`, `toggleSetting`.

### useSearch

Hook generico de filtro por nome:

```typescript
function useSearch<T>(items: T[], accessor: (item: T) => string) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() =>
    items.filter(item =>
      accessor(item).toLowerCase().includes(query.toLowerCase())
    ), [items, query, accessor]);
  return { query, setQuery, filtered };
}
```

### useMarkupCalculator

Calculo live de pricing para a tela NewProduct:

```typescript
function useMarkupCalculator(cost: number, price: number) {
  const markup = cost > 0 ? ((price - cost) / cost) * 100 : 0;
  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
  const profit = price - cost;
  return { markup, margin, profit };
}
```

---

## Decisoes de Arquitetura

- React Context para state management — app simples, sem justificativa para Zustand/Redux (ADR-001)
- Mock data em arquivos TS separados — sem chamadas de rede, arrays copiados para o estado (ADR-002)
- Animacoes via CSS @keyframes no Tailwind — sem framer-motion, sem dependencia extra (ADR-003)
- NewSalePage gerencia step internamente via estado local — sem sub-rotas (ADR-004)
- BottomNav controlado pelo AppShell via rota — sem prop drilling (ADR-005)

---

## Regras Tecnicas do Projeto

- Dados mock NUNCA sao importados diretamente nos componentes — sempre via hooks (useData, useCart, useSettings)
- Logica de pricing (floor90, ceil90, round90) centralizada em `lib/pricing.ts` — sem duplicacao
- Componentes de `components/ui/` sao shadcn/ui — nao modificar a API, estender via CVA variants
- Componentes com mais de 200 linhas devem ser decompostos
- Cada pagina e um unico arquivo que compoe componentes menores — nao colocar logica pesada na pagina
- Valores monetarios formatados com `formatCurrency` de `lib/utils.ts` — nunca formatar inline
- Gradientes dourados reutilizados via classe Tailwind customizada ou inline style (Tailwind nao suporta gradientes arbitrarios em classes utilitarias nativamente)
- `prefers-reduced-motion`: desativar animacoes fadeup, glow e pop quando o usuario preferir
- Viewport target: 392x812 (iPhone-like), funcional a partir de 320px de largura
- Padding lateral do conteudo: 20px (consistente em todas as paginas)
- Padding bottom: 110px quando BottomNav visivel, 40px quando oculto
