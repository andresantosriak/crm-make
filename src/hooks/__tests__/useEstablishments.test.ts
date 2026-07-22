import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockOrder = vi.fn()
const mockEq = vi.fn(() => ({ order: mockOrder }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
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

describe('useEstablishments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOrder.mockResolvedValue({
      data: [
        {
          id: 'est-1',
          name: 'Studio Bell PG',
          slug: 'studio-bell-pg',
          active: true,
          created_by: null,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ],
      error: null,
    })
  })

  it('should fetch active establishments', async () => {
    const { useEstablishments } = await import('../useEstablishments')
    const { result } = renderHook(() => useEstablishments(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.[0]?.name).toBe('Studio Bell PG')
    expect(mockFrom).toHaveBeenCalledWith('establishments')
    expect(mockEq).toHaveBeenCalledWith('active', true)
    expect(mockOrder).toHaveBeenCalledWith('name')
  })

  it('should not query when disabled', async () => {
    const { useEstablishments } = await import('../useEstablishments')
    const { result } = renderHook(() => useEstablishments({ enabled: false }), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('should fail with a clear message when the response is not a list', async () => {
    mockOrder.mockResolvedValue({
      data: { message: 'permission denied for table establishments' },
      error: null,
    })
    const { useEstablishments } = await import('../useEstablishments')
    const { result } = renderHook(() => useEstablishments(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(new Error('Resposta inválida ao carregar estabelecimentos'))
  })
})
