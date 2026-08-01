import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import { todayDateString } from '@/lib/dates'
import type { DailyVibeRow } from '@/types'

export function useDailyVibe() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id
  const today = todayDateString()

  const query = useQuery({
    queryKey: ['vibes', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_vibes')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('entry_date', { ascending: false })
        .limit(30)
      if (error) throw error
      return data as DailyVibeRow[]
    },
  })

  const myToday = query.data?.find((v) => v.user_id === user?.id && v.entry_date === today)

  const setToday = useMutation({
    mutationFn: async (input: { mood: string; note?: string }) => {
      const { error } = await supabase.from('daily_vibes').upsert(
        {
          couple_id: coupleId!,
          user_id: user!.id,
          entry_date: today,
          mood: input.mood,
          note: input.note || null,
        },
        { onConflict: 'user_id,entry_date' },
      )
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vibes', coupleId] }),
  })

  return { ...query, myToday, setToday }
}
