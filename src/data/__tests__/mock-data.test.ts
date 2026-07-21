import { describe, it, expect } from 'vitest'
import { promos } from '../promos'

describe('promos mock data', () => {
  it('should have exactly 3 promos', () => {
    expect(promos).toHaveLength(3)
  })

  it('should have Combo Olhar Marcante with correct pricing', () => {
    expect(promos[0]).toMatchObject({
      title: 'Combo Olhar Marcante',
      price: 179.90,
      originalPrice: 204.70,
      savings: 24.80,
      badge: { label: 'GIRAR ESTOQUE' },
    })
  })

  it('should have Cupom aniversário with single whatsapp action', () => {
    expect(promos[2]).toMatchObject({
      title: 'Cupom aniversário',
      badge: { label: 'FIDELIZAR' },
    })
    expect(promos[2]!.actions).toEqual(['whatsapp'])
  })
})
