import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { useDailyVibe } from '@/hooks/useDailyVibe'

export function DailyVibeCard() {
  const { myToday, setToday, data } = useDailyVibe()
  const [mood, setMood] = useState<string | null>(myToday?.mood ?? null)
  const [note, setNote] = useState(myToday?.note ?? '')
  const [showHistory, setShowHistory] = useState(false)

  const recent = (data ?? []).slice(0, 8)

  return (
    <Card>
      <CardHeader
        title="Daily Vibe"
        action={
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Riwayat
          </button>
        }
      />

      {showHistory ? (
        <div className="max-h-40 space-y-2 overflow-y-auto">
          {recent.length === 0 && <p className="text-sm text-muted">Belum ada catatan mood.</p>}
          {recent.map((v) => (
            <div key={v.id} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{v.mood}</span>
              <span className="text-muted">{v.entry_date}</span>
              {v.note && <span className="truncate text-text">— {v.note}</span>}
            </div>
          ))}
        </div>
      ) : (
        <>
          <EmojiPicker value={mood} onChange={setMood} />
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ceritain hari ini gimana..."
            className="mt-3 min-h-16"
          />
          <Button
            className="mt-3 w-full"
            size="sm"
            disabled={!mood || setToday.isPending}
            onClick={() => mood && setToday.mutate({ mood, note })}
          >
            {setToday.isPending ? 'Menyimpan...' : 'Simpan Mood Hari Ini'}
          </Button>
        </>
      )}
    </Card>
  )
}
