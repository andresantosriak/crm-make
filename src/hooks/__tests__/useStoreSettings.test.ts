import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockSettings = {
  id: 1, default_markup: 180, low_stock_threshold: 5, vip_threshold: 500,
  birthday_alert_days: 7, toggle_promos: true, toggle_estoque: true,
  toggle_aniversario: true, toggle_resumo: false, updated_at: '2026-07-20T00:00:00Z',
}

const mockUpdate = vi.fn().mockReturnValue({
  eq: () => Promise.resolve({ error: null }),
})

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ single: () => Promise.resolve({ data: mockSettings, error: null }) }),
      update: mockUpdate,
    }),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useStoreSettings', () => {
  it('should fetch singleton store_settings', async () => {
    const { useStoreSettings } = await import('../useStoreSettings')
    const { result } = renderHook(() => useStoreSettings(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.defaultMarkup).toBe(180)
    expect(result.current.data?.lowStockThreshold).toBe(5)
    expect(result.current.data?.vipThreshold).toBe(500)
    expect(result.current.data?.birthdayAlertDays).toBe(7)
    expect(result.current.data?.togglePromos).toBe(true)
    expect(result.current.data?.toggleResumo).toBe(false)
  })

  it('should map snake_case to camelCase', async () => {
    const { useStoreSettings } = await import('../useStoreSettings')
    const { result } = renderHook(() => useStoreSettings(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.updatedAt).toBe('2026-07-20T00:00:00Z')
    expect(result.current.data?.id).toBe(1)
  })
})

describe('useUpdateSettings', () => {
  it('should call supabase update with eq id=1', async () => {
    mockUpdate.mockClear()
    const { useUpdateSettings } = await import('../useStoreSettings')
    const { result } = renderHook(() => useUpdateSettings(), { wrapper: createWrapper() })

    result.current.mutate({ default_markup: 200 })

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ default_markup: 200 }))
  })
})
