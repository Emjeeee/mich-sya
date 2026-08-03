import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnlineGameSession } from '@/hooks/useOnlineGameSession'
import { useGameScores } from '@/hooks/useGameScores'
import { useCouple } from '@/contexts/CoupleContext'
import { ALPHABET, MAX_WRONG, isWordGuessed, maskWord, wrongGuessCount } from '@/lib/games/hangman'
import { cn } from '@/lib/utils'

interface HangmanState {
  word: string
  guessed: string[]
}

export function HangmanOnline() {
  const { couple, isLinked, partnerLabel } = useCouple()
  const { data: session, isLoading, user, startGame, joinGame, updateSession } =
    useOnlineGameSession('hangman', { word: '', guessed: [] })
  const { recordScore } = useGameScores('hangman')
  const [wordInput, setWordInput] = useState('')

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
            Kata terakhir: <span className="font-semibold">{(session.state as HangmanState).word}</span>
          </p>
        )}
        <p className="text-sm text-muted">Kamu jadi penentu kata — pasanganmu yang menebak.</p>
        <div className="mx-auto flex max-w-xs gap-2">
          <Input
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            placeholder="Ketik kata rahasia"
          />
          <Button
            size="sm"
            disabled={!wordInput.trim() || startGame.isPending}
            onClick={() => startGame.mutate({ word: wordInput.trim().toUpperCase(), guessed: [] })}
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
        <p className="text-sm text-text">{partnerLabel} menyiapkan kata rahasia. Gabung buat nebak!</p>
        <Button size="sm" onClick={() => joinGame.mutate(session.id)}>Gabung sebagai Penebak</Button>
      </Card>
    )
  }
  if (waitingForOpponentToJoin) {
    return <Card className="text-center text-sm text-muted">Menunggu {partnerLabel} bergabung sebagai penebak...</Card>
  }

  // player_x set the word (setter), player_o guesses.
  const state = session.state as HangmanState
  const isGuesser = !isPlayerX
  const wrong = wrongGuessCount(state.word, state.guessed)
  const won = isWordGuessed(state.word, state.guessed)
  const lost = wrong >= MAX_WRONG

  function guess(letter: string) {
    if (!session || !isGuesser || won || lost || state.guessed.includes(letter)) return
    const nextGuessed = [...state.guessed, letter]
    const nextWrong = wrongGuessCount(state.word, nextGuessed)
    const nextWon = isWordGuessed(state.word, nextGuessed)
    const nextLost = nextWrong >= MAX_WRONG

    const finished = nextWon || nextLost
    updateSession.mutate({
      id: session.id,
      state: { ...state, guessed: nextGuessed },
      turn: null,
      winner: finished ? (nextWon ? 'o' : 'x') : null,
      status: finished ? 'finished' : 'active',
    })
    if (finished) {
      recordScore.mutate({ winnerUserId: nextWon ? session.player_o : session.player_x })
    }
  }

  return (
    <Card className="space-y-4">
      <p className="text-center text-sm text-muted">
        {isGuesser ? 'Tebak kata dari pasanganmu' : `${partnerLabel} sedang menebak kata darimu`}
      </p>
      <p className="text-center text-xs text-muted">Kesempatan salah: {MAX_WRONG - wrong} tersisa</p>

      <p className="text-center font-number text-3xl font-bold tracking-widest text-text">
        {won || lost ? state.word : maskWord(state.word, state.guessed)}
      </p>

      {(won || lost) && (
        <p className="text-center font-heading text-sm font-semibold text-text">
          {won
            ? isGuesser
              ? 'Kamu berhasil menebak! 🎉'
              : `${partnerLabel} berhasil menebak!`
            : isGuesser
              ? `Kalah — kata tadi "${state.word}"`
              : `Kamu menang — ${partnerLabel} kehabisan kesempatan!`}
        </p>
      )}

      {isGuesser && !won && !lost && (
        <div className="mx-auto grid max-w-md grid-cols-7 gap-1.5 sm:grid-cols-9">
          {ALPHABET.map((letter) => {
            const used = state.guessed.includes(letter)
            const isHit = used && state.word.includes(letter)
            return (
              <button
                key={letter}
                onClick={() => guess(letter)}
                disabled={used}
                className={cn(
                  'flex h-8 items-center justify-center rounded-md text-xs font-semibold transition',
                  !used && 'bg-secondary/20 text-text hover:bg-secondary/35',
                  isHit && 'bg-green-500/20 text-green-600',
                  used && !isHit && 'bg-red-500/10 text-red-400',
                )}
              >
                {letter}
              </button>
            )
          })}
        </div>
      )}

    </Card>
  )
}
