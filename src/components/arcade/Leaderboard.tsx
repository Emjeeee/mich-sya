import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'
import { useGameScores } from '@/hooks/useGameScores'
import type { ScoreMode } from '@/lib/games/types'

export function Leaderboard({
  gameKey,
  mode,
  sort = 'desc',
  unit = '',
}: {
  gameKey: string
  mode: ScoreMode
  sort?: 'asc' | 'desc'
  unit?: string
}) {
  const { data } = useGameScores(gameKey)
  const { user } = useAuth()
  const { youLabel, partnerLabel } = useCouple()

  if (mode === 'none') return null

  if (!data || data.length === 0) {
    return <p className="text-center text-xs text-muted">Belum ada skor tercatat.</p>
  }

  if (mode === 'wins') {
    const myWins = data.filter((s) => s.winner_user_id === user?.id).length
    const partnerWins = data.filter((s) => s.winner_user_id && s.winner_user_id !== user?.id).length
    const draws = data.filter((s) => !s.winner_user_id).length

    return (
      <div className="flex items-center justify-center gap-6">
        <div className="text-center">
          <p className="font-heading text-xl font-bold text-primary">{myWins}</p>
          <p className="text-xs text-muted">{youLabel}</p>
        </div>
        {draws > 0 && (
          <div className="text-center">
            <p className="font-heading text-xl font-bold text-muted">{draws}</p>
            <p className="text-xs text-muted">Seri</p>
          </div>
        )}
        <div className="text-center">
          <p className="font-heading text-xl font-bold text-accent">{partnerWins}</p>
          <p className="text-xs text-muted">{partnerLabel}</p>
        </div>
      </div>
    )
  }

  const sorted = [...data]
    .filter((s) => s.score !== null)
    .sort((a, b) => (sort === 'asc' ? a.score! - b.score! : b.score! - a.score!))
    .slice(0, 5)

  if (sorted.length === 0) {
    return <p className="text-center text-xs text-muted">Belum ada skor tercatat.</p>
  }

  return (
    <ol className="space-y-1.5">
      {sorted.map((s, i) => (
        <li key={s.id} className="flex items-center justify-between text-sm">
          <span className="text-muted">
            #{i + 1} {s.user_id === user?.id ? youLabel : partnerLabel}
          </span>
          <span className="font-medium text-text">
            {s.score}
            {unit}
          </span>
        </li>
      ))}
    </ol>
  )
}
