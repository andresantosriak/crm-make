import { useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useClients } from '@/hooks/useClients'
import { useSales } from '@/hooks/useSales'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { getClientName } from '@/lib/client-utils'

export function useData() {
  const { data: products = [], isPending: productsLoading } = useProducts()
  const { data: clients = [], isPending: clientsLoading } = useClients()
  const { data: sales = [], isPending: salesLoading } = useSales()
  const { data: settings } = useStoreSettings()

  const lowStockThreshold = settings?.lowStockThreshold ?? 5

  const todaySales = useMemo(() => {
    const now = new Date()
    return sales.filter((s) => {
      const d = new Date(s.createdAt)
      return d.toDateString() === now.toDateString()
    })
  }, [sales])

  const todayTotal = useMemo(() => todaySales.reduce((acc, s) => acc + s.total, 0), [todaySales])
  const todayCount = todaySales.length

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.active && p.stock <= lowStockThreshold),
    [products, lowStockThreshold],
  )

  return {
    products,
    productsLoading,
    clients,
    clientsLoading,
    sales,
    salesLoading,
    getClientName: (clientId: string | null) => getClientName(clientId, clients),
    todaySales,
    todayTotal,
    todayCount,
    lowStockProducts,
  }
}
