import { useQuery } from '@tanstack/react-query'
import { getSignedPhotoUrl } from '@/lib/storage'

/** Signed URL for a private-bucket photo path, refreshed well before it expires. */
export function useSignedUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ['signed-url', path],
    enabled: !!path,
    staleTime: 30 * 60_000, // signed for 1h server-side, refetch after 30min
    queryFn: () => getSignedPhotoUrl(path!),
  })
}
