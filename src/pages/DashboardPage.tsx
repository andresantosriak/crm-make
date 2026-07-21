import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'
import { SalesTodayCard } from '@/components/dashboard/SalesTodayCard'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { SophiaSuggestions } from '@/components/dashboard/SophiaSuggestions'
import { LowStockSection } from '@/components/dashboard/LowStockSection'

function formatDate(): string {
  const now = new Date()
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Usuário'
  const initials = getInitials(profile?.fullName ?? 'U')

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <div className="flex items-center justify-between py-2 pb-[18px]">
        <div>
          <p className="text-[12px] tracking-[.6px] text-text-secondary">{formatDate()}</p>
          <h1 className="mt-0.5 font-display text-[28px] font-medium text-text-primary">
            Olá, {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/avisos')}
            className="relative flex h-[42px] w-[42px] items-center justify-center rounded-input bg-card cursor-pointer"
            style={{ border: '1px solid rgba(233,220,198,.10)' }}
          >
            <Bell size={19} strokeWidth={1.7} className="text-text-primary" />
            <span
              className="absolute rounded-full bg-danger"
              style={{ top: 9, right: 10, width: 8, height: 8, border: '2px solid #221C15' }}
            />
          </button>
          <div
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-[15px] font-medium text-gold"
            style={{
              background: 'linear-gradient(135deg, #3a2f20, #241d14)',
              border: '1px solid rgba(200,162,76,.3)',
            }}
          >
            {initials}
          </div>
        </div>
      </div>

      <SalesTodayCard />
      <StatsCards />
      <QuickActions />
      <SophiaSuggestions />
      <LowStockSection />
    </div>
  )
}
