import { useEffect, useState } from 'react'
import { searchPlaces, type PlaceSearchResult } from '@/lib/journeySearch'

/** Debounced Nominatim search — only fires ~500ms after the user stops typing. */
export function usePlaceSearch(query: string) {
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const timeout = setTimeout(async () => {
      try {
        const res = await searchPlaces(query)
        if (!cancelled) setResults(res)
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query])

  return { results, loading }
}
