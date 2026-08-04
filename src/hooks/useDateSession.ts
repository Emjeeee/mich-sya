import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { DateSessionRow } from '@/types'

export interface EndSessionInput {
  id: string
  title?: string
  summary?: string
}

// Best-effort — resolves to null instead of rejecting when denied/unavailable,
// since a date session should still start/end without location.
function tryGetPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  })
}

export function useDateSession() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id

  const query = useQuery({
    queryKey: ['date-session-active', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('date_sessions')
        .select('*')
        .eq('couple_id', coupleId!)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as DateSessionRow | null
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['date-session-active', coupleId] })
  }

  const startSession = useMutation({
    mutationFn: async () => {
      const pos = await tryGetPosition()
      const { data, error } = await supabase
        .from('date_sessions')
        .insert({
          couple_id: coupleId!,
          created_by: user!.id,
          start_lat: pos?.coords.latitude ?? null,
          start_lng: pos?.coords.longitude ?? null,
        })
        .select('*')
        .single()
      if (error) throw error
      return data as DateSessionRow
    },
    onSuccess: invalidate,
  })

  const endSession = useMutation({
    mutationFn: async (input: EndSessionInput) => {
      const pos = await tryGetPosition()
      const { data, error } = await supabase
        .from('date_sessions')
        .update({
          ended_at: new Date().toISOString(),
          title: input.title || null,
          summary: input.summary || null,
          end_lat: pos?.coords.latitude ?? null,
          end_lng: pos?.coords.longitude ?? null,
        })
        .eq('id', input.id)
        .select('*')
        .single()
      if (error) throw error
      return data as DateSessionRow
    },
    onSuccess: invalidate,
  })

  return { ...query, startSession, endSession }
}
