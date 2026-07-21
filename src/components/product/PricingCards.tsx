import { formatCurrency } from '@/lib/utils'

interface PricingCardsProps {
  markup: number
  margin: number
  profit: number
  hasCalc: boolean
}

export function PricingCards({ markup, margin, profit, hasCalc }: PricingCardsProps) {
  const cardStyle = {
    background: 'linear-gradient(150deg, #2a2116, #211a12)',
    border: '1px solid rgba(200,162,76,.22)',
  }

  return (
    <>
      <div className="flex gap-3">
        <div className="flex-1 rounded-[16px] p-4" style={cardStyle}>
          <p className="text-[11px] uppercase tracking-[.8px] text-text-secondary">Markup</p>
          <p className="mt-1 font-display text-[34px] font-semibold leading-[1.1] text-gold">
            {hasCalc ? `${Math.round(markup)}%` : '—'}
          </p>
          <p className="mt-0.5 text-[11px] text-text-secondary">sobre o custo</p>
        </div>
        <div className="flex-1 rounded-[16px] p-4" style={cardStyle}>
          <p className="text-[11px] uppercase tracking-[.8px] text-text-secondary">Margem</p>
          <p className="mt-1 font-display text-[34px] font-semibold leading-[1.1] text-success">
            {hasCalc ? `${Math.round(margin)}%` : '—'}
          </p>
          <p className="mt-0.5 text-[11px] text-text-secondary">sobre a venda</p>
        </div>
      </div>

      <div
        className="flex items-center justify-between rounded-card bg-card px-4 py-3.5"
        style={{ border: '1px solid rgba(233,220,198,.08)' }}
      >
        <span className="text-[13px] text-text-secondary">Lucro por unidade</span>
        <span className="text-[16px] font-semibold text-text-primary">
          {hasCalc ? formatCurrency(profit) : '—'}
        </span>
      </div>
    </>
  )
}
