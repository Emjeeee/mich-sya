import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { CoupleGoalRow } from '@/types'

export function useGoals() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id

  const query = useQuery({
    queryKey: ['goals', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couple_goals')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('is_done', { ascending: true })
        .order('target_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as CoupleGoalRow[]
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['goals', coupleId] })
  }

  const addGoal = useMutation({
    mutationFn: async (input: {
      title: string
      description?: string
      target_date?: string
      linked_wishlist_item_id?: string
    }) => {
      const { error } = await supabase.from('couple_goals').insert({
        couple_id: coupleId!,
        created_by: user!.id,
        title: input.title,
        description: input.description || null,
        target_date: input.target_date || null,
        linked_wishlist_item_id: input.linked_wishlist_item_id || null,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const toggleDone = useMutation({
    mutationFn: async (input: { id: string; is_done: boolean }) => {
      const { error } = await supabase
        .from('couple_goals')
        .update({ is_done: input.is_done })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const removeGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('couple_goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, addGoal, toggleDone, removeGoal }
}
