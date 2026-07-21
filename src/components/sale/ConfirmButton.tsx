import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'

interface ConfirmButtonProps {
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmButton({ onConfirm, loading }: ConfirmButtonProps) {
  const { payment, cartCount, cartTotal } = useCart()

  const canConfirm = !!payment && cartCount > 0 && !loading
  const label = loading
    ? 'Registrando venda...'
    : !payment
      ? 'Selecione o pagamento'
      : `Confirmar venda · ${formatCurrency(cartTotal)}`

  return (
    <div className="fixed left-3.5 right-3.5 z-30" style={{ bottom: 88 }}>
      <button
        onClick={canConfirm ? onConfirm : undefined}
        disabled={!canConfirm}
        className="w-full rounded-card border px-4 py-4 text-[15px] font-semibold"
        style={{
          background: canConfirm ? 'linear-gradient(135deg, #d6b25c, #b78d3d)' : '#221C15',
          color: canConfirm ? '#1a1408' : '#7c7264',
          borderColor: canConfirm ? 'transparent' : 'rgba(233,220,198,.10)',
          cursor: canConfirm ? 'pointer' : 'not-allowed',
          boxShadow: '0 12px 30px rgba(0,0,0,.4)',
        }}
      >
        {label}
      </button>
    </div>
  )
}
