import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TRUTH_OR_DARE, type TruthOrDare } from '@/lib/games/wordBanks'

function pick(type: 'truth' | 'dare', exclude?: TruthOrDare): TruthOrDare {
  const pool = TRUTH_OR_DARE.filter((p) => p.type === type && p !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function TruthOrDareGame() {
  const [current, setCurrent] = useState<TruthOrDare | null>(null)

  return (
    <Card className="space-y-4 text-center">
      <p className="text-sm text-muted">Pilih Truth atau Dare, gantian sama pasanganmu</p>

      <div className="flex justify-center gap-3">
        <Button size="sm" onClick={() => setCurrent(pick('truth', current ?? undefined))}>
          🤔 Truth
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setCurrent(pick('dare', current ?? undefined))}>
          🔥 Dare
        </Button>
      </div>

      {current && (
        <div className="rounded-xl bg-secondary/10 p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {current.type === 'truth' ? 'Truth' : 'Dare'}
          </p>
          <p className="font-heading text-base font-medium text-text">{current.text}</p>
        </div>
      )}
    </Card>
  )
}
