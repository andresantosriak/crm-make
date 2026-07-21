import { describe, it, expect } from 'vitest'
import type { Database } from '../types'

type Tables = Database['public']['Tables']
type Views = Database['public']['Views']
type Functions = Database['public']['Functions']

describe('Supabase generated types — schema coverage', () => {
  it('should have all 6 tables', () => {
    type TableNames = keyof Tables
    const tables: TableNames[] = [
      'profiles',
      'products',
      'clients',
      'sales',
      'sale_items',
      'store_settings',
    ]
    expect(tables).toHaveLength(6)
  })

  it('should have products_display view', () => {
    type ViewNames = keyof Views
    const views: ViewNames[] = ['products_display']
    expect(views).toHaveLength(1)
  })

  it('should have all 8 functions', () => {
    type FnNames = keyof Functions
    const fns: FnNames[] = [
      'cancel_sale',
      'create_sale',
      'custom_access_token_hook',
      'get_user_role',
      'is_admin',
      'requesting_user_id',
      'soft_delete_client',
      'soft_delete_product',
    ]
    expect(fns).toHaveLength(8)
  })
})

describe('Supabase generated types — column types', () => {
  it('products.category is string (CHECK enforced at DB level)', () => {
    type Category = Tables['products']['Row']['category']
    const cat: Category = 'Lábios'
    expect(cat).toBe('Lábios')
  })

  it('sales.payment_method is string (CHECK enforced at DB level)', () => {
    type PM = Tables['sales']['Row']['payment_method']
    const pm: PM = 'Cartão de crédito'
    expect(pm).toBe('Cartão de crédito')
  })

  it('sales.client_id is nullable', () => {
    type ClientId = Tables['sales']['Row']['client_id']
    const nullable: ClientId = null
    expect(nullable).toBeNull()
  })

  it('sales.refunded_at is nullable', () => {
    type RefundedAt = Tables['sales']['Row']['refunded_at']
    const nullable: RefundedAt = null
    expect(nullable).toBeNull()
  })

  it('sales.created_by is nullable', () => {
    type CreatedBy = Tables['sales']['Row']['created_by']
    const nullable: CreatedBy = null
    expect(nullable).toBeNull()
  })

  it('products_display.cost is nullable (masking for employee)', () => {
    type Cost = Views['products_display']['Row']['cost']
    const nullable: Cost = null
    expect(nullable).toBeNull()
  })

  it('products_display.cost Insert is never (computed column)', () => {
    type CostInsert = Views['products_display']['Insert']['cost']
    const _check: CostInsert = undefined as never
    void _check
    expect(true).toBe(true)
  })

  it('store_settings has all expected columns', () => {
    type Row = Tables['store_settings']['Row']
    const keys: (keyof Row)[] = [
      'id',
      'default_markup',
      'low_stock_threshold',
      'vip_threshold',
      'birthday_alert_days',
      'toggle_promos',
      'toggle_estoque',
      'toggle_aniversario',
      'toggle_resumo',
      'updated_at',
    ]
    expect(keys).toHaveLength(10)
  })
})

describe('Application types — PaymentMethod with accents', () => {
  it('should include accented payment methods', () => {
    const methods: import('@/types').PaymentMethod[] = [
      'Pix',
      'Cartão de crédito',
      'Cartão de débito',
      'Dinheiro',
    ]
    expect(methods).toHaveLength(4)
  })
})

describe('Application types — Product.cost is nullable (view masking)', () => {
  it('should allow null cost for employee view', () => {
    const product: import('@/types').Product = {
      id: 'test',
      name: 'Test',
      category: 'Rosto',
      price: 10,
      cost: null,
      stock: 5,
      active: true,
      createdBy: null,
      createdAt: '',
      updatedAt: '',
    }
    expect(product.cost).toBeNull()
  })
})
