import { cn } from '@/lib/utils'
import type { Mood } from '@/types'

export const MOODS: Mood[] = [
  { emoji: '😢', label: 'Sedih' },
  { emoji: '😐', label: 'Biasa' },
  { emoji: '😊', label: 'Senang' },
  { emoji: '😍', label: 'Cinta Banget' },
  { emoji: '😤', label: 'Kesal' },
]

export function EmojiPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (emoji: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.emoji}
          type="button"
          title={mood.label}
          onClick={() => onChange(mood.emoji)}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full text-2xl transition',
            value === mood.emoji
              ? 'bg-primary/15 ring-2 ring-primary'
              : 'opacity-50 hover:opacity-100',
          )}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  )
}
