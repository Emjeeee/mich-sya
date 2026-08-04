import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useGameScores } from '@/hooks/useGameScores'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const HOLE_COUNT = 9
const GAME_SECONDS = 30

export function WhackAMoleGame() {
  const [running, setRunning] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [recorded, setRecorded] = useState(false)
  const moleTimeout = useRef<ReturnType<typeof setTimeout>>()
  const { recordScore } = useGameScores('whackamole')
  const { user } = useAuth()

  useEffect(() => {
    if (!running) return
    function spawn() {
      setActive(Math.floor(Math.random() * HOLE_COUNT))
      moleTimeout.current = setTimeout(spawn, 500 + Math.random() * 500)
    }
    spawn()
    return () => clearTimeout(moleTimeout.current)
  }, [running])

  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      setRunning(false)
      setActive(null)
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [running, timeLeft])

  useEffect(() => {
    if (!running && timeLeft === 0 && !recorded) {
      recordScore.mutate({ userId: user!.id, score })
      setRecorded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, timeLeft])

  function whack(i: number) {
    if (i !== active) return
    setScore((s) => s + 1)
    setActive(null)
  }

  function start() {
    setScore(0)
    setTimeLeft(GAME_SECONDS)
    setRecorded(false)
    setRunning(true)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{running ? `Sisa waktu: ${timeLeft}s` : 'Ketuk mol yang muncul'}</p>
        <p className="font-heading text-lg font-bold text-primary">{score}</p>
      </div>

      <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-3">
        {Array.from({ length: HOLE_COUNT }, (_, i) => (
          <button
            key={i}
            onClick={() => whack(i)}
            className="flex aspect-square items-center justify-center rounded-full bg-secondary/15"
          >
            <span
              className={cn(
                'flex h-3/4 w-3/4 items-center justify-center rounded-full text-3xl transition-transform',
                active === i ? 'scale-100 bg-primary/20' : 'scale-0',
              )}
            >
              {active === i && '🐹'}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center">
        {!running && timeLeft === GAME_SECONDS && <Button size="sm" onClick={start}>Mulai</Button>}
        {!running && timeLeft === 0 && (
          <>
            <p className="mb-2 font-heading text-sm font-semibold text-text">Waktu habis — skor {score}</p>
            <Button size="sm" onClick={start}>Main Lagi</Button>
          </>
        )}
      </div>
    </Card>
  )
}
