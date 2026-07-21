import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'

export function CartBar() {
  const { cartCount, cartTotal, setStep } = useCart()

  if (cartCount === 0) return null

  return (
    <div
      className="fixed left-3.5 right-3.5 z-30 flex items-center gap-3.5 animate-pop"
      style={{
        bottom: 88,
        background: 'linear-gradient(150deg, #2a2116, #211a12)',
        border: '1px solid rgba(200,162,76,.3)',
        borderRadius: 18,
        padding: '14px 16px',
        boxShadow: '0 16px 40px rgba(0,0,0,.5)',
      }}
    >
      <div className="flex-1">
        <p className="text-[12px] text-text-secondary">
          {cartCount} {cartCount === 1 ? 'item' : 'itens'} · {formatCurrency(cartTotal)}
        </p>
        <p className="text-[14px] text-text-primary">Revisar e finalizar</p>
      </div>
      <button
        onClick={() => setStep('checkout')}
        className="rounded-input border-none px-[22px] py-3.5 text-[15px] font-semibold cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
          color: '#1a1408',
        }}
      >
        Avançar →
      </button>
    </div>
  )
}
