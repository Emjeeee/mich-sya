import { supabase } from './supabase'

const BUCKET = 'couple-photos'
const COVER_BUCKET = 'public-covers'

/** Uploads a file under {couple_id}/{folder}/... and returns the storage path (not a URL). */
export async function uploadCouplePhoto(coupleId: string, folder: string, file: File) {
  const ext = file.name.split('.').pop()
  const path = `${coupleId}/${folder}/${crypto.randomUUID()}.${ext ?? 'jpg'}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error
  return path
}

export async function getSignedPhotoUrl(path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

/** Batch-signs multiple paths in one request — used by the gallery, which can have many photos. */
export async function getSignedPhotoUrls(paths: string[], expiresInSeconds = 3600) {
  if (paths.length === 0) return {}
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, expiresInSeconds)
  if (error) throw error
  const map: Record<string, string> = {}
  for (const item of data) {
    if (item.signedUrl) map[item.path ?? ''] = item.signedUrl
  }
  return map
}

/**
 * Uploads the landing-page cover photo to a fixed path (overwriting any
 * previous cover) and returns the storage path — public-covers is a public
 * bucket, so the path is served directly via getPublicUrl, no signing needed.
 */
export async function uploadCoverPhoto(coupleId: string, file: File) {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${coupleId}/cover.${ext}`
  const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, file, { upsert: true })
  if (error) throw error
  return path
}

export function getPublicCoverUrl(path: string) {
  return supabase.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl
}
