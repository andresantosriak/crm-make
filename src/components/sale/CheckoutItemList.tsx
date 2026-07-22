import { useCart } from '@/hooks/useCart'
import { ProductTile } from '@/components/product/ProductTile'
import { formatCurrency } from '@/lib/utils'

export function CheckoutItemList() {
  const { cartItems, addItem, removeItem } = useCart()

  return (
    <div
      className="mb-[22px] overflow-hidden rounded-[16px] bg-card"
      style={{ border: '1px solid rgba(233,220,198,.08)' }}
    >
      {cartItems.map((ci) => (
        <div
          key={ci.product.id}
          className="flex items-center gap-3 px-3.5 py-3"
          style={{ borderBottom: '1px solid rgba(233,220,198,.06)' }}
        >
          <ProductTile name={ci.product.name} category={ci.product.category} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] text-text-primary">{ci.product.name}</p>
            <p className="text-[12px] text-text-secondary">
              {ci.quantity}x {formatCurrency(ci.unitPrice)} = {formatCurrency(ci.lineTotal)}
            </p>
            {ci.comboName && (
              <p className="mt-0.5 text-[11px] text-success">
                {ci.comboName} · desconto {formatCurrency(ci.discountAmount)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-[9px]">
            <button
              onClick={() => removeItem(ci.product.id)}
              className="flex h-[28px] w-[28px] items-center justify-center rounded-lg border text-[16px] text-text-primary cursor-pointer"
              style={{ background: '#2A2219', borderColor: 'rgba(233,220,198,.12)' }}
            >
              −
            </button>
            <span className="min-w-[12px] text-center text-[14px] font-medium text-text-primary">
              {ci.quantity}
            </span>
            <button
              onClick={() => addItem(ci.product.id)}
              className="flex h-[28px] w-[28px] items-center justify-center rounded-lg border text-[16px] text-gold-light cursor-pointer"
              style={{ background: 'rgba(200,162,76,.16)', borderColor: 'rgba(200,162,76,.3)' }}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
