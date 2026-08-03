import { useState, type FormEvent } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useGameScores } from '@/hooks/useGameScores'

function randomSecret() {
  return Math.floor(Math.random() * 100) + 1
}

export function NumberGuessGame() {
  const [secret, setSecret] = useState(randomSecret)
  const [guess, setGuess] = useState('')
  const [history, setHistory] = useState<{ value: number; hint: string }[]>([])
  const [won, setWon] = useState(false)
  const { recordScore } = useGameScores('numberguess')

  function handleGuess(e: FormEvent) {
    e.preventDefault()
    const value = Number(guess)
    if (!value || value < 1 || value > 100 || won) return
    let hint = 'Benar! 🎉'
    if (value < secret) hint = 'Terlalu kecil'
    else if (value > secret) hint = 'Terlalu besar'
    const nextHistory = [{ value, hint }, ...history]
    setHistory(nextHistory)
    setGuess('')
    if (value === secret) {
      setWon(true)
      recordScore.mutate({ score: nextHistory.length })
    }
  }

  function reset() {
    setSecret(randomSecret())
    setHistory([])
    setGuess('')
    setWon(false)
  }

  return (
    <Card className="space-y-4">
      <p className="text-sm text-muted">Tebak angka 1-100 yang aku pikirkan, sesedikit mungkin coba.</p>

      {won ? (
        <div className="space-y-3 text-center">
          <p className="font-heading text-base font-semibold text-text">
            Berhasil dalam {history.length} tebakan! 🎉
          </p>
          <Button size="sm" onClick={reset}>
            Main Lagi
          </Button>
        </div>
      ) : (
        <form onSubmit={handleGuess} className="flex gap-2">
          <Input
            type="number"
            min={1}
            max={100}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="1-100"
            autoFocus
          />
          <Button type="submit" size="sm">
            Tebak
          </Button>
        </form>
      )}

      {history.length > 0 && (
        <div className="max-h-32 space-y-1 overflow-y-auto text-sm">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-text">
              <span>{h.value}</span>
              <span className="text-muted">{h.hint}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
