import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCoverPhotoUpload, usePublicCoverPhoto } from '@/hooks/useCoverPhoto'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export function SettingsPage() {
  const { couple, youLabel } = useCouple()
  const { user, signOut, updateDisplayName } = useAuth()
  const queryClient = useQueryClient()
  const [anniversaryDate, setAnniversaryDate] = useState(couple?.anniversary_date ?? '')
  const [name, setName] = useState(youLabel)
  const [nameSaved, setNameSaved] = useState(false)
  const [nameSaving, setNameSaving] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const uploadCover = useCoverPhotoUpload()
  const { url: currentCoverUrl } = usePublicCoverPhoto()

  function handleCoverFileChange(file: File | null) {
    setCoverFile(file)
    setCoverPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleCoverSubmit(e: FormEvent) {
    e.preventDefault()
    if (!coverFile) return
    await uploadCover.mutateAsync(coverFile)
    handleCoverFileChange(null)
  }

  useEffect(() => {
    setAnniversaryDate(couple?.anniversary_date ?? '')
  }, [couple?.anniversary_date])

  useEffect(() => {
    setName(youLabel)
  }, [youLabel])

  async function handleNameSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setNameSaving(true)
    setNameSaved(false)
    const { error } = await updateDisplayName(name.trim())
    setNameSaving(false)
    if (!error) setNameSaved(true)
  }

  const updateAnniversary = useMutation({
    mutationFn: async (date: string) => {
      if (!couple) throw new Error('Couple belum terhubung')
      const { error } = await supabase
        .from('couple')
        .update({ anniversary_date: date })
        .eq('id', couple.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['couple', user?.id] }),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (anniversaryDate) updateAnniversary.mutate(anniversaryDate)
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">Pengaturan</h1>
        <p className="text-sm text-muted">Kelola informasi ruang kalian</p>
      </div>

      <Card>
        <CardHeader title="Akun" subtitle="Nama ini dipakai untuk sapaan di beranda" />
        <form onSubmit={handleNameSubmit} className="space-y-3">
          <div>
            <Label>Nama Panggilan</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={nameSaving}>
              {nameSaving ? 'Menyimpan...' : 'Simpan Nama'}
            </Button>
            {nameSaved && <span className="text-xs text-primary">Tersimpan ✓</span>}
          </div>
        </form>
        <p className="mt-3 text-xs text-muted">{user?.email}</p>
      </Card>

      <Card>
        <CardHeader title="Tanggal Jadian" subtitle="Dipakai untuk semua hitungan di beranda" />
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" disabled={updateAnniversary.isPending || !couple}>
            {updateAnniversary.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
          {!couple && (
            <p className="text-xs text-muted">
              Akun belum terhubung ke couple space — lihat README untuk setup.
            </p>
          )}
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Foto Sampul"
          subtitle="Tampil di landing page, sebelum masuk — siapa pun bisa mengganti"
        />
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-primary/30 via-secondary/40 to-accent/30 shadow-glow">
            {coverPreview || currentCoverUrl ? (
              <img
                src={coverPreview ?? currentCoverUrl ?? undefined}
                alt="Foto sampul"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl">📷</span>
            )}
          </div>
          <form onSubmit={handleCoverSubmit} className="w-full flex-1 space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleCoverFileChange(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary"
            />
            <Button type="submit" size="sm" disabled={!coverFile || !couple || uploadCover.isPending}>
              {uploadCover.isPending ? 'Mengunggah...' : 'Unggah Foto Sampul'}
            </Button>
            {uploadCover.isSuccess && !coverFile && (
              <span className="ml-3 text-xs text-primary">Tersimpan ✓</span>
            )}
            {!couple && (
              <p className="text-xs text-muted">
                Akun belum terhubung ke couple space — lihat README untuk setup.
              </p>
            )}
          </form>
        </div>
      </Card>

      <Card>
        <CardHeader title="Tampilan" />
        <div className="flex items-center justify-between">
          <p className="text-sm text-text">Tema Terang / Gelap</p>
          <ThemeToggle />
        </div>
      </Card>

      <Button variant="danger" size="sm" onClick={() => signOut()}>
        Keluar dari Akun
      </Button>
    </div>
  )
}
