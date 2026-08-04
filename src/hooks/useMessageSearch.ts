import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { MessageRow } from '@/types'

/** Debounced full-text-ish search over this couple's text messages. */
export function useMessageSearch(query: string) {
  const { couple } = useCouple()
  const { user } = useAuth()
  const [results, setResults] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(false)
  const coupleId = couple?.id

  useEffect(() => {
    const trimmed = query.trim()
    if (!coupleId || !user || !trimmed) {
      setResults([])
      return
    }

    let cancelled = false
    setLoading(true)

    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('type', 'text')
        .is('deleted_at', null)
        .not('hidden_for', 'cs', `{${user.id}}`)
        .ilike('content', `%${trimmed}%`)
        .order('created_at', { ascending: false })
        .limit(30)

      if (cancelled) return
      setResults(error ? [] : (data as MessageRow[]))
      setLoading(false)
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query, coupleId, user])

  return { results, loading }
}
