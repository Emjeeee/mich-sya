import { useTheme, type Theme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

const OPTIONS: { key: Theme; label: string; dot: string }[] = [
  { key: 'light', label: 'Terang', dot: '#FF5E8A' },
  { key: 'dark', label: 'Gelap', dot: '#FF5E8A' },
  { key: 'michael', label: 'Michael', dot: '#8B5CF6' },
  { key: 'tasya', label: 'Tasya', dot: '#E8A0B4' },
  { key: 'midnightgold', label: 'Midnight Gold', dot: '#D4AF37' },
]

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => setTheme(opt.key)}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium transition',
            theme === opt.key
              ? 'border-primary bg-primary/10 text-text'
              : 'border-border text-text hover:bg-secondary/10',
          )}
        >
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: opt.dot }}
            aria-hidden
          />
          {opt.label}
        </button>
      ))}
    </div>
  )
}
