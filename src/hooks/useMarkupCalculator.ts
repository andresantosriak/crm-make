import { useMemo } from 'react'

export function useMarkupCalculator(cost: number, price: number) {
  return useMemo(() => {
    const markup = cost > 0 ? ((price - cost) / cost) * 100 : 0
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0
    const profit = price - cost
    return { markup, margin, profit }
  }, [cost, price])
}
