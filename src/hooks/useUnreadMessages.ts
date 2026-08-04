import { useEffect, useId } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'

/** Count of partner-sent messages not yet marked read — used for nav badges
 * and the dashboard notice, so it stays live even when ChatPage isn't mounted. */
export function useUnreadMessages() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id
  // Sidebar, BottomNav, and the AppShell notice all mount this hook at once
  // (both nav bars stay in the DOM regardless of viewport — only CSS hides
  // one of them) — each instance needs its own channel name, or the second
  // `.subscribe()` on the same topic throws and crashes the whole tree.
  const instanceId = useId()

  const query = useQuery({
    queryKey: ['unread-messages', coupleId],
    enabled: !!coupleId && !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', coupleId!)
        .neq('sender_id', user!.id)
        .is('read_at', null)
        .is('deleted_at', null)
      if (error) throw error
      return count ?? 0
    },
  })

  useEffect(() => {
    if (!coupleId) return

    const channel = supabase
      .channel(`unread-messages:${coupleId}:${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `couple_id=eq.${coupleId}` },
        () => queryClient.invalidateQueries({ queryKey: ['unread-messages', coupleId] }),
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          queryClient.invalidateQueries({ queryKey: ['unread-messages', coupleId] })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [coupleId, instanceId, queryClient])

  return query.data ?? 0
}
