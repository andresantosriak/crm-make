import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AdminRoute } from '../AdminRoute'

const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/" element={<div>Dashboard</div>} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Admin Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading spinner when isLoading is true', () => {
    mockUseAuth.mockReturnValue({ isAdmin: false, isLoading: true })
    renderWithRouter()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should redirect to / when not admin', () => {
    mockUseAuth.mockReturnValue({ isAdmin: false, isLoading: false })
    renderWithRouter()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should render outlet content when admin', () => {
    mockUseAuth.mockReturnValue({ isAdmin: true, isLoading: false })
    renderWithRouter()
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })
})
