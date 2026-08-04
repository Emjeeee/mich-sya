import { useState, type FormEvent } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnlineGameSession } from '@/hooks/useOnlineGameSession'
import { useGameScores } from '@/hooks/useGameScores'
import { useCouple } from '@/contexts/CoupleContext'

interface NumberGuessState {
  secret: number
  guesses: { value: number; hint: string }[]
}

export function NumberGuessOnline() {
  const { couple, isLinked, partnerLabel } = useCouple()
  const { data: session, isLoading, user, startGame, joinGame, updateSession } =
    useOnlineGameSession('numberguess', { secret: 0, guesses: [] })
  const { recordScore } = useGameScores('numberguess')
  const [secretInput, setSecretInput] = useState('')
  const [guess, setGuess] = useState('')

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
            Angka terakhir: <span className="font-semibold">{(session.state as NumberGuessState).secret}</span>
          </p>
        )}
        <p className="text-sm text-muted">Kamu tentukan angkanya — pasanganmu yang menebak.</p>
        <div className="mx-auto flex max-w-xs gap-2">
          <Input
            type="number"
            min={1}
            max={100}
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder="1-100"
          />
          <Button
            size="sm"
            disabled={!secretInput.trim() || startGame.isPending}
            onClick={() => startGame.mutate({ secret: Number(secretInput), guesses: [] })}
          >
            Mulai
          </Button>
        </div>
      </Card>
    )
  }

  const isPlayerX = session.player_x === user?.id
  const waitingForPartner = !session.player_o && !isPlayerX
  const waitingForOpponentToJoin = !session.player_o && isPlayerX

  if (waitingForPartner) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-text">{partnerLabel} menyiapkan angka rahasia. Gabung buat nebak!</p>
        <Button size="sm" onClick={() => joinGame.mutate(session.id)}>Gabung sebagai Penebak</Button>
      </Card>
    )
  }
  if (waitingForOpponentToJoin) {
    return <Card className="text-center text-sm text-muted">Menunggu {partnerLabel} bergabung sebagai penebak...</Card>
  }

  // player_x set the secret, player_o guesses.
  const state = session.state as NumberGuessState
  const isGuesser = !isPlayerX
  const won = state.guesses.some((g) => g.value === state.secret)

  function handleGuess(e: FormEvent) {
    e.preventDefault()
    if (!session || !isGuesser || won) return
    const value = Number(guess)
    if (!value || value < 1 || value > 100) return
    let hint = 'Benar! 🎉'
    if (value < state.secret) hint = 'Terlalu kecil'
    else if (value > state.secret) hint = 'Terlalu besar'
    const nextGuesses = [{ value, hint }, ...state.guesses]
    setGuess('')
    const nextWon = value === state.secret
    updateSession.mutate({
      id: session.id,
      state: { ...state, guesses: nextGuesses },
      turn: null,
      winner: nextWon ? 'o' : null,
      status: nextWon ? 'finished' : 'active',
    })
    if (nextWon) {
      recordScore.mutate({ userId: user!.id, score: nextGuesses.length })
    }
  }

  return (
    <Card className="space-y-4">
      <p className="text-center text-sm text-muted">
        {isGuesser ? `Tebak angka 1-100 yang ${partnerLabel} pikirkan` : `${partnerLabel} sedang menebak angkamu`}
      </p>

      {won ? (
        <p className="text-center font-heading text-sm font-semibold text-text">
          {isGuesser
            ? `Kamu berhasil dalam ${state.guesses.length} tebakan! 🎉`
            : `${partnerLabel} berhasil menebak dalam ${state.guesses.length} tebakan!`}
        </p>
      ) : (
        isGuesser && (
          <form onSubmit={handleGuess} className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={100}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="1-100"
              autoFocus
            />
            <Button type="submit" size="sm">Tebak</Button>
          </form>
        )
      )}

      {state.guesses.length > 0 && (
        <div className="max-h-32 space-y-1 overflow-y-auto text-sm">
          {state.guesses.map((g, i) => (
            <div key={i} className="flex items-center justify-between text-text">
              <span>{g.value}</span>
              <span className="text-muted">{g.hint}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
