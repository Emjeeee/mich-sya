import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { MemoryRow } from '@/types'

export interface MemoryInput {
  title: string
  description?: string
  location?: string
  memory_date: string
  photo_url?: string
}

export function useMemories() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id

  const query = useQuery({
    queryKey: ['memories', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('memory_date', { ascending: false })
      if (error) throw error
      return data as MemoryRow[]
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['memories', coupleId] })
  }

  const addMemory = useMutation({
    mutationFn: async (input: MemoryInput) => {
      const { error } = await supabase.from('memories').insert({
        couple_id: coupleId!,
        created_by: user!.id,
        title: input.title,
        description: input.description || null,
        location: input.location || null,
        memory_date: input.memory_date,
        photo_url: input.photo_url || null,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const removeMemory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('memories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, addMemory, removeMemory }
}
