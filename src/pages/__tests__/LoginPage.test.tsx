import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

async function renderLogin() {
  const LoginPage = (await import('../LoginPage')).default
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show spinner when isLoading is true', async () => {
    mockUseAuth.mockReturnValue({ session: null, isLoading: true, signIn: vi.fn() })
    await renderLogin()
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument()
  })

  it('should redirect to / when session exists', async () => {
    mockUseAuth.mockReturnValue({
      session: { access_token: 'test' },
      isLoading: false,
      signIn: vi.fn(),
    })
    await renderLogin()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should not call signIn with empty email', async () => {
    const signIn = vi.fn()
    mockUseAuth.mockReturnValue({ session: null, isLoading: false, signIn })
    await renderLogin()

    const user = userEvent.setup()
    const passwordInput = screen.getByPlaceholderText('Sua senha')
    await user.type(passwordInput, 'somepassword')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(signIn).not.toHaveBeenCalled()
  })

  it('should not call signIn with empty password', async () => {
    const signIn = vi.fn()
    mockUseAuth.mockReturnValue({ session: null, isLoading: false, signIn })
    await renderLogin()

    const user = userEvent.setup()
    const emailInput = screen.getByPlaceholderText('seu@email.com')
    await user.type(emailInput, 'test@test.com')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(signIn).not.toHaveBeenCalled()
  })

  it('should call signIn with trimmed email on submit', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null })
    mockUseAuth.mockReturnValue({ session: null, isLoading: false, signIn })
    await renderLogin()

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('seu@email.com'), '  test@test.com  ')
    await user.type(screen.getByPlaceholderText('Sua senha'), 'password123')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(signIn).toHaveBeenCalledWith('test@test.com', 'password123')
  })

  it('should show error message on signIn failure', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: 'Email ou senha incorretos' })
    mockUseAuth.mockReturnValue({ session: null, isLoading: false, signIn })
    await renderLogin()

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('seu@email.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('Sua senha'), 'wrong')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByText('Email ou senha incorretos')).toBeInTheDocument()
  })

  it('should have biometria button disabled', async () => {
    mockUseAuth.mockReturnValue({ session: null, isLoading: false, signIn: vi.fn() })
    await renderLogin()
    const bioBtn = screen.getByText('Entrar com biometria')
    expect(bioBtn).toBeDisabled()
  })
})
