import { describe, expect, it } from 'vitest'
import { calculateComboPricing } from '../cart-combos'

describe('cart-combos', () => {
  it('should apply percent discount proportionally', () => {
    const result = calculateComboPricing([
      { productId: 'p1', quantity: 1, unitPrice: 100 },
      { productId: 'p2', quantity: 1, unitPrice: 50 },
    ], 'percent', 10)

    expect(result.originalSubtotal).toBe(150)
    expect(result.discountAmount).toBe(15)
    expect(result.total).toBe(135)
    expect(result.lines[0]?.unitPriceAfterDiscount).toBe(90)
    expect(result.lines[1]?.unitPriceAfterDiscount).toBe(45)
  })

  it('should cap fixed discount to keep every unit positive', () => {
    const result = calculateComboPricing([
      { productId: 'p1', quantity: 1, unitPrice: 20 },
      { productId: 'p2', quantity: 1, unitPrice: 10 },
    ], 'fixed', 50)

    expect(result.total).toBe(0.02)
    expect(result.discountAmount).toBe(29.98)
    expect(result.lines.every((line) => line.unitPriceAfterDiscount >= 0.01)).toBe(true)
  })
})
