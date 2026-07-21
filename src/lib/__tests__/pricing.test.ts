import { describe, it, expect } from 'vitest'
import { floor90, ceil90, round90, calcMarkup, calcMargin } from '../pricing'

describe('floor90', () => {
  it('should round 50.40 down to 49.90', () => {
    expect(floor90(50.40)).toBeCloseTo(49.90)
  })

  it('should keep 49.90 stable', () => {
    expect(floor90(49.90)).toBeCloseTo(49.90)
  })

  it('should handle values already ending in .90', () => {
    expect(floor90(50.90)).toBeCloseTo(50.90)
  })
})

describe('ceil90', () => {
  it('should round 50.40 up to 50.90', () => {
    expect(ceil90(50.40)).toBeCloseTo(50.90)
  })

  it('should keep 49.90 stable', () => {
    expect(ceil90(49.90)).toBeCloseTo(49.90)
  })

  it('should handle values already ending in .90', () => {
    expect(ceil90(50.90)).toBeCloseTo(50.90)
  })
})

describe('round90', () => {
  it('should round 50.10 to 49.90 (closer to floor)', () => {
    expect(round90(50.10)).toBeCloseTo(49.90)
  })

  it('should round 50.70 to 50.90 (closer to ceil)', () => {
    expect(round90(50.70)).toBeCloseTo(50.90)
  })

  it('should round 56.00 to 55.90 (markup 180% over cost 20)', () => {
    expect(round90(56.00)).toBeCloseTo(55.90)
  })

  it('should round tie (50.40) to floor 49.90 (empate -> floor)', () => {
    expect(round90(50.40)).toBeCloseTo(49.90)
  })

  it('should handle zero', () => {
    const result = round90(0)
    expect(typeof result).toBe('number')
  })
})

describe('calcMarkup', () => {
  it('should calculate markup for Batom (14 -> 39.90) as ~185%', () => {
    expect(calcMarkup(14, 39.90)).toBeCloseTo(185, 0)
  })

  it('should return 0 when cost is 0', () => {
    expect(calcMarkup(0, 39.90)).toBe(0)
  })

  it('should return 0 when cost is negative', () => {
    expect(calcMarkup(-5, 39.90)).toBe(0)
  })
})

describe('calcMargin', () => {
  it('should calculate margin for Batom (14 / 39.90) as ~64.9%', () => {
    expect(calcMargin(14, 39.90)).toBeCloseTo(64.9, 0)
  })

  it('should return 0 when price is 0', () => {
    expect(calcMargin(14, 0)).toBe(0)
  })

  it('should return 0 when price is negative', () => {
    expect(calcMargin(14, -10)).toBe(0)
  })
})
