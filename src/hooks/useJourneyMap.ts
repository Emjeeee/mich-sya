import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { JourneyPlaceRow } from '@/types'

export interface JourneyPlaceInput {
  place_name: string
  description?: string
  lat: number
  lng: number
  visited_date?: string
  photo_url?: string
}

export function useJourneyMap() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id

  const query = useQuery({
    queryKey: ['journey', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_map')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('visited_date', { ascending: false, nullsFirst: false })
      if (error) throw error
      return data as JourneyPlaceRow[]
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['journey', coupleId] })
  }

  const addPlace = useMutation({
    mutationFn: async (input: JourneyPlaceInput) => {
      const { error } = await supabase.from('journey_map').insert({
        couple_id: coupleId!,
        created_by: user!.id,
        place_name: input.place_name,
        description: input.description || null,
        lat: input.lat,
        lng: input.lng,
        visited_date: input.visited_date || null,
        photo_url: input.photo_url || null,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const removePlace = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('journey_map').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, addPlace, removePlace }
}
