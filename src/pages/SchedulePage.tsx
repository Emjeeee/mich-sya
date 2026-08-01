import { useMemo, useState, type FormEvent } from 'react'
import { useSchedule } from '@/hooks/useSchedule'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { StatusPill } from '@/components/ui/StatusPill'
import { todayDateString } from '@/lib/dates'
import { cn } from '@/lib/utils'
import type { ScheduleStatus } from '@/types'

export function SchedulePage() {
  const { data, isLoading, addSchedule, updateStatus, removeSchedule } = useSchedule()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(todayDateString())
  const [time, setTime] = useState('')

  const today = todayDateString()
  const filtered = useMemo(() => {
    const list = data ?? []
    return tab === 'upcoming'
      ? list.filter((s) => s.scheduled_date >= today)
      : list.filter((s) => s.scheduled_date < today).reverse()
  }, [data, tab, today])

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>()
    for (const item of filtered) {
      const key = new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }, [filtered])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date) return
    await addSchedule.mutateAsync({
      title,
      description,
      location,
      scheduled_date: date,
      scheduled_time: time || undefined,
    })
    setTitle('')
    setDescription('')
    setLocation('')
    setTime('')
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text">Jadwal Date</h1>
          <p className="text-sm text-muted">Rencana kencan kita berdua</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Tambah
        </Button>
      </div>

      <div className="flex gap-2">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              tab === t ? 'bg-primary text-white' : 'bg-secondary/20 text-text',
            )}
          >
            {t === 'upcoming' ? 'Akan Datang' : 'Sudah Lewat'}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted">Memuat...</p>}
      {!isLoading && filtered.length === 0 && (
        <p className="text-sm text-muted">Belum ada jadwal di sini.</p>
      )}

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([month, items]) => (
          <div key={month}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {month}
            </h3>
            <div className="space-y-3">
              {items.map((s) => (
                <Card key={s.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-heading text-sm font-semibold text-text">{s.title}</p>
                      <StatusPill status={s.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(s.scheduled_date + 'T00:00:00').toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                      })}
                      {s.scheduled_time && ` · ${s.scheduled_time.slice(0, 5)}`}
                      {s.location && ` · ${s.location}`}
                    </p>
                    {s.description && <p className="mt-1 text-sm text-text">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={s.status}
                      onChange={(e) =>
                        updateStatus.mutate({ id: s.id, status: e.target.value as ScheduleStatus })
                      }
                      className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text"
                    >
                      <option value="planned">Direncanakan</option>
                      <option value="confirmed">Terkonfirmasi</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                    <button
                      onClick={() => removeSchedule.mutate(s.id)}
                      className="text-xs text-muted hover:text-red-500"
                      aria-label="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Jadwal Date">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Judul</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tanggal</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <Label>Jam (opsional)</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Lokasi (opsional)</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <Label>Catatan (opsional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={addSchedule.isPending}>
            {addSchedule.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
