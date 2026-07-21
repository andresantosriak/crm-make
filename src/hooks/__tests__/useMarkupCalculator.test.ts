import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMarkupCalculator } from '../useMarkupCalculator'

describe('useMarkupCalculator', () => {
  it('should calculate markup, margin, profit for cost=20 price=55.90', () => {
    const { result } = renderHook(() => useMarkupCalculator(20, 55.90))
    expect(result.current.markup).toBeCloseTo(179.5, 0)
    expect(result.current.margin).toBeCloseTo(64.2, 0)
    expect(result.current.profit).toBeCloseTo(35.90)
  })

  it('should return markup 0 when cost is 0', () => {
    const { result } = renderHook(() => useMarkupCalculator(0, 55.90))
    expect(result.current.markup).toBe(0)
  })

  it('should return margin 0 when price is 0', () => {
    const { result } = renderHook(() => useMarkupCalculator(20, 0))
    expect(result.current.margin).toBe(0)
  })

  it('should calculate profit = price - cost', () => {
    const { result } = renderHook(() => useMarkupCalculator(45, 119.90))
    expect(result.current.profit).toBeCloseTo(74.90)
  })
})
