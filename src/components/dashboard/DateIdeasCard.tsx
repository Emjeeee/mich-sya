import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { randomDateIdea } from '@/data/dateIdeas'
import { DiceIcon } from '@/components/ui/pixel-icons'

export function DateIdeasCard() {
  const [idea, setIdea] = useState<ReturnType<typeof randomDateIdea> | null>(null)

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <p className="font-heading text-sm font-semibold text-text">Butuh ide date?</p>
        {idea ? (
          <p className="mt-2 text-sm text-text">
            {idea.emoji} {idea.title}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Klik generate buat dapet ide random.</p>
        )}
      </div>
      <Button
        size="sm"
        className="mt-4 w-full"
        onClick={() => setIdea(randomDateIdea(idea?.title))}
      >
        <DiceIcon className="h-4 w-4" />
        Generate
      </Button>
    </Card>
  )
}
