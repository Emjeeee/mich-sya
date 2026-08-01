import { useState, type FormEvent } from 'react'
import { useFutureLetters } from '@/hooks/useFutureLetters'
import { useCountdown } from '@/hooks/useCountdown'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { isDateReached, todayDateString, zonedMidnightMs } from '@/lib/dates'
import type { FutureLetterRow } from '@/types'

function LetterCard({
  letter,
  onOpen,
}: {
  letter: FutureLetterRow
  onOpen: (id: string) => void
}) {
  const unlocked = isDateReached(letter.unlock_date)
  const countdown = useCountdown(unlocked ? null : zonedMidnightMs(letter.unlock_date), 'down')
  const formattedUnlock = new Date(letter.unlock_date + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Card>
      <CardHeader title={letter.title} subtitle={`Terbuka: ${formattedUnlock}`} />
      {!unlocked && countdown ? (
        <div className="flex flex-col items-center gap-1 py-4 text-center">
          <span className="text-3xl">🔒</span>
          <p className="text-sm text-muted">
            Terkunci — {countdown.days} hari {countdown.hours} jam lagi
          </p>
        </div>
      ) : letter.is_opened ? (
        <p className="whitespace-pre-wrap text-sm text-text">{letter.content}</p>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="text-3xl">💌</span>
          <p className="text-sm text-muted">Surat ini sudah bisa dibuka!</p>
          <Button size="sm" onClick={() => onOpen(letter.id)}>
            Buka Surat
          </Button>
        </div>
      )}
    </Card>
  )
}

export function LettersPage() {
  const { data, isLoading, addLetter, openLetter } = useFutureLetters()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [unlockDate, setUnlockDate] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !unlockDate) return
    await addLetter.mutateAsync({ title, content, unlock_date: unlockDate })
    setTitle('')
    setContent('')
    setUnlockDate('')
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text">Surat Masa Depan</h1>
          <p className="text-sm text-muted">Time capsule — tulis sekarang, buka nanti</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Tulis Surat
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted">Memuat...</p>}
      {!isLoading && data?.length === 0 && (
        <p className="text-sm text-muted">Belum ada surat. Tulis satu untuk masa depan kalian.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((letter) => (
          <LetterCard key={letter.id} letter={letter} onOpen={(id) => openLetter.mutate(id)} />
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tulis Surat Masa Depan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Judul</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>
          <div>
            <Label>Tanggal Terbuka</Label>
            <Input
              type="date"
              min={todayDateString()}
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Isi Surat</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={addLetter.isPending}>
            {addLetter.isPending ? 'Menyimpan...' : 'Simpan & Kunci'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
