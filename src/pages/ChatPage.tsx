import { useEffect, useRef, useState } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { useTypingIndicator } from '@/hooks/useTypingIndicator'
import { useChatBackground } from '@/hooks/useChatBackground'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'
import { useSignedChatMediaUrl } from '@/hooks/useSignedChatMediaUrl'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { ChatComposer, type ComposerSendInput } from '@/components/chat/ChatComposer'
import { ChatSearchPanel } from '@/components/chat/ChatSearchPanel'
import { ChatBackgroundPicker } from '@/components/chat/ChatBackgroundPicker'
import { SearchIcon, PaletteIcon } from '@/components/ui/pixel-icons'
import { presetCss } from '@/lib/chatBackground'
import type { MessageRow } from '@/types'

function groupByDay(messages: MessageRow[]) {
  const groups: { date: string; items: MessageRow[] }[] = []
  for (const m of messages) {
    const date = new Date(m.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const last = groups[groups.length - 1]
    if (last && last.date === date) last.items.push(m)
    else groups.push({ date, items: [m] })
  }
  return groups
}

export function ChatPage() {
  const { user } = useAuth()
  const { couple, isLinked, partnerLabel } = useCouple()
  const { data: messages, isLoading, loadOlder, jumpToMessage, sendMessage, markRead, deleteMessage } =
    useMessages()
  const { partnerTyping, notifyTyping } = useTypingIndicator()
  const { data: background } = useChatBackground()
  const { data: backgroundPhotoUrl } = useSignedChatMediaUrl(background?.photo_path ?? null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [backgroundOpen, setBackgroundOpen] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  useEffect(() => {
    markRead()
  }, [markRead, messages?.length])

  useEffect(() => {
    if (!messages) return
    if (messages.length !== prevCountRef.current) {
      if (!highlightedId) {
        bottomRef.current?.scrollIntoView({ behavior: prevCountRef.current === 0 ? 'auto' : 'smooth' })
      }
      prevCountRef.current = messages.length
    }
  }, [messages, highlightedId])

  useEffect(() => {
    if (!highlightedId) return
    const el = document.getElementById(`message-${highlightedId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timeout = setTimeout(() => setHighlightedId(null), 2000)
    return () => clearTimeout(timeout)
  }, [highlightedId, messages])

  async function handleSearchPick(message: MessageRow) {
    await jumpToMessage(message)
    setSearchOpen(false)
    setSearchQuery('')
    setHighlightedId(message.id)
  }

  if (!couple || !isLinked) {
    return (
      <p className="text-sm text-muted">
        Akun belum terhubung ke pasangan — lihat README untuk setup couple space.
      </p>
    )
  }

  const groups = groupByDay(messages ?? [])
  const backgroundStyle = backgroundPhotoUrl
    ? { backgroundImage: `url(${backgroundPhotoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : background?.preset
      ? { background: presetCss(background.preset) }
      : undefined

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-xl2 border border-border bg-card md:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h1 className="font-heading text-base font-semibold text-text">Chat dengan {partnerLabel}</h1>
          <p className="h-4 text-xs text-primary">{partnerTyping ? 'sedang mengetik...' : ''}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBackgroundOpen(true)}
            aria-label="Ganti background chat"
            title="Ganti background chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-secondary/15 hover:text-primary"
          >
            <PaletteIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Cari pesan"
            title="Cari pesan"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-secondary/15 hover:text-primary"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <ChatSearchPanel query={searchQuery} onQueryChange={setSearchQuery} onPick={handleSearchPick} />
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" style={backgroundStyle}>
        {messages && messages.length >= 50 && (
          <div className="text-center">
            <button
              onClick={() => loadOlder.mutate()}
              disabled={loadOlder.isPending}
              className="text-xs font-medium text-primary hover:underline"
            >
              {loadOlder.isPending ? 'Memuat...' : 'Muat pesan lebih lama'}
            </button>
          </div>
        )}

        {isLoading && <p className="text-center text-sm text-muted">Memuat...</p>}
        {!isLoading && messages?.length === 0 && (
          <p className="text-center text-sm text-muted">Belum ada pesan. Mulai obrolan kalian!</p>
        )}

        {groups.map((group) => (
          <div key={group.date} className="space-y-3">
            <p className="text-center text-[11px] font-medium uppercase tracking-wide text-muted">
              {group.date}
            </p>
            {group.items.map((m) => {
              const isOwn = m.sender_id === user?.id
              return (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isOwn={isOwn}
                  highlighted={highlightedId === m.id}
                  onDeleteForMe={() => deleteMessage.mutate({ message: m, scope: 'me' })}
                  onDeleteForEveryone={isOwn ? () => deleteMessage.mutate({ message: m, scope: 'everyone' }) : undefined}
                />
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatComposer
        onSend={(input: ComposerSendInput) => sendMessage.mutate(input)}
        onTyping={notifyTyping}
      />

      <ChatBackgroundPicker open={backgroundOpen} onClose={() => setBackgroundOpen(false)} />
    </div>
  )
}
