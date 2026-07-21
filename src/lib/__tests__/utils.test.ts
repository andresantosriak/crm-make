import { describe, it, expect } from 'vitest'
import { formatCurrency, getInitials, shortPayment, normalizeForSearch } from '../utils'

describe('formatCurrency', () => {
  it('should format 420.60 with comma', () => {
    expect(formatCurrency(420.60)).toContain('420,60')
  })

  it('should format 0 as R$ 0,00', () => {
    expect(formatCurrency(0)).toContain('0,00')
  })

  it('should force 2 decimal places for 39.9', () => {
    expect(formatCurrency(39.9)).toContain('39,90')
  })

  it('should format 6240 with thousands separator', () => {
    const result = formatCurrency(6240)
    expect(result).toContain('6.240,00')
  })

  it('should format 1000 with thousands separator', () => {
    const result = formatCurrency(1000)
    expect(result).toContain('1.000,00')
  })

  it('should include R$ prefix', () => {
    expect(formatCurrency(100)).toMatch(/R\$/)
  })
})

describe('getInitials', () => {
  it('should return MA for Mariana Alves', () => {
    expect(getInitials('Mariana Alves')).toBe('MA')
  })

  it('should return CF for Consumidor final', () => {
    expect(getInitials('Consumidor final')).toBe('CF')
  })

  it('should return only first 2 initials for 3+ words', () => {
    expect(getInitials('Ana Paula Souza')).toBe('AP')
  })

  it('should ignore multiple spaces', () => {
    expect(getInitials('Ana  Paula')).toBe('AP')
  })

  it('should return single letter for single name', () => {
    expect(getInitials('Bruna')).toBe('B')
  })
})

describe('shortPayment', () => {
  it('should shorten Cartão de crédito to Crédito', () => {
    expect(shortPayment('Cartão de crédito')).toBe('Crédito')
  })

  it('should shorten Cartão de débito to Débito', () => {
    expect(shortPayment('Cartão de débito')).toBe('Débito')
  })

  it('should pass through Pix', () => {
    expect(shortPayment('Pix')).toBe('Pix')
  })

  it('should pass through Dinheiro', () => {
    expect(shortPayment('Dinheiro')).toBe('Dinheiro')
  })
})

describe('normalizeForSearch', () => {
  it('should remove accents', () => {
    expect(normalizeForSearch('Lábios')).toBe('labios')
  })

  it('should find Patrícia without accent', () => {
    expect(normalizeForSearch('Patrícia Souza')).toBe('patricia souza')
  })

  it('should be case insensitive', () => {
    expect(normalizeForSearch('ROSTO')).toBe('rosto')
  })
})
