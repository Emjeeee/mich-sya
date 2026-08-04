import { useState } from 'react'
import { EMOJI_CATEGORIES } from '@/data/emoji'
import { cn } from '@/lib/utils'

export function EmojiPickerPopover({ onPick }: { onPick: (emoji: string) => void }) {
  const [category, setCategory] = useState(0)

  return (
    <div className="w-72 rounded-2xl border border-border bg-card p-2 shadow-lg">
      <div className="grid max-h-52 grid-cols-8 gap-0.5 overflow-y-auto">
        {EMOJI_CATEGORIES[category].emoji.map((e) => (
          <button
            key={e}
            onClick={() => onPick(e)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-secondary/20"
          >
            {e}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setCategory(i)}
            title={cat.label}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg text-sm transition',
              category === i ? 'bg-primary/15' : 'hover:bg-secondary/15',
            )}
          >
            {cat.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
