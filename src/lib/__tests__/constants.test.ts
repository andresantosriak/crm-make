import { describe, it, expect } from 'vitest'
import {
  LOW_STOCK_THRESHOLD,
  DEFAULT_MARKUP,
  MARKUP_MIN,
  MARKUP_MAX,
  MARKUP_STEP,
  PAYMENT_METHODS,
  NAV_ROUTES,
  HIDDEN_NAV_ROUTES,
  getCategoryTile,
  CATEGORY_TILE_FALLBACK,
} from '../constants'

describe('constants', () => {
  it('should have LOW_STOCK_THRESHOLD = 5', () => {
    expect(LOW_STOCK_THRESHOLD).toBe(5)
  })

  it('should have DEFAULT_MARKUP = 180', () => {
    expect(DEFAULT_MARKUP).toBe(180)
  })

  it('should have MARKUP_MIN = 0, MARKUP_MAX = 500, MARKUP_STEP = 10', () => {
    expect(MARKUP_MIN).toBe(0)
    expect(MARKUP_MAX).toBe(500)
    expect(MARKUP_STEP).toBe(10)
  })

  it('should have 4 payment methods in correct order', () => {
    expect(PAYMENT_METHODS).toEqual([
      'Pix',
      'Cartão de crédito',
      'Cartão de débito',
      'Dinheiro',
    ])
  })

  it('should have HIDDEN_NAV_ROUTES = [/login, /produto]', () => {
    expect(HIDDEN_NAV_ROUTES).toEqual(['/login', '/produto'])
  })

  it('should map NAV_ROUTES correctly', () => {
    expect(NAV_ROUTES.home).toBe('/')
    expect(NAV_ROUTES.vendas).toBe('/vendas')
    expect(NAV_ROUTES.estoque).toBe('/estoque')
    expect(NAV_ROUTES.clientes).toBe('/clientes')
    expect(NAV_ROUTES.config).toBe('/config')
  })
})

describe('getCategoryTile', () => {
  it('should return Lábios gradient', () => {
    const tile = getCategoryTile('Lábios')
    expect(tile.bg).toContain('#d98a8a')
    expect(tile.bg).toContain('#b25f6a')
  })

  it('should return Olhos gradient', () => {
    const tile = getCategoryTile('Olhos')
    expect(tile.bg).toContain('#b9a0d0')
    expect(tile.bg).toContain('#8a72a8')
  })

  it('should return Rosto gradient', () => {
    const tile = getCategoryTile('Rosto')
    expect(tile.bg).toContain('#e0c39a')
    expect(tile.bg).toContain('#c79a63')
  })

  it('should return fallback gradient for unknown category', () => {
    const tile = getCategoryTile('Inexistente')
    expect(tile).toEqual(CATEGORY_TILE_FALLBACK)
    expect(tile.bg).toContain('#c8a24c')
    expect(tile.bg).toContain('#b78d3d')
  })
})
