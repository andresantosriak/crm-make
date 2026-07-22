import { useEffect, useMemo, useState } from 'react'
import { BadgeDollarSign, PackagePlus, Pencil, Percent, Trash2, X } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { calculateComboPricing } from '@/lib/cart-combos'
import { formatCurrency } from '@/lib/utils'
import type { ComboDiscountType } from '@/types'

const DISCOUNT_TYPES: Array<{
  value: ComboDiscountType
  label: string
  icon: typeof Percent
}> = [
  { value: 'percent', label: '%', icon: Percent },
  { value: 'fixed', label: 'R$', icon: BadgeDollarSign },
]

export function ComboBuilder() {
  const {
    cartItems,
    cartCombos,
    saveCombo,
    removeCombo,
  } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [comboName, setComboName] = useState('')
  const [discountType, setDiscountType] = useState<ComboDiscountType>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const editingCombo = useMemo(
    () => cartCombos.find((combo) => combo.id === editingId) ?? null,
    [cartCombos, editingId],
  )

  useEffect(() => {
    if (!editingCombo) return

    setComboName(editingCombo.name)
    setDiscountType(editingCombo.discountType)
    setDiscountValue(String(editingCombo.discountValue).replace('.', ','))
    setSelectedProductIds(editingCombo.productIds)
    setIsOpen(true)
  }, [editingCombo])

  const selectedLines = useMemo(
    () => selectedProductIds
      .map((productId) => {
        const item = cartItems.find((cartItem) => cartItem.product.id === productId)
        if (!item) return null

        return {
          productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
        }
      })
      .filter((line) => line !== null),
    [cartItems, selectedProductIds],
  )

  const parsedDiscount = Number(discountValue.replace(',', '.')) || 0
  const preview = selectedLines.length >= 2
    ? calculateComboPricing(selectedLines, discountType, parsedDiscount)
    : null
  const canSave = comboName.trim().length > 0
    && selectedProductIds.length >= 2
    && parsedDiscount > 0

  function resetForm() {
    setEditingId(null)
    setComboName('')
    setDiscountType('percent')
    setDiscountValue('')
    setSelectedProductIds([])
    setIsOpen(false)
  }

  function toggleProduct(productId: string) {
    setSelectedProductIds((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId])
  }

  function handleSave() {
    if (!canSave) return

    saveCombo({
      id: editingId ?? undefined,
      name: comboName,
      productIds: selectedProductIds,
      discountType,
      discountValue: parsedDiscount,
    })
    resetForm()
  }

  if (cartItems.length < 2 && cartCombos.length === 0) {
    return (
      <div
        className="mb-[22px] rounded-card bg-card px-4 py-3 text-[13px] text-text-secondary"
        style={{ border: '1px solid rgba(233,220,198,.08)' }}
      >
        Adicione pelo menos 2 produtos para montar um combo.
      </div>
    )
  }

  return (
    <div className="mb-[22px] space-y-3">
      {cartCombos.map((combo) => (
        <div
          key={combo.id}
          className="rounded-card bg-card px-3.5 py-3"
          style={{ border: '1px solid rgba(200,162,76,.22)' }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'rgba(200,162,76,.14)' }}
            >
              <PackagePlus size={18} strokeWidth={1.8} className="text-gold-light" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-text-primary">{combo.name}</p>
              <p className="text-[12px] text-text-secondary">
                {combo.productIds.length} produtos · {formatCurrency(combo.originalSubtotal)}
              </p>
              <p className="mt-1 text-[12px] text-success">
                Desconto {formatCurrency(combo.discountAmount)} · Total {formatCurrency(combo.total)}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setEditingId(combo.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: '#2A2219', border: '1px solid rgba(233,220,198,.10)' }}
                aria-label={`Editar ${combo.name}`}
              >
                <Pencil size={15} strokeWidth={1.8} className="text-text-secondary" />
              </button>
              <button
                type="button"
                onClick={() => removeCombo(combo.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: '#2A2219', border: '1px solid rgba(233,220,198,.10)' }}
                aria-label={`Remover ${combo.name}`}
              >
                <Trash2 size={15} strokeWidth={1.8} className="text-danger" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-card bg-card px-4 py-3 text-[14px] font-medium text-gold-light"
          style={{ border: '1px dashed rgba(200,162,76,.35)' }}
        >
          <PackagePlus size={17} strokeWidth={1.8} />
          Montar combo
        </button>
      ) : (
        <div
          className="rounded-card bg-card p-3.5"
          style={{ border: '1px solid rgba(233,220,198,.10)' }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[14px] font-medium text-text-primary">
              {editingId ? 'Editar combo' : 'Novo combo'}
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: '#2A2219', border: '1px solid rgba(233,220,198,.10)' }}
              aria-label="Fechar montagem de combo"
            >
              <X size={16} strokeWidth={1.8} className="text-text-secondary" />
            </button>
          </div>

          <input
            value={comboName}
            onChange={(event) => setComboName(event.target.value)}
            placeholder="Nome do combo"
            className="mb-3 w-full rounded-input bg-card-hover px-3.5 py-3 text-[14px] text-text-primary outline-none placeholder:text-text-muted"
            style={{ border: '1px solid rgba(233,220,198,.10)' }}
          />

          <div className="mb-3 grid grid-cols-[88px_1fr] gap-2">
            <div
              className="grid grid-cols-2 rounded-input bg-card-hover p-1"
              style={{ border: '1px solid rgba(233,220,198,.10)' }}
            >
              {DISCOUNT_TYPES.map((type) => {
                const Icon = type.icon
                const isActive = discountType === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setDiscountType(type.value)}
                    className="flex h-10 items-center justify-center rounded-lg"
                    style={{
                      background: isActive ? 'rgba(200,162,76,.18)' : 'transparent',
                      color: isActive ? '#d9b869' : '#A79B88',
                    }}
                    aria-label={type.value === 'percent' ? 'Desconto percentual' : 'Desconto fixo'}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </button>
                )
              })}
            </div>
            <input
              value={discountValue}
              onChange={(event) => setDiscountValue(event.target.value)}
              inputMode="decimal"
              placeholder={discountType === 'percent' ? 'Percentual' : 'Valor fixo'}
              className="w-full rounded-input bg-card-hover px-3.5 py-3 text-[14px] text-text-primary outline-none placeholder:text-text-muted"
              style={{ border: '1px solid rgba(233,220,198,.10)' }}
            />
          </div>

          <div className="mb-3 space-y-2">
            {cartItems.map((item) => {
              const isChecked = selectedProductIds.includes(item.product.id)
              return (
                <label
                  key={item.product.id}
                  className="flex items-center gap-3 rounded-lg bg-card-hover px-3 py-2.5"
                  style={{
                    border: `1px solid ${isChecked ? 'rgba(200,162,76,.28)' : 'rgba(233,220,198,.06)'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleProduct(item.product.id)}
                    className="h-4 w-4 accent-[#C8A24C]"
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-text-primary">
                    {item.product.name}
                  </span>
                  <span className="text-[12px] text-text-secondary">
                    {item.quantity}x
                  </span>
                </label>
              )
            })}
          </div>

          {preview && (
            <div
              className="mb-3 grid grid-cols-3 gap-2 rounded-lg px-3 py-2.5 text-center"
              style={{ background: '#2A2219', border: '1px solid rgba(233,220,198,.08)' }}
            >
              <div>
                <p className="text-[11px] text-text-muted">Original</p>
                <p className="text-[12px] text-text-primary">{formatCurrency(preview.originalSubtotal)}</p>
              </div>
              <div>
                <p className="text-[11px] text-text-muted">Desconto</p>
                <p className="text-[12px] text-success">{formatCurrency(preview.discountAmount)}</p>
              </div>
              <div>
                <p className="text-[11px] text-text-muted">Combo</p>
                <p className="text-[12px] text-gold-light">{formatCurrency(preview.total)}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full rounded-card px-4 py-3 text-[14px] font-semibold"
            style={{
              background: canSave ? 'linear-gradient(135deg, #d6b25c, #b78d3d)' : '#2A2219',
              color: canSave ? '#1a1408' : '#7c7264',
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            Salvar combo
          </button>
        </div>
      )}
    </div>
  )
}
