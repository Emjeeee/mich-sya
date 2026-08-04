import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChevronLeftIcon } from '@/components/ui/pixel-icons'
import { Leaderboard } from './Leaderboard'
import { cn } from '@/lib/utils'
import type { GameDef } from '@/lib/games/types'

export function GameShell({ game }: { game: GameDef }) {
  const [mode, setMode] = useState<'local' | 'online'>('local')
  const OnlineComponent = game.hasOnline ? game.OnlineComponent : undefined
  const showOnline = !!OnlineComponent

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/app/arcade"
          className="inline-flex items-center gap-1.5 rounded-full py-2 pl-1 pr-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Arcade Room
        </Link>
        <h1 className="mt-1 font-heading text-2xl font-bold text-text">{game.title}</h1>
        <p className="text-sm text-muted">{game.description}</p>
      </div>

      {showOnline && (
        <div className="flex gap-2">
          {(['local', 'online'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                mode === m ? 'bg-primary text-onPrimary' : 'bg-secondary/20 text-text',
              )}
            >
              {m === 'local' ? '📱 Satu HP' : '🌐 Online'}
            </button>
          ))}
        </div>
      )}

      {mode === 'online' && OnlineComponent ? <OnlineComponent /> : <game.LocalComponent />}

      {/* 'score' games record from local play too (see e.g. NumberGuessGame,
          BlockBlastGame), so their leaderboard is always relevant. 'wins'
          games' LocalComponents never record a score — pass-and-play wins
          were never tracked — so showing the board there would just be an
          empty "belum ada skor" that looks broken; keep it suppressed until
          online mode, same as before hasOnline existed for these games. */}
      {(game.scoreMode === 'score' || (game.scoreMode === 'wins' && (!showOnline || mode === 'online'))) && (
        <Card>
          <CardHeader title="Papan Skor" />
          <Leaderboard
            gameKey={game.key}
            mode={game.scoreMode}
            sort={game.scoreSort}
            unit={game.scoreUnit}
          />
        </Card>
      )}
    </div>
  )
}
