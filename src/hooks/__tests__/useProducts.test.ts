import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockProducts = [
  { id: 'abc-1', establishment_id: 'est-1', name: 'Batom Matte', category: 'Lábios', price: 39.90, cost: 14, stock: 24, active: true, created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: 'abc-2', establishment_id: 'est-1', name: 'Base Líquida', category: 'Rosto', price: 79.90, cost: null, stock: 12, active: true, created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01' },
]

const mockInsert = vi.fn().mockResolvedValue({ error: null })

const mockUpdate = vi.fn().mockReturnValue({
  eq: () => Promise.resolve({ error: null }),
})

const mockRpc = vi.fn().mockResolvedValue({ error: null })
const mockProductsDisplayQuery = {
  eq: vi.fn(),
  order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
}
mockProductsDisplayQuery.eq.mockReturnValue(mockProductsDisplayQuery)

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isSuperAdmin: false,
    selectedEstablishmentId: null,
    profile: { id: 'u1', establishmentId: 'est-1', fullName: 'Admin Local', role: 'admin', createdAt: '', updatedAt: '' },
  }),
}))

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'products') {
        return {
          insert: mockInsert,
          update: mockUpdate,
        }
      }
      return {
        select: () => mockProductsDisplayQuery,
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

describe('useProducts', () => {
  it('should fetch products from products_display view', async () => {
    const { useProducts } = await import('../useProducts')
    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.name).toBe('Batom Matte')
    expect(result.current.data?.[0]?.id).toBe('abc-1')
  })

  it('should map snake_case to camelCase', async () => {
    const { useProducts } = await import('../useProducts')
    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const product = result.current.data?.[0]
    expect(product?.createdAt).toBe('2026-01-01')
    expect(product?.updatedAt).toBe('2026-01-01')
    expect(product?.createdBy).toBeNull()
  })

  it('should return cost as null when employee (view masks it)', async () => {
    const { useProducts } = await import('../useProducts')
    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.[1]?.cost).toBeNull()
  })
})

describe('useCreateProduct', () => {
  it('should call insert on products table', async () => {
    const { useCreateProduct } = await import('../useProducts')
    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() })

    await result.current.mutateAsync({
      name: 'Novo Produto',
      category: 'Rosto',
      price: 49.90,
      cost: 20,
      stock: 10,
    })

    expect(mockInsert).toHaveBeenCalledWith({
      establishment_id: 'est-1',
      name: 'Novo Produto',
      category: 'Rosto',
      price: 49.90,
      cost: 20,
      stock: 10,
    })
  })
})

describe('useSoftDeleteProduct', () => {
  it('should call soft_delete_product RPC', async () => {
    const { useSoftDeleteProduct } = await import('../useProducts')
    const { result } = renderHook(() => useSoftDeleteProduct(), { wrapper: createWrapper() })

    await result.current.mutateAsync('abc-1')

    expect(mockRpc).toHaveBeenCalledWith('soft_delete_product', { p_product_id: 'abc-1' })
  })
})
