import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        text: 'var(--color-text)',
        // rgb(var(...) / <alpha-value>) so opacity modifiers (bg-primary/10,
        // bg-secondary/20, ...) actually work — a bare `var(--color-x)` hex
        // value can't be modified with an opacity suffix by Tailwind.
        primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
        accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
        card: 'rgb(var(--color-card-rgb) / <alpha-value>)',
        border: 'var(--color-border)',
        muted: 'var(--color-muted)',
        // Always opaque (no <alpha-value> trick needed) — the received chat
        // bubble must stay solid regardless of any chat wallpaper behind it.
        bubble: 'var(--color-bubble)',
        bubbleText: 'var(--color-bubble-text)',
        // Text color for content sitting on a solid --color-primary fill —
        // white in every theme except Midnight Gold, whose gold primary is
        // too light for white text to meet contrast (see index.css).
        onPrimary: 'var(--color-on-primary)',
      },
      fontFamily: {
        // Each theme overrides --font-heading (see index.css); Poppins is the fallback.
        heading: ['var(--font-heading)', 'Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        number: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl2: 'var(--radius-card)',
      },
      boxShadow: {
        glow: '0 8px 30px rgba(255, 94, 138, 0.15)',
        card: 'var(--shadow-card)',
      },
      transitionTimingFunction: {
        theme: 'var(--card-ease)',
      },
      transitionDuration: {
        theme: 'var(--card-duration)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease',
      },
    },
  },
  plugins: [],
} satisfies Config
