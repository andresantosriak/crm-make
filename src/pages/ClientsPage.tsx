import { Trash2 } from 'lucide-react'
import { useClients, useSoftDeleteClient } from '@/hooks/useClients'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { useAuth } from '@/hooks/useAuth'
import { ClientCard } from '@/components/client/ClientCard'
import { getClientTags } from '@/lib/client-utils'

export default function ClientsPage() {
  const { isAdmin } = useAuth()
  const { data: clients = [], isPending } = useClients()
  const { data: settings } = useStoreSettings()
  const softDelete = useSoftDeleteClient()

  const vipThreshold = settings?.vipThreshold ?? 500
  const birthdayAlertDays = settings?.birthdayAlertDays ?? 7

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <div className="flex items-center justify-between py-2 pb-3.5">
        <div>
          <h1 className="font-display text-[28px] font-medium text-text-primary">Clientes</h1>
          <p className="text-[13px] text-text-secondary">{clients.length} cadastrados</p>
        </div>
      </div>

      {isPending ? (
        <div className="flex justify-center py-10">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'rgba(200,162,76,.3)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        clients.map((client) => {
          const tags = getClientTags(client.birthday, client.totalSpent ?? 0, vipThreshold, birthdayAlertDays)
          return (
            <div key={client.id} className="flex items-center gap-1">
              <div className="flex-1">
                <ClientCard client={client} tags={tags} />
              </div>
              {isAdmin && (
                <button
                  onClick={() => softDelete.mutate(client.id)}
                  disabled={softDelete.isPending}
                  className="mb-[9px] flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] border-none bg-transparent cursor-pointer disabled:opacity-40"
                  title="Excluir cliente"
                >
                  <Trash2 size={16} strokeWidth={1.6} className="text-danger" />
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
