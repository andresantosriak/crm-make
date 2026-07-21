import { useNavigate } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { useSales, useCancelSale } from '@/hooks/useSales'
import { useClients } from '@/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { BackButton } from '@/components/shared/BackButton'
import { ClientAvatar } from '@/components/client/ClientAvatar'
import { formatCurrency, shortPayment } from '@/lib/utils'
import { getClientName } from '@/lib/client-utils'

function formatSaleDate(createdAt: string): { date: string; time: string } {
  const d = new Date(createdAt)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  const date = isToday ? 'Hoje' : isYesterday ? 'Ontem' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  return { date, time }
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: sales = [], isPending: salesLoading } = useSales()
  const { data: clients = [] } = useClients()
  const cancelSale = useCancelSale()

  const todaySales = sales.filter((s) => {
    const d = new Date(s.createdAt)
    return d.toDateString() === new Date().toDateString()
  })
  const todayTotal = todaySales.reduce((acc, s) => acc + s.total, 0)
  const todayCount = todaySales.length

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <div className="flex items-center gap-3 py-2 pb-4">
        <BackButton onClick={() => navigate('/vendas')} />
        <h1 className="font-display text-[28px] font-medium text-text-primary">Histórico</h1>
      </div>

      <div className="mb-5 flex gap-3">
        <div
          className="flex-1 rounded-[16px] p-[15px]"
          style={{
            background: 'linear-gradient(150deg, #2a2116, #201a12)',
            border: '1px solid rgba(200,162,76,.18)',
          }}
        >
          <p className="text-[11px] tracking-[.5px] text-text-secondary">Hoje</p>
          <p className="mt-0.5 font-display text-[24px] font-semibold text-text-primary">
            {formatCurrency(todayTotal)}
          </p>
          <p className="text-[12px] text-text-secondary">{todayCount} vendas</p>
        </div>
        <div
          className="flex-1 rounded-[16px] bg-card p-[15px]"
          style={{ border: '1px solid rgba(233,220,198,.08)' }}
        >
          <p className="text-[11px] tracking-[.5px] text-text-secondary">Este mês</p>
          <p className="mt-0.5 font-display text-[24px] font-semibold text-text-primary">
            {formatCurrency(
              sales
                .filter((s) => {
                  const d = new Date(s.createdAt)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                })
                .reduce((acc, s) => acc + s.total, 0),
            )}
          </p>
        </div>
      </div>

      {salesLoading ? (
        <div className="flex justify-center py-10">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'rgba(200,162,76,.3)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        sales.map((sale) => {
          const clientName = getClientName(sale.clientId, clients)
          const { date, time } = formatSaleDate(sale.createdAt)
          return (
            <div
              key={sale.id}
              className="mb-[9px] flex items-center gap-3 rounded-card bg-card p-[13px]"
              style={{ border: '1px solid rgba(233,220,198,.08)' }}
            >
              <ClientAvatar name={clientName} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-text-primary">{clientName}</p>
                <p className="text-[12px] text-text-secondary">
                  {sale.itemsCount} {sale.itemsCount > 1 ? 'itens' : 'item'} · {shortPayment(sale.paymentMethod)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-semibold text-text-primary">
                  {formatCurrency(sale.total)}
                </p>
                <p className="text-[11px] text-text-muted">
                  {date} · {time}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => cancelSale.mutate(sale.id)}
                  disabled={cancelSale.isPending}
                  className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] border-none bg-transparent cursor-pointer disabled:opacity-40"
                  title="Estornar venda"
                >
                  <RotateCcw size={15} strokeWidth={1.6} className="text-danger" />
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
