import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ChevronRight, User } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useProducts } from '@/hooks/useProducts'
import { useCreateSale } from '@/hooks/useSales'
import { useSearch } from '@/hooks/useSearch'
import { SearchInput } from '@/components/shared/SearchInput'
import { ViewToggle } from '@/components/shared/ViewToggle'
import { CategoryChips } from '@/components/product/CategoryChips'
import { ProductListItem } from '@/components/product/ProductListItem'
import { ProductGridItem } from '@/components/product/ProductGridItem'
import { CartBar } from '@/components/sale/CartBar'
import { CheckoutItemList } from '@/components/sale/CheckoutItemList'
import { PaymentGrid } from '@/components/sale/PaymentGrid'
import { ConfirmButton } from '@/components/sale/ConfirmButton'
import { ClientPicker } from '@/components/client/ClientPicker'
import { SaleSuccessOverlay } from '@/components/sale/SaleSuccessOverlay'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { BackButton } from '@/components/shared/BackButton'
import { ClientAvatar } from '@/components/client/ClientAvatar'
import { formatCurrency } from '@/lib/utils'
import type { PaymentMethod } from '@/types'

const CATEGORIES = ['Todos', 'Lábios', 'Rosto', 'Olhos']

export default function NewSalePage() {
  const navigate = useNavigate()
  const { data: products = [], isPending: productsLoading } = useProducts()
  const createSale = useCreateSale()
  const cart = useCart()
  const [viewMode, setViewMode] = useState<'lista' | 'grade'>('lista')
  const [category, setCategory] = useState('Todos')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saleSuccess, setSaleSuccess] = useState<{
    total: number
    clientName: string
    payment: PaymentMethod
  } | null>(null)

  const categoryFiltered = category === 'Todos'
    ? products
    : products.filter((p) => p.category === category)

  const { query, setQuery, filtered } = useSearch(categoryFiltered, (p) => p.name)

  const handleConfirmSale = useCallback(() => {
    if (!cart.payment || cart.cartCount === 0) return

    cart.setIsConfirming(true)

    const items = cart.cartItems.map((ci) => ({
      product_id: ci.product.id,
      quantity: ci.quantity,
      unit_price: ci.product.price,
    }))

    const info = {
      total: cart.cartTotal,
      clientName: cart.client?.name ?? 'Consumidor final',
      payment: cart.payment,
    }

    createSale.mutate(
      {
        p_client_id: cart.client?.id ?? null,
        p_payment_method: cart.payment,
        p_items: items,
      },
      {
        onSuccess: () => {
          cart.resetAfterSale()
          setSaleSuccess(info)
        },
        onSettled: () => {
          cart.setIsConfirming(false)
        },
      },
    )
  }, [cart, createSale])

  const handleNewSale = useCallback(() => {
    setSaleSuccess(null)
    cart.clearCart()
  }, [cart])

  if (saleSuccess) {
    return (
      <SaleSuccessOverlay
        total={saleSuccess.total}
        clientName={saleSuccess.clientName}
        payment={saleSuccess.payment}
        onNewSale={handleNewSale}
      />
    )
  }

  if (cart.step === 'checkout') {
    return (
      <>
        <div className="px-5 pt-1.5 pb-[150px] animate-fadeup">
          <div className="flex items-center gap-3 py-2 pb-[18px]">
            <BackButton onClick={() => cart.setStep('produtos')} />
            <h1 className="font-display text-[26px] font-medium text-text-primary">
              Finalizar venda
            </h1>
          </div>

          <SectionLabel>Itens</SectionLabel>
          <CheckoutItemList />

          <SectionLabel>Cliente</SectionLabel>
          <button
            onClick={() => setPickerOpen(true)}
            className="mb-[22px] flex w-full items-center gap-3 rounded-card bg-card p-[13px] cursor-pointer"
            style={{
              border: `1px solid ${cart.client ? 'rgba(200,162,76,.3)' : 'rgba(233,220,198,.10)'}`,
            }}
          >
            {cart.client ? (
              <>
                <ClientAvatar name={cart.client.name} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-[15px] font-medium text-text-primary">{cart.client.name}</p>
                  <p className="text-[12px] text-text-secondary">Trocar cliente</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#2A2219' }}>
                  <User size={19} strokeWidth={1.7} className="text-text-secondary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[15px] text-text-primary">Selecionar cliente</p>
                  <p className="text-[12px] text-text-secondary">Buscar ou cadastrar</p>
                </div>
              </>
            )}
            <ChevronRight size={18} strokeWidth={1.8} className="text-text-muted" />
          </button>

          <SectionLabel>Forma de pagamento</SectionLabel>
          <PaymentGrid />

          <div
            className="mt-[22px] flex items-center justify-between rounded-[16px] p-4"
            style={{
              background: 'linear-gradient(150deg, #2a2116, #211a12)',
              border: '1px solid rgba(200,162,76,.18)',
            }}
          >
            <span className="text-[14px] text-text-secondary">Total</span>
            <span className="font-display text-[28px] font-semibold text-text-primary">
              {formatCurrency(cart.cartTotal)}
            </span>
          </div>
        </div>

        <ConfirmButton onConfirm={handleConfirmSale} loading={cart.isConfirming} />
        <ClientPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
      </>
    )
  }

  return (
    <>
      <div className="px-5 pt-1.5 pb-[150px] animate-fadeup">
        <div className="flex items-center justify-between py-2 pb-3.5">
          <div>
            <h1 className="font-display text-[28px] font-medium text-text-primary">Nova venda</h1>
            <p className="text-[13px] text-text-secondary">Toque para adicionar</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/historico')}
              className="flex h-10 w-[42px] items-center justify-center rounded-tile bg-card cursor-pointer"
              style={{ border: '1px solid rgba(233,220,198,.10)' }}
            >
              <Clock size={18} strokeWidth={1.7} className="text-text-primary" />
            </button>
            <ViewToggle mode={viewMode} onToggle={setViewMode} />
          </div>
        </div>

        <SearchInput value={query} onChange={setQuery} placeholder="Buscar produto..." />
        <CategoryChips categories={CATEGORIES} active={category} onSelect={setCategory} />

        {productsLoading ? (
          <div className="flex justify-center py-10">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'rgba(200,162,76,.3)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : viewMode === 'lista' ? (
          filtered.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              quantity={cart.items[product.id] ?? 0}
              onAdd={() => cart.addItem(product.id)}
              onRemove={() => cart.removeItem(product.id)}
            />
          ))
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((product) => (
              <ProductGridItem
                key={product.id}
                product={product}
                quantity={cart.items[product.id] ?? 0}
                onAdd={() => cart.addItem(product.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CartBar />
    </>
  )
}
