import type { Profile, Establishment, Product, Client, Sale, SaleItem, StoreSettings } from '@/types'

export function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    establishmentId: (row.establishment_id as string) ?? null,
    fullName: row.full_name as string,
    role: row.role as 'super_admin' | 'admin' | 'employee',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function toEstablishment(row: Record<string, unknown>): Establishment {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    active: row.active as boolean,
    createdBy: (row.created_by as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    establishmentId: row.establishment_id as string,
    name: row.name as string,
    category: row.category as 'Lábios' | 'Rosto' | 'Olhos',
    price: Number(row.price),
    cost: row.cost != null ? Number(row.cost) : null,
    stock: Number(row.stock),
    active: row.active as boolean,
    createdBy: (row.created_by as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function toClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    establishmentId: row.establishment_id as string,
    name: row.name as string,
    phone: (row.phone as string) ?? null,
    birthday: (row.birthday as string) ?? null,
    active: row.active as boolean,
    createdBy: (row.created_by as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    totalSpent: row.total_spent != null ? Number(row.total_spent) : undefined,
    lastPurchase: (row.last_purchase as string) ?? null,
  }
}

export function toSale(row: Record<string, unknown>): Sale {
  return {
    id: row.id as string,
    establishmentId: row.establishment_id as string,
    clientId: (row.client_id as string) ?? null,
    paymentMethod: row.payment_method as Sale['paymentMethod'],
    total: Number(row.total),
    itemsCount: Number(row.items_count),
    createdBy: (row.created_by as string) ?? null,
    refundedAt: (row.refunded_at as string) ?? null,
    createdAt: row.created_at as string,
  }
}

export function toSaleItem(row: Record<string, unknown>): SaleItem {
  return {
    id: row.id as string,
    establishmentId: row.establishment_id as string,
    saleId: row.sale_id as string,
    productId: row.product_id as string,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    subtotal: Number(row.subtotal),
  }
}

export function toStoreSettings(row: Record<string, unknown>): StoreSettings {
  return {
    id: Number(row.id),
    defaultMarkup: Number(row.default_markup),
    lowStockThreshold: Number(row.low_stock_threshold),
    vipThreshold: Number(row.vip_threshold),
    birthdayAlertDays: Number(row.birthday_alert_days),
    togglePromos: row.toggle_promos as boolean,
    toggleEstoque: row.toggle_estoque as boolean,
    toggleAniversario: row.toggle_aniversario as boolean,
    toggleResumo: row.toggle_resumo as boolean,
    updatedAt: row.updated_at as string,
  }
}
