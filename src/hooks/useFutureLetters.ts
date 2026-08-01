import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { FutureLetterRow } from '@/types'

export function useFutureLetters() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id

  const query = useQuery({
    queryKey: ['letters', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      // Read through the view: it masks `content` server-side until unlock_date.
      const { data, error } = await supabase
        .from('future_letters_view')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('unlock_date', { ascending: true })
      if (error) throw error
      return data as FutureLetterRow[]
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['letters', coupleId] })
  }

  const addLetter = useMutation({
    mutationFn: async (input: { title: string; content: string; unlock_date: string }) => {
      const { error } = await supabase.from('future_letters').insert({
        couple_id: coupleId!,
        created_by: user!.id,
        title: input.title,
        content: input.content,
        unlock_date: input.unlock_date,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const openLetter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('future_letters')
        .update({ is_opened: true, opened_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, addLetter, openLetter }
}
