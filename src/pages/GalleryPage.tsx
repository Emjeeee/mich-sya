import { useEffect, useState } from 'react'
import { useGallery, useGalleryUrls } from '@/hooks/useGallery'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function GalleryPage() {
  const { data: photos, isLoading, addPhotos, removePhoto } = useGallery()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const paths = photos?.map((p) => p.photo_path) ?? []
  const { data: urls } = useGalleryUrls(paths)

  useEffect(() => {
    const next = pendingFiles.map((f) => URL.createObjectURL(f))
    setPreviews(next)
    return () => next.forEach((url) => URL.revokeObjectURL(url))
  }, [pendingFiles])

  function handleSelectFiles(fileList: FileList | null) {
    if (!fileList) return
    setPendingFiles((prev) => [...prev, ...Array.from(fileList)])
  }

  function removePending(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleUpload() {
    if (pendingFiles.length === 0) return
    await addPhotos.mutateAsync(pendingFiles)
    setPendingFiles([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">Galeri Foto</h1>
        <p className="text-sm text-muted">
          Upload sebanyak-banyaknya — foto-foto ini yang bakal muncul bergantian di kartu Galeri
          beranda
        </p>
      </div>

      <Card>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleSelectFiles(e.target.files)}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary"
        />

        {previews.length > 0 && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {previews.map((src, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removePending(i)}
                    aria-label="Batalkan"
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <Button size="sm" className="mt-4" disabled={addPhotos.isPending} onClick={handleUpload}>
              {addPhotos.isPending ? 'Mengunggah...' : `Upload ${pendingFiles.length} Foto`}
            </Button>
          </>
        )}
      </Card>

      {isLoading && <p className="text-sm text-muted">Memuat...</p>}
      {!isLoading && photos?.length === 0 && (
        <p className="text-sm text-muted">Belum ada foto di galeri. Upload dari kotak di atas.</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos?.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary/10">
            {urls?.[photo.photo_path] ? (
              <img src={urls[photo.photo_path]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full animate-pulse" />
            )}
            <button
              onClick={() => removePhoto.mutate(photo.id)}
              aria-label="Hapus"
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
