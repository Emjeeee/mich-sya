import { useEffect, useMemo, useState, type FormEvent } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useJourneyMap } from '@/hooks/useJourneyMap'
import { useJourneyRoutes } from '@/hooks/useJourneyRoutes'
import { usePlaceSearch } from '@/hooks/usePlaceSearch'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { PhotoThumb } from '@/components/ui/PhotoThumb'
import { cn } from '@/lib/utils'
import type { PlaceSearchResult } from '@/lib/journeySearch'

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

/** Recenters the map whenever a new place is chosen from search (map instance can't be controlled via props alone). */
function FlyToOnPick({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 10))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return null
}

export function JourneyMapPage() {
  const { data, isLoading, addPlace, removePlace } = useJourneyMap()
  const [picking, setPicking] = useState(false)
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null)
  const [placeName, setPlaceName] = useState('')
  const [description, setDescription] = useState('')
  const [visitedDate, setVisitedDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)
  const { results: searchResults, loading: searching } = usePlaceSearch(searchQuery)

  const places = data ?? []
  const center: [number, number] =
    places.length > 0 ? [places[0].lat, places[0].lng] : DEFAULT_CENTER

  // Draw the journey in visit order — undated places sort last, in whatever order they were added.
  const orderedPlaces = useMemo(
    () =>
      [...places].sort((a, b) => {
        if (!a.visited_date && !b.visited_date) return 0
        if (!a.visited_date) return 1
        if (!b.visited_date) return -1
        return a.visited_date.localeCompare(b.visited_date)
      }),
    [places],
  )
  const { data: routeSegments } = useJourneyRoutes(orderedPlaces)
  const hasNonRoadSegment = routeSegments?.some((s) => !s.roadFollowing) ?? false

  function handlePick(lat: number, lng: number) {
    setPending({ lat, lng })
    setPicking(false)
  }

  function handleSelectSearchResult(result: PlaceSearchResult) {
    setPending({ lat: result.lat, lng: result.lng })
    setPlaceName(result.label.split(',')[0].trim())
    setFlyTarget({ lat: result.lat, lng: result.lng })
    setSearchQuery('')
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
          variant={picking ? 'danger' : 'secondary'}
          onClick={() => setPicking((p) => !p)}
        >
          {picking ? 'Batal Pilih di Peta' : '📍 Pilih dari Peta'}
        </Button>
      </div>

      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama tempat, misal: Malioboro Yogyakarta..."
        />
        {searchQuery.trim().length >= 3 && (
          <div className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            {searching && <p className="px-3 py-2 text-xs text-muted">Mencari...</p>}
            {!searching && searchResults.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted">Tidak ada hasil.</p>
            )}
            {!searching &&
              searchResults.map((result, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="block w-full truncate px-3 py-2 text-left text-sm text-text transition hover:bg-secondary/15"
                >
                  {result.label}
                </button>
              ))}
          </div>
        )}
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
          <FlyToOnPick target={flyTarget} />
          {routeSegments?.map((segment, i) => (
            <Polyline
              key={i}
              positions={segment.points}
              pathOptions={{
                color: '#FF5E8A',
                weight: segment.roadFollowing ? 4 : 2,
                opacity: segment.roadFollowing ? 0.8 : 0.55,
                dashArray: segment.roadFollowing ? undefined : '6 8',
              }}
            />
          ))}
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

      {hasNonRoadSegment && (
        <p className="text-xs text-muted">
          Garis putus-putus = tidak ada rute darat (misalnya antar pulau/negara).
        </p>
      )}

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
