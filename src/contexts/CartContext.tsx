import { createContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import type { CartComboSummary, Client, PaymentMethod, CartItem, SaleComboDraft } from '@/types'
import { useProducts } from '@/hooks/useProducts'
import { calculateComboPricing, roundMoney } from '@/lib/cart-combos'

interface CartContextType {
  items: Record<string, number>
  combos: SaleComboDraft[]
  step: 'produtos' | 'checkout'
  client: Client | null
  payment: PaymentMethod | null
  isConfirming: boolean
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  saveCombo: (combo: Omit<SaleComboDraft, 'id'> & { id?: string }) => void
  removeCombo: (comboId: string) => void
  clearCart: () => void
  setStep: (step: 'produtos' | 'checkout') => void
  setClient: (client: Client | null) => void
  setPayment: (payment: PaymentMethod | null) => void
  setIsConfirming: (v: boolean) => void
  resetAfterSale: () => void
  cartSubtotal: number
  cartDiscountTotal: number
  cartTotal: number
  cartCount: number
  cartItems: CartItem[]
  cartCombos: CartComboSummary[]
}

export const CartContext = createContext<CartContextType>({
  items: {},
  combos: [],
  step: 'produtos',
  client: null,
  payment: null,
  isConfirming: false,
  addItem: () => {},
  removeItem: () => {},
  saveCombo: () => {},
  removeCombo: () => {},
  clearCart: () => {},
  setStep: () => {},
  setClient: () => {},
  setPayment: () => {},
  setIsConfirming: () => {},
  resetAfterSale: () => {},
  cartSubtotal: 0,
  cartDiscountTotal: 0,
  cartTotal: 0,
  cartCount: 0,
  cartItems: [],
  cartCombos: [],
})

function createComboId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `combo-${Date.now()}`
}

function normalizeCombosForItems(combos: SaleComboDraft[], items: Record<string, number>) {
  return combos
    .map((combo) => ({
      ...combo,
      productIds: combo.productIds.filter((productId) => (items[productId] ?? 0) > 0),
    }))
    .filter((combo) => combo.productIds.length >= 2)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: products = [] } = useProducts()
  const [items, setItems] = useState<Record<string, number>>({})
  const [combos, setCombos] = useState<SaleComboDraft[]>([])
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

  useEffect(() => {
    setCombos((current) => normalizeCombosForItems(current, items))
  }, [items])

  const saveCombo = useCallback((combo: Omit<SaleComboDraft, 'id'> & { id?: string }) => {
    const productIds = Array.from(
      new Set(combo.productIds.filter((productId) => (items[productId] ?? 0) > 0)),
    )

    if (productIds.length < 2) return

    const nextCombo: SaleComboDraft = {
      id: combo.id ?? createComboId(),
      name: combo.name.trim() || `Combo ${productIds.length} produtos`,
      productIds,
      discountType: combo.discountType,
      discountValue: roundMoney(Math.max(0, combo.discountValue)),
    }

    setCombos((prev) => {
      const withoutOverlap = prev
        .filter((existing) => existing.id !== nextCombo.id)
        .map((existing) => ({
          ...existing,
          productIds: existing.productIds.filter((productId) => !productIds.includes(productId)),
        }))
        .filter((existing) => existing.productIds.length >= 2)

      return [...withoutOverlap, nextCombo]
    })
  }, [items])

  const removeCombo = useCallback((comboId: string) => {
    setCombos((prev) => prev.filter((combo) => combo.id !== comboId))
  }, [])

  const clearCart = useCallback(() => {
    setItems({})
    setCombos([])
    setStep('produtos')
    setClient(null)
    setPayment(null)
    setIsConfirming(false)
  }, [])

  const resetAfterSale = useCallback(() => {
    setItems({})
    setCombos([])
    setStep('produtos')
    setClient(null)
    setPayment(null)
    setIsConfirming(false)
  }, [])

  const { cartItems, cartCombos } = useMemo(() => {
    const result: CartItem[] = []
    const comboSummaries: CartComboSummary[] = []
    const productMap = new Map(products.map((product) => [product.id, product]))
    const pricedComboLines = new Map<string, {
      combo: SaleComboDraft
      unitPrice: number
      discountAmount: number
      lineTotal: number
    }>()

    for (const combo of combos) {
      const lines = combo.productIds
        .map((productId) => {
          const product = productMap.get(productId)
          const quantity = items[productId] ?? 0
          if (!product || quantity <= 0) return null

          return {
            productId,
            quantity,
            unitPrice: product.price,
          }
        })
        .filter((line) => line !== null)

      if (lines.length < 2) continue

      const pricing = calculateComboPricing(lines, combo.discountType, combo.discountValue)
      comboSummaries.push({
        ...combo,
        originalSubtotal: pricing.originalSubtotal,
        discountAmount: pricing.discountAmount,
        total: pricing.total,
      })

      for (const line of pricing.lines) {
        pricedComboLines.set(line.productId, {
          combo,
          unitPrice: line.unitPriceAfterDiscount,
          discountAmount: line.discountAmount,
          lineTotal: line.subtotalAfterDiscount,
        })
      }
    }

    for (const [id, quantity] of Object.entries(items)) {
      const product = productMap.get(id)
      if (!product || quantity <= 0) continue

      const pricedComboLine = pricedComboLines.get(id)
      const originalSubtotal = roundMoney(product.price * quantity)

      result.push({
        product,
        quantity,
        unitPrice: pricedComboLine?.unitPrice ?? product.price,
        originalUnitPrice: product.price,
        originalSubtotal,
        discountAmount: pricedComboLine?.discountAmount ?? 0,
        lineTotal: pricedComboLine?.lineTotal ?? originalSubtotal,
        comboId: pricedComboLine?.combo.id,
        comboName: pricedComboLine?.combo.name,
        comboDiscountType: pricedComboLine?.combo.discountType,
        comboDiscountValue: pricedComboLine?.combo.discountValue,
      })
    }

    return {
      cartItems: result,
      cartCombos: comboSummaries,
    }
  }, [items, products, combos])

  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, ci) => acc + ci.originalSubtotal, 0),
    [cartItems],
  )

  const cartDiscountTotal = useMemo(
    () => cartItems.reduce((acc, ci) => acc + ci.discountAmount, 0),
    [cartItems],
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((acc, ci) => acc + ci.lineTotal, 0),
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
        combos,
        step,
        client,
        payment,
        isConfirming,
        addItem,
        removeItem,
        saveCombo,
        removeCombo,
        clearCart,
        setStep,
        setClient,
        setPayment,
        setIsConfirming,
        resetAfterSale,
        cartSubtotal,
        cartDiscountTotal,
        cartTotal,
        cartCount,
        cartItems,
        cartCombos,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
