import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useGameScores } from '@/hooks/useGameScores'
import { cn } from '@/lib/utils'

const SIZE = 12
const TICK_MS = 160

type Point = { x: number; y: number }
type Dir = 'up' | 'down' | 'left' | 'right'

const DELTA: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function randomEmptyCell(snake: Point[]): Point {
  let cell: Point
  do {
    cell = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) }
  } while (snake.some((s) => s.x === cell.x && s.y === cell.y))
  return cell
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 6, y: 6 }])
  const [food, setFood] = useState<Point>(() => randomEmptyCell([{ x: 6, y: 6 }]))
  const [dir, setDir] = useState<Dir>('right')
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const dirRef = useRef(dir)
  const { recordScore } = useGameScores('snake')

  dirRef.current = dir

  function changeDir(next: Dir) {
    const opposite: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }
    if (opposite[dirRef.current] === next) return
    setDir(next)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Dir> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      }
      if (map[e.key]) {
        e.preventDefault()
        changeDir(map[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!running || gameOver) return
    const id = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0]
        const delta = DELTA[dirRef.current]
        const next = { x: head.x + delta.x, y: head.y + delta.y }

        const hitsWall = next.x < 0 || next.y < 0 || next.x >= SIZE || next.y >= SIZE
        const hitsSelf = prev.some((s) => s.x === next.x && s.y === next.y)
        if (hitsWall || hitsSelf) {
          setGameOver(true)
          setRunning(false)
          return prev
        }

        const ateFood = next.x === food.x && next.y === food.y
        const body = [next, ...prev]
        if (!ateFood) body.pop()
        else setFood(randomEmptyCell(body))
        return body
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [running, gameOver, food])

  useEffect(() => {
    if (gameOver && !recorded) {
      recordScore.mutate({ score: snake.length })
      setRecorded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver])

  function reset() {
    const start = { x: 6, y: 6 }
    setSnake([start])
    setFood(randomEmptyCell([start]))
    setDir('right')
    setGameOver(false)
    setRecorded(false)
    setRunning(true)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Panah keyboard atau tombol di bawah</p>
        <p className="font-heading text-lg font-bold text-primary">{snake.length}</p>
      </div>

      <div
        className="mx-auto grid aspect-square w-full max-w-xs gap-px rounded-xl bg-border p-1"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const x = i % SIZE
          const y = Math.floor(i / SIZE)
          const isHead = snake[0].x === x && snake[0].y === y
          const isBody = !isHead && snake.some((s) => s.x === x && s.y === y)
          const isFood = food.x === x && food.y === y
          return (
            <div
              key={i}
              className={cn(
                'aspect-square rounded-sm',
                isHead ? 'bg-primary' : isBody ? 'bg-primary/60' : isFood ? 'bg-accent' : 'bg-bg',
              )}
            />
          )
        })}
      </div>

      {!running && (
        <div className="text-center">
          {gameOver && (
            <p className="mb-2 font-heading text-sm font-semibold text-text">
              Game over — panjang akhir {snake.length}
            </p>
          )}
          <Button size="sm" onClick={reset}>
            {gameOver ? 'Main Lagi' : 'Mulai'}
          </Button>
        </div>
      )}

      {running && (
        <div className="mx-auto grid w-32 grid-cols-3 gap-1">
          <div />
          <button onClick={() => changeDir('up')} className="flex h-9 items-center justify-center rounded-lg bg-secondary/20 text-text">▲</button>
          <div />
          <button onClick={() => changeDir('left')} className="flex h-9 items-center justify-center rounded-lg bg-secondary/20 text-text">◀</button>
          <button onClick={() => changeDir('down')} className="flex h-9 items-center justify-center rounded-lg bg-secondary/20 text-text">▼</button>
          <button onClick={() => changeDir('right')} className="flex h-9 items-center justify-center rounded-lg bg-secondary/20 text-text">▶</button>
        </div>
      )}
    </Card>
  )
}
