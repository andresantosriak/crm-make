import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../useSearch'

const items = [
  { name: 'Batom Matte Vermelho Rubi' },
  { name: 'Máscara Volume Extremo' },
  { name: 'Paleta Nude Sunset' },
  { name: 'Base Líquida Segunda Pele' },
]

describe('useSearch', () => {
  it('should return all items when query is empty', () => {
    const { result } = renderHook(() => useSearch(items, (i) => i.name))
    expect(result.current.filtered).toHaveLength(4)
  })

  it('should filter case-insensitive (batom)', () => {
    const { result } = renderHook(() => useSearch(items, (i) => i.name))
    act(() => result.current.setQuery('batom'))
    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0]!.name).toBe('Batom Matte Vermelho Rubi')
  })

  it('should filter uppercase with accent (MÁSCARA)', () => {
    const { result } = renderHook(() => useSearch(items, (i) => i.name))
    act(() => result.current.setQuery('MÁSCARA'))
    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0]!.name).toBe('Máscara Volume Extremo')
  })

  it('should find accented names when searching without accent (accent-insensitive)', () => {
    const { result } = renderHook(() => useSearch(items, (i) => i.name))
    act(() => result.current.setQuery('MASCARA'))
    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0]!.name).toBe('Máscara Volume Extremo')
  })

  it('should find Líquida when searching "liquida"', () => {
    const { result } = renderHook(() => useSearch(items, (i) => i.name))
    act(() => result.current.setQuery('liquida'))
    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0]!.name).toBe('Base Líquida Segunda Pele')
  })

  it('should return empty array for no match', () => {
    const { result } = renderHook(() => useSearch(items, (i) => i.name))
    act(() => result.current.setQuery('xyz'))
    expect(result.current.filtered).toHaveLength(0)
  })

  it('should update filtered reactively on setQuery', () => {
    const { result } = renderHook(() => useSearch(items, (i) => i.name))
    act(() => result.current.setQuery('paleta'))
    expect(result.current.filtered).toHaveLength(1)
    act(() => result.current.setQuery(''))
    expect(result.current.filtered).toHaveLength(4)
  })
})
