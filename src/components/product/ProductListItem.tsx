import type { Product } from '@/types'
import { ProductTile } from '@/components/product/ProductTile'
import { formatCurrency } from '@/lib/utils'

interface ProductListItemProps {
  product: Product
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export function ProductListItem({ product, quantity, onAdd, onRemove }: ProductListItemProps) {
  const inCart = quantity > 0

  return (
    <div
      className="mb-[9px] flex items-center gap-3 rounded-card bg-card p-3"
      style={{ border: '1px solid rgba(233,220,198,.08)' }}
    >
      <ProductTile name={product.name} category={product.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-text-primary">{product.name}</p>
        <p className="text-[12px] text-text-secondary">
          {product.brandName ?? 'Sem marca'} · {product.category} · {formatCurrency(product.price)}
        </p>
      </div>
      {inCart ? (
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRemove}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border text-[18px] text-text-primary cursor-pointer"
            style={{ background: '#2A2219', borderColor: 'rgba(233,220,198,.12)' }}
          >
            −
          </button>
          <span className="min-w-[14px] text-center text-[15px] font-medium text-text-primary">
            {quantity}
          </span>
          <button
            onClick={onAdd}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border text-[18px] text-gold-light cursor-pointer"
            style={{ background: 'rgba(200,162,76,.16)', borderColor: 'rgba(200,162,76,.3)' }}
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border-none text-[20px] font-semibold cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
            color: '#1a1408',
          }}
        >
          +
        </button>
      )}
    </div>
  )
}
