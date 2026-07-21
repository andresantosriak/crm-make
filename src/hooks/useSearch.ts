import { useState, useMemo, useCallback } from 'react'
import { normalizeForSearch } from '@/lib/utils'

export function useSearch<T>(items: T[], accessor: (item: T) => string) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => {
      const normalizedQuery = normalizeForSearch(query)
      return items.filter((item) =>
        normalizeForSearch(accessor(item)).includes(normalizedQuery),
      )
    },
    [items, query, accessor],
  )

  const handleSetQuery = useCallback((value: string) => {
    setQuery(value)
  }, [])

  return { query, setQuery: handleSetQuery, filtered }
}
