import { useEffect, useState } from 'react'
import { getTrendingGifs, searchGifs, type GifResult } from '@/lib/giphy'

/** Debounced GIPHY search — shows trending GIFs until the user types something. */
export function useGifSearch(query: string) {
  const [results, setResults] = useState<GifResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const timeout = setTimeout(
      async () => {
        try {
          const res = query.trim() ? await searchGifs(query) : await getTrendingGifs()
          if (!cancelled) setResults(res)
        } catch {
          if (!cancelled) setResults([])
        } finally {
          if (!cancelled) setLoading(false)
        }
      },
      query.trim() ? 450 : 0,
    )

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query])

  return { results, loading }
}
