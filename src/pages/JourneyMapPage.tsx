import { useState, type FormEvent } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useJourneyMap } from '@/hooks/useJourneyMap'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { PhotoThumb } from '@/components/ui/PhotoThumb'
import { cn } from '@/lib/utils'

// react-leaflet's default marker icon paths break under bundlers — reassign explicitly.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const DEFAULT_CENTER: [number, number] = [-6.2, 106.8] // Jakarta, sensible default before any pins exist

function MapClickHandler({
  active,
  onPick,
}: {
  active: boolean
  onPick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      if (active) onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function JourneyMapPage() {
  const { data, isLoading, addPlace, removePlace } = useJourneyMap()
  const [picking, setPicking] = useState(false)
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null)
  const [placeName, setPlaceName] = useState('')
  const [description, setDescription] = useState('')
  const [visitedDate, setVisitedDate] = useState('')

  const places = data ?? []
  const center: [number, number] =
    places.length > 0 ? [places[0].lat, places[0].lng] : DEFAULT_CENTER

  function handlePick(lat: number, lng: number) {
    setPending({ lat, lng })
    setPicking(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!placeName.trim() || !pending) return
    await addPlace.mutateAsync({
      place_name: placeName,
      description,
      lat: pending.lat,
      lng: pending.lng,
      visited_date: visitedDate || undefined,
    })
    setPlaceName('')
    setDescription('')
    setVisitedDate('')
    setPending(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text">Peta Perjalanan Kita</h1>
          <p className="text-sm text-muted">Tempat-tempat yang sudah kita kunjungi bareng</p>
        </div>
        <Button
          size="sm"
          variant={picking ? 'danger' : 'primary'}
          onClick={() => setPicking((p) => !p)}
        >
          {picking ? 'Batal Pilih Lokasi' : '+ Tambah Lokasi'}
        </Button>
      </div>

      {picking && (
        <p className="rounded-lg bg-accent/15 px-3 py-2 text-sm text-text">
          Klik di peta untuk memilih lokasi yang ingin ditambahkan.
        </p>
      )}

      <div className="overflow-hidden rounded-xl2 border border-border">
        <MapContainer center={center} zoom={places.length > 0 ? 6 : 4} style={{ height: 420 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler active={picking} onPick={handlePick} />
          {places.map((place) => (
            <Marker key={place.id} position={[place.lat, place.lng]}>
              <Popup>
                <div className="w-48 space-y-1">
                  <p className="font-semibold">{place.place_name}</p>
                  {place.visited_date && (
                    <p className="text-xs text-gray-500">
                      {new Date(place.visited_date + 'T00:00:00').toLocaleDateString('id-ID')}
                    </p>
                  )}
                  {place.description && <p className="text-xs">{place.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {isLoading && <p className="text-sm text-muted">Memuat...</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <Card key={place.id} className={cn('flex gap-3')}>
            <PhotoThumb path={place.photo_url} className="h-16 w-16 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-heading text-sm font-semibold text-text">
                  {place.place_name}
                </p>
                <button
                  onClick={() => removePlace.mutate(place.id)}
                  className="shrink-0 text-xs text-muted hover:text-red-500"
                  aria-label="Hapus"
                >
                  ✕
                </button>
              </div>
              {place.visited_date && (
                <p className="text-xs text-muted">
                  {new Date(place.visited_date + 'T00:00:00').toLocaleDateString('id-ID')}
                </p>
              )}
              {place.description && (
                <p className="mt-1 line-clamp-2 text-xs text-text">{place.description}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Tambah Lokasi ke Peta"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {pending && (
            <p className="text-xs text-muted">
              Lokasi: {pending.lat.toFixed(4)}, {pending.lng.toFixed(4)}
            </p>
          )}
          <div>
            <Label>Nama Tempat</Label>
            <Input value={placeName} onChange={(e) => setPlaceName(e.target.value)} required autoFocus />
          </div>
          <div>
            <Label>Tanggal Kunjungan (opsional)</Label>
            <Input type="date" value={visitedDate} onChange={(e) => setVisitedDate(e.target.value)} />
          </div>
          <div>
            <Label>Cerita (opsional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={addPlace.isPending}>
            {addPlace.isPending ? 'Menyimpan...' : 'Simpan Lokasi'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
