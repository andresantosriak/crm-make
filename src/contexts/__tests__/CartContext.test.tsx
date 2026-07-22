import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartContext, CartProvider } from '../CartContext'
import { useContext } from 'react'

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [
              { id: '1', name: 'Batom Matte Vermelho Rubi', category: 'Lábios', price: 39.90, cost: 14, stock: 24, active: true, created_by: null, created_at: '', updated_at: '' },
              { id: '3', name: 'Máscara Volume Extremo', category: 'Olhos', price: 49.90, cost: 18, stock: 3, active: true, created_by: null, created_at: '', updated_at: '' },
              { id: '8', name: 'Gloss Labial Cristal', category: 'Lábios', price: 29.90, cost: 9, stock: 21, active: true, created_by: null, created_at: '', updated_at: '' },
            ],
            error: null,
          }),
        }),
      }),
    }),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CartProvider>{children}</CartProvider>
      </QueryClientProvider>
    )
  }
}

function useCartTest() {
  return useContext(CartContext)
}

async function waitForProducts(result: { current: ReturnType<typeof useCartTest> }) {
  act(() => result.current.addItem('1'))
  await waitFor(() => expect(result.current.cartCount).toBe(1))
  act(() => result.current.clearCart())
}

describe('CartContext', () => {
  it('should have empty initial state', () => {
    const { result } = renderHook(() => useCartTest(), { wrapper: createWrapper() })
    expect(result.current.items).toEqual({})
    expect(result.current.step).toBe('produtos')
    expect(result.current.client).toBeNull()
    expect(result.current.payment).toBeNull()
    expect(result.current.combos).toEqual([])
    expect(result.current.cartSubtotal).toBe(0)
    expect(result.current.cartDiscountTotal).toBe(0)
    expect(result.current.cartTotal).toBe(0)
    expect(result.current.cartCount).toBe(0)
  })

  it('should add items and calculate total', async () => {
    const { result } = renderHook(() => useCartTest(), { wrapper: createWrapper() })
    await waitForProducts(result)

    act(() => result.current.addItem('1'))
    act(() => result.current.addItem('1'))

    expect(result.current.items).toEqual({ '1': 2 })
    expect(result.current.cartCount).toBe(2)
    expect(result.current.cartSubtotal).toBeCloseTo(79.80)
    expect(result.current.cartTotal).toBeCloseTo(79.80)
  })

  it('should create named combo and apply discount to cart total', async () => {
    const { result } = renderHook(() => useCartTest(), { wrapper: createWrapper() })
    await waitForProducts(result)

    act(() => result.current.addItem('1'))
    act(() => result.current.addItem('3'))
    act(() =>
      result.current.saveCombo({
        name: 'Kit olhos e boca',
        productIds: ['1', '3'],
        discountType: 'percent',
        discountValue: 10,
      }),
    )

    expect(result.current.combos).toHaveLength(1)
    expect(result.current.cartCombos[0]?.name).toBe('Kit olhos e boca')
    expect(result.current.cartSubtotal).toBeCloseTo(89.80)
    expect(result.current.cartDiscountTotal).toBeCloseTo(8.98)
    expect(result.current.cartTotal).toBeCloseTo(80.82)
    expect(result.current.cartItems.every((item) => item.comboName === 'Kit olhos e boca')).toBe(true)
  })

  it('should remove item when quantity reaches 0', async () => {
    const { result } = renderHook(() => useCartTest(), { wrapper: createWrapper() })
    await waitForProducts(result)

    act(() => result.current.addItem('1'))
    act(() => result.current.removeItem('1'))

    expect(result.current.items).toEqual({})
    expect(result.current.cartCount).toBe(0)
  })

  it('should clear cart completely', async () => {
    const { result } = renderHook(() => useCartTest(), { wrapper: createWrapper() })
    await waitForProducts(result)

    act(() => result.current.addItem('1'))
    act(() => result.current.setStep('checkout'))
    act(() => result.current.setPayment('Pix'))
    act(() => result.current.clearCart())

    expect(result.current.items).toEqual({})
    expect(result.current.step).toBe('produtos')
    expect(result.current.payment).toBeNull()
    expect(result.current.combos).toEqual([])
  })

  it('should reset after sale', async () => {
    const { result } = renderHook(() => useCartTest(), { wrapper: createWrapper() })
    await waitForProducts(result)

    act(() => result.current.addItem('1'))
    act(() =>
      result.current.setClient({
        id: '2', establishmentId: 'est-1', name: 'Patrícia Souza', phone: null, birthday: null,
        active: true, createdBy: null, createdAt: '', updatedAt: '',
      }),
    )
    act(() => result.current.setPayment('Pix'))
    act(() => result.current.resetAfterSale())

    expect(result.current.items).toEqual({})
    expect(result.current.step).toBe('produtos')
    expect(result.current.client).toBeNull()
    expect(result.current.payment).toBeNull()
    expect(result.current.combos).toEqual([])
    expect(result.current.cartCount).toBe(0)
  })
})
