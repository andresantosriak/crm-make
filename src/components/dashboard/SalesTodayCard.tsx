import { useNavigate } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { formatCurrency } from '@/lib/utils'

export function SalesTodayCard() {
  const navigate = useNavigate()
  const { todayTotal, todayCount } = useData()

  const ticketMedio = todayCount > 0 ? todayTotal / todayCount : 0

  return (
    <button
      onClick={() => navigate('/historico')}
      className="w-full text-left overflow-hidden relative cursor-pointer"
      style={{
        background: 'linear-gradient(150deg, #2a2116, #201a12)',
        border: '1px solid rgba(200,162,76,.18)',
        borderRadius: 20,
        padding: 22,
      }}
    >
      <div
        className="absolute"
        style={{
          right: -30,
          top: -30,
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,162,76,.14), transparent 70%)',
        }}
      />
      <div className="flex items-center justify-between">
        <p className="text-[12px] uppercase tracking-[1px] text-text-secondary">
          Vendas de hoje
        </p>
        <span className="text-[12px] text-gold-light">Ver histórico →</span>
      </div>
      <p className="mt-1 font-display text-[42px] font-semibold leading-[1.1] text-text-primary">
        {formatCurrency(todayTotal)}
      </p>
      <div className="mt-2 flex gap-[18px] text-[13px] text-text-secondary">
        <span>{todayCount} vendas</span>
        <span style={{ color: 'rgba(233,220,198,.25)' }}>•</span>
        <span>Ticket médio {formatCurrency(ticketMedio)}</span>
      </div>
    </button>
  )
}
