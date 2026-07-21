import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { CartProvider } from '@/contexts/CartContext'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const NewSalePage = lazy(() => import('@/pages/NewSalePage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const StockPage = lazy(() => import('@/pages/StockPage'))
const NewProductPage = lazy(() => import('@/pages/NewProductPage'))
const ClientsPage = lazy(() => import('@/pages/ClientsPage'))
const AlertsPage = lazy(() => import('@/pages/AlertsPage'))
const PromosPage = lazy(() => import('@/pages/PromosPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))

function PageSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-app-bg">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'rgba(200,162,76,.3)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<CartProvider><AppShell /></CartProvider>}>
              <Route index element={<DashboardPage />} />
              <Route path="/vendas" element={<NewSalePage />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="/estoque" element={<StockPage />} />
              <Route path="/produto" element={<NewProductPage />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/avisos" element={<AlertsPage />} />
              <Route path="/promos" element={<PromosPage />} />
              <Route path="/config" element={<SettingsPage />} />

              <Route element={<AdminRoute />}>
                <Route path="/usuarios" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
