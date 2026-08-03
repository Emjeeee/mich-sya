import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const DURATION = 10

type Phase = 'idle' | 'countdown' | 'playing' | 'done'

export function TapBattleGame() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [taps, setTaps] = useState({ p1: 0, p2: 0 })

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) {
      setPhase('playing')
      return
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 700)
    return () => clearTimeout(id)
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft === 0) {
      setPhase('done')
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [phase, timeLeft])

  function start() {
    setTaps({ p1: 0, p2: 0 })
    setTimeLeft(DURATION)
    setCountdown(3)
    setPhase('countdown')
  }

  const winner = taps.p1 === taps.p2 ? null : taps.p1 > taps.p2 ? 'Pemain 1' : 'Pemain 2'

  return (
    <Card className="space-y-4">
      <p className="text-center text-sm text-muted">
        Siapa paling banyak tap dalam {DURATION} detik?
      </p>

      {phase === 'idle' && (
        <div className="text-center">
          <Button size="sm" onClick={start}>Mulai</Button>
        </div>
      )}

      {phase === 'countdown' && (
        <p className="text-center font-number text-5xl font-bold text-primary">{countdown || 'GO!'}</p>
      )}

      {(phase === 'playing' || phase === 'done') && (
        <>
          {phase === 'playing' && (
            <p className="text-center text-sm font-medium text-muted">Sisa waktu: {timeLeft}s</p>
          )}
          <div className="grid h-48 grid-cols-2 gap-2">
            <button
              onClick={() => phase === 'playing' && setTaps((t) => ({ ...t, p1: t.p1 + 1 }))}
              className="flex flex-col items-center justify-center rounded-2xl bg-primary/15 active:bg-primary/25"
            >
              <span className="font-number text-4xl font-bold text-primary">{taps.p1}</span>
              <span className="mt-1 text-xs text-muted">Pemain 1</span>
            </button>
            <button
              onClick={() => phase === 'playing' && setTaps((t) => ({ ...t, p2: t.p2 + 1 }))}
              className="flex flex-col items-center justify-center rounded-2xl bg-accent/15 active:bg-accent/25"
            >
              <span className="font-number text-4xl font-bold text-accent">{taps.p2}</span>
              <span className="mt-1 text-xs text-muted">Pemain 2</span>
            </button>
          </div>
        </>
      )}

      {phase === 'done' && (
        <div className="text-center">
          <p className="mb-2 font-heading text-sm font-semibold text-text">
            {winner ? `${winner} menang! 🎉` : 'Seri!'}
          </p>
          <Button size="sm" onClick={start}>Main Lagi</Button>
        </div>
      )}
    </Card>
  )
}
