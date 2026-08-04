import { useState } from 'react'
import { useSignedChatMediaUrl } from '@/hooks/useSignedChatMediaUrl'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { MessageRow } from '@/types'

export function MessageBubble({
  message,
  isOwn,
  highlighted,
  onDeleteForMe,
  onDeleteForEveryone,
}: {
  message: MessageRow
  isOwn: boolean
  highlighted?: boolean
  onDeleteForMe?: () => void
  onDeleteForEveryone?: () => void
}) {
  const needsSignedUrl = message.type === 'image' || message.type === 'video' || message.type === 'audio'
  const { data: url } = useSignedChatMediaUrl(needsSignedUrl ? message.media_path : null)
  const isDeleted = !!message.deleted_at
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div id={`message-${message.id}`} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'group relative max-w-[75%] rounded-2xl px-3 py-2 shadow-sm transition-colors duration-700',
          isOwn
            ? 'rounded-br-sm bg-primary text-white'
            : 'rounded-bl-sm border border-border bg-bubble text-bubbleText',
          highlighted && 'ring-2 ring-accent',
        )}
      >
        {/* Speech-bubble tail — a small triangle in the exact same fill as
            the bubble, clipped so it points outward from the flattened corner. */}
        {!isDeleted && (
          <span
            aria-hidden
            className={cn(
              'absolute bottom-0 h-3 w-3',
              isOwn ? '-right-[5px] bg-primary' : '-left-[5px] bg-bubble',
            )}
            style={{
              clipPath: isOwn
                ? 'polygon(0% 0%, 100% 100%, 0% 100%)'
                : 'polygon(100% 0%, 100% 100%, 0% 100%)',
            }}
          />
        )}

        {isDeleted ? (
          <p className="text-xs italic opacity-70">Pesan telah dihapus</p>
        ) : (
          <>
            {message.type === 'text' && (
              <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
            )}
            {message.type === 'gif' && message.content && (
              <img src={message.content} alt="" className="max-h-52 rounded-lg" />
            )}
            {message.type === 'image' &&
              (url ? (
                <img src={url} alt="" className="max-h-64 rounded-lg object-cover" />
              ) : (
                <div className="h-32 w-32 animate-pulse rounded-lg bg-black/10" />
              ))}
            {message.type === 'video' &&
              (url ? (
                <video src={url} controls className="max-h-64 rounded-lg" />
              ) : (
                <div className="h-32 w-48 animate-pulse rounded-lg bg-black/10" />
              ))}
            {message.type === 'audio' &&
              (url ? (
                <audio src={url} controls className="w-56" />
              ) : (
                <div className="h-10 w-48 animate-pulse rounded-lg bg-black/10" />
              ))}
          </>
        )}

        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
          <span>
            {new Date(message.created_at).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isOwn && !isDeleted && <span>{message.read_at ? '✓✓' : '✓'}</span>}
        </div>

        {!isDeleted && onDeleteForMe && (
          <button
            onClick={() => setConfirmOpen(true)}
            aria-label="Hapus pesan"
            className={cn(
              'absolute -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white group-hover:flex',
              isOwn ? '-right-2' : '-left-2',
            )}
          >
            ✕
          </button>
        )}
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Hapus Pesan">
        <div className="space-y-2">
          {onDeleteForEveryone && (
            <Button
              variant="danger"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onDeleteForEveryone()
                setConfirmOpen(false)
              }}
            >
              Hapus untuk Semua
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              onDeleteForMe?.()
              setConfirmOpen(false)
            }}
          >
            Hapus untuk Saya
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setConfirmOpen(false)}>
            Batal
          </Button>
        </div>
      </Modal>
    </div>
  )
}
