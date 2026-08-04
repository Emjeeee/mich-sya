import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { AttachIcon, SendIcon } from '@/components/ui/pixel-icons'
import { CHAT_MEDIA_LIMITS } from '@/lib/storage'
import { EmojiPickerPopover } from './EmojiPickerPopover'
import { GifPickerPopover } from './GifPickerPopover'
import { AudioRecorderButton } from './AudioRecorderButton'
import type { GifResult } from '@/lib/giphy'
import type { MessageType } from '@/types'

export interface ComposerSendInput {
  type: MessageType
  content?: string
  file?: File | Blob
  fileExt?: string
  mediaDurationMs?: number
}

export function ChatComposer({
  onSend,
  onTyping,
}: {
  onSend: (input: ComposerSendInput) => Promise<unknown>
  onTyping: () => void
}) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showGif, setShowGif] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showEmoji && !showGif) return
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
        setShowGif(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [showEmoji, showGif])

  async function handleSendText() {
    const value = text.trim()
    if (!value) return
    setText('')
    try {
      await onSend({ type: 'text', content: value })
    } catch {
      // Restore what was typed instead of silently losing it — a failed
      // send used to clear the box unconditionally, so a genuine network/RLS
      // error looked identical to a successful send until the bubble never
      // showed up, and there was nothing left to resend but memory.
      setText(value)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    // Multiple files become multiple separate messages, one per file — chat
    // doesn't have a "one message, many photos" shape the way Gallery/Memories
    // do, so this is a loop over the existing single-send path rather than a
    // batch insert.
    for (const file of files) {
      const isVideo = file.type.startsWith('video/')
      const limit = isVideo ? CHAT_MEDIA_LIMITS.video : CHAT_MEDIA_LIMITS.image
      if (file.size > limit) {
        alert(`${file.name}: file terlalu besar (maks ${Math.round(limit / 1024 / 1024)}MB)`)
        continue
      }
      const ext = file.name.split('.').pop() ?? (isVideo ? 'mp4' : 'jpg')
      // No text to restore on failure here (unlike handleSendText) — the
      // global error banner in ChatPage already surfaces send failures via
      // sendMessage.isError; this just avoids an unhandled-rejection warning.
      onSend({ type: isVideo ? 'video' : 'image', file, fileExt: ext }).catch(() => {})
    }
  }

  function handleAudioRecorded(blob: Blob, durationMs: number) {
    if (blob.size > CHAT_MEDIA_LIMITS.audio) {
      alert('Rekaman terlalu panjang/besar.')
      return
    }
    onSend({ type: 'audio', file: blob, fileExt: 'webm', mediaDurationMs: durationMs }).catch(() => {})
  }

  function handleGifPick(gif: GifResult) {
    onSend({ type: 'gif', content: gif.url }).catch(() => {})
    setShowGif(false)
  }

  return (
    <div ref={rootRef} className="relative border-t border-border bg-card p-3">
      {showEmoji && (
        <div className="absolute bottom-full left-3 mb-2 z-20">
          <EmojiPickerPopover
            onPick={(emoji) => {
              setText((t) => t + emoji)
              setShowEmoji(false)
            }}
          />
        </div>
      )}
      {showGif && (
        <div className="absolute bottom-full left-3 mb-2 z-20">
          <GifPickerPopover onPick={handleGifPick} />
        </div>
      )}

      <div className="flex items-end gap-1.5">
        <button
          onClick={() => {
            setShowEmoji((s) => !s)
            setShowGif(false)
          }}
          aria-label="Emoji"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-muted transition hover:bg-secondary/15"
        >
          😊
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Lampirkan foto/video"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-secondary/15 hover:text-primary"
        >
          <AttachIcon className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => {
            setShowGif((s) => !s)
            setShowEmoji(false)
          }}
          aria-label="GIF"
          className="flex h-9 shrink-0 items-center justify-center rounded-full px-2 text-xs font-bold text-muted transition hover:bg-secondary/15 hover:text-primary"
        >
          GIF
        </button>

        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            onTyping()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendText()
            }
          }}
          placeholder="Tulis pesan..."
          rows={1}
          className="min-h-9 max-h-24 flex-1 resize-none py-2"
        />

        {text.trim() ? (
          <Button size="sm" onClick={handleSendText} className="shrink-0">
            <SendIcon className="h-4 w-4" />
          </Button>
        ) : (
          <AudioRecorderButton onRecorded={handleAudioRecorded} />
        )}
      </div>
    </div>
  )
}
