import { useEffect, useState, type FormEvent } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useGameScores } from '@/hooks/useGameScores'
import { EMOJI_QUIZ } from '@/lib/games/wordBanks'

const GAME_SECONDS = 60

function pickQuestion(excludeEmoji?: string) {
  const pool = excludeEmoji ? EMOJI_QUIZ.filter((q) => q.emoji !== excludeEmoji) : EMOJI_QUIZ
  return pool[Math.floor(Math.random() * pool.length)]
}

export function EmojiQuizGame() {
  const [current, setCurrent] = useState(pickQuestion)
  const [guess, setGuess] = useState('')
  const [correct, setCorrect] = useState(0)
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [recorded, setRecorded] = useState(false)
  const { recordScore } = useGameScores('emojiquiz')

  useEffect(() => {
    if (!running || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [running, timeLeft])

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false)
      if (!recorded) {
        recordScore.mutate({ score: correct })
        setRecorded(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, timeLeft])

  function handleGuess(e: FormEvent) {
    e.preventDefault()
    if (!guess.trim()) return
    if (guess.trim().toUpperCase() === current.answer) {
      setCorrect((c) => c + 1)
      setFeedback('correct')
    } else {
      setFeedback('wrong')
    }
    setCurrent(pickQuestion(current.emoji))
    setGuess('')
    setTimeout(() => setFeedback(null), 500)
  }

  function skip() {
    setCurrent(pickQuestion(current.emoji))
    setGuess('')
  }

  function start() {
    setCurrent(pickQuestion())
    setGuess('')
    setCorrect(0)
    setTimeLeft(GAME_SECONDS)
    setRecorded(false)
    setRunning(true)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{running ? `Sisa waktu: ${timeLeft}s` : 'Tebak dari emoji-nya'}</p>
        <p className="font-heading text-lg font-bold text-primary">{correct}</p>
      </div>

      {running ? (
        <>
          <p className="text-center text-5xl">{current.emoji}</p>
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
          <div className="text-center">
            <button onClick={skip} className="text-xs font-medium text-muted hover:text-primary">
              Lewati soal ini
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          {timeLeft === 0 && (
            <p className="mb-2 font-heading text-sm font-semibold text-text">
              Waktu habis — {correct} jawaban benar
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
