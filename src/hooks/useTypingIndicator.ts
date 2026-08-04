import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'

const TYPING_TIMEOUT_MS = 3000

/** Ephemeral "mengetik..." status via Supabase Realtime Broadcast — never touches the database. */
export function useTypingIndicator() {
  const { couple } = useCouple()
  const { user } = useAuth()
  const coupleId = couple?.id
  const [partnerTyping, setPartnerTyping] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!coupleId) return
    const channel = supabase.channel(`typing:${coupleId}`).on(
      'broadcast',
      { event: 'typing' },
      (payload) => {
        if (payload.payload.userId === user?.id) return
        setPartnerTyping(true)
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setPartnerTyping(false), TYPING_TIMEOUT_MS)
      },
    )
    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(timeoutRef.current)
    }
  }, [coupleId, user?.id])

  function notifyTyping() {
    channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { userId: user?.id } })
  }

  return { partnerTyping, notifyTyping }
}
