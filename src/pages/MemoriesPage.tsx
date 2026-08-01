import { useState, type FormEvent } from 'react'
import { useMemories } from '@/hooks/useMemories'
import { useCouple } from '@/contexts/CoupleContext'
import { uploadCouplePhoto } from '@/lib/storage'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { PhotoThumb } from '@/components/ui/PhotoThumb'
import { todayDateString } from '@/lib/dates'

export function MemoriesPage() {
  const { data, isLoading, addMemory, removeMemory } = useMemories()
  const { couple } = useCouple()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [memoryDate, setMemoryDate] = useState(todayDateString())
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !couple) return
    setUploading(true)
    try {
      let photo_url: string | undefined
      if (file) photo_url = await uploadCouplePhoto(couple.id, 'memories', file)
      await addMemory.mutateAsync({ title, description, location, memory_date: memoryDate, photo_url })
      setTitle('')
      setDescription('')
      setLocation('')
      setFile(null)
      setOpen(false)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text">Kenangan Kita</h1>
          <p className="text-sm text-muted">Momen-momen yang layak dikenang</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Tambah
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted">Memuat...</p>}
      {!isLoading && data?.length === 0 && (
        <p className="text-sm text-muted">Belum ada kenangan tersimpan.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((memory) => (
          <Card key={memory.id} className="flex flex-col gap-3">
            <PhotoThumb path={memory.photo_url} className="h-40 w-full" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-heading text-sm font-semibold text-text">{memory.title}</p>
                <p className="text-xs text-muted">
                  {new Date(memory.memory_date + 'T00:00:00').toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {memory.location && ` · ${memory.location}`}
                </p>
              </div>
              <button
                onClick={() => removeMemory.mutate(memory.id)}
                className="text-xs text-muted hover:text-red-500"
                aria-label="Hapus"
              >
                ✕
              </button>
            </div>
            {memory.description && <p className="text-sm text-text">{memory.description}</p>}
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Kenangan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Judul</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>
          <div>
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Lokasi (opsional)</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <Label>Cerita (opsional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Foto (opsional)</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary"
            />
          </div>
          <Button type="submit" className="w-full" disabled={uploading || addMemory.isPending}>
            {uploading ? 'Mengunggah...' : 'Simpan'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
