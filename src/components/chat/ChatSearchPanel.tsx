import { useMessageSearch } from '@/hooks/useMessageSearch'
import { Input } from '@/components/ui/Input'
import type { MessageRow } from '@/types'

export function ChatSearchPanel({
  query,
  onQueryChange,
  onPick,
}: {
  query: string
  onQueryChange: (query: string) => void
  onPick: (message: MessageRow) => void
}) {
  const { results, loading } = useMessageSearch(query)

  return (
    <div className="border-b border-border px-4 py-2">
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Cari pesan..."
        autoFocus
      />
      {query.trim() && (
        <div className="mt-2 max-h-52 space-y-0.5 overflow-y-auto">
          {loading && <p className="py-2 text-center text-xs text-muted">Mencari...</p>}
          {!loading && results.length === 0 && (
            <p className="py-2 text-center text-xs text-muted">Tidak ada pesan ditemukan.</p>
          )}
          {!loading &&
            results.map((m) => (
              <button
                key={m.id}
                onClick={() => onPick(m)}
                className="block w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-secondary/15"
              >
                <p className="truncate text-sm text-text">{m.content}</p>
                <p className="text-[10px] text-muted">
                  {new Date(m.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
