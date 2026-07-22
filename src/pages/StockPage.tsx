import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useProducts, useSoftDeleteProduct } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import { SearchInput } from '@/components/shared/SearchInput'
import { ProductTile } from '@/components/product/ProductTile'
import { StockBadge } from '@/components/shared/StockBadge'
import { formatCurrency } from '@/lib/utils'
import { calcMargin } from '@/lib/pricing'

export default function StockPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: products = [], isPending } = useProducts()
  const softDelete = useSoftDeleteProduct()
  const { query, setQuery, filtered } = useSearch(products, (p) => `${p.name} ${p.brandName ?? ''}`)

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <div className="flex items-center justify-between py-2 pb-3.5">
        <div>
          <h1 className="font-display text-[28px] font-medium text-text-primary">Estoque</h1>
          <p className="text-[13px] text-text-secondary">{products.length} produtos ativos</p>
        </div>
        <button
          onClick={() => navigate('/produto')}
          className="flex h-[44px] w-[44px] items-center justify-center rounded-[13px] border-none text-[24px] font-semibold cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
            color: '#1a1408',
          }}
        >
          +
        </button>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Buscar no estoque..." />

      {isPending ? (
        <div className="flex justify-center py-10">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'rgba(200,162,76,.3)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        filtered.map((product) => {
          const margin = product.cost != null ? Math.round(calcMargin(product.cost, product.price)) : null
          return (
            <div
              key={product.id}
              className="mb-[9px] flex items-center gap-3 rounded-card bg-card p-3"
              style={{ border: '1px solid rgba(233,220,198,.08)' }}
            >
              <ProductTile name={product.name} category={product.category} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-text-primary">{product.name}</p>
                <p className="text-[12px] text-text-secondary">
                  {product.brandName ?? 'Sem marca'} · {formatCurrency(product.price)}
                  {margin != null ? ` · margem ${margin}%` : ''}
                </p>
              </div>
              <StockBadge stock={product.stock} />
              {isAdmin && (
                <button
                  onClick={() => softDelete.mutate(product.id)}
                  disabled={softDelete.isPending}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border-none bg-transparent cursor-pointer disabled:opacity-40"
                  title="Excluir produto"
                >
                  <Trash2 size={16} strokeWidth={1.6} className="text-danger" />
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
