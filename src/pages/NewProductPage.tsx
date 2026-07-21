import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProduct } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'
import { useMarkupCalculator } from '@/hooks/useMarkupCalculator'
import { BackButton } from '@/components/shared/BackButton'
import { CategoryChips } from '@/components/product/CategoryChips'
import { PricingCards } from '@/components/product/PricingCards'
import { floor90, ceil90, round90 } from '@/lib/pricing'
import type { Product } from '@/types'

const PRODUCT_CATEGORIES = ['Lábios', 'Rosto', 'Olhos']

export default function NewProductPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const createProduct = useCreateProduct()
  const { defaultMarkup } = useSettings()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<Product['category']>('Rosto')
  const [costStr, setCostStr] = useState('')
  const [priceStr, setPriceStr] = useState('')
  const [stockStr, setStockStr] = useState('')
  const [priceAuto, setPriceAuto] = useState(true)

  const cost = parseFloat(costStr.replace(',', '.')) || 0
  const price = parseFloat(priceStr.replace(',', '.')) || 0
  const hasCalc = cost > 0 && price > 0

  const { markup, margin, profit } = useMarkupCalculator(cost, price)

  const handleCostChange = useCallback(
    (value: string) => {
      setCostStr(value)
      const c = parseFloat(value.replace(',', '.')) || 0
      if (priceAuto && c > 0) {
        const suggested = round90(c * (1 + defaultMarkup / 100))
        setPriceStr(suggested.toFixed(2).replace('.', ','))
      }
    },
    [priceAuto, defaultMarkup],
  )

  const handlePriceChange = useCallback((value: string) => {
    setPriceStr(value)
    setPriceAuto(false)
  }, [])

  const handleRoundDown = useCallback(() => {
    if (price <= 0.9) return
    const rounded = floor90(price - 0.01)
    setPriceStr(rounded.toFixed(2).replace('.', ','))
    setPriceAuto(false)
  }, [price])

  const handleRoundUp = useCallback(() => {
    if (price <= 0) return
    const rounded = ceil90(price + 0.01)
    setPriceStr(rounded.toFixed(2).replace('.', ','))
    setPriceAuto(false)
  }, [price])

  const handleSave = useCallback(() => {
    if (!name.trim() || price <= 0) return
    createProduct.mutate({
      name: name.trim(),
      category,
      price,
      cost: isAdmin ? cost : 0,
      stock: parseInt(stockStr) || 0,
    }, {
      onSuccess: () => navigate('/estoque'),
    })
  }, [name, category, price, cost, stockStr, isAdmin, createProduct, navigate])

  const inputStyle = { border: '1px solid rgba(233,220,198,.10)' }

  return (
    <div className="px-5 pt-1.5 pb-10 animate-fadeup">
      <div className="flex items-center gap-3 py-2 pb-[18px]">
        <BackButton onClick={() => navigate('/estoque')} />
        <h1 className="font-display text-[26px] font-medium text-text-primary">Novo produto</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-[7px]">
          <label className="text-[11px] uppercase tracking-[1.2px] text-text-secondary">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Batom Matte Rose"
            className="rounded-input bg-card px-4 py-3.5 text-[15px] text-text-primary outline-none"
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[11px] uppercase tracking-[1.2px] text-text-secondary">Categoria</label>
          <CategoryChips
            categories={PRODUCT_CATEGORIES}
            active={category}
            onSelect={(c) => setCategory(c as Product['category'])}
          />
        </div>

        <div className="flex gap-3">
          {isAdmin && (
            <div className="flex flex-1 flex-col gap-[7px]">
              <label className="text-[11px] uppercase tracking-[1.2px] text-text-secondary">
                Custo (R$)
              </label>
              <input
                value={costStr}
                onChange={(e) => handleCostChange(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                className="rounded-input bg-card px-4 py-3.5 text-[15px] text-text-primary outline-none"
                style={inputStyle}
              />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-[7px]">
            <label className="text-[11px] uppercase tracking-[1.2px] text-text-secondary">
              Preço venda (R$)
            </label>
            <input
              value={priceStr}
              onChange={(e) => handlePriceChange(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="rounded-input bg-card px-4 py-3.5 text-[15px] text-text-primary outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="-mt-1 flex items-center gap-2">
              <span className="flex-1 text-[12px] text-text-secondary">
                {priceAuto
                  ? `Sugerido pelo markup padrão de ${defaultMarkup}%`
                  : 'Preço ajustado manualmente'}
              </span>
              <button
                onClick={handleRoundDown}
                className="flex items-center gap-[5px] rounded-[10px] border bg-card px-[11px] py-2 text-[12px] text-text-primary cursor-pointer"
                style={{ borderColor: 'rgba(233,220,198,.12)' }}
              >
                ↓ Arredondar
              </button>
              <button
                onClick={handleRoundUp}
                className="flex items-center gap-[5px] rounded-[10px] border bg-card px-[11px] py-2 text-[12px] text-text-primary cursor-pointer"
                style={{ borderColor: 'rgba(233,220,198,.12)' }}
              >
                ↑ Arredondar
              </button>
            </div>

            <PricingCards markup={markup} margin={margin} profit={profit} hasCalc={hasCalc} />
          </>
        )}

        <div className="flex flex-col gap-[7px]">
          <label className="text-[11px] uppercase tracking-[1.2px] text-text-secondary">
            Quantidade em estoque
          </label>
          <input
            value={stockStr}
            onChange={(e) => setStockStr(e.target.value)}
            inputMode="numeric"
            placeholder="0"
            className="rounded-input bg-card px-4 py-3.5 text-[15px] text-text-primary outline-none"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={createProduct.isPending}
          className="mt-1.5 w-full rounded-[14px] border-none px-4 py-4 text-[15px] font-semibold tracking-[.4px] cursor-pointer disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
            color: '#1a1408',
            boxShadow: '0 8px 24px rgba(200,162,76,.22)',
          }}
        >
          {createProduct.isPending ? 'Salvando...' : 'Salvar produto'}
        </button>
      </div>
    </div>
  )
}
