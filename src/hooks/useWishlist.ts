import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { WishlistItemRow } from '@/types'

export function useWishlist() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id

  const query = useQuery({
    queryKey: ['wishlist', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('is_done', { ascending: true })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as WishlistItemRow[]
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['wishlist', coupleId] })
  }

  const addItem = useMutation({
    mutationFn: async (input: { title: string; description?: string; image_url?: string }) => {
      const { error } = await supabase.from('wishlist_items').insert({
        couple_id: coupleId!,
        created_by: user!.id,
        title: input.title,
        description: input.description || null,
        image_url: input.image_url || null,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const toggleDone = useMutation({
    mutationFn: async (input: { id: string; is_done: boolean }) => {
      const { error } = await supabase
        .from('wishlist_items')
        .update({ is_done: input.is_done })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, addItem, toggleDone, removeItem }
}
