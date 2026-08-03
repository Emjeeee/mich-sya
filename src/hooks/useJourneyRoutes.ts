import { useQuery } from '@tanstack/react-query'
import { fetchRoadRoute } from '@/lib/journeyRouting'
import type { JourneyPlaceRow } from '@/types'

export interface RouteSegment {
  points: [number, number][]
  roadFollowing: boolean
}

/**
 * One route segment per consecutive pair of places (already sorted by the
 * caller, typically by visited_date). Falls back to a straight dashed line
 * when OSRM can't find a road route (e.g. between islands/countries) —
 * fetched sequentially, not in parallel, to stay light on the shared public
 * OSRM instance.
 */
export function useJourneyRoutes(orderedPlaces: JourneyPlaceRow[]) {
  const routeKey = orderedPlaces.map((p) => `${p.id}:${p.lat},${p.lng}`).join('|')

  return useQuery({
    queryKey: ['journey-routes', routeKey],
    enabled: orderedPlaces.length > 1,
    staleTime: 60 * 60_000, // routes between fixed points never change
    queryFn: async () => {
      const segments: RouteSegment[] = []
      for (let i = 0; i < orderedPlaces.length - 1; i++) {
        const a = orderedPlaces[i]
        const b = orderedPlaces[i + 1]
        const road = await fetchRoadRoute(a, b)
        segments.push(
          road
            ? { points: road, roadFollowing: true }
            : {
                points: [
                  [a.lat, a.lng],
                  [b.lat, b.lng],
                ],
                roadFollowing: false,
              },
        )
      }
      return segments
    },
  })
}
