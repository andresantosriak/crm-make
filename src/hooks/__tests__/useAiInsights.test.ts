import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockInvoke = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isSuperAdmin: true,
    selectedEstablishmentId: 'est-1',
    profile: { establishmentId: 'est-profile' },
  }),
}))

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useAiInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInvoke.mockResolvedValue({
      data: {
        source: 'rules',
        model: 'fallback-local',
        generatedAt: '2026-07-21T00:00:00Z',
        summary: 'Resumo',
        insights: [],
        automationIdeas: [],
        actionPlan: [],
        contentIdeas: [],
        customerActions: [],
        performanceSignals: [],
        metrics: { establishments: 1, products: 10, clients: 5, sales90d: 8, averageTicket90d: 122.88 },
      },
      error: null,
    })
  })

  it('should call ai-insights function with selected establishment', async () => {
    const { useAiInsights } = await import('../useAiInsights')
    const { result } = renderHook(() => useAiInsights(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockInvoke).toHaveBeenCalledWith('ai-insights', {
      body: { establishment_id: 'est-1' },
    })
    expect(result.current.data?.model).toBe('fallback-local')
  })

  it('should surface invocation errors', async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error('failed') })

    const { useAiInsights } = await import('../useAiInsights')
    const { result } = renderHook(() => useAiInsights(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
