import { useCallback, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import { uploadChatMedia } from '@/lib/storage'
import type { MessageRow, MessageType } from '@/types'

const PAGE_SIZE = 50

/**
 * The one hook in this app that's actually real-time — everything else
 * syncs via react-query polling/refetch-on-focus, which isn't tight enough
 * for a chat UI. New/updated rows are pushed into the query cache directly
 * from the Supabase Realtime subscription rather than waiting on a refetch.
 */
export function useMessages() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id
  const userId = user?.id
  // Memoized so the Realtime subscription effect below (which lists queryKey
  // as a dependency) doesn't tear down and recreate its channel on every
  // render — a plain array literal here is a new reference every call, which
  // meant typing in chat search or sending a message (both cause ChatPage to
  // re-render) was constantly resubscribing the same `messages:${coupleId}`
  // topic, the exact "two subscriptions on one topic" crash pattern already
  // hit and fixed once before in useUnreadMessages.ts.
  const queryKey = useMemo(() => ['messages', coupleId], [coupleId])

  const query = useQuery({
    queryKey,
    enabled: !!coupleId,
    queryFn: async () => {
      // "Delete for me" hides a message only from the deleter's own view —
      // applied at fetch time (not via RLS, since the partner must still see it).
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', coupleId!)
        .not('hidden_for', 'cs', `{${userId}}`)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
      if (error) throw error
      return (data as MessageRow[]).reverse() // oldest first for rendering top-to-bottom
    },
  })

  const loadOlder = useMutation({
    mutationFn: async () => {
      const current = queryClient.getQueryData<MessageRow[]>(queryKey) ?? []
      const oldest = current[0]
      if (!oldest) return []
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', coupleId!)
        .not('hidden_for', 'cs', `{${userId}}`)
        .lt('created_at', oldest.created_at)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
      if (error) throw error
      return (data as MessageRow[]).reverse()
    },
    onSuccess: (older) => {
      if (older.length === 0) return
      queryClient.setQueryData<MessageRow[]>(queryKey, (curr) => [...older, ...(curr ?? [])])
    },
  })

  // Used by chat search to jump to an older message outside the currently
  // loaded window — re-anchors the loaded page around it (so "load older"
  // still works afterwards, relative to the new oldest message).
  const jumpToMessage = useCallback(
    async (target: MessageRow) => {
      const current = queryClient.getQueryData<MessageRow[]>(queryKey) ?? []
      if (current.some((m) => m.id === target.id)) return
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', coupleId!)
        .not('hidden_for', 'cs', `{${userId}}`)
        .lte('created_at', target.created_at)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
      if (error) throw error
      queryClient.setQueryData<MessageRow[]>(queryKey, (data as MessageRow[]).reverse())
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coupleId, queryClient, userId],
  )

  useEffect(() => {
    if (!coupleId || !userId) return

    const channel = supabase
      .channel(`messages:${coupleId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as MessageRow
          if (row.hidden_for?.includes(userId)) return
          queryClient.setQueryData<MessageRow[]>(queryKey, (curr) => {
            if (!curr) return [row]
            if (curr.some((m) => m.id === row.id)) return curr
            return [...curr, row]
          })
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as MessageRow
          // Hidden for me (by my own "delete for me" action) — drop it from
          // my view entirely; the partner's subscription still keeps it.
          if (row.hidden_for?.includes(userId)) {
            queryClient.setQueryData<MessageRow[]>(queryKey, (curr) => curr?.filter((m) => m.id !== row.id) ?? curr)
            return
          }
          queryClient.setQueryData<MessageRow[]>(
            queryKey,
            (curr) => curr?.map((m) => (m.id === row.id ? row : m)) ?? curr,
          )
        },
      )
      .subscribe((status) => {
        // A silently dropped/failed channel used to mean messages just never
        // showed up (no detection, no recovery) — this is the belt-and-braces
        // half of that fix: force a refetch once the channel comes back so a
        // temporary drop self-heals instead of staying stuck until an
        // unrelated remount/focus event.
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          queryClient.invalidateQueries({ queryKey })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [coupleId, userId, queryClient, queryKey])

  const sendMessage = useMutation({
    mutationFn: async (input: {
      type: MessageType
      content?: string
      file?: File | Blob
      fileExt?: string
      mediaDurationMs?: number
      replyToId?: string
    }) => {
      if (!coupleId || !user) throw new Error('Belum siap — coupleId/user belum tersedia')
      let media_path: string | null = null
      if (input.file && input.fileExt) {
        media_path = await uploadChatMedia(coupleId!, input.file, input.fileExt)
      }
      const { data, error } = await supabase
        .from('messages')
        .insert({
          couple_id: coupleId!,
          sender_id: user!.id,
          type: input.type,
          content: input.content ?? null,
          media_path,
          media_duration_ms: input.mediaDurationMs ?? null,
          reply_to_id: input.replyToId ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return data as MessageRow
    },
    // Append on success directly, instead of relying solely on the Realtime
    // INSERT echo — that echo used to be the ONLY way a just-sent message
    // ever appeared, even in the sender's own view, so a slow/dropped
    // channel made a successful send look like it silently failed (the
    // reported "have to retype the same message several times" bug). This
    // makes the sender's own view correct immediately regardless of Realtime
    // timing; the echo still fires too but is deduped by id like normal.
    onSuccess: (row) => {
      queryClient.setQueryData<MessageRow[]>(queryKey, (curr) => {
        if (!curr) return [row]
        if (curr.some((m) => m.id === row.id)) return curr
        return [...curr, row]
      })
    },
  })

  const markRead = useCallback(async () => {
    if (!coupleId || !user) return
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('couple_id', coupleId)
      .neq('sender_id', user.id)
      .is('read_at', null)
  }, [coupleId, user])

  const deleteMessage = useMutation({
    mutationFn: async (input: { message: MessageRow; scope: 'me' | 'everyone' }) => {
      if (!user) throw new Error('Belum siap — user belum tersedia')
      if (input.scope === 'everyone') {
        const { error } = await supabase
          .from('messages')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.message.id)
        if (error) throw error
        return
      }
      const nextHiddenFor = Array.from(new Set([...(input.message.hidden_for ?? []), user!.id]))
      const { error } = await supabase
        .from('messages')
        .update({ hidden_for: nextHiddenFor })
        .eq('id', input.message.id)
      if (error) throw error
    },
    // Realtime UPDATE handler patches the tombstone (or drops the message
    // from my own cache, for "delete for me") — see the effect above.
  })

  return { ...query, loadOlder, jumpToMessage, sendMessage, markRead, deleteMessage }
}
