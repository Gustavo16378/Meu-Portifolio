import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { prefersReducedMotion } from './reducedMotion'
import { createSpring, springAtRest, stepSpring, tickerDt } from './spring'

interface MagneticOptions {
  /** Fração da distância ao cursor que o elemento percorre. */
  strength?: number
  /** Alcance em px além da borda do elemento. */
  radius?: number
  /** Desliga sem desmontar (ex.: menu fechado). */
  enabled?: boolean
}

const SPRING = { stiffness: 170, damping: 11 }

/** O elemento se desloca na direção do cursor quando ele chega perto, e volta com mola. */
export function useMagnetic(ref: RefObject<HTMLElement | null>, options: MagneticOptions = {}): void {
  const { strength = 0.3, radius = 60, enabled = true } = options

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || prefersReducedMotion()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const setX = gsap.quickSetter(el, 'x', 'px')
    const setY = gsap.quickSetter(el, 'y', 'px')
    const sx = createSpring()
    const sy = createSpring()
    let running = false

    const tick = (_time: number, deltaMs: number) => {
      const dt = tickerDt(deltaMs)
      stepSpring(sx, dt, SPRING)
      stepSpring(sy, dt, SPRING)
      setX(sx.value)
      setY(sy.value)
      if (springAtRest(sx, 0.01) && springAtRest(sy, 0.01)) {
        gsap.ticker.remove(tick)
        running = false
      }
    }
    const wake = () => {
      if (running) return
      running = true
      gsap.ticker.add(tick)
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      // Centro sem o deslocamento atual, pra não correr atrás do próprio rabo.
      const cx = r.left + r.width / 2 - sx.value
      const cy = r.top + r.height / 2 - sy.value
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const reach = Math.max(r.width, r.height) / 2 + radius
      const inside = Math.hypot(dx, dy) < reach
      const tx = inside ? dx * strength : 0
      const ty = inside ? dy * strength : 0
      if (tx === sx.target && ty === sy.target) return
      sx.target = tx
      sy.target = ty
      wake()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.ticker.remove(tick)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [ref, strength, radius, enabled])
}
