import { useState, useCallback, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { session, isLoading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setError(null)
    setSubmitting(true)

    const { error } = await signIn(email.trim(), password)

    if (error) {
      setError(error)
      toast.error(error)
      setSubmitting(false)
    }
  }, [email, password, signIn])

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-app-bg">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'rgba(200,162,76,.3)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (session) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-dvh flex-col justify-center px-[34px] py-10 animate-fadeup bg-app-bg">
      <div
        className="mx-auto mb-[26px] flex h-[82px] w-[82px] items-center justify-center rounded-full"
        style={{
          border: '1px solid rgba(200,162,76,.4)',
          background: 'radial-gradient(circle at 30% 25%, rgba(200,162,76,.16), transparent 70%)',
        }}
      >
        <span className="font-display text-[32px] font-semibold text-gold tracking-[1px]">
          PG
        </span>
      </div>

      <h1 className="text-center font-display text-[32px] font-medium text-text-primary tracking-[.5px]">
        Studio Bell PG
      </h1>
      <p className="mt-1.5 text-center text-[13px] font-light uppercase tracking-[2px] text-text-secondary">
        Make
      </p>

      <form onSubmit={handleSubmit} className="mt-[38px] flex flex-col gap-3.5">
        <div className="flex flex-col gap-[7px]">
          <label className="text-[11px] uppercase tracking-[1.2px] text-text-secondary">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            className="rounded-input bg-card px-4 py-3.5 text-[15px] text-text-primary outline-none"
            style={{ border: '1px solid rgba(233,220,198,.10)' }}
          />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label className="text-[11px] uppercase tracking-[1.2px] text-text-secondary">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
            className="rounded-input bg-card px-4 py-3.5 text-[15px] text-text-primary outline-none"
            style={{ border: '1px solid rgba(233,220,198,.10)' }}
          />
        </div>

        {error && (
          <p className="text-center text-[13px] text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-[12px] rounded-[14px] border-none px-4 py-4 text-[15px] font-semibold tracking-[.4px] cursor-pointer disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
            color: '#1a1408',
            boxShadow: '0 8px 24px rgba(200,162,76,.22)',
          }}
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>

        <button
          type="button"
          disabled
          className="mt-1 border-none bg-transparent text-[13px] tracking-[.3px] text-text-muted cursor-not-allowed opacity-50"
          title="Em breve"
        >
          Entrar com biometria
        </button>
      </form>
    </div>
  )
}
