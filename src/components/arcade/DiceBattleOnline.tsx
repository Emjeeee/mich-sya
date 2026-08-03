import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useOnlineGameSession } from '@/hooks/useOnlineGameSession'
import { useGameScores } from '@/hooks/useGameScores'
import { useCouple } from '@/contexts/CoupleContext'
import { DICE_FACES, TARGET_SCORE, rollDie } from '@/lib/games/dice'

interface DiceState {
  p1Score: number
  p2Score: number
  lastRoll: number | null
}

const INITIAL_STATE: DiceState = { p1Score: 0, p2Score: 0, lastRoll: null }

export function DiceBattleOnline() {
  const { couple, isLinked, partnerLabel, youLabel } = useCouple()
  const { data: session, isLoading, user, startGame, joinGame, updateSession } =
    useOnlineGameSession('dice', INITIAL_STATE)
  const { recordScore } = useGameScores('dice')

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
            {session.winner === 'x' ? (session.player_x === user?.id ? youLabel : partnerLabel) : session.player_o === user?.id ? youLabel : partnerLabel} menang ronde terakhir.
          </p>
        )}
        <p className="text-sm text-muted">Target skor {TARGET_SCORE} — belum ada ronde aktif.</p>
        <Button size="sm" onClick={() => startGame.mutate(undefined)}>Mulai Ronde Baru</Button>
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

  const state = session.state as DiceState
  const isMyTurn = session.turn === user?.id

  function roll() {
    if (!session) return
    const value = rollDie()
    const nextState: DiceState = isPlayerX
      ? { ...state, p1Score: state.p1Score + value, lastRoll: value }
      : { ...state, p2Score: state.p2Score + value, lastRoll: value }

    const myScore = isPlayerX ? nextState.p1Score : nextState.p2Score
    const finished = myScore >= TARGET_SCORE
    const nextTurn = isPlayerX ? session.player_o : session.player_x

    updateSession.mutate({
      id: session.id,
      state: nextState,
      turn: finished ? null : nextTurn,
      winner: finished ? (isPlayerX ? 'x' : 'o') : null,
      status: finished ? 'finished' : 'active',
    })
    if (finished) recordScore.mutate({ winnerUserId: user!.id })
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="font-heading text-2xl font-bold text-primary">{state.p1Score}</p>
          <p className="text-xs text-muted">{session.player_x === user?.id ? youLabel : partnerLabel}</p>
        </div>
        <span className="text-4xl">{state.lastRoll ? DICE_FACES[state.lastRoll] : '🎲'}</span>
        <div className="text-center">
          <p className="font-heading text-2xl font-bold text-accent">{state.p2Score}</p>
          <p className="text-xs text-muted">{session.player_o === user?.id ? youLabel : partnerLabel}</p>
        </div>
      </div>

      <div className="text-center">
        {isMyTurn ? (
          <Button size="sm" onClick={roll}>Lempar Dadu</Button>
        ) : (
          <p className="text-sm text-muted">Menunggu giliran {partnerLabel}...</p>
        )}
      </div>
    </Card>
  )
}
