import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WOULD_YOU_RATHER } from '@/lib/games/wordBanks'
import { cn } from '@/lib/utils'

function pickPair(excludeIndex?: number) {
  let index: number
  do {
    index = Math.floor(Math.random() * WOULD_YOU_RATHER.length)
  } while (index === excludeIndex && WOULD_YOU_RATHER.length > 1)
  return index
}

export function WouldYouRatherGame() {
  const [index, setIndex] = useState(() => pickPair())
  const [picked, setPicked] = useState<{ you: 'A' | 'B' | null; partner: 'A' | 'B' | null }>({
    you: null,
    partner: null,
  })
  const pair = WOULD_YOU_RATHER[index]

  function next() {
    setIndex((i) => pickPair(i))
    setPicked({ you: null, partner: null })
  }

  return (
    <Card className="space-y-4">
      <p className="text-center text-sm text-muted">Pilih duluan diam-diam, terus bareng-bareng buka pilihan</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(['A', 'B'] as const).map((opt) => (
          <div key={opt} className="space-y-2">
            <p className="text-center font-heading text-sm font-medium text-text">
              {opt === 'A' ? pair.optionA : pair.optionB}
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPicked((p) => ({ ...p, you: opt }))}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  picked.you === opt ? 'bg-primary text-white' : 'bg-secondary/20 text-text',
                )}
              >
                Pilihanku
              </button>
              <button
                onClick={() => setPicked((p) => ({ ...p, partner: opt }))}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  picked.partner === opt ? 'bg-accent text-white' : 'bg-secondary/20 text-text',
                )}
              >
                Pilihan Pasangan
              </button>
            </div>
          </div>
        ))}
      </div>

      {picked.you && picked.partner && (
        <p className="text-center text-sm font-medium text-text">
          {picked.you === picked.partner ? 'Sama! Cocok banget 💗' : 'Beda pilihan — seru buat didiskusiin!'}
        </p>
      )}

      <div className="text-center">
        <Button size="sm" variant="secondary" onClick={next}>
          Pertanyaan Berikutnya
        </Button>
      </div>
    </Card>
  )
}
