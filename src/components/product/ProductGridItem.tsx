import type { Product } from '@/types'
import { ProductTile } from '@/components/product/ProductTile'
import { formatCurrency } from '@/lib/utils'

interface ProductGridItemProps {
  product: Product
  quantity: number
  onAdd: () => void
}

export function ProductGridItem({ product, quantity, onAdd }: ProductGridItemProps) {
  const inCart = quantity > 0

  return (
    <button
      onClick={onAdd}
      className="relative text-left rounded-card bg-card p-3 cursor-pointer"
      style={{
        border: `1px solid ${inCart ? 'rgba(200,162,76,.4)' : 'rgba(233,220,198,.08)'}`,
      }}
    >
      <ProductTile name={product.name} category={product.category} size="lg" />
      <p className="mt-2.5 h-[34px] overflow-hidden text-[13px] font-medium leading-[1.3] text-text-primary">
        {product.name}
      </p>
      <p className="mt-1 text-[14px] font-semibold text-gold-light">
        {formatCurrency(product.price)}
      </p>
      {inCart && (
        <span
          className="absolute top-2 right-2 flex min-w-[24px] items-center justify-center rounded-chip px-1.5 text-[13px] font-bold animate-pop"
          style={{
            height: 24,
            background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
            color: '#1a1408',
          }}
        >
          {quantity}
        </span>
      )}
    </button>
  )
}
