import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { uploadCouplePhoto, getSignedPhotoUrls } from '@/lib/storage'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { GalleryPhotoRow } from '@/types'

export function useGallery() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id

  const query = useQuery({
    queryKey: ['gallery', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as GalleryPhotoRow[]
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['gallery', coupleId] })
  }

  const addPhotos = useMutation({
    mutationFn: async (files: File[]) => {
      const paths = await Promise.all(files.map((file) => uploadCouplePhoto(coupleId!, 'gallery', file)))
      const rows = paths.map((photo_path) => ({
        couple_id: coupleId!,
        created_by: user!.id,
        photo_path,
      }))
      const { error } = await supabase.from('gallery_photos').insert(rows)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const removePhoto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery_photos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, addPhotos, removePhoto }
}

/** Batch-signed URLs for a set of gallery photo paths, keyed by path. */
export function useGalleryUrls(paths: string[]) {
  return useQuery({
    queryKey: ['gallery-urls', paths],
    enabled: paths.length > 0,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000, // same reasoning as useSignedUrl — avoid evicting still-valid signed URLs
    queryFn: () => getSignedPhotoUrls(paths),
  })
}
