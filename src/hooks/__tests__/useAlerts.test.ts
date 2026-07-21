import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const now = new Date()
const todayBirthday = `1990-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const tomorrow = new Date(now)
tomorrow.setDate(tomorrow.getDate() + 3)
const soonBirthday = `1990-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

const mockProducts = [
  { id: '1', name: 'Máscara Volume Extremo', category: 'Olhos', price: 49.90, cost: 18, stock: 3, active: true, created_by: null, created_at: '', updated_at: '' },
  { id: '2', name: 'Blush Pêssego', category: 'Rosto', price: 44.90, cost: 15, stock: 2, active: true, created_by: null, created_at: '', updated_at: '' },
  { id: '3', name: 'Batom Matte', category: 'Lábios', price: 39.90, cost: 14, stock: 24, active: true, created_by: null, created_at: '', updated_at: '' },
]

const mockClients = [
  { id: 'c1', name: 'Mariana Alves', phone: null, birthday: todayBirthday, active: true, created_by: null, created_at: '', updated_at: '' },
  { id: 'c2', name: 'Juliana Costa', phone: null, birthday: soonBirthday, active: true, created_by: null, created_at: '', updated_at: '' },
  { id: 'c3', name: 'Renata Lima', phone: null, birthday: '1987-01-15', active: true, created_by: null, created_at: '', updated_at: '' },
]

const mockSettings = {
  id: 1, default_markup: 180, monthly_sales_goal: 10000, low_stock_threshold: 5, vip_threshold: 500,
  birthday_alert_days: 7, toggle_promos: true, toggle_estoque: true,
  toggle_aniversario: true, toggle_resumo: false, updated_at: '',
}

function makeSalesIs() {
  const resolved = Promise.resolve({ data: [], error: null })
  return Object.assign(resolved, {
    order: () => Promise.resolve({ data: [], error: null }),
  })
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => {
        if (table === 'sales') return { is: () => makeSalesIs() }
        if (table === 'store_settings') return { single: () => Promise.resolve({ data: mockSettings, error: null }) }
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

describe('useAlerts', () => {
  it('should derive stock alerts for products with stock <= threshold', async () => {
    const { useAlerts } = await import('../useAlerts')
    const { result } = renderHook(() => useAlerts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    const stockAlerts = result.current.alerts.filter((a) => a.kind === 'Estoque')
    expect(stockAlerts).toHaveLength(2)
    expect(stockAlerts.map((a) => a.text)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Máscara Volume Extremo'),
        expect.stringContaining('Blush Pêssego'),
      ]),
    )
    expect(stockAlerts[0]?.dot).toBe('#D07C67')
  })

  it('should derive birthday alerts within birthdayAlertDays', async () => {
    const { useAlerts } = await import('../useAlerts')
    const { result } = renderHook(() => useAlerts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    const bdAlerts = result.current.alerts.filter((a) => a.kind === 'Cliente')
    expect(bdAlerts).toHaveLength(2)
    expect(bdAlerts.map((a) => a.text)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Mariana Alves'),
        expect.stringContaining('Juliana Costa'),
      ]),
    )
    expect(bdAlerts[0]?.dot).toBe('#8FA98A')
  })

  it('should show "hoje" for exact birthday', async () => {
    const { useAlerts } = await import('../useAlerts')
    const { result } = renderHook(() => useAlerts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    const mariana = result.current.alerts.find((a) => a.text.includes('Mariana'))
    expect(mariana?.when).toBe('Hoje')
  })

  it('should include Sophia suggestion (mock)', async () => {
    const { useAlerts } = await import('../useAlerts')
    const { result } = renderHook(() => useAlerts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    const sophia = result.current.alerts.find((a) => a.kind === 'Sophia · IA')
    expect(sophia).toBeDefined()
    expect(sophia?.dot).toBe('#C8A24C')
    expect(sophia?.when).toBe('Sugestão')
  })

  it('should not include Renata (birthday too far)', async () => {
    const { useAlerts } = await import('../useAlerts')
    const { result } = renderHook(() => useAlerts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    const renata = result.current.alerts.find((a) => a.text.includes('Renata'))
    expect(renata).toBeUndefined()
  })
})
