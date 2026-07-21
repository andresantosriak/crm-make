import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const todayISO = new Date().toISOString().slice(0, 10)

const mockSales = [
  { id: 's1', client_id: 'c1', payment_method: 'Pix', total: 189.70, items_count: 3, created_by: null, refunded_at: null, created_at: `${todayISO}T19:40:00Z` },
  { id: 's2', client_id: null, payment_method: 'Dinheiro', total: 29.90, items_count: 1, created_by: null, refunded_at: null, created_at: '2026-07-19T17:22:00Z' },
]

const mockRpc = vi.fn().mockImplementation((fn: string) => {
  if (fn === 'create_sale') return Promise.resolve({ data: 'new-sale-id', error: null })
  if (fn === 'cancel_sale') return Promise.resolve({ data: null, error: null })
  return Promise.resolve({ data: null, error: null })
})

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        is: () => ({
          order: () => Promise.resolve({ data: mockSales, error: null }),
        }),
      }),
    }),
    rpc: mockRpc,
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useSales', () => {
  it('should fetch non-refunded sales ordered by created_at desc', async () => {
    const { useSales } = await import('../useSales')
    const { result } = renderHook(() => useSales(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.id).toBe('s1')
    expect(result.current.data?.[0]?.paymentMethod).toBe('Pix')
    expect(result.current.data?.[1]?.clientId).toBeNull()
  })
})

describe('useCreateSale', () => {
  it('should call create_sale RPC with items', async () => {
    const { useCreateSale } = await import('../useSales')
    const { result } = renderHook(() => useCreateSale(), { wrapper: createWrapper() })

    const items = [
      { product_id: 'p1', quantity: 2, unit_price: 39.90 },
      { product_id: 'p2', quantity: 1, unit_price: 29.90 },
    ]

    await result.current.mutateAsync({
      p_client_id: 'c1',
      p_payment_method: 'Pix',
      p_items: items,
    })

    expect(mockRpc).toHaveBeenCalledWith('create_sale', expect.objectContaining({
      p_client_id: 'c1',
      p_payment_method: 'Pix',
    }))
  })
})

describe('useCancelSale', () => {
  it('should call cancel_sale RPC', async () => {
    const { useCancelSale } = await import('../useSales')
    const { result } = renderHook(() => useCancelSale(), { wrapper: createWrapper() })

    await result.current.mutateAsync('s1')

    expect(mockRpc).toHaveBeenCalledWith('cancel_sale', { p_sale_id: 's1' })
  })
})
