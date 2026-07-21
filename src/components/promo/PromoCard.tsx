import type { Promo } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface PromoCardProps {
  promo: Promo
}

export function PromoCard({ promo }: PromoCardProps) {
  const hasWhatsapp = promo.actions.includes('whatsapp')
  const hasPricing = promo.price != null

  return (
    <div
      className="rounded-[16px] bg-card p-4"
      style={{
        border: hasPricing
          ? '1px solid rgba(200,162,76,.18)'
          : '1px solid rgba(233,220,198,.08)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[16px] font-medium text-text-primary">{promo.title}</p>
          <p className="mt-0.5 text-[13px] text-text-secondary">{promo.subtitle}</p>
        </div>
        <span
          className="shrink-0 rounded-chip px-[9px] py-1 text-[11px] tracking-[.5px]"
          style={{ background: promo.badge.bg, color: promo.badge.color }}
        >
          {promo.badge.label}
        </span>
      </div>

      {hasPricing && promo.price != null && promo.originalPrice != null && promo.savings != null && (
        <div className="mt-3 flex items-baseline gap-2.5">
          <span className="font-display text-[26px] font-semibold text-text-primary">
            {formatCurrency(promo.price)}
          </span>
          <span className="text-[15px] text-text-muted line-through">
            {formatCurrency(promo.originalPrice)}
          </span>
          <span className="text-[13px] text-success">
            economia {formatCurrency(promo.savings)}
          </span>
        </div>
      )}

      <div className="mt-3.5 flex gap-2.5">
        {hasWhatsapp ? (
          <button
            className="flex-1 rounded-tile border-none px-3 py-3 text-[14px] font-semibold cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
              color: '#1a1408',
            }}
          >
            Enviar por WhatsApp
          </button>
        ) : (
          <>
            <button
              className="flex-1 rounded-tile border-none px-3 py-3 text-[14px] font-semibold cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
                color: '#1a1408',
              }}
            >
              Publicar
            </button>
            <button
              className="rounded-tile border px-4 py-3 text-[14px] text-text-primary cursor-pointer"
              style={{ background: '#2A2219', borderColor: 'rgba(233,220,198,.12)' }}
            >
              Editar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
