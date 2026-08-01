import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { useGallery, useGalleryUrls } from '@/hooks/useGallery'

const LOOP_INTERVAL_MS = 3500

export function GalleryCard() {
  const { data: photos } = useGallery()
  const paths = photos?.map((p) => p.photo_path) ?? []
  const { data: urls } = useGalleryUrls(paths)
  const [index, setIndex] = useState(0)

  const orderedUrls = paths.map((p) => urls?.[p]).filter((u): u is string => !!u)

  useEffect(() => {
    if (orderedUrls.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % orderedUrls.length), LOOP_INTERVAL_MS)
    return () => clearInterval(id)
  }, [orderedUrls.length])

  useEffect(() => {
    if (index >= orderedUrls.length) setIndex(0)
  }, [orderedUrls.length, index])

  return (
    <Card className="md:col-span-2">
      <CardHeader
        title="Galeri"
        subtitle={photos && photos.length > 0 ? `${photos.length} foto` : undefined}
        action={
          <Link to="/app/gallery" className="text-xs font-semibold text-primary hover:underline">
            Kelola Foto
          </Link>
        }
      />

      {orderedUrls.length > 0 ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-secondary/10">
          <img
            key={index}
            src={orderedUrls[index]}
            alt=""
            className="h-full w-full animate-fadeIn object-cover"
          />
          {orderedUrls.length > 1 && (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {orderedUrls.map((_, i) => (
                <span
                  key={i}
                  className={
                    i === index ? 'h-1.5 w-4 rounded-full bg-white' : 'h-1.5 w-1.5 rounded-full bg-white/50'
                  }
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Link
          to="/app/gallery"
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center transition hover:border-primary"
        >
          <span className="text-2xl">🖼️</span>
          <p className="text-sm text-muted">Belum ada foto — upload di menu Galeri</p>
        </Link>
      )}
    </Card>
  )
}
