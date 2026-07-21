export const CATEGORY_TILES: Record<string, { bg: string; text: string }> = {
  'Lábios': { bg: 'linear-gradient(135deg, #d98a8a, #b25f6a)', text: '#16120E' },
  Olhos: { bg: 'linear-gradient(135deg, #b9a0d0, #8a72a8)', text: '#16120E' },
  Rosto: { bg: 'linear-gradient(135deg, #e0c39a, #c79a63)', text: '#16120E' },
}

export const CATEGORY_TILE_FALLBACK = {
  bg: 'linear-gradient(135deg, #c8a24c, #b78d3d)',
  text: '#16120E',
}

export const LOW_STOCK_THRESHOLD = 5
export const DEFAULT_MARKUP = 180
export const MARKUP_MIN = 0
export const MARKUP_MAX = 500
export const MARKUP_STEP = 10

export const PAYMENT_METHODS = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro'] as const

export const NAV_ROUTES = {
  home: '/',
  vendas: '/vendas',
  estoque: '/estoque',
  clientes: '/clientes',
  config: '/config',
} as const

export const HIDDEN_NAV_ROUTES = ['/login', '/produto']

export function getCategoryTile(category: string) {
  return CATEGORY_TILES[category] ?? CATEGORY_TILE_FALLBACK
}
