import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import { uploadChatBackground } from '@/lib/storage'
import type { ChatBackgroundRow } from '@/types'

export function useChatBackground() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id
  const queryKey = ['chat-background', coupleId]

  const query = useQuery({
    queryKey,
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_background')
        .select('*')
        .eq('couple_id', coupleId!)
        .maybeSingle()
      if (error) throw error
      return data as ChatBackgroundRow | null
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey })
  }

  const setPreset = useMutation({
    mutationFn: async (preset: string) => {
      const { error } = await supabase
        .from('chat_background')
        .upsert({ couple_id: coupleId!, preset, photo_path: null, updated_by: user!.id })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const setPhoto = useMutation({
    mutationFn: async (file: File) => {
      const path = await uploadChatBackground(coupleId!, file)
      const { error } = await supabase
        .from('chat_background')
        .upsert({ couple_id: coupleId!, preset: null, photo_path: path, updated_by: user!.id })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const reset = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('chat_background').delete().eq('couple_id', coupleId!)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, setPreset, setPhoto, reset }
}
