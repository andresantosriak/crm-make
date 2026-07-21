import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MonthlyGoalControl } from '../MonthlyGoalControl'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  toastSuccess: vi.fn(),
}))

vi.mock('@/hooks/useStoreSettings', () => ({
  useStoreSettings: () => ({ data: { monthlySalesGoal: 1000 } }),
  useUpdateSettings: () => ({
    mutate: mocks.mutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: vi.fn(),
  },
}))

describe('MonthlyGoalControl', () => {
  beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.toastSuccess.mockReset()
  })

  it('should show confirmation when monthly goal is saved', () => {
    mocks.mutate.mockImplementation((_updates, options) => options?.onSuccess?.())

    render(<MonthlyGoalControl />)

    fireEvent.change(screen.getByPlaceholderText('Ex: 10000,00'), {
      target: { value: '2500,50' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(mocks.mutate).toHaveBeenCalledWith(
      { monthly_sales_goal: 2500.5 },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Meta mensal salva')
    expect(screen.getByText('Meta salva com sucesso.')).toBeInTheDocument()
  })
})
