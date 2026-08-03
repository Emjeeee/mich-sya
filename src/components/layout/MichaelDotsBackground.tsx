import { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const SPACING = 42
const INFLUENCE_RADIUS = 130
const BASE_RADIUS = 1.3
const MAX_RADIUS = 3.4
const BASE_COLOR = '139, 92, 246' // violet
const NEAR_COLOR = '236, 72, 153' // magenta

/**
 * Vanta.js-style interactive dot field, exclusive to Michael Mode. Pure
 * Canvas 2D (no three.js/vanta dependency) — a grid of dots that glow and
 * drift away from the pointer. Mounted once globally in App.tsx, behind all
 * page content (see `--color-bg: transparent` for the michael theme in
 * index.css, which is what lets it show through).
 */
export function MichaelDotsBackground() {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    if (theme !== 'michael') return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let dots: { x: number; y: number }[] = []
    let rafId = 0

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      dots = []
      const cols = Math.ceil(width / SPACING) + 1
      const rows = Math.ceil(height / SPACING) + 1
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({ x: i * SPACING, y: j * SPACING })
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      pointerRef.current = { x: e.clientX, y: e.clientY }
    }
    function onPointerLeave() {
      pointerRef.current = { x: -9999, y: -9999 }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height)
      const { x: px, y: py } = pointerRef.current

      for (const dot of dots) {
        const dx = dot.x - px
        const dy = dot.y - py
        const dist = Math.sqrt(dx * dx + dy * dy)

        let radius = BASE_RADIUS
        let alpha = 0.3
        let color = BASE_COLOR
        let ox = 0
        let oy = 0

        if (dist < INFLUENCE_RADIUS) {
          const t = 1 - dist / INFLUENCE_RADIUS
          radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * t
          alpha = 0.3 + 0.65 * t
          color = NEAR_COLOR
          if (dist > 0.01) {
            const push = t * 12
            ox = (dx / dist) * push
            oy = (dy / dist) * push
          }
        }

        ctx!.beginPath()
        ctx!.fillStyle = `rgba(${color}, ${alpha})`
        ctx!.arc(dot.x + ox, dot.y + oy, radius, 0, Math.PI * 2)
        ctx!.fill()
      }

      if (!prefersReducedMotion) rafId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerleave', onPointerLeave)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [theme])

  if (theme !== 'michael') return null

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
}
