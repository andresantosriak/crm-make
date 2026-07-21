import { useNavigate } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { ProductTile } from '@/components/product/ProductTile'

export function LowStockSection() {
  const navigate = useNavigate()
  const { lowStockProducts } = useData()

  if (lowStockProducts.length === 0) return null

  return (
    <>
      <div className="mt-6 mb-3 flex items-center justify-between">
        <h2 className="font-display text-[20px] font-medium text-text-primary">Estoque baixo</h2>
        <button
          onClick={() => navigate('/estoque')}
          className="border-none bg-transparent text-[13px] text-text-secondary cursor-pointer"
        >
          Ver tudo
        </button>
      </div>

      {lowStockProducts.map((product) => (
        <div
          key={product.id}
          className="mb-2 flex items-center gap-3 rounded-card bg-card p-3"
          style={{ border: '1px solid rgba(208,124,103,.22)' }}
        >
          <ProductTile name={product.name} category={product.category} size="sm" />
          <div className="flex-1">
            <p className="text-[14px] text-text-primary">{product.name}</p>
            <p className="text-[12px] text-text-secondary">{product.category}</p>
          </div>
          <span className="text-[13px] font-medium text-danger">{product.stock} un.</span>
        </div>
      ))}
    </>
  )
}
