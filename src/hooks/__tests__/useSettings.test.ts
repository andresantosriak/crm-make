import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockSettings = {
  id: 1, default_markup: 180, low_stock_threshold: 5, vip_threshold: 500,
  birthday_alert_days: 7, toggle_promos: true, toggle_estoque: true,
  toggle_aniversario: true, toggle_resumo: false, updated_at: '',
}

const mockSettingsQuery = {
  eq: vi.fn(),
  single: vi.fn().mockResolvedValue({ data: mockSettings, error: null }),
}
mockSettingsQuery.eq.mockReturnValue(mockSettingsQuery)
const mockUpdate = vi.fn().mockReturnValue({
  eq: () => Promise.resolve({ error: null }),
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isSuperAdmin: false,
    selectedEstablishmentId: null,
    profile: { id: 'u1', establishmentId: 'est-1', fullName: 'Admin Local', role: 'admin', createdAt: '', updatedAt: '' },
  }),
}))

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => mockSettingsQuery,
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

describe('useSettings (facade)', () => {
  it('should return defaultMarkup from store_settings', async () => {
    const { useSettings } = await import('../useSettings')
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.defaultMarkup).toBe(180))
  })

  it('should return toggles from store_settings', async () => {
    const { useSettings } = await import('../useSettings')
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.toggles.promos).toBe(true))
    expect(result.current.toggles.estoque).toBe(true)
    expect(result.current.toggles.aniv).toBe(true)
    expect(result.current.toggles.resumo).toBe(false)
  })

  it('should call supabase update when setMarkup is called', async () => {
    const { useSettings } = await import('../useSettings')
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.defaultMarkup).toBe(180))

    act(() => result.current.setMarkup(200))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ default_markup: 200 }))
  })

  it('should clamp and step markup value before updating', async () => {
    mockUpdate.mockClear()
    const { useSettings } = await import('../useSettings')
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.defaultMarkup).toBe(180))

    act(() => result.current.setMarkup(193))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ default_markup: 190 }))
  })

  it('should call supabase update when toggleSetting is called', async () => {
    mockUpdate.mockClear()
    const { useSettings } = await import('../useSettings')
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.toggles.promos).toBe(true))

    act(() => result.current.toggleSetting('promos'))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ toggle_promos: false }))
  })
})
