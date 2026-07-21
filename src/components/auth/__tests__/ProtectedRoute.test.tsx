import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'

const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderWithRouter(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route path="/estoque" element={<div>Estoque</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading spinner when isLoading is true', () => {
    mockUseAuth.mockReturnValue({ session: null, isLoading: true })
    renderWithRouter()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should redirect to /login when no session after loading', () => {
    mockUseAuth.mockReturnValue({ session: null, isLoading: false })
    renderWithRouter()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('should render outlet content when session exists', () => {
    mockUseAuth.mockReturnValue({ session: { access_token: 'test' }, isLoading: false })
    renderWithRouter()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
