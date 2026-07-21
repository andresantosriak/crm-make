import { useCart } from '@/hooks/useCart'
import { PAYMENT_METHODS } from '@/lib/constants'
import type { PaymentMethod } from '@/types'

export function PaymentGrid() {
  const { payment, setPayment } = useCart()

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {PAYMENT_METHODS.map((method) => {
        const isActive = payment === method
        return (
          <button
            key={method}
            onClick={() => setPayment(method as PaymentMethod)}
            className="flex items-center gap-2.5 rounded-[13px] border px-3.5 py-3.5 text-[14px] font-medium cursor-pointer"
            style={{
              background: isActive ? 'rgba(200,162,76,.16)' : '#221C15',
              color: isActive ? '#d9b869' : '#F1EBDF',
              borderColor: isActive ? 'rgba(200,162,76,.45)' : 'rgba(233,220,198,.10)',
            }}
          >
            {method}
          </button>
        )
      })}
    </div>
  )
}
