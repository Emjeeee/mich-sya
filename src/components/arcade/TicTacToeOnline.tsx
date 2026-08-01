import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TicTacToeBoard } from './TicTacToeBoard'
import { useTicTacToeSession } from '@/hooks/useTicTacToeSession'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'

export function TicTacToeOnline() {
  const { couple, isLinked, partnerLabel, youLabel } = useCouple()
  const { user } = useAuth()
  const { data: session, isLoading, startGame, joinGame, makeMove } = useTicTacToeSession()

  if (!couple || !isLinked) {
    return (
      <Card className="text-center text-sm text-muted">
        Akun belum terhubung ke pasangan — mode online butuh couple space aktif. Lihat README untuk
        setup.
      </Card>
    )
  }

  if (isLoading) {
    return <Card className="text-center text-sm text-muted">Memuat...</Card>
  }

  const noActiveGame = !session || session.status === 'finished'

  if (noActiveGame) {
    return (
      <Card className="space-y-3 text-center">
        {session?.status === 'finished' && (
          <p className="text-sm text-text">
            {session.winner === 'draw'
              ? 'Game terakhir seri.'
              : `${session.winner === 'x' ? (session.player_x === user?.id ? youLabel : partnerLabel) : session.winner === 'o' ? (session.player_o === user?.id ? youLabel : partnerLabel) : ''} menang di game terakhir.`}
          </p>
        )}
        <p className="text-sm text-muted">Belum ada game aktif. Mulai satu untuk main bareng pasangan.</p>
        <Button size="sm" disabled={startGame.isPending} onClick={() => startGame.mutate()}>
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
          {joinGame.isPending ? 'Bergabung...' : 'Gabung sebagai Pemain 2'}
        </Button>
      </Card>
    )
  }

  if (waitingForOpponentToJoin) {
    return (
      <Card className="text-center text-sm text-muted">
        Menunggu {partnerLabel} bergabung ke game ini...
      </Card>
    )
  }

  const mySymbol = isPlayerX ? 'x' : 'o'
  const isMyTurn = session.turn === user?.id
  const result = session.winner

  return (
    <Card className="space-y-4">
      <p className="text-center text-sm text-muted">
        Kamu bermain sebagai <span className="font-semibold text-text">{mySymbol === 'x' ? '✕' : '○'}</span>
      </p>

      <TicTacToeBoard
        board={session.board as ('' | 'x' | 'o')[]}
        disabled={!isMyTurn || !!result}
        onCellClick={(index) => makeMove.mutate({ session, index })}
      />

      <div className="text-center">
        {result ? (
          <p className="mb-2 font-heading text-sm font-semibold text-text">
            {result === 'draw' ? 'Seri!' : result === mySymbol ? 'Kamu menang! 🎉' : `${partnerLabel} menang.`}
          </p>
        ) : (
          <p className="mb-2 text-sm text-muted">
            {isMyTurn ? 'Giliran kamu' : `Menunggu giliran ${partnerLabel}...`}
          </p>
        )}
        {result && (
          <Button size="sm" variant="secondary" disabled={startGame.isPending} onClick={() => startGame.mutate()}>
            Main Lagi
          </Button>
        )}
      </div>
    </Card>
  )
}
