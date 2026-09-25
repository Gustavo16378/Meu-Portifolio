import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { useLenis } from './useLenis'
import { prefersReducedMotion } from './reducedMotion'
import { clamp, tickerDt, watchVisibility } from './spring'

// Líquido: oscila rápido e perde energia devagar, como vinho numa taça.
const W2 = (2 * Math.PI * 1.1) ** 2 // ~1,1 oscilação por segundo
const DAMPING = 1.6
const PUSH = 3.5 // graus/s² por unidade de aceleração do scroll (px/frame por segundo)

/**
 * Superfície de líquido que tomba quando o scroll muda de velocidade e balança até assentar.
 * `surfaceRef` é o grupo SVG do líquido; gira em volta do meio da superfície.
 */
export function useSlosh(surfaceRef: RefObject<SVGGElement | null>): void {
  const lenis = useLenis()

  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface || !lenis || prefersReducedMotion()) return

    gsap.set(surface, { transformOrigin: '50% 0%' })
    const setRot = gsap.quickSetter(surface, 'rotation', 'deg')
    let theta = 0
    let omega = 0
    let lastV = 0

    const tick = (_time: number, deltaMs: number) => {
      const dt = tickerDt(deltaMs)
      const v = clamp(lenis.velocity, -60, 60)
      const accel = (v - lastV) / dt
      lastV = v
      // Página acelera pra baixo: o líquido fica pra trás e tomba pro outro lado.
      omega += (-W2 * theta - DAMPING * omega - accel * PUSH) * dt
      theta = clamp(theta + omega * dt, -14, 14)
      setRot(theta)
    }

    let running = false
    const trigger = watchVisibility(surface, (visible) => {
      if (visible && !running) gsap.ticker.add(tick)
      if (!visible && running) gsap.ticker.remove(tick)
      running = visible
    })

    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
    }
  }, [surfaceRef, lenis])
}
