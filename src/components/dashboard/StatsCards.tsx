import { useMemo } from 'react'
import { useSales } from '@/hooks/useSales'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { formatCurrency } from '@/lib/utils'

export function StatsCards() {
  const { data: sales = [] } = useSales()
  const { data: settings } = useStoreSettings()

  const monthTotal = useMemo(() => {
    const now = new Date()
    return sales
      .filter((s) => {
        const d = new Date(s.createdAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((acc, s) => acc + s.total, 0)
  }, [sales])

  const monthlyGoal = settings?.monthlySalesGoal ?? 0
  const progress = monthlyGoal > 0
    ? Math.min(100, Math.max(0, Math.round((monthTotal / monthlyGoal) * 100)))
    : 0

  return (
    <div className="mt-3 flex gap-3">
      <div
        className="flex-1 rounded-[16px] bg-card p-[15px]"
        style={{ border: '1px solid rgba(233,220,198,.08)' }}
      >
        <p className="text-[11px] tracking-[.5px] text-text-secondary">Este mês</p>
        <p className="mt-1 text-[20px] font-medium text-text-primary">{formatCurrency(monthTotal)}</p>
      </div>
      <div
        className="flex-1 rounded-[16px] bg-card p-[15px]"
        style={{ border: '1px solid rgba(233,220,198,.08)' }}
      >
        <p className="text-[11px] tracking-[.5px] text-text-secondary">Meta do mês</p>
        <p className="mt-1 text-[20px] font-medium text-text-primary">
          {monthlyGoal > 0 ? `${progress}%` : 'Sem meta'}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-text-secondary">
          {monthlyGoal > 0 ? `${formatCurrency(monthTotal)} de ${formatCurrency(monthlyGoal)}` : 'Configure em Metas'}
        </p>
        <div
          className="mt-2 h-[5px] overflow-hidden rounded-[3px]"
          style={{ background: 'rgba(233,220,198,.10)' }}
        >
          <div
            className="h-full rounded-[3px]"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #b78d3d, #d6b25c)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
