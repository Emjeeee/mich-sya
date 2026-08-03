import { NavLink } from 'react-router-dom'
import { GAMES } from '@/lib/games/registry'
import { Pixel } from '@/components/ui/pixel-icons'

export function ArcadePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">Arcade Room</h1>
        <p className="text-sm text-muted">{GAMES.length} mini game buat seru-seruan berdua</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <NavLink
            key={game.key}
            to={`/app/arcade/${game.key}`}
            className="flex items-start gap-4 rounded-xl2 border border-border bg-card p-5 shadow-sm transition hover:border-primary"
          >
            <Pixel name={game.icon} className="h-8 w-8 shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-heading text-base font-semibold text-text">{game.title}</p>
                {game.hasOnline && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    ONLINE
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{game.description}</p>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
