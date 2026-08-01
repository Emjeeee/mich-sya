import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const SYMBOLS = ['💗', '🌸', '🎈', '🍫', '🎬', '🎵', '🌙', '⭐']

interface CardState {
  id: number
  symbol: string
  matched: boolean
}

function shuffledDeck(): CardState[] {
  const deck = [...SYMBOLS, ...SYMBOLS]
    .map((symbol, i) => ({ id: i, symbol, matched: false }))
    .sort(() => Math.random() - 0.5)
  return deck.map((card, i) => ({ ...card, id: i }))
}

export function MemoryMatchGame() {
  const [deck, setDeck] = useState<CardState[]>(shuffledDeck)
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)

  const won = deck.every((c) => c.matched)

  useEffect(() => {
    if (!started || won) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [started, won])

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    const isMatch = deck[a].symbol === deck[b].symbol
    const timeout = setTimeout(
      () => {
        if (isMatch) {
          setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)))
        }
        setFlipped([])
      },
      isMatch ? 400 : 800,
    )
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped])

  function handleFlip(index: number) {
    if (flipped.length === 2 || flipped.includes(index) || deck[index].matched) return
    if (!started) setStarted(true)
    const next = [...flipped, index]
    setFlipped(next)
    if (next.length === 2) setMoves((m) => m + 1)
  }

  function reset() {
    setDeck(shuffledDeck())
    setFlipped([])
    setMoves(0)
    setSeconds(0)
    setStarted(false)
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-center gap-6 text-sm text-muted">
        <span>Langkah: {moves}</span>
        <span>Waktu: {seconds}s</span>
      </div>

      <div className="mx-auto grid w-full max-w-sm grid-cols-4 gap-2">
        {deck.map((card, i) => {
          const isFaceUp = card.matched || flipped.includes(i)
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(i)}
              disabled={isFaceUp}
              className={cn(
                'flex aspect-square items-center justify-center rounded-xl border border-border text-2xl transition',
                isFaceUp ? 'bg-primary/10' : 'bg-bg hover:bg-secondary/15',
              )}
            >
              {isFaceUp ? card.symbol : ''}
            </button>
          )
        })}
      </div>

      <div className="text-center">
        {won && (
          <p className="mb-2 font-heading text-sm font-semibold text-text">
            Selesai dalam {moves} langkah, {seconds} detik! 🎉
          </p>
        )}
        <Button size="sm" variant="secondary" onClick={reset}>
          {won ? 'Main Lagi' : 'Acak Ulang'}
        </Button>
      </div>
    </Card>
  )
}
