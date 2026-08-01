import { useEffect, useState } from 'react'

interface TypewriterOptions {
  typingSpeed?: number
  deletingSpeed?: number
  pauseMs?: number
}

/** Cycles through `phrases`, typing and deleting each one in a loop. */
export function useTypewriter(phrases: string[], options: TypewriterOptions = {}) {
  const { typingSpeed = 45, deletingSpeed = 25, pauseMs = 1800 } = options
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (phrases.length === 0) return
    const current = phrases[phraseIndex % phrases.length]

    if (!deleting && text === current) {
      const pause = setTimeout(() => setDeleting(true), pauseMs)
      return () => clearTimeout(pause)
    }

    if (deleting && text === '') {
      setDeleting(false)
      setPhraseIndex((i) => (i + 1) % phrases.length)
      return
    }

    const timeout = setTimeout(
      () => {
        setText((t) => (deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)))
      },
      deleting ? deletingSpeed : typingSpeed,
    )
    return () => clearTimeout(timeout)
  }, [text, deleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseMs])

  return text
}
