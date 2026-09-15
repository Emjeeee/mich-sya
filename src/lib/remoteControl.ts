import { supabase } from './supabase'
import type { RingerMode } from '@/types'

export type VolumeStream = 'ring' | 'notification' | 'media' | 'alarm'

// Only ever shown to this one account — mirrors michael-tasya-mobile's
// isSilentRingEligible gate (src/lib/silentRing.ts) so the web panel matches
// exactly who can see the mobile RemoteControlPanel.
const REMOTE_CONTROL_ELIGIBLE_EMAILS = new Set(['mjonathann.03@gmail.com'])

export function isRemoteControlEligible(email: string | null | undefined): boolean {
  return REMOTE_CONTROL_ELIGIBLE_EMAILS.has((email ?? '').toLowerCase())
}

// Routes through the send-expo-push Edge Function instead of calling
// https://exp.host directly — a browser fetch() to that endpoint is blocked
// by CORS outright (confirmed: even a plain GET fails, not just the JSON
// POST's preflight), unlike the mobile app's native fetch() which isn't
// subject to CORS. The function resolves the partner's token itself from
// the caller's own couple, so no token ever needs to travel through the
// client here.
async function sendPushToPartner(data: Record<string, unknown>): Promise<boolean> {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-expo-push', {
      body: { data, priority: 'high' },
    })
    if (error) {
      console.warn('[michsya] send-expo-push failed:', error)
      return false
    }
    return Boolean(result?.ok)
  } catch (err) {
    console.warn('[michsya] send-expo-push threw:', err)
    return false
  }
}

// Web-only — no BLE/SMS fallback (browsers can't do either), unlike the
// mobile app's ringPartner.ts which fires all three in parallel.
export async function ringPartner(): Promise<boolean> {
  return sendPushToPartner({ type: 'ring' })
}

// Requires the *receiving* device to have granted Android's "Do Not
// Disturb access" — if not granted, the native call on her end resolves
// false silently and this call still reports `true` (the push was merely
// delivered). See RemoteControlPanel's partnerGranted warning below.
export async function setPartnerRingerMode(mode: RingerMode): Promise<boolean> {
  return sendPushToPartner({ type: 'set_ringer_mode', mode })
}

// media/alarm need no special permission; ring/notification need the same
// DND access as setPartnerRingerMode.
export async function setPartnerStreamVolume(stream: VolumeStream, percent: number): Promise<boolean> {
  return sendPushToPartner({ type: 'set_stream_volume', stream, percent: Math.round(percent) })
}

// Asks the partner's device to immediately re-read and report its current
// mode/volumes, instead of waiting for her next foreground/periodic report.
export async function requestPartnerRemoteState(coupleId: string): Promise<boolean> {
  return sendPushToPartner({ type: 'request_remote_state', coupleId })
}

export interface PartnerRemoteControlState {
  granted: boolean | null
  mode: RingerMode | null
  ring: number | null
  notification: number | null
  media: number | null
  alarm: number | null
}

const EMPTY_PARTNER_STATE: PartnerRemoteControlState = {
  granted: null,
  mode: null,
  ring: null,
  notification: null,
  media: null,
  alarm: null,
}

// Shapes one raw device_push_tokens row — shared by the one-shot fetch below
// and the realtime subscription in RemoteControlCard.tsx (whose
// `postgres_changes` payload's `.new` is the same raw row shape).
export function parsePartnerRow(row: Record<string, unknown> | null | undefined): PartnerRemoteControlState {
  if (!row) return EMPTY_PARTNER_STATE
  const num = (v: unknown) => (typeof v === 'number' ? v : null)
  return {
    granted: Boolean(row.remote_control_granted),
    mode: (row.remote_ringer_mode as RingerMode | null) ?? null,
    ring: num(row.remote_ring_volume_percent),
    notification: num(row.remote_notification_volume_percent),
    media: num(row.remote_media_volume_percent),
    alarm: num(row.remote_alarm_volume_percent),
  }
}

// One-shot snapshot of whatever the partner's device last reported —
// possibly stale. Pair with requestPartnerRemoteState() for a fresh value
// and a realtime subscription to receive it the moment it lands.
export async function getPartnerRemoteControlState(
  coupleId: string,
  myUserId: string,
): Promise<PartnerRemoteControlState> {
  const { data, error } = await supabase
    .from('device_push_tokens')
    .select(
      'user_id, remote_control_granted, remote_ringer_mode, remote_ring_volume_percent, remote_notification_volume_percent, remote_media_volume_percent, remote_alarm_volume_percent',
    )
    .eq('couple_id', coupleId)

  if (error) console.warn('[michsya] getPartnerRemoteControlState query failed:', error)

  const partnerRow = data?.find((row) => row.user_id !== myUserId)
  return parsePartnerRow(partnerRow)
}
