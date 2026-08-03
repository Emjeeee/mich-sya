import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TRIVIA_QUESTIONS } from '@/lib/games/wordBanks'
import { cn } from '@/lib/utils'

const TARGET_CORRECT = 5

function randomQuestion(excludeQuestion?: string) {
  const pool = excludeQuestion
    ? TRIVIA_QUESTIONS.filter((q) => q.question !== excludeQuestion)
    : TRIVIA_QUESTIONS
  return pool[Math.floor(Math.random() * pool.length)]
}

export function TriviaDuelLocal() {
  const [question, setQuestion] = useState(randomQuestion)
  const [scores, setScores] = useState({ p1: 0, p2: 0 })
  const [turn, setTurn] = useState<'p1' | 'p2'>('p1')
  const [selected, setSelected] = useState<number | null>(null)

  const winner = scores.p1 >= TARGET_CORRECT ? 'Pemain 1' : scores.p2 >= TARGET_CORRECT ? 'Pemain 2' : null

  function answer(index: number) {
    if (selected !== null || winner) return
    setSelected(index)
    const correct = index === question.correctIndex
    setTimeout(() => {
      setScores((s) => (correct ? { ...s, [turn]: s[turn] + 1 } : s))
      setTurn(turn === 'p1' ? 'p2' : 'p1')
      setQuestion(randomQuestion(question.question))
      setSelected(null)
    }, 900)
  }

  function reset() {
    setScores({ p1: 0, p2: 0 })
    setTurn('p1')
    setQuestion(randomQuestion())
    setSelected(null)
  }

  if (winner) {
    return (
      <Card className="space-y-3 text-center">
        <p className="font-heading text-base font-semibold text-text">{winner} menang! 🎉</p>
        <Button size="sm" onClick={reset}>Main Lagi</Button>
      </Card>
    )
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-center gap-6 text-sm text-muted">
        <span>Pemain 1: {scores.p1}</span>
        <span>Pemain 2: {scores.p2}</span>
      </div>
      <p className="text-center text-sm font-medium text-primary">
        Giliran {turn === 'p1' ? 'Pemain 1' : 'Pemain 2'}
      </p>
      <p className="text-center font-heading text-base font-semibold text-text">{question.question}</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {question.options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => answer(i)}
            disabled={selected !== null}
            className={cn(
              'rounded-xl border border-border px-4 py-2.5 text-left text-sm font-medium transition',
              selected === null && 'hover:border-primary',
              selected !== null && i === question.correctIndex && 'border-green-500 bg-green-500/10 text-green-600',
              selected === i && i !== question.correctIndex && 'border-red-400 bg-red-500/10 text-red-500',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </Card>
  )
}
