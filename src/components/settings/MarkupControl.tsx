import { Check } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { round90 } from '@/lib/pricing'
import { MARKUP_STEP } from '@/lib/constants'

export function MarkupControl() {
  const { defaultMarkup, setMarkup } = useSettings()

  const exampleCost = 20
  const examplePrice = round90(exampleCost * (1 + defaultMarkup / 100))
  const examplePriceStr = examplePrice.toFixed(2).replace('.', ',')

  return (
    <div
      className="rounded-[16px] bg-card p-4"
      style={{ border: '1px solid rgba(233,220,198,.08)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[14px] text-text-primary">Markup padrão</p>
          <p className="mt-0.5 text-[12px] text-text-secondary">Aplicado ao cadastrar produtos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMarkup(defaultMarkup - MARKUP_STEP)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border text-[20px] text-text-primary cursor-pointer"
            style={{ background: '#2A2219', borderColor: 'rgba(233,220,198,.12)' }}
          >
            −
          </button>
          <span className="min-w-[64px] text-center font-display text-[24px] font-semibold text-gold">
            {defaultMarkup}%
          </span>
          <button
            onClick={() => setMarkup(defaultMarkup + MARKUP_STEP)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border text-[20px] text-gold-light cursor-pointer"
            style={{ background: 'rgba(200,162,76,.16)', borderColor: 'rgba(200,162,76,.3)' }}
          >
            +
          </button>
        </div>
      </div>
      <div
        className="mt-3 flex items-center gap-2 pt-3"
        style={{ borderTop: '1px solid rgba(233,220,198,.06)' }}
      >
        <Check size={15} strokeWidth={1.8} className="text-success" />
        <span className="text-[13px] text-text-secondary">
          Custo R$ 20,00 → venda R$ {examplePriceStr}
        </span>
      </div>
    </div>
  )
}
