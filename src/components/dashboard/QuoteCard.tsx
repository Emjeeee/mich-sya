import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { randomQuote } from '@/data/quotes'

export function QuoteCard() {
  const [quote, setQuote] = useState(() => randomQuote())

  return (
    <Card className="flex flex-col justify-between bg-gradient-to-br from-primary/10 to-accent/10">
      <p className="font-heading text-base italic leading-relaxed text-text">“{quote.text}”</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-muted">— {quote.author}</span>
        <button
          onClick={() => setQuote((q) => randomQuote(q.text))}
          className="text-xs font-semibold text-primary hover:underline"
        >
          🔄 Kutipan Baru
        </button>
      </div>
    </Card>
  )
}
