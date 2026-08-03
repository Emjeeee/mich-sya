import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useOnlineGameSession } from '@/hooks/useOnlineGameSession'
import { useGameScores } from '@/hooks/useGameScores'
import { useCouple } from '@/contexts/CoupleContext'
import { MOVES, roundWinner, type Move } from '@/lib/games/rps'

interface RpsState {
  p1Move: Move | null
  p2Move: Move | null
}

const INITIAL_STATE: RpsState = { p1Move: null, p2Move: null }

export function RockPaperScissorsOnline() {
  const { couple, isLinked, partnerLabel, youLabel } = useCouple()
  const { data: session, isLoading, user, startGame, joinGame, updateSession } =
    useOnlineGameSession('rps', INITIAL_STATE)
  const { recordScore } = useGameScores('rps')

  if (!couple || !isLinked) {
    return <Card className="text-center text-sm text-muted">Akun belum terhubung ke pasangan.</Card>
  }
  if (isLoading) return <Card className="text-center text-sm text-muted">Memuat...</Card>

  const noActiveGame = !session || session.status === 'finished'
  if (noActiveGame) {
    return (
      <Card className="space-y-3 text-center">
        {session?.status === 'finished' && (
          <p className="text-sm text-text">
            {session.winner === 'draw'
              ? 'Ronde terakhir seri.'
              : `${session.winner === 'x' ? (session.player_x === user?.id ? youLabel : partnerLabel) : session.player_o === user?.id ? youLabel : partnerLabel} menang ronde terakhir.`}
          </p>
        )}
        <p className="text-sm text-muted">Belum ada ronde aktif.</p>
        <Button size="sm" disabled={startGame.isPending} onClick={() => startGame.mutate(undefined)}>
          Mulai Ronde Baru
        </Button>
      </Card>
    )
  }

  const isPlayerX = session.player_x === user?.id
  const waitingForPartner = !session.player_o && !isPlayerX
  const waitingForOpponentToJoin = !session.player_o && isPlayerX

  if (waitingForPartner) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-text">{partnerLabel} membuat ronde baru. Gabung yuk!</p>
        <Button size="sm" onClick={() => joinGame.mutate(session.id)}>Gabung</Button>
      </Card>
    )
  }
  if (waitingForOpponentToJoin) {
    return <Card className="text-center text-sm text-muted">Menunggu {partnerLabel} bergabung...</Card>
  }

  const state = session.state as RpsState
  const myMove = isPlayerX ? state.p1Move : state.p2Move
  const bothPicked = state.p1Move && state.p2Move

  function pick(move: Move) {
    if (!session || myMove) return
    const nextState: RpsState = isPlayerX
      ? { ...state, p1Move: move }
      : { ...state, p2Move: move }

    if (nextState.p1Move && nextState.p2Move) {
      const outcome = roundWinner(nextState.p1Move, nextState.p2Move)
      const winner = outcome === 'draw' ? 'draw' : outcome === 'a' ? 'x' : 'o'
      updateSession.mutate({ id: session.id, state: nextState, turn: null, winner, status: 'finished' })
      const winnerUserId =
        outcome === 'draw' ? null : (outcome === 'a') === isPlayerX ? user!.id : session.player_x === user!.id ? session.player_o : session.player_x
      recordScore.mutate({ winnerUserId })
    } else {
      updateSession.mutate({ id: session.id, state: nextState, turn: session.turn, winner: null, status: 'active' })
    }
  }

  if (bothPicked) {
    const outcome = roundWinner(state.p1Move!, state.p2Move!)
    const iWon = (outcome === 'a') === isPlayerX
    return (
      <Card className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-6">
          <span className="text-4xl">{MOVES.find((m) => m.key === state.p1Move)?.emoji}</span>
          <span className="text-sm text-muted">vs</span>
          <span className="text-4xl">{MOVES.find((m) => m.key === state.p2Move)?.emoji}</span>
        </div>
        <p className="font-heading text-sm font-semibold text-text">
          {outcome === 'draw' ? 'Seri!' : iWon ? 'Kamu menang! 🎉' : `${partnerLabel} menang.`}
        </p>
        <Button size="sm" variant="secondary" onClick={() => startGame.mutate(undefined)}>Ronde Baru</Button>
      </Card>
    )
  }

  return (
    <Card className="space-y-4 text-center">
      {myMove ? (
        <p className="text-sm text-muted">Kamu pilih {MOVES.find((m) => m.key === myMove)?.emoji} — menunggu {partnerLabel}...</p>
      ) : (
        <>
          <p className="text-sm font-medium text-text">Pilih gerakanmu</p>
          <div className="flex justify-center gap-3">
            {MOVES.map((m) => (
              <button key={m.key} onClick={() => pick(m.key)} className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-secondary/20 text-2xl transition hover:bg-secondary/35">
                {m.emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
