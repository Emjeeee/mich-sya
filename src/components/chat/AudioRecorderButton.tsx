import { useState } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { MicIcon, SendIcon } from '@/components/ui/pixel-icons'

function formatMs(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioRecorderButton({
  onRecorded,
}: {
  onRecorded: (blob: Blob, durationMs: number) => void
}) {
  const { recording, durationMs, start, stop, cancel } = useAudioRecorder()
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    try {
      setError(null)
      await start()
    } catch {
      setError('Izin mikrofon ditolak')
    }
  }

  async function handleFinish() {
    const result = await stop()
    if (result) onRecorded(result.blob, result.durationMs)
  }

  if (recording) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="w-10 text-xs font-medium text-red-500">{formatMs(durationMs)}</span>
        <button onClick={cancel} className="text-xs text-muted hover:text-red-500">
          Batal
        </button>
        <button
          onClick={handleFinish}
          aria-label="Kirim pesan suara"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white"
        >
          <SendIcon className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleStart}
      title={error ?? 'Rekam pesan suara'}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-secondary/15 hover:text-primary"
    >
      <MicIcon className="h-5 w-5" />
    </button>
  )
}
