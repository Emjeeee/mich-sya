import { cn } from '@/lib/utils'
import type { Cell } from '@/lib/tictactoe'

const MARK_STYLE: Record<Exclude<Cell, ''>, string> = {
  x: 'text-primary',
  o: 'text-accent',
}

export function TicTacToeBoard({
  board,
  onCellClick,
  disabled,
}: {
  board: Cell[]
  onCellClick?: (index: number) => void
  disabled?: boolean
}) {
  return (
    <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
      {board.map((cell, i) => (
        <button
          key={i}
          disabled={disabled || cell !== ''}
          onClick={() => onCellClick?.(i)}
          className={cn(
            'flex aspect-square items-center justify-center rounded-2xl border border-border bg-card font-number text-4xl font-bold transition',
            cell === '' && !disabled && 'hover:bg-secondary/15',
            cell !== '' && MARK_STYLE[cell],
          )}
        >
          {cell === 'x' ? '✕' : cell === 'o' ? '○' : ''}
        </button>
      ))}
    </div>
  )
}
