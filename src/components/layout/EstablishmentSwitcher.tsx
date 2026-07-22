import { Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEstablishments } from '@/hooks/useEstablishments'

export function EstablishmentSwitcher() {
  const { isSuperAdmin, selectedEstablishmentId, setSelectedEstablishmentId } = useAuth()
  const { data: establishments = [] } = useEstablishments({ enabled: isSuperAdmin })

  if (!isSuperAdmin) return null

  return (
    <div className="px-5 pt-3">
      <label
        className="flex items-center gap-2 rounded-card bg-card px-3.5 py-2.5"
        style={{ border: '1px solid rgba(233,220,198,.08)' }}
      >
        <Building2 size={17} className="shrink-0 text-gold" />
        <select
          value={selectedEstablishmentId ?? ''}
          onChange={(event) => setSelectedEstablishmentId(event.target.value || null)}
          className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-medium text-text-primary outline-none"
        >
          <option value="">Todos os estabelecimentos</option>
          {establishments.map((establishment) => (
            <option key={establishment.id} value={establishment.id}>
              {establishment.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
