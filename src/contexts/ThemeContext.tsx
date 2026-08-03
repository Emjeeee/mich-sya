import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'michael' | 'tasya'

const VALID_THEMES: Theme[] = ['light', 'dark', 'michael', 'tasya']
const DARK_BACKGROUND_THEMES: Theme[] = ['dark', 'michael']

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored && VALID_THEMES.includes(stored as Theme)) return stored as Theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // Tailwind's `dark:` variant still applies to any dark-background theme.
    document.documentElement.classList.toggle('dark', DARK_BACKGROUND_THEMES.includes(theme))
    localStorage.setItem('theme', theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
