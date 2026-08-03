import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConnectFourBoard } from './ConnectFourBoard'
import { useOnlineGameSession } from '@/hooks/useOnlineGameSession'
import { useGameScores } from '@/hooks/useGameScores'
import { useCouple } from '@/contexts/CoupleContext'
import { EMPTY_BOARD, checkWinner, dropDisc, type Cell } from '@/lib/games/connectFour'

export function ConnectFourOnline() {
  const { couple, isLinked, partnerLabel, youLabel } = useCouple()
  const { data: session, isLoading, user, startGame, joinGame, updateSession } =
    useOnlineGameSession('connectfour', EMPTY_BOARD)
  const { recordScore } = useGameScores('connectfour')

  if (!couple || !isLinked) {
    return (
      <Card className="text-center text-sm text-muted">
        Akun belum terhubung ke pasangan — mode online butuh couple space aktif.
      </Card>
    )
  }
  if (isLoading) return <Card className="text-center text-sm text-muted">Memuat...</Card>

  const noActiveGame = !session || session.status === 'finished'
  if (noActiveGame) {
    return (
      <Card className="space-y-3 text-center">
        {session?.status === 'finished' && (
          <p className="text-sm text-text">
            {session.winner === 'draw'
              ? 'Game terakhir seri.'
              : `${session.winner === 'x' ? (session.player_x === user?.id ? youLabel : partnerLabel) : session.player_o === user?.id ? youLabel : partnerLabel} menang di game terakhir.`}
          </p>
        )}
        <p className="text-sm text-muted">Belum ada game aktif.</p>
        <Button size="sm" disabled={startGame.isPending} onClick={() => startGame.mutate(undefined)}>
          {startGame.isPending ? 'Membuat...' : 'Mulai Game Baru'}
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
        <p className="text-sm text-text">{partnerLabel} membuat game baru. Gabung yuk!</p>
        <Button size="sm" disabled={joinGame.isPending} onClick={() => joinGame.mutate(session.id)}>
          Gabung sebagai Pemain 2
        </Button>
      </Card>
    )
  }
  if (waitingForOpponentToJoin) {
    return <Card className="text-center text-sm text-muted">Menunggu {partnerLabel} bergabung...</Card>
  }

  const mySymbol: Cell = isPlayerX ? 'x' : 'o'
  const isMyTurn = session.turn === user?.id
  const result = session.winner
  const board = session.state as Cell[]

  function handleColumnClick(col: number) {
    if (!session) return
    const next = dropDisc(board, col, mySymbol)
    if (!next) return
    const outcome = checkWinner(next)
    const nextTurn = isPlayerX ? session.player_o : session.player_x

    updateSession.mutate({
      id: session.id,
      state: next,
      turn: outcome ? null : nextTurn,
      winner: outcome,
      status: outcome ? 'finished' : 'active',
    })
    if (outcome) {
      recordScore.mutate({
        winnerUserId: outcome === 'draw' ? null : outcome === mySymbol ? user!.id : nextTurn,
      })
    }
  }

  return (
    <Card className="space-y-4">
      <p className="text-center text-sm text-muted">
        Kamu bermain sebagai <span className="font-semibold text-text">{mySymbol === 'x' ? '● Merah muda' : '● Kuning'}</span>
      </p>
      <ConnectFourBoard board={board} onColumnClick={handleColumnClick} disabled={!isMyTurn || !!result} />
      <div className="text-center">
        {result ? (
          <p className="mb-2 font-heading text-sm font-semibold text-text">
            {result === 'draw' ? 'Seri!' : result === mySymbol ? 'Kamu menang! 🎉' : `${partnerLabel} menang.`}
          </p>
        ) : (
          <p className="mb-2 text-sm text-muted">{isMyTurn ? 'Giliran kamu' : `Menunggu giliran ${partnerLabel}...`}</p>
        )}
        {result && (
          <Button size="sm" variant="secondary" onClick={() => startGame.mutate(undefined)}>
            Main Lagi
          </Button>
        )}
      </div>
    </Card>
  )
}
