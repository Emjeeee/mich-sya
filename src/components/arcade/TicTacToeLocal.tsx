import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TicTacToeBoard } from './TicTacToeBoard'
import { EMPTY_BOARD, checkWinner, type Cell } from '@/lib/tictactoe'

export function TicTacToeLocal() {
  const [board, setBoard] = useState<Cell[]>(EMPTY_BOARD)
  const [turn, setTurn] = useState<'x' | 'o'>('x')
  const [scores, setScores] = useState({ x: 0, o: 0, draw: 0 })

  const result = checkWinner(board)

  function handleCellClick(index: number) {
    if (result || board[index] !== '') return
    const next = [...board]
    next[index] = turn
    setBoard(next)

    const nextResult = checkWinner(next)
    if (nextResult) {
      setScores((s) => ({ ...s, [nextResult]: s[nextResult] + 1 }))
    } else {
      setTurn(turn === 'x' ? 'o' : 'x')
    }
  }

  function reset() {
    setBoard(EMPTY_BOARD)
    setTurn('x')
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-center gap-6 text-sm text-muted">
        <span className={turn === 'x' && !result ? 'font-semibold text-primary' : undefined}>
          ✕ Pemain 1: {scores.x}
        </span>
        <span className="text-xs">Seri: {scores.draw}</span>
        <span className={turn === 'o' && !result ? 'font-semibold text-accent' : undefined}>
          ○ Pemain 2: {scores.o}
        </span>
      </div>

      <TicTacToeBoard board={board} onCellClick={handleCellClick} disabled={!!result} />

      <div className="text-center">
        {result && (
          <p className="mb-2 font-heading text-sm font-semibold text-text">
            {result === 'draw' ? 'Seri!' : `${result === 'x' ? 'Pemain 1 (✕)' : 'Pemain 2 (○)'} menang!`}
          </p>
        )}
        {!result && (
          <p className="mb-2 text-sm text-muted">
            Giliran {turn === 'x' ? 'Pemain 1 (✕)' : 'Pemain 2 (○)'} — gantian pegang HP ya
          </p>
        )}
        <Button size="sm" variant="secondary" onClick={reset}>
          Main Lagi
        </Button>
      </div>
    </Card>
  )
}
