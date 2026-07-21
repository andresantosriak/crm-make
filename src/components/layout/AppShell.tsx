import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { HIDDEN_NAV_ROUTES } from '@/lib/constants'

export function AppShell() {
  const location = useLocation()
  const hideNav = HIDDEN_NAV_ROUTES.includes(location.pathname)

  return (
    <div className="min-h-dvh bg-app-bg" style={{ paddingBottom: hideNav ? 40 : 110 }}>
      <Outlet />
      {!hideNav && <BottomNav />}
    </div>
  )
}
