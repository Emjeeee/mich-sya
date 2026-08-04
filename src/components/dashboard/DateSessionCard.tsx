import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Label } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { MapIcon } from '@/components/ui/pixel-icons'
import { useDateSession } from '@/hooks/useDateSession'
import { useSchedule } from '@/hooks/useSchedule'
import { useJourneyMap } from '@/hooks/useJourneyMap'
import { reverseGeocode } from '@/lib/journeySearch'
import { todayDateString } from '@/lib/dates'
import type { DateSessionRow } from '@/types'

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}j ${m}m ${s}d`
  if (m > 0) return `${m}m ${s}d`
  return `${s}d`
}

type Step = 'form' | 'wrapup'

export function DateSessionCard() {
  const { data: activeSession, startSession, endSession } = useDateSession()
  const { addSchedule } = useSchedule()
  const { addPlace } = useJourneyMap()

  const [, setTick] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [finishedSession, setFinishedSession] = useState<DateSessionRow | null>(null)
  const [placeName, setPlaceName] = useState('')
  const [placeSaved, setPlaceSaved] = useState(false)
  const [scheduleSaved, setScheduleSaved] = useState(false)

  useEffect(() => {
    if (!activeSession) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [activeSession])

  const elapsedMs = activeSession ? Date.now() - new Date(activeSession.started_at).getTime() : 0

  async function handleWrapUp() {
    if (!activeSession) return
    const updated = await endSession.mutateAsync({ id: activeSession.id, title, summary })
    setFinishedSession(updated)

    await addSchedule.mutateAsync({
      title: title || 'Date',
      description: summary || undefined,
      scheduled_date: todayDateString(),
      status: 'completed',
    })
    setScheduleSaved(true)

    const lat = updated.end_lat ?? updated.start_lat
    const lng = updated.end_lng ?? updated.start_lng
    if (lat != null && lng != null) {
      const label = await reverseGeocode(lat, lng)
      setPlaceName(label ?? '')
    }

    setStep('wrapup')
  }

  async function handleSavePlace() {
    if (!finishedSession) return
    const lat = finishedSession.end_lat ?? finishedSession.start_lat
    const lng = finishedSession.end_lng ?? finishedSession.start_lng
    if (lat == null || lng == null || !placeName.trim()) return
    await addPlace.mutateAsync({
      place_name: placeName.trim(),
      description: summary || undefined,
      lat,
      lng,
      visited_date: todayDateString(),
    })
    setPlaceSaved(true)
  }

  function closeModal() {
    setModalOpen(false)
    setStep('form')
    setTitle('')
    setSummary('')
    setFinishedSession(null)
    setPlaceName('')
    setPlaceSaved(false)
    setScheduleSaved(false)
  }

  return (
    <Card>
      <CardHeader
        title="Date Session"
        subtitle={activeSession ? 'Sedang berlangsung' : 'Belum ada date aktif'}
      />

      {!activeSession ? (
        <Button
          className="w-full"
          size="sm"
          disabled={startSession.isPending}
          onClick={() => startSession.mutate()}
        >
          {startSession.isPending ? 'Memulai...' : 'Mulai Date'}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl bg-secondary/10 p-3 text-center">
            <p className="text-xs text-muted">Berlangsung selama</p>
            <p className="font-number text-xl font-bold text-text">{formatElapsed(elapsedMs)}</p>
          </div>
          <Button className="w-full" size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
            Selesai Date
          </Button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={step === 'wrapup' ? 'Rangkuman Date' : 'Akhiri Date'}
      >
        {step === 'form' && (
          <div className="space-y-3">
            <div>
              <Label>Judul date</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth. Nonton bareng"
              />
            </div>
            <div>
              <Label>Ringkasan (kemana saja, ngapain saja)</Label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Ceritain date kalian..."
              />
            </div>
            <Button className="w-full" size="sm" disabled={endSession.isPending} onClick={handleWrapUp}>
              {endSession.isPending ? 'Menyimpan...' : 'Selesai & Simpan'}
            </Button>
          </div>
        )}

        {step === 'wrapup' && (
          <div className="space-y-4">
            {scheduleSaved && <p className="text-sm text-text">Tersimpan di jadwal date ✓</p>}

            {finishedSession && (finishedSession.end_lat ?? finishedSession.start_lat) != null && (
              <div className="space-y-2 rounded-xl border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-text">
                  <MapIcon className="h-4 w-4" />
                  Simpan lokasi ke peta perjalanan?
                </div>
                <Input
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="Nama tempat"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={placeSaved || addPlace.isPending || !placeName.trim()}
                  onClick={handleSavePlace}
                >
                  {placeSaved ? 'Tersimpan ✓' : addPlace.isPending ? 'Menyimpan...' : 'Simpan ke Peta'}
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-3 text-xs">
              <Link to="/app/memories" className="text-primary hover:underline" onClick={closeModal}>
                Tambah kenangan dari date ini →
              </Link>
              <Link to="/app/wishlist" className="text-primary hover:underline" onClick={closeModal}>
                Cek wishlist →
              </Link>
            </div>

            <Button className="w-full" size="sm" variant="ghost" onClick={closeModal}>
              Selesai
            </Button>
          </div>
        )}
      </Modal>
    </Card>
  )
}
