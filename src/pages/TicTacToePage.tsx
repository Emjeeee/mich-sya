import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TicTacToeLocal } from '@/components/arcade/TicTacToeLocal'
import { TicTacToeOnline } from '@/components/arcade/TicTacToeOnline'
import { cn } from '@/lib/utils'

export function TicTacToePage() {
  const [mode, setMode] = useState<'local' | 'online'>('local')

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/arcade" className="text-xs font-medium text-primary hover:underline">
          ← Arcade Room
        </Link>
        <h1 className="mt-1 font-heading text-2xl font-bold text-text">Tic-Tac-Toe</h1>
        <p className="text-sm text-muted">Klasik tapi seru — main langsung atau dari HP masing-masing</p>
      </div>

      <div className="flex gap-2">
        {(['local', 'online'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              mode === m ? 'bg-primary text-white' : 'bg-secondary/20 text-text',
            )}
          >
            {m === 'local' ? '📱 Satu HP (Offline)' : '🌐 Online'}
          </button>
        ))}
      </div>

      {mode === 'local' ? <TicTacToeLocal /> : <TicTacToeOnline />}
    </div>
  )
}
