import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'
import {
  getPartnerRemoteControlState,
  isRemoteControlEligible,
  parsePartnerRow,
  requestPartnerRemoteState,
  ringPartner,
  setPartnerRingerMode,
  setPartnerStreamVolume,
  type PartnerRemoteControlState,
  type VolumeStream,
} from '@/lib/remoteControl'
import type { RingerMode } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const MODES: { value: RingerMode; label: string }[] = [
  { value: 'normal', label: '🔊 Normal' },
  { value: 'vibrate', label: '📳 Getar' },
  { value: 'silent', label: '🔇 Senyap' },
]

const STREAMS: { value: VolumeStream; label: string }[] = [
  { value: 'ring', label: '🔔 Nada dering' },
  { value: 'notification', label: '📩 Notifikasi' },
  { value: 'media', label: '🎵 Media' },
  { value: 'alarm', label: '⏰ Alarm' },
]

type VolumeMap = Record<VolumeStream, number>
const DEFAULT_VOLUMES: VolumeMap = { ring: 50, notification: 50, media: 50, alarm: 50 }

// Only ever visible for one specific account (isRemoteControlEligible) —
// lets that account remotely ring the partner's phone and change her ringer
// mode + all 4 volume streams. Ports michael-tasya-mobile's
// RemoteControlPanel.tsx to the web: same device_push_tokens backend, same
// Expo-push transport (routed through the send-expo-push Edge Function
// here, since browsers can't call exp.host directly — see remoteControl.ts).
//
// setPartnerRingerMode()/setPartnerStreamVolume() only confirm the push was
// *delivered*, not that the native call on her end succeeded — the single
// most likely reason it wouldn't (she hasn't granted "Do Not Disturb
// access") happens silently with no UI on her side. This reads her
// last-reported grant status + current mode/volumes so that failure mode is
// visible up front, and the controls start from her phone's actual current
// state instead of a blind guess.
export function RemoteControlCard() {
  const { user } = useAuth()
  const { couple, partnerLabel } = useCouple()
  const coupleId = couple?.id ?? null
  const userId = user?.id ?? null
  const eligible = isRemoteControlEligible(user?.email)

  const [partnerGranted, setPartnerGranted] = useState<boolean | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [mode, setMode] = useState<RingerMode | null>(null)
  const [volumes, setVolumes] = useState<VolumeMap>(DEFAULT_VOLUMES)
  const [slidingStream, setSlidingStream] = useState<VolumeStream | null>(null)
  const slidingStreamRef = useRef<VolumeStream | null>(null)
  slidingStreamRef.current = slidingStream
  const [lastSent, setLastSent] = useState<string | null>(null)
  const lastSentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ringing, setRinging] = useState(false)

  const applyPartnerState = useCallback((state: PartnerRemoteControlState) => {
    setPartnerGranted(state.granted)
    if (state.mode) setMode(state.mode)
    const sliding = slidingStreamRef.current
    setVolumes((prev) => ({
      ring: sliding === 'ring' || state.ring === null ? prev.ring : state.ring,
      notification:
        sliding === 'notification' || state.notification === null ? prev.notification : state.notification,
      media: sliding === 'media' || state.media === null ? prev.media : state.media,
      alarm: sliding === 'alarm' || state.alarm === null ? prev.alarm : state.alarm,
    }))
  }, [])

  const refreshPartnerState = useCallback(() => {
    if (!coupleId || !userId) {
      setCheckingAccess(false)
      return
    }
    setCheckingAccess(true)
    getPartnerRemoteControlState(coupleId, userId)
      .then(applyPartnerState)
      .catch(() => setPartnerGranted(null))
      .finally(() => setCheckingAccess(false))
  }, [coupleId, userId, applyPartnerState])

  useEffect(() => {
    if (!eligible) return
    refreshPartnerState()
    if (coupleId) requestPartnerRemoteState(coupleId).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible, coupleId, userId])

  useEffect(() => {
    if (!eligible) return
    // Partner may grant access / change her own ringer settings while this
    // tab is already open — re-check on tab focus, same reasoning as the
    // mobile app's AppState 'active' listener.
    function onVisible() {
      if (document.visibilityState !== 'visible') return
      refreshPartnerState()
      if (coupleId) requestPartnerRemoteState(coupleId).catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [eligible, refreshPartnerState, coupleId])

  useEffect(() => {
    if (!eligible || !coupleId || !userId) return
    const channel = supabase
      .channel(`remote-control-${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'device_push_tokens', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown> | undefined
          if (!row || !row.user_id || row.user_id === userId) return
          applyPartnerState(parsePartnerRow(row))
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [eligible, coupleId, userId, applyPartnerState])

  useEffect(() => {
    return () => {
      if (lastSentTimer.current) clearTimeout(lastSentTimer.current)
    }
  }, [])

  if (!eligible) return null

  function flashSent(label: string) {
    if (lastSentTimer.current) clearTimeout(lastSentTimer.current)
    setLastSent(label)
    lastSentTimer.current = setTimeout(() => setLastSent(null), 2500)
  }

  async function handleRing() {
    setRinging(true)
    const sent = await ringPartner()
    setRinging(false)
    if (sent) flashSent('Bunyikan HP terkirim')
    else alert('Gagal membunyikan HP pasangan. Pastikan dia sudah membuka aplikasi mobile setidaknya sekali.')
  }

  async function chooseMode(value: RingerMode) {
    const previous = mode
    setMode(value)
    const sent = await setPartnerRingerMode(value)
    if (!sent) {
      setMode(previous)
      alert('Tidak bisa ubah mode HP pasangan. Pastikan dia sudah mengizinkan akses di Pengaturan.')
      return
    }
    flashSent(`Mode "${MODES.find((m) => m.value === value)?.label ?? value}" terkirim`)
  }

  async function commitVolume(stream: VolumeStream, value: number) {
    setSlidingStream(null)
    const rounded = Math.round(value)
    const sent = await setPartnerStreamVolume(stream, rounded)
    if (!sent) {
      alert('Tidak bisa ubah volume HP pasangan. Pastikan dia sudah mengizinkan akses di Pengaturan.')
      return
    }
    flashSent(`${STREAMS.find((s) => s.value === stream)?.label ?? stream} ${rounded}% terkirim`)
  }

  return (
    <Card>
      <CardHeader
        title="Kontrol Jarak Jauh"
        subtitle={`Atur HP ${partnerLabel} dari sini`}
        action={lastSent ? <span className="text-xs font-medium text-primary">✓ {lastSent}</span> : undefined}
      />

      {checkingAccess ? (
        <p className="text-xs text-muted">Memeriksa status akses...</p>
      ) : partnerGranted === false || partnerGranted === null ? (
        <p className="mb-3 text-xs text-red-500">
          {partnerGranted === null
            ? 'Belum diketahui apakah pasangan sudah mengizinkan akses. Nada dering/notifikasi mungkin tidak berpengaruh (Media/Alarm tetap bisa).'
            : 'Pasangan belum mengizinkan akses di Pengaturan — nada dering/notifikasi tidak akan berpengaruh sampai dia mengizinkannya (Media/Alarm tetap bisa).'}
        </p>
      ) : null}

      <Button size="sm" onClick={handleRing} disabled={ringing || !coupleId} className="mb-4">
        {ringing ? 'Mengirim...' : '📳 Bunyikan HP Pasangan'}
      </Button>

      <div className="mb-4 flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => chooseMode(m.value)}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition ${
              mode === m.value ? 'bg-primary text-onPrimary shadow-glow' : 'bg-secondary/30 text-text hover:bg-secondary/50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {STREAMS.map((s) => (
          <div key={s.value}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-text">{s.label}</span>
              <span className="font-bold text-primary">{Math.round(volumes[s.value])}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={volumes[s.value]}
              onChange={(e) => {
                setSlidingStream(s.value)
                setVolumes((prev) => ({ ...prev, [s.value]: Number(e.target.value) }))
              }}
              onMouseUp={(e) => commitVolume(s.value, Number((e.target as HTMLInputElement).value))}
              onTouchEnd={(e) => commitVolume(s.value, Number((e.target as HTMLInputElement).value))}
              className="w-full accent-primary"
            />
          </div>
        ))}
      </div>

      {!coupleId && <p className="mt-3 text-xs text-muted">Akun belum terhubung ke couple space.</p>}
    </Card>
  )
}
