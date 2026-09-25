import { useEffect, type RefObject } from 'react'
import { gsap } from './gsap'
import { prefersReducedMotion } from './reducedMotion'
import { watchVisibility } from './spring'

/**
 * Folhas balançando com vento leve: cada folha gira em volta da base com fase própria,
 * e uma rajada lenta (soma de senos) muda a força do vento aos poucos. Sem tranco, sem quique.
 */
export function useWind(
  plantRef: RefObject<Element | null>,
  leavesRef: RefObject<(SVGGElement | null)[]>,
  amplitude = 6,
): void {
  useEffect(() => {
    const plant = plantRef.current
    const leaves = (leavesRef.current ?? []).filter((l): l is SVGGElement => l !== null)
    if (!plant || leaves.length === 0 || prefersReducedMotion()) return

    gsap.set(leaves, { transformOrigin: '0% 50%' })
    const setters = leaves.map((l) => gsap.quickSetter(l, 'rotation', 'deg'))
    const phases = leaves.map((_, i) => i * 1.7)

    const tick = (time: number) => {
      const gust = 0.6 + 0.4 * Math.sin(time * 0.23) * Math.sin(time * 0.61 + 1.3)
      setters.forEach((set, i) => {
        const sway = Math.sin(time * 1.1 + phases[i]) * 0.7 + Math.sin(time * 2.3 + phases[i] * 0.5) * 0.3
        set(sway * amplitude * gust)
      })
    }

    let running = false
    const trigger = watchVisibility(plant, (visible) => {
      if (visible && !running) gsap.ticker.add(tick)
      if (!visible && running) gsap.ticker.remove(tick)
      running = visible
    })

    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
    }
  }, [plantRef, leavesRef, amplitude])
}
