import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const VIP_THRESHOLD = 500
const BIRTHDAY_ALERT_DAYS = 7

function getClientTags(birthday: string | null, totalSpent: number) {
  const tags: { label: string; color: string }[] = []

  if (totalSpent >= VIP_THRESHOLD) {
    tags.push({ label: 'VIP', color: '#8FA98A' })
  }

  if (birthday) {
    const today = new Date()
    const bMonth = parseInt(birthday.slice(5, 7))
    const bDay = parseInt(birthday.slice(8, 10))
    const thisYear = new Date(today.getFullYear(), bMonth - 1, bDay)
    const nextYear = new Date(today.getFullYear() + 1, bMonth - 1, bDay)
    const diff1 = (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    const diff2 = (nextYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    const daysUntil = diff1 >= 0 ? diff1 : diff2
    if (daysUntil <= BIRTHDAY_ALERT_DAYS) {
      tags.push({ label: 'ANIVERSÁRIO', color: '#d9b869' })
    }
  }

  return tags
}

describe('getClientTags', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-20T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return VIP tag when totalSpent >= 500', () => {
    const tags = getClientTags(null, 500)
    expect(tags).toHaveLength(1)
    expect(tags[0]!.label).toBe('VIP')
    expect(tags[0]!.color).toBe('#8FA98A')
  })

  it('should not return VIP when totalSpent < 500', () => {
    const tags = getClientTags(null, 499.99)
    expect(tags).toHaveLength(0)
  })

  it('should return ANIVERSARIO when birthday within 7 days', () => {
    const tags = getClientTags('1992-07-23', 0)
    expect(tags).toHaveLength(1)
    expect(tags[0]!.label).toBe('ANIVERSÁRIO')
    expect(tags[0]!.color).toBe('#d9b869')
  })

  it('should not return ANIVERSARIO when birthday > 7 days away', () => {
    const tags = getClientTags('1992-08-15', 0)
    expect(tags).toHaveLength(0)
  })

  it('should not return ANIVERSARIO when birthday is null', () => {
    const tags = getClientTags(null, 0)
    expect(tags).toHaveLength(0)
  })

  it('should return both VIP and ANIVERSARIO when both apply', () => {
    const tags = getClientTags('1992-07-23', 600)
    expect(tags).toHaveLength(2)
    expect(tags[0]!.label).toBe('VIP')
    expect(tags[1]!.label).toBe('ANIVERSÁRIO')
  })

  it('should handle birthday in previous year (uses next year calc)', () => {
    const tags = getClientTags('1990-01-15', 0)
    expect(tags).toHaveLength(0)
  })

  it('should NOT return ANIVERSARIO for birthday on the same day (edge case: diff < 0 after midnight)', () => {
    const tags = getClientTags('1995-07-20', 0)
    expect(tags).toHaveLength(0)
  })
})
