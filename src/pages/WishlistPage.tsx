import { useState, type FormEvent } from 'react'
import { useWishlist } from '@/hooks/useWishlist'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export function WishlistPage() {
  const { data, isLoading, addItem, toggleDone, removeItem } = useWishlist()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addItem.mutateAsync({ title, description })
    setTitle('')
    setDescription('')
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text">Our Wishlist</h1>
          <p className="text-sm text-muted">Hal-hal yang ingin kita lakukan atau miliki bareng</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Tambah
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted">Memuat...</p>}
      {!isLoading && data?.length === 0 && (
        <p className="text-sm text-muted">Belum ada wishlist. Yuk tambahkan yang pertama!</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((item) => (
          <Card key={item.id} className={cn('flex flex-col gap-2', item.is_done && 'opacity-60')}>
            <div className="flex items-start justify-between gap-2">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={item.is_done}
                  onChange={(e) => toggleDone.mutate({ id: item.id, is_done: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span
                  className={cn(
                    'font-heading text-sm font-semibold text-text',
                    item.is_done && 'line-through',
                  )}
                >
                  {item.title}
                </span>
              </label>
              <button
                onClick={() => removeItem.mutate(item.id)}
                className="text-xs text-muted hover:text-red-500"
                aria-label="Hapus"
              >
                ✕
              </button>
            </div>
            {item.description && <p className="text-sm text-muted">{item.description}</p>}
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Wishlist">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Judul</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>
          <div>
            <Label>Deskripsi (opsional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={addItem.isPending}>
            {addItem.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
