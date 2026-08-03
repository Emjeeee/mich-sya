import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useGameScores } from '@/hooks/useGameScores'
import { cn } from '@/lib/utils'

const SIZE = 4
const SOLVED = [...Array.from({ length: 15 }, (_, i) => i + 1), 0]

function shuffledBoard(): number[] {
  let board = [...SOLVED]
  let blank = board.indexOf(0)
  // Shuffle via random valid slides so the result is always solvable.
  for (let i = 0; i < 300; i++) {
    const neighbors = validMoves(blank)
    const next = neighbors[Math.floor(Math.random() * neighbors.length)]
    ;[board[blank], board[next]] = [board[next], board[blank]]
    blank = next
  }
  return board
}

function validMoves(blankIndex: number): number[] {
  const row = Math.floor(blankIndex / SIZE)
  const col = blankIndex % SIZE
  const moves: number[] = []
  if (row > 0) moves.push(blankIndex - SIZE)
  if (row < SIZE - 1) moves.push(blankIndex + SIZE)
  if (col > 0) moves.push(blankIndex - 1)
  if (col < SIZE - 1) moves.push(blankIndex + 1)
  return moves
}

export function SlidingPuzzleGame() {
  const [board, setBoard] = useState<number[]>(shuffledBoard)
  const [moves, setMoves] = useState(0)
  const [recorded, setRecorded] = useState(false)
  const { recordScore } = useGameScores('slidingpuzzle')

  const won = board.every((v, i) => v === SOLVED[i])

  function handleTileClick(index: number) {
    if (won) return
    const blank = board.indexOf(0)
    if (!validMoves(blank).includes(index)) return
    const next = [...board]
    ;[next[blank], next[index]] = [next[index], next[blank]]
    setBoard(next)
    setMoves((m) => m + 1)
    if (next.every((v, i) => v === SOLVED[i]) && !recorded) {
      recordScore.mutate({ score: moves + 1 })
      setRecorded(true)
    }
  }

  function reset() {
    setBoard(shuffledBoard())
    setMoves(0)
    setRecorded(false)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Urutkan angka 1-15</p>
        <p className="font-heading text-lg font-bold text-primary">{moves} langkah</p>
      </div>

      <div className="mx-auto grid w-full max-w-xs grid-cols-4 gap-1.5">
        {board.map((value, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(i)}
            disabled={value === 0}
            className={cn(
              'flex aspect-square items-center justify-center rounded-lg font-number text-lg font-bold transition',
              value === 0 ? 'bg-transparent' : 'bg-secondary/20 text-text hover:bg-secondary/35',
            )}
          >
            {value !== 0 && value}
          </button>
        ))}
      </div>

      {won && (
        <p className="text-center font-heading text-sm font-semibold text-text">
          Selesai dalam {moves} langkah! 🎉
        </p>
      )}

      <div className="text-center">
        <Button size="sm" variant="secondary" onClick={reset}>
          {won ? 'Main Lagi' : 'Acak Ulang'}
        </Button>
      </div>
    </Card>
  )
}
