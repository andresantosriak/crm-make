import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'

export function ProfileCard() {
  const { profile, isAdmin } = useAuth()
  const name = profile?.fullName || 'Usuário'
  const initials = getInitials(name)

  return (
    <div
      className="flex items-center gap-3.5 rounded-card-lg p-4"
      style={{
        background: 'linear-gradient(150deg, #2a2116, #201a12)',
        border: '1px solid rgba(200,162,76,.18)',
      }}
    >
      <div
        className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full font-display text-[24px] font-semibold text-gold"
        style={{
          background: 'linear-gradient(135deg, #3a2f20, #241d14)',
          border: '1px solid rgba(200,162,76,.3)',
        }}
      >
        {initials}
      </div>
      <div className="flex-1">
        <p className="text-[16px] font-medium text-text-primary">Studio Bell PG · Make</p>
        <p className="text-[13px] text-text-secondary">
          {name} · {isAdmin ? 'Admin' : 'Funcionário'}
        </p>
      </div>
      <ChevronRight size={18} strokeWidth={1.8} className="text-text-muted" />
    </div>
  )
}
