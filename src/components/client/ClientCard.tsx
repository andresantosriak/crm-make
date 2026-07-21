import { ChevronRight } from 'lucide-react'
import type { Client, ClientTag } from '@/types'
import { ClientAvatar } from '@/components/client/ClientAvatar'
import { formatCurrency } from '@/lib/utils'

interface ClientCardProps {
  client: Client
  tags?: ClientTag[]
}

function formatLastPurchase(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function ClientCard({ client, tags }: ClientCardProps) {
  return (
    <div
      className="mb-[9px] flex items-center gap-3 rounded-card bg-card p-[13px]"
      style={{ border: '1px solid rgba(233,220,198,.08)' }}
    >
      <ClientAvatar name={client.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-medium text-text-primary">{client.name}</p>
          {tags?.map((tag) => (
            <span
              key={tag.label}
              className="rounded-chip px-[7px] py-0.5 text-[10px] tracking-[.5px]"
              style={{ background: tag.bg, color: tag.color }}
            >
              {tag.label}
            </span>
          ))}
        </div>
        <p className="mt-0.5 text-[12px] text-text-secondary">
          Últ. compra {formatLastPurchase(client.lastPurchase)} · {formatCurrency(client.totalSpent ?? 0)}
        </p>
      </div>
      <ChevronRight size={18} strokeWidth={1.8} className="text-text-muted" />
    </div>
  )
}
