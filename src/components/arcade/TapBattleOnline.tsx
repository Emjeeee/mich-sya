import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useOnlineGameSession } from '@/hooks/useOnlineGameSession'
import { useGameScores } from '@/hooks/useGameScores'
import { useCouple } from '@/contexts/CoupleContext'

interface TapBattleState {
  startedAt: string | null
  p1Taps: number
  p2Taps: number
}

const COUNTDOWN_MS = 3000
const PLAY_MS = 10000
const PUSH_INTERVAL_MS = 700
// Extra wait after locally detecting "done" before player_x records the
// winner — gives the last throttled tap pushes + one more poll time to land.
// This is a first: every other online game here is turn-gated (one write at
// a time); Tap Battle is the only one where both clients write concurrently,
// so exact precision is inherently coarser than local pass-and-play. The
// result TEXT shown to both players is never gated on this delay — only the
// score-recording call is, so nobody is stuck on a "calculating" screen.
const SETTLE_MS = 3000

const INITIAL_STATE: TapBattleState = { startedAt: null, p1Taps: 0, p2Taps: 0 }

export function TapBattleOnline() {
  const { couple, isLinked, partnerLabel } = useCouple()
  const { data: session, isLoading, user, startGame, joinGame, updateSession } =
    useOnlineGameSession('tapbattle', INITIAL_STATE)
  const { recordScore } = useGameScores('tapbattle')
  const [now, setNow] = useState(Date.now())
  const [myTaps, setMyTaps] = useState(0)
  const lastPushedRef = useRef(0)
  // Guards the settle-and-record effect against double-firing — a ref, not
  // state, since it's purely an internal write-once guard, not used for
  // rendering (the result text below is never gated on it).
  const scoreRecordedRef = useRef(false)

  const state = (session?.state as TapBattleState | undefined) ?? INITIAL_STATE
  const isPlayerX = session?.player_x === user?.id
  const elapsed = state.startedAt ? now - new Date(state.startedAt).getTime() : 0
  const phase: 'countdown' | 'playing' | 'done' =
    elapsed < COUNTDOWN_MS ? 'countdown' : elapsed < COUNTDOWN_MS + PLAY_MS ? 'playing' : 'done'

  // Mirrors the latest state/myTaps without needing them in the settle
  // effect's dependency array — read fresh inside the delayed callback
  // instead of closing over values captured when the timer was scheduled
  // (that staleness previously meant the settle write could clobber the
  // opponent's just-landed final tap count with an outdated cached one).
  const stateRef = useRef(state)
  const myTapsRef = useRef(myTaps)
  stateRef.current = state
  myTapsRef.current = myTaps

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(id)
  }, [])

  // Reset local tap state whenever a fresh round starts.
  useEffect(() => {
    if (state.startedAt) {
      setMyTaps(0)
      lastPushedRef.current = 0
      scoreRecordedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startedAt])

  // Throttled push of my own tap count — never overwrites the partner's
  // field, always merges on top of the latest known session state.
  useEffect(() => {
    if (!session || phase !== 'playing') return
    if (myTaps === lastPushedRef.current) return
    const id = setTimeout(() => {
      lastPushedRef.current = myTaps
      const nextState: TapBattleState = isPlayerX
        ? { ...state, p1Taps: myTaps }
        : { ...state, p2Taps: myTaps }
      updateSession.mutate({ id: session.id, state: nextState, turn: null, winner: null, status: 'active' })
    }, PUSH_INTERVAL_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTaps, phase])

  // Only player_x's client records the result, once, after a settle delay —
  // avoids both clients double-recording the same round. Reads stateRef/
  // myTapsRef (not the closed-over state/myTaps) so the value used 3s later
  // reflects whatever has actually landed by then, not what was known when
  // this effect was scheduled.
  useEffect(() => {
    if (!session || !isPlayerX || phase !== 'done' || scoreRecordedRef.current) return
    scoreRecordedRef.current = true
    const sessionId = session.id
    const player_x = session.player_x
    const player_o = session.player_o
    const id = setTimeout(() => {
      const finalState: TapBattleState = { ...stateRef.current, p1Taps: myTapsRef.current }
      const p1 = finalState.p1Taps
      const p2 = finalState.p2Taps
      const winnerUserId = p1 === p2 ? null : p1 > p2 ? player_x : player_o
      updateSession.mutate({ id: sessionId, state: finalState, turn: null, winner: null, status: 'active' })
      if (winnerUserId) recordScore.mutate({ winnerUserId })
    }, SETTLE_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isPlayerX, session?.id])

  if (!couple || !isLinked) {
    return <Card className="text-center text-sm text-muted">Akun belum terhubung ke pasangan.</Card>
  }
  if (isLoading) return <Card className="text-center text-sm text-muted">Memuat...</Card>

  if (!session) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-muted">
          Siapa paling banyak tap dalam {PLAY_MS / 1000} detik — kamu cuma lihat hitungan kamu sendiri
          sampai waktu habis.
        </p>
        <Button
          size="sm"
          disabled={startGame.isPending}
          onClick={() => startGame.mutate({ startedAt: new Date().toISOString(), p1Taps: 0, p2Taps: 0 })}
        >
          Mulai
        </Button>
      </Card>
    )
  }

  const waitingForPartner = !session.player_o && !isPlayerX
  const waitingForOpponentToJoin = !session.player_o && isPlayerX

  if (waitingForPartner) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-text">{partnerLabel} memulai ronde baru. Gabung yuk!</p>
        <Button size="sm" onClick={() => joinGame.mutate(session.id)}>Gabung</Button>
      </Card>
    )
  }
  if (waitingForOpponentToJoin) {
    return <Card className="text-center text-sm text-muted">Menunggu {partnerLabel} bergabung...</Card>
  }

  function restart() {
    if (!session) return
    updateSession.mutate({
      id: session.id,
      state: { startedAt: new Date().toISOString(), p1Taps: 0, p2Taps: 0 },
      turn: null,
      winner: null,
      status: 'active',
    })
  }

  const opponentTaps = isPlayerX ? state.p2Taps : state.p1Taps

  return (
    <Card className="space-y-4">
      {phase === 'countdown' && (
        <p className="text-center font-number text-5xl font-bold text-primary">
          {Math.max(1, Math.ceil((COUNTDOWN_MS - elapsed) / 1000))}
        </p>
      )}

      {phase === 'playing' && (
        <>
          <p className="text-center text-sm font-medium text-muted">
            Sisa waktu: {Math.max(0, Math.ceil((COUNTDOWN_MS + PLAY_MS - elapsed) / 1000))}s
          </p>
          <button
            onClick={() => setMyTaps((t) => t + 1)}
            className="mx-auto flex h-40 w-full max-w-xs flex-col items-center justify-center rounded-2xl bg-primary/15 active:bg-primary/25"
          >
            <span className="font-number text-5xl font-bold text-primary">{myTaps}</span>
            <span className="mt-1 text-xs text-muted">ketukanmu</span>
          </button>
        </>
      )}

      {phase === 'done' && (
        <div className="text-center">
          <p className="mb-1 font-heading text-sm font-semibold text-text">
            Kamu: {myTaps} · {partnerLabel}: {opponentTaps}
          </p>
          <p className="mb-3 text-sm text-muted">
            {myTaps === opponentTaps
              ? 'Seri!'
              : myTaps > opponentTaps
                ? 'Kamu menang! 🎉'
                : `${partnerLabel} menang.`}
          </p>
          <Button size="sm" onClick={restart}>Main Lagi</Button>
        </div>
      )}
    </Card>
  )
}
