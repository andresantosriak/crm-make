import { useSettings } from '@/hooks/useSettings'
import { useAuth } from '@/hooks/useAuth'
import { ToggleSwitch } from '@/components/shared/ToggleSwitch'

const toggleDefs = [
  { key: 'promos' as const, label: 'Sugestões de promoção' },
  { key: 'estoque' as const, label: 'Alertas de estoque baixo' },
  { key: 'aniv' as const, label: 'Aniversários de clientes' },
  { key: 'resumo' as const, label: 'Resumo diário por e-mail' },
]

export function ToggleGroup() {
  const { toggles, toggleSetting } = useSettings()
  const { isAdmin, isSuperAdmin, selectedEstablishmentId } = useAuth()
  const canEdit = isAdmin && (!isSuperAdmin || !!selectedEstablishmentId)

  return (
    <div
      className="overflow-hidden rounded-[16px] bg-card"
      style={{ border: '1px solid rgba(233,220,198,.08)' }}
    >
      {toggleDefs.map((t) => (
        <div
          key={t.key}
          className="flex items-center justify-between px-4 py-[15px]"
          style={{
            borderBottom: '1px solid rgba(233,220,198,.06)',
            opacity: canEdit ? 1 : 0.5,
          }}
        >
          <span className="text-[14px] text-text-primary">{t.label}</span>
          <ToggleSwitch
            checked={toggles[t.key]}
            onChange={canEdit ? () => toggleSetting(t.key) : undefined}
            disabled={!canEdit}
          />
        </div>
      ))}
    </div>
  )
}
