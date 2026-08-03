import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DICE_FACES, TARGET_SCORE, rollDie } from '@/lib/games/dice'

export function DiceBattleLocal() {
  const [scores, setScores] = useState({ p1: 0, p2: 0 })
  const [turn, setTurn] = useState<'p1' | 'p2'>('p1')
  const [lastRoll, setLastRoll] = useState<number | null>(null)

  const winner = scores.p1 >= TARGET_SCORE ? 'Pemain 1' : scores.p2 >= TARGET_SCORE ? 'Pemain 2' : null

  function roll() {
    if (winner) return
    const value = rollDie()
    setLastRoll(value)
    setScores((s) => ({ ...s, [turn]: s[turn] + value }))
    setTurn(turn === 'p1' ? 'p2' : 'p1')
  }

  function reset() {
    setScores({ p1: 0, p2: 0 })
    setTurn('p1')
    setLastRoll(null)
  }

  return (
    <Card className="space-y-4">
      <p className="text-center text-sm text-muted">Target skor {TARGET_SCORE} — gantian lempar dadu</p>

      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="font-heading text-2xl font-bold text-primary">{scores.p1}</p>
          <p className="text-xs text-muted">Pemain 1</p>
        </div>
        <span className="text-4xl">{lastRoll ? DICE_FACES[lastRoll] : '🎲'}</span>
        <div className="text-center">
          <p className="font-heading text-2xl font-bold text-accent">{scores.p2}</p>
          <p className="text-xs text-muted">Pemain 2</p>
        </div>
      </div>

      <div className="text-center">
        {winner ? (
          <>
            <p className="mb-2 font-heading text-sm font-semibold text-text">{winner} menang! 🎉</p>
            <Button size="sm" onClick={reset}>Main Lagi</Button>
          </>
        ) : (
          <Button size="sm" onClick={roll}>
            Giliran {turn === 'p1' ? 'Pemain 1' : 'Pemain 2'} — Lempar Dadu
          </Button>
        )}
      </div>
    </Card>
  )
}
