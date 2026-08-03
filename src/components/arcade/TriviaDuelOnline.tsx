import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useOnlineGameSession } from '@/hooks/useOnlineGameSession'
import { useGameScores } from '@/hooks/useGameScores'
import { useCouple } from '@/contexts/CoupleContext'
import { TRIVIA_QUESTIONS } from '@/lib/games/wordBanks'
import { cn } from '@/lib/utils'

const TARGET_CORRECT = 5

interface TriviaState {
  p1Score: number
  p2Score: number
  questionIndex: number
}

function randomQuestionIndex(exclude?: number) {
  let index: number
  do {
    index = Math.floor(Math.random() * TRIVIA_QUESTIONS.length)
  } while (index === exclude && TRIVIA_QUESTIONS.length > 1)
  return index
}

const INITIAL_STATE: TriviaState = { p1Score: 0, p2Score: 0, questionIndex: randomQuestionIndex() }

export function TriviaDuelOnline() {
  const { couple, isLinked, partnerLabel, youLabel } = useCouple()
  const { data: session, isLoading, user, startGame, joinGame, updateSession } =
    useOnlineGameSession('trivia', INITIAL_STATE)
  const { recordScore } = useGameScores('trivia')

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
        <p className="text-sm text-muted">Duel trivia, pertama sampai {TARGET_CORRECT} benar menang.</p>
        <Button size="sm" onClick={() => startGame.mutate({ p1Score: 0, p2Score: 0, questionIndex: randomQuestionIndex() })}>
          Mulai Duel Baru
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
        <p className="text-sm text-text">{partnerLabel} membuat duel baru. Gabung yuk!</p>
        <Button size="sm" onClick={() => joinGame.mutate(session.id)}>Gabung</Button>
      </Card>
    )
  }
  if (waitingForOpponentToJoin) {
    return <Card className="text-center text-sm text-muted">Menunggu {partnerLabel} bergabung...</Card>
  }

  const state = session.state as TriviaState
  const question = TRIVIA_QUESTIONS[state.questionIndex]
  const isMyTurn = session.turn === user?.id

  function answer(index: number) {
    if (!session || !isMyTurn) return
    const correct = index === question.correctIndex
    const nextState: TriviaState = isPlayerX
      ? { ...state, p1Score: state.p1Score + (correct ? 1 : 0), questionIndex: randomQuestionIndex(state.questionIndex) }
      : { ...state, p2Score: state.p2Score + (correct ? 1 : 0), questionIndex: randomQuestionIndex(state.questionIndex) }

    const myScore = isPlayerX ? nextState.p1Score : nextState.p2Score
    const finished = myScore >= TARGET_CORRECT
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
      <div className="flex items-center justify-center gap-6 text-sm text-muted">
        <span>{youLabel}: {isPlayerX ? state.p1Score : state.p2Score}</span>
        <span>{partnerLabel}: {isPlayerX ? state.p2Score : state.p1Score}</span>
      </div>

      {isMyTurn ? (
        <>
          <p className="text-center font-heading text-base font-semibold text-text">{question.question}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {question.options.map((opt, i) => (
              <button
                key={opt}
                onClick={() => answer(i)}
                className={cn('rounded-xl border border-border px-4 py-2.5 text-left text-sm font-medium transition hover:border-primary')}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-muted">Menunggu giliran {partnerLabel}...</p>
      )}
    </Card>
  )
}
