import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MOVES, roundWinner, type Move } from '@/lib/games/rps'

type Phase = 'p1turn' | 'handoff' | 'p2turn' | 'reveal'

export function RockPaperScissorsLocal() {
  const [phase, setPhase] = useState<Phase>('p1turn')
  const [p1Move, setP1Move] = useState<Move | null>(null)
  const [p2Move, setP2Move] = useState<Move | null>(null)
  const [wins, setWins] = useState({ p1: 0, p2: 0 })

  const matchWinner = wins.p1 >= 3 ? 'Pemain 1' : wins.p2 >= 3 ? 'Pemain 2' : null

  function pickP1(move: Move) {
    setP1Move(move)
    setPhase('handoff')
  }

  function pickP2(move: Move) {
    setP2Move(move)
    setPhase('reveal')
    const outcome = roundWinner(p1Move!, move)
    if (outcome === 'a') setWins((w) => ({ ...w, p1: w.p1 + 1 }))
    else if (outcome === 'b') setWins((w) => ({ ...w, p2: w.p2 + 1 }))
  }

  function nextRound() {
    setP1Move(null)
    setP2Move(null)
    setPhase('p1turn')
  }

  function resetMatch() {
    setWins({ p1: 0, p2: 0 })
    nextRound()
  }

  const outcome = p1Move && p2Move ? roundWinner(p1Move, p2Move) : null

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-center gap-6 text-sm text-muted">
        <span>Pemain 1: {wins.p1}</span>
        <span>Pemain 2: {wins.p2}</span>
      </div>

      {matchWinner ? (
        <div className="space-y-3 text-center">
          <p className="font-heading text-base font-semibold text-text">{matchWinner} menang pertandingan! 🎉</p>
          <Button size="sm" onClick={resetMatch}>Main Lagi</Button>
        </div>
      ) : phase === 'p1turn' ? (
        <div className="text-center">
          <p className="mb-3 text-sm font-medium text-text">Pemain 1, pilih diam-diam</p>
          <div className="flex justify-center gap-3">
            {MOVES.map((m) => (
              <button key={m.key} onClick={() => pickP1(m.key)} className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-secondary/20 text-2xl transition hover:bg-secondary/35">
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
      ) : phase === 'handoff' ? (
        <div className="text-center">
          <p className="mb-3 text-sm text-muted">Serahkan HP ke Pemain 2</p>
          <Button size="sm" onClick={() => setPhase('p2turn')}>Lanjut</Button>
        </div>
      ) : phase === 'p2turn' ? (
        <div className="text-center">
          <p className="mb-3 text-sm font-medium text-text">Pemain 2, pilih diam-diam</p>
          <div className="flex justify-center gap-3">
            {MOVES.map((m) => (
              <button key={m.key} onClick={() => pickP2(m.key)} className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-secondary/20 text-2xl transition hover:bg-secondary/35">
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-6">
            <span className="text-4xl">{MOVES.find((m) => m.key === p1Move)?.emoji}</span>
            <span className="text-sm text-muted">vs</span>
            <span className="text-4xl">{MOVES.find((m) => m.key === p2Move)?.emoji}</span>
          </div>
          <p className="font-heading text-sm font-semibold text-text">
            {outcome === 'draw' ? 'Seri!' : outcome === 'a' ? 'Pemain 1 menang ronde ini' : 'Pemain 2 menang ronde ini'}
          </p>
          <Button size="sm" variant="secondary" onClick={nextRound}>Ronde Berikutnya</Button>
        </div>
      )}
    </Card>
  )
}
