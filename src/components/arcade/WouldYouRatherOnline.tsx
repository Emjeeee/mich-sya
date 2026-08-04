import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useOnlineGameSession } from '@/hooks/useOnlineGameSession'
import { useCouple } from '@/contexts/CoupleContext'
import { WOULD_YOU_RATHER } from '@/lib/games/wordBanks'
import { cn } from '@/lib/utils'

interface WyrState {
  pairIndex: number
  p1Pick: 'A' | 'B' | null
  p2Pick: 'A' | 'B' | null
  matches: number
  rounds: number
}

function randomPair(exclude?: number) {
  let index: number
  do {
    index = Math.floor(Math.random() * WOULD_YOU_RATHER.length)
  } while (index === exclude && WOULD_YOU_RATHER.length > 1)
  return index
}

const INITIAL_STATE: WyrState = { pairIndex: 0, p1Pick: null, p2Pick: null, matches: 0, rounds: 0 }

export function WouldYouRatherOnline() {
  const { couple, isLinked, partnerLabel } = useCouple()
  const { data: session, isLoading, user, startGame, joinGame, updateSession, refetch } =
    useOnlineGameSession('wouldyourather', INITIAL_STATE)

  if (!couple || !isLinked) {
    return <Card className="text-center text-sm text-muted">Akun belum terhubung ke pasangan.</Card>
  }
  if (isLoading) return <Card className="text-center text-sm text-muted">Memuat...</Card>

  const noActiveGame = !session || session.status === 'finished'
  if (noActiveGame) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-muted">
          Pilih diam-diam dari device masing-masing — pilihan pasanganmu baru kelihatan setelah
          kalian berdua pilih.
        </p>
        <Button size="sm" disabled={startGame.isPending} onClick={() => startGame.mutate({ ...INITIAL_STATE, pairIndex: randomPair() })}>
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

  const state = session.state as WyrState
  const pair = WOULD_YOU_RATHER[state.pairIndex]
  const myPick = isPlayerX ? state.p1Pick : state.p2Pick
  const bothPicked = state.p1Pick && state.p2Pick

  async function pick(opt: 'A' | 'B') {
    if (!session || myPick || updateSession.isPending) return
    // Re-fetch right before writing rather than merging onto the possibly-up-
    // to-2.5s-stale polled `state` — both players can pick within the same
    // poll window, and writing on stale state could silently wipe out a pick
    // the partner's client already landed. This narrows the race to a single
    // network round-trip instead of a full poll interval.
    const fresh = await refetch()
    const freshSession = fresh.data
    if (!freshSession) return
    const freshState = freshSession.state as WyrState
    const nextState: WyrState = isPlayerX ? { ...freshState, p1Pick: opt } : { ...freshState, p2Pick: opt }
    updateSession.mutate({ id: freshSession.id, state: nextState, turn: null, winner: null, status: 'active' })
  }

  function nextRound() {
    if (!session) return
    const matched = state.p1Pick === state.p2Pick
    const nextState: WyrState = {
      pairIndex: randomPair(state.pairIndex),
      p1Pick: null,
      p2Pick: null,
      matches: state.matches + (matched ? 1 : 0),
      rounds: state.rounds + 1,
    }
    updateSession.mutate({ id: session.id, state: nextState, turn: null, winner: null, status: 'active' })
  }

  function endSession() {
    if (!session) return
    updateSession.mutate({ id: session.id, state, turn: null, winner: null, status: 'finished' })
  }

  return (
    <Card className="space-y-4">
      {state.rounds > 0 && (
        <p className="text-center text-xs font-medium text-muted">
          Kalian sudah {state.matches}/{state.rounds} kali pilihan sama 💗
        </p>
      )}

      {bothPicked ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(['A', 'B'] as const).map((opt) => (
              <div
                key={opt}
                className={cn(
                  'space-y-2 rounded-xl p-3 text-center',
                  state.p1Pick === opt || state.p2Pick === opt ? 'bg-secondary/20' : '',
                )}
              >
                <p className="font-heading text-sm font-medium text-text">
                  {opt === 'A' ? pair.optionA : pair.optionB}
                </p>
                <p className="text-xs text-muted">
                  {state.p1Pick === opt && state.p2Pick === opt
                    ? 'Kalian berdua pilih ini'
                    : state.p1Pick === opt
                      ? (isPlayerX ? 'Pilihanmu' : `Pilihan ${partnerLabel}`)
                      : state.p2Pick === opt
                        ? (!isPlayerX ? 'Pilihanmu' : `Pilihan ${partnerLabel}`)
                        : ''}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm font-medium text-text">
            {state.p1Pick === state.p2Pick ? 'Sama! Cocok banget 💗' : 'Beda pilihan — seru buat didiskusiin!'}
          </p>
          <div className="flex justify-center gap-2">
            <Button size="sm" onClick={nextRound}>Pertanyaan Berikutnya</Button>
            <Button size="sm" variant="ghost" onClick={endSession}>Selesai</Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-center text-sm font-medium text-text">Would you rather...</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(['A', 'B'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={!!myPick || updateSession.isPending}
                className={cn(
                  'rounded-xl p-4 text-center text-sm font-medium transition',
                  myPick === opt ? 'bg-primary text-onPrimary' : 'bg-secondary/20 text-text hover:bg-secondary/35',
                )}
              >
                {opt === 'A' ? pair.optionA : pair.optionB}
              </button>
            ))}
          </div>
          {myPick && (
            <p className="text-center text-xs text-muted">Menunggu {partnerLabel} memilih...</p>
          )}
        </>
      )}
    </Card>
  )
}
