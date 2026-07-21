import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const now = new Date()
const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const mockProducts = [
  { id: '1', name: 'Batom', category: 'Lábios', price: 39.90, cost: 14, stock: 24, active: true, created_by: null, created_at: '', updated_at: '' },
  { id: '3', name: 'Máscara', category: 'Olhos', price: 49.90, cost: 18, stock: 3, active: true, created_by: null, created_at: '', updated_at: '' },
  { id: '7', name: 'Blush', category: 'Rosto', price: 44.90, cost: 15, stock: 2, active: true, created_by: null, created_at: '', updated_at: '' },
]

const mockClients = [
  { id: 'c1', name: 'Patrícia Souza', phone: null, birthday: null, active: true, created_by: null, created_at: '', updated_at: '' },
  { id: 'c2', name: 'Juliana Costa', phone: null, birthday: null, active: true, created_by: null, created_at: '', updated_at: '' },
]

const mockSalesForClients = [
  { client_id: 'c1', total: 100, created_at: `${todayLocal}T10:00:00Z` },
]

const mockSales = [
  { id: 's1', client_id: 'c1', payment_method: 'Pix', total: 100, items_count: 2, created_by: null, refunded_at: null, created_at: `${todayLocal}T10:00:00Z` },
  { id: 's2', client_id: null, payment_method: 'Dinheiro', total: 50, items_count: 1, created_by: null, refunded_at: null, created_at: `${todayLocal}T14:00:00Z` },
  { id: 's3', client_id: 'c2', payment_method: 'Pix', total: 80, items_count: 3, created_by: null, refunded_at: null, created_at: '2026-01-01T20:00:00Z' },
]

const mockSettings = { id: 1, default_markup: 180, low_stock_threshold: 5, vip_threshold: 500, birthday_alert_days: 7, toggle_promos: true, toggle_estoque: true, toggle_aniversario: true, toggle_resumo: false, updated_at: '' }

function makeSalesIs() {
  const resolved = Promise.resolve({ data: mockSalesForClients, error: null })
  return Object.assign(resolved, {
    order: () => Promise.resolve({ data: mockSales, error: null }),
  })
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => {
        if (table === 'sales') {
          return { is: () => makeSalesIs() }
        }
        if (table === 'store_settings') {
          return { single: () => Promise.resolve({ data: mockSettings, error: null }) }
        }
        return {
          eq: () => ({
            order: () => {
              if (table === 'clients') return Promise.resolve({ data: mockClients, error: null })
              return Promise.resolve({ data: mockProducts, error: null })
            },
          }),
        }
      },
    }),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useData (facade)', () => {
  it('should load products, clients and sales', async () => {
    const { useData } = await import('../useData')
    const { result } = renderHook(() => useData(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.products.length).toBeGreaterThan(0))

    expect(result.current.products).toHaveLength(3)
    expect(result.current.clients).toHaveLength(2)
    expect(result.current.sales).toHaveLength(3)
  })

  it('should compute todaySales from created_at', async () => {
    const { useData } = await import('../useData')
    const { result } = renderHook(() => useData(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.sales.length).toBe(3))

    expect(result.current.todaySales).toHaveLength(2)
    expect(result.current.todayTotal).toBeCloseTo(150)
    expect(result.current.todayCount).toBe(2)
  })

  it('should compute lowStockProducts using store_settings threshold', async () => {
    const { useData } = await import('../useData')
    const { result } = renderHook(() => useData(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.products.length).toBeGreaterThan(0))

    expect(result.current.lowStockProducts).toHaveLength(2)
    expect(result.current.lowStockProducts.map((p) => p.name).sort()).toEqual(['Blush', 'Máscara'])
  })

  it('should resolve getClientName correctly', async () => {
    const { useData } = await import('../useData')
    const { result } = renderHook(() => useData(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.clients.length).toBeGreaterThan(0))

    expect(result.current.getClientName('c1')).toBe('Patrícia Souza')
    expect(result.current.getClientName(null)).toBe('Consumidor final')
    expect(result.current.getClientName('unknown')).toBe('Cliente removido')
  })
})
