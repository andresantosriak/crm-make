import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { PaymentMethod } from '@/types'

interface SaleSuccessOverlayProps {
  total: number
  clientName: string
  payment: PaymentMethod
  onNewSale: () => void
}

export function SaleSuccessOverlay({ total, clientName, payment, onNewSale }: SaleSuccessOverlayProps) {
  const navigate = useNavigate()

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-10 animate-fadeup"
      style={{
        background: 'rgba(12,10,8,.86)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="flex h-[88px] w-[88px] items-center justify-center rounded-full animate-pop"
        style={{
          background: 'radial-gradient(circle at 30% 25%, rgba(143,169,138,.3), transparent 70%)',
          border: '1px solid rgba(143,169,138,.5)',
        }}
      >
        <Check size={40} strokeWidth={2} className="text-success" />
      </div>
      <h2 className="mt-5 font-display text-[28px] text-text-primary">Venda registrada</h2>
      <p className="mt-0.5 font-display text-[34px] font-semibold text-gold">{formatCurrency(total)}</p>
      <div className="mt-[18px] flex flex-col items-center gap-1.5">
        <p className="text-[14px] text-text-secondary">
          Cliente · <span className="text-text-primary">{clientName}</span>
        </p>
        <p className="text-[14px] text-text-secondary">
          Pagamento · <span className="text-text-primary">{payment}</span>
        </p>
      </div>
      <button
        onClick={onNewSale}
        className="mt-[26px] rounded-input border bg-card px-[26px] py-[13px] text-[14px] text-text-primary cursor-pointer"
        style={{ borderColor: 'rgba(233,220,198,.14)' }}
      >
        Nova venda
      </button>
      <button
        onClick={() => navigate('/')}
        className="mt-3 border-none bg-transparent text-[13px] text-text-secondary cursor-pointer"
      >
        Voltar ao início
      </button>
    </div>
  )
}
