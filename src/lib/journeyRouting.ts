// Free road-following routing via OSRM's public demo server — no API key,
// consistent with the rest of the map (OSM tiles, Nominatim search). Note:
// the public demo instance is meant for light/evaluation use, not heavy
// production traffic — fine for a 2-person app's occasional route lookups,
// but not something to scale up.
export interface LatLngPoint {
  lat: number
  lng: number
}

/** Road-following polyline between two points, or null if OSRM found no route (e.g. across water/islands). */
export async function fetchRoadRoute(from: LatLngPoint, to: LatLngPoint): Promise<[number, number][] | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.[0]) return null

    const coordinates: [number, number][] = data.routes[0].geometry.coordinates
    return coordinates.map(([lng, lat]) => [lat, lng])
  } catch {
    return null
  }
}
