import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useGameScores } from '@/hooks/useGameScores'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const COLORS = [
  { key: 0, className: 'bg-primary' },
  { key: 1, className: 'bg-accent' },
  { key: 2, className: 'bg-secondary' },
  { key: 3, className: 'bg-[#6E5A50]' },
]

type Phase = 'idle' | 'playing' | 'userTurn' | 'gameOver'

export function SimonSaysGame() {
  const [sequence, setSequence] = useState<number[]>([])
  const [userStep, setUserStep] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [recorded, setRecorded] = useState(false)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const { recordScore } = useGameScores('simon')
  const { user } = useAuth()

  function clearTimers() {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }

  useEffect(() => () => clearTimers(), [])

  function playSequence(seq: number[]) {
    setPhase('playing')
    seq.forEach((step, i) => {
      timeouts.current.push(
        setTimeout(() => setActiveIndex(step), i * 700),
        setTimeout(() => setActiveIndex(null), i * 700 + 400),
      )
    })
    timeouts.current.push(
      setTimeout(
        () => {
          setUserStep(0)
          setPhase('userTurn')
        },
        seq.length * 700,
      ),
    )
  }

  function start() {
    clearTimers()
    setRecorded(false)
    const first = [Math.floor(Math.random() * 4)]
    setSequence(first)
    playSequence(first)
  }

  function handleClick(index: number) {
    if (phase !== 'userTurn') return
    if (sequence[userStep] === index) {
      if (userStep + 1 === sequence.length) {
        const next = [...sequence, Math.floor(Math.random() * 4)]
        setSequence(next)
        timeouts.current.push(setTimeout(() => playSequence(next), 500))
        setPhase('playing')
      } else {
        setUserStep((s) => s + 1)
      }
    } else {
      setPhase('gameOver')
    }
  }

  useEffect(() => {
    if (phase === 'gameOver' && !recorded) {
      recordScore.mutate({ userId: user!.id, score: sequence.length - 1 })
      setRecorded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Ingat & ulangi urutan warnanya</p>
        <p className="font-heading text-lg font-bold text-primary">
          Ronde {Math.max(0, sequence.length - (phase === 'userTurn' || phase === 'gameOver' ? 0 : 1))}
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-2">
        {COLORS.map((c) => (
          <button
            key={c.key}
            onClick={() => handleClick(c.key)}
            disabled={phase !== 'userTurn'}
            className={cn(
              'aspect-square rounded-2xl transition',
              c.className,
              activeIndex === c.key ? 'opacity-100 ring-4 ring-white' : 'opacity-40',
            )}
          />
        ))}
      </div>

      <div className="text-center">
        {phase === 'idle' && <Button size="sm" onClick={start}>Mulai</Button>}
        {phase === 'gameOver' && (
          <>
            <p className="mb-2 font-heading text-sm font-semibold text-text">
              Salah urutan — sampai ronde {sequence.length - 1}
            </p>
            <Button size="sm" onClick={start}>Main Lagi</Button>
          </>
        )}
        {phase === 'userTurn' && <p className="text-sm text-muted">Giliran kamu...</p>}
        {phase === 'playing' && <p className="text-sm text-muted">Perhatikan urutannya...</p>}
      </div>
    </Card>
  )
}
