import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getPublicCoverUrl, uploadCoverPhoto } from '@/lib/storage'
import { useCouple } from '@/contexts/CoupleContext'
import type { CouplePublicRow } from '@/types'

/** Authenticated: lets a partner upload/replace the landing-page cover photo. */
export function useCoverPhotoUpload() {
  const { couple } = useCouple()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!couple) throw new Error('Couple belum terhubung')
      const path = await uploadCoverPhoto(couple.id, file)
      const { error } = await supabase
        .from('couple')
        .update({ cover_photo_path: path })
        .eq('id', couple.id)
      if (error) throw error
      return path
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] })
      queryClient.invalidateQueries({ queryKey: ['couple-public'] })
    },
  })
}

/** Public (works pre-login): reads the couple's cover photo for the landing page. */
export function usePublicCoverPhoto() {
  const { data, isLoading } = useQuery({
    queryKey: ['couple-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couple_public_view')
        .select('id, cover_photo_path')
        .maybeSingle()
      if (error) throw error
      return data as CouplePublicRow | null
    },
  })

  const url = data?.cover_photo_path ? getPublicCoverUrl(data.cover_photo_path) : null
  return { url, isLoading }
}
