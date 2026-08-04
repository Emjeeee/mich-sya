import { useState } from 'react'
import { useGifSearch } from '@/hooks/useGifSearch'
import { Input } from '@/components/ui/Input'
import type { GifResult } from '@/lib/giphy'

export function GifPickerPopover({ onPick }: { onPick: (gif: GifResult) => void }) {
  const [query, setQuery] = useState('')
  const { results, loading } = useGifSearch(query)

  return (
    <div className="w-80 rounded-2xl border border-border bg-card p-3 shadow-lg">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari GIF..."
        autoFocus
      />
      <div className="mt-2 grid max-h-64 grid-cols-3 gap-1.5 overflow-y-auto">
        {loading && <p className="col-span-3 py-4 text-center text-xs text-muted">Memuat...</p>}
        {!loading && results.length === 0 && (
          <p className="col-span-3 py-4 text-center text-xs text-muted">Tidak ada GIF ditemukan.</p>
        )}
        {!loading &&
          results.map((gif) => (
            <button
              key={gif.id}
              onClick={() => onPick(gif)}
              className="overflow-hidden rounded-lg bg-secondary/10 transition hover:ring-2 hover:ring-primary"
            >
              <img src={gif.previewUrl} alt="" className="h-20 w-full object-cover" />
            </button>
          ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-muted">Powered by GIPHY</p>
    </div>
  )
}
