import { useEffect, useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { useDailyVibe } from '@/hooks/useDailyVibe'
import { CheckIcon, EditIcon } from '@/components/ui/pixel-icons'
import { cn } from '@/lib/utils'

type View = 'form' | 'saved' | 'history'

export function DailyVibeCard() {
  const { myToday, setToday, data } = useDailyVibe()
  const [mood, setMood] = useState<string | null>(myToday?.mood ?? null)
  const [note, setNote] = useState(myToday?.note ?? '')
  const [view, setView] = useState<View>(myToday ? 'saved' : 'form')
  const [justSaved, setJustSaved] = useState(false)

  // If today's entry loads in after mount (e.g. slow query), land on the recap view.
  useEffect(() => {
    if (myToday && view === 'form' && mood === null) {
      setMood(myToday.mood)
      setNote(myToday.note ?? '')
      setView('saved')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myToday])

  const recent = (data ?? []).slice(0, 8)

  async function handleSave() {
    if (!mood) return
    await setToday.mutateAsync({ mood, note })
    setView('saved')
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }

  return (
    <Card>
      <CardHeader
        title="Daily Vibe"
        action={
          <button
            onClick={() => setView((v) => (v === 'history' ? (myToday ? 'saved' : 'form') : 'history'))}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {view === 'history' ? 'Kembali' : 'Riwayat'}
          </button>
        }
      />

      {view === 'history' ? (
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
      ) : view === 'saved' && myToday ? (
        <div className="space-y-3">
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-opacity duration-500',
              justSaved ? 'bg-primary/10 text-primary opacity-100' : 'opacity-0',
            )}
            aria-hidden={!justSaved}
          >
            <CheckIcon className="h-4 w-4 shrink-0" />
            Mood hari ini berhasil disimpan!
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-secondary/10 p-3">
            <span className="text-3xl leading-none">{myToday.mood}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">Mood kamu hari ini</p>
              {myToday.note ? (
                <p className="mt-1 text-sm text-text">{myToday.note}</p>
              ) : (
                <p className="mt-1 text-sm italic text-muted">Tanpa catatan</p>
              )}
            </div>
          </div>

          <Button size="sm" variant="secondary" onClick={() => setView('form')}>
            <EditIcon className="h-4 w-4" />
            Ubah Mood
          </Button>
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
            onClick={handleSave}
          >
            {setToday.isPending ? 'Menyimpan...' : 'Simpan Mood Hari Ini'}
          </Button>
        </>
      )}
    </Card>
  )
}
