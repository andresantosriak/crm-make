import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockInvoke = vi.fn()
const mockGetSession = vi.fn()
interface MockAuthValue {
  session: { access_token: string; user: { id: string } } | null
  isLoading: boolean
  isSuperAdmin: boolean
  selectedEstablishmentId: string | null
  profile: { establishmentId: string } | null
}

const mockAuth = vi.hoisted((): { value: MockAuthValue } => ({
  value: {
    session: {
      access_token: 'token-123',
      user: { id: 'user-1' },
    },
    isLoading: false,
    isSuperAdmin: true,
    selectedEstablishmentId: 'est-1',
    profile: { establishmentId: 'est-profile' },
  },
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuth.value,
}))

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
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
    mockAuth.value = {
      session: {
        access_token: 'token-123',
        user: { id: 'user-1' },
      },
      isLoading: false,
      isSuperAdmin: true,
      selectedEstablishmentId: 'est-1',
      profile: { establishmentId: 'est-profile' },
    }
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'token-123',
        },
      },
    })
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
        metrics: {
          establishments: 1,
          products: 10,
          clients: 5,
          sales90d: 8,
          averageTicket90d: 122.88,
          monthRevenue: 420.6,
          monthlySalesGoal: 1000,
          monthlyGoalProgress: 0.4206,
          monthlyGoalGap: 579.4,
          requiredDailyRevenueToGoal: 52.67,
        },
      },
      error: null,
    })
  })

  it('should call ai-insights function with selected establishment', async () => {
    const { useAiInsights } = await import('../useAiInsights')
    const { result } = renderHook(() => useAiInsights(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockInvoke).toHaveBeenCalledWith('ai-insights', {
      headers: { Authorization: 'Bearer token-123' },
      body: { establishment_id: 'est-1' },
    })
    expect(result.current.data?.model).toBe('fallback-local')
  })

  it('should not call ai-insights before auth is ready', async () => {
    mockAuth.value = {
      ...mockAuth.value,
      session: null,
      isLoading: true,
    }

    const { useAiInsights } = await import('../useAiInsights')
    const { result } = renderHook(() => useAiInsights(), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockGetSession).not.toHaveBeenCalled()
    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('should surface invocation errors', async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error('failed') })

    const { useAiInsights } = await import('../useAiInsights')
    const { result } = renderHook(() => useAiInsights(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
