import { useRef, useState, type ChangeEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CHAT_BACKGROUND_PRESETS } from '@/lib/chatBackground'
import { useChatBackground } from '@/hooks/useChatBackground'
import { CHAT_MEDIA_LIMITS } from '@/lib/storage'
import { cn } from '@/lib/utils'

export function ChatBackgroundPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: background, setPreset, setPhoto, reset } = useChatBackground()
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > CHAT_MEDIA_LIMITS.image) {
      setError('Foto maksimal 15MB')
      return
    }
    setError(null)
    setPhoto.mutate(file)
  }

  return (
    <Modal open={open} onClose={onClose} title="Background Chat">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Pilihan warna</p>
          <div className="grid grid-cols-3 gap-2">
            {CHAT_BACKGROUND_PRESETS.map((preset) => (
              <button
                key={preset.key}
                onClick={() => setPreset.mutate(preset.key)}
                className={cn(
                  'h-14 rounded-xl border-2 transition',
                  background?.preset === preset.key ? 'border-primary' : 'border-transparent',
                )}
                style={{ background: preset.css }}
                aria-label={preset.label}
                title={preset.label}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted">Foto sendiri (terlihat oleh kalian berdua)</p>
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={setPhoto.isPending}>
            {setPhoto.isPending ? 'Mengunggah...' : 'Upload Foto'}
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {(background?.preset || background?.photo_path) && (
          <Button variant="ghost" size="sm" className="w-full" onClick={() => reset.mutate()} disabled={reset.isPending}>
            Reset ke Default
          </Button>
        )}
      </div>
    </Modal>
  )
}
