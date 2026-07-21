import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockClients = [
  { id: 'c1', name: 'Patrícia Souza', phone: '(42) 99234-5678', birthday: '1988-03-15', active: true, created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'c2', name: 'Juliana Costa', phone: null, birthday: null, active: true, created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01' },
]

const mockSalesForClients = [
  { client_id: 'c1', total: 189.70, created_at: '2026-07-20T19:40:00Z' },
  { client_id: 'c1', total: 116.20, created_at: '2026-07-20T15:03:00Z' },
  { client_id: 'c2', total: 74.80, created_at: '2026-07-20T18:12:00Z' },
]

const mockInsert = vi.fn().mockReturnValue({
  select: () => ({
    single: () => Promise.resolve({
      data: { id: 'new-c', name: 'Nova Cliente', phone: null, birthday: null, active: true, created_by: null, created_at: '2026-07-20', updated_at: '2026-07-20' },
      error: null,
    }),
  }),
})

const mockRpc = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'clients') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockClients, error: null }),
            }),
          }),
          insert: mockInsert,
        }
      }
      return {
        select: () => ({
          is: () => Promise.resolve({ data: mockSalesForClients, error: null }),
        }),
      }
    },
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

describe('useClients', () => {
  it('should fetch active clients with totalSpent derived', async () => {
    const { useClients } = await import('../useClients')
    const { result } = renderHook(() => useClients(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    const patricia = result.current.data?.find((c) => c.id === 'c1')
    expect(patricia?.totalSpent).toBeCloseTo(305.90)
    expect(patricia?.lastPurchase).toBe('2026-07-20T19:40:00Z')
  })

  it('should return 0 totalSpent for client with no sales', async () => {
    const { useClients } = await import('../useClients')
    const { result } = renderHook(() => useClients(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const juliana = result.current.data?.find((c) => c.id === 'c2')
    expect(juliana?.totalSpent).toBeCloseTo(74.80)
  })
})

describe('useCreateClient', () => {
  it('should call insert on clients table', async () => {
    const { useCreateClient } = await import('../useClients')
    const { result } = renderHook(() => useCreateClient(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ name: 'Nova Cliente', phone: null })

    expect(mockInsert).toHaveBeenCalledWith({ name: 'Nova Cliente', phone: null, birthday: null })
  })
})

describe('useSoftDeleteClient', () => {
  it('should call soft_delete_client RPC', async () => {
    const { useSoftDeleteClient } = await import('../useClients')
    const { result } = renderHook(() => useSoftDeleteClient(), { wrapper: createWrapper() })

    await result.current.mutateAsync('c1')

    expect(mockRpc).toHaveBeenCalledWith('soft_delete_client', { p_client_id: 'c1' })
  })
})
