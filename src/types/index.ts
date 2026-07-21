export interface Profile {
  id: string
  establishmentId: string | null
  email: string | null
  fullName: string
  role: 'super_admin' | 'admin' | 'employee'
  createdAt: string
  updatedAt: string
}

export interface Establishment {
  id: string
  name: string
  slug: string
  active: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  establishmentId: string
  name: string
  category: 'Lábios' | 'Rosto' | 'Olhos'
  price: number
  cost: number | null
  stock: number
  active: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  establishmentId: string
  name: string
  phone: string | null
  birthday: string | null
  active: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
  totalSpent?: number
  lastPurchase?: string | null
}

export type PaymentMethod = 'Pix' | 'Cartão de crédito' | 'Cartão de débito' | 'Dinheiro'

export interface Sale {
  id: string
  establishmentId: string
  clientId: string | null
  paymentMethod: PaymentMethod
  total: number
  itemsCount: number
  createdBy: string | null
  refundedAt: string | null
  createdAt: string
}

export interface SaleItem {
  id: string
  establishmentId: string
  saleId: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface StoreSettings {
  id: number
  defaultMarkup: number
  lowStockThreshold: number
  vipThreshold: number
  birthdayAlertDays: number
  togglePromos: boolean
  toggleEstoque: boolean
  toggleAniversario: boolean
  toggleResumo: boolean
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ClientTag {
  label: string
  bg: string
  color: string
}

export interface Alert {
  kind: string
  dot: string
  text: string
  when: string
}

export type PromoAction = 'publish' | 'edit' | 'whatsapp'

export interface Promo {
  title: string
  subtitle: string
  badge: { label: string; bg: string; color: string }
  price?: number
  originalPrice?: number
  savings?: number
  actions: PromoAction[]
}
