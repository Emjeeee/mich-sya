import { useState, type FormEvent } from 'react'
import { useGoals } from '@/hooks/useGoals'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export function GoalsPage() {
  const { data, isLoading, addGoal, toggleDone, removeGoal } = useGoals()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addGoal.mutateAsync({ title, description, target_date: targetDate || undefined })
    setTitle('')
    setDescription('')
    setTargetDate('')
    setOpen(false)
  }

  const active = data?.filter((g) => !g.is_done) ?? []
  const done = data?.filter((g) => g.is_done) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text">Couple Goals</h1>
          <p className="text-sm text-muted">Target dan mimpi yang ingin kita capai bareng</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Tambah
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted">Memuat...</p>}
      {!isLoading && data?.length === 0 && (
        <p className="text-sm text-muted">Belum ada goal. Yuk susun target pertama kalian!</p>
      )}

      {active.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((goal) => (
            <Card key={goal.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={goal.is_done}
                    onChange={(e) => toggleDone.mutate({ id: goal.id, is_done: e.target.checked })}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span className="font-heading text-sm font-semibold text-text">{goal.title}</span>
                </label>
                <button
                  onClick={() => removeGoal.mutate(goal.id)}
                  className="text-xs text-muted hover:text-red-500"
                  aria-label="Hapus"
                >
                  ✕
                </button>
              </div>
              {goal.description && <p className="text-sm text-muted">{goal.description}</p>}
              {goal.target_date && (
                <p className="text-xs text-accent">
                  🎯 Target:{' '}
                  {new Date(goal.target_date + 'T00:00:00').toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Selesai</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {done.map((goal) => (
              <Card key={goal.id} className="flex items-start justify-between gap-2 opacity-60">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={goal.is_done}
                    onChange={(e) => toggleDone.mutate({ id: goal.id, is_done: e.target.checked })}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span className={cn('font-heading text-sm font-semibold text-text line-through')}>
                    {goal.title}
                  </span>
                </label>
                <button
                  onClick={() => removeGoal.mutate(goal.id)}
                  className="text-xs text-muted hover:text-red-500"
                  aria-label="Hapus"
                >
                  ✕
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Couple Goal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Judul</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>
          <div>
            <Label>Target Tanggal (opsional)</Label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <div>
            <Label>Deskripsi (opsional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={addGoal.isPending}>
            {addGoal.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
