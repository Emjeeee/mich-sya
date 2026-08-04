import { supabase } from './supabase'

const BUCKET = 'couple-photos'
const COVER_BUCKET = 'public-covers'
const CHAT_BUCKET = 'chat-media'

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

// Client-side guardrails — Supabase storage quota is a shared resource and
// video especially can eat through it fast on a free tier.
export const CHAT_MEDIA_LIMITS = {
  image: 15 * 1024 * 1024,
  audio: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
}

export async function uploadChatMedia(coupleId: string, file: File | Blob, ext: string) {
  const path = `${coupleId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(CHAT_BUCKET).upload(path, file)
  if (error) throw error
  return path
}

export async function uploadChatBackground(coupleId: string, file: File) {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${coupleId}/backgrounds/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(CHAT_BUCKET).upload(path, file)
  if (error) throw error
  return path
}

export async function getSignedChatMediaUrl(path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage
    .from(CHAT_BUCKET)
    .createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}
