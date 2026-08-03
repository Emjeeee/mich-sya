import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useGameScores } from '@/hooks/useGameScores'
import { shuffle } from '@/lib/utils'

const COLORS = [
  { name: 'Merah', hex: '#EF4444' },
  { name: 'Biru', hex: '#3B82F6' },
  { name: 'Hijau', hex: '#22C55E' },
  { name: 'Kuning', hex: '#EAB308' },
  { name: 'Ungu', hex: '#A855F7' },
  { name: 'Oranye', hex: '#F97316' },
]

const ROUND_MS = 2500

function newRound() {
  const options = shuffle(COLORS).slice(0, 4)
  const target = options[Math.floor(Math.random() * options.length)]
  return { options, target }
}

export function ColorMatchGame() {
  const [round, setRound] = useState(newRound)
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const { recordScore } = useGameScores('colormatch')

  useEffect(() => {
    if (!running) return
    const id = setTimeout(() => {
      setRunning(false)
      setGameOver(true)
    }, ROUND_MS)
    return () => clearTimeout(id)
  }, [running, round])

  useEffect(() => {
    if (gameOver && !recorded) {
      recordScore.mutate({ score })
      setRecorded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver])

  function pick(hex: string) {
    if (!running) return
    if (hex === round.target.hex) {
      setScore((s) => s + 1)
      setRound(newRound())
    } else {
      setRunning(false)
      setGameOver(true)
    }
  }

  function start() {
    setRound(newRound())
    setScore(0)
    setGameOver(false)
    setRecorded(false)
    setRunning(true)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Cepat! Ketuk warna yang sesuai nama</p>
        <p className="font-heading text-lg font-bold text-primary">{score}</p>
      </div>

      {running ? (
        <>
          <p className="text-center font-heading text-2xl font-bold text-text">{round.target.name}</p>
          <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-3">
            {round.options.map((c) => (
              <button
                key={c.hex}
                onClick={() => pick(c.hex)}
                className="aspect-square rounded-2xl transition active:scale-95"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center">
          {gameOver && (
            <p className="mb-2 font-heading text-sm font-semibold text-text">Salah! Skor akhir {score}</p>
          )}
          <Button size="sm" onClick={start}>
            {gameOver ? 'Main Lagi' : 'Mulai'}
          </Button>
        </div>
      )}
    </Card>
  )
}
