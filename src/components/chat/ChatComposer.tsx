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
  onSend: (input: ComposerSendInput) => void
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

  function handleSendText() {
    if (!text.trim()) return
    onSend({ type: 'text', content: text.trim() })
    setText('')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const limit = isVideo ? CHAT_MEDIA_LIMITS.video : CHAT_MEDIA_LIMITS.image
    if (file.size > limit) {
      alert(`File terlalu besar (maks ${Math.round(limit / 1024 / 1024)}MB)`)
      e.target.value = ''
      return
    }
    const ext = file.name.split('.').pop() ?? (isVideo ? 'mp4' : 'jpg')
    onSend({ type: isVideo ? 'video' : 'image', file, fileExt: ext })
    e.target.value = ''
  }

  function handleAudioRecorded(blob: Blob, durationMs: number) {
    if (blob.size > CHAT_MEDIA_LIMITS.audio) {
      alert('Rekaman terlalu panjang/besar.')
      return
    }
    onSend({ type: 'audio', file: blob, fileExt: 'webm', mediaDurationMs: durationMs })
  }

  function handleGifPick(gif: GifResult) {
    onSend({ type: 'gif', content: gif.url })
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
