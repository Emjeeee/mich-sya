import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useGameScores } from '@/hooks/useGameScores'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  addRandomTile,
  emptyGrid,
  isGameOver,
  move,
  TILE_COLORS,
  type Grid,
} from '@/lib/games/game2048'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/pixel-icons'

function startingGrid(): Grid {
  const g = emptyGrid()
  addRandomTile(g)
  addRandomTile(g)
  return g
}

export function Game2048() {
  const [grid, setGrid] = useState<Grid>(startingGrid)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const { recordScore } = useGameScores('2048')
  const { user } = useAuth()

  function handleMove(dir: 'left' | 'right' | 'up' | 'down') {
    if (gameOver) return
    const result = move(grid, dir)
    if (!result.moved) return
    addRandomTile(result.grid)
    setGrid(result.grid)
    setScore((s) => s + result.gained)
    if (isGameOver(result.grid)) setGameOver(true)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      }
      const dir = map[e.key]
      if (dir) {
        e.preventDefault()
        handleMove(dir)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, gameOver])

  useEffect(() => {
    if (gameOver && !recorded) {
      recordScore.mutate({ userId: user!.id, score })
      setRecorded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver])

  function reset() {
    setGrid(startingGrid())
    setScore(0)
    setGameOver(false)
    setRecorded(false)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Pakai panah keyboard atau tombol di bawah</p>
        <p className="font-heading text-lg font-bold text-primary">{score}</p>
      </div>

      <div className="mx-auto grid w-full max-w-xs grid-cols-4 gap-2 rounded-xl bg-secondary/10 p-2">
        {grid.flat().map((value, i) => (
          <div
            key={i}
            className={cn(
              'flex aspect-square items-center justify-center rounded-lg font-number text-lg font-bold',
              value === 0 ? 'bg-card' : TILE_COLORS[value] ?? 'bg-primary text-onPrimary',
            )}
          >
            {value !== 0 && value}
          </div>
        ))}
      </div>

      {gameOver && (
        <p className="text-center font-heading text-sm font-semibold text-text">
          Game selesai — skor akhir {score}
        </p>
      )}

      <div className="mx-auto grid w-32 grid-cols-3 gap-1">
        <div />
        <button onClick={() => handleMove('up')} className="flex h-9 items-center justify-center rounded-lg bg-secondary/20 text-text">
          ▲
        </button>
        <div />
        <button onClick={() => handleMove('left')} className="flex h-9 items-center justify-center rounded-lg bg-secondary/20 text-text">
          <ChevronLeftIcon className="h-3 w-3" />
        </button>
        <button onClick={() => handleMove('down')} className="flex h-9 items-center justify-center rounded-lg bg-secondary/20 text-text">
          ▼
        </button>
        <button onClick={() => handleMove('right')} className="flex h-9 items-center justify-center rounded-lg bg-secondary/20 text-text">
          <ChevronRightIcon className="h-3 w-3" />
        </button>
      </div>

      <div className="text-center">
        <Button size="sm" variant="secondary" onClick={reset}>
          Main Lagi
        </Button>
      </div>
    </Card>
  )
}
