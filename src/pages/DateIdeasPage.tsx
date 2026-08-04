import { useState } from 'react'
import { DATE_IDEAS, type DateIdea } from '@/data/dateIdeas'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const CATEGORIES: { key: DateIdea['category'] | 'semua'; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'santai', label: 'Santai' },
  { key: 'seru', label: 'Seru' },
  { key: 'romantis', label: 'Romantis' },
  { key: 'hemat', label: 'Hemat' },
]

export function DateIdeasPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['key']>('semua')
  const [featured, setFeatured] = useState<DateIdea | null>(null)

  const pool = category === 'semua' ? DATE_IDEAS : DATE_IDEAS.filter((d) => d.category === category)

  function generate() {
    const source = category === 'semua' ? DATE_IDEAS : pool
    setFeatured(source[Math.floor(Math.random() * source.length)])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">Ide Date Random</h1>
        <p className="text-sm text-muted">Bingung mau ngapain? Klik generate!</p>
      </div>

      <Card className="flex flex-col items-center gap-4 bg-gradient-to-br from-primary/10 to-accent/10 py-8 text-center">
        {featured ? (
          <>
            <span className="text-4xl">{featured.emoji}</span>
            <p className="max-w-md font-heading text-lg font-semibold text-text">
              {featured.title}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">Klik tombol di bawah untuk dapat ide date random.</p>
        )}
        <Button onClick={generate}>🎲 Generate Ide</Button>
      </Card>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              category === c.key ? 'bg-primary text-onPrimary' : 'bg-secondary/20 text-text',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pool.map((idea) => (
          <Card key={idea.title} className="flex items-start gap-3">
            <span className="text-xl">{idea.emoji}</span>
            <p className="text-sm text-text">{idea.title}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
