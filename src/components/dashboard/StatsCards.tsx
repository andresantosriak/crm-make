import { useMemo } from 'react'
import { useSales } from '@/hooks/useSales'
import { formatCurrency } from '@/lib/utils'

export function StatsCards() {
  const { data: sales = [] } = useSales()

  const monthTotal = useMemo(() => {
    const now = new Date()
    return sales
      .filter((s) => {
        const d = new Date(s.createdAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((acc, s) => acc + s.total, 0)
  }, [sales])

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
        <p className="mt-1 text-[20px] font-medium text-text-primary">68%</p>
        <div
          className="mt-2 h-[5px] overflow-hidden rounded-[3px]"
          style={{ background: 'rgba(233,220,198,.10)' }}
        >
          <div
            className="h-full rounded-[3px]"
            style={{
              width: '68%',
              background: 'linear-gradient(90deg, #b78d3d, #d6b25c)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
