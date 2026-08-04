// Free geocoding via OpenStreetMap's Nominatim — no API key, consistent
// with the rest of the app's OSM-based map (tiles, routing). Nominatim's
// usage policy caps this at ~1 request/second; the caller debounces input
// so a request only fires once the user pauses typing.
export interface PlaceSearchResult {
  label: string
  lat: number
  lng: number
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(trimmed)}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'id' } })
  if (!res.ok) throw new Error('Pencarian lokasi gagal')

  const data: NominatimResult[] = await res.json()
  return data.map((d) => ({
    label: d.display_name,
    lat: Number(d.lat),
    lng: Number(d.lon),
  }))
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'id' } })
  if (!res.ok) return null

  const data: NominatimResult = await res.json()
  return data.display_name ?? null
}
