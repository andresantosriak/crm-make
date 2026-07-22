import type { ComboDiscountType } from '@/types'

export interface ComboLineInput {
  productId: string
  quantity: number
  unitPrice: number
}

export interface PricedComboLine extends ComboLineInput {
  originalSubtotal: number
  unitPriceAfterDiscount: number
  subtotalAfterDiscount: number
  discountAmount: number
}

export interface ComboPricingResult {
  originalSubtotal: number
  discountAmount: number
  total: number
  lines: PricedComboLine[]
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function getRequestedDiscount(
  subtotal: number,
  quantity: number,
  discountType: ComboDiscountType,
  discountValue: number,
) {
  if (discountValue <= 0) return 0

  const maxDiscount = Math.max(0, roundMoney(subtotal - quantity * 0.01))
  const requested = discountType === 'percent'
    ? roundMoney(subtotal * Math.min(discountValue, 99) / 100)
    : roundMoney(discountValue)

  return roundMoney(Math.min(requested, maxDiscount))
}

function allocateDiscount(lines: ComboLineInput[], discountAmount: number) {
  const allocations = new Map<string, number>()
  const subtotal = roundMoney(lines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0))
  let remaining = discountAmount

  lines.forEach((line, index) => {
    const lineSubtotal = roundMoney(line.quantity * line.unitPrice)
    const maxLineDiscount = Math.max(0, roundMoney(lineSubtotal - line.quantity * 0.01))
    const proportional = index === lines.length - 1
      ? remaining
      : roundMoney(discountAmount * lineSubtotal / subtotal)
    const allocated = roundMoney(Math.min(proportional, maxLineDiscount, remaining))

    allocations.set(line.productId, allocated)
    remaining = roundMoney(remaining - allocated)
  })

  if (remaining > 0) {
    for (const line of lines) {
      if (remaining <= 0) break

      const lineSubtotal = roundMoney(line.quantity * line.unitPrice)
      const maxLineDiscount = Math.max(0, roundMoney(lineSubtotal - line.quantity * 0.01))
      const current = allocations.get(line.productId) ?? 0
      const room = roundMoney(maxLineDiscount - current)
      if (room <= 0) continue

      const extra = roundMoney(Math.min(room, remaining))
      allocations.set(line.productId, roundMoney(current + extra))
      remaining = roundMoney(remaining - extra)
    }
  }

  return allocations
}

export function calculateComboPricing(
  inputLines: ComboLineInput[],
  discountType: ComboDiscountType,
  discountValue: number,
): ComboPricingResult {
  const lines = inputLines.filter((line) => line.quantity > 0 && line.unitPrice > 0)
  const originalSubtotal = roundMoney(
    lines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0),
  )
  const quantity = lines.reduce((acc, line) => acc + line.quantity, 0)
  const requestedDiscount = getRequestedDiscount(originalSubtotal, quantity, discountType, discountValue)
  const allocations = allocateDiscount(lines, requestedDiscount)

  const pricedLines = lines.map((line) => {
    const originalLineSubtotal = roundMoney(line.quantity * line.unitPrice)
    const allocatedDiscount = allocations.get(line.productId) ?? 0
    const unitPriceAfterDiscount = roundMoney(
      (originalLineSubtotal - allocatedDiscount) / line.quantity,
    )
    const subtotalAfterDiscount = roundMoney(unitPriceAfterDiscount * line.quantity)

    return {
      ...line,
      originalSubtotal: originalLineSubtotal,
      unitPriceAfterDiscount,
      subtotalAfterDiscount,
      discountAmount: roundMoney(originalLineSubtotal - subtotalAfterDiscount),
    }
  })

  const total = roundMoney(pricedLines.reduce((acc, line) => acc + line.subtotalAfterDiscount, 0))

  return {
    originalSubtotal,
    discountAmount: roundMoney(originalSubtotal - total),
    total,
    lines: pricedLines,
  }
}
