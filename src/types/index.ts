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
  brandId: string | null
  brandName: string | null
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

export interface ProductBrand {
  id: string
  establishmentId: string
  name: string
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
  originalUnitPrice: number | null
  discountAmount: number
  subtotal: number
  comboGroupId: string | null
  comboName: string | null
  comboDiscountType: ComboDiscountType | null
  comboDiscountValue: number | null
}

export interface StoreSettings {
  id: number
  defaultMarkup: number
  monthlySalesGoal: number
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
  unitPrice: number
  originalUnitPrice: number
  originalSubtotal: number
  discountAmount: number
  lineTotal: number
  comboId?: string
  comboName?: string
  comboDiscountType?: ComboDiscountType
  comboDiscountValue?: number
}

export type ComboDiscountType = 'percent' | 'fixed'

export interface SaleComboDraft {
  id: string
  name: string
  productIds: string[]
  discountType: ComboDiscountType
  discountValue: number
}

export interface CartComboSummary extends SaleComboDraft {
  originalSubtotal: number
  discountAmount: number
  total: number
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

export type AiInsightPriority = 'alta' | 'media' | 'baixa'

export interface AiInsight {
  id: string
  kind: string
  priority: AiInsightPriority
  title: string
  summary: string
  rationale: string
  actionLabel: string
  actionRoute: string
  confidence: number
  marketingAngles: string[]
  postIdeas: string[]
  relatedProducts: string[]
  relatedClients: string[]
}

export interface AiAutomationIdea {
  area: string
  trigger: string
  action: string
  value: string
}

export interface AiActionPlanItem {
  id: string
  priority: AiInsightPriority
  area: string
  title: string
  why: string
  nextStep: string
  suggestedOwner: string
  dueWindow: string
  actionRoute: string
}

export interface AiContentIdea {
  id: string
  channel: 'Instagram' | 'WhatsApp' | 'Vitrine' | 'Equipe'
  theme: string
  format: string
  hook: string
  caption: string
  cta: string
  relatedProducts: string[]
}

export interface AiCustomerAction {
  id: string
  segment: string
  clientNames: string[]
  reason: string
  message: string
  actionRoute: string
}

export interface AiPerformanceSignal {
  id: string
  metric: string
  status: 'bom' | 'atenção' | 'crítico'
  summary: string
  recommendation: string
}

export interface AiInsightsResponse {
  source: 'openai' | 'rules'
  model: string
  generatedAt: string
  summary: string
  insights: AiInsight[]
  automationIdeas: AiAutomationIdea[]
  actionPlan: AiActionPlanItem[]
  contentIdeas: AiContentIdea[]
  customerActions: AiCustomerAction[]
  performanceSignals: AiPerformanceSignal[]
  metrics: {
    establishments: number
    products: number
    clients: number
    sales90d: number
    averageTicket90d: number
    monthRevenue: number
    monthlySalesGoal: number
    monthlyGoalProgress: number | null
    monthlyGoalGap: number
    requiredDailyRevenueToGoal: number
  }
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
