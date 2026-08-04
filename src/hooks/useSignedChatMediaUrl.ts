import { useQuery } from '@tanstack/react-query'
import { getSignedChatMediaUrl } from '@/lib/storage'

/** Same idea as useSignedUrl, but for the chat-media bucket. */
export function useSignedChatMediaUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ['signed-chat-url', path],
    enabled: !!path,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000, // same reasoning as useSignedUrl — avoid evicting a still-valid signed URL
    queryFn: () => getSignedChatMediaUrl(path!),
  })
}
