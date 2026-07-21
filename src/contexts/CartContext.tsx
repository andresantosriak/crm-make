import { createContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { Client, PaymentMethod, CartItem } from '@/types'
import { useProducts } from '@/hooks/useProducts'

interface CartContextType {
  items: Record<string, number>
  step: 'produtos' | 'checkout'
  client: Client | null
  payment: PaymentMethod | null
  isConfirming: boolean
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  setStep: (step: 'produtos' | 'checkout') => void
  setClient: (client: Client | null) => void
  setPayment: (payment: PaymentMethod | null) => void
  setIsConfirming: (v: boolean) => void
  resetAfterSale: () => void
  cartTotal: number
  cartCount: number
  cartItems: CartItem[]
}

export const CartContext = createContext<CartContextType>({
  items: {},
  step: 'produtos',
  client: null,
  payment: null,
  isConfirming: false,
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  setStep: () => {},
  setClient: () => {},
  setPayment: () => {},
  setIsConfirming: () => {},
  resetAfterSale: () => {},
  cartTotal: 0,
  cartCount: 0,
  cartItems: [],
})

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: products = [] } = useProducts()
  const [items, setItems] = useState<Record<string, number>>({})
  const [step, setStep] = useState<'produtos' | 'checkout'>('produtos')
  const [client, setClient] = useState<Client | null>(null)
  const [payment, setPayment] = useState<PaymentMethod | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const addItem = useCallback((productId: string) => {
    setItems((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }))
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = { ...prev }
      const qty = (next[productId] ?? 0) - 1
      if (qty <= 0) {
        delete next[productId]
      } else {
        next[productId] = qty
      }
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems({})
    setStep('produtos')
    setClient(null)
    setPayment(null)
    setIsConfirming(false)
  }, [])

  const resetAfterSale = useCallback(() => {
    setItems({})
    setStep('produtos')
    setClient(null)
    setPayment(null)
    setIsConfirming(false)
  }, [])

  const cartItems = useMemo(() => {
    const result: CartItem[] = []
    for (const [id, quantity] of Object.entries(items)) {
      const product = products.find((p) => p.id === id)
      if (product && quantity > 0) {
        result.push({ product, quantity })
      }
    }
    return result
  }, [items, products])

  const cartTotal = useMemo(
    () => cartItems.reduce((acc, ci) => acc + ci.product.price * ci.quantity, 0),
    [cartItems],
  )

  const cartCount = useMemo(
    () => cartItems.reduce((acc, ci) => acc + ci.quantity, 0),
    [cartItems],
  )

  return (
    <CartContext.Provider
      value={{
        items,
        step,
        client,
        payment,
        isConfirming,
        addItem,
        removeItem,
        clearCart,
        setStep,
        setClient,
        setPayment,
        setIsConfirming,
        resetAfterSale,
        cartTotal,
        cartCount,
        cartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
