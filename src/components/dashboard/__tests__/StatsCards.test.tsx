import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StatsCards } from '../StatsCards'

const state = vi.hoisted(() => ({
  sales: [] as Array<{ total: number; createdAt: string }>,
  monthlySalesGoal: 0,
}))

vi.mock('@/hooks/useSales', () => ({
  useSales: () => ({ data: state.sales }),
}))

vi.mock('@/hooks/useStoreSettings', () => ({
  useStoreSettings: () => ({ data: { monthlySalesGoal: state.monthlySalesGoal } }),
}))

function currentMonthIso(day: number) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), day, 10).toISOString()
}

describe('StatsCards', () => {
  beforeEach(() => {
    state.sales = []
    state.monthlySalesGoal = 0
  })

  it('should calculate monthly goal progress from real sales', () => {
    state.monthlySalesGoal = 1000
    state.sales = [
      { total: 150, createdAt: currentMonthIso(1) },
      { total: 100, createdAt: currentMonthIso(2) },
      { total: 999, createdAt: '2026-01-01T10:00:00.000Z' },
    ]

    render(<StatsCards />)

    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText(/250,00.*1.000,00/)).toBeInTheDocument()
  })

  it('should not show a fake goal when no monthly goal is configured', () => {
    state.monthlySalesGoal = 0
    state.sales = [{ total: 250, createdAt: currentMonthIso(1) }]

    render(<StatsCards />)

    expect(screen.getByText('Sem meta')).toBeInTheDocument()
    expect(screen.getByText('Configure em Metas')).toBeInTheDocument()
  })
})
