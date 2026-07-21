import { useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useClients } from '@/hooks/useClients'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { daysUntilBirthday } from '@/lib/client-utils'
import type { Alert } from '@/types'

export function useAlerts(): { alerts: Alert[]; isPending: boolean } {
  const { data: products = [], isPending: productsLoading } = useProducts()
  const { data: clients = [], isPending: clientsLoading } = useClients()
  const { data: settings } = useStoreSettings()

  const lowStockThreshold = settings?.lowStockThreshold ?? 5
  const birthdayAlertDays = settings?.birthdayAlertDays ?? 7

  const alerts = useMemo(() => {
    const result: Alert[] = []

    for (const p of products) {
      if (p.active && p.stock <= lowStockThreshold) {
        result.push({
          kind: 'Estoque',
          dot: '#D07C67',
          text: `${p.name} está com apenas ${p.stock} ${p.stock === 1 ? 'unidade' : 'unidades'} em estoque.`,
          when: 'Agora',
        })
      }
    }

    for (const c of clients) {
      if (!c.birthday) continue
      const days = daysUntilBirthday(c.birthday)
      if (days <= birthdayAlertDays) {
        const when = days === 0 ? 'Hoje' : days === 1 ? 'Amanhã' : `Em ${days} dias`
        result.push({
          kind: 'Cliente',
          dot: '#8FA98A',
          text: `${c.name} faz aniversário ${when.toLowerCase()}. Envie uma mensagem especial!`,
          when,
        })
      }
    }

    result.push({
      kind: 'Sophia · IA',
      dot: '#C8A24C',
      text: 'Paleta Nude Sunset está parada há 21 dias. Que tal um combo pra girar o estoque?',
      when: 'Sugestão',
    })

    return result
  }, [products, clients, lowStockThreshold, birthdayAlertDays])

  return { alerts, isPending: productsLoading || clientsLoading }
}
