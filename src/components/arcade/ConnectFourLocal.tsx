import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConnectFourBoard } from './ConnectFourBoard'
import { EMPTY_BOARD, checkWinner, dropDisc, type Cell } from '@/lib/games/connectFour'

export function ConnectFourLocal() {
  const [board, setBoard] = useState<Cell[]>(EMPTY_BOARD)
  const [turn, setTurn] = useState<'x' | 'o'>('x')

  const result = checkWinner(board)

  function handleColumnClick(col: number) {
    if (result) return
    const next = dropDisc(board, col, turn)
    if (!next) return
    setBoard(next)
    if (!checkWinner(next)) setTurn(turn === 'x' ? 'o' : 'x')
  }

  function reset() {
    setBoard(EMPTY_BOARD)
    setTurn('x')
  }

  return (
    <Card className="space-y-4">
      <p className="text-center text-sm text-muted">
        {result
          ? result === 'draw'
            ? 'Seri!'
            : `${result === 'x' ? 'Pemain 1 (●)' : 'Pemain 2 (●)'} menang!`
          : `Giliran ${turn === 'x' ? 'Pemain 1' : 'Pemain 2'} — gantian pegang HP ya`}
      </p>
      <ConnectFourBoard board={board} onColumnClick={handleColumnClick} disabled={!!result} />
      <div className="text-center">
        <Button size="sm" variant="secondary" onClick={reset}>
          Main Lagi
        </Button>
      </div>
    </Card>
  )
}
