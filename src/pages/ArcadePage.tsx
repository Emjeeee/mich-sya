import { NavLink } from 'react-router-dom'

const GAMES = [
  {
    to: '/app/arcade/tictactoe',
    icon: '⭕',
    title: 'Tic-Tac-Toe',
    description: 'Main satu HP gantian, atau online dari device masing-masing.',
  },
  {
    to: '/app/arcade/memory',
    icon: '🃏',
    title: 'Kartu Jodoh',
    description: 'Cocokkan pasangan kartu secepat mungkin — main bareng satu layar.',
  },
]

export function ArcadePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">Arcade Room</h1>
        <p className="text-sm text-muted">Mini game buat seru-seruan berdua</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GAMES.map((game) => (
          <NavLink
            key={game.to}
            to={game.to}
            className="flex items-start gap-4 rounded-xl2 border border-border bg-card p-5 shadow-sm transition hover:border-primary"
          >
            <span className="text-3xl">{game.icon}</span>
            <div>
              <p className="font-heading text-base font-semibold text-text">{game.title}</p>
              <p className="mt-1 text-sm text-muted">{game.description}</p>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
