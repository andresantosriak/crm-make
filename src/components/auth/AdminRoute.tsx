import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AdminRoute() {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-app-bg">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'rgba(200,162,76,.3)', borderTopColor: 'transparent' }}
          />
          <p className="text-[13px] text-text-secondary">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
