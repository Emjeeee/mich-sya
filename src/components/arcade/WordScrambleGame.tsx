import { useEffect, useState, type FormEvent } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useGameScores } from '@/hooks/useGameScores'
import { WORD_BANK } from '@/lib/games/wordBanks'
import { shuffle } from '@/lib/utils'

const GAME_SECONDS = 60

function scrambleWord(word: string): string {
  let letters: string[]
  do {
    letters = shuffle(word.split(''))
  } while (letters.join('') === word && word.length > 1)
  return letters.join('')
}

function pickWord(exclude?: string): { word: string; scrambled: string } {
  const pool = exclude ? WORD_BANK.filter((w) => w !== exclude) : WORD_BANK
  const word = pool[Math.floor(Math.random() * pool.length)]
  return { word, scrambled: scrambleWord(word) }
}

export function WordScrambleGame() {
  const [{ word, scrambled }, setCurrent] = useState(() => pickWord())
  const [guess, setGuess] = useState('')
  const [solved, setSolved] = useState(0)
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [recorded, setRecorded] = useState(false)
  const { recordScore } = useGameScores('wordscramble')

  useEffect(() => {
    if (!running || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [running, timeLeft])

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false)
      if (!recorded) {
        recordScore.mutate({ score: solved })
        setRecorded(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, timeLeft])

  function handleGuess(e: FormEvent) {
    e.preventDefault()
    if (!guess.trim()) return
    if (guess.trim().toUpperCase() === word) {
      setSolved((s) => s + 1)
      setFeedback('correct')
      setCurrent(pickWord(word))
    } else {
      setFeedback('wrong')
    }
    setGuess('')
    setTimeout(() => setFeedback(null), 500)
  }

  function start() {
    setCurrent(pickWord())
    setGuess('')
    setSolved(0)
    setTimeLeft(GAME_SECONDS)
    setRecorded(false)
    setRunning(true)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{running ? `Sisa waktu: ${timeLeft}s` : 'Susun ulang hurufnya'}</p>
        <p className="font-heading text-lg font-bold text-primary">{solved}</p>
      </div>

      {running ? (
        <>
          <p className="text-center font-number text-3xl font-bold tracking-widest text-text">
            {scrambled}
          </p>
          <form onSubmit={handleGuess} className="flex gap-2">
            <Input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Jawabanmu..."
              autoFocus
              className={
                feedback === 'wrong' ? 'border-red-400' : feedback === 'correct' ? 'border-green-400' : ''
              }
            />
            <Button type="submit" size="sm">Cek</Button>
          </form>
        </>
      ) : (
        <div className="text-center">
          {timeLeft === 0 && (
            <p className="mb-2 font-heading text-sm font-semibold text-text">
              Waktu habis — {solved} kata terjawab
            </p>
          )}
          <Button size="sm" onClick={start}>
            {timeLeft === 0 ? 'Main Lagi' : 'Mulai'}
          </Button>
        </div>
      )}
    </Card>
  )
}
