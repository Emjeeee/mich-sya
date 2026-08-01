import { useTheme } from '@/contexts/ThemeContext'
import { MoonIcon, SunIcon } from '@/components/ui/icons'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Ganti tema"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20 text-text transition hover:bg-secondary/35"
    >
      {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    </button>
  )
}
