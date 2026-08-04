// GIF search via GIPHY's free API. Needs VITE_GIPHY_API_KEY (free,
// self-registered — see README) — same "free but needs your own key"
// pattern as Supabase itself, not a paid service.
export interface GifResult {
  id: string
  url: string
  previewUrl: string
}

const API_KEY = import.meta.env.VITE_GIPHY_API_KEY

interface GiphyResponse {
  data: {
    id: string
    images: {
      original: { url: string }
      fixed_width_small: { url: string }
    }
  }[]
}

function mapResults(data: GiphyResponse): GifResult[] {
  return data.data.map((g) => ({
    id: g.id,
    url: g.images.original.url,
    previewUrl: g.images.fixed_width_small.url,
  }))
}

export async function searchGifs(query: string): Promise<GifResult[]> {
  if (!API_KEY) throw new Error('VITE_GIPHY_API_KEY belum diisi di .env.local')
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=pg-13`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Pencarian GIF gagal')
  return mapResults(await res.json())
}

export async function getTrendingGifs(): Promise<GifResult[]> {
  if (!API_KEY) throw new Error('VITE_GIPHY_API_KEY belum diisi di .env.local')
  const url = `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=24&rating=pg-13`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Gagal memuat GIF trending')
  return mapResults(await res.json())
}
