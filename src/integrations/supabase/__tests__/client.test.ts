import { describe, it, expect, vi, afterEach } from 'vitest'

describe('Supabase client — env guard', () => {
  const originalEnv = { ...import.meta.env }

  afterEach(() => {
    vi.resetModules()
    Object.assign(import.meta.env, originalEnv)
  })

  it('should throw when VITE_SUPABASE_URL is missing', async () => {
    import.meta.env.VITE_SUPABASE_URL = ''
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_test_key'

    await expect(
      import('../client')
    ).rejects.toThrow('VITE_SUPABASE_URL')
  })

  it('should throw when VITE_SUPABASE_PUBLISHABLE_KEY is missing', async () => {
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = ''

    await expect(
      import('../client')
    ).rejects.toThrow('VITE_SUPABASE_URL')
  })

  it('should create client when both vars are present', async () => {
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_test_key_1234'

    const { supabase } = await import('../client')
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })
})
