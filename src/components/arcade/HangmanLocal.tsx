import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WORD_BANK } from '@/lib/games/wordBanks'
import { ALPHABET, MAX_WRONG, isWordGuessed, maskWord, wrongGuessCount } from '@/lib/games/hangman'
import { cn } from '@/lib/utils'

function randomWord() {
  return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]
}

export function HangmanLocal() {
  const [word, setWord] = useState(randomWord)
  const [guessed, setGuessed] = useState<string[]>([])

  const wrong = wrongGuessCount(word, guessed)
  const won = isWordGuessed(word, guessed)
  const lost = wrong >= MAX_WRONG

  function guess(letter: string) {
    if (won || lost || guessed.includes(letter)) return
    setGuessed((g) => [...g, letter])
  }

  function reset() {
    setWord(randomWord())
    setGuessed([])
  }

  return (
    <Card className="space-y-4">
      <p className="text-center text-sm text-muted">Main bareng, tebak kata ini sama-sama</p>
      <p className="text-center text-xs text-muted">Kesempatan salah: {MAX_WRONG - wrong} tersisa</p>

      <p className="text-center font-number text-3xl font-bold tracking-widest text-text">
        {won || lost ? word : maskWord(word, guessed)}
      </p>

      {(won || lost) && (
        <p className="text-center font-heading text-sm font-semibold text-text">
          {won ? 'Berhasil! 🎉' : `Kalah — kata tadi "${word}"`}
        </p>
      )}

      <div className="mx-auto grid max-w-md grid-cols-7 gap-1.5 sm:grid-cols-9">
        {ALPHABET.map((letter) => {
          const used = guessed.includes(letter)
          const isHit = used && word.includes(letter)
          return (
            <button
              key={letter}
              onClick={() => guess(letter)}
              disabled={used || won || lost}
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

      {(won || lost) && (
        <div className="text-center">
          <Button size="sm" onClick={reset}>Main Lagi</Button>
        </div>
      )}
    </Card>
  )
}
