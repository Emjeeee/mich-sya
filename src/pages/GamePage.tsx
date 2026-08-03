import { useParams, Navigate } from 'react-router-dom'
import { GAMES } from '@/lib/games/registry'
import { GameShell } from '@/components/arcade/GameShell'

export function GamePage() {
  const { gameKey } = useParams<{ gameKey: string }>()
  const game = GAMES.find((g) => g.key === gameKey)

  if (!game) return <Navigate to="/app/arcade" replace />

  return <GameShell game={game} />
}
