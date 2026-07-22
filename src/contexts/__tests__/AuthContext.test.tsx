import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

const mockGetSession = vi.fn()
const mockGetUser = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockSignIn = vi.fn()
const mockSignOut = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      getUser: () => mockGetUser(),
      onAuthStateChange: () => mockOnAuthStateChange(),
      signInWithPassword: (creds: unknown) => mockSignIn(creds),
      signOut: () => mockSignOut(),
    },
    from: () => mockFrom(),
  },
}))

vi.mock('@/lib/mappers', () => ({
  toProfile: (data: Record<string, unknown>) => ({
    id: data.id,
    fullName: data.full_name,
    role: data.role,
  }),
}))

import { AuthProvider, useAuth } from '../AuthContext'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext — isAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  it('should have isAdmin=false when no user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAdmin).toBe(false)
  })

  it('should have isAdmin=true when app_metadata.role is admin', async () => {
    const adminUser = {
      id: 'admin-123',
      app_metadata: { role: 'admin' },
    }
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test', user: adminUser } },
    })
    mockGetUser.mockResolvedValue({ data: { user: adminUser } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { id: 'admin-123', full_name: 'Admin', role: 'admin' },
              error: null,
            }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAdmin).toBe(true)
  })

  it('should have isAdmin=false when app_metadata.role is employee', async () => {
    const empUser = {
      id: 'emp-123',
      app_metadata: { role: 'employee' },
    }
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test', user: empUser } },
    })
    mockGetUser.mockResolvedValue({ data: { user: empUser } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { id: 'emp-123', full_name: 'Func', role: 'employee' },
              error: null,
            }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAdmin).toBe(false)
  })

  it('should have isAdmin=false when no app_metadata.role', async () => {
    const noRoleUser = {
      id: 'norole-123',
      app_metadata: {},
    }
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test', user: noRoleUser } },
    })
    mockGetUser.mockResolvedValue({ data: { user: noRoleUser } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { id: 'norole-123', full_name: 'Test', role: 'employee' },
              error: null,
            }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAdmin).toBe(false)
  })
})

describe('AuthContext — profile fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  it('should handle missing profile gracefully', async () => {
    const user = { id: 'test-123', app_metadata: {} }
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test', user } },
    })
    mockGetUser.mockResolvedValue({ data: { user } })
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: null, error: { message: 'not found' } }),
        }),
      }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.profile).toBeNull()
    expect(result.current.user).toBeDefined()
  })

  it('should clear invalid stored session', async () => {
    const staleUser = { id: 'stale-123', app_metadata: {} }
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'stale', user: staleUser } },
    })
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid JWT' },
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockSignOut).toHaveBeenCalled()
    expect(result.current.session).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })
})
