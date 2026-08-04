import { cn } from '@/lib/utils'
import { COLS, ROWS, type Cell } from '@/lib/games/connectFour'

const MARK_STYLE: Record<Exclude<Cell, ''>, string> = {
  x: 'bg-primary',
  o: 'bg-accent',
}

export function ConnectFourBoard({
  board,
  onColumnClick,
  disabled,
}: {
  board: Cell[]
  onColumnClick?: (col: number) => void
  disabled?: boolean
}) {
  return (
    <div className="mx-auto grid w-full max-w-sm gap-1 rounded-xl bg-secondary/20 p-2" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
      {Array.from({ length: COLS }, (_, col) => (
        <button
          key={col}
          disabled={disabled}
          onClick={() => onColumnClick?.(col)}
          className="flex flex-col gap-1 rounded-lg p-0.5 transition hover:bg-white/10 disabled:hover:bg-transparent"
        >
          {Array.from({ length: ROWS }, (_, row) => {
            const cell = board[row * COLS + col]
            return (
              <span
                key={row}
                className={cn(
                  'aspect-square rounded-full',
                  cell ? MARK_STYLE[cell] : 'bg-card',
                )}
              />
            )
          })}
        </button>
      ))}
    </div>
  )
}
