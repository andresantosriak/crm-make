import { describe, it, expect } from 'vitest'
import { getClientName, daysUntilBirthday, getClientTags } from '../client-utils'
import type { Client } from '@/types'

const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'Mariana Alves',
    phone: null,
    birthday: null,
    active: true,
    createdBy: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'c2',
    name: 'Patrícia Souza',
    phone: null,
    birthday: null,
    active: true,
    createdBy: null,
    createdAt: '',
    updatedAt: '',
  },
]

describe('getClientName', () => {
  it('should return "Consumidor final" when clientId is null', () => {
    expect(getClientName(null, mockClients)).toBe('Consumidor final')
  })

  it('should return client name when found', () => {
    expect(getClientName('c1', mockClients)).toBe('Mariana Alves')
    expect(getClientName('c2', mockClients)).toBe('Patrícia Souza')
  })

  it('should return "Cliente removido" when clientId not found', () => {
    expect(getClientName('nonexistent-id', mockClients)).toBe('Cliente removido')
  })

  it('should return "Consumidor final" when clients array is empty', () => {
    expect(getClientName(null, [])).toBe('Consumidor final')
  })

  it('should return "Cliente removido" for valid id in empty clients', () => {
    expect(getClientName('c1', [])).toBe('Cliente removido')
  })
})

describe('daysUntilBirthday', () => {
  it('should return 0 when today is the birthday', () => {
    const today = new Date()
    const birthday = `1990-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(daysUntilBirthday(birthday)).toBe(0)
  })

  it('should return 1 for tomorrow birthday', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const birthday = `1990-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
    expect(daysUntilBirthday(birthday)).toBe(1)
  })

  it('should return days until next year if birthday already passed', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const birthday = `1990-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    expect(daysUntilBirthday(birthday)).toBeGreaterThan(300)
  })
})

describe('getClientTags', () => {
  it('should return VIP tag when totalSpent >= threshold', () => {
    const tags = getClientTags(null, 500, 500, 7)
    expect(tags).toHaveLength(1)
    expect(tags[0]!.label).toBe('VIP')
  })

  it('should return no VIP tag when totalSpent < threshold', () => {
    const tags = getClientTags(null, 499, 500, 7)
    expect(tags).toHaveLength(0)
  })

  it('should return ANIVERSÁRIO tag on exact birthday', () => {
    const today = new Date()
    const birthday = `1990-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const tags = getClientTags(birthday, 0, 500, 7)
    expect(tags).toHaveLength(1)
    expect(tags[0]!.label).toBe('ANIVERSÁRIO')
  })

  it('should return both tags when VIP and birthday', () => {
    const today = new Date()
    const birthday = `1990-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const tags = getClientTags(birthday, 600, 500, 7)
    expect(tags).toHaveLength(2)
    expect(tags.map(t => t.label)).toEqual(['VIP', 'ANIVERSÁRIO'])
  })

  it('should not return ANIVERSÁRIO when birthday is too far', () => {
    const farDate = new Date()
    farDate.setDate(farDate.getDate() + 30)
    const birthday = `1990-${String(farDate.getMonth() + 1).padStart(2, '0')}-${String(farDate.getDate()).padStart(2, '0')}`
    const tags = getClientTags(birthday, 0, 500, 7)
    expect(tags).toHaveLength(0)
  })
})
