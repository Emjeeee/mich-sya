import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useGameScores } from '@/hooks/useGameScores'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  BLOCK_COLORS,
  GRID_SIZE,
  canPlace,
  emptyGrid,
  isGameOver,
  placePiece,
  randomTray,
  type Grid,
  type TrayPiece,
} from '@/lib/games/blockblast'

// How far above the pointer the dragged piece floats — keeps it visible past
// a touch finger instead of hidden directly underneath it, and is also the
// point used for grid hit-testing so what you see lines up with where it lands.
const LIFT_PX = 60

function PieceShape({ piece, cellPx }: { piece: TrayPiece; cellPx: number }) {
  const rows = Math.max(...piece.cells.map((c) => c[0])) + 1
  const cols = Math.max(...piece.cells.map((c) => c[1])) + 1
  const filled = new Set(piece.cells.map(([r, c]) => `${r}-${c}`))
  return (
    <div
      className="grid gap-0.5"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellPx}px)`,
      }}
    >
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        const isFilled = filled.has(`${r}-${c}`)
        return (
          <div key={i} className={cn('rounded-sm', isFilled ? BLOCK_COLORS[piece.color] : 'bg-transparent')} />
        )
      })}
    </div>
  )
}

export function BlockBlastGame() {
  const [grid, setGrid] = useState<Grid>(emptyGrid)
  const [tray, setTray] = useState<(TrayPiece | null)[]>(randomTray)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null)
  const { recordScore } = useGameScores('blockblast')
  const { user } = useAuth()

  const gridRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const hoverCellRef = useRef<{ row: number; col: number } | null>(null)
  // Only this pointer (finger/mouse) can drive the active drag — a second
  // finger touching another tray piece mid-drag is ignored instead of
  // hijacking the in-progress drag.
  const activePointerIdRef = useRef<number | null>(null)
  // Mirrors the latest grid/tray without needing them in the drag effect's
  // dependency array — the effect only re-subscribes when a drag starts/ends,
  // not on every pointer move, so it reads these refs instead of stale state.
  const gridRef2 = useRef(grid)
  const trayRef = useRef(tray)
  gridRef2.current = grid
  trayRef.current = tray

  useEffect(() => {
    if (gameOver && !recorded) {
      recordScore.mutate({ userId: user!.id, score })
      setRecorded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver])

  function cellFromPoint(x: number, y: number) {
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return null
    const cellSize = rect.width / GRID_SIZE
    const col = Math.floor((x - rect.left) / cellSize)
    const row = Math.floor((y - rect.top) / cellSize)
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null
    return { row, col }
  }

  useEffect(() => {
    if (dragIndex === null) return
    const piece = trayRef.current[dragIndex]
    if (!piece) return

    function updatePreview(x: number, y: number) {
      if (previewRef.current) {
        previewRef.current.style.transform = `translate(${x}px, ${y - LIFT_PX}px)`
      }
      const cell = cellFromPoint(x, y - LIFT_PX)
      hoverCellRef.current = cell
      setHoverCell((prev) => (prev?.row === cell?.row && prev?.col === cell?.col ? prev : cell))
    }

    function onMove(e: PointerEvent) {
      if (e.pointerId !== activePointerIdRef.current) return
      pointerRef.current = { x: e.clientX, y: e.clientY }
      updatePreview(e.clientX, e.clientY)
    }

    function onUp(e: PointerEvent) {
      if (e.pointerId !== activePointerIdRef.current) return
      activePointerIdRef.current = null
      const cell = hoverCellRef.current
      setDragIndex(null)
      setHoverCell(null)
      if (!cell) return
      const result = placePiece(gridRef2.current, piece!, cell.row, cell.col)
      if (!result) return
      setGrid(result.grid)
      setScore((s) => s + result.scoreGained)
      let nextTray = trayRef.current.map((p, i) => (i === dragIndex ? null : p))
      if (nextTray.every((p) => p === null)) nextTray = randomTray()
      setTray(nextTray)
      if (isGameOver(result.grid, nextTray)) setGameOver(true)
    }

    updatePreview(pointerRef.current.x, pointerRef.current.y)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragIndex])

  function handlePieceDown(e: React.PointerEvent, index: number) {
    // Ignore a second finger/pointer while a drag is already in progress —
    // otherwise it silently hijacks the active drag (starts dragging piece B
    // while the original finger on piece A is still down).
    if (gameOver || !tray[index] || dragIndex !== null) return
    activePointerIdRef.current = e.pointerId
    pointerRef.current = { x: e.clientX, y: e.clientY }
    setDragIndex(index)
  }

  function reset() {
    setGrid(emptyGrid())
    setTray(randomTray())
    setDragIndex(null)
    setHoverCell(null)
    activePointerIdRef.current = null
    setScore(0)
    setGameOver(false)
    setRecorded(false)
  }

  const draggingPiece = dragIndex !== null ? tray[dragIndex] : null
  const hoverValid =
    draggingPiece && hoverCell ? canPlace(grid, draggingPiece, hoverCell.row, hoverCell.col) : false
  const hoverFootprint =
    draggingPiece && hoverCell
      ? new Set(draggingPiece.cells.map(([dr, dc]) => `${hoverCell.row + dr}-${hoverCell.col + dc}`))
      : null

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Seret potongan ke kotak buat menempatkannya</p>
        <p className="font-heading text-lg font-bold text-primary">{score}</p>
      </div>

      <div
        ref={gridRef}
        className="mx-auto grid w-full max-w-xs gap-0.5 rounded-xl bg-border p-1"
        style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}
      >
        {grid.flat().map((value, i) => {
          const row = Math.floor(i / 8)
          const col = i % 8
          const inFootprint = hoverFootprint?.has(`${row}-${col}`) ?? false
          return (
            <div
              key={i}
              className={cn(
                'aspect-square rounded-sm transition',
                value !== 0
                  ? BLOCK_COLORS[value - 1]
                  : inFootprint
                    ? hoverValid
                      ? 'bg-green-500/40'
                      : 'bg-red-500/40'
                    : 'bg-card',
              )}
            />
          )
        })}
      </div>

      <div className="flex justify-center gap-3">
        {tray.map((piece, i) => (
          <div key={i} className="flex h-16 w-16 items-center justify-center rounded-lg">
            {piece && dragIndex !== i ? (
              <div
                onPointerDown={(e) => handlePieceDown(e, i)}
                className="flex cursor-grab items-center justify-center active:cursor-grabbing"
                style={{ touchAction: 'none' }}
              >
                <PieceShape piece={piece} cellPx={10} />
              </div>
            ) : (
              <div className="h-full w-full rounded-lg border-2 border-dashed border-border" />
            )}
          </div>
        ))}
      </div>

      {dragIndex !== null &&
        draggingPiece &&
        createPortal(
          // Portal straight to <body> — position:fixed here would otherwise
          // resolve relative to the nearest ancestor with a `transform`
          // (every .card gets one on :hover), not the viewport, which is
          // exactly what made the preview appear far from the actual
          // pointer. Same fix Modal.tsx already uses for this reason.
          <div
            ref={previewRef}
            className="pointer-events-none fixed left-0 top-0 z-50 opacity-90"
            style={{ transform: 'translate(-1000px, -1000px)' }}
          >
            <PieceShape piece={draggingPiece} cellPx={28} />
          </div>,
          document.body,
        )}

      {gameOver && (
        <div className="text-center">
          <p className="mb-2 font-heading text-sm font-semibold text-text">
            Game selesai — skor akhir {score}
          </p>
          <Button size="sm" onClick={reset}>Main Lagi</Button>
        </div>
      )}
    </Card>
  )
}
