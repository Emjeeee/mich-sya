import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type Phase = 'idle' | 'waiting' | 'go' | 'roundEnd'

export function ReactionDuelGame() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [wins, setWins] = useState({ p1: 0, p2: 0 })
  const [roundMessage, setRoundMessage] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function startRound() {
    setPhase('waiting')
    setRoundMessage('')
    const delay = 1200 + Math.random() * 2800
    timeoutRef.current = setTimeout(() => setPhase('go'), delay)
  }

  function tap(player: 'p1' | 'p2') {
    if (phase === 'waiting') {
      clearTimeout(timeoutRef.current)
      const other = player === 'p1' ? 'p2' : 'p1'
      setWins((w) => ({ ...w, [other]: w[other] + 1 }))
      setRoundMessage(`${player === 'p1' ? 'Pemain 1' : 'Pemain 2'} tap kecepetan! Poin buat lawan.`)
      setPhase('roundEnd')
      return
    }
    if (phase === 'go') {
      setWins((w) => ({ ...w, [player]: w[player] + 1 }))
      setRoundMessage(`${player === 'p1' ? 'Pemain 1' : 'Pemain 2'} menang ronde ini!`)
      setPhase('roundEnd')
    }
  }

  const matchWinner = wins.p1 >= 3 ? 'Pemain 1' : wins.p2 >= 3 ? 'Pemain 2' : null

  function resetMatch() {
    clearTimeout(timeoutRef.current)
    setWins({ p1: 0, p2: 0 })
    setPhase('idle')
    setRoundMessage('')
  }

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
      ) : phase === 'idle' ? (
        <div className="text-center">
          <p className="mb-3 text-sm text-muted">
            Pegang HP berdua — begitu layar hijau, siapa duluan tap area-nya menang.
          </p>
          <Button size="sm" onClick={startRound}>Mulai Ronde</Button>
        </div>
      ) : (
        <>
          <div className="grid h-48 grid-cols-2 gap-2">
            <button
              onClick={() => tap('p1')}
              className={cn(
                'flex items-center justify-center rounded-2xl text-lg font-bold transition',
                phase === 'go' ? 'bg-green-500 text-white' : 'bg-secondary/20 text-text',
              )}
            >
              Pemain 1
            </button>
            <button
              onClick={() => tap('p2')}
              className={cn(
                'flex items-center justify-center rounded-2xl text-lg font-bold transition',
                phase === 'go' ? 'bg-green-500 text-white' : 'bg-secondary/20 text-text',
              )}
            >
              Pemain 2
            </button>
          </div>
          <p className="text-center text-sm text-muted">
            {phase === 'waiting' && 'Tunggu sampai hijau...'}
            {phase === 'go' && 'TAP SEKARANG!'}
          </p>
          {phase === 'roundEnd' && (
            <div className="text-center">
              <p className="mb-2 text-sm font-medium text-text">{roundMessage}</p>
              <Button size="sm" variant="secondary" onClick={startRound}>Ronde Berikutnya</Button>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
