import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useOnlineGameSession } from '@/hooks/useOnlineGameSession'
import { useCouple } from '@/contexts/CoupleContext'
import { TRUTH_OR_DARE, type TruthOrDare } from '@/lib/games/wordBanks'

interface TodState {
  picker: 'x' | 'o' // whose turn it is to be challenged (picks Truth/Dare for themselves)
  current: TruthOrDare | null
  truths: number
  dares: number
}

function pickPrompt(type: 'truth' | 'dare', exclude?: TruthOrDare | null) {
  const pool = TRUTH_OR_DARE.filter((p) => p.type === type && p !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

const INITIAL_STATE: TodState = { picker: 'x', current: null, truths: 0, dares: 0 }

export function TruthOrDareOnline() {
  const { couple, isLinked, partnerLabel } = useCouple()
  const { data: session, isLoading, user, startGame, joinGame, updateSession } =
    useOnlineGameSession('truthordare', INITIAL_STATE)

  if (!couple || !isLinked) {
    return <Card className="text-center text-sm text-muted">Akun belum terhubung ke pasangan.</Card>
  }
  if (isLoading) return <Card className="text-center text-sm text-muted">Memuat...</Card>

  const noActiveGame = !session || session.status === 'finished'
  if (noActiveGame) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-muted">
          Gantian pilih Truth atau Dare untuk diri sendiri — pertanyaan/tantangannya cuma muncul di
          layar pasanganmu, biar dia yang bacain ke kamu.
        </p>
        <Button size="sm" disabled={startGame.isPending} onClick={() => startGame.mutate(undefined)}>
          Mulai Sesi
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
        <p className="text-sm text-text">{partnerLabel} memulai sesi baru. Gabung yuk!</p>
        <Button size="sm" onClick={() => joinGame.mutate(session.id)}>Gabung</Button>
      </Card>
    )
  }
  if (waitingForOpponentToJoin) {
    return <Card className="text-center text-sm text-muted">Menunggu {partnerLabel} bergabung...</Card>
  }

  const state = session.state as TodState
  const myRole: 'x' | 'o' = isPlayerX ? 'x' : 'o'
  const isPicker = state.picker === myRole

  function choose(type: 'truth' | 'dare') {
    if (!session || !isPicker || state.current) return
    const prompt = pickPrompt(type, state.current)
    const nextState: TodState = {
      ...state,
      current: prompt,
      truths: state.truths + (type === 'truth' ? 1 : 0),
      dares: state.dares + (type === 'dare' ? 1 : 0),
    }
    updateSession.mutate({ id: session.id, state: nextState, turn: null, winner: null, status: 'active' })
  }

  function finishRound() {
    if (!session) return
    const nextState: TodState = { ...state, picker: state.picker === 'x' ? 'o' : 'x', current: null }
    updateSession.mutate({ id: session.id, state: nextState, turn: null, winner: null, status: 'active' })
  }

  function endSession() {
    if (!session) return
    updateSession.mutate({ id: session.id, state, turn: null, winner: null, status: 'finished' })
  }

  return (
    <Card className="space-y-4 text-center">
      {(state.truths > 0 || state.dares > 0) && (
        <p className="text-xs font-medium text-muted">
          🤔 {state.truths} Truth · 🔥 {state.dares} Dare
        </p>
      )}

      {isPicker ? (
        state.current ? (
          <p className="text-sm text-muted">
            Menunggu {partnerLabel} membacakan {state.current.type === 'truth' ? 'pertanyaannya' : 'tantangannya'}...
          </p>
        ) : (
          <>
            <p className="text-sm text-muted">Giliranmu — pilih Truth atau Dare</p>
            <div className="flex justify-center gap-3">
              <Button size="sm" onClick={() => choose('truth')}>🤔 Truth</Button>
              <Button size="sm" variant="secondary" onClick={() => choose('dare')}>🔥 Dare</Button>
            </div>
          </>
        )
      ) : state.current ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-secondary/10 p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {state.current.type === 'truth' ? 'Truth' : 'Dare'} untuk {partnerLabel}
            </p>
            <p className="font-heading text-base font-medium text-text">{state.current.text}</p>
          </div>
          <p className="text-xs text-muted">Bacakan ini ke {partnerLabel}, lalu lanjut kalau sudah selesai.</p>
          <Button size="sm" onClick={finishRound}>Lanjut ke Giliran Berikutnya</Button>
        </div>
      ) : (
        <p className="text-sm text-muted">Menunggu {partnerLabel} memilih Truth atau Dare...</p>
      )}

      <div>
        <Button size="sm" variant="ghost" onClick={endSession}>Selesai Sesi</Button>
      </div>
    </Card>
  )
}
